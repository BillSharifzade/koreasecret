/* GitHub as the back end of a static site: the content file and uploads are committed straight to the repository
   (one atomic commit through the Git Data API), and the Pages workflow that the push triggers is followed live. */

export interface GhUser { login: string; name?: string | null; avatar_url: string; html_url: string }
export interface GhRepo { full_name: string; private: boolean; default_branch: string; html_url: string; permissions?: { push?: boolean; admin?: boolean } }
export interface GhCommitInfo { sha: string; message: string; date: string; author: string; avatar?: string; url: string }
export interface GhRun { id: number; status: 'queued' | 'in_progress' | 'completed' | 'waiting' | 'requested' | 'pending'; conclusion: string | null; html_url: string; name: string; created_at: string; updated_at: string; run_started_at?: string }
export interface GhStep { name: string; status: string; conclusion: string | null; number: number; started_at?: string | null; completed_at?: string | null }
export interface GhJob { id: number; name: string; status: string; conclusion: string | null; steps?: GhStep[]; started_at?: string; completed_at?: string | null; html_url: string }
export interface FileChange { path: string; content: string | Blob | null }

export class GitHubError extends Error {
  constructor(message: string, public status: number, public detail?: string) { super(message); }
}

const utf8ToBase64 = (s: string) => {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
};
const base64ToUtf8 = (b64: string) => {
  const bin = atob(b64.replace(/\s/g, ''));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
};
const blobToBase64 = (b: Blob) => new Promise<string>((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(String(r.result).split(',')[1] || '');
  r.onerror = () => reject(r.error);
  r.readAsDataURL(b);
});

export class GitHub {
  constructor(private token: string, public repo: string, public branch: string, private api = 'https://api.github.com') {}

  private async req<T>(method: string, path: string, body?: unknown, accept = 'application/vnd.github+json'): Promise<T> {
    let res: Response;
    try {
      res = await fetch(`${this.api}${path}`, {
        method,
        headers: { Accept: accept, Authorization: `Bearer ${this.token}`, 'X-GitHub-Api-Version': '2022-11-28', ...(body ? { 'Content-Type': 'application/json' } : null) },
        body: body ? JSON.stringify(body) : undefined,
        cache: 'no-store'
      });
    } catch {
      throw new GitHubError('Нет связи с GitHub — проверьте интернет', 0);
    }
    if (!res.ok) {
      let detail = '';
      try { detail = ((await res.json()) as { message?: string }).message || ''; } catch { /* not json */ }
      const msg = res.status === 401 ? 'Токен не подходит или истёк'
        : res.status === 403 ? (/rate limit/i.test(detail) ? 'Превышен лимит запросов к GitHub — попробуйте через минуту' : 'Токену не хватает прав (нужны Contents: write и Actions: read)')
        : res.status === 404 ? 'Не найдено — проверьте репозиторий, ветку и права токена'
        : res.status === 409 || res.status === 422 ? 'Ветка изменилась во время публикации'
        : `GitHub ответил ${res.status}`;
      throw new GitHubError(msg, res.status, detail);
    }
    if (res.status === 204) return undefined as T;
    const type = res.headers.get('content-type') || '';
    return (type.includes('json') ? await res.json() : await res.text()) as T;
  }

  user() { return this.req<GhUser>('GET', '/user'); }
  repoInfo() { return this.req<GhRepo>('GET', `/repos/${this.repo}`); }

  /** head commit of the branch and its tree */
  async head() {
    const ref = await this.req<{ object: { sha: string } }>('GET', `/repos/${this.repo}/git/ref/heads/${encodeURIComponent(this.branch)}`);
    const commit = await this.req<{ sha: string; tree: { sha: string } }>('GET', `/repos/${this.repo}/git/commits/${ref.object.sha}`);
    return { commit: commit.sha, tree: commit.tree.sha };
  }

  /** a text file at a ref, with its blob sha (null when it does not exist) */
  async file(path: string, ref: string): Promise<{ text: string; sha: string } | null> {
    try {
      const meta = await this.req<{ sha: string; content?: string; encoding?: string }>('GET', `/repos/${this.repo}/contents/${path}?ref=${encodeURIComponent(ref)}`);
      if (meta.content && meta.encoding === 'base64') return { text: base64ToUtf8(meta.content), sha: meta.sha };
      // larger than 1 MB: the JSON form carries no content
      const text = await this.req<string>('GET', `/repos/${this.repo}/contents/${path}?ref=${encodeURIComponent(ref)}`, undefined, 'application/vnd.github.raw+json');
      return { text: typeof text === 'string' ? text : JSON.stringify(text), sha: meta.sha };
    } catch (e) {
      if (e instanceof GitHubError && e.status === 404) return null;
      throw e;
    }
  }

  /** blob sha of a path at a ref (null when missing) — cheap conflict check */
  async fileSha(path: string, ref: string) {
    try { return (await this.req<{ sha: string }>('GET', `/repos/${this.repo}/contents/${path}?ref=${encodeURIComponent(ref)}`)).sha; }
    catch (e) { if (e instanceof GitHubError && e.status === 404) return null; throw e; }
  }

