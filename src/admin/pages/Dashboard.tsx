'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Art } from '@/components/Art';
import { Butterfly } from '@/components/Brand';
import { BASE_PATH } from '@/lib/site';
import { byCategory, byProduct, coverage, delta, kpis, presetRange, prevRange, series, type Preset } from '../orders/analytics';
import { demoEnabled, STATUS, useOrders } from '../orders/store';
import { DeployCard, IssueList, openPanel, plural, useChanges, useIssues } from '../shell/Publish';
import { useAdmin } from '../state/store';
import { BarList, ChartCard, Kpi, MUTED, SERIES, StackBar, TrendChart } from '../ui/charts';
import { I } from '../ui/icons';
import { ago, Badge, Btn, Card, LinkBtn, money, Note, Seg } from '../ui/kit';

const greet = () => { const h = new Date().getHours(); return h < 5 ? 'Доброй ночи' : h < 12 ? 'Доброе утро' : h < 18 ? 'Добрый день' : 'Добрый вечер'; };

export function Dashboard() {
  const orders = useOrders();
  const draft = useAdmin((s) => s.draft);
  const session = useAdmin((s) => s.session);
  const deploy = useAdmin((s) => s.deploy);
  const changes = useChanges();
  const issues = useIssues();
  const [preset, setPreset] = useState<Preset>('30d');
  const cur = draft.settings.currency;
  const m = (n: number) => money(n, cur);

  const data = useMemo(() => {
    const r = presetRange(preset), p = prevRange(r);
    const k = kpis(orders, r), kp = kpis(orders, p);
    const s = series(orders, r), sp = series(orders, p, s.length > 1 ? undefined : 'day');
    const today = kpis(orders, presetRange('today'));
    return { r, k, kp, s, sp, today, top: byProduct(orders, r).slice(0, 7), cats: byCategory(orders, r, draft).slice(0, 6) };
  }, [orders, preset, draft]);
  const stock = useMemo(() => coverage(orders, draft).filter((x) => x.days < 21 || x.p.stock <= 5).slice(0, 6), [orders, draft]);
  const recent = orders.slice(0, 7);
  const waiting = orders.filter((o) => o.status === 'new').length;
  const errors = issues.filter((i) => i.level === 'error');
  const user = session?.user;
  const k = data.k, kp = data.kp;

  return (
    <div className="adm-page">
      <section className="a-hello">
        <div className="hero__grain" />
        <Butterfly className="a-hello__bfly" />
        <div className="a-hello__main">
          <div className="a-hello__date">{new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
          <h1 className="a-hello__title">{greet()}{user ? `, ${(user.name || user.login).split(' ')[0]}` : ''}</h1>
          <p className="a-hello__text">
            Сегодня {data.today.orders ? <>уже <b>{data.today.orders}</b> {data.today.orders % 10 === 1 && data.today.orders % 100 !== 11 ? 'заказ' : 'заказов'} на <b>{m(data.today.revenue)}</b></> : 'заказов пока нет'}
            {waiting ? <> · <Link href="/admin/orders/?status=new"><b>{waiting}</b> ждут подтверждения</Link></> : null}
          </p>
          <div className="a-hello__actions">
            <LinkBtn href="/admin/products/edit/?new=1" variant="white" icon="plus">Новый товар</LinkBtn>
            <LinkBtn href="/admin/banners/" variant="white" icon="image">Баннеры</LinkBtn>
            <LinkBtn href="/admin/home/" variant="white" icon="layout">Главная страница</LinkBtn>
            <a className="a-btn a-btn--white" href={`${BASE_PATH}/?preview=1`} target="_blank" rel="noopener noreferrer"><I name="eye" />Сайт с черновиком</a>
          </div>
        </div>
        <div className="a-hello__side">
          <div className="a-hello__stat"><span>Выручка сегодня</span><b>{m(data.today.revenue)}</b></div>
          <div className="a-hello__stat"><span>Товаров в каталоге</span><b>{draft.products.filter((p) => !p.hidden).length}</b></div>
          <div className="a-hello__stat"><span>{changes.length ? 'Неопубликовано' : 'Черновик'}</span><b>{changes.length ? `${changes.length} изм.` : 'чисто'}</b></div>
        </div>
      </section>

      {changes.length > 0 && (
        <div className="a-strip">
          <span className="adm-status__dot" style={{ background: '#f0a43c' }} />
          <span className="adm-grow">В черновике <b>{plural(changes.length, 'неопубликованное изменение', 'неопубликованных изменения', 'неопубликованных изменений')}</b>{errors.length ? <> и <b className="adm-red">{plural(errors.length, 'ошибка', 'ошибки', 'ошибок')}</b></> : null}. Покупатели их пока не видят.</span>
          <Btn size="sm" onClick={() => openPanel('changes')}>Что изменилось</Btn>
          <Btn size="sm" variant="primary" icon="cloud" onClick={() => openPanel('publish')}>{session?.mode === 'github' ? 'Опубликовать' : 'Выгрузить'}</Btn>
        </div>
      )}

      <div className="adm-row adm-row--between adm-row--wrap">
        <div className="a-section-title" style={{ margin: 0 }}>Продажи{demoEnabled() ? ' · демо-данные + заказы с сайта' : ''}</div>
        <Seg size="sm" value={preset} onChange={setPreset} options={[{ value: '7d', label: '7 дней' }, { value: '30d', label: '30 дней' }, { value: '90d', label: '90 дней' }, { value: '12m', label: 'Год' }]} />
      </div>
      <div className="a-kpis">
        <Kpi icon="cash" label="Выручка" value={m(k.revenue)} delta={delta(k.revenue, kp.revenue)} foot="к прошлому периоду" spark={data.s.map((x) => x.revenue)} />
        <Kpi icon="receipt" label="Заказы" value={k.orders.toLocaleString('ru-RU')} delta={delta(k.orders, kp.orders)} foot={`отмен ${k.cancelRate.toFixed(1)}%`} spark={data.s.map((x) => x.orders)} />
        <Kpi icon="bag" label="Средний чек" value={m(k.aov)} delta={delta(k.aov, kp.aov)} foot={`${(k.units / Math.max(1, k.orders)).toFixed(1)} товара в заказе`} spark={data.s.map((x) => x.aov)} />
        <Kpi icon="users" label="Новые клиенты" value={k.newCustomers.toLocaleString('ru-RU')} delta={delta(k.newCustomers, kp.newCustomers)} foot={`всего покупали ${k.customers}`} />
      </div>

      <div className="adm-grid adm-grid--main">
        <ChartCard title="Выручка" sub={`${data.s[0]?.long ?? ''} — ${data.s[data.s.length - 1]?.long ?? ''}`}
          chart={<><TrendChart height={290} fmt={m} partialLast
            points={data.s.map((x, i) => ({ label: x.label, long: x.long, values: [x.revenue, data.sp[i]?.revenue ?? 0] }))}
            series={[{ label: 'Этот период', color: SERIES[0], area: true }, { label: 'Прошлый период', color: MUTED, muted: true }]} />
            <div style={{ marginTop: 10 }}><LegendPair /></div></>}
          table={{ columns: ['Период', 'Выручка', 'Заказы', 'Средний чек'], num: [1, 2, 3], rows: data.s.map((x) => [x.long, m(x.revenue), x.orders, m(x.aov)]) }} />
        <Card title="Последние заказы" actions={<LinkBtn href="/admin/orders/" size="sm" iconRight="chev-right">Все</LinkBtn>}>
          <div className="a-changes">
            {recent.map((o) => (
              <Link key={o.id} className="a-change" href={`/admin/orders/?id=${o.id}`}>
                <span className="a-cell__art" style={{ width: 38, height: 38 }}><Art spec={{ kind: 'product', id: o.items[0]?.id || '' }} /></span>
                <span className="adm-grow" style={{ minWidth: 0 }}>
                  <span className="adm-row" style={{ gap: 6 }}><b style={{ fontWeight: 600 }}>{o.customer.name}</b>{o.source === 'site' && <Badge tone="blue">сайт</Badge>}</span>
                  <span className="a-change__fields">{o.id} · {ago(o.createdAt)}</span>
                </span>
                <span style={{ textAlign: 'right' }}><b className="adm-num" style={{ display: 'block' }}>{m(o.totals.total)}</b><Badge tone={STATUS[o.status].tone}>{STATUS[o.status].label}</Badge></span>
              </Link>
            ))}
            {!recent.length && <div className="adm-muted" style={{ padding: 20, textAlign: 'center' }}>Заказов пока нет</div>}
          </div>
        </Card>
      </div>

      <div className="adm-grid adm-grid--3">
        <ChartCard title="Топ товаров" sub="по выручке за период" actions={<LinkBtn href="/admin/analytics/?tab=products" size="sm" variant="ghost">Подробнее</LinkBtn>}
          chart={<BarList fmt={m} items={data.top.map((x) => ({ key: x.key, label: x.label, value: Math.round(x.revenue), note: `${x.units} шт` }))} />}
          table={{ columns: ['Товар', 'Шт', 'Выручка'], num: [1, 2], rows: data.top.map((x) => [x.label, x.units, m(x.revenue)]) }} />
        <ChartCard title="Категории" sub="доля выручки"
          chart={<StackBar fmt={m} parts={data.cats.map((c) => ({ key: c.key, label: c.label, value: Math.round(c.revenue) }))} />}
          table={{ columns: ['Категория', 'Заказов', 'Выручка', 'Доля'], num: [1, 2, 3], rows: data.cats.map((c) => [c.label, c.orders, m(c.revenue), `${c.share.toFixed(1)}%`]) }} />
        <Card title="Склад" sub="заканчивается по темпу продаж" actions={<LinkBtn href="/admin/products/" size="sm" variant="ghost">Товары</LinkBtn>}>
          <div className="a-changes">
            {stock.map(({ p, days }) => (
              <Link key={p.id} className="a-change" href={`/admin/products/edit/?id=${p.id}`}>
                <span className="a-cell__art" style={{ width: 38, height: 38 }}><Art spec={{ kind: 'product', id: p.id }} /></span>
                <span className="adm-grow adm-ellipsis">{p.name}<span className="a-change__fields" style={{ display: 'block' }}>{p.stock <= 0 ? 'нет в наличии' : `осталось ${p.stock} шт`}</span></span>
                <Badge tone={p.stock <= 0 || days < 7 ? 'red' : 'amber'}>{p.stock <= 0 ? '0' : days === Infinity ? 'нет продаж' : `≈${Math.max(1, Math.round(days))} дн.`}</Badge>
              </Link>
            ))}
            {!stock.length && <Note kind="ok">Запасов хватает на 3+ недели по всем товарам.</Note>}
          </div>
        </Card>
      </div>

      <div className="adm-grid adm-grid--2">
        <Card title="Проверка контента" sub={issues.length ? `${errors.length} ошибок · ${issues.length - errors.length} предупреждений` : 'Всё в порядке'} actions={<Btn size="sm" variant="ghost" onClick={() => openPanel('changes')}>Открыть</Btn>}>
          <div style={{ maxHeight: 300, overflow: 'auto' }}><IssueList issues={issues.slice(0, 8)} /></div>
        </Card>
        <Card title="Сайт" sub={session?.mode === 'github' ? `${session.repo} · ${session.branch}` : 'Демо-режим: публикация недоступна'}>
          {deploy ? <DeployCard deploy={deploy} compact /> : (
            <div className="a-stack a-stack--sm">
              <p className="adm-ink2">Здесь появится ход публикации: GitHub соберёт сайт за 1–2 минуты после нажатия «Опубликовать».</p>
              <div className="adm-row"><a className="a-btn" href={`${BASE_PATH}/`} target="_blank" rel="noopener noreferrer"><I name="external" />Открыть сайт</a><LinkBtn href="/admin/publish/" variant="ghost" icon="history">История версий</LinkBtn></div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function LegendPair() {
  return <div className="a-legend"><span><i style={{ background: SERIES[0], height: 3, width: 14, borderRadius: 2 }} />Этот период</span><span><i style={{ background: MUTED, height: 3, width: 14, borderRadius: 2 }} />Прошлый период</span></div>;
}
