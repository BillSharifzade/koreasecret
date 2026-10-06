'use client';
import { HeroSlideView } from '@/components/home/Hero';
import { heroTone } from '@/lib/color';
import { mdText } from '@/lib/md';
import type { HeroArt, HeroSlide, Tone } from '@/lib/types';
import { uid } from '../state/schema';
import { CollectionEditor } from '../ui/collection';
import { I } from '../ui/icons';
import { Badge, Btn, Card, ColorInput, cx, Field, IconBtn, Input, Note, Seg, TextArea } from '../ui/kit';
import { ImageField, LinkField, ProductsField } from '../ui/pickers';
import { Scaled } from '../ui/preview';

/* ---------- backgrounds ---------- */
export const BG_PRESETS: { name: string; bg: string }[] = [
  { name: 'Розовый', bg: 'radial-gradient(60% 80% at 72% 42%, rgba(255,214,232,.75) 0%, rgba(255,214,232,0) 60%), radial-gradient(40% 50% at 10% 90%, rgba(160,60,150,.55) 0%, transparent 70%), linear-gradient(118deg, #f38bba 0%, #e05595 40%, #c1408c 70%, #8f3a8f 100%)' },
  { name: 'Персик', bg: 'radial-gradient(42% 58% at 72% 36%, rgba(255,255,255,.95) 0%, rgba(255,255,255,0) 62%), radial-gradient(55% 70% at 8% 100%, rgba(255,190,160,.42) 0%, transparent 70%), linear-gradient(120deg, #fff8ee 0%, #ffeedd 45%, #ffe1cf 75%, #fcd2c2 100%)' },
  { name: 'Ночь', bg: 'radial-gradient(55% 70% at 70% 45%, rgba(236,120,180,.55) 0%, transparent 65%), radial-gradient(35% 45% at 88% 88%, rgba(120,70,180,.5) 0%, transparent 70%), linear-gradient(120deg, #1d0f1c 0%, #3e1636 45%, #6b2156 75%, #a2346f 100%)' },
  { name: 'Лаванда', bg: 'radial-gradient(50% 60% at 72% 40%, rgba(255,255,255,.8) 0%, transparent 60%), radial-gradient(50% 60% at 0% 100%, rgba(214,170,240,.5) 0%, transparent 70%), linear-gradient(120deg, #f6f0ff 0%, #ece0fd 45%, #f6dcf0 80%, #f4c9e0 100%)' },
  { name: 'Мята', bg: 'radial-gradient(50% 60% at 72% 40%, rgba(255,255,255,.85) 0%, transparent 60%), radial-gradient(50% 60% at 0% 100%, rgba(120,200,170,.4) 0%, transparent 70%), linear-gradient(120deg, #f1fbf5 0%, #dcf3e6 45%, #c6ead8 80%, #a9dcc4 100%)' },
  { name: 'Небо', bg: 'radial-gradient(50% 60% at 72% 40%, rgba(255,255,255,.85) 0%, transparent 60%), radial-gradient(50% 60% at 0% 100%, rgba(120,160,230,.4) 0%, transparent 70%), linear-gradient(120deg, #f2f7ff 0%, #dde9fb 45%, #c9dbf6 80%, #b4caef 100%)' },
  { name: 'Ягода', bg: 'radial-gradient(55% 70% at 70% 45%, rgba(255,140,170,.5) 0%, transparent 65%), radial-gradient(35% 45% at 10% 90%, rgba(80,20,60,.55) 0%, transparent 70%), linear-gradient(120deg, #5c0f2f 0%, #8c1c45 45%, #b8295a 75%, #d9466f 100%)' },
  { name: 'Сливки', bg: 'radial-gradient(42% 58% at 72% 36%, rgba(255,255,255,.95) 0%, rgba(255,255,255,0) 62%), radial-gradient(55% 70% at 8% 100%, rgba(230,200,160,.4) 0%, transparent 70%), linear-gradient(120deg, #fffaf2 0%, #fbf0e1 45%, #f5e3cc 75%, #ecd2b2 100%)' }
];

