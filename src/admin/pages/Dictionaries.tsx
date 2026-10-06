'use client';
import { useState } from 'react';
import type { Offer } from '@/lib/types';
import { linkUsages, mapLinks, renameDictKey, rewriteParam } from '../state/refs';
import { ID_RE, uniqueId } from '../state/schema';
import { edit, undo, useAdmin } from '../state/store';
import { I } from '../ui/icons';
import { Badge, Btn, Card, Input, Menu, Note, PageHead } from '../ui/kit';
import { confirmDialog, promptDialog, toast } from '../ui/overlay';
import { moveItem, SortableList } from '../ui/Sortable';
import { products, reorderKeys } from '../ui/tax-helpers';
import '../styles/taxonomy.css';

type DictKey = 'skins' | 'concerns';
const META: Record<DictKey, { title: string; sub: string; field: 'skin' | 'concerns'; param: 'skin' | 'concern'; noun: string; placeholder: string }> = {
  skins: { title: 'Типы кожи', sub: 'Фильтр «Тип кожи» и строка «Подходит для кожи» на странице товара', field: 'skin', param: 'skin', noun: 'тип кожи', placeholder: 'Например, Зрелая' },
  concerns: { title: 'Задачи кожи', sub: 'Фильтр «Задача», подборки и строка «Решает задачи» на странице товара', field: 'concerns', param: 'concern', noun: 'задачу', placeholder: 'Например, Тусклость' }
};
const OFFER_META: Record<Offer, { hint: string; icon: string }> = {
  sale: { hint: 'Товары со старой (зачёркнутой) ценой', icon: 'percent' },
  new: { hint: 'Товары с меткой «Новинка»', icon: 'sparkle' },
  hit: { hint: 'Товары с меткой «Хит»', icon: 'fire' },
  excl: { hint: 'Товары с меткой «Только у нас»', icon: 'star-o' }
};

function DictEditor({ dict }: { dict: DictKey }) {
  const draft = useAdmin((s) => s.draft);
  const m = META[dict];
  const values = draft.taxonomy[dict];
  const keys = Object.keys(values);
  const [label, setLabel] = useState('');
  const used = (k: string) => draft.products.filter((p) => (p[m.field] as string[]).includes(k)).length;

  const add = () => {
    const l = label.trim();
    if (!l) return;
    const id = uniqueId(l, (x) => x in values);
    edit((d) => { d.taxonomy[dict][id] = l; }, { label: `${m.title}: добавлено «${l}»` });
    setLabel('');
  };
  const rename = async (k: string) => {
    const to = (await promptDialog({ title: 'Новый ID', text: <>Ключ используется в товарах и ссылках каталога (<span className="adm-mono">?{m.param}={k}</span>) — всё обновится автоматически.</>, value: k, label: 'ID', confirm: 'Переименовать', icon: 'key' }))?.trim();
    if (!to || to === k) return;
    if (!ID_RE.test(to)) { toast({ title: 'ID — только латиница, цифры и дефис', kind: 'error' }); return; }
    if (to in values) { toast({ title: 'Такой ID уже есть', kind: 'error' }); return; }
    edit((d) => { renameDictKey(d, dict, k, to); reorderKeys(d.taxonomy[dict], keys.map((x) => (x === k ? to : x))); }, { label: `${m.title}: новый ID` });
    toast({ title: 'ID изменён', kind: 'ok' });
  };
  const remove = async (k: string) => {
    const n = used(k), links = linkUsages(draft, m.param, k);
    const ok = await confirmDialog({ title: `Удалить «${values[k]}»?`, text: <>{n ? `Значение указано у ${products(n)} — у них оно уберётся. ` : 'Ни у одного товара значение не указано. '}{links ? `В ${links} ссылках фильтр по нему исчезнет.` : ''}</>, confirm: 'Удалить', danger: true });
    if (!ok) return;
    edit((d) => {
      d.products.forEach((p) => { (p as unknown as Record<string, string[]>)[m.field] = (p[m.field] as string[]).filter((x) => x !== k); });
      mapLinks(d, (v) => rewriteParam(v, m.param, k, null));
      delete d.taxonomy[dict][k];
    }, { label: `${m.title}: удалено «${values[k]}»` });
    toast({ title: 'Удалено', text: values[k], icon: 'trash', action: { label: 'Вернуть', fn: () => undo() } });
  };

  return (
    <Card title={m.title} sub={m.sub}>
      <div className="adm-stack adm-stack--sm">
        <SortableList items={keys} getKey={(k) => k} gap={6} className="adm-stack adm-stack--sm" onMove={(a, b) => { const order = keys.slice(); moveItem(order, a, b); edit((d) => reorderKeys(d.taxonomy[dict], order), { label: `${m.title}: порядок` }); }}
          render={(k, _i, handle) => {
            const n = used(k);
            const locked = dict === 'skins' && k === 'all';
            return (
              <div className="tax-dict-row">
                <span className="a-item__handle" {...handle}><I name="drag" className="i--sm" /></span>
                <div className="adm-grow"><Input size="sm" value={values[k]} onValue={(v) => edit((d) => { d.taxonomy[dict][k] = v; }, { label: `${m.title}: название`, key: `dict:${dict}:${k}` })} /></div>
                <span className="adm-mono adm-muted tax-id" title="ID">{k}</span>
                {locked ? <Badge tone="blue">для всех</Badge> : n ? <Badge>{products(n)}</Badge> : <Badge tone="amber">0</Badge>}
                {locked ? <span style={{ width: 36 }} /> : (
                  <Menu items={[{ label: 'Изменить ID', icon: 'key', onClick: () => rename(k) }, { sep: true }, { label: 'Удалить', icon: 'trash', danger: true, onClick: () => remove(k) }]} />
                )}
              </div>
            );
          }} />
        <form className="adm-row" style={{ gap: 6, marginTop: 6 }} onSubmit={(e) => { e.preventDefault(); add(); }}>
          <div className="adm-grow"><Input size="sm" value={label} onValue={setLabel} placeholder={m.placeholder} /></div>
          <Btn size="sm" icon="plus" type="submit" disabled={!label.trim()}>Добавить</Btn>
        </form>
        {dict === 'skins' && <div className="a-field__hint">«Для всех типов» — служебное значение: такой товар находится при выборе любого типа кожи.</div>}
      </div>
    </Card>
  );
}

