
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const money = (v) => BRL.format(Math.round(v * 100) / 100);
  const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const hhmm = (d) => d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const pc = (v) => (v * 100).toFixed(2) + '%';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const safe = (name, fn) => { try { return fn(); } catch (err) { console.error('[VeriSeal Delivery] ' + name, err); } };
  const setState = (el, s) => { if (s) el.dataset.state = s; else delete el.dataset.state; };
  const icon = (name, cls = '') => `<svg class="icon ${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const vsMark = (cls = '') => `<svg class="aspect-mark h-auto ${cls}" viewBox="0 0 668 359" aria-hidden="true"><use href="#vs-mark"/></svg>`;

  const SEAL_PILL = 'absolute top-[9px] right-[9px] z-[2] inline-flex items-center gap-[5px] rounded-full bg-navy py-[3px] pr-2 pl-1.5 text-[11px] font-bold text-white max-sm:pr-[7px] max-sm:pl-[5px] max-sm:text-[10px]';
  const SEAL_PILL_MARK = 'w-[18px] [--lg-ink:#fff] max-sm:w-[15px]';
  const MEDIA_BG = 'bg-[radial-gradient(ellipse_52%_9%_at_50%_93%,rgba(4,37,85,.2),transparent_72%),linear-gradient(180deg,#f6f8fb,#e9eef5)]';
  const LINK_BTN = 'text-accent hover:underline';
  const NOTE_MARK = 'inline-flex items-center gap-2 text-[13px] font-bold text-navy';
  const ROW = 'flex justify-between py-[3px] text-[14px] text-fg-2';
  const GRAND = 'flex justify-between pt-2 pb-[3px] text-[19px] font-extrabold tracking-[-.02em] text-fg';
  const FREE = 'font-semibold text-ok';
  const CEP_INFO = 'mb-2 min-h-4 text-[12px] text-fg-2 data-[state=err]:text-bad data-[state=ok]:text-ok';
  const FIELD = 'flex min-w-0 flex-col gap-1.5';
  const LABEL = 'text-[13px] font-semibold text-fg';
  const INPUT = 'w-full resize-y rounded-xl border border-line bg-white px-3.5 py-3 text-[16px] outline-none transition-[border-color,box-shadow] duration-200 focus:border-accent focus:shadow-focus [&.invalid]:border-bad';
  const OPTIONAL = ' <span class="font-normal text-fg-2">(opcional)</span>';
  const PAY_OPT = 'flex cursor-pointer items-center gap-3.5 rounded-2xl border-[1.5px] border-line px-4 py-3.5 transition-[border-color,background] duration-200 hover:border-fg-3 has-checked:border-accent has-checked:bg-accent/4 has-disabled:cursor-default has-disabled:opacity-55';
  const PAY_RADIO = 'm-0 size-[18px] shrink-0 accent-accent';
  const PAY_IC = 'grid size-9 shrink-0 place-items-center rounded-[10px] bg-surface text-navy';
  const PAY_EXTRA = 'pr-1 pb-1 pl-[50px] max-sm:pl-1';
  const REVIEW = 'rounded-2xl bg-surface px-[18px] py-3.5';
  const REVIEW_H = 'mb-1.5 flex justify-between text-[13px] font-semibold text-fg-2';
  const ACTIONS = 'mt-[22px] flex justify-between gap-2.5 max-sm:flex-col-reverse';
  const ACTION_MAIN = 'btn btn-primary ml-auto max-w-[340px] flex-1 max-sm:max-w-none';
  const VR_IN = 'animate-[riseIn_.5s_var(--ease-smooth)_var(--d,0s)_both]';

  const SCALLOP = 'M28 4.8Q35.82-1.17 39.6 7.91Q49.35 6.65 48.09 16.4Q57.17 20.18 51.2 28Q57.17 35.82 48.09 39.6Q49.35 49.35 39.6 48.09Q35.82 57.17 28 51.2Q20.18 57.17 16.4 48.09Q6.65 49.35 7.91 39.6Q-1.17 35.82 4.8 28Q-1.17 20.18 7.91 16.4Q6.65 6.65 16.4 7.91Q20.18-1.17 28 4.8Z';
  const MEDAL_TINT = { ok: ['#14a64a', 'rgba(20,166,74,.42)'], warn: ['#e8930c', 'rgba(232,147,12,.42)'], bad: ['#d93025', 'rgba(217,48,37,.42)'] };
  const MEDAL_TINT_DARK = { ok: ['#22c55e', 'rgba(34,197,94,.5)'], warn: ['#f5a524', 'rgba(245,165,36,.5)'], bad: ['#ff5b4f', 'rgba(255,91,79,.5)'] };
  const MEDAL_ANIM = {
    now: {
      badge: 'animate-[mPop_.75s_var(--ease-spring)_both]', shake: 'animate-[mPop_.75s_var(--ease-spring)_both,mShake_.45s_ease_.85s]',
      glyph: 'animate-[draw_.42s_var(--ease-io)_.42s_forwards]', dot: 'animate-[mFade_.2s_ease_.8s_forwards]',
      shock: ['animate-[mShock_1.1s_var(--ease-smooth)_.28s_both]', 'animate-[mShock_1.1s_var(--ease-smooth)_.5s_both]'],
      halo: 'animate-[mHalo_.7s_var(--ease-smooth)_.45s_both,mSpin_9s_linear_.45s_infinite]', glow: 'animate-[mGlow_2.6s_ease-in-out_.3s_infinite_both]',
      spark: 'animate-[mSpark_.95s_var(--ease-smooth)_.3s_both]'
    },
    on: {
      badge: '[.is-on_&]:animate-[mPop_.75s_var(--ease-spring)_both]', shake: '[.is-on_&]:animate-[mPop_.75s_var(--ease-spring)_both,mShake_.45s_ease_.85s]',
      glyph: '[.is-on_&]:animate-[draw_.42s_var(--ease-io)_.42s_forwards]', dot: '[.is-on_&]:animate-[mFade_.2s_ease_.8s_forwards]',
      shock: ['[.is-on_&]:animate-[mShock_1.1s_var(--ease-smooth)_.28s_both]', '[.is-on_&]:animate-[mShock_1.1s_var(--ease-smooth)_.5s_both]'],
      halo: '[.is-on_&]:animate-[mHalo_.7s_var(--ease-smooth)_.45s_both,mSpin_9s_linear_.45s_infinite]', glow: '[.is-on_&]:animate-[mGlow_2.6s_ease-in-out_.3s_infinite_both]',
      spark: '[.is-on_&]:animate-[mSpark_.95s_var(--ease-smooth)_.3s_both]'
    },
    loop: {
      badge: 'animate-[vcPop_7s_var(--ease-smooth)_infinite]', glyph: 'animate-[vcDraw_7s_linear_infinite]', dot: '',
      shock: ['animate-[vcShock_7s_var(--ease-smooth)_infinite]', 'animate-[vcShock2_7s_var(--ease-smooth)_infinite]'],
      halo: 'animate-[vcHalo_7s_linear_infinite]', glow: 'animate-[vcHalo_7s_linear_infinite]', spark: 'animate-[vcSpark_7s_var(--ease-smooth)_infinite]'
    }
  };
  const medal = (kind = 'ok', play = 'now', ms = '96px', cls = '') => {
    const [mc, mg] = (play === 'now' ? MEDAL_TINT_DARK : MEDAL_TINT)[kind];
    const a = MEDAL_ANIM[play];
    const glyph = 'fill-none stroke-white stroke-[5.4] [stroke-dasharray:1] [stroke-dashoffset:1] [stroke-linecap:round] [stroke-linejoin:round]';
    const shock = (k) => `<i class="size-full rounded-full border-2 border-[var(--mc)] opacity-0 ${a.shock[k]}"></i>`;
    return `<span class="relative grid size-[var(--ms,96px)] flex-none place-items-center *:[grid-area:1/1] ${cls}" style="--ms:${ms};--mc:${mc};--mg:${mg}" aria-hidden="true">
      <i class="size-[160%] rounded-full bg-[radial-gradient(closest-side,var(--mg),transparent_72%)] opacity-0 ${a.glow}"></i><i class="size-[134%] rounded-full bg-[conic-gradient(#8fe3ff,#b9a9ff,#ffc4e5,#fff1b0,#b3ffd8,#8fe3ff)] opacity-0 [mask:radial-gradient(closest-side,transparent_83%,#000_85%,#000_96%,transparent_98%)] ${a.halo}"></i>${shock(0)}${shock(1)}
      <span class="relative size-full">${Array.from({ length: 8 }, (_, k) => `<i class="absolute top-1/2 left-1/2 rounded-full opacity-0 [transform:rotate(var(--a))] ${k % 2 ? '-mt-[2.5%] -ml-[2.5%] size-[5%] bg-[#5fd0ff]' : '-mt-[4%] -ml-[4%] size-[8%] bg-[var(--mc)]'} ${a.spark}" style="--a:${k * 45 + 22}deg"></i>`).join('')}</span>
      <svg class="relative z-[2] size-full overflow-visible [filter:drop-shadow(0_calc(var(--ms,96px)*.07)_calc(var(--ms,96px)*.14)_var(--mg))] ${kind === 'ok' || play === 'loop' ? a.badge : a.shake}" viewBox="-2 -2 60 60"><path class="fill-[var(--mc)]" d="${SCALLOP}"/>${kind === 'ok'
      ? `<path class="${glyph} ${a.glyph}" d="M18 28.5l7 7 13.5-14" pathLength="1"/>`
      : `<path class="${glyph} ${a.glyph}" d="M28 15.5v14.5" pathLength="1"/><circle class="fill-white opacity-0 ${a.dot}" cx="28" cy="38.8" r="2.9"/>`}</svg>
    </span>`;
  };

  const store = {
    get(k, d) { try { const v = localStorage.getItem('vsd:' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem('vsd:' + k, JSON.stringify(v)); } catch { /* armazenamento indisponível */ } }
  };

  const PIX_OFF = 0.05, FREE_SHIP = 199, SHIP_FEE = 9.9, MAX_QTY = 12, MAX_INST = 6, MIN_INST = 30;
  const OPEN_H = 8, CLOSE_H = 3;    // aberto das 8h às 3h da manhã
  const SITE_HOST = 'veriseal.com.br';   // endereço mostrado no navegador das demonstrações
  const storeOpen = (d = new Date()) => d.getHours() >= OPEN_H || d.getHours() < CLOSE_H;

  const CATS = window.VSD_CATEGORIES || [];
  const PRODUCTS = window.VSD_PRODUCTS || [];
  const byId = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
  const catName = Object.fromEntries(CATS.map((c) => [c.id, c.name]));
  PRODUCTS.forEach((p) => {
    if (!p.items) return;
    p.bottles = p.items.map((id) => byId[id]).filter(Boolean);
    p.oldPrice = p.bottles.reduce((s, b) => s + b.price, 0);   // kit: "de" = soma das garrafas
  });
  const seals = Object.assign({}, window.VSD_SEALS || {}, store.get('seals', {}));

  const isKit = (p) => !!p.items;
  const pct = (p) => (p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0);
  const pix = (v) => v * (1 - PIX_OFF);
  const inst = (v) => { const n = Math.min(MAX_INST, Math.floor(v / MIN_INST)); return n >= 2 ? { n, v: v / n } : null; };
  const abv = (p) => String(p.abv).replace('.', ',') + '%';
  const meta = (p) => (isKit(p) ? `${p.bottles.length} garrafas · ${p.bottles.length} lacres VeriSeal` : `${p.volume} · ${abv(p)} vol.`);
  // mesma marca e nome (ex.: Absolut Vodka 1 L e 750 ml): o volume entra no nome completo
  const twins = new Set(PRODUCTS.filter((p, _, a) => !isKit(p) && a.some((q) => q !== p && q.brand === p.brand && q.name === p.name)).map((p) => p.id));
  const fullName = (p) => (isKit(p) ? `Kit ${p.name}` : `${p.brand} ${p.name}${twins.has(p.id) ? ' ' + p.volume : ''}`);
  const shortName = (p) => (isKit(p) ? `Kit ${p.name}` : `${p.name}${twins.has(p.id) ? ' ' + p.volume : ''}`);
  // garrafas repetidas num kit aparecem como "3× Tanqueray London Dry"
  const kitGroups = (p) => { const m = new Map(); p.bottles.forEach((b) => m.set(b, (m.get(b) || 0) + 1)); return [...m]; };
  // cada termo precisa casar com o início de uma palavra ("gin" não acha "original")
  const matches = (p, q) => {
    const words = norm([p.brand, p.name, p.volume, catName[p.category], p.origin, ...(p.notes || []), ...(p.bottles || []).map((b) => b.brand + ' ' + b.name)].join(' ')).split(/[^a-z0-9]+/);
    return norm(q).split(/[^a-z0-9]+/).filter(Boolean).every((t) => words.some((w) => w.startsWith(t)));
  };

  /* ============================================================
     FOTOS COM LACRE — a tira VeriSeal vai na junção tampa/gargalo
     ============================================================ */
  const NECK = window.Seal.NECK;   // tira 40 × 110, ruptura em 44, símbolo NFC em 63
  function sealGeo(p) {
    const [w, h] = p.size, s = p.seal || { y: 0.15 };
    const sw = s.w || 0.145;                       // largura da tira (fração da largura da foto)
    const sh = sw * (w / h) * (NECK.H / NECK.W);   // altura da tira (fração da altura da foto)
    return { x: s.x || 0.5, y: s.y, sw, sh, top: s.y - sh * NECK.J / NECK.H, nfc: s.y + sh * (NECK.NFC - NECK.J) / NECK.H };
  }
  // o.cls troca a altura padrão (h-full) da foto; o.sealCls vai na tira do lacre
  function shot(p, o = {}) {
    const g = sealGeo(p);
    const seal = o.seal === false ? '' : `<svg class="pointer-events-none absolute -translate-x-1/2 overflow-visible drop-shadow-[0_.6px_1px_rgba(0,0,0,.45)] ${o.sealCls || ''}" viewBox="0 0 40 110" preserveAspectRatio="none" aria-hidden="true" focusable="false" style="left:${pc(g.x)};top:${pc(g.top)};width:${pc(g.sw)};height:${pc(g.sh)}"><use href="#vs-neck${o.torn ? '-torn' : ''}"/></svg>`;
    return `<span class="relative block aspect-[var(--ar)] shrink-0 ${o.cls || 'h-full'}" style="--ar:${p.size[0]} / ${p.size[1]}"><img class="block size-full object-contain select-none [-webkit-user-drag:none]" src="${esc(p.img)}" alt="${esc(o.alt || '')}" width="${p.size[0]}" height="${p.size[1]}" loading="${o.eager ? 'eager' : 'lazy'}" decoding="async" draggable="false">${seal}</span>`;
  }
  // kit: as garrafas lado a lado, a do meio maior e na frente
  function visual(p, o = {}) {
    if (!isKit(p)) return shot(p, o);
    const n = p.bottles.length;
    return `<span class="flex items-end justify-center ${o.cls || 'size-full'}">${p.bottles.map((b, k) => shot(b, { ...o, cls: k === 1 ? 'z-[1] -mx-[5%] h-full' : n === 2 ? '-mr-[3%] -ml-[5%] h-[96%]' : '-mx-[5%] h-[88%]' })).join('')}</span>`;
  }
  const badgeHTML = (p) => {
    const cls = 'absolute top-[9px] left-[9px] z-[2] rounded-[7px] px-2 py-[3px] text-[11px] font-bold';
    return isKit(p) ? `<span class="${cls} bg-sale text-white">-${pct(p)}% no kit</span>`
      : p.oldPrice ? `<span class="${cls} bg-sale text-white">-${pct(p)}%</span>`
        : p.badge ? `<span class="${cls} bg-white text-badge shadow-card">${esc(p.badge)}</span>` : '';
  };
  const priceHTML = (p) => `<div class="flex min-w-0 flex-col leading-[1.25]">
      ${p.oldPrice ? `<s class="text-[12px] text-fg-3">${money(p.oldPrice)}</s>` : ''}
      <span class="text-[18px] font-extrabold tracking-[-.02em] max-sm:text-[16px]">${money(p.price)}</span>
      <span class="text-[12px] font-semibold text-ok max-sm:text-[11px]">${money(pix(p.price))} no Pix</span>
    </div>`;

  /* ---------- botão + / seletor de quantidade (estilo apps de delivery) ---------- */
  const bag = new Map(Object.entries(store.get('bag', {})).filter(([id, q]) => byId[id] && q > 0));
  function ctaInner(id) {
    const q = bag.get(id) || 0, p = byId[id];
    if (!q) return `<button class="grid size-10 place-items-center rounded-xl bg-accent text-white shadow-[0_6px_14px_rgba(0,106,168,.3)] transition-[background-color,scale] duration-200 hover:bg-accent-hover active:scale-90 max-sm:size-9" type="button" data-add="${id}" aria-label="Adicionar ${esc(fullName(p))} à sacola">${icon('plus', 'size-5 stroke-[2.5]')}</button>`;
    const btn = 'grid h-10 w-8 place-items-center rounded-xl text-white hover:bg-white/14 max-sm:h-9 max-sm:w-7';
    return `<div class="inline-flex h-10 animate-[qtyIn_.35s_var(--ease-spring)] items-center rounded-xl bg-accent text-white shadow-[0_6px_14px_rgba(0,106,168,.3)] max-sm:h-9" role="group" aria-label="${esc(fullName(p))} na sacola">
      <button class="${btn}" type="button" data-dec="${id}" aria-label="Remover uma unidade">${icon(q === 1 ? 'close' : 'minus', 'size-4 stroke-[2.4]')}</button>
      <span class="min-w-4 text-center text-[15px] font-extrabold" aria-live="polite">${q}</span>
      <button class="${btn}" type="button" data-inc="${id}" aria-label="Adicionar uma unidade">${icon('plus', 'size-4 stroke-[2.4]')}</button>
    </div>`;
  }
  const cta = (id) => `<div class="relative z-[2] shrink-0" data-cta="${id}">${ctaInner(id)}</div>`;
  const refreshCTAs = (id) => $$(`[data-cta="${id}"]`).forEach((el) => { el.innerHTML = ctaInner(id); });

  function cardHTML(p, i = 0) {
    const kit = isKit(p);
    return `<article class="group/card relative flex min-w-0 animate-[cardIn_.5s_var(--ease-smooth)_calc(var(--i,0)*26ms)_both] cursor-pointer flex-col rounded-[18px] border border-surface-2 bg-white px-2 pt-2 pb-3.5 transition-[box-shadow,translate,border-color] duration-300 ease-smooth hover:-translate-y-0.5 hover:border-transparent hover:shadow-lift max-sm:rounded-2xl max-sm:px-1.5 max-sm:pt-1.5 max-sm:pb-3" data-card style="--i:${Math.min(i, 12)}">
      <div class="relative h-[232px] overflow-hidden rounded-[13px] ${MEDIA_BG} px-2.5 pt-[30px] pb-3 max-sm:h-[190px] max-sm:px-1.5 max-sm:pb-2.5">
        ${badgeHTML(p)}
        <span class="${SEAL_PILL}">${vsMark(SEAL_PILL_MARK)}${kit ? p.bottles.length + ' lacres' : 'Lacrado'}</span>
        <div class="flex h-full items-end justify-center transition-transform duration-[450ms] ease-smooth group-hover/card:-translate-y-1 group-hover/card:scale-[1.035]">${visual(p)}</div>
      </div>
      <div class="flex flex-1 flex-col px-1.5 pt-3 max-sm:px-1 max-sm:pt-2.5">
        <p class="text-[12px] font-semibold tracking-[.04em] text-fg-2 uppercase">${esc(kit ? `Kit · ${p.bottles.length} garrafas` : p.brand)}</p>
        <h3 class="mt-0.5 text-[16px] leading-[1.22] font-bold tracking-[-.02em] max-sm:text-[15px]"><button type="button" class="text-left tracking-[inherit] hover:text-accent" data-open="${p.id}">${esc(p.name)}</button></h3>
        <p class="mt-[3px] text-[13px] text-fg-2">${esc(kit ? kitGroups(p).map(([b, n]) => (n > 1 ? n + '× ' : '') + b.brand).join(' · ') : `${p.volume} · ${abv(p)}`)}</p>
        <div class="mt-auto flex items-end justify-between gap-2 pt-2.5">${priceHTML(p)}${cta(p.id)}</div>
      </div>
    </article>`;
  }

  /* ---------- camadas (sheets, sacola, checkout) ---------- */
  const stack = [];
  const body = document.body;
  function openLayer(el, focusEl) {
    if (stack.some((s) => s.el === el)) return;
    el.hidden = false;
    el.classList.remove('is-closing');
    stack.push({ el, ret: document.activeElement });
    body.classList.add('locked');
    requestAnimationFrame(() => {
      const f = focusEl || el.querySelector('[data-autofocus]') || el.querySelector('input:not([type=hidden]), select, textarea, button:not([data-close]), a[href]') || el.querySelector('button');
      if (f) f.focus({ preventScroll: true });
    });
    updateBagBar();
  }
  function closeLayer(el, { restoreFocus = true } = {}) {
    const i = stack.findIndex((s) => s.el === el);
    if (i < 0) return;
    const [{ ret }] = stack.splice(i, 1);
    el.classList.add('is-closing');
    setTimeout(() => { if (!stack.some((s) => s.el === el)) { el.hidden = true; el.classList.remove('is-closing'); } }, reduce ? 0 : 230);
    if (!stack.length) body.classList.remove('locked');
    if (restoreFocus && ret && document.contains(ret)) ret.focus({ preventScroll: true });
    if (el.id === 'checkoutSheet') coCleanup();
    updateBagBar();
  }
  document.addEventListener('click', (e) => {
    const c = e.target.closest('[data-close]');
    if (!c) return;
    const layer = c.closest('[data-layer]');
    if (layer) closeLayer(layer);
  });
  // mantém o foco dentro da camada aberta
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || !stack.length) return;
    const el = stack[stack.length - 1].el;
    const f = $$('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])', el).filter((x) => x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
    else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
  });

  /* ---------- toast ---------- */
  const toastEl = $('#toast');
  let toastT = 0;
  function hideToast() {
    toastEl.classList.add('is-out');
    setTimeout(() => { toastEl.hidden = true; toastEl.classList.remove('is-out'); }, 220);
  }
  function toast(msg, action, fn) {
    toastEl.innerHTML = `<span class="min-w-0">${esc(msg)}</span>${action ? `<button class="rounded-full bg-white/16 px-3.5 py-[7px] text-[13px] font-bold whitespace-nowrap text-white hover:bg-white/26" type="button">${esc(action)}</button>` : ''}`;
    toastEl.classList.remove('is-out');
    toastEl.hidden = false;
    if (action) toastEl.querySelector('button').addEventListener('click', () => { hideToast(); fn(); });
    clearTimeout(toastT);
    toastT = setTimeout(hideToast, 3800);
  }

  /* ---------- reveal ao rolar ---------- */
  safe('reveal', () => {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      io.unobserve(e.target);
    }), { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    $$('.reveal').forEach((el) => {
      const sibs = [...el.parentElement.children].filter((x) => x.classList.contains('reveal'));
      el.style.setProperty('--rd', (Math.min(sibs.indexOf(el), 6) * 0.06).toFixed(2) + 's');
      io.observe(el);
    });
  });

  /* ---------- verificação de idade ---------- */
  safe('age', () => {
    const gate = $('#ageGate');
    if (store.get('age', false)) return;
    gate.hidden = false;
    body.classList.add('locked');
    requestAnimationFrame(() => $('#ageYes').focus());
    $('#ageYes').addEventListener('click', () => {
      store.set('age', true);
      gate.classList.add('is-leaving');
      setTimeout(() => { gate.hidden = true; if (!stack.length) body.classList.remove('locked'); }, reduce ? 0 : 320);
    });
    $('#ageNo').addEventListener('click', () => { $('#ageAsk').hidden = true; $('#ageDenied').hidden = false; });
  });

  /* ============================================================
     ENDEREÇO / CEP — ViaCEP quando há conexão; prazo por região
     ============================================================ */
  let addr = store.get('addr', null);
  const fmtCep = (v) => { const d = String(v).replace(/\D/g, '').slice(0, 8); return d.length > 5 ? d.slice(0, 5) + '-' + d.slice(5) : d; };
  const etaFor = (cep) => { let h = 0; for (const c of cep.replace(/\D/g, '')) h = (h * 31 + +c) % 997; const min = 25 + (h % 4) * 5; return [min, min + 15]; };
  const etaText = (a) => `${a.eta[0]}–${a.eta[1]} min`;
  const arrival = (a) => hhmm(new Date(Date.now() + a.eta[1] * 60000));
  const placeLabel = (a) => a.bairro || a.city || a.cep;
  const cityUf = (a) => (a.city ? a.city + (a.uf ? '/' + a.uf : '') : '');

  async function lookupCep(value) {
    const d = String(value).replace(/\D/g, '');
    if (d.length !== 8) return { error: 'Digite os 8 números do CEP.' };
    if (/^(\d)\1{7}$/.test(d)) return { error: 'CEP inválido. Confira os números.' };
    try {
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), 4500);
      const r = await fetch(`https://viacep.com.br/ws/${d}/json/`, { signal: ctl.signal });
      clearTimeout(t);
      const j = await r.json();
      if (j.erro) return { error: 'Não encontramos esse CEP. Confira os números.' };
      return { cep: fmtCep(d), street: j.logradouro || '', bairro: j.bairro || '', city: j.localidade || '', uf: j.uf || '', eta: etaFor(d) };
    } catch {
      return { cep: fmtCep(d), street: '', bairro: '', city: '', uf: '', eta: etaFor(d), offline: true };
    }
  }
  const deliveryMsg = (a) => {
    const where = [a.bairro, cityUf(a)].filter(Boolean).join(', ');
    return `Entregamos${where ? ' em ' + where : ' no seu CEP'}: chega em ${etaText(a)} (até ${arrival(a)}).`;
  };
  function setAddr(a) { addr = a; store.set('addr', a); updateAddrUI(); }
  function updateAddrUI() {
    // no celular aparece só o bairro (ou "Seu CEP"); o prazo fica no bloco de entrega
    $('#locText').innerHTML = addr
      ? `<span>${esc(placeLabel(addr))}</span><span class="max-sm:hidden"> · ${etaText(addr)}</span>`
      : `<span class="max-sm:hidden">Informe seu CEP</span><span class="hidden max-sm:inline">Seu CEP</span>`;
    $('#locBtn').classList.toggle('has-cep', !!addr);
    $('#locBtn').setAttribute('aria-label', addr ? `Entrega em ${placeLabel(addr)}, ${etaText(addr)}. Alterar endereço` : 'Informar CEP de entrega');
    $('#helpEta').textContent = addr ? etaText(addr) : '30–60 min';
    const info = $('#heroCepInfo');
    if (addr) { info.textContent = deliveryMsg(addr); setState(info, 'ok'); $('#heroCep').value = addr.cep; }
    if (stack.some((s) => s.el.id === 'bagDrawer')) renderBag();
  }
  function maskCep(input) { input.addEventListener('input', () => { input.value = fmtCep(input.value); input.classList.remove('invalid'); }); }
  async function submitCep(input, info) {
    setState(info, '');
    info.textContent = 'Consultando o CEP…';
    const r = await lookupCep(input.value);
    if (r.error) {
      info.textContent = r.error; setState(info, 'err');
      input.classList.add('invalid'); input.focus();
      return null;
    }
    setAddr(r);
    info.textContent = deliveryMsg(r); setState(info, 'ok');
    return r;
  }

  safe('cep', () => {
    const heroIn = $('#heroCep'), addrIn = $('#addrCep');
    maskCep(heroIn); maskCep(addrIn);
    $('#heroCepForm').addEventListener('submit', (e) => { e.preventDefault(); submitCep(heroIn, $('#heroCepInfo')); });
    $('#addrForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const r = await submitCep(addrIn, $('#addrInfo'));
      if (r) setTimeout(() => closeLayer($('#addressSheet')), 1100);
    });
    updateAddrUI();
  });
  function openAddress() {
    const input = $('#addrCep'), info = $('#addrInfo');
    input.value = addr ? addr.cep : '';
    info.textContent = addr ? deliveryMsg(addr) : '';
    setState(info, addr ? 'ok' : '');
    openLayer($('#addressSheet'), input);
  }

  /* ============================================================
     BUSCA NA BARRA DO APP — resultados enquanto digita
     ============================================================ */
  const searchBox = $('#search'), searchInput = $('#searchInput'), searchPanel = $('#searchPanel');
  const searchResults = $('#searchResults'), searchLabel = $('#searchLabel');
  const POPULAR = ['Black Label', 'Tanqueray', 'Absolut', "Jack Daniel's", 'Gin', 'Kits'];
  function setSearch(open) {
    if (searchPanel.hidden === !open) return;
    searchPanel.hidden = !open;
    body.classList.toggle('menu-open', open);
    if (open) renderSearch(searchInput.value);
  }
  const closeMenus = () => setSearch(false);
  function renderSearch(q) {
    q = q.trim();
    if (!q) {
      searchLabel.textContent = 'Mais buscados';
      searchResults.innerHTML = `<li class="flex flex-wrap gap-2 px-1.5 pb-1.5">${POPULAR.map((t) => `<button type="button" class="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-[7px] text-[14px] font-medium hover:border-fg-3" data-term="${esc(t)}">${icon('search', 'size-3.5 text-fg-3')}${esc(t)}</button>`).join('')}</li>`;
      return;
    }
    const res = PRODUCTS.filter((p) => matches(p, q));
    searchLabel.textContent = res.length ? `${res.length} ${res.length === 1 ? 'resultado' : 'resultados'}` : `Nenhum resultado para “${q}”`;
    searchResults.innerHTML = res.slice(0, 6).map((p) => `<li><button type="button" class="flex w-full items-center gap-3 rounded-xl p-2 text-left text-fg hover:bg-surface focus-visible:bg-surface" data-open="${p.id}">
        <span class="flex h-[54px] w-11 shrink-0 items-end justify-center rounded-[10px] bg-tile px-0.5 py-1">${visual(p, { cls: isKit(p) ? 'h-full w-11' : '' })}</span>
        <span class="flex min-w-0 flex-1 flex-col"><b class="truncate text-[14px] font-semibold">${esc(fullName(p))}</b><small class="text-[12px] text-fg-2">${esc(isKit(p) ? meta(p) : `${p.volume} · lacre VeriSeal`)}</small></span>
        <span class="text-[14px] font-bold whitespace-nowrap">${money(p.price)}</span></button></li>`).join('')
      + (res.length > 6 ? `<li><button type="button" class="flex w-full items-center gap-3 rounded-xl p-2 text-left text-[14px] font-semibold text-accent hover:bg-surface" data-search-all="${esc(q)}">${icon('search', 'size-4')}Ver os ${res.length} resultados</button></li>` : '');
  }
  function searchAll(q) {
    closeMenus();
    searchInput.blur();
    setFilter({ cat: 'all', brand: null, q });
    $('#catalogo').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }
  safe('search', () => {
    searchInput.addEventListener('focus', () => setSearch(true));
    searchInput.addEventListener('input', () => { setSearch(true); renderSearch(searchInput.value); });
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); searchAll(searchInput.value.trim()); }
      if (e.key === 'ArrowDown') { const f = $('button', searchResults); if (f) { e.preventDefault(); f.focus(); } }
    });
    searchPanel.addEventListener('click', (e) => {
      const term = e.target.closest('[data-term]');
      if (term) { searchInput.value = term.dataset.term; renderSearch(term.dataset.term); searchInput.focus(); return; }
      const all = e.target.closest('[data-search-all]');
      if (all) searchAll(all.dataset.searchAll);
    });
    // fecha ao clicar fora ou quando o foco sai da busca
    document.addEventListener('pointerdown', (e) => { if (!searchPanel.hidden && !e.target.closest('#search')) setSearch(false); });
    searchBox.addEventListener('focusout', (e) => { if (!e.relatedTarget || !searchBox.contains(e.relatedTarget)) setTimeout(() => { if (!searchBox.contains(document.activeElement)) setSearch(false); }, 0); });
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (!searchPanel.hidden) { setSearch(false); searchInput.focus(); return; }
      if (stack.length) closeLayer(stack[stack.length - 1].el);
    });
  });

  /* ============================================================
     DESTAQUES — carrossel com as fotos de ambiente
     ============================================================ */
  // bg: fundo do slide · img: recorte da foto · shade: sombra que garante a leitura do texto
  const SLIDES = [
    {
      id: 'absolut-1l', photo: 'assets/photos/absolut-party.webp',
      alt: 'Garrafa de Absolut Vodka numa mesa de festa, entre um gin tônica e um espresso martini',
      eyebrow: 'Oferta da semana', title: 'Sexta pede Absolut.',
      sub: 'Absolut Vodka 1 L, original e lacrada, na sua porta em até 60 minutos.',
      bg: 'bg-[radial-gradient(ellipse_70%_90%_at_15%_30%,#16336e_0%,#0a1b40_55%,#050d22_100%)]',
      img: 'w-[64%] object-[50%_42%] [mask-image:linear-gradient(90deg,transparent_0,#000_30%)] max-sm:object-[50%_36%]',
      shade: 'after:bg-[linear-gradient(90deg,rgba(5,13,34,.78)_0%,rgba(5,13,34,.45)_36%,transparent_58%)] max-sm:after:bg-[linear-gradient(180deg,transparent_34%,rgba(5,13,34,.75)_50%,#050d22_62%)]'
    },
    {
      id: 'tanqueray', photo: 'assets/photos/tanqueray-gt.webp',
      alt: 'Garrafa de Tanqueray London Dry ao lado de uma taça de gin tônica com limão',
      eyebrow: 'Gin tônica perfeito', title: (p) => `Tanqueray com ${pct(p)}% off.`,
      sub: 'O London Dry do gin tônica clássico, com lacre VeriSeal conferido no envio.',
      bg: 'bg-[radial-gradient(ellipse_60%_90%_at_20%_40%,#0f5a38_0%,#073522_60%,#04231a_100%)]',
      img: 'w-[60%] object-[34%_50%] [mask-image:linear-gradient(90deg,transparent_0,#000_26%)] max-sm:object-[30%_40%]',
      shade: 'after:bg-[linear-gradient(90deg,rgba(4,35,26,.78)_0%,rgba(4,35,26,.45)_36%,transparent_58%)] max-sm:after:bg-[linear-gradient(180deg,transparent_34%,rgba(4,35,26,.75)_50%,#04231a_62%)]'
    },
    {
      id: 'kit-jack-trio', bottles: ['jack-apple', 'jack-7', 'jack-fire'],
      eyebrow: 'Kit mais pedido', title: "Família Jack Daniel's.",
      sub: 'Old No.7, Apple e Fire: três garrafas, três lacres, uma entrega.',
      bg: 'bg-[radial-gradient(ellipse_46%_70%_at_74%_70%,#8a4512_0%,#44200a_42%,#170a03_100%)]',
      copy: 'max-w-[min(430px,52%)]',
      shade: 'after:bg-[linear-gradient(90deg,rgba(23,10,3,.85)_0%,rgba(23,10,3,.5)_38%,transparent_60%)] max-sm:after:bg-[linear-gradient(180deg,transparent_40%,rgba(23,10,3,.85)_64%)]'
    }
  ];
  // --o e --a vêm do JS: o slide anda o banner inteiro, a foto anda menos (parallax) e o texto some antes
  const PARALLAX = '[translate:calc(var(--o,0)*var(--pw)*-.42)_0] [scale:calc(1_+_var(--a,0)*.07)] will-change-transform';
  const FADE_OUT = '[translate:calc(var(--o,0)*var(--pw)*.14)_0] opacity-[calc(1_-_var(--a,0)*1.6)] will-change-[transform,opacity]';
  function slideHTML(s, i, n) {
    const p = byId[s.id];
    // sem loading="lazy": os slides ficam fora da tela até a troca, e a foto não pode chegar atrasada
    return `<article class="relative col-start-1 row-start-1 flex min-w-0 items-center overflow-hidden text-white backface-hidden will-change-transform [transform:translate3d(calc(var(--o,0)*100%),0,0)] before:pointer-events-none before:absolute before:inset-0 before:z-[3] before:bg-[#01050d] before:opacity-[calc(var(--a,0)*.5)] before:will-change-[opacity] after:pointer-events-none after:absolute after:inset-0 after:z-[1] max-sm:items-end ${s.bg} ${s.shade}" role="group" aria-roledescription="slide" aria-label="${i + 1} de ${n}">
      ${s.photo ? `<img class="absolute inset-0 left-auto h-full object-cover [-webkit-user-drag:none] max-sm:h-[58%] max-sm:w-full max-sm:[mask-image:linear-gradient(180deg,#000_60%,transparent)] ${PARALLAX} ${s.img}" src="${s.photo}" alt="${esc(s.alt)}" fetchpriority="${i ? 'low' : 'high'}" decoding="async" draggable="false">` : ''}
      ${s.bottles ? `<div class="absolute right-[6%] -bottom-[4%] z-[1] flex h-[92%] items-end max-sm:top-[5%] max-sm:right-1/2 max-sm:bottom-auto max-sm:h-[46%] max-sm:[transform:translateX(50%)] ${PARALLAX}" aria-hidden="true">${s.bottles.map((id, k) => shot(byId[id], { eager: true, cls: (k === 1 ? 'z-[1] h-full' : 'h-[88%]') + ' -mx-[1.6%] drop-shadow-[0_24px_30px_rgba(0,0,0,.55)]' })).join('')}</div>` : ''}
      <div class="relative z-[2] px-12 pb-[54px] max-sm:px-[22px] max-sm:pb-16 ${s.copy || 'max-w-[min(470px,54%)] max-sm:max-w-none'} ${FADE_OUT}">
        <p class="mb-3.5 inline-flex items-center rounded-full bg-white/18 px-[11px] py-[5px] text-[12px] font-bold tracking-[.04em] uppercase">${esc(s.eyebrow)}</p>
        <h2 class="text-[clamp(32px,3.8vw,50px)] leading-none font-extrabold tracking-[-.04em] text-balance max-sm:text-[32px]">${esc(typeof s.title === 'function' ? s.title(p) : s.title)}</h2>
        <p class="mt-3 max-w-[380px] text-[16px] leading-[1.45] text-white/84 max-sm:text-[15px]">${esc(s.sub)}</p>
        <p class="mt-4 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">${p.oldPrice ? `<s class="text-[15px] text-white/62">${money(p.oldPrice)}</s>` : ''}<b class="text-[32px] leading-none font-extrabold tracking-[-.03em] max-sm:text-[26px]">${money(p.price)}</b><span class="text-[14px] font-semibold text-[#8ef5b0]">${money(pix(p.price))} no Pix</span></p>
        <div class="mt-5 flex flex-wrap items-center gap-3.5">
          <button class="btn btn-light" type="button" data-add="${p.id}" aria-label="Adicionar ${esc(fullName(p))} à sacola">${icon('plus')}Adicionar</button>
          <button class="inline-flex items-center gap-1 py-2 text-[15px] font-semibold text-white hover:underline" type="button" data-open="${p.id}">Ver detalhes ${icon('chev-r', 'size-4 stroke-[2.2]')}</button>
        </div>
      </div>
      <span class="absolute top-[18px] right-[18px] z-[2] inline-flex items-center gap-[7px] rounded-full bg-navy-ink/50 py-1.5 pr-3 pl-[9px] text-[12px] font-bold shadow-[inset_0_0_0_1px_rgba(255,255,255,.18)] backdrop-blur-[10px] max-sm:top-3 max-sm:right-3 max-sm:text-[11px] ${FADE_OUT}">${vsMark('w-[22px] [--lg-ink:#fff]')}Lacre VeriSeal</span>
    </article>`;
  }
  // curva cubic-bezier do CSS, para animar em JS com a mesma sensação das transições
  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const fx = (t) => ((ax * t + bx) * t + cx) * t, dx = (t) => (3 * ax * t + 2 * bx) * t + cx;
    return (x) => {
      if (x <= 0 || x >= 1) return clamp(x, 0, 1);
      let t = x;
      for (let k = 0; k < 6; k++) { const e = fx(t) - x, d = dx(t); if (Math.abs(e) < 1e-5 || Math.abs(d) < 1e-6) break; t -= e / d; }
      if (Math.abs(fx(t) - x) > 1e-4) {   // Newton não convergiu: bissecção
        let lo = 0, hi = 1; t = x;
        for (let k = 0; k < 24; k++) { if (fx(t) < x) lo = t; else hi = t; t = (lo + hi) / 2; }
      }
      return ((ay * t + by) * t + cy) * t;
    };
  }
  /* Carrossel circular movido por transform (GPU), sem rolagem nativa: do último destaque segue para o
     primeiro sem rebobinar. Cada slide recebe --o, a distância até a posição atual (-1 saindo pela
     esquerda, 1 entrando pela direita), e --a = |o|; o CSS desliza o slide e faz o parallax da foto e do
     texto. O dedo (ou o mouse) arrasta 1:1 e, ao soltar, a velocidade do gesto decide o destino. A barrinha
     do ponto ativo mostra o tempo até o próximo destaque e para quando o mouse ou o foco está no banner. */
  safe('promo', () => {
    const promo = $('#promo'), track = $('#promoTrack'), dotsEl = $('#promoDots');
    const N = SLIDES.length;
    track.innerHTML = SLIDES.map((s, i) => slideHTML(s, i, N)).join('');
    // a barrinha do ponto ativo enche no tempo do destaque (dotFill); quando termina, o JS passa para o próximo
    dotsEl.innerHTML = SLIDES.map((s, i) => `<button class="group grid h-[30px] place-items-center px-2" type="button" data-dot="${i}" aria-label="Ver destaque ${i + 1}"><i class="relative block size-2 overflow-hidden rounded-[99px] bg-white/45 [transition:width_.5s_var(--ease-smooth),background-color_.3s] after:absolute after:inset-0 after:origin-left after:bg-white after:[transform:scaleX(0)] group-hover:bg-white/70 group-aria-[current=true]:w-[30px] group-aria-[current=true]:bg-white/30 group-aria-[current=true]:after:[transform:none] [.is-auto_[aria-current=true]_&]:after:animate-[dotFill_6.5s_linear_both] [.is-held_&]:after:[animation-play-state:paused]"></i></button>`).join('');
    const slides = [...track.children], dots = $$('[data-dot]', dotsEl);
    $$('img', track).forEach((img) => img.decode?.().catch(() => { }));   // já decodificadas na primeira troca

    const wrap = (d) => ((d % N) + N * 1.5) % N - N / 2;   // distância circular, em [-N/2, N/2)
    const idx = (g) => ((g % N) + N) % N;
    const easeAuto = bezier(.65, 0, .3, 1), easeTap = bezier(.25, .8, .25, 1), easeFling = bezier(.15, .6, .3, 1);
    let pos = 0, goal = 0, cur = -1, raf = 0;

    const paint = () => slides.forEach((s, i) => {
      const o = wrap(i - pos);
      s.style.setProperty('--o', o.toFixed(4));
      s.style.setProperty('--a', Math.min(1, Math.abs(o)).toFixed(4));
    });
    function tween(dur, ease) {
      cancelAnimationFrame(raf);
      const from = pos, to = goal, t0 = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - t0) / dur);
        pos = from + (to - from) * ease(t);
        if (t < 1) raf = requestAnimationFrame(tick);
        else { raf = 0; pos = goal = idx(goal); }   // normaliza: a posição não cresce sem fim
        paint();
      };
      raf = requestAnimationFrame(tick);
    }
    // how: 'auto' (tempo esgotado), 'tap' (setas, pontos, teclado) ou 'fling' (soltou o arraste, v em px/ms)
    function go(g, how = 'tap', v = 0) {
      goal = g;
      setCurrent(idx(g), how);
      if (reduce) { cancelAnimationFrame(raf); raf = 0; pos = goal = idx(goal); paint(); return; }
      const dist = Math.abs(goal - pos);
      if (how === 'auto') tween(1050, easeAuto);
      else if (how === 'fling') tween(clamp(4 * dist * promo.clientWidth / Math.max(Math.abs(v), .001), 260, 650), easeFling);
      else tween(clamp(560 + dist * 240, 560, 900), easeTap);
    }
    const step = (d, how) => go(goal + d, how);
    const show = (i) => go(goal + wrap(i - idx(goal)));

    /* ---- tempo de cada destaque: a animação da barrinha do ponto ativo (6,5 s) ---- */
    const auto = !reduce;
    const holds = new Set();
    const hold = (why, on) => { holds[on ? 'add' : 'delete'](why); promo.classList.toggle('is-held', holds.size > 0); };
    const restartClock = () => { if (!auto) return; promo.classList.remove('is-auto'); void promo.offsetWidth; promo.classList.add('is-auto'); };
    dotsEl.addEventListener('animationend', (e) => { if (e.animationName === 'dotFill') step(1, 'auto'); });
    function setCurrent(i, how) {
      track.setAttribute('aria-live', how === 'auto' ? 'off' : 'polite');
      if (i !== cur) {
        cur = i;
        dots.forEach((d, k) => d.setAttribute('aria-current', String(k === i)));
        slides.forEach((s, k) => { s.inert = k !== i; });
      }
      restartClock();
    }

    /* ---- arrastar com o dedo ou o mouse ---- */
    let drag = null, dragged = false;
    promo.addEventListener('pointerdown', (e) => {
      if ((e.pointerType === 'mouse' && e.button !== 0) || e.target.closest('[data-promo-ui]')) return;
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, on: false, p0: pos, w: promo.clientWidth, s: [] };
    });
    promo.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.on) {
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (Math.hypot(dx, dy) < 8) return;
        if (Math.abs(dy) > Math.abs(dx)) { drag = null; return; }   // gesto vertical: é a página rolando
        drag.on = true; drag.x = e.clientX; drag.p0 = pos;           // segue o dedo daqui em diante, sem salto
        cancelAnimationFrame(raf); raf = 0;
        try { promo.setPointerCapture(e.pointerId); } catch { /* ponteiro já liberado */ }
        promo.classList.add('is-dragging'); hold('drag', true);
      }
      pos = drag.p0 - (e.clientX - drag.x) / drag.w;
      paint();
      drag.s.push([e.timeStamp, e.clientX]);
      if (drag.s.length > 6) drag.s.shift();
    });
    const release = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag; drag = null;
      if (!d.on) return;
      promo.classList.remove('is-dragging'); hold('drag', false);
      dragged = true; setTimeout(() => { dragged = false; }, 60);   // o clique que vem junto com o soltar não vale
      // velocidade dos últimos ~100 ms (se o dedo parou antes de soltar, é zero)
      const s = d.s.filter(([t]) => e.timeStamp - t < 100);
      const v = s.length > 1 ? (s[s.length - 1][1] - s[0][1]) / Math.max(1, s[s.length - 1][0] - s[0][0]) : 0;
      const g = Math.abs(v) > .25 ? (v < 0 ? Math.floor(pos) + 1 : Math.ceil(pos) - 1) : Math.round(pos);
      go(g, 'fling', v);
    };
    promo.addEventListener('pointerup', release);
    promo.addEventListener('pointercancel', release);
    promo.addEventListener('click', (e) => { if (dragged) { e.preventDefault(); e.stopPropagation(); } }, true);
    promo.addEventListener('dragstart', (e) => e.preventDefault());

    /* ---- setas, pontos e teclado ---- */
    $$('[data-promo]', promo).forEach((b) => b.addEventListener('click', () => step(+b.dataset.promo)));
    dotsEl.addEventListener('click', (e) => { const d = e.target.closest('[data-dot]'); if (d) show(+d.dataset.dot); });
    promo.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault(); step(e.key === 'ArrowRight' ? 1 : -1);
    });

    /* ---- pausa: mouse em cima, foco do teclado, fora da tela ou aba escondida ---- */
    promo.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hold('hover', true); });
    promo.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') hold('hover', false); });
    promo.addEventListener('focusin', (e) => { if (e.target.matches(':focus-visible')) hold('focus', true); });
    promo.addEventListener('focusout', (e) => { if (!promo.contains(e.relatedTarget)) hold('focus', false); });
    new IntersectionObserver(([e]) => hold('view', !e.isIntersecting)).observe(promo);
    document.addEventListener('visibilitychange', () => hold('tab', document.hidden));
    // largura do banner em px, para o parallax andar na mesma escala em qualquer tela
    new ResizeObserver(() => promo.style.setProperty('--pw', promo.clientWidth + 'px')).observe(promo);

    paint(); setCurrent(0, 'auto');
  });

  // garrafas das animações de verificação: fotos com bordas limpas, que ficam bem no fundo escuro
  const DEMO = 'jack-7', CARD = 'tanqueray';

  /* ---------- cartão VeriSeal do topo: encostou o celular, o navegador já mostra o resultado ---------- */
  const APP_TINTS = [['#9ad7ff', '#2f8cff'], ['#7ee7c7', '#2bb67d'], ['#ffb86b', '#ff6b6b'], ['#ffe58a', '#f4b400'], ['#b7a6ff', '#6c5ce7'], ['#ff9ac4', '#e84393'], ['#c4f08a', '#62b33a'], ['#e6e9ef', '#aab3c2']];
  safe('vsCard', () => {
    const p = byId[CARD], g = sealGeo(p);
    const stage = $('#vcStage');
    const ring = (anim) => `<i class="absolute -top-10 -left-10 size-20 rounded-full border-2 border-cyan opacity-0 ${anim}"></i>`;
    const screen = 'absolute inset-0 flex flex-col items-center text-center opacity-0';
    stage.innerHTML = `
      <div class="absolute -top-[2%] left-[2%] h-[64%] w-[76%] bg-[radial-gradient(closest-side,rgba(95,208,255,.5),rgba(3,173,249,.16)_58%,transparent)] blur-[8px]"></div>
      <div class="absolute top-[calc(31%_-_var(--nfc)*var(--bh))] left-[14%] aspect-[var(--ar)] h-(--bh) drop-shadow-[0_30px_40px_rgba(0,0,0,.5)] [--bh:560px] max-md:left-[24%] max-sm:left-[9%] max-sm:[--bh:520px]" style="--nfc:${g.nfc.toFixed(4)};--ar:${p.size[0]} / ${p.size[1]}">${shot(p, { eager: true, sealCls: 'animate-[vcGlow_7s_var(--ease-smooth)_infinite]' })}
        <span class="absolute top-[calc(var(--nfc)*100%)] left-1/2 size-0 animate-[vcRead_7s_linear_infinite]">${ring('animate-[ring_1.2s_var(--ease-smooth)_infinite]')}${ring('animate-[ring_1.2s_var(--ease-smooth)_.4s_infinite]')}${ring('animate-[ring_1.2s_var(--ease-smooth)_.8s_infinite]')}</span>
        <span class="absolute top-[calc(var(--nfc)*100%_+_44px)] -left-[6%] z-[2] inline-flex animate-[vcOk_7s_var(--ease-smooth)_infinite] items-center gap-1.5 rounded-full bg-white py-[7px] pr-3 pl-2 text-[12px] font-bold whitespace-nowrap text-ok opacity-0 shadow-[0_12px_28px_rgba(0,0,0,.35)] motion-reduce:opacity-100! motion-reduce:[transform:none]! max-sm:hidden">${icon('check', 'box-content size-[15px] rounded-full bg-ok-fill p-0.5 stroke-[2.6] text-white')}Original · lacre íntegro</span>
      </div>
      <div class="absolute top-[calc(31%_-_104px)] right-[26px] h-[210px] w-[104px] animate-[vcPhone_7s_var(--ease-smooth)_infinite] rounded-[22px] bg-[linear-gradient(145deg,#2b313b,#0b0e13_40%,#1f242c)] p-[5px] shadow-[inset_0_0_0_1.5px_rgba(255,255,255,.14),0_26px_40px_-18px_rgba(0,0,0,.7)] max-md:right-[22%] max-sm:right-[22px]"><div class="relative h-full overflow-hidden rounded-[17px] bg-[#f5f8fc] text-ink before:absolute before:top-1.5 before:left-1/2 before:z-[2] before:h-[9px] before:w-[34%] before:-translate-x-1/2 before:rounded-[9px] before:bg-[#05070a]">
        <span class="${screen} animate-[vcHome_7s_var(--ease-smooth)_infinite] bg-[radial-gradient(120%_70%_at_20%_0%,#2f6fd0,transparent_60%),linear-gradient(160deg,#0b2a66,#041330_70%)] pt-[30px] text-white motion-reduce:opacity-0!"><b class="text-[24px] leading-none font-semibold tracking-[-.03em]">${hhmm(new Date())}</b><span class="mt-4 grid grid-cols-[repeat(4,15px)] gap-[7px]">${APP_TINTS.map(([a, b]) => `<i class="size-[15px] rounded-[4px]" style="background:linear-gradient(135deg,${a},${b})"></i>`).join('')}</span></span>
        <span class="${screen} animate-[vcWeb_7s_var(--ease-smooth)_infinite] gap-[3px] bg-[#f5f8fc] bg-[radial-gradient(90px_70px_at_50%_38%,rgba(20,166,74,.14),transparent_70%)] pt-10 motion-reduce:opacity-100! motion-reduce:[transform:none]!"><span class="absolute inset-x-[7px] top-[19px] flex h-[13px] items-center justify-center gap-[3px] rounded-[5px] bg-[#e6ebf2] text-[7px] font-semibold text-[#3a4250]">${icon('lock', 'size-[7px] stroke-[2.6]')}${esc(SITE_HOST)}</span>${medal('ok', 'loop', '50px', 'mt-2.5 mb-2')}<b class="text-[14px] leading-[1.1] font-extrabold tracking-[-.02em] text-[#0f8a3c]">Autêntico</b><small class="text-[9.5px] text-fg-2">Nunca aberta</small></span>
      </div></div>`;
    // a animação só roda com o cartão na tela
    new IntersectionObserver(([e]) => stage.classList.toggle('is-paused', !e.isIntersecting)).observe(stage);
  });

  /* ============================================================
     CATEGORIAS, OFERTAS, MAIS PEDIDOS E KITS
     ============================================================ */
  safe('categories', () => {
    const photo = 'items-start justify-center bg-[radial-gradient(ellipse_60%_30%_at_50%_100%,rgba(0,0,0,.08),transparent_70%)] bg-(--tint)';
    const lift = 'mt-[12%] h-[150%] transition-transform duration-[450ms] ease-smooth group-hover/cat:-translate-y-1.5 group-hover/cat:-rotate-4';
    const tiles = [
      { go: 'ofertas', name: 'Ofertas', cls: 'flex-col items-center justify-center gap-0.5 bg-[linear-gradient(150deg,#ff5a4e,#d6191f)] text-white', html: `<span>${icon('tag', 'inline size-[34px] align-baseline stroke-[1.8]')}</span><span class="text-[20px] font-extrabold tracking-[-.03em]">-${Math.max(...PRODUCTS.map(pct))}%</span>` },
      ...CATS.map((c) => { const p = byId[c.icon]; return { go: c.id, name: c.name, cls: photo, tint: c.tint, html: p ? visual(p, { cls: (isKit(p) ? 'w-[130%] ' : '') + lift }) : '' }; }),
      { go: 'verificar', name: 'Verificar lacre', cls: 'flex-col items-center justify-center gap-1.5 bg-[radial-gradient(ellipse_at_70%_20%,#0c4a99,var(--color-navy)_50%,var(--color-navy-ink))] text-cyan', html: `<span>${icon('contactless', 'inline size-[38px] align-baseline stroke-[1.8]')}</span>${vsMark('w-[34px] [--lg-ink:#fff]')}` }
    ];
    $('#catRow').innerHTML = tiles.map((t) => `<button class="group/cat flex min-w-0 flex-col items-center gap-2" type="button" data-cat-go="${t.go}">
        <span class="relative flex aspect-square w-full overflow-hidden rounded-[22px] transition-[translate,box-shadow] duration-[350ms] ease-smooth group-hover/cat:-translate-y-[3px] group-hover/cat:shadow-lift max-sm:rounded-[18px] ${t.cls}"${t.tint ? ` style="--tint:${t.tint}"` : ''}>${t.html}</span><span class="text-[14px] font-bold tracking-[-.01em] group-hover/cat:text-accent max-sm:text-[13px]">${esc(t.name)}</span></button>`).join('');
    $('#catRow').addEventListener('click', (e) => {
      const b = e.target.closest('[data-cat-go]');
      if (!b) return;
      const go = b.dataset.catGo;
      if (go === 'ofertas' || go === 'verificar') { $('#' + go).scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); return; }
      setFilter({ cat: go, brand: null, q: '' });
      $('#catalogo').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  safe('rails', () => {
    $('#offersRail').innerHTML = PRODUCTS.filter((p) => p.oldPrice && !isKit(p)).sort((a, b) => pct(b) - pct(a)).map(cardHTML).join('');
    $('#topRail').innerHTML = PRODUCTS.filter((p) => p.featured).map(cardHTML).join('');
    const update = (r) => {
      const [prev, next] = $$(`[data-rail="${r.id}"]`);
      if (!prev) return;
      const max = r.scrollWidth - r.clientWidth - 2;
      prev.disabled = r.scrollLeft <= 2;
      next.disabled = r.scrollLeft >= max;
    };
    $$('[data-rail]').forEach((btn) => btn.addEventListener('click', () => {
      const r = $('#' + btn.dataset.rail), card = r.firstElementChild;
      r.scrollBy({ left: +btn.dataset.dir * (card ? card.offsetWidth + 16 : 240) * 2, behavior: reduce ? 'auto' : 'smooth' });
    }));
    $$('#offersRail, #topRail').forEach((r) => { r.addEventListener('scroll', () => update(r), { passive: true }); addEventListener('resize', () => update(r)); update(r); });

    // contagem regressiva das ofertas até domingo 23:59:59
    const end = (() => {
      const d = new Date();
      const e = new Date(d.getFullYear(), d.getMonth(), d.getDate() + ((7 - d.getDay()) % 7), 23, 59, 59);
      if (e <= d) e.setDate(e.getDate() + 7);
      return e;
    })();
    const el = Object.fromEntries($$('[data-cd]').map((b) => [b.dataset.cd, b]));
    const pad = (n) => String(n).padStart(2, '0');
    const tick = () => {
      const s = Math.max(0, Math.floor((end - Date.now()) / 1000));
      el.d.textContent = Math.floor(s / 86400);
      el.h.textContent = pad(Math.floor((s % 86400) / 3600));
      el.m.textContent = pad(Math.floor((s % 3600) / 60));
      el.s.textContent = pad(s % 60);
    };
    tick(); setInterval(tick, 1000);
  });

  safe('kits', () => {
    $('#kitGrid').innerHTML = PRODUCTS.filter(isKit).map((p) => `<article class="group/card relative grid cursor-pointer grid-cols-[minmax(0,.95fr)_minmax(0,1.05fr)] gap-1 overflow-hidden rounded-[20px] border border-surface-2 bg-white p-2 transition-[box-shadow,translate,border-color] duration-300 ease-smooth hover:-translate-y-0.5 hover:border-transparent hover:shadow-lift max-sm:grid-cols-[1fr_1.1fr] max-xs:grid-cols-1" data-card>
        <div class="relative h-[250px] overflow-hidden rounded-[14px] bg-[radial-gradient(ellipse_60%_9%_at_50%_93%,rgba(4,37,85,.2),transparent_72%),linear-gradient(180deg,#f6f8fb,#e9eef5)] px-2 pt-[34px] pb-3 max-sm:h-[220px]">${badgeHTML(p)}<span class="${SEAL_PILL}">${vsMark(SEAL_PILL_MARK)}${p.bottles.length} lacres</span><div class="flex h-full items-end justify-center transition-transform duration-[450ms] ease-smooth group-hover/card:-translate-y-1 group-hover/card:scale-[1.03]">${visual(p)}</div></div>
        <div class="flex min-w-0 flex-col pt-3 pr-2.5 pb-2 pl-3">
          <p class="text-[12px] font-bold text-badge">${esc(p.badge || 'Kit')}</p>
          <h3 class="mt-0.5 text-[20px] leading-[1.15] font-extrabold tracking-[-.025em] max-sm:text-[18px]"><button type="button" class="text-left tracking-[inherit] hover:text-accent" data-open="${p.id}">${esc(p.name)}</button></h3>
          <ul class="mt-2.5 grid gap-1">${kitGroups(p).map(([b, n]) => `<li class="flex justify-between gap-2.5 border-b border-surface-2 pb-1 text-[13px]"><span>${n > 1 ? n + '× ' : ''}${esc(b.brand)} ${esc(b.name)}</span><small class="text-[length:smaller] whitespace-nowrap text-fg-2">${esc(b.volume)}</small></li>`).join('')}</ul>
          <div class="mt-auto flex items-end justify-between gap-2 pt-2.5">${priceHTML(p)}${cta(p.id)}</div>
        </div>
      </article>`).join('');
    const k = byId['kit-tanqueray-3'];
    if (k) $('#kitBannerBtn').textContent = `Kit Tanqueray 3 garrafas · ${money(k.price)}`;
  });

  /* ============================================================
     CATÁLOGO — categorias, marcas, busca e ordenação
     ============================================================ */
  const filter = { cat: 'all', brand: null, q: '', sort: 'relevance' };
  const catFilter = $('#catFilter'), brandRow = $('#brandRow'), grid = $('#productGrid');
  const catalogSearch = $('#catalogSearch'), sortSelect = $('#sortSelect');
  function renderChips() {
    catFilter.innerHTML = [{ id: 'all', name: 'Todas' }, ...CATS].map((c) =>
      `<button class="shrink-0 rounded-full border border-line bg-white px-4 py-2 text-[14px] font-semibold text-fg transition-colors duration-200 hover:border-fg-3 aria-pressed:border-navy aria-pressed:bg-navy aria-pressed:text-white" type="button" data-chip="${c.id}" aria-pressed="${filter.cat === c.id}">${esc(c.name)}</button>`).join('');
  }
  function renderBrands() {
    const brands = filter.cat === 'all' || filter.cat === 'kits' ? [] : [...new Set(PRODUCTS.filter((p) => p.category === filter.cat).map((p) => p.brand))];
    brandRow.hidden = brands.length < 2;
    if (brandRow.hidden) { brandRow.innerHTML = ''; return; }
    brandRow.innerHTML = `<span class="mr-1 text-[14px] text-fg-2">Marcas:</span>` + [null, ...brands].map((b) =>
      `<button class="border-b-2 border-transparent py-1 text-[14px] font-bold tracking-[-.01em] text-fg-3 transition-colors duration-200 hover:text-fg aria-pressed:border-accent aria-pressed:text-accent" type="button" data-brand="${esc(b || '')}" aria-pressed="${filter.brand === b}">${esc(b || 'Todas')}</button>`).join('');
  }
  function listProducts() {
    const arr = PRODUCTS.filter((p) => (filter.cat === 'all' || p.category === filter.cat)
      && (!filter.brand || p.brand === filter.brand) && (!filter.q || matches(p, filter.q)));
    const by = {
      'price-asc': (a, b) => a.price - b.price,
      'price-desc': (a, b) => b.price - a.price,
      discount: (a, b) => pct(b) - pct(a),
      name: (a, b) => fullName(a).localeCompare(fullName(b), 'pt-BR')
    }[filter.sort];
    return by ? arr.sort(by) : arr;
  }
  function renderCatalog() {
    const arr = listProducts();
    grid.innerHTML = arr.map(cardHTML).join('');
    const n = arr.length;
    $('#resultCount').textContent = `${n} ${n === 1 ? 'item' : 'itens'}${filter.cat !== 'all' ? ' em ' + catName[filter.cat] : ''}${filter.brand ? ' · ' + filter.brand : ''}${filter.q ? ` para “${filter.q}”` : ''}`;
    $('#emptyState').hidden = n > 0;
  }
  function setFilter(patch) {
    if ('cat' in patch && !('brand' in patch)) patch.brand = null;
    Object.assign(filter, patch);
    if (catalogSearch.value !== filter.q) catalogSearch.value = filter.q;
    renderChips(); renderBrands(); renderCatalog();
  }
  safe('catalog', () => {
    catFilter.addEventListener('click', (e) => { const b = e.target.closest('[data-chip]'); if (b) setFilter({ cat: b.dataset.chip }); });
    brandRow.addEventListener('click', (e) => { const b = e.target.closest('[data-brand]'); if (b) setFilter({ brand: b.dataset.brand || null }); });
    let t = 0;
    catalogSearch.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => setFilter({ q: catalogSearch.value.trim() }), 160); });
    sortSelect.addEventListener('change', () => setFilter({ sort: sortSelect.value }));
    $('#clearFilters').addEventListener('click', () => { sortSelect.value = 'relevance'; setFilter({ cat: 'all', brand: null, q: '', sort: 'relevance' }); });
    setFilter({});
  });

  /* ============================================================
     SACOLA
     ============================================================ */
  const bagCount = () => [...bag.values()].reduce((a, b) => a + b, 0);
  const subtotal = () => [...bag].reduce((s, [id, q]) => s + byId[id].price * q, 0);
  const shipping = (sub) => (sub >= FREE_SHIP || sub === 0 ? 0 : SHIP_FEE);
  const saveBag = () => store.set('bag', Object.fromEntries(bag));

  function setQty(id, q) {
    q = clamp(q, 0, MAX_QTY);
    if (q) bag.set(id, q); else bag.delete(id);
    saveBag();
    refreshCTAs(id);
    updateBagUI();
  }
  function addToBag(id, n = 1, { notify = true } = {}) {
    const before = bag.get(id) || 0;
    if (before + n > MAX_QTY) { toast(`Máximo de ${MAX_QTY} unidades por item.`); return false; }
    setQty(id, before + n);
    const c = $('#bagCount');
    c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
    if (notify) toast(`${fullName(byId[id])} na sacola${n > 1 ? ` (${n})` : ''}`, 'Ver sacola', openBag);
    return true;
  }
  function updateBagUI() {
    const n = bagCount(), c = $('#bagCount');
    c.hidden = !n; c.textContent = n;
    $('#bagTotal').textContent = n ? money(subtotal()) : 'Sacola';
    $('#bagBtn').classList.toggle('has-items', n > 0);
    $('#bagBtn').setAttribute('aria-label', n ? `Sacola de compras, ${n} ${n === 1 ? 'item' : 'itens'}, ${money(subtotal())}` : 'Sacola de compras');
    $('#bagBarCount').textContent = n;
    $('#bagBarTotal').textContent = money(subtotal());
    updateBagBar();
    if (stack.some((s) => s.el.id === 'bagDrawer')) renderBag();
  }
  function updateBagBar() {
    const show = bagCount() > 0 && !stack.length;
    $('#bagBar').hidden = !show;
    body.classList.toggle('has-bagbar', show);
  }
  function bagItemHTML(p, q) {
    const btn = 'grid h-full w-8 place-items-center rounded-[50%] text-[17px] text-accent disabled:text-line';
    return `<li class="flex gap-3.5 border-b border-surface-2 py-4">
      <div class="flex h-[92px] w-[66px] shrink-0 items-end justify-center rounded-xl bg-[linear-gradient(180deg,#f6f8fb,#e9eef5)] px-1 pt-[7px] pb-[5px]">${visual(p)}</div>
      <div class="min-w-0 flex-1">
        <strong class="block text-[15px] leading-[1.25] tracking-[-.01em]">${esc(isKit(p) ? shortName(p) : fullName(p))}</strong>
        <small class="text-[12px] text-fg-2">${esc(isKit(p) ? meta(p) : `${p.volume} · lacre VeriSeal`)}</small>
        <div class="mt-2 flex items-center justify-between gap-2">
          <div class="inline-flex h-8 shrink-0 items-center rounded-full border border-line" role="group" aria-label="Quantidade">
            <button class="${btn}" type="button" data-dec="${p.id}" aria-label="Remover uma unidade de ${esc(fullName(p))}">−</button>
            <span class="min-w-5 text-center text-[14px] font-bold">${q}</span>
            <button class="${btn}" type="button" data-inc="${p.id}" aria-label="Adicionar uma unidade de ${esc(fullName(p))}"${q >= MAX_QTY ? ' disabled' : ''}>+</button>
          </div>
          <span class="text-[15px] font-bold">${money(p.price * q)}</span>
        </div>
        <button class="mt-1.5 text-[12px] ${LINK_BTN}" type="button" data-remove="${p.id}">Remover</button>
      </div>
    </li>`;
  }
  function renderBag() {
    const bb = $('#bagBody'), bf = $('#bagFoot');
    if (!bag.size) {
      bb.innerHTML = `<div class="px-2.5 py-[60px] text-center text-fg-2">${icon('bag', 'mx-auto mb-3.5 block size-[52px] stroke-[1.2] text-fg-3')}<p class="mb-[18px]">Sua sacola está vazia.</p><a class="btn btn-primary" href="#ofertas" data-close>Ver ofertas</a></div>`;
      bf.innerHTML = ''; bf.hidden = true;
      return;
    }
    bf.hidden = false;
    const sub = subtotal(), ship = shipping(sub), left = Math.max(0, FREE_SHIP - sub);
    const units = [...bag].reduce((s, [id, q]) => s + q * (isKit(byId[id]) ? byId[id].bottles.length : 1), 0);
    bb.innerHTML = `
      <div class="mt-1.5 mb-2.5">
        <p class="mb-1.5 text-[13px] text-fg-2">${left > 0 ? `Faltam <strong class="text-fg">${money(left)}</strong> para o frete grátis.` : `<strong class="text-fg">Frete grátis</strong> garantido neste pedido.`}</p>
        <div class="h-[5px] overflow-hidden rounded-[3px] bg-surface-2"><i class="block h-full rounded-[3px] bg-[linear-gradient(90deg,var(--color-navy),var(--color-cyan))] transition-[width] duration-500 ease-smooth" style="width:${Math.min(100, (sub / FREE_SHIP) * 100).toFixed(1)}%"></i></div>
      </div>
      <p class="mt-3.5 mb-0.5 flex items-center gap-2.5 rounded-xl bg-[#e9f5fd] px-3 py-2.5 text-[13px] text-navy">${vsMark('w-[26px] shrink-0')}<span><b>${units} ${units === 1 ? 'garrafa lacrada' : 'garrafas lacradas'}</b> · cada uma com o próprio lacre VeriSeal</span></p>
      <ul>${[...bag].map(([id, q]) => bagItemHTML(byId[id], q)).join('')}</ul>`;
    bf.innerHTML = `
      ${addr
        ? `<p class="mb-2 flex items-center gap-2 text-[13px] text-fg-2">${icon('pin', 'size-4 text-ok')}<span class="min-w-0 flex-1">Entregar em <b class="text-fg">${esc(placeLabel(addr))}</b> · ${etaText(addr)}</span><button class="${LINK_BTN}" type="button" data-open-address>Alterar</button></p>`
        : `<form class="mb-1 flex gap-2" id="bagCepForm" novalidate><input class="h-10 min-w-0 flex-1 rounded-xl border border-line bg-white px-3.5 text-[15px] outline-none focus:border-accent focus:shadow-focus [&.invalid]:border-bad" id="bagCep" inputmode="numeric" placeholder="CEP para calcular o frete" maxlength="9" aria-label="CEP de entrega" autocomplete="postal-code"><button class="btn btn-dark btn-sm" type="submit">OK</button></form><p class="${CEP_INFO}" id="bagCepInfo" aria-live="polite"></p>`}
      <div class="mt-1 mb-3.5">
        <div class="${ROW}"><span>Subtotal</span><span>${money(sub)}</span></div>
        <div class="${ROW}"><span>Entrega</span><span class="${ship ? '' : FREE}">${ship ? money(ship) : 'Grátis'}</span></div>
        <div class="${GRAND}"><span>Total</span><span>${money(sub + ship)}</span></div>
        <div class="flex justify-end pb-[3px] text-[13px] font-semibold text-ok"><span>ou ${money(pix(sub) + ship)} no Pix</span></div>
      </div>
      <button class="btn btn-primary w-full" type="button" id="goCheckout"${storeOpen() ? '' : ' data-closed'}>Finalizar pedido</button>
      <p class="mt-3 flex items-center gap-2.5 text-[12px] text-fg-2">${vsMark('w-[26px] shrink-0')}<span>Toda garrafa sai com lacre VeriSeal conferido. Lacre violado? Recuse sem custo.</span></p>`;
    const form = $('#bagCepForm');
    if (form) {
      const input = $('#bagCep');
      maskCep(input);
      form.addEventListener('submit', (e) => { e.preventDefault(); submitCep(input, $('#bagCepInfo')); });
    }
    $('#goCheckout').addEventListener('click', openCheckout);
  }
  function openBag() { closeMenus(); renderBag(); openLayer($('#bagDrawer'), $('#bagDrawer button[data-close]')); }

  // devolve o foco ao controle equivalente depois que a lista é redesenhada
  function refocus(prev) {
    if (!prev) return;
    const attr = ['data-inc', 'data-dec', 'data-add'].find((a) => prev.hasAttribute(a));
    if (!attr) return;
    const id = prev.getAttribute(attr);
    const box = prev.closest('[data-cta]');
    const inBag = !!prev.closest('#bagBody');
    requestAnimationFrame(() => {
      const scope = box && document.contains(box) ? box : inBag ? $('#bagBody') : null;
      if (!scope) return;
      const t = scope.querySelector(`[${attr}="${id}"]:not([disabled])`) || scope.querySelector(`[data-inc="${id}"], [data-add="${id}"]`);
      if (t) t.focus({ preventScroll: true });
    });
  }

  /* ============================================================
     DETALHE DO PRODUTO — foto com o lacre em destaque + galeria
     ============================================================ */
  function openProduct(id) {
    const p = byId[id];
    if (!p) return;
    closeMenus();
    const kit = isKit(p);
    const i = inst(p.price);
    const media = $('#ppMedia');
    if (kit) {
      media.innerHTML = `<div class="h-[400px] w-full max-w-[400px] max-md:h-[280px]">${visual(p, { eager: true })}</div><p class="${NOTE_MARK}">${vsMark('w-[22px]')}${p.bottles.length} garrafas, cada uma com o próprio lacre</p>`;
    } else {
      const g = sealGeo(p);
      // anéis NFC saindo do lacre e a etiqueta apontando para ele
      const ring = (anim) => `<span class="absolute -top-8 -left-8 size-16 rounded-full border-2 border-cyan opacity-0 ${anim}"></span>`;
      const views = [
        { html: `<div class="relative h-full" style="--nfc:${g.nfc.toFixed(4)};--sw:${g.sw}">${shot(p, { eager: true, alt: fullName(p) })}<div class="pointer-events-none absolute top-[calc(var(--nfc,.2)*100%)] left-1/2 z-[3] size-0">${ring('animate-[ring_2.8s_var(--ease-smooth)_infinite]')}${ring('animate-[ring_2.8s_var(--ease-smooth)_.9s_infinite]')}${ring('animate-[ring_2.8s_var(--ease-smooth)_1.8s_infinite]')}</div><span class="absolute top-[calc(var(--nfc,.2)*100%)] left-[calc(50%_+_var(--sw,.15)*50%_+_26px)] z-[4] inline-flex -translate-y-1/2 items-center gap-2 rounded-full bg-navy px-3 py-1.5 text-[12px] font-bold whitespace-nowrap text-white shadow-[0_8px_20px_rgba(4,37,85,.3)] max-sm:left-[calc(50%_+_var(--sw,.15)*50%_+_20px)] max-sm:text-[11px]"><i class="absolute top-1/2 right-full h-[1.5px] w-6 bg-navy before:absolute before:-top-[3.5px] before:-left-1 before:size-2 before:rounded-full before:bg-cyan"></i>Lacre VeriSeal · NFC</span></div>`, thumb: p.img, label: 'Garrafa com o lacre' },
        ...(p.gallery || []).map((x) => ({ html: `<img class="max-h-full w-auto object-contain" src="${esc(x.src)}" alt="${esc(`${fullName(p)} — ${x.label.toLowerCase()}`)}" width="${x.size[0]}" height="${x.size[1]}">`, thumb: x.src, label: x.label }))
      ];
      media.innerHTML = `<div class="relative h-[450px] max-h-[60vh] w-full max-md:h-[340px] max-sm:h-[300px]">${views.map((v, k) => `<div class="invisible absolute inset-0 flex items-end justify-center opacity-0 [transition:opacity_.35s_ease,visibility_.35s] [&.is-on]:visible [&.is-on]:opacity-100${k ? '' : ' is-on'}" data-view="${k}">${v.html}</div>`).join('')}</div>
        ${views.length > 1 ? `<div class="flex gap-2" role="group" aria-label="Fotos do produto">${views.map((v, k) => `<button class="h-16 w-[54px] overflow-hidden rounded-xl border-2 border-transparent bg-white p-1 shadow-card aria-pressed:border-accent" type="button" data-view-btn="${k}" aria-pressed="${!k}" aria-label="${esc(v.label)}"><img class="size-full object-contain" src="${esc(v.thumb)}" alt=""></button>`).join('')}</div>` : ''}
        <p class="${NOTE_MARK}">${vsMark('w-[22px]')}Lacre conferido antes do envio</p>`;
      $$('[data-view-btn]', media).forEach((b) => b.addEventListener('click', () => {
        $$('[data-view]', media).forEach((v) => v.classList.toggle('is-on', v.dataset.view === b.dataset.viewBtn));
        $$('[data-view-btn]', media).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      }));
    }
    const stepBtn = 'grid h-full w-[42px] place-items-center rounded-[50%] text-[20px] text-accent disabled:text-line';
    $('#ppInfo').innerHTML = `
      <p class="min-h-[18px] text-[12px] font-bold text-badge">${p.oldPrice ? `<span class="inline-block rounded-md bg-sale px-2 py-[3px] font-bold text-white">-${pct(p)}%${kit ? ' no kit' : ' esta semana'}</span>` : esc(p.badge || '')}</p>
      <p class="mt-1.5 text-[13px] font-semibold tracking-[.04em] text-fg-2 uppercase">${esc(kit ? `Kit · ${p.bottles.length} garrafas` : p.brand)}</p>
      <h2 class="mt-0.5 pr-[30px] text-[clamp(28px,3.4vw,36px)] leading-[1.06] font-extrabold tracking-[-.035em]" id="ppTitle">${esc(p.name)}</h2>
      <div class="mt-3.5 flex items-baseline gap-2.5">${p.oldPrice ? `<s class="text-[16px] text-fg-3">${money(p.oldPrice)}</s>` : ''}<b class="text-[28px] font-extrabold tracking-[-.025em]">${money(p.price)}</b></div>
      <p class="mt-0.5 text-[14px] text-fg-2"><strong class="font-bold text-ok">${money(pix(p.price))} no Pix</strong> (5% off)${i ? ` · ou ${i.n}x de ${money(i.v)} sem juros` : ''}</p>
      <p class="mt-4 text-[15px] text-fg-2">${esc(p.desc)}</p>
      ${kit
        ? `<ul class="mt-4 grid gap-2">${kitGroups(p).map(([b, n]) => `<li class="flex items-center gap-3 rounded-xl bg-surface px-3 py-2"><span class="flex h-[60px] w-7 shrink-0 items-end justify-center">${shot(b)}</span><span><b class="block text-[15px]">${n > 1 ? n + '× ' : ''}${esc(b.brand)} ${esc(b.name)}</b><small class="text-[12px] text-fg-2">${esc(b.volume)} · ${abv(b)} vol. · ${esc(b.origin)}</small></span></li>`).join('')}</ul>`
        : `<div class="mt-[18px] grid grid-cols-3 gap-2">${[['Volume', esc(p.volume)], ['Teor alcoólico', abv(p)], ['Origem', esc(p.origin)]].map(([k, v]) => `<div class="rounded-xl bg-surface px-3 py-2.5"><span class="block text-[11px] text-fg-2">${k}</span><strong class="text-[15px] tracking-[-.01em]">${v}</strong></div>`).join('')}</div>`}
      <div class="mt-3.5 flex flex-wrap gap-1.5">${(p.notes || []).map((n) => `<span class="rounded-full border border-line px-2.5 py-[5px] text-[12px] text-fg-2">${esc(n)}</span>`).join('')}</div>
      <div class="mt-[18px] flex items-start gap-3 rounded-2xl bg-[linear-gradient(135deg,#e6f4fe,#f3f5f9)] px-4 py-3.5">${vsMark('mt-1 w-[34px] shrink-0')}<div><strong class="block text-[14px] text-navy">Lacre VeriSeal${kit ? ' em cada garrafa' : ''}</strong><p class="text-[13px] leading-[1.45] text-fg-2">Conferido no nosso centro antes do envio. Ao receber, aproxime o celular do lacre e confirme que a bebida é original e nunca foi aberta.</p></div></div>
      <p class="mt-3.5 flex items-center gap-2 text-[14px] text-fg-2">${addr
        ? `${icon('truck', 'size-[18px] text-accent')}<span>Chega em <b class="text-fg">${etaText(addr)}</b> em ${esc(placeLabel(addr))}${pix(p.price) >= FREE_SHIP ? ' · frete grátis' : ''}</span>`
        : `${icon('pin', 'size-[18px] text-accent')}<span><button class="${LINK_BTN}" type="button" data-open-address>Informe seu CEP</button> para ver o prazo de entrega.</span>`}</p>
      <div class="mt-[22px] flex items-center gap-3 pt-1">
        <div class="inline-flex h-[46px] shrink-0 items-center rounded-full border border-line" role="group" aria-label="Quantidade">
          <button class="${stepBtn}" type="button" data-pp="-1" aria-label="Diminuir quantidade">−</button><span class="min-w-[26px] text-center text-[16px] font-bold" id="ppQty">1</span><button class="${stepBtn}" type="button" data-pp="1" aria-label="Aumentar quantidade">+</button>
        </div>
        <button class="btn btn-primary flex-1" type="button" id="ppAdd" data-autofocus>Adicionar · ${money(p.price)}</button>
      </div>`;
    let q = 1;
    const qEl = $('#ppQty'), addBtn = $('#ppAdd');
    const sync = () => {
      qEl.textContent = q;
      addBtn.textContent = `Adicionar · ${money(p.price * q)}`;
      $('[data-pp="-1"]').disabled = q <= 1;
      $('[data-pp="1"]').disabled = q >= MAX_QTY;
    };
    $$('[data-pp]').forEach((b) => b.addEventListener('click', () => { q = clamp(q + +b.dataset.pp, 1, MAX_QTY); sync(); }));
    addBtn.addEventListener('click', () => { if (addToBag(p.id, q)) closeLayer($('#productSheet')); });
    sync();
    openLayer($('#productSheet'), addBtn);
    $('#productPanel').scrollTop = 0;
  }

  /* ============================================================
     CHECKOUT — entrega, pagamento, revisão e pedido confirmado
     ============================================================ */
  let co = null, coTimers = [];
  const coCleanup = () => { coTimers.forEach(clearTimeout); coTimers = []; };
  const fmtPhone = (v) => {
    const d = String(v).replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2) return d.length ? `(${d}` : '';
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  };
  function slots() {
    const out = [], d = new Date(Date.now() + 90 * 60000);
    d.setMinutes(d.getMinutes() < 30 ? 30 : 60, 0, 0);
    if (!storeOpen(d)) { d.setHours(OPEN_H, 0, 0, 0); if (d < new Date()) d.setDate(d.getDate() + 1); }
    for (let k = 0; k < 8; k++) {
      if (!storeOpen(d)) break;
      const dayTxt = d.getDate() === new Date().getDate() ? 'Hoje' : 'Amanhã';
      out.push(`${dayTxt}, ${hhmm(d)}–${hhmm(new Date(d.getTime() + 30 * 60000))}`);
      d.setMinutes(d.getMinutes() + 30);
    }
    return out;
  }
  function coTotals() {
    const sub = subtotal(), ship = shipping(sub);
    const disc = co && co.d.pay === 'pix' ? sub * PIX_OFF : 0;
    return { sub, ship, disc, total: sub - disc + ship };
  }
  const stepsBar = (n) => `<div class="mt-4 mb-1.5 flex gap-1.5" aria-hidden="true">${[0, 1, 2].map((i) => `<span class="h-1 flex-1 rounded-[2px] transition-[background] duration-300 ${i <= n ? 'bg-accent' : 'bg-surface-2'}"></span>`).join('')}</div>
    <p class="mb-[22px] text-[12px] text-fg-2">Etapa ${n + 1} de 3</p>`;
  const coTitle = (t) => `<h2 class="pr-10 text-[28px] font-extrabold tracking-[-.03em] outline-none">${t}</h2>`;

  function openCheckout() {
    if (!bag.size) return;
    const prof = store.get('profile', {});
    co = {
      step: 0,
      d: {
        name: prof.name || '', phone: prof.phone || '', cep: addr ? addr.cep : '', street: addr ? addr.street : '', number: prof.number || '',
        comp: prof.comp || '', bairro: addr ? addr.bairro : '', city: addr ? cityUf(addr) : '', when: storeOpen() ? 'now' : 'later', slot: '',
        gift: false, giftMsg: '', pay: 'pix', inst: 1, change: ''
      }
    };
    const fromBag = stack.find((s) => s.el.id === 'bagDrawer');
    if (fromBag) closeLayer(fromBag.el, { restoreFocus: false });
    renderCheckout();
    openLayer($('#checkoutSheet'));
  }
  // cls: o flex do campo na linha (direto na linha ou dentro de uma coluna de largura fixa)
  function field(id, label, value, attrs = '', opt = false, cls = 'flex-[1_1_180px]') {
    return `<div class="${FIELD} ${cls}"><label class="${LABEL}" for="${id}">${label}${opt ? OPTIONAL : ''}</label>
      <input class="${INPUT}" id="${id}" name="${id.replace('co', '').toLowerCase()}" value="${esc(value)}" ${attrs}><span class="text-[12px] text-bad" data-msg hidden></span></div>`;
  }
  function renderCheckout() {
    const el = $('#checkoutContent');
    const d = co.d;
    const t = coTotals();
    if (co.step === 0) {
      const sl = slots();
      el.innerHTML = `${coTitle('Entrega')}${stepsBar(0)}
        <form class="flex flex-col gap-3.5" id="coForm" novalidate>
          <div class="flex flex-wrap gap-3">${field('coName', 'Nome completo', d.name, 'autocomplete="name" required')}${field('coPhone', 'Celular (WhatsApp)', d.phone, 'type="tel" inputmode="tel" autocomplete="tel" placeholder="(11) 98765-4321" required')}</div>
          <div class="flex flex-wrap gap-3"><div class="min-w-0 flex-[0_1_150px]">${field('coCep', 'CEP', d.cep, 'inputmode="numeric" maxlength="9" autocomplete="postal-code" required', false, 'h-full flex-1')}</div><div class="min-w-0 flex-[1_1_220px]">${field('coStreet', 'Rua', d.street, 'autocomplete="address-line1" required', false, 'h-full flex-1')}</div></div>
          <div class="flex flex-wrap gap-3"><div class="min-w-0 flex-[0_1_120px]">${field('coNumber', 'Número', d.number, 'inputmode="numeric" required', false, 'h-full flex-1')}</div><div class="min-w-0 flex-[1_1_220px]">${field('coComp', 'Complemento', d.comp, 'autocomplete="address-line2"', true, 'h-full flex-1')}</div></div>
          <div class="flex flex-wrap gap-3">${field('coBairro', 'Bairro', d.bairro, 'required')}${field('coCity', 'Cidade/UF', d.city, 'required')}</div>
          <fieldset class="grid min-w-0 gap-2.5">
            <legend class="mb-2 px-0.5 text-[13px] font-semibold text-fg-2">Quando entregar?</legend>
            <label class="${PAY_OPT}"><input class="${PAY_RADIO}" type="radio" name="when" value="now"${d.when === 'now' ? ' checked' : ''}${storeOpen() ? '' : ' disabled'}>
              <span class="${PAY_IC}">${icon('moto', 'size-5')}</span><span><strong class="block text-[16px]">Agora</strong><small class="text-[13px] text-fg-2">${storeOpen() ? `Chega em ${addr ? etaText(addr) : '30–60 min'}` : `Abrimos às ${OPEN_H}h — agende a entrega`}</small></span></label>
            <label class="${PAY_OPT}"><input class="${PAY_RADIO}" type="radio" name="when" value="later"${d.when === 'later' ? ' checked' : ''}>
              <span class="${PAY_IC}">${icon('clock', 'size-5')}</span><span><strong class="block text-[16px]">Agendar</strong><small class="text-[13px] text-fg-2">Escolha uma janela de 30 minutos</small></span></label>
            <div class="${PAY_EXTRA}" data-for="later"${d.when === 'later' ? '' : ' hidden'}><div class="${FIELD} flex-1"><label class="${LABEL}" for="coSlot">Horário</label>
              <select class="${INPUT}" id="coSlot" name="slot">${sl.map((s) => `<option${s === d.slot ? ' selected' : ''}>${s}</option>`).join('')}</select></div></div>
          </fieldset>
          <label class="flex cursor-pointer items-start gap-2.5 text-[15px]"><input class="mt-0.5 size-[18px] shrink-0 accent-accent" type="checkbox" name="gift"${d.gift ? ' checked' : ''}><span class="inline-flex items-center gap-2">${icon('gift', 'size-[18px] text-accent')}É presente? Incluir cartão com mensagem</span></label>
          <div class="${FIELD} flex-1" data-gift${d.gift ? '' : ' hidden'}><label class="${LABEL}" for="coGiftMsg">Mensagem do cartão</label>
            <textarea class="${INPUT}" id="coGiftMsg" name="giftmsg" maxlength="140" rows="2" placeholder="Ex.: Feliz aniversário! Saúde!">${esc(d.giftMsg)}</textarea>
            <span class="text-[12px] text-fg-2">Até 140 caracteres. O cartão não mostra preços.</span></div>
          <div class="${ACTIONS}"><button type="button" class="btn btn-ghost" data-close>Cancelar</button><button type="submit" class="${ACTION_MAIN}">Continuar para pagamento</button></div>
        </form>`;
      const f = $('#coForm');
      const phone = $('#coPhone'), cep = $('#coCep');
      phone.addEventListener('input', () => { phone.value = fmtPhone(phone.value); });
      cep.addEventListener('input', async () => {
        cep.value = fmtCep(cep.value);
        if (cep.value.length !== 9) return;
        const r = await lookupCep(cep.value);
        if (r.error) { setErr(cep, r.error); return; }
        setErr(cep, '');
        setAddr(r);
        if (r.street) $('#coStreet').value = r.street;
        if (r.bairro) $('#coBairro').value = r.bairro;
        if (r.city) $('#coCity').value = cityUf(r);
        $('#coNumber').focus();
      });
      f.addEventListener('change', (e) => {
        if (e.target.name === 'when') $('[data-for="later"]', f).hidden = e.target.value !== 'later';
        if (e.target.name === 'gift') $('[data-gift]', f).hidden = !e.target.checked;
      });
      f.addEventListener('submit', (e) => {
        e.preventDefault();
        const v = (id) => $('#' + id).value.trim();
        Object.assign(d, {
          name: v('coName'), phone: v('coPhone'), cep: v('coCep'), street: v('coStreet'), number: v('coNumber'), comp: v('coComp'),
          bairro: v('coBairro'), city: v('coCity'), when: (f.querySelector('[name=when]:checked') || {}).value || 'later',
          slot: $('#coSlot') ? $('#coSlot').value : '', gift: f.gift.checked, giftMsg: $('#coGiftMsg').value.trim()
        });
        const errs = [
          [!d.name || d.name.length < 3, 'coName', 'Informe seu nome.'],
          [d.phone.replace(/\D/g, '').length < 10, 'coPhone', 'Informe um celular com DDD.'],
          [d.cep.replace(/\D/g, '').length !== 8, 'coCep', 'Informe o CEP.'],
          [!d.street, 'coStreet', 'Informe a rua.'],
          [!d.number, 'coNumber', 'Informe o número.'],
          [!d.bairro, 'coBairro', 'Informe o bairro.'],
          [!d.city, 'coCity', 'Informe a cidade.']
        ];
        let first = null;
        errs.forEach(([bad, id, msg]) => { setErr($('#' + id), bad ? msg : ''); if (bad && !first) first = $('#' + id); });
        if (first) { first.focus(); return; }
        store.set('profile', { name: d.name, phone: d.phone, number: d.number, comp: d.comp });
        if (!addr || addr.cep !== fmtCep(d.cep)) setAddr({ cep: fmtCep(d.cep), street: d.street, bairro: d.bairro, city: d.city, uf: '', eta: etaFor(d.cep) });
        co.step = 1; renderCheckout(); focusTitle();
      });
      return;
    }

    if (co.step === 1) {
      const i = inst(t.sub + t.ship);
      el.innerHTML = `${coTitle('Pagamento')}${stepsBar(1)}
        <form class="flex flex-col gap-3.5" id="coForm" novalidate>
          <fieldset class="grid min-w-0 gap-2.5"><legend class="sr-only">Forma de pagamento</legend>
            <label class="${PAY_OPT}"><input class="${PAY_RADIO}" type="radio" name="pay" value="pix"${d.pay === 'pix' ? ' checked' : ''}>
              <span class="${PAY_IC}">${icon('pix', 'size-5')}</span><span><strong class="block text-[16px]">Pix · 5% off</strong><small class="text-[13px] text-fg-2">Você economiza ${money(t.sub * PIX_OFF)} · aprovação na hora</small></span></label>
            <label class="${PAY_OPT}"><input class="${PAY_RADIO}" type="radio" name="pay" value="card"${d.pay === 'card' ? ' checked' : ''}>
              <span class="${PAY_IC}">${icon('card', 'size-5')}</span><span><strong class="block text-[16px]">Cartão de crédito</strong><small class="text-[13px] text-fg-2">${i ? `Em até ${i.n}x de ${money(i.v)} sem juros` : 'À vista'}</small></span></label>
            <div class="${PAY_EXTRA}" data-for="card"${d.pay === 'card' ? '' : ' hidden'}><div class="${FIELD} flex-1"><label class="${LABEL}" for="coInst">Parcelas</label>
              <select class="${INPUT}" id="coInst" name="inst">${Array.from({ length: i ? i.n : 1 }, (_, k) => k + 1).map((k) => `<option value="${k}"${+d.inst === k ? ' selected' : ''}>${k}x de ${money((t.sub + t.ship) / k)} sem juros</option>`).join('')}</select></div></div>
            <label class="${PAY_OPT}"><input class="${PAY_RADIO}" type="radio" name="pay" value="cod"${d.pay === 'cod' ? ' checked' : ''}>
              <span class="${PAY_IC}">${icon('cash', 'size-5')}</span><span><strong class="block text-[16px]">Pagar na entrega</strong><small class="text-[13px] text-fg-2">Cartão ou dinheiro, direto com o entregador</small></span></label>
            <div class="${PAY_EXTRA}" data-for="cod"${d.pay === 'cod' ? '' : ' hidden'}><div class="${FIELD} flex-1"><label class="${LABEL}" for="coChange">Troco para${OPTIONAL}</label>
              <input class="${INPUT}" id="coChange" name="change" inputmode="decimal" placeholder="Ex.: 300" value="${esc(d.change)}"></div></div>
          </fieldset>
          <p class="text-center text-[12px] text-fg-3">Ambiente de demonstração: nenhum pagamento é processado.</p>
          <div class="${ACTIONS}"><button type="button" class="btn btn-ghost" data-back>Voltar</button><button type="submit" class="${ACTION_MAIN}">Revisar pedido</button></div>
        </form>`;
      const f = $('#coForm');
      f.addEventListener('change', (e) => {
        if (e.target.name !== 'pay') return;
        $$('[data-for]', f).forEach((x) => { x.hidden = x.dataset.for !== e.target.value; });
      });
      f.addEventListener('submit', (e) => {
        e.preventDefault();
        d.pay = f.querySelector('[name=pay]:checked').value;
        d.inst = $('#coInst') ? +$('#coInst').value : 1;
        d.change = $('#coChange') ? $('#coChange').value.trim() : '';
        co.step = 2; renderCheckout(); focusTitle();
      });
      return;
    }

    if (co.step === 2) {
      const payTxt = d.pay === 'pix' ? 'Pix · 5% de desconto' : d.pay === 'card' ? `Cartão de crédito · ${d.inst}x de ${money(t.total / d.inst)}` : `Na entrega${d.change ? ` · troco para R$ ${esc(d.change)}` : ''}`;
      const whenTxt = d.when === 'now' ? `Agora · ${addr ? etaText(addr) : '30–60 min'}` : `Agendado · ${esc(d.slot)}`;
      const edit = `text-[13px] ${LINK_BTN}`;
      el.innerHTML = `${coTitle('Revisão')}${stepsBar(2)}
        <div class="${REVIEW}"><h4 class="${REVIEW_H}">Itens <button class="${edit}" type="button" data-edit-bag>Editar</button></h4>
          <ul>${[...bag].map(([id, q]) => `<li class="flex justify-between gap-2.5 py-[3px] text-[15px]"><span>${q}× ${esc(fullName(byId[id]))}</span><span>${money(byId[id].price * q)}</span></li>`).join('')}</ul></div>
        <div class="${REVIEW} mt-2.5"><h4 class="${REVIEW_H}">Entrega <button class="${edit}" type="button" data-goto="0">Alterar</button></h4>
          <p class="text-[15px]">${esc(d.street)}, ${esc(d.number)}${d.comp ? ' — ' + esc(d.comp) : ''}<br>${esc(d.bairro)} · ${esc(d.city)} · ${esc(d.cep)}</p><p class="mt-1 text-[14px] text-fg-2">${whenTxt}</p></div>
        <div class="${REVIEW} mt-2.5"><h4 class="${REVIEW_H}">Pagamento <button class="${edit}" type="button" data-goto="1">Alterar</button></h4><p class="text-[15px]">${payTxt}</p></div>
        ${d.gift && d.giftMsg ? `<div class="${REVIEW} mt-2.5"><h4 class="${REVIEW_H}">Cartão de presente</h4><p class="text-[15px] italic">“${esc(d.giftMsg)}”</p></div>` : ''}
        <div class="mt-4 mb-3.5">
          <div class="${ROW}"><span>Subtotal</span><span>${money(t.sub)}</span></div>
          ${t.disc ? `<div class="${ROW}"><span>Desconto Pix (5%)</span><span class="${FREE}">− ${money(t.disc)}</span></div>` : ''}
          <div class="${ROW}"><span>Entrega</span><span class="${t.ship ? '' : FREE}">${t.ship ? money(t.ship) : 'Grátis'}</span></div>
          <div class="${GRAND}"><span>Total</span><span>${money(t.total)}</span></div>
        </div>
        <label class="mt-1.5 flex cursor-pointer items-start gap-2.5 text-[14px]"><input class="mt-0.5 size-[18px] shrink-0 accent-accent" type="checkbox" id="coAge"><span class="inline-flex items-center gap-2">Tenho 18 anos ou mais e vou apresentar documento com foto, se solicitado na entrega.</span></label>
        <p class="mt-2 text-[14px] text-bad" id="coAgeErr" role="alert" hidden>Confirme que você tem 18 anos ou mais para concluir.</p>
        <p class="mt-3.5 flex items-center gap-2.5 rounded-xl bg-[#eef7fd] px-3.5 py-3 text-[13px] text-fg-2">${vsMark('w-7 shrink-0')}<span>Cada garrafa sai com lacre VeriSeal conferido. Se chegar violado, recuse na hora e receba o valor integral.</span></p>
        <div class="${ACTIONS}"><button type="button" class="btn btn-ghost" data-back>Voltar</button><button type="button" class="${ACTION_MAIN}" id="coConfirm">Confirmar pedido · ${money(t.total)}</button></div>`;
      $('#coConfirm').addEventListener('click', () => {
        if (!$('#coAge').checked) { $('#coAgeErr').hidden = false; $('#coAge').focus(); return; }
        placeOrder();
      });
      $('#coAge').addEventListener('change', () => { $('#coAgeErr').hidden = true; });
      return;
    }

    // pedido confirmado
    const o = co.order;
    const tl = (state, title, sub) => `<li class="${state} relative flex gap-3.5 pb-[18px] before:absolute before:top-[26px] before:bottom-0.5 before:left-[11px] before:w-0.5 before:bg-surface-2 last:pb-0 last:before:hidden [&.done]:before:bg-accent"><span class="relative z-[1] grid size-6 shrink-0 place-items-center rounded-full border-2 border-line bg-white transition-all duration-[400ms] [.current_&]:border-accent [.current_&]:shadow-[0_0_0_5px_rgb(0_106_168/.1)] [.done_&]:border-accent [.done_&]:bg-accent">${icon('check', 'size-[13px] stroke-3 text-white opacity-0 [.done_&]:opacity-100')}</span><div><strong class="block text-[15px] tracking-[-.01em] [li:not(.done):not(.current)_&]:text-fg-3">${title}</strong><small class="text-[13px] text-fg-2">${sub}</small></div></li>`;
    el.innerHTML = `<div class="text-center">
        <div class="mx-auto mt-1 mb-[18px] grid size-16 place-items-center rounded-full bg-ok-fill text-white">${icon('check', 'size-[34px] animate-[draw_.6s_var(--ease-smooth)_.2s_forwards] stroke-[2.6] [stroke-dasharray:30] [stroke-dashoffset:30]')}</div>
        <h2 class="text-[30px] font-extrabold tracking-[-.03em] outline-none">Pedido confirmado!</h2>
        <p class="mt-1.5 text-fg-2">Pedido <span class="font-mono font-semibold text-fg">#${o.num}</span> · ${o.when}</p>
        ${o.pay === 'pix' ? `<p class="mt-3 inline-flex items-center gap-2 rounded-full bg-ok-fill/10 px-3.5 py-1.5 text-[14px] font-semibold text-ok">${icon('pix', 'size-4')}Pix aprovado · você economizou ${money(o.disc)}</p>` : ''}
        <ol class="mt-[26px] mb-2 text-left" id="coTimeline">
          ${tl('done', 'Pedido recebido', o.time)}
          ${o.scheduled
        ? tl('current', 'Entrega agendada', `${esc(o.slot)} · os lacres são conferidos antes de sair`)
        : tl('current', 'Separando e conferindo os lacres', 'Cada garrafa é escaneada antes de sair')}
          ${tl('', 'Saiu para entrega', 'Você recebe o aviso no WhatsApp')}
          ${tl('', 'Entregue', 'Aproxime o celular do lacre e confira')}
        </ol>
        <div class="mt-[22px] mb-5 rounded-2xl bg-[#eef7fd] p-4 text-left">
          <h4 class="mb-2.5 flex items-center gap-2 text-[14px] font-bold text-navy">${vsMark('w-6')}Lacres VeriSeal do seu pedido</h4>
          <ul>${o.seals.map((s) => `<li class="mb-1.5 flex items-center justify-between gap-2.5 rounded-xl bg-white px-3.5 py-2.5 text-[14px]"><span class="flex min-w-0 flex-col"><b class="truncate text-[13px] font-semibold">${esc(s.name)}</b><code class="font-mono text-[13px] font-semibold text-navy">${s.code}</code></span><button class="text-[13px] whitespace-nowrap ${LINK_BTN}" type="button" data-verify-code="${s.code}">Verificar ›</button></li>`).join('')}</ul>
          <p class="mt-2 text-[12px] text-fg-2">Guarde estes códigos: eles também estão impressos no lacre de cada garrafa.</p>
        </div>
        <button class="btn btn-primary w-full" type="button" data-close>Continuar comprando</button>
      </div>`;
    const items = $$('#coTimeline > li');
    const advance = (k) => { items.forEach((li, j) => { li.classList.toggle('done', j < k); li.classList.toggle('current', j === k); }); };
    if (!o.scheduled) coTimers.push(setTimeout(() => advance(2), reduce ? 0 : 4200));
  }
  function setErr(input, msg) {
    input.classList.toggle('invalid', !!msg);
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    const m = input.parentElement.querySelector('[data-msg]');
    if (m) { m.textContent = msg; m.hidden = !msg; }
  }
  const focusTitle = () => requestAnimationFrame(() => { const h = $('#checkoutContent h2'); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } $('#checkoutPanel').scrollTop = 0; });

  const SEAL_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const rand4 = () => Array.from({ length: 4 }, () => SEAL_CHARS[(Math.random() * SEAL_CHARS.length) | 0]).join('');
  function newSealCode() { let c; do { c = `VS-${rand4()}-${rand4()}`; } while (seals[c]); return c; }
  function placeOrder() {
    const d = co.d, t = coTotals(), now = new Date();
    const num = 'VSD-' + String(Math.floor(10000 + Math.random() * 89999));
    const lot = `L${String(now.getFullYear()).slice(2)}-${String(now.getMonth() + 1).padStart(2, '0')}${String(10 + ((Math.random() * 18) | 0))}`;
    const made = new Date(now.getTime() - (20 + Math.random() * 60) * 86400000).toLocaleDateString('pt-BR');
    const out = [];
    const mine = store.get('seals', {});
    [...bag].forEach(([id, q]) => {
      const p = byId[id];
      const units = isKit(p) ? p.bottles : [p];
      for (let k = 0; k < q; k++) units.forEach((b) => {
        const code = newSealCode();
        const rec = { product: b.id, status: 'ok', lot, made, checks: 0, sentAt: 'hoje · ' + hhmm(new Date(now.getTime() + 6 * 60000)), order: num };
        seals[code] = rec; mine[code] = rec;
        out.push({ code, name: fullName(b) });
      });
    });
    store.set('seals', mine);
    store.set('lastSeal', out[0] && out[0].code);
    co.order = {
      num, pay: d.pay, disc: t.disc, time: 'hoje · ' + hhmm(now), seals: out, scheduled: d.when !== 'now', slot: d.slot,
      when: d.when === 'now' ? `chega em ${addr ? etaText(addr) : '30–60 min'}${addr ? ` (até ${arrival(addr)})` : ''}` : `agendado: ${esc(d.slot)}`
    };
    bag.clear(); saveBag();
    PRODUCTS.forEach((p) => refreshCTAs(p.id));
    updateBagUI();
    co.step = 3; renderCheckout(); focusTitle();
    const h = $('#checkoutContent h2'); if (h) { h.tabIndex = -1; h.focus(); }
  }
  safe('checkout', () => {
    $('#checkoutContent').addEventListener('click', (e) => {
      if (e.target.closest('[data-back]')) { co.step = Math.max(0, co.step - 1); renderCheckout(); focusTitle(); }
      const g = e.target.closest('[data-goto]');
      if (g) { co.step = +g.dataset.goto; renderCheckout(); focusTitle(); }
      if (e.target.closest('[data-edit-bag]')) { closeLayer($('#checkoutSheet'), { restoreFocus: false }); openBag(); }
    });
  });

  /* ============================================================
     VERIFICAR GARRAFA — código digitado ou aproximação (NFC)
     ============================================================ */
  const verifyInput = $('#verifyInput'), verifyResult = $('#verifyResult'), verifyError = $('#verifyError');
  const CODE_RE = /^VS-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  function fmtCode(v) {
    let s = String(v).toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!s) return '';
    if (s.startsWith('VS')) s = s.slice(2);
    s = s.slice(0, 8);
    return 'VS-' + s.slice(0, 4) + (s.length > 4 ? '-' + s.slice(4) : '');
  }
  function runVerify(code) {
    verifyError.hidden = true; verifyInput.classList.remove('invalid');
    showResult(code);
    // no celular o resultado fica abaixo do formulário: rola até ele
    if (verifyResult.getBoundingClientRect().top > innerHeight - 120) verifyResult.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }
  const VR_HEAD = { ok: 'text-[#8ef5b0]', warn: 'text-[#ffd67a]', bad: 'text-[#ffaaa3]' };
  const vrUrl = (code) => `<p class="mx-auto mb-3.5 flex w-fit max-w-full items-center gap-1.5 rounded-full bg-white/8 px-3 py-1.5 font-mono text-[12px] leading-[1.2] font-medium text-[#c3cbd9] shadow-[inset_0_0_0_1px_rgba(255,255,255,.1)] ${VR_IN}">${icon('lock', 'size-[13px] stroke-[2.2] text-[#8ef5b0]')}<span>${esc(SITE_HOST)}/v/${esc(code.slice(3))}</span></p>`;
  const vrHead = (kind, title, sub) => `<div class="flex flex-col items-center gap-3 pt-1.5 pb-0.5 text-center">${medal(kind, 'now', '92px')}<div class="${VR_IN}" style="--d:.38s"><b class="block text-[clamp(28px,3vw,36px)] leading-none font-extrabold tracking-[-.03em] ${VR_HEAD[kind]}">${title}</b><span class="mt-1.5 block text-[14px] text-white/78">${sub}</span></div></div>`;
  // cls troca o tamanho/cor padrão do valor (text-[15px])
  const vrGrid = (cells, d) => `<dl class="mt-4 grid grid-cols-2 gap-x-[18px] gap-y-3.5 rounded-2xl bg-white/5 px-4 py-3.5 max-sm:gap-x-3 max-sm:gap-y-2.5 ${VR_IN}" style="--d:${d}">${cells.map(([k, v, cls]) => `<div><dt class="text-[12px] text-[#94a0b8]">${k}</dt><dd class="mt-0.5 font-semibold ${cls || 'text-[15px]'}">${v}</dd></div>`).join('')}</dl>`;
  const MONO = 'font-mono text-[14px] tracking-[.02em]';
  const vrNote = (text, d) => `<p class="mt-4 text-[14px] leading-normal text-[#c3cbd9] ${VR_IN}" style="--d:${d}">${text}</p>`;
  function showResult(code) {
    const s = seals[code];
    const p = s && byId[s.product];
    if (!s || !p || s.status === 'unknown') {
      verifyResult.dataset.state = 'bad';
      verifyResult.innerHTML = `<div class="w-full">${vrUrl(code)}
          ${vrHead('bad', 'Não reconhecido', 'Este código não existe na base VeriSeal.')}
          ${vrGrid([['Código', esc(code), MONO], ['Situação', 'sem registro', 'text-[15px] text-[#ff8a80]']], '.5s')}
          ${vrNote('Pode ser uma garrafa falsificada. Não consuma a bebida e avise a marca. Se a compra foi aqui, recuse a entrega e receba o valor integral.', '.6s')}
          <button class="btn btn-light btn-sm mt-4 ${VR_IN}" style="--d:.7s" type="button" data-report>Avisar a marca</button>
        </div>`;
      return;
    }
    s.checks = (s.checks || 0) + 1;
    persistSeal(code);
    const opened = s.status === 'opened';
    const product = `<div class="mt-4 flex items-center gap-4 rounded-2xl bg-white/7 px-4 py-3 ${VR_IN}" style="--d:.5s"><span class="flex h-[104px] w-[52px] shrink-0 items-end justify-center rounded-xl bg-[linear-gradient(#f4f8fd,#dfe7f2)] px-0.5 pt-1.5 pb-1 text-[13px] text-[#94a0b8]">${shot(p, { torn: opened })}</span><div><strong class="block text-[17px] tracking-[-.015em]">${esc(fullName(p))}</strong><span class="text-[13px] text-[#94a0b8]">${esc(p.volume)} · ${abv(p)} vol. · ${esc(p.origin)}</span></div></div>`;
    if (opened) {
      verifyResult.dataset.state = 'warn';
      verifyResult.innerHTML = `<div class="w-full">${vrUrl(code)}
          ${vrHead('warn', 'Já foi aberta', 'O circuito do lacre está rompido.')}
          ${product}
          ${vrGrid([['Lacre', esc(code), MONO], ['Lote', esc(s.lot)], ['1ª abertura', esc(s.openedAt), 'text-[15px] text-[#ffd67a]'], ['Verificações', s.checks]], '.6s')}
          ${vrNote('Comprou lacrada? Desconfie da procedência e fale com o vendedor. Nas compras feitas aqui, você pode recusar a entrega sem custo.', '.7s')}
        </div>`;
      return;
    }
    verifyResult.dataset.state = 'ok';
    // cada etapa da jornada entra 0,1 s depois da anterior
    const STEP_IN = ['animate-[riseIn_.45s_var(--ease-smooth)_calc(var(--d,0s)_+_.1s)_both]', 'animate-[riseIn_.45s_var(--ease-smooth)_calc(var(--d,0s)_+_.2s)_both]', 'animate-[riseIn_.45s_var(--ease-smooth)_calc(var(--d,0s)_+_.3s)_both]', 'animate-[riseIn_.45s_var(--ease-smooth)_calc(var(--d,0s)_+_.4s)_both]'];
    const step = (k, title, sub, now) => `<li class="relative ${STEP_IN[k]} pt-1 pb-2.5 [--rise:8px] before:absolute before:top-2 before:-left-6 before:size-2.5 before:rounded-full before:border-2 ${now ? 'before:border-[#30d158] before:bg-[#30d158] before:shadow-[0_0_0_5px_rgba(48,209,88,.2)]' : 'before:border-[#03adf9] before:bg-navy-ink'}"><b class="block text-[14px]">${title}</b><span class="block text-[12px] text-[#94a0b8]">${sub}</span></li>`;
    verifyResult.innerHTML = `<div class="w-full">${vrUrl(code)}
        ${vrHead('ok', 'Autêntico', 'Original · lacre íntegro, nunca aberto')}
        ${product}
        ${vrGrid([['Lacre', esc(code), MONO], ['Lote', esc(s.lot)], ['Produção', esc(s.made)], ['Verificações', s.checks]], '.6s')}
        <ol class="relative mt-[18px] pl-[26px] before:absolute before:top-2 before:bottom-2 before:left-[7px] before:w-0.5 before:bg-[linear-gradient(#03adf9,#30d158)] ${VR_IN}" style="--d:.7s">
          ${step(0, 'Produção', `${esc(s.made)} · linha de envase`)}
          ${step(1, 'Distribuidor autorizado', 'origem rastreada')}
          ${step(2, 'VeriSeal Delivery', `lacre conferido no envio · ${esc(s.sentAgo != null ? 'hoje · ' + hhmm(new Date(Date.now() - s.sentAgo * 60000)) : s.sentAt || 'antes do envio')}`)}
          ${step(3, 'Você', 'agora · lacre íntegro', true)}
        </ol>
      </div>`;
  }
  function persistSeal(code) {
    const mine = store.get('seals', {});
    if (mine[code]) { mine[code] = seals[code]; store.set('seals', mine); }
  }
  function verifyCode(code) {
    code = fmtCode(code);
    verifyInput.value = code;
    if (!CODE_RE.test(code)) {
      verifyError.textContent = 'Digite o código completo, no formato VS-XXXX-XXXX.';
      verifyError.hidden = false; verifyInput.classList.add('invalid'); verifyInput.focus();
      return;
    }
    runVerify(code);
  }
  safe('verify', () => {
    verifyInput.addEventListener('input', () => { verifyInput.value = fmtCode(verifyInput.value); verifyInput.classList.remove('invalid'); verifyError.hidden = true; });
    $('#verifyForm').addEventListener('submit', (e) => { e.preventDefault(); verifyCode(verifyInput.value); });
    $('#sampleCodes').innerHTML = (window.VSD_SAMPLE_CODES || []).map((c) => `<button class="rounded-full border border-line bg-white px-3 py-1.5 font-mono text-[13px] text-fg hover:border-fg-3" type="button" data-code="${c.code}">${c.code}<em class="ml-1.5 font-sans text-[12px] text-fg-2 not-italic">${esc(c.label)}</em></button>`).join('');
    $('#sampleCodes').addEventListener('click', (e) => { const b = e.target.closest('[data-code]'); if (b) verifyCode(b.dataset.code); });
    $('#nfcBtn').addEventListener('click', () => {
      const last = store.get('lastSeal', null);
      const code = last && seals[last] ? last : 'VS-7K2M-9QXA';
      verifyInput.value = code;
      runVerify(code);
    });
    verifyResult.addEventListener('click', (e) => { if (e.target.closest('[data-report]')) toast('Aviso enviado à marca. Obrigado por ajudar a combater falsificações.'); });
  });

  /* ============================================================
     COMO FUNCIONA — pedido → entrega → encosta o celular → resultado na web
     A foto do Jack Daniel's vira duas camadas: tampa (com a metade de
     cima do lacre) e garrafa. No modo "violado" a tampa gira e sobe,
     rompendo o lacre na linha de ruptura.
     ============================================================ */
  safe('how', () => {
    const scene = $('#howScene');
    const steps = $$('#howSteps li'), stepBtns = $$('#howSteps button');
    const seg = $('#howSeg'), segBtns = $$('button', seg), playBtn = $('#howPlay');
    const scr = { ok: $('[data-scr="ok"]', scene), bad: $('[data-scr="bad"]', scene) };
    const P = byId[DEMO], g = sealGeo(P);
    const hsBottle = $('#hsBottle');
    hsBottle.style.setProperty('--ar', `${P.size[0]} / ${P.size[1]}`);
    hsBottle.style.setProperty('--seal', g.nfc.toFixed(4));      // ondas e etiquetas saem do símbolo NFC
    hsBottle.style.setProperty('--seal-top', g.top.toFixed(4));  // o scanner desce a partir do topo da tira
    // recortes complementares: o da tampa invade 0,4% para baixo e esconde a emenda
    const zig = [];
    for (let k = 0; k <= 8; k++) zig.push([g.x - g.sw / 2 + (g.sw * k) / 8, g.y + (k % 2 ? 0.006 : -0.002)]);
    const pts = (a, dy = 0) => a.map(([x, y]) => `${pc(x)} ${pc(y + dy)}`).join(', ');
    const capClip = `polygon(0 0, 100% 0, 100% ${pc(g.y + 0.004)}, ${pts(zig.slice().reverse(), 0.004)}, 0 ${pc(g.y + 0.004)})`;
    const bodyClip = `polygon(0 ${pc(g.y)}, ${pts(zig)}, 100% ${pc(g.y)}, 100% 100%, 0 100%)`;
    const dot = 'absolute -top-[3px] size-[7px] rounded-full bg-[#ff5b4f] shadow-[0_0_10px_2px_rgba(255,91,79,.8)]';
    $('#hsPhoto').innerHTML = `
      <div class="absolute inset-0" style="clip-path:${bodyClip}">${shot(P, { eager: true, sealCls: '[.is-reading_&]:[filter:drop-shadow(0_0_7px_rgba(95,208,255,.95))_drop-shadow(0_0_2px_#fff)]' })}<span class="absolute size-0 opacity-0 [transition:opacity_.3s_.4s] [.is-bad.st-2_&]:opacity-100" style="left:${pc(g.x)};top:${pc(g.y)}"><i class="${dot} -left-3.5"></i><i class="${dot} left-[7px]"></i></span></div>
      <div class="absolute inset-0 [transition:transform_.9s_var(--ease-spring)] [.is-bad.st-2_&]:[transform:translate(6%,-3.4%)_rotate(-10deg)]" style="clip-path:${capClip};transform-origin:${pc(g.x + g.sw)} ${pc(g.y)}">${shot(P, { eager: true })}</div>`;
    $$('[data-thumb]', scene).forEach((el) => { el.innerHTML = shot(P, { torn: el.dataset.thumb === 'bad', cls: 'mt-[.6cqi] h-full' }); });
    $$('[data-medal]', scene).forEach((el) => { el.innerHTML = medal(el.dataset.medal, 'on', '26cqi'); });
    $$('[data-url]', scene).forEach((el) => { el.textContent = `${SITE_HOST}/${el.dataset.url}`; });
    $$('[data-prod]', scene).forEach((el) => { el.querySelector('b').textContent = P.name; el.querySelector('span').textContent = `${P.brand} · ${P.volume} · ${abv(P)}`; });
    const order = [[DEMO, 1], ['tanqueray', 1]];
    $('#dpItems').innerHTML = order.map(([id, q]) => {
      const p = byId[id];
      return `<li class="flex items-center gap-[3cqi] rounded-[4cqi] bg-white px-[3cqi] py-[2.2cqi] shadow-[0_.5cqi_2cqi_rgba(15,26,46,.08),0_0_0_.3cqi_rgba(15,26,46,.05)]"><span class="flex h-[15cqi] w-[8cqi] flex-none items-end justify-center">${shot(p)}</span><span class="min-w-0 flex-1"><b class="block truncate text-[3.9cqi] font-bold">${esc(p.name)}</b><span class="block text-[3.3cqi] text-[#6e6e73]">${esc(p.brand)} · ${q}×</span></span><b class="text-[3.7cqi] font-bold whitespace-nowrap">${money(p.price * q)}</b></li>`;
    }).join('');
    $('#dpTotal').textContent = money(pix(order.reduce((s, [id, q]) => s + byId[id].price * q, 0)));
    // horários do celular sempre relativos à hora atual
    const clock = () => {
      const now = Date.now(), at = (min) => hhmm(new Date(now + min * 60000));
      $$('[data-clock]', scene).forEach((t) => { t.textContent = at(0); });
      $('#dpEta').textContent = at(18);
      $('#apSent').textContent = 'hoje · ' + at(-24);
      $('#apBroken').textContent = 'hoje · ' + at(-3);
    };
    clock(); setInterval(clock, 30000);

    const DUR = [3.6, 4.2, 7.4];
    const OPEN = 0.3;   // na etapa 3, o ponto em que o navegador abre (já no resultado)
    let step = 0, local = 0, playing = !reduce, inView = false, started = false, bad = false, raf = 0, last = 0;
    function render() {
      const L = local, s2 = started && step === 2;
      scene.classList.toggle('is-started', started);
      ['st-0', 'st-1', 'st-2'].forEach((c, i) => scene.classList.toggle(c, started && step === i));
      scene.classList.toggle('is-scanned', started && step === 1 && L > 0.42);
      scene.classList.toggle('is-reading', s2 && L > 0.08 && L < OPEN + 0.04);
      scene.classList.toggle('ph-open', s2 && L >= OPEN);
      scene.classList.toggle('ph-result', s2 && L >= OPEN + 0.14);
      scr.ok.classList.toggle('is-on', s2 && L >= OPEN && !bad);
      scr.bad.classList.toggle('is-on', s2 && L >= OPEN && bad);
      steps.forEach((li, i) => {
        li.classList.toggle('is-active', started && i === step);
        li.classList.toggle('is-done', started && i < step);
        li.style.setProperty('--sp', !started ? 0 : i < step ? 1 : i === step ? L.toFixed(3) : 0);
        stepBtns[i].setAttribute('aria-current', started && i === step ? 'step' : 'false');
      });
    }
    function go(i, at = 0) { step = i; local = at; render(); }
    function setPlaying(v) {
      playing = v;
      scene.classList.toggle('is-paused', !v);
      playBtn.classList.toggle('is-playing', v);
      playBtn.setAttribute('aria-label', v ? 'Pausar demonstração' : 'Reproduzir demonstração');
      if (v) loop();
    }
    function setBad(v) {
      bad = v;
      segBtns.forEach((b) => { const on = (b.dataset.mode === 'bad') === v; b.setAttribute('aria-checked', String(on)); b.tabIndex = on ? 0 : -1; });
      seg.classList.toggle('is-bad', v);
      scene.classList.toggle('is-bad', v);
    }
    // reinicia a animação do resultado mesmo quando a mesma tela já está aberta
    const replay = () => { scr.ok.classList.remove('is-on'); scr.bad.classList.remove('is-on'); void scene.offsetWidth; };
    stepBtns.forEach((b, i) => b.addEventListener('click', () => { started = true; replay(); go(i, i === 2 && !playing ? OPEN : 0); }));
    playBtn.addEventListener('click', () => setPlaying(!playing));
    segBtns.forEach((b) => b.addEventListener('click', () => { setBad(b.dataset.mode === 'bad'); started = true; replay(); go(2, OPEN); }));
    seg.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      const next = segBtns.find((b) => b.getAttribute('aria-checked') !== 'true');
      next.click(); next.focus();
    });
    function frame(now) {
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      if (started && inView && playing) {
        local += dt / DUR[step];
        if (local >= 1) go((step + 1) % 3); else render();
      }
      raf = inView && playing ? requestAnimationFrame(frame) : 0;
    }
    function loop() { if (!raf && inView && playing) { last = 0; raf = requestAnimationFrame(frame); } }
    new IntersectionObserver((es) => es.forEach((e) => {
      inView = e.isIntersecting;
      if (inView && !started) { started = true; go(0); }
      loop();
    }), { threshold: 0.35 }).observe(scene);
    setPlaying(playing);
    render();
  });

  /* ---------- lacre interativo (raio-X) ---------- */
  safe('sealTile', () => { window.Seal.mount($('#tileSeal'), { serial: 'VS-7K2M-9QXA', pointerHost: $('#sealTile') }); });

  /* ============================================================
     CLIQUES DELEGADOS (sacola, produtos, endereço, categorias)
     ============================================================ */
  document.addEventListener('click', (e) => {
    const t = e.target;
    let el;
    if ((el = t.closest('[data-add]'))) { addToBag(el.dataset.add); refocus(el); return; }
    if ((el = t.closest('[data-inc]'))) {
      const id = el.dataset.inc, q = (bag.get(id) || 0) + 1;
      if (q > MAX_QTY) { toast(`Máximo de ${MAX_QTY} unidades por item.`); return; }
      setQty(id, q); refocus(el); return;
    }
    if ((el = t.closest('[data-dec]'))) { setQty(el.dataset.dec, (bag.get(el.dataset.dec) || 0) - 1); refocus(el); return; }
    if ((el = t.closest('[data-remove]'))) {
      const id = el.dataset.remove, q = bag.get(id);
      setQty(id, 0);
      toast(`${fullName(byId[id])} removido.`, 'Desfazer', () => setQty(id, q));
      return;
    }
    if ((el = t.closest('[data-open]'))) { e.preventDefault(); openProduct(el.dataset.open); return; }
    if ((el = t.closest('[data-open-bag]'))) { e.preventDefault(); openBag(); return; }
    if ((el = t.closest('[data-open-address]'))) { e.preventDefault(); closeMenus(); openAddress(); return; }
    if ((el = t.closest('[data-verify-code]'))) {
      const code = el.dataset.verifyCode;
      if (stack.length) [...stack].reverse().forEach((s) => closeLayer(s.el, { restoreFocus: false }));
      $('#verificar').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      setTimeout(() => verifyCode(code), reduce ? 0 : 500);
      return;
    }
    if ((el = t.closest('a[data-cat]'))) { setFilter({ cat: el.dataset.cat, q: '' }); closeMenus(); return; }
    if ((el = t.closest('[data-card]')) && !t.closest('[data-cta], button, a, input, select')) {
      const o = el.querySelector('[data-open]');
      if (o) openProduct(o.dataset.open);
    }
  });

  updateBagUI();
})();