  /** One commit with every change (null content deletes a file); the branch moves only if nobody pushed meanwhile. */
  async commit(changes: FileChange[], message: string, parent: { commit: string; tree: string }, onProgress?: (done: number, total: number) => void) {
    const tree: { path: string; mode: '100644'; type: 'blob'; sha: string | null }[] = [];
    const shas: Record<string, string> = {};
    let done = 0;
    for (const ch of changes) {
      if (ch.content === null) { tree.push({ path: ch.path, mode: '100644', type: 'blob', sha: null }); continue; }
      const blob = typeof ch.content === 'string'
        ? await this.req<{ sha: string }>('POST', `/repos/${this.repo}/git/blobs`, { content: utf8ToBase64(ch.content), encoding: 'base64' })
        : await this.req<{ sha: string }>('POST', `/repos/${this.repo}/git/blobs`, { content: await blobToBase64(ch.content), encoding: 'base64' });
      shas[ch.path] = blob.sha;
      tree.push({ path: ch.path, mode: '100644', type: 'blob', sha: blob.sha });
      onProgress?.(++done, changes.length);
    }
    const t = await this.req<{ sha: string }>('POST', `/repos/${this.repo}/git/trees`, { base_tree: parent.tree, tree });
    const c = await this.req<{ sha: string; html_url: string }>('POST', `/repos/${this.repo}/git/commits`, { message, tree: t.sha, parents: [parent.commit] });
    await this.req('PATCH', `/repos/${this.repo}/git/refs/heads/${encodeURIComponent(this.branch)}`, { sha: c.sha, force: false });
    return { sha: c.sha, url: c.html_url, blobs: shas };
  }

  async history(path: string, perPage = 30): Promise<GhCommitInfo[]> {
    type C = { sha: string; html_url: string; commit: { message: string; author: { name: string; date: string } }; author?: { login: string; avatar_url: string } | null };
    const list = await this.req<C[]>('GET', `/repos/${this.repo}/commits?path=${encodeURIComponent(path)}&sha=${encodeURIComponent(this.branch)}&per_page=${perPage}`);
    return list.map((c) => ({ sha: c.sha, message: c.commit.message, date: c.commit.author.date, author: c.author?.login || c.commit.author.name, avatar: c.author?.avatar_url, url: c.html_url }));
  }

  /** files under a folder at the branch head (media library) */
  async listDir(path: string): Promise<{ path: string; size: number; sha: string }[]> {
    try {
      const head = await this.head();
      const t = await this.req<{ tree: { path: string; type: string; size?: number; sha: string }[]; truncated: boolean }>('GET', `/repos/${this.repo}/git/trees/${head.tree}?recursive=1`);
      return t.tree.filter((x) => x.type === 'blob' && x.path.startsWith(path)).map((x) => ({ path: x.path, size: x.size || 0, sha: x.sha }));
    } catch (e) { if (e instanceof GitHubError && e.status === 404) return []; throw e; }
  }

  async runsFor(sha: string) {
    return (await this.req<{ workflow_runs: GhRun[] }>('GET', `/repos/${this.repo}/actions/runs?head_sha=${sha}&per_page=10`)).workflow_runs;
  }
  async jobs(runId: number) {
    return (await this.req<{ jobs: GhJob[] }>('GET', `/repos/${this.repo}/actions/runs/${runId}/jobs`)).jobs;
  }
  async latestRuns(n = 5) {
    return (await this.req<{ workflow_runs: (GhRun & { head_sha: string; head_commit?: { message: string } })[] }>('GET', `/repos/${this.repo}/actions/runs?branch=${encodeURIComponent(this.branch)}&per_page=${n}`)).workflow_runs;
  }
}

/** owner/repo of the site: from the build (workflow env), else guessed from a github.io address. */
export function defaultRepo(): string {
  const env = process.env.NEXT_PUBLIC_GITHUB_REPO;
  if (env) return env;
  if (typeof window !== 'undefined' && /\.github\.io$/i.test(window.location.hostname)) {
    const owner = window.location.hostname.split('.')[0];
    const repo = window.location.pathname.split('/').filter(Boolean)[0];
    if (repo && repo !== 'admin') return `${owner}/${repo}`;
    return `${owner}/${owner}.github.io`;
  }
  return 'BillSharifzade/koreasecret';
}
export const defaultBranch = () => process.env.NEXT_PUBLIC_GITHUB_BRANCH || 'main';
export const CONTENT_PATH = 'content/site.json';
export const pagesUrl = (repo: string) => {
  const [owner, name] = repo.split('/');
  return name?.toLowerCase() === `${owner.toLowerCase()}.github.io` ? `https://${owner.toLowerCase()}.github.io/` : `https://${owner.toLowerCase()}.github.io/${name}/`;
};
