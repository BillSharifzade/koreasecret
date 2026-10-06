'use client';
import { useState } from 'react';
import { Art } from '@/components/Art';
import { count } from '@/lib/format';
import { mdText } from '@/lib/md';
import { BASE_PATH } from '@/lib/site';
import type { Article, ArticleTheme } from '@/lib/types';
import { uid } from '../state/schema';
import { CollectionEditor } from '../ui/collection';
import { MarkdownField } from '../ui/fields';
import { Badge, Btn, Card, Field, Input, Note, NumInput, Seg } from '../ui/kit';
import { ImageField, ProductsField, QueryBuilder } from '../ui/pickers';
import { Scaled } from '../ui/preview';
import '../styles/content.css';

const THEMES: { value: ArticleTheme; label: string; hint: string }[] = [
  { value: 'routine', label: 'Рутина', hint: 'розовая сцена с тремя подиумами' },
  { value: 'pdrn', label: 'PDRN', hint: 'спираль ДНК и один флакон' },
  { value: 'spf', label: 'SPF', hint: 'солнце, тени листьев, два товара' },
  { value: 'oil', label: 'Масла', hint: 'капли масла и два товара' },
  { value: 'store', label: 'Магазин', hint: 'полки шоурума и бабочка, без товаров' }
];
const ART_MAX: Record<ArticleTheme, number> = { routine: 3, pdrn: 1, spf: 2, oil: 2, store: 0 };
const minutes = (n: number) => count(n, 'минута', 'минуты', 'минут');
const readMins = (body: string) => Math.max(1, Math.round((body.trim() ? body.trim().split(/\s+/).length : 0) / 180));

/** The first article becomes the big «journal hero» on the home page; the rest are cards. */
function ArticlePreview({ a }: { a: Article }) {
  return (
    <div className="c-journal-preview">
      <Scaled width={1340} label="Большая обложка (первая статья)">
        <div className="journal-hero" data-surface="dark">
          <Art className="journal-hero__art" as="div" spec={{ kind: 'journal', id: a.id }} />
          <div className="journal-hero__content"><div className="journal-hero__tag">{a.tag}</div><h3 className="journal-hero__title">{a.title}</h3></div>
          <div className="journal-hero__hline" /><div className="journal-hero__vline" />
          <div className="journal-hero__btn"><span className="btn btn--white">Читать<span className="muted">~ {minutes(a.mins)}</span></span></div>
        </div>
      </Scaled>
      <div className="article-card">
        <Art className="article-card__art" as="div" spec={{ kind: 'journal', id: a.id, w: 600, h: 545 }} />
        <div className="article-card__tag">{a.tag}</div>
        <h3 className="article-card__title">{a.title}</h3>
      </div>
    </div>
  );
}

function newArticle(): Article {
  return { id: uid('a-'), theme: 'routine', mins: 3, tag: '#гид по уходу', title: 'Новая статья', body: 'Первый абзац статьи.\n\nВторой абзац.', art: [], query: 'offer=hit', products: [] };
}

function RelatedProducts({ a, set }: { a: Article; set: <K extends keyof Article & string>(k: K, v: Article[K], label?: string) => void }) {
  const [mode, setMode] = useState<'query' | 'manual'>(a.products.length ? 'manual' : 'query');
  return (
    <div className="a-stack">
      <Seg value={mode} onChange={(m) => { setMode(m); if (m === 'query' && a.products.length) set('products', [], 'Статья: товары по подбору'); }} options={[{ value: 'query', label: 'По подбору', icon: 'wand' }, { value: 'manual', label: 'Вручную', icon: 'box' }]} />
      {mode === 'query'
        ? <QueryBuilder value={a.query} onChange={(q) => set('query', q, 'Статья: подбор товаров')} withSort={false} />
        : (
          <>
            <ProductsField value={a.products} onChange={(v) => set('products', v, 'Статья: товары')} max={4} />
            {!a.products.length && <Note>Пока список пуст, под статьёй показываются товары по подбору ({a.query || 'без фильтров'}).</Note>}
          </>
        )}
      <div className="a-field__hint">Под статьёй показываются первые четыре товара.</div>
    </div>
  );
}

