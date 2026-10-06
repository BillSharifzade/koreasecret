'use client';
import { useMemo, useState } from 'react';
import { Stars } from '@/components/ui/bits';
import { uniqueId } from '../state/schema';
import { edit, undo, useAdmin } from '../state/store';
import { I } from '../ui/icons';
import { Badge, Btn, Card, Chips, cx, Empty, IconBtn, Input, Note, PageHead, Seg, TextArea } from '../ui/kit';
import { confirmDialog, toast } from '../ui/overlay';
import '../styles/taxonomy.css';

function StarInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <span className="tax-stars" role="radiogroup" aria-label="Оценка" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" role="radio" aria-checked={n === value} aria-label={`${n} из 5`} className={cx(n <= shown && 'is-on')} onMouseEnter={() => setHover(n)} onClick={() => onChange(n)}>
          <I name="star" />
        </button>
      ))}
    </span>
  );
}

export function Reviews() {
  const draft = useAdmin((s) => s.draft);
  const pool = draft.reviews.pool;
  const pros = draft.reviews.pros;
  const [q, setQ] = useState('');
  const [rating, setRating] = useState<'all' | '5' | '4' | 'low'>('all');
  const [newPro, setNewPro] = useState('');

  const rows = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return pool.map((r, i) => ({ r, i })).filter(({ r }) => (rating === 'all' || (rating === 'low' ? r.rating <= 3 : r.rating === Number(rating))) && (!ql || `${r.name} ${r.text}`.toLowerCase().includes(ql)));
  }, [pool, q, rating]);
  const avg = pool.length ? pool.reduce((s, r) => s + r.rating, 0) / pool.length : 0;
  const dist = [5, 4, 3, 2, 1].map((n) => pool.filter((r) => r.rating === n).length);
  const proUse = (k: string) => pool.filter((r) => r.pros.includes(k)).length;

  const upd = (i: number, fn: (r: (typeof pool)[number]) => void, label: string, key?: string) => edit((d) => { const r = d.reviews.pool[i]; if (r) fn(r); }, { label, key });
  const add = () => {
    edit((d) => { d.reviews.pool.unshift({ name: 'Покупатель', rating: 5, text: '', pros: [] }); }, { label: 'Новый отзыв' });
    setQ(''); setRating('all');
    toast({ title: 'Отзыв добавлен в начало списка', icon: 'star-o' });
  };
  const remove = async (i: number) => {
    const r = pool[i];
    if (!(await confirmDialog({ title: 'Удалить отзыв?', text: `«${r.text.slice(0, 90) || r.name}${r.text.length > 90 ? '…' : ''}»`, confirm: 'Удалить', danger: true }))) return;
    edit((d) => { d.reviews.pool.splice(i, 1); }, { label: `Удалён отзыв: ${r.name}` });
    toast({ title: 'Отзыв удалён', icon: 'trash', action: { label: 'Вернуть', fn: () => undo() } });
  };
  const addPro = () => {
    const l = newPro.trim();
    if (!l) return;
    const k = uniqueId(l, (x) => x in pros);
    edit((d) => { d.reviews.pros[k] = l; }, { label: `Плюс: ${l}` });
    setNewPro('');
  };
  const removePro = async (k: string) => {
    const n = proUse(k);
    if (n && !(await confirmDialog({ title: `Удалить «${pros[k]}»?`, text: `Плюс отмечен в ${n} отзывах — там он исчезнет.`, confirm: 'Удалить', danger: true }))) return;
    edit((d) => { d.reviews.pool.forEach((r) => { r.pros = r.pros.filter((x) => x !== k); }); delete d.reviews.pros[k]; }, { label: `Удалён плюс: ${pros[k]}` });
  };
  const sample = rows[0]?.r;

  return (
    <div className="adm-page">
      <PageHead title={<>Отзывы <em>покупателей</em></>} sub="Пул отзывов, из которого собираются отзывы на страницах товаров и в блоке «Ваши отзывы» на главной."
        actions={<Btn variant="primary" icon="plus" onClick={add}>Новый отзыв</Btn>} />
      <Note icon="info">Пока сайт не собирает настоящие отзывы, каждая страница товара показывает до 6 отзывов из этого пула — набор подбирается по товару и не меняется от визита к визиту (у товаров с рейтингом от 4.7 — только оценки 4–5). Рейтинг и число отзывов товара задаются в его карточке. Новый отзыв с сайта уходит на модерацию и здесь пока не появляется.</Note>
      <div className="adm-grid adm-grid--main">
        <Card flush>
          <div className="a-toolbar">
            <div className="a-affix a-affix--prefix a-search-input"><span className="a-affix__prefix"><I name="search" className="i--sm" /></span><input className="a-input" placeholder="Имя или текст отзыва" value={q} onChange={(e) => setQ(e.target.value)} /></div>
            <span className="adm-grow" />
            <Seg size="sm" value={rating} onChange={setRating} options={[{ value: 'all', label: 'Все', count: pool.length }, { value: '5', label: '5★', count: dist[0] }, { value: '4', label: '4★', count: dist[1] }, { value: 'low', label: '≤3★', count: dist[2] + dist[3] + dist[4] }]} />
          </div>
          {rows.length ? (
            <div className="tax-reviews">
              {rows.map(({ r, i }) => (
                <div key={i} className="tax-review">
                  <div className="adm-row">
                    <StarInput value={r.rating} onChange={(n) => upd(i, (x) => { x.rating = n; }, 'Отзыв: оценка')} />
                    <div className="adm-grow"><Input size="sm" value={r.name} placeholder="Имя покупателя" onValue={(v) => upd(i, (x) => { x.name = v; }, 'Отзыв: имя', `rev:${i}:name`)} /></div>
                    <IconBtn icon="trash" label="Удалить отзыв" danger onClick={() => remove(i)} />
                  </div>
                  <TextArea value={r.text} rows={2} autoGrow placeholder="Текст отзыва" onValue={(v) => upd(i, (x) => { x.text = v; }, 'Отзыв: текст', `rev:${i}:text`)} />
                  <Chips size="sm" value={r.pros} onChange={(v) => upd(i, (x) => { x.pros = v; }, 'Отзыв: плюсы')} options={Object.entries(pros)} />
                  {!r.text.trim() && <div className="a-field__error">Пустой отзыв не покажется на сайте красиво — добавьте текст</div>}
                </div>
              ))}
            </div>
          ) : <Empty title="Ничего не нашлось" text="Измените поиск или фильтр оценки" icon="star-o" />}
        </Card>
        <div className="adm-stack adm-sticky">
          <Card title="Сводка">
            <div className="adm-row" style={{ gap: 16, alignItems: 'center' }}>
              <div className="tax-avg">{avg.toFixed(1)}<small>/5</small></div>
              <div className="a-bars adm-grow">
                {dist.map((n, k) => (
                  <div key={k} className="a-bar" style={{ gridTemplateColumns: '18px minmax(0,1fr) 22px', gap: 8 }}>
                    <span className="a-bar__label">{5 - k}</span>
                    <span className="a-bar__track" style={{ gridColumn: 'auto' }}><span className="a-bar__fill" style={{ display: 'block', width: `${pool.length ? (n / pool.length) * 100 : 0}%` }} /></span>
                    <span className="a-bar__value">{n}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
          {sample && (
            <div className="a-preview tax-review-preview">
              <span className="a-preview__label"><I name="eye" />Как на сайте</span>
              <div className="review">
                <div className="review__head"><div className="review__name">{sample.name || 'Покупатель'}<span className="review__date">28 сентября</span></div><Stars rating={sample.rating} /></div>
                <p className="review__text">{sample.text || '…'}</p>
                {sample.pros.length > 0 && <div className="review__pros">{sample.pros.map((k) => <span key={k}>{pros[k] || k}</span>)}</div>}
              </div>
            </div>
          )}
          <Card title="Плюсы в отзывах" sub="Метки под текстом отзыва: «Текстура», «Увлажнение»…">
            <div className="adm-stack adm-stack--sm">
              {Object.keys(pros).map((k) => (
                <div key={k} className="tax-dict-row">
                  <div className="adm-grow"><Input size="sm" value={pros[k]} onValue={(v) => edit((d) => { d.reviews.pros[k] = v; }, { label: 'Плюс: название', key: `pro:${k}` })} /></div>
                  <Badge>{proUse(k)}</Badge>
                  <IconBtn icon="trash" size="sm" label="Удалить" danger onClick={() => removePro(k)} />
                </div>
              ))}
              <form className="adm-row" style={{ gap: 6 }} onSubmit={(e) => { e.preventDefault(); addPro(); }}>
                <div className="adm-grow"><Input size="sm" value={newPro} onValue={setNewPro} placeholder="Например, Аромат" /></div>
                <Btn size="sm" icon="plus" type="submit" disabled={!newPro.trim()}>Добавить</Btn>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
