import type { NextConfig } from 'next';

/** Static export: the same `out/` folder is served by Docker (Bun) and GitHub Pages.
 *  Set NEXT_PUBLIC_BASE_PATH=/repo-name for project pages (e.g. /koreasecret). */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: basePath || undefined,
  trailingSlash: true,
  reactStrictMode: true,
  images: { unoptimized: true },
  experimental: { globalNotFound: true }
};

export default nextConfig;
