'use client';
import { Art } from '@/components/Art';
import { getProduct, price } from '@/lib/shop';
import type { Story } from '@/lib/types';
import { uid } from '../state/schema';
import { useAdmin } from '../state/store';
import { CollectionEditor } from '../ui/collection';
import { I } from '../ui/icons';
import { Btn, Card, ColorInput, Field, IconBtn, Input, Note, PASTELS, BRIGHTS } from '../ui/kit';
import { ProductsField } from '../ui/pickers';
import { moveItem, SortableList } from '../ui/Sortable';
import '../styles/content.css';

/** The full-screen viewer's frames, phone-shaped, with captions as on the site. */
function StoryFrames({ s }: { s: Story }) {
  const index = useAdmin((st) => st.draft.stories.findIndex((x) => x.id === s.id));
  const p = getProduct(s.products[0]);
  return (
    <div className="a-stack a-stack--sm">
      <div className="c-story-frames">
        {s.frames.map((text, f) => (
          <div key={f} className="c-story-frame">
            <Art as="div" spec={{ kind: 'story', index, frame: f }} />
            <div className="c-story-frame__bars">{s.frames.map((_, k) => <i key={k} className={k <= f ? 'is-on' : ''} />)}</div>
            <div className="c-story-frame__text">{text}</div>
            <div className="c-story-frame__num">Кадр {f + 1} · ~5 сек</div>
          </div>
        ))}
      </div>
      <div className="a-field__hint">{p ? <>Под каждым кадром — кнопка «Смотреть товар · {price(p.price)}» на {p.name}.</> : 'Добавьте товар — без него кнопки «Смотреть товар» не будет.'}</div>
    </div>
  );
}

function newStory(): Story {
  return { id: uid('s-'), palette: ['#fbd3e3', '#b43f72'], products: [], title: 'Новая история', dur: '0:30', frames: ['Шаг 1. …', 'Шаг 2. …', 'Результат — …'] };
}

export function Stories() {
  return (
    <CollectionEditor<Story>
      area="Истории"
      list={(d) => d.stories}
      title={<>Короткие <em>видео</em></>}
      sub="Карточки-истории на главной: по клику открывается полноэкранный просмотр с кадрами и кнопкой на товар. Кадры рисуются из палитры и товара."
      noun={{ one: 'историю', add: 'Новая история', gen: 'истории' }}
      label={(s) => s.title}
      caption={(s) => `${s.dur} · ${s.frames.length} кадр.${s.products[0] ? ` · ${getProduct(s.products[0])?.name ?? 'товар не найден'}` : ' · без товара'}`}
      media={(s) => <StoryThumb s={s} />}
      create={newStory}
      wide
      editor={(s, ed) => (
        <div className="a-stack a-stack--lg">
          <StoryFrames s={s} />
          <Card title="Карточка на главной">
            <div className="a-form">
              <Field label="Подпись на карточке" aside={<small>{s.title.length} симв.</small>}><Input value={s.title} onValue={(v) => ed.set('title', v)} /></Field>
              <Field label="Длительность" hint="Показывается на плашке «▶ 0:34»"><Input value={s.dur} onValue={(v) => ed.set('dur', v)} placeholder="0:30" /></Field>
            </div>
          </Card>
          <Card title="Палитра кадров" sub="Градиент фона: от светлого цвета вверху к насыщенному внизу">
            <div className="a-form-row a-form-row--2">
              <Field label="Светлый"><ColorInput value={s.palette[0]} onChange={(v) => ed.update((x) => { x.palette[0] = v; }, 'История: палитра', `st:${s.id}:p0`)} palette={PASTELS} /></Field>
              <Field label="Насыщенный"><ColorInput value={s.palette[1]} onChange={(v) => ed.update((x) => { x.palette[1] = v; }, 'История: палитра', `st:${s.id}:p1`)} palette={BRIGHTS.slice(0, 8)} /></Field>
            </div>
          </Card>
          <Card title="Товар">
            <Field hint="Первый товар рисуется на кадрах и становится кнопкой «Смотреть товар»; второй (если есть) рисуется рядом">
              <ProductsField value={s.products} onChange={(v) => ed.set('products', v)} max={2} />
            </Field>
          </Card>
          <Card title="Кадры" sub="Каждый кадр показывается около 5 секунд; покупатель может листать их тапом">
            <div className="a-stack a-stack--sm">
              <SortableList items={s.frames} getKey={(_, i) => String(i)} gap={6} className="c-frames" onMove={(a, b) => ed.update((x) => moveItem(x.frames, a, b), 'История: порядок кадров')}
                render={(text, i, handle) => (
                  <div className="c-frame-row">
                    <span className="a-item__handle" {...handle}><I name="drag" className="i--sm" /></span>
                    <span className="c-frame-row__n">{i + 1}</span>
                    <Input value={text} onValue={(v) => ed.update((x) => { x.frames[i] = v; }, 'История: кадр', `st:${s.id}:f${i}`)} />
                    <IconBtn icon="trash" label="Удалить кадр" danger disabled={s.frames.length <= 1} onClick={() => ed.update((x) => { x.frames.splice(i, 1); }, 'История: кадр удалён')} />
                  </div>
                )} />
              {s.frames.length < 6 && <Btn size="sm" icon="plus" onClick={() => ed.update((x) => { x.frames.push(`Шаг ${x.frames.length + 1}. …`); }, 'История: кадр добавлен')}>Добавить кадр</Btn>}
              {s.frames.length >= 6 && <Note>Больше шести кадров истории обычно не досматривают.</Note>}
            </div>
          </Card>
        </div>
      )}
    />
  );
}

function StoryThumb({ s }: { s: Story }) {
  const index = useAdmin((st) => st.draft.stories.findIndex((x) => x.id === s.id));
  return <Art spec={{ kind: 'story', index, frame: 0 }} />;
}
