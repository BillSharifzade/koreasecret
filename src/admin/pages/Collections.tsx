'use client';
import { Art } from '@/components/Art';
import { I } from '../ui/icons';
import GlassSurface, { GLASS } from '@/components/ui/GlassSurface';
import { linkQuery, queryResults } from '@/lib/catalog';
import { count } from '@/lib/format';
import type { Collection } from '@/lib/types';
import { uid } from '../state/schema';
import { CollectionEditor } from '../ui/collection';
import { ThemePicker, THEME_NAMES } from '../ui/fields';
import { Badge, Card, Field, Input, Note } from '../ui/kit';
import { ImageField, LinkField, ProductsField } from '../ui/pickers';
import { Scaled } from '../ui/preview';
import '../styles/content.css';

const items = (n: number) => count(n, 'товар', 'товара', 'товаров');
const found = (c: Collection) => { const q = linkQuery(c.href); return q ? queryResults(q).length : null; };

/** The storefront collection card (sections.tsx → Collections) at its real 1000px width. */
function CollectionPreview({ c }: { c: Collection }) {
  const n = found(c);
  return (
    <Scaled width={1000} label="Карточка на сайте">
      <div className="collection-card">
        <Art className="collection-card__art" as="div" spec={{ kind: 'collection', id: c.id }} />
        <h3 className="collection-card__title">{c.title}</h3>
        <GlassSurface {...GLASS} as="span" className="collection-card__count" width="auto" height={50} tone="light">{n !== null ? items(n) : 'Смотреть'}<I name="arrow-right" /></GlassSurface>
      </div>
    </Scaled>
  );
}

function newCollection(): Collection {
  return { id: uid('c-'), title: 'Новая подборка', theme: 'rose', art: [], href: '/catalog?offer=hit' };
}

export function Collections() {
  return (
    <CollectionEditor<Collection>
      area="Подборки"
      list={(d) => d.collections}
      title={<>Тематические <em>подборки</em></>}
      sub="Большие карточки в блоке «Подборки»: ведут в каталог с готовыми фильтрами. Счётчик товаров на карточке считается сам по ссылке."
      noun={{ one: 'подборку', add: 'Новая подборка', gen: 'подборки' }}
      label={(c) => c.title}
      caption={(c) => `${THEME_NAMES[c.theme]} · ${c.href || 'без ссылки'}`}
      media={(c) => <Art spec={{ kind: 'collection', id: c.id }} />}
      create={newCollection}
      wide
      extra={(c) => { const n = found(c); return n === null ? null : <Badge tone={n ? undefined : 'red'}>{items(n)}</Badge>; }}
      editor={(c, ed) => {
        const n = found(c);
        return (
          <div className="a-stack a-stack--lg">
            <CollectionPreview c={c} />
            <Card title="Название и ссылка">
              <div className="a-form">
                <Field label="Название" aside={<small>{c.title.length} симв.</small>}><Input size="title" value={c.title} onValue={(v) => ed.set('title', v)} /></Field>
                <Field label="Куда ведёт" hint="Соберите ссылку на каталог с фильтрами — кнопкой «Собрать»"><LinkField value={c.href} onChange={(v) => ed.set('href', v)} /></Field>
                {n === 0 && <Note kind="warn">По этой ссылке сейчас не находится ни одного товара — покупатель попадёт в пустой каталог.</Note>}
              </div>
            </Card>
            <Card title="Оформление">
              <div className="a-form">
                <Field label="Цветовая тема"><ThemePicker value={c.theme} onChange={(v) => ed.set('theme', v)} /></Field>
                {!c.image && <Field label="Товары на карточке" hint="До трёх, на подиумах: второй — в центре и крупнее"><ProductsField value={c.art} onChange={(v) => ed.set('art', v)} max={3} /></Field>}
                <Field label="Своя картинка вместо рисунка" hint="Заполнит карточку целиком (1000×560); текст лежит слева сверху — оставьте там спокойный фон.">
                  <ImageField value={c.image} onChange={(v) => ed.set('image', v)} folder="collections" opts={{ max: 2000 }} aspect="1000 / 560" />
                </Field>
              </div>
            </Card>
          </div>
        );
      }}
    />
  );
}