export function Dictionaries() {
  const draft = useAdmin((s) => s.draft);
  const offers = draft.taxonomy.offers;
  const offerCount = (o: Offer) => draft.products.filter((p) => (o === 'sale' ? !!p.old : p.tags.includes(o))).length;
  return (
    <div className="adm-page">
      <PageHead title={<>Справочники <em>каталога</em></>} sub="Значения фильтров каталога. Порядок здесь — порядок в фильтрах; ID нужен для ссылок и редко меняется." />
      <div className="adm-grid adm-grid--2">
        <DictEditor dict="skins" />
        <DictEditor dict="concerns" />
      </div>
      <div className="adm-grid adm-grid--main">
        <Card title="Предложения" sub="Фильтр «Предложения», пункты меню «Акции» и чипсы «Скидки», «Новинки», «Хиты». Сами группы фиксированные — меняются только подписи.">
          <div className="adm-stack adm-stack--sm">
            {(Object.keys(OFFER_META) as Offer[]).map((o) => (
              <div key={o} className="tax-dict-row">
                <span className="tax-offer-icon"><I name={OFFER_META[o].icon} className="i--sm" /></span>
                <div className="adm-grow" style={{ minWidth: 0 }}>
                  <Input size="sm" value={offers[o] || ''} onValue={(v) => edit((d) => { d.taxonomy.offers[o] = v; }, { label: 'Предложения: подпись', key: `offer:${o}` })} />
                  <div className="a-field__hint" style={{ marginTop: 4 }}>{OFFER_META[o].hint} · <span className="adm-mono">?offer={o}</span></div>
                </div>
                <Badge>{products(offerCount(o))}</Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Где это видно">
          <div className="tax-explain">
            <div><I name="filter" /><span>Фильтры каталога: «Тип кожи», «Задача», «Предложения» — в этом порядке.</span></div>
            <div><I name="box" /><span>Страница товара: «Подходит для кожи…», «Решает задачи…» и вкладка «Характеристики».</span></div>
            <div><I name="grid" /><span>Подборки и меню: ссылки вида <span className="adm-mono">/catalog?concern=…</span>.</span></div>
          </div>
          <Note>Значения для каждого товара выбираются в его карточке, в блоке «Для кого и состав».</Note>
        </Card>
      </div>
    </div>
  );
}