export function Journal() {
  return (
    <CollectionEditor<Article>
      area="Журнал"
      list={(d) => d.articles}
      title={<>Журнал <em>Korea Secret</em></>}
      sub="Статьи блока «Журнал» на главной: первая в списке — большая обложка, остальные — карточки. Статья открывается в окне с товарами из неё."
      noun={{ one: 'статью', add: 'Новая статья', gen: 'статьи' }}
      label={(a) => a.title}
      caption={(a) => `${a.tag} · ${minutes(a.mins)} · ${THEMES.find((t) => t.value === a.theme)?.label}`}
      media={(a) => <Art spec={{ kind: 'journal', id: a.id, w: 600, h: 400 }} />}
      create={newArticle}
      wide
      extra={(a) => (!mdText(a.body) ? <Badge tone="amber">пустой текст</Badge> : null)}
      editor={(a, ed) => {
        const auto = readMins(a.body);
        return (
          <div className="a-stack a-stack--lg">
            <ArticlePreview a={a} />
            <Card title="Заголовок">
              <div className="a-form">
                <Field label="Заголовок" aside={<small>{a.title.length} симв.</small>}><Input size="title" value={a.title} onValue={(v) => ed.set('title', v)} /></Field>
                <div className="a-form-row a-form-row--2">
                  <Field label="Рубрика" hint="Например: #гид по уходу, #разбор мифов"><Input value={a.tag} onValue={(v) => ed.set('tag', v)} /></Field>
                  <Field label="Время чтения" hint={auto !== a.mins ? `По тексту выходит ~${minutes(auto)}` : 'Совпадает с объёмом текста'} aside={auto !== a.mins ? <button type="button" className="a-link" style={{ fontSize: 12 }} onClick={() => ed.set('mins', auto, 'Статья: время чтения')}>посчитать по тексту</button> : undefined}>
                    <NumInput value={a.mins} onValue={(v) => ed.set('mins', Math.max(1, Math.round(v ?? 1)))} min={1} max={60} suffix="мин" />
                  </Field>
                </div>
              </div>
            </Card>
            <Card title="Текст статьи">
              <MarkdownField value={a.body} onChange={(v) => ed.set('body', v)} rows={14} />
            </Card>
            <Card title="Обложка">
              <div className="a-form">
                <Field label="Сцена">
                  <div className="a-art-presets">
                    {THEMES.map((t) => (
                      <button key={t.value} type="button" className={`a-art-preset${a.theme === t.value ? ' is-active' : ''}`} onClick={() => ed.set('theme', t.value, 'Статья: сцена')}><b>{t.label}</b><span>{t.hint}</span></button>
                    ))}
                  </div>
                </Field>
                {!a.image && ART_MAX[a.theme] > 0 && (
                  <Field label="Товары на обложке" hint={`Для этой сцены — до ${ART_MAX[a.theme]}`}>
                    <ProductsField value={a.art} onChange={(v) => ed.set('art', v)} max={ART_MAX[a.theme]} />
                  </Field>
                )}
                {a.art.length > ART_MAX[a.theme] && !a.image && <Note kind="warn">Сцена рисует только {ART_MAX[a.theme]} товар(а) — лишние не покажутся.</Note>}
                <Field label="Своя картинка вместо сцены" hint="Широкая (примерно 1340×470); текст обложки лежит слева сверху.">
                  <ImageField value={a.image} onChange={(v) => ed.set('image', v)} folder="journal" opts={{ max: 2400 }} aspect="1340 / 470" />
                </Field>
              </div>
            </Card>
            <Card title="Товары из статьи">
              <RelatedProducts a={a} set={ed.set} />
            </Card>
            <Btn variant="ghost" icon="eye" onClick={() => window.open(`${BASE_PATH}/?preview=1#journal`, '_blank')}>Посмотреть журнал на сайте с черновиком</Btn>
          </div>
        );
      }}
    />
  );
}
