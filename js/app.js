/* =========================================================
   VeriSeal Delivery — app
   Loja, sacola, checkout e verificação de lacres. As garrafas
   são as fotos reais de assets/products/ e o lacre VeriSeal é
   desenhado por cima do gargalo de cada uma (js/seal.js).
   A demonstração "Como funciona" segue a da landing da
   VeriSeal: o celular se aproxima do lacre, as ondas NFC saem
   do gargalo, o app abre e mostra se a garrafa é original.
   ========================================================= */
(() => {
  'use strict';

  /* ---------- utilidades ---------- */
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
  const icon = (name, cls = '') => `<svg class="i ${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const vsMark = (cls = '') => `<svg class="${cls}" viewBox="0 0 668 359" aria-hidden="true"><use href="#vs-mark"/></svg>`;

  const store = {
    get(k, d) { try { const v = localStorage.getItem('vsd:' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem('vsd:' + k, JSON.stringify(v)); } catch { /* armazenamento indisponível */ } }
  };

  /* ---------- regras da loja ---------- */
  const PIX_OFF = 0.05, FREE_SHIP = 199, SHIP_FEE = 9.9, MAX_QTY = 12, MAX_INST = 6, MIN_INST = 30;
  const OPEN_H = 8, CLOSE_H = 3;    // aberto das 8h às 3h da manhã
  const storeOpen = (d = new Date()) => d.getHours() >= OPEN_H || d.getHours() < CLOSE_H;

  /* ---------- catálogo ---------- */
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
  function shot(p, o = {}) {
    const g = sealGeo(p);
    const seal = o.seal === false ? '' : `<svg class="neck-seal" viewBox="0 0 40 110" preserveAspectRatio="none" aria-hidden="true" focusable="false" style="left:${pc(g.x)};top:${pc(g.top)};width:${pc(g.sw)};height:${pc(g.sh)}"><use href="#vs-neck${o.torn ? '-torn' : ''}"/></svg>`;
    return `<span class="shot${o.cls ? ' ' + o.cls : ''}" style="--ar:${p.size[0]} / ${p.size[1]}"><img src="${esc(p.img)}" alt="${esc(o.alt || '')}" width="${p.size[0]}" height="${p.size[1]}" loading="${o.eager ? 'eager' : 'lazy'}" decoding="async" draggable="false">${seal}</span>`;
  }
  function visual(p, o = {}) {
    if (isKit(p)) return `<span class="kit-shots n${p.bottles.length}">${p.bottles.map((b) => shot(b, o)).join('')}</span>`;
    return shot(p, o);
  }
  const badgeHTML = (p) => (isKit(p) ? `<span class="pc-badge sale">-${pct(p)}% no kit</span>`
    : p.oldPrice ? `<span class="pc-badge sale">-${pct(p)}%</span>`
    : p.badge ? `<span class="pc-badge">${esc(p.badge)}</span>` : '');
  const priceHTML = (p) => `<div class="prices">
      ${p.oldPrice ? `<s class="price-old">${money(p.oldPrice)}</s>` : ''}
      <span class="price-now">${money(p.price)}</span>
      <span class="price-pix">${money(pix(p.price))} no Pix</span>
    </div>`;

  /* ---------- botão + / seletor de quantidade (estilo apps de delivery) ---------- */
  const bag = new Map(Object.entries(store.get('bag', {})).filter(([id, q]) => byId[id] && q > 0));
  function ctaInner(id) {
    const q = bag.get(id) || 0, p = byId[id];
    if (!q) return `<button class="add-btn" type="button" data-add="${id}" aria-label="Adicionar ${esc(fullName(p))} à sacola">${icon('plus')}</button>`;
    return `<div class="qty" role="group" aria-label="${esc(fullName(p))} na sacola">
      <button type="button" data-dec="${id}" aria-label="Remover uma unidade">${icon(q === 1 ? 'close' : 'minus')}</button>
      <span aria-live="polite">${q}</span>
      <button type="button" data-inc="${id}" aria-label="Adicionar uma unidade">${icon('plus')}</button>
    </div>`;
  }
  const cta = (id) => `<div class="cta" data-cta="${id}">${ctaInner(id)}</div>`;
  const refreshCTAs = (id) => $$(`[data-cta="${id}"]`).forEach((el) => { el.innerHTML = ctaInner(id); });

  function cardHTML(p, i = 0) {
    const kit = isKit(p);
    return `<article class="p-card${kit ? ' is-kit' : ''}" style="--i:${Math.min(i, 12)}">
      <div class="pc-media">
        ${badgeHTML(p)}
        <span class="pc-seal">${vsMark()}${kit ? p.bottles.length + ' lacres' : 'Lacrado'}</span>
        <div class="pc-img">${visual(p)}</div>
      </div>
      <div class="pc-body">
        <p class="pc-brand">${esc(kit ? `Kit · ${p.bottles.length} garrafas` : p.brand)}</p>
        <h3 class="pc-name"><button type="button" class="pc-open" data-open="${p.id}">${esc(p.name)}</button></h3>
        <p class="pc-meta">${esc(kit ? kitGroups(p).map(([b, n]) => (n > 1 ? n + '× ' : '') + b.brand).join(' · ') : `${p.volume} · ${abv(p)}`)}</p>
        <div class="pc-bottom">${priceHTML(p)}${cta(p.id)}</div>
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
    const layer = c.closest('.sheet, .drawer');
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
    toastEl.innerHTML = `<span>${esc(msg)}</span>${action ? `<button type="button">${esc(action)}</button>` : ''}`;
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
    $('#locText').textContent = addr ? `${placeLabel(addr)} · ${etaText(addr)}` : 'Informe seu CEP';
    $('#locBtn').classList.toggle('has-cep', !!addr);
    $('#locBtn').setAttribute('aria-label', addr ? `Entrega em ${placeLabel(addr)}, ${etaText(addr)}. Alterar endereço` : 'Informar CEP de entrega');
    $('#helpEta').textContent = addr ? etaText(addr) : '30–60 min';
    const info = $('#heroCepInfo');
    if (addr) { info.textContent = deliveryMsg(addr); info.className = 'dc-info ok'; $('#heroCep').value = addr.cep; }
    if (stack.some((s) => s.el.id === 'bagDrawer')) renderBag();
  }
  function maskCep(input) { input.addEventListener('input', () => { input.value = fmtCep(input.value); input.classList.remove('invalid'); }); }
  async function submitCep(input, info, baseCls) {
    info.className = baseCls;
    info.textContent = 'Consultando o CEP…';
    const r = await lookupCep(input.value);
    if (r.error) {
      info.textContent = r.error; info.className = baseCls + ' err';
      input.classList.add('invalid'); input.focus();
      return null;
    }
    setAddr(r);
    info.textContent = deliveryMsg(r); info.className = baseCls + ' ok';
    return r;
  }

  safe('cep', () => {
    const heroIn = $('#heroCep'), addrIn = $('#addrCep');
    maskCep(heroIn); maskCep(addrIn);
    $('#heroCepForm').addEventListener('submit', (e) => { e.preventDefault(); submitCep(heroIn, $('#heroCepInfo'), 'dc-info'); });
    $('#addrForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const r = await submitCep(addrIn, $('#addrInfo'), 'cep-info');
      if (r) setTimeout(() => closeLayer($('#addressSheet')), 1100);
    });
    updateAddrUI();
  });
  function openAddress() {
    const input = $('#addrCep'), info = $('#addrInfo');
    input.value = addr ? addr.cep : '';
    info.textContent = addr ? deliveryMsg(addr) : '';
    info.className = 'cep-info' + (addr ? ' ok' : '');
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
      searchResults.innerHTML = `<li class="sr-terms">${POPULAR.map((t) => `<button type="button" class="sr-term" data-term="${esc(t)}">${icon('search')}${esc(t)}</button>`).join('')}</li>`;
      return;
    }
    const res = PRODUCTS.filter((p) => matches(p, q));
    searchLabel.textContent = res.length ? `${res.length} ${res.length === 1 ? 'resultado' : 'resultados'}` : `Nenhum resultado para “${q}”`;
    searchResults.innerHTML = res.slice(0, 6).map((p) => `<li><button type="button" class="sr-item" data-open="${p.id}">
        <span class="sr-thumb">${visual(p)}</span>
        <span class="sr-name"><b>${esc(fullName(p))}</b><small>${esc(isKit(p) ? meta(p) : `${p.volume} · lacre VeriSeal`)}</small></span>
        <span class="sr-price">${money(p.price)}</span></button></li>`).join('')
      + (res.length > 6 ? `<li><button type="button" class="sr-all" data-search-all="${esc(q)}">${icon('search')}Ver os ${res.length} resultados</button></li>` : '');
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
    // horário da loja
    const chip = $('#openChip');
    const tick = () => {
      const open = storeOpen();
      chip.classList.toggle('is-closed', !open);
      chip.querySelector('span').textContent = open ? `Aberto agora · até ${CLOSE_H}h` : `Fechado · abrimos às ${OPEN_H}h`;
    };
    tick(); setInterval(tick, 60000);
  });

  /* ============================================================
     DESTAQUES — carrossel com as fotos de ambiente
     ============================================================ */
  const SLIDES = [
    {
      id: 'absolut-1l', theme: 's-absolut', photo: 'assets/photos/absolut-party.webp',
      alt: 'Garrafa de Absolut Vodka numa mesa de festa, entre um gin tônica e um espresso martini',
      eyebrow: 'Oferta da semana', title: 'Sexta pede Absolut.',
      sub: 'Absolut Vodka 1 L, original e lacrada, na sua porta em até 60 minutos.'
    },
    {
      id: 'tanqueray', theme: 's-gin', photo: 'assets/photos/tanqueray-gt.webp',
      alt: 'Garrafa de Tanqueray London Dry ao lado de uma taça de gin tônica com limão',
      eyebrow: 'Gin tônica perfeito', title: (p) => `Tanqueray com ${pct(p)}% off.`,
      sub: 'O London Dry do gin tônica clássico, com lacre VeriSeal conferido no envio.'
    },
    {
      id: 'kit-jack-trio', theme: 's-jack', bottles: ['jack-apple', 'jack-7', 'jack-fire'],
      eyebrow: 'Kit mais pedido', title: "Família Jack Daniel's.",
      sub: 'Old No.7, Apple e Fire: três garrafas, três lacres, uma entrega.'
    }
  ];
  function slideHTML(s, i, n) {
    const p = byId[s.id];
    return `<article class="slide ${s.theme}" role="group" aria-roledescription="slide" aria-label="${i + 1} de ${n}">
      ${s.photo ? `<img class="slide-bg" src="${s.photo}" alt="${esc(s.alt)}" ${i ? 'loading="lazy"' : 'fetchpriority="high"'} decoding="async">` : ''}
      ${s.bottles ? `<div class="slide-bottles" aria-hidden="true">${s.bottles.map((id) => shot(byId[id], { eager: true })).join('')}</div>` : ''}
      <div class="slide-copy">
        <p class="slide-eyebrow">${esc(s.eyebrow)}</p>
        <h2>${esc(typeof s.title === 'function' ? s.title(p) : s.title)}</h2>
        <p class="slide-sub">${esc(s.sub)}</p>
        <p class="slide-price">${p.oldPrice ? `<s>${money(p.oldPrice)}</s>` : ''}<b>${money(p.price)}</b><span>${money(pix(p.price))} no Pix</span></p>
        <div class="slide-ctas">
          <button class="btn btn-light" type="button" data-add="${p.id}" aria-label="Adicionar ${esc(fullName(p))} à sacola">${icon('plus')}Adicionar</button>
          <button class="slide-more" type="button" data-open="${p.id}">Ver detalhes ${icon('chev-r')}</button>
        </div>
      </div>
      <span class="slide-seal">${vsMark()}Lacre VeriSeal</span>
    </article>`;
  }
  safe('promo', () => {
    const promo = $('#promo'), track = $('#promoTrack'), dotsEl = $('#promoDots');
    track.innerHTML = SLIDES.map((s, i) => slideHTML(s, i, SLIDES.length)).join('');
    dotsEl.innerHTML = SLIDES.map((s, i) => `<button type="button" data-dot="${i}" aria-label="Ver destaque ${i + 1}"></button>`).join('');
    const slides = $$('.slide', track), dots = $$('[data-dot]', dotsEl);
    let cur = 0, timer = 0, hold = false, visible = true;
    const goTo = (i, smooth = true) => {
      cur = (i + slides.length) % slides.length;
      track.scrollTo({ left: cur * track.clientWidth, behavior: smooth && !reduce ? 'smooth' : 'auto' });
    };
    const sync = () => {
      cur = clamp(Math.round(track.scrollLeft / Math.max(1, track.clientWidth)), 0, slides.length - 1);
      dots.forEach((d, k) => d.setAttribute('aria-current', String(k === cur)));
      slides.forEach((s, k) => { s.inert = k !== cur; });
    };
    const restart = () => {
      clearInterval(timer);
      if (!reduce) timer = setInterval(() => { if (!hold && visible && !document.hidden) goTo(cur + 1); }, 6500);
    };
    let st = 0;
    track.addEventListener('scroll', () => { clearTimeout(st); st = setTimeout(sync, 90); }, { passive: true });
    dotsEl.addEventListener('click', (e) => { const d = e.target.closest('[data-dot]'); if (d) { goTo(+d.dataset.dot); restart(); } });
    $$('[data-promo]').forEach((b) => b.addEventListener('click', () => { goTo(cur + +b.dataset.promo); restart(); }));
    promo.addEventListener('pointerenter', () => { hold = true; });
    promo.addEventListener('pointerleave', () => { hold = false; });
    promo.addEventListener('focusin', () => { hold = true; });
    promo.addEventListener('focusout', () => { hold = false; });
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(promo);
    addEventListener('resize', () => goTo(cur, false));
    sync(); restart();
  });

  /* ---------- cartão VeriSeal do topo: mini-verificação em loop ---------- */
  safe('vsCard', () => {
    const p = byId['jw-black'], g = sealGeo(p);
    const stage = $('#vcStage');
    stage.innerHTML = `
      <div class="vc-glow"></div>
      <div class="vc-bottle" style="--nfc:${g.nfc.toFixed(4)};--ar:${p.size[0]} / ${p.size[1]}">${shot(p, { eager: true })}
        <span class="vc-rings"><i></i><i></i><i></i></span>
        <span class="vc-ok">${icon('check')}Original · lacre íntegro</span>
      </div>
      <div class="vc-phone"><div class="vc-screen">
        <span class="vcs vcs-1">${icon('contactless')}<b>Aproxime do lacre</b></span>
        <span class="vcs vcs-2"><i class="vcs-spin"></i><b>Lendo o lacre…</b></span>
        <span class="vcs vcs-3"><svg class="vcs-badge" aria-hidden="true"><use href="#i-verified"/></svg><b>Autêntico</b><small>Nunca aberta</small></span>
      </div></div>`;
    // a animação só roda com o cartão na tela
    new IntersectionObserver(([e]) => stage.classList.toggle('is-paused', !e.isIntersecting)).observe(stage);
  });

  /* ============================================================
     CATEGORIAS, OFERTAS, MAIS PEDIDOS E KITS
     ============================================================ */
  safe('categories', () => {
    const tiles = [
      { go: 'ofertas', name: 'Ofertas', cls: 'ct-hot', html: `<span class="ct-ic">${icon('tag')}</span><span class="ct-pct">-${Math.max(...PRODUCTS.map(pct))}%</span>` },
      ...CATS.map((c) => ({ go: c.id, name: c.name, tint: c.tint, html: byId[c.icon] ? visual(byId[c.icon]) : '' })),
      { go: 'verificar', name: 'Verificar lacre', cls: 'ct-seal', html: `<span class="ct-ic">${icon('contactless')}</span>${vsMark('ct-mark')}` }
    ];
    $('#catRow').innerHTML = tiles.map((t) => `<button class="cat-tile ${t.cls || ''}" type="button" data-cat-go="${t.go}">
        <span class="ct-img"${t.tint ? ` style="--tint:${t.tint}"` : ''}>${t.html}</span><span class="ct-name">${esc(t.name)}</span></button>`).join('');
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
    $$('.rail').forEach((r) => { r.addEventListener('scroll', () => update(r), { passive: true }); addEventListener('resize', () => update(r)); update(r); });

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
    $('#kitGrid').innerHTML = PRODUCTS.filter(isKit).map((p, i) => `<article class="kit-card" style="--i:${i}">
        <div class="kc-media">${badgeHTML(p)}<span class="pc-seal">${vsMark()}${p.bottles.length} lacres</span><div class="kc-img">${visual(p)}</div></div>
        <div class="kc-info">
          <p class="kc-eyebrow">${esc(p.badge || 'Kit')}</p>
          <h3 class="kc-name"><button type="button" class="pc-open" data-open="${p.id}">${esc(p.name)}</button></h3>
          <ul class="kc-items">${kitGroups(p).map(([b, n]) => `<li><span>${n > 1 ? n + '× ' : ''}${esc(b.brand)} ${esc(b.name)}</span><small>${esc(b.volume)}</small></li>`).join('')}</ul>
          <div class="pc-bottom">${priceHTML(p)}${cta(p.id)}</div>
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
      `<button class="chip${filter.cat === c.id ? ' is-active' : ''}" type="button" data-chip="${c.id}" aria-pressed="${filter.cat === c.id}">${esc(c.name)}</button>`).join('');
  }
  function renderBrands() {
    const brands = filter.cat === 'all' || filter.cat === 'kits' ? [] : [...new Set(PRODUCTS.filter((p) => p.category === filter.cat).map((p) => p.brand))];
    brandRow.hidden = brands.length < 2;
    if (brandRow.hidden) { brandRow.innerHTML = ''; return; }
    brandRow.innerHTML = `<span class="br-label">Marcas:</span>` + [null, ...brands].map((b) =>
      `<button class="brand-btn${filter.brand === b ? ' is-active' : ''}" type="button" data-brand="${esc(b || '')}" aria-pressed="${filter.brand === b}">${esc(b || 'Todas')}</button>`).join('');
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
    return `<li class="bag-item">
      <div class="bag-thumb">${visual(p)}</div>
      <div class="bag-info">
        <strong>${esc(isKit(p) ? shortName(p) : fullName(p))}</strong>
        <small>${esc(isKit(p) ? meta(p) : `${p.volume} · lacre VeriSeal`)}</small>
        <div class="bag-row">
          <div class="stepper sm" role="group" aria-label="Quantidade">
            <button type="button" data-dec="${p.id}" aria-label="Remover uma unidade de ${esc(fullName(p))}">−</button>
            <span>${q}</span>
            <button type="button" data-inc="${p.id}" aria-label="Adicionar uma unidade de ${esc(fullName(p))}"${q >= MAX_QTY ? ' disabled' : ''}>+</button>
          </div>
          <span class="bag-price">${money(p.price * q)}</span>
        </div>
        <button class="bag-remove" type="button" data-remove="${p.id}">Remover</button>
      </div>
    </li>`;
  }
  function renderBag() {
    const bb = $('#bagBody'), bf = $('#bagFoot');
    if (!bag.size) {
      bb.innerHTML = `<div class="bag-empty">${icon('bag')}<p>Sua sacola está vazia.</p><a class="btn btn-primary" href="#ofertas" data-close>Ver ofertas</a></div>`;
      bf.innerHTML = ''; bf.hidden = true;
      return;
    }
    bf.hidden = false;
    const sub = subtotal(), ship = shipping(sub), left = Math.max(0, FREE_SHIP - sub);
    const units = [...bag].reduce((s, [id, q]) => s + q * (isKit(byId[id]) ? byId[id].bottles.length : 1), 0);
    bb.innerHTML = `
      <div class="free-ship">
        <p>${left > 0 ? `Faltam <strong>${money(left)}</strong> para o frete grátis.` : `<strong>Frete grátis</strong> garantido neste pedido.`}</p>
        <div class="bar"><i style="width:${Math.min(100, (sub / FREE_SHIP) * 100).toFixed(1)}%"></i></div>
      </div>
      <p class="bag-seals">${vsMark()}<span><b>${units} ${units === 1 ? 'garrafa lacrada' : 'garrafas lacradas'}</b> · cada uma com o próprio lacre VeriSeal</span></p>
      <ul class="bag-list">${[...bag].map(([id, q]) => bagItemHTML(byId[id], q)).join('')}</ul>`;
    bf.innerHTML = `
      ${addr
        ? `<p class="bag-addr">${icon('pin')}<span>Entregar em <b>${esc(placeLabel(addr))}</b> · ${etaText(addr)}</span><button class="link-btn" type="button" data-open-address>Alterar</button></p>`
        : `<form class="bag-cep" id="bagCepForm" novalidate><input id="bagCep" inputmode="numeric" placeholder="CEP para calcular o frete" maxlength="9" aria-label="CEP de entrega" autocomplete="postal-code"><button class="btn btn-dark btn-sm" type="submit">OK</button></form><p class="cep-info" id="bagCepInfo" aria-live="polite"></p>`}
      <div class="totals">
        <div><span>Subtotal</span><span>${money(sub)}</span></div>
        <div><span>Entrega</span><span class="${ship ? '' : 'free'}">${ship ? money(ship) : 'Grátis'}</span></div>
        <div class="grand"><span>Total</span><span>${money(sub + ship)}</span></div>
        <div class="pix-line"><span>ou ${money(pix(sub) + ship)} no Pix</span></div>
      </div>
      <button class="btn btn-primary btn-block" type="button" id="goCheckout"${storeOpen() ? '' : ' data-closed'}>Finalizar pedido</button>
      <p class="seal-note">${vsMark()}<span>Toda garrafa sai com lacre VeriSeal conferido. Lacre violado? Recuse sem custo.</span></p>`;
    const form = $('#bagCepForm');
    if (form) {
      const input = $('#bagCep');
      maskCep(input);
      form.addEventListener('submit', (e) => { e.preventDefault(); submitCep(input, $('#bagCepInfo'), 'cep-info'); });
    }
    $('#goCheckout').addEventListener('click', openCheckout);
  }
  function openBag() { closeMenus(); renderBag(); openLayer($('#bagDrawer'), $('#bagDrawer .close-btn')); }

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
      media.innerHTML = `<div class="pp-kit">${visual(p, { eager: true })}</div><p class="pp-media-note">${vsMark()}${p.bottles.length} garrafas, cada uma com o próprio lacre</p>`;
    } else {
      const g = sealGeo(p);
      const views = [
        { html: `<div class="pp-bottle" style="--nfc:${g.nfc.toFixed(4)};--sw:${g.sw}">${shot(p, { eager: true, alt: fullName(p) })}<div class="nfc-rings"><span></span><span></span><span></span></div><span class="seal-pin"><i></i>Lacre VeriSeal · NFC</span></div>`, thumb: p.img, label: 'Garrafa com o lacre' },
        ...(p.gallery || []).map((x) => ({ html: `<img class="pp-alt" src="${esc(x.src)}" alt="${esc(`${fullName(p)} — ${x.label.toLowerCase()}`)}" width="${x.size[0]}" height="${x.size[1]}">`, thumb: x.src, label: x.label }))
      ];
      media.innerHTML = `<div class="pp-stage">${views.map((v, k) => `<div class="pp-view${k ? '' : ' is-on'}" data-view="${k}">${v.html}</div>`).join('')}</div>
        ${views.length > 1 ? `<div class="pp-thumbs" role="group" aria-label="Fotos do produto">${views.map((v, k) => `<button type="button" data-view-btn="${k}" aria-pressed="${!k}" aria-label="${esc(v.label)}"><img src="${esc(v.thumb)}" alt=""></button>`).join('')}</div>` : ''}
        <p class="pp-media-note">${vsMark()}Lacre conferido antes do envio</p>`;
      $$('[data-view-btn]', media).forEach((b) => b.addEventListener('click', () => {
        $$('[data-view]', media).forEach((v) => v.classList.toggle('is-on', v.dataset.view === b.dataset.viewBtn));
        $$('[data-view-btn]', media).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      }));
    }
    $('#ppInfo').innerHTML = `
      <p class="pp-badge">${p.oldPrice ? `<span class="sale-tag">-${pct(p)}%${kit ? ' no kit' : ' esta semana'}</span>` : esc(p.badge || '')}</p>
      <p class="pp-brand">${esc(kit ? `Kit · ${p.bottles.length} garrafas` : p.brand)}</p>
      <h2 class="pp-name" id="ppTitle">${esc(p.name)}</h2>
      <div class="pp-price">${p.oldPrice ? `<s>${money(p.oldPrice)}</s>` : ''}<b>${money(p.price)}</b></div>
      <p class="pp-inst"><strong>${money(pix(p.price))} no Pix</strong> (5% off)${i ? ` · ou ${i.n}x de ${money(i.v)} sem juros` : ''}</p>
      <p class="pp-desc">${esc(p.desc)}</p>
      ${kit
        ? `<ul class="pp-kit-list">${kitGroups(p).map(([b, n]) => `<li><span class="pk-thumb">${shot(b)}</span><span><b>${n > 1 ? n + '× ' : ''}${esc(b.brand)} ${esc(b.name)}</b><small>${esc(b.volume)} · ${abv(b)} vol. · ${esc(b.origin)}</small></span></li>`).join('')}</ul>`
        : `<div class="pp-specs"><div><span>Volume</span><strong>${esc(p.volume)}</strong></div><div><span>Teor alcoólico</span><strong>${abv(p)}</strong></div><div><span>Origem</span><strong>${esc(p.origin)}</strong></div></div>`}
      <div class="pp-notes">${(p.notes || []).map((n) => `<span>${esc(n)}</span>`).join('')}</div>
      <div class="pp-seal">${vsMark()}<div><strong>Lacre VeriSeal${kit ? ' em cada garrafa' : ''}</strong><p>Conferido no nosso centro antes do envio. Ao receber, aproxime o celular do lacre e confirme que a bebida é original e nunca foi aberta.</p></div></div>
      <p class="pp-ship">${addr
        ? `${icon('truck')}<span>Chega em <b>${etaText(addr)}</b> em ${esc(placeLabel(addr))}${pix(p.price) >= FREE_SHIP ? ' · frete grátis' : ''}</span>`
        : `${icon('pin')}<span><button class="link-btn" type="button" data-open-address>Informe seu CEP</button> para ver o prazo de entrega.</span>`}</p>
      <div class="pp-buy">
        <div class="stepper" role="group" aria-label="Quantidade">
          <button type="button" data-pp="-1" aria-label="Diminuir quantidade">−</button><span id="ppQty">1</span><button type="button" data-pp="1" aria-label="Aumentar quantidade">+</button>
        </div>
        <button class="btn btn-primary" type="button" id="ppAdd" data-autofocus>Adicionar · ${money(p.price)}</button>
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
    $('#productSheet .sheet-panel').scrollTop = 0;
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
  const stepsBar = (n) => `<div class="co-steps" aria-hidden="true">${[0, 1, 2].map((i) => `<span class="${i <= n ? 'done' : ''}"></span>`).join('')}</div>
    <p class="co-stepname">Etapa ${n + 1} de 3</p>`;

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
  function field(id, label, value, attrs = '', opt = false) {
    return `<div class="field"><label for="${id}">${label}${opt ? ' <span class="optional">(opcional)</span>' : ''}</label>
      <input id="${id}" name="${id.replace('co', '').toLowerCase()}" value="${esc(value)}" ${attrs}><span class="field-msg" hidden></span></div>`;
  }
  function renderCheckout() {
    const el = $('#checkoutContent');
    const d = co.d;
    const t = coTotals();
    if (co.step === 0) {
      const sl = slots();
      el.innerHTML = `<h2 class="co-title">Entrega</h2>${stepsBar(0)}
        <form class="co-form" id="coForm" novalidate>
          <div class="field-row">${field('coName', 'Nome completo', d.name, 'autocomplete="name" required')}${field('coPhone', 'Celular (WhatsApp)', d.phone, 'type="tel" inputmode="tel" autocomplete="tel" placeholder="(11) 98765-4321" required')}</div>
          <div class="field-row"><div class="f-cep">${field('coCep', 'CEP', d.cep, 'inputmode="numeric" maxlength="9" autocomplete="postal-code" required')}</div><div class="f-grow">${field('coStreet', 'Rua', d.street, 'autocomplete="address-line1" required')}</div></div>
          <div class="field-row"><div class="f-num">${field('coNumber', 'Número', d.number, 'inputmode="numeric" required')}</div><div class="f-grow">${field('coComp', 'Complemento', d.comp, 'autocomplete="address-line2"', true)}</div></div>
          <div class="field-row">${field('coBairro', 'Bairro', d.bairro, 'required')}${field('coCity', 'Cidade/UF', d.city, 'required')}</div>
          <fieldset class="co-when">
            <legend class="co-sub">Quando entregar?</legend>
            <label class="pay-opt"><input type="radio" name="when" value="now"${d.when === 'now' ? ' checked' : ''}${storeOpen() ? '' : ' disabled'}>
              <span class="po-ic">${icon('moto')}</span><span><strong>Agora</strong><small>${storeOpen() ? `Chega em ${addr ? etaText(addr) : '30–60 min'}` : `Abrimos às ${OPEN_H}h — agende a entrega`}</small></span></label>
            <label class="pay-opt"><input type="radio" name="when" value="later"${d.when === 'later' ? ' checked' : ''}>
              <span class="po-ic">${icon('clock')}</span><span><strong>Agendar</strong><small>Escolha uma janela de 30 minutos</small></span></label>
            <div class="pay-extra" data-for="later"${d.when === 'later' ? '' : ' hidden'}><div class="field"><label for="coSlot">Horário</label>
              <select id="coSlot" name="slot">${sl.map((s) => `<option${s === d.slot ? ' selected' : ''}>${s}</option>`).join('')}</select></div></div>
          </fieldset>
          <label class="check"><input type="checkbox" name="gift"${d.gift ? ' checked' : ''}><span>${icon('gift')}É presente? Incluir cartão com mensagem</span></label>
          <div class="field" data-gift${d.gift ? '' : ' hidden'}><label for="coGiftMsg">Mensagem do cartão</label>
            <textarea id="coGiftMsg" name="giftmsg" maxlength="140" rows="2" placeholder="Ex.: Feliz aniversário! Saúde!">${esc(d.giftMsg)}</textarea>
            <span class="field-hint">Até 140 caracteres. O cartão não mostra preços.</span></div>
          <div class="co-actions"><button type="button" class="btn btn-ghost" data-close>Cancelar</button><button type="submit" class="btn btn-primary">Continuar para pagamento</button></div>
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
      el.innerHTML = `<h2 class="co-title">Pagamento</h2>${stepsBar(1)}
        <form class="co-form" id="coForm" novalidate>
          <fieldset class="pay-options"><legend class="visually-hidden">Forma de pagamento</legend>
            <label class="pay-opt"><input type="radio" name="pay" value="pix"${d.pay === 'pix' ? ' checked' : ''}>
              <span class="po-ic">${icon('pix')}</span><span><strong>Pix · 5% off</strong><small>Você economiza ${money(t.sub * PIX_OFF)} · aprovação na hora</small></span></label>
            <label class="pay-opt"><input type="radio" name="pay" value="card"${d.pay === 'card' ? ' checked' : ''}>
              <span class="po-ic">${icon('card')}</span><span><strong>Cartão de crédito</strong><small>${i ? `Em até ${i.n}x de ${money(i.v)} sem juros` : 'À vista'}</small></span></label>
            <div class="pay-extra" data-for="card"${d.pay === 'card' ? '' : ' hidden'}><div class="field"><label for="coInst">Parcelas</label>
              <select id="coInst" name="inst">${Array.from({ length: i ? i.n : 1 }, (_, k) => k + 1).map((k) => `<option value="${k}"${+d.inst === k ? ' selected' : ''}>${k}x de ${money((t.sub + t.ship) / k)} sem juros</option>`).join('')}</select></div></div>
            <label class="pay-opt"><input type="radio" name="pay" value="cod"${d.pay === 'cod' ? ' checked' : ''}>
              <span class="po-ic">${icon('cash')}</span><span><strong>Pagar na entrega</strong><small>Cartão ou dinheiro, direto com o entregador</small></span></label>
            <div class="pay-extra" data-for="cod"${d.pay === 'cod' ? '' : ' hidden'}><div class="field"><label for="coChange">Troco para <span class="optional">(opcional)</span></label>
              <input id="coChange" name="change" inputmode="decimal" placeholder="Ex.: 300" value="${esc(d.change)}"></div></div>
          </fieldset>
          <p class="co-demo">Ambiente de demonstração: nenhum pagamento é processado.</p>
          <div class="co-actions"><button type="button" class="btn btn-ghost" data-back>Voltar</button><button type="submit" class="btn btn-primary">Revisar pedido</button></div>
        </form>`;
      const f = $('#coForm');
      f.addEventListener('change', (e) => {
        if (e.target.name !== 'pay') return;
        $$('.pay-extra', f).forEach((x) => { x.hidden = x.dataset.for !== e.target.value; });
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
      el.innerHTML = `<h2 class="co-title">Revisão</h2>${stepsBar(2)}
        <div class="co-review"><h4>Itens <button class="link-btn" type="button" data-edit-bag>Editar</button></h4>
          <ul>${[...bag].map(([id, q]) => `<li><span>${q}× ${esc(fullName(byId[id]))}</span><span>${money(byId[id].price * q)}</span></li>`).join('')}</ul></div>
        <div class="co-review"><h4>Entrega <button class="link-btn" type="button" data-goto="0">Alterar</button></h4>
          <p>${esc(d.street)}, ${esc(d.number)}${d.comp ? ' — ' + esc(d.comp) : ''}<br>${esc(d.bairro)} · ${esc(d.city)} · ${esc(d.cep)}</p><p class="co-muted">${whenTxt}</p></div>
        <div class="co-review"><h4>Pagamento <button class="link-btn" type="button" data-goto="1">Alterar</button></h4><p>${payTxt}</p></div>
        ${d.gift && d.giftMsg ? `<div class="co-review"><h4>Cartão de presente</h4><p class="co-gift">“${esc(d.giftMsg)}”</p></div>` : ''}
        <div class="totals co-totals">
          <div><span>Subtotal</span><span>${money(t.sub)}</span></div>
          ${t.disc ? `<div><span>Desconto Pix (5%)</span><span class="free">− ${money(t.disc)}</span></div>` : ''}
          <div><span>Entrega</span><span class="${t.ship ? '' : 'free'}">${t.ship ? money(t.ship) : 'Grátis'}</span></div>
          <div class="grand"><span>Total</span><span>${money(t.total)}</span></div>
        </div>
        <label class="check co-age"><input type="checkbox" id="coAge"><span>Tenho 18 anos ou mais e vou apresentar documento com foto, se solicitado na entrega.</span></label>
        <p class="field-error" id="coAgeErr" role="alert" hidden>Confirme que você tem 18 anos ou mais para concluir.</p>
        <p class="co-seal">${vsMark()}<span>Cada garrafa sai com lacre VeriSeal conferido. Se chegar violado, recuse na hora e receba o valor integral.</span></p>
        <div class="co-actions"><button type="button" class="btn btn-ghost" data-back>Voltar</button><button type="button" class="btn btn-primary" id="coConfirm">Confirmar pedido · ${money(t.total)}</button></div>`;
      $('#coConfirm').addEventListener('click', () => {
        if (!$('#coAge').checked) { $('#coAgeErr').hidden = false; $('#coAge').focus(); return; }
        placeOrder();
      });
      $('#coAge').addEventListener('change', () => { $('#coAgeErr').hidden = true; });
      return;
    }

    // pedido confirmado
    const o = co.order;
    el.innerHTML = `<div class="order-done">
        <div class="vr-icon">${icon('check')}</div>
        <h2 class="co-title-done">Pedido confirmado!</h2>
        <p>Pedido <span class="order-num">#${o.num}</span> · ${o.when}</p>
        ${o.pay === 'pix' ? `<p class="co-paid">${icon('pix')}Pix aprovado · você economizou ${money(o.disc)}</p>` : ''}
        <ol class="timeline" id="coTimeline">
          <li class="tl-item done"><span class="tl-dot">${icon('check')}</span><div><strong>Pedido recebido</strong><small>${o.time}</small></div></li>
          <li class="tl-item current"><span class="tl-dot">${icon('check')}</span><div>${o.scheduled
            ? `<strong>Entrega agendada</strong><small>${esc(o.slot)} · os lacres são conferidos antes de sair</small>`
            : `<strong>Separando e conferindo os lacres</strong><small>Cada garrafa é escaneada antes de sair</small>`}</div></li>
          <li class="tl-item"><span class="tl-dot">${icon('check')}</span><div><strong>Saiu para entrega</strong><small>Você recebe o aviso no WhatsApp</small></div></li>
          <li class="tl-item"><span class="tl-dot">${icon('check')}</span><div><strong>Entregue</strong><small>Aproxime o celular do lacre e confira</small></div></li>
        </ol>
        <div class="seal-ids">
          <h4>${vsMark()}Lacres VeriSeal do seu pedido</h4>
          <ul>${o.seals.map((s) => `<li><span><b>${esc(s.name)}</b><code>${s.code}</code></span><button class="link-btn" type="button" data-verify-code="${s.code}">Verificar ›</button></li>`).join('')}</ul>
          <p class="seal-ids-note">Guarde estes códigos: eles também estão impressos no lacre de cada garrafa.</p>
        </div>
        <button class="btn btn-primary btn-block" type="button" data-close>Continuar comprando</button>
      </div>`;
    const tl = $$('#coTimeline .tl-item');
    const advance = (k) => { tl.forEach((li, j) => { li.classList.toggle('done', j < k); li.classList.toggle('current', j === k); }); };
    if (!o.scheduled) coTimers.push(setTimeout(() => advance(2), reduce ? 0 : 4200));
  }
  function setErr(input, msg) {
    input.classList.toggle('invalid', !!msg);
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    const m = input.parentElement.querySelector('.field-msg');
    if (m) { m.textContent = msg; m.hidden = !msg; }
  }
  const focusTitle = () => requestAnimationFrame(() => { const h = $('#checkoutContent .co-title'); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } $('#checkoutSheet .sheet-panel').scrollTop = 0; });

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
    const h = $('#checkoutContent .co-title-done'); if (h) { h.tabIndex = -1; h.focus(); }
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
  let verifyTimers = [];
  function runVerify(code, { nfc = false } = {}) {
    verifyTimers.forEach(clearTimeout); verifyTimers = [];
    verifyError.hidden = true; verifyInput.classList.remove('invalid');
    const ms = reduce ? 200 : nfc ? 2600 : 1400;
    verifyResult.innerHTML = `<div class="vr-scan${nfc ? ' is-nfc' : ''}">
        <div class="vr-seal">${window.Seal.printSVG(code)}<i class="vr-scanline"></i></div>
        <p class="vr-scan-title">${nfc ? 'Lendo o lacre…' : 'Consultando a identidade digital…'}</p>
        <p class="vr-scan-sub">${nfc ? 'Mantenha o celular próximo do lacre' : esc(code)}</p>
        <ul class="vr-checks" style="--dur:${ms}ms">
          <li>${icon('check')}Lacre detectado</li><li>${icon('check')}Identidade digital</li><li>${icon('check')}Integridade conferida</li>
        </ul>
      </div>`;
    const host = $('.vr-seal', verifyResult);
    if (nfc && !reduce) [0, 700, 1400].forEach((t) => verifyTimers.push(setTimeout(() => window.Seal.ping(host), t)));
    verifyTimers.push(setTimeout(() => showResult(code), ms));
  }
  function showResult(code) {
    const s = seals[code];
    const p = s && byId[s.product];
    if (!s || !p || s.status === 'unknown') {
      verifyResult.innerHTML = `<div class="vr vr-bad">
          <div class="vr-auth"><svg class="vr-badge" aria-hidden="true"><use href="#i-alert-badge"/></svg><div><b>Não reconhecido</b><span>Este código não existe na base VeriSeal.</span></div></div>
          <dl class="vr-grid"><div><dt>Código</dt><dd class="mono">${esc(code)}</dd></div><div><dt>Situação</dt><dd class="bad">sem registro</dd></div></dl>
          <p class="vr-note">Pode ser uma garrafa falsificada. Não consuma a bebida e avise a marca. Se a compra foi aqui, recuse a entrega e receba o valor integral.</p>
          <button class="btn btn-light btn-sm" type="button" data-report>Avisar a marca</button>
        </div>`;
      return;
    }
    s.checks = (s.checks || 0) + 1;
    persistSeal(code);
    const product = `<div class="vr-product"><span class="vr-thumb">${shot(p, { torn: s.status === 'opened' })}</span><div><strong>${esc(fullName(p))}</strong><span>${esc(p.volume)} · ${abv(p)} vol. · ${esc(p.origin)}</span></div></div>`;
    if (s.status === 'opened') {
      verifyResult.innerHTML = `<div class="vr vr-warn">
          <div class="vr-auth"><svg class="vr-badge" aria-hidden="true"><use href="#i-alert-badge"/></svg><div><b>Já foi aberta</b><span>O circuito do lacre está rompido.</span></div></div>
          ${product}
          <dl class="vr-grid"><div><dt>Lacre</dt><dd class="mono">${esc(code)}</dd></div><div><dt>Lote</dt><dd>${esc(s.lot)}</dd></div>
            <div><dt>1ª abertura</dt><dd class="warn">${esc(s.openedAt)}</dd></div><div><dt>Verificações</dt><dd>${s.checks}</dd></div></dl>
          <p class="vr-note">Comprou lacrada? Desconfie da procedência e fale com o vendedor. Nas compras feitas aqui, você pode recusar a entrega sem custo.</p>
        </div>`;
      return;
    }
    verifyResult.innerHTML = `<div class="vr vr-ok">
        <div class="vr-auth"><svg class="vr-badge" aria-hidden="true"><use href="#i-verified"/></svg><div><b>Autêntico</b><span>Lacre íntegro · nunca aberto</span></div></div>
        ${product}
        <dl class="vr-grid"><div><dt>Lacre</dt><dd class="mono">${esc(code)}</dd></div><div><dt>Lote</dt><dd>${esc(s.lot)}</dd></div>
          <div><dt>Produção</dt><dd>${esc(s.made)}</dd></div><div><dt>Verificações</dt><dd>${s.checks}</dd></div></dl>
        <ol class="vr-journey">
          <li><b>Produção</b><span>${esc(s.made)} · linha de envase</span></li>
          <li><b>Distribuidor autorizado</b><span>origem rastreada</span></li>
          <li><b>VeriSeal Delivery</b><span>lacre conferido no envio · ${esc(s.sentAgo != null ? 'hoje · ' + hhmm(new Date(Date.now() - s.sentAgo * 60000)) : s.sentAt || 'antes do envio')}</span></li>
          <li class="now"><b>Você</b><span>agora · lacre íntegro</span></li>
        </ol>
      </div>`;
  }
  function persistSeal(code) {
    const mine = store.get('seals', {});
    if (mine[code]) { mine[code] = seals[code]; store.set('seals', mine); }
  }
  function verifyCode(code, opts) {
    code = fmtCode(code);
    verifyInput.value = code;
    if (!CODE_RE.test(code)) {
      verifyError.textContent = 'Digite o código completo, no formato VS-XXXX-XXXX.';
      verifyError.hidden = false; verifyInput.classList.add('invalid'); verifyInput.focus();
      return;
    }
    runVerify(code, opts);
  }
  safe('verify', () => {
    verifyInput.addEventListener('input', () => { verifyInput.value = fmtCode(verifyInput.value); verifyInput.classList.remove('invalid'); verifyError.hidden = true; });
    $('#verifyForm').addEventListener('submit', (e) => { e.preventDefault(); verifyCode(verifyInput.value); });
    $('#sampleCodes').innerHTML = (window.VSD_SAMPLE_CODES || []).map((c) => `<button class="code-chip" type="button" data-code="${c.code}">${c.code}<em>${esc(c.label)}</em></button>`).join('');
    $('#sampleCodes').addEventListener('click', (e) => { const b = e.target.closest('[data-code]'); if (b) verifyCode(b.dataset.code); });
    $('#nfcBtn').addEventListener('click', () => {
      const last = store.get('lastSeal', null);
      const code = last && seals[last] ? last : 'VS-7K2M-9QXA';
      verifyInput.value = '';
      if (!reduce) window.Seal.scramble(verifyInput, code, 900); else verifyInput.value = code;
      runVerify(code, { nfc: true });
    });
    verifyResult.addEventListener('click', (e) => { if (e.target.closest('[data-report]')) toast('Aviso enviado à marca. Obrigado por ajudar a combater falsificações.'); });
  });

  /* ============================================================
     COMO FUNCIONA — pedido → entrega → aproximação NFC → resultado
     A foto do Black Label vira duas camadas: tampa (com a metade de
     cima do lacre) e garrafa. No modo "violado" a tampa gira e sobe,
     rompendo o lacre na linha de ruptura.
     ============================================================ */
  safe('how', () => {
    const scene = $('#howScene');
    const steps = $$('#howSteps li'), stepBtns = $$('#howSteps button');
    const seg = $('#howSeg'), segBtns = $$('button', seg), playBtn = $('#howPlay');
    const scr = { read: $('.ap-read', scene), ok: $('.ap-ok', scene), bad: $('.ap-bad', scene) };
    const checks = $$('.ap-checks li', scene);
    const P = byId['jw-black'], g = sealGeo(P);
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
    $('#hsPhoto').innerHTML = `
      <div class="hs-layer hs-body" style="clip-path:${bodyClip}">${shot(P, { eager: true })}<span class="hs-break" style="left:${pc(g.x)};top:${pc(g.y)}"><i></i><i></i></span></div>
      <div class="hs-layer hs-cap" style="clip-path:${capClip};transform-origin:${pc(g.x + g.sw)} ${pc(g.y)}">${shot(P, { eager: true })}</div>`;
    $$('[data-thumb]', scene).forEach((el) => { el.innerHTML = shot(P, { torn: el.dataset.thumb === 'bad' }); });
    $$('.ap-prod > div', scene).forEach((el) => { el.querySelector('b').textContent = P.name; el.querySelector('span').textContent = `${P.brand} · ${P.volume} · ${abv(P)}`; });
    const order = [['jw-black', 1], ['tanqueray', 1]];
    $('#dpItems').innerHTML = order.map(([id, q]) => {
      const p = byId[id];
      return `<li><span class="dp-thumb">${shot(p)}</span><span class="dp-name"><b>${esc(p.name)}</b><span>${esc(p.brand)} · ${q}×</span></span><b class="dp-price">${money(p.price * q)}</b></li>`;
    }).join('');
    $('#dpTotal').textContent = money(pix(order.reduce((s, [id, q]) => s + byId[id].price * q, 0)));
    // horários do celular sempre relativos à hora atual
    const clock = () => {
      const now = Date.now(), at = (min) => hhmm(new Date(now + min * 60000));
      $$('.ph-time', scene).forEach((t) => { t.textContent = at(0); });
      $('#dpEta').textContent = at(18);
      $('#apSent').textContent = 'hoje · ' + at(-24);
      $('#apBroken').textContent = 'hoje · ' + at(-3);
    };
    clock(); setInterval(clock, 30000);

    const DUR = [3.6, 4.2, 7.8];
    let step = 0, local = 0, playing = !reduce, inView = false, started = false, bad = false, raf = 0, last = 0;
    function render() {
      const L = local, s2 = started && step === 2;
      scene.classList.toggle('is-started', started);
      ['st-0', 'st-1', 'st-2'].forEach((c, i) => scene.classList.toggle(c, started && step === i));
      scene.classList.toggle('is-scanned', started && step === 1 && L > 0.42);
      scene.classList.toggle('is-reading', s2 && L > 0.1 && L < 0.62);
      scene.classList.toggle('ph-detect', s2 && L > 0.2 && L < 0.36);
      scene.classList.toggle('ph-open', s2 && L >= 0.34);
      scene.classList.toggle('ph-result', s2 && L >= 0.62);
      scr.read.classList.toggle('is-on', s2 && L >= 0.34 && L < 0.62);
      scr.ok.classList.toggle('is-on', s2 && L >= 0.62 && !bad);
      scr.bad.classList.toggle('is-on', s2 && L >= 0.62 && bad);
      checks.forEach((c) => c.classList.toggle('is-on', s2 && L >= +c.dataset.at));
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
    stepBtns.forEach((b, i) => b.addEventListener('click', () => { started = true; go(i, i === 2 && !playing ? 0.62 : 0); }));
    playBtn.addEventListener('click', () => setPlaying(!playing));
    segBtns.forEach((b) => b.addEventListener('click', () => { setBad(b.dataset.mode === 'bad'); started = true; go(2, 0.62); }));
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
      setTimeout(() => verifyCode(code, { nfc: true }), reduce ? 0 : 500);
      return;
    }
    if ((el = t.closest('a[data-cat]'))) { setFilter({ cat: el.dataset.cat, q: '' }); closeMenus(); return; }
    if ((el = t.closest('.p-card, .kit-card')) && !t.closest('.cta, button, a, input, select')) {
      const o = el.querySelector('[data-open]');
      if (o) openProduct(o.dataset.open);
    }
  });

  updateBagUI();
})();