/** The base linear gradient of a banner background: its angle and colour stops. */
export function parseBase(bg: string): { angle: number; stops: [string, number][]; head: string } | null {
  const at = bg.lastIndexOf('linear-gradient(');
  if (at < 0) return null;
  const base = bg.slice(at);
  const m = base.match(/^linear-gradient\((\d+)deg,(.*)\)\s*$/);
  if (!m) return null;
  const stops = [...m[2].matchAll(/(#[0-9a-f]{3,6})\s+(\d+)%/gi)].map((x) => [x[1].toLowerCase(), Number(x[2])] as [string, number]);
  if (stops.length < 2) return null;
  return { angle: Number(m[1]), stops, head: bg.slice(0, at) };
}
const buildBase = (head: string, angle: number, stops: [string, number][]) => `${head}linear-gradient(${angle}deg, ${stops.map(([c, p]) => `${c} ${p}%`).join(', ')})`;

function BackgroundEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const base = parseBase(value);
  return (
    <div className="a-stack">
      <div className="a-bg-presets">
        {BG_PRESETS.map((p) => <button key={p.name} type="button" className={cx('a-bg-preset', p.bg === value && 'is-active')} style={{ background: p.bg }} onClick={() => onChange(p.bg)} title={p.name}><span>{p.name}</span></button>)}
      </div>
      {base ? (
        <div className="a-stack a-stack--sm">
          <div className="a-field__label"><span>Цвета градиента</span><small>угол {base.angle}°</small></div>
          <div className="a-bg-stops">
            {base.stops.map(([c, pos], i) => (
              <ColorInput key={i} size="sm" value={c} onChange={(nc) => { const st = base.stops.map((s, k) => (k === i ? [nc, s[1]] : s) as [string, number]); onChange(buildBase(base.head, base.angle, st)); }} />
            ))}
          </div>
          <input type="range" min={0} max={360} value={base.angle} className="a-range" aria-label="Угол градиента" onChange={(e) => onChange(buildBase(base.head, Number(e.target.value), base.stops))} />
        </div>
      ) : <Note kind="warn">Фон задан своим CSS — цвета можно поменять в поле ниже или выбрать готовый вариант.</Note>}
      <details className="a-details">
        <summary>CSS фона (для опытных)</summary>
        <TextArea value={value} onValue={onChange} rows={4} />
      </details>
    </div>
  );
}

const ARTS: { value: HeroArt; label: string; hint: string }[] = [
  { value: 'promo', label: 'Промо', hint: '3 товара и до 3 стеклянных плашек со скидками' },
  { value: 'glass', label: 'Сияние', hint: 'свечение и пузырьки, до 2 плашек' },
  { value: 'spf', label: 'Солнце', hint: 'тёплое солнце, до 2 плашек' },
  { value: 'gifts', label: 'Подарки', hint: 'наборы и подарочная карта, бабочки' },
  { value: 'none', label: 'Без декора', hint: 'только текст и фон' }
];

export function SlidePreview({ s }: { s: HeroSlide }) {
  const tone = heroTone(s);
  return (
    <Scaled width={1440} label="Так баннер выглядит на сайте">
      <section className="hero" data-tone={tone} style={{ borderRadius: 0 }}>
        <div className="hero__slides"><HeroSlideView s={s} tone={tone} /></div>
      </section>
    </Scaled>
  );
}

function newSlide(): HeroSlide {
  return { id: uid('h-'), bg: BG_PRESETS[3].bg, kicker: 'Новинки', title: 'Новый *баннер*', text: 'Короткий текст о предложении — одна-две строки', cta: 'Смотреть', link: '/catalog?offer=new', art: 'glass', products: [], pills: [] };
}

export function Banners() {
  return (
    <CollectionEditor<HeroSlide>
      area="Баннеры"
      list={(d) => d.heroSlides}
      title={<>Баннеры <em>главной</em></>}
      sub="Большой слайдер в начале главной страницы. Перетаскивайте карточки, чтобы поменять порядок показа; скрытые баннеры остаются в черновике."
      noun={{ one: 'баннер', add: 'Новый баннер', gen: 'баннера' }}
      label={(s) => <span dangerouslySetInnerHTML={{ __html: mdText(s.title) }} />}
      caption={(s) => `${s.kicker} · ${s.action === 'copy' ? 'копирует промокод' : s.action === 'giftcard' ? 'подарочная карта' : s.link || 'без ссылки'}`}
      media={(s) => <div style={{ width: '100%', height: '100%', background: s.bg }} />}
      create={newSlide}
      wide
      extra={(s) => <Badge tone={heroTone(s) === 'dark' ? 'dark' : undefined}>{heroTone(s) === 'dark' ? 'белый текст' : 'тёмный текст'}</Badge>}
      editor={(s, ed) => {
        const auto = heroTone({ ...s, tone: undefined });
        return (
          <div className="a-stack a-stack--lg">
            <SlidePreview s={s} />
            <Card title="Текст">
              <div className="a-form">
                <div className="a-form-row a-form-row--2">
                  <Field label="Надзаголовок"><Input value={s.kicker} onValue={(v) => ed.set('kicker', v)} /></Field>
                  <Field label="Текст кнопки"><Input value={s.cta} onValue={(v) => ed.set('cta', v)} /></Field>
                </div>
                <Field label="Заголовок" hint="Слово в *звёздочках* выделяется курсивом, как на сайте" aside={<small>{s.title.length} симв.</small>}><Input size="title" value={s.title} onValue={(v) => ed.set('title', v)} /></Field>
                <Field label="Подзаголовок"><TextArea value={s.text} onValue={(v) => ed.set('text', v)} rows={2} /></Field>
                <Field label="Кнопка">
                  <Seg value={s.action || 'link'} onChange={(v) => ed.set('action', v === 'link' ? undefined : (v as HeroSlide['action']))} options={[{ value: 'link', label: 'Ведёт по ссылке', icon: 'link' }, { value: 'copy', label: 'Копирует промокод', icon: 'copy' }, { value: 'giftcard', label: 'Подарочная карта', icon: 'gift' }]} />
                </Field>
                {!s.action && <Field label="Ссылка кнопки"><LinkField value={s.link} onChange={(v) => ed.set('link', v)} /></Field>}
              </div>
            </Card>
            <Card title="Фон и цвет текста">
              <div className="a-stack">
                <BackgroundEditor value={s.bg} onChange={(v) => ed.set('bg', v)} />
                <Field label="Цвет текста" hint={`Определяется по фону автоматически: сейчас ${auto === 'dark' ? 'белый текст на тёмном' : 'тёмный текст на светлом'}`}>
                  <Seg value={s.tone || 'auto'} onChange={(v) => ed.set('tone', v === 'auto' ? undefined : (v as Tone))} options={[{ value: 'auto', label: 'Авто', icon: 'wand' }, { value: 'light', label: 'Тёмный текст' }, { value: 'dark', label: 'Белый текст' }]} />
                </Field>
              </div>
            </Card>
            <Card title="Композиция справа">
              <div className="a-stack">
                <div className="a-art-presets">
                  {ARTS.map((a) => (
                    <button key={a.value} type="button" className={cx('a-art-preset', s.art === a.value && 'is-active')} onClick={() => ed.set('art', a.value)}>
                      <b>{a.label}</b><span>{a.hint}</span>
                    </button>
                  ))}
                </div>
                {s.art !== 'none' && !s.image && (
                  <>
                    <Field label="Товары в композиции" hint="До трёх: первый — слева, второй — в центре, третий — справа"><ProductsField value={s.products} onChange={(v) => ed.set('products', v)} max={3} /></Field>
                    <Field label="Стеклянные плашки" hint="Крупно — цифра или слово, мелко — пояснение">
                      <div className="a-stack a-stack--sm">
                        {s.pills.map((p, i) => (
                          <div key={i} className="a-tier">
                            <Input value={p.big} placeholder="−20%" onValue={(v) => ed.update((x) => { x.pills[i].big = v; }, 'Баннер: плашка', `pill:${s.id}:${i}:b`)} />
                            <Input value={p.small} placeholder="от 1 200 смн" onValue={(v) => ed.update((x) => { x.pills[i].small = v; }, 'Баннер: плашка', `pill:${s.id}:${i}:s`)} />
                            <IconBtn icon="trash" label="Убрать плашку" danger onClick={() => ed.update((x) => { x.pills.splice(i, 1); }, 'Баннер: плашка убрана')} />
                          </div>
                        ))}
                        {s.pills.length < 3 && <Btn size="sm" icon="plus" onClick={() => ed.update((x) => { x.pills.push({ big: 'New', small: 'подпись' }); }, 'Баннер: плашка')}>Добавить плашку</Btn>}
                      </div>
                    </Field>
                  </>
                )}
                <Field label="Своя картинка вместо композиции" hint="PNG или WebP с прозрачным фоном — встанет справа от текста. Оставьте пустым, чтобы рисовать композицию из товаров.">
                  <ImageField value={s.image} onChange={(v) => ed.set('image', v)} folder="banners" opts={{ max: 1400, removeWhite: false }} />
                </Field>
              </div>
            </Card>
            <Note icon="info">Баннер можно скрыть, не удаляя: значок <I name="eye" className="i--xs" /> в списке. Порядок показа на сайте — как в списке.</Note>
          </div>
        );
      }}
    />
  );
}
