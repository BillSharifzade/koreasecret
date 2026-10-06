'use client';
import { BloggerPanel } from '@/components/home/sections';
import { asset } from '@/lib/asset';
import { count } from '@/lib/format';
import { getProduct } from '@/lib/shop';
import type { Blogger } from '@/lib/types';
import { uid } from '../state/schema';
import { useAdmin } from '../state/store';
import { CollectionEditor } from '../ui/collection';
import { Badge, Card, ColorInput, Field, Input, Note, PASTELS, TextArea } from '../ui/kit';
import { ImageField, ProductsField } from '../ui/pickers';
import { Scaled } from '../ui/preview';
import '../styles/content.css';

const items = (n: number) => count(n, 'товар', 'товара', 'товаров');

function Avatar({ b }: { b: Blogger }) {
  return b.avatar
    // eslint-disable-next-line @next/next/no-img-element
    ? <img src={asset(b.avatar)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    : (
      <svg viewBox="0 0 150 150" aria-hidden="true" style={{ background: b.tint }}>
        <circle cx="75" cy="58" r="27" fill="#fff" />
        <path d="M75 94c-26 0-47 12-56 32a75 75 0 0 0 112 0c-9-20-30-32-56-32Z" fill="#fff" />
      </svg>
    );
}

function newBlogger(): Blogger {
  return { id: uid('b-'), name: 'Имя', nameGen: 'Имени', about: 'о чём пишет: уход, макияж, SPF…', tint: '#fde3ee', products: [] };
}

export function Bloggers() {
  const base = useAdmin((s) => s.draft.bloggers.length);
  return (
    <CollectionEditor<Blogger>
      area="Блогеры"
      list={(d) => d.bloggers}
      title={<>Выбор <em>блогеров</em></>}
      sub="Большие панели «Фавориты в уходе …» на главной: профиль блогера слева и его подборка товаров справа. Ссылка «N товаров в подборке» открывает эту подборку в каталоге."
      noun={{ one: 'блогера', add: 'Новый блогер', gen: 'блогера' }}
      label={(b) => b.name}
      caption={(b) => `${b.about} · ${items(b.products.filter((id) => getProduct(id)).length)}`}
      media={(b) => <Avatar b={b} />}
      squareMedia
      create={newBlogger}
      wide
      extra={(b) => (!b.products.length ? <Badge tone="amber">нет товаров</Badge> : null)}
      before={base === 0 ? <Note>Блок «Выбор блогеров» на главной скрывается, пока здесь нет ни одного видимого блогера.</Note> : undefined}
      editor={(b, ed) => (
        <div className="a-stack a-stack--lg">
          <Scaled width={1240} label="Панель на главной">
            <BloggerPanel b={b} />
          </Scaled>
          <Card title="Профиль">
            <div className="a-form">
              <div className="a-form-row a-form-row--2">
                <Field label="Имя"><Input size="title" value={b.name} onValue={(v) => ed.set('name', v)} /></Field>
                <Field label="Имя в родительном падеже" hint={<>Для заголовка «Фавориты в уходе <i>{b.nameGen || '…'}</i>»</>}><Input size="title" value={b.nameGen} onValue={(v) => ed.set('nameGen', v)} /></Field>
              </div>
              <Field label="О чём пишет" aside={<small>{b.about.length} симв.</small>} hint="Одна строка под именем"><TextArea value={b.about} onValue={(v) => ed.set('about', v)} rows={2} /></Field>
              <div className="a-form-row a-form-row--2">
                <Field label="Фото" hint="Квадратное, лицо по центру — на сайте обрезается в круг">
                  <ImageField value={b.avatar} onChange={(v) => ed.set('avatar', v)} folder="bloggers" opts={{ max: 600 }} aspect="1 / 1" />
                </Field>
                <Field label="Цвет фона панели" hint="Пастельный — фон смешивается с белым"><ColorInput value={b.tint} onChange={(v) => ed.set('tint', v)} palette={PASTELS} /></Field>
              </div>
            </div>
          </Card>
          <Card title="Подборка" sub="Порядок — как на сайте; в слайдере видно по три товара">
            <ProductsField value={b.products} onChange={(v) => ed.set('products', v)} />
          </Card>
        </div>
      )}
    />
  );
}
