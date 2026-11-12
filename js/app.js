import { initShowcase } from "./showcase.js";
import { createCatalog } from "./catalog.js";
import {
  $,
  $$,
  clamp,
  esc,
  money,
  norm,
  pc,
  reduce,
  safe,
  icon,
  vsMark,
  SEAL_PILL,
  SEAL_PILL_MARK,
  MEDIA_BG,
  LINK_BTN,
  NOTE_MARK,
  ROW,
  GRAND,
  FREE,
  CEP_INFO,
} from "./ui.js";
import {
  FREE_SHIP,
  SHIP_FEE,
  MAX_QTY,
  MAX_INST,
  PIX_LABEL,
  storeOpen,
} from "./config.js";
import { store } from "./storage.js";
import { etaText, placeLabel } from "./delivery.js";
import { shipping, pix, inst, restoreBag, bagSubtotal } from "./commerce.js";
import { createAddressController } from "./address.js";
import { createCheckout } from "./checkout.js";
import { createVerification } from "./verification.js";

(() => {
  "use strict";

  const CATS = window.VSD_CATEGORIES || [];
  const PRODUCTS = window.VSD_PRODUCTS || [];
  const byId = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
  const catName = Object.fromEntries(CATS.map((c) => [c.id, c.name]));
  PRODUCTS.forEach((p) => {
    if (!p.items) return;
    p.bottles = p.items.map((id) => byId[id]).filter(Boolean);
    p.oldPrice = p.bottles.reduce((s, b) => s + b.price, 0);
  });
  const seals = Object.assign(
    {},
    window.VSD_SEALS || {},
    store.get("demo:seals", {}),
  );

  const isKit = (p) => !!p.items;
  const pct = (p) =>
    p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  const abv = (p) => String(p.abv).replace(".", ",") + "%";
  const meta = (p) =>
    isKit(p)
      ? `${p.bottles.length} garrafas · ${p.bottles.length} lacres VeriSeal`
      : `${p.volume} · ${abv(p)} vol.`;

  const twins = new Set(
    PRODUCTS.filter(
      (p, _, a) =>
        !isKit(p) &&
        a.some((q) => q !== p && q.brand === p.brand && q.name === p.name),
    ).map((p) => p.id),
  );
  const fullName = (p) =>
    isKit(p)
      ? `Kit ${p.name}`
      : `${p.brand} ${p.name}${twins.has(p.id) ? " " + p.volume : ""}`;
  const shortName = (p) =>
    isKit(p)
      ? `Kit ${p.name}`
      : `${p.name}${twins.has(p.id) ? " " + p.volume : ""}`;

  const kitGroups = (p) => {
    const m = new Map();
    p.bottles.forEach((b) => m.set(b, (m.get(b) || 0) + 1));
    return [...m];
  };

  const matches = (p, q) => {
    const words = norm(
      [
        p.brand,
        p.name,
        p.volume,
        catName[p.category],
        p.origin,
        ...(p.notes || []),
        ...(p.bottles || []).map((b) => b.brand + " " + b.name),
      ].join(" "),
    ).split(/[^a-z0-9]+/);
    return norm(q)
      .split(/[^a-z0-9]+/)
      .filter(Boolean)
      .every((t) => words.some((w) => w.startsWith(t)));
  };

  const NECK = window.Seal.NECK;
  function sealGeo(p) {
    const [w, h] = p.size,
      s = p.seal || { y: 0.15 };
    const sw = s.w || 0.145;
    const sh = sw * (w / h) * (NECK.H / NECK.W);
    return {
      x: s.x || 0.5,
      y: s.y,
      sw,
      sh,
      top: s.y - (sh * NECK.J) / NECK.H,
      nfc: s.y + (sh * (NECK.NFC - NECK.J)) / NECK.H,
    };
  }

  function shot(p, o = {}) {
    const g = sealGeo(p);
    const seal =
      o.seal === false
        ? ""
        : `<svg class="pointer-events-none absolute -translate-x-1/2 overflow-visible drop-shadow-[0_.6px_1px_rgba(0,0,0,.45)] ${o.sealCls || ""}" viewBox="0 0 40 110" preserveAspectRatio="none" aria-hidden="true" focusable="false" style="left:${pc(g.x)};top:${pc(g.top)};width:${pc(g.sw)};height:${pc(g.sh)}"><use href="#vs-neck${o.torn ? "-torn" : ""}"/></svg>`;
    return `<span class="relative block aspect-[var(--ar)] shrink-0 ${o.cls || "h-full"}" style="--ar:${p.size[0]} / ${p.size[1]}"><img class="block size-full object-contain select-none [-webkit-user-drag:none]" src="${esc(p.img)}" alt="${esc(o.alt || "")}" width="${p.size[0]}" height="${p.size[1]}" loading="${o.eager ? "eager" : "lazy"}" decoding="async" draggable="false">${seal}</span>`;
  }

  function visual(p, o = {}) {
    if (!isKit(p)) return shot(p, o);
    const n = p.bottles.length;
    return `<span class="flex items-end justify-center ${o.cls || "size-full"}">${p.bottles.map((b, k) => shot(b, { ...o, cls: k === 1 ? "z-[1] -mx-[5%] h-full" : n === 2 ? "-mr-[3%] -ml-[5%] h-[96%]" : "-mx-[5%] h-[88%]" })).join("")}</span>`;
  }
  const badgeHTML = (p) => {
    const cls =
      "absolute top-[9px] left-[9px] z-[2] rounded-[7px] px-2 py-[3px] text-[11px] font-bold";
    return isKit(p)
      ? `<span class="${cls} bg-sale text-white">-${pct(p)}% no kit</span>`
      : p.oldPrice
        ? `<span class="${cls} bg-sale text-white">-${pct(p)}%</span>`
        : p.badge
          ? `<span class="${cls} bg-white text-badge shadow-card">${esc(p.badge)}</span>`
          : "";
  };
  const priceHTML = (p) => `<div class="flex min-w-0 flex-col leading-[1.25]">
      ${p.oldPrice ? `<s class="text-[12px] text-fg-3">${money(p.oldPrice)}</s>` : ""}
      <span class="text-[18px] font-extrabold tracking-[-.02em] max-sm:text-[16px]">${money(p.price)}</span>
      <span class="text-[12px] font-semibold text-ok max-sm:text-[11px]">${money(pix(p.price))} no Pix</span>
    </div>`;

  const bag = restoreBag(store.get("bag", {}), byId);
  function ctaInner(id) {
    const q = bag.get(id) || 0,
      p = byId[id];
    if (!q)
      return `<button class="grid size-10 place-items-center rounded-xl bg-accent text-white shadow-[0_6px_14px_rgba(0,106,168,.3)] transition-[background-color,scale] duration-200 hover:bg-accent-hover active:scale-90 max-sm:size-9" type="button" data-add="${id}" aria-label="Adicionar ${esc(fullName(p))} à sacola">${icon("plus", "size-5")}</button>`;
    const btn =
      "grid h-10 w-8 place-items-center rounded-xl text-white hover:bg-white/14 max-sm:h-9 max-sm:w-7";
    return `<div class="inline-flex h-10 animate-[qtyIn_.35s_var(--ease-spring)] items-center rounded-xl bg-accent text-white shadow-[0_6px_14px_rgba(0,106,168,.3)] max-sm:h-9" role="group" aria-label="${esc(fullName(p))} na sacola">
      <button class="${btn}" type="button" data-dec="${id}" aria-label="Remover uma unidade">${icon(q === 1 ? "close" : "minus", "size-4")}</button>
      <span class="min-w-4 text-center text-[15px] font-extrabold" aria-live="polite">${q}</span>
      <button class="${btn}" type="button" data-inc="${id}" aria-label="Adicionar uma unidade">${icon("plus", "size-4")}</button>
    </div>`;
  }
  const cta = (id) =>
    `<div class="relative z-[2] shrink-0" data-cta="${id}">${ctaInner(id)}</div>`;
  const refreshCTAs = (id) =>
    $$(`[data-cta="${id}"]`).forEach((el) => {
      el.innerHTML = ctaInner(id);
    });

  function cardHTML(p, i = 0) {
    const kit = isKit(p);
    return `<article class="group/card relative flex min-w-0 animate-[cardIn_.5s_var(--ease-smooth)_calc(var(--i,0)*26ms)_both] cursor-pointer flex-col rounded-[18px] border border-surface-2 bg-white px-2 pt-2 pb-3.5 transition-[box-shadow,translate,border-color] duration-300 ease-smooth hover:-translate-y-0.5 hover:border-transparent hover:shadow-lift max-sm:rounded-2xl max-sm:px-1.5 max-sm:pt-1.5 max-sm:pb-3" data-card style="--i:${Math.min(i, 12)}">
      <div class="relative h-[232px] overflow-hidden rounded-[13px] ${MEDIA_BG} px-2.5 pt-[30px] pb-3 max-sm:h-[190px] max-sm:px-1.5 max-sm:pb-2.5">
        ${badgeHTML(p)}
        <span class="${SEAL_PILL}">${vsMark(SEAL_PILL_MARK, true)}${kit ? p.bottles.length + " lacres" : "Lacrado"}</span>
        <div class="flex h-full items-end justify-center transition-transform duration-[450ms] ease-smooth group-hover/card:-translate-y-1 group-hover/card:scale-[1.035]">${visual(p)}</div>
      </div>
      <div class="flex flex-1 flex-col px-1.5 pt-3 max-sm:px-1 max-sm:pt-2.5">
        <p class="text-[12px] font-semibold tracking-[.04em] text-fg-2 uppercase">${esc(kit ? `Kit · ${p.bottles.length} garrafas` : p.brand)}</p>
        <h3 class="mt-0.5 text-[16px] leading-[1.22] font-bold tracking-[-.02em] max-sm:text-[15px]"><a href="produtos/${p.id}/" class="text-left tracking-[inherit] text-inherit hover:text-accent" data-open="${p.id}">${esc(p.name)}</a></h3>
        <p class="mt-[3px] text-[13px] text-fg-2">${esc(
          kit
            ? kitGroups(p)
                .map(([b, n]) => (n > 1 ? n + "× " : "") + b.brand)
                .join(" · ")
            : `${p.volume} · ${abv(p)}`,
        )}</p>
        <div class="mt-auto flex items-end justify-between gap-2 pt-2.5">${priceHTML(p)}${cta(p.id)}</div>
      </div>
    </article>`;
  }

  const stack = [];
  const body = document.body;
  function openLayer(el, focusEl) {
    if (stack.some((s) => s.el === el)) return;
    el.hidden = false;
    el.classList.remove("is-closing");
    stack.push({ el, ret: document.activeElement });
    body.classList.add("locked");
    requestAnimationFrame(() => {
      const f =
        focusEl ||
        el.querySelector("[data-autofocus]") ||
        el.querySelector(
          "input:not([type=hidden]), select, textarea, button:not([data-close]), a[href]",
        ) ||
        el.querySelector("button");
      if (f) f.focus({ preventScroll: true });
    });
    updateBagBar();
  }
  function closeLayer(el, { restoreFocus = true } = {}) {
    const i = stack.findIndex((s) => s.el === el);
    if (i < 0) return;
    const [{ ret }] = stack.splice(i, 1);
    el.classList.add("is-closing");
    setTimeout(
      () => {
        if (!stack.some((s) => s.el === el)) {
          el.hidden = true;
          el.classList.remove("is-closing");
        }
      },
      reduce ? 0 : 230,
    );
    if (!stack.length) body.classList.remove("locked");
    if (restoreFocus && ret && document.contains(ret))
      ret.focus({ preventScroll: true });
    if (el.id === "checkoutSheet") checkout.cleanup();
    updateBagBar();
  }
  document.addEventListener("click", (e) => {
    const c = e.target.closest("[data-close]");
    if (!c) return;
    const layer = c.closest("[data-layer]");
    if (layer) closeLayer(layer);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Tab" || !stack.length) return;
    const el = stack[stack.length - 1].el;
    const f = $$(
      'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
      el,
    ).filter((x) => x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0],
      last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      last.focus();
      e.preventDefault();
    } else if (!e.shiftKey && document.activeElement === last) {
      first.focus();
      e.preventDefault();
    }
  });

  const toastEl = $("#toast");
  let toastT = 0;
  function hideToast() {
    toastEl.classList.add("is-out");
    setTimeout(() => {
      toastEl.hidden = true;
      toastEl.classList.remove("is-out");
    }, 220);
  }
  function toast(msg, action, fn) {
    toastEl.innerHTML = `<span class="min-w-0">${esc(msg)}</span>${action ? `<button class="rounded-full bg-white/16 px-3.5 py-[7px] text-[13px] font-bold whitespace-nowrap text-white hover:bg-white/26" type="button">${esc(action)}</button>` : ""}`;
    toastEl.classList.remove("is-out");
    toastEl.hidden = false;
    if (action)
      toastEl.querySelector("button").addEventListener("click", () => {
        hideToast();
        fn();
      });
    clearTimeout(toastT);
    toastT = setTimeout(hideToast, 3800);
  }

  safe("reveal", () => {
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("in");
          io.unobserve(e.target);
        }),
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 },
    );
    $$(".reveal").forEach((el) => {
      const sibs = [...el.parentElement.children].filter((x) =>
        x.classList.contains("reveal"),
      );
      el.style.setProperty(
        "--rd",
        (Math.min(sibs.indexOf(el), 6) * 0.06).toFixed(2) + "s",
      );
      io.observe(el);
    });
  });

  safe("age", () => {
    const gate = $("#ageGate");
    if (store.get("age", false)) return;
    gate.hidden = false;
    body.classList.add("locked");
    requestAnimationFrame(() => $("#ageYes").focus());
    $("#ageYes").addEventListener("click", () => {
      store.set("age", true);
      gate.classList.add("is-leaving");
      setTimeout(
        () => {
          gate.hidden = true;
          if (!stack.length) body.classList.remove("locked");
        },
        reduce ? 0 : 320,
      );
    });
    $("#ageNo").addEventListener("click", () => {
      $("#ageAsk").hidden = true;
      $("#ageDenied").hidden = false;
    });
  });

  const address = createAddressController({
    isBagOpen: () => stack.some((s) => s.el.id === "bagDrawer"),
    renderBag,
    openLayer,
    closeLayer,
  });
  const { openAddress } = address;

  const searchBox = $("#search"),
    searchInput = $("#searchInput"),
    searchPanel = $("#searchPanel");
  const searchResults = $("#searchResults"),
    searchLabel = $("#searchLabel");
  const POPULAR = [
    "Black Label",
    "Tanqueray",
    "Absolut",
    "Jack Daniel's",
    "Gin",
    "Kits",
  ];
  function setSearch(open) {
    if (searchPanel.hidden === !open) return;
    searchPanel.hidden = !open;
    body.classList.toggle("menu-open", open);
    if (open) renderSearch(searchInput.value);
  }
  const closeMenus = () => setSearch(false);
  function renderSearch(q) {
    q = q.trim();
    if (!q) {
      searchLabel.textContent = "Mais buscados";
      searchResults.innerHTML = `<li class="flex flex-wrap gap-2 px-1.5 pb-1.5">${POPULAR.map((t) => `<button type="button" class="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-[7px] text-[14px] font-medium hover:border-fg-3" data-term="${esc(t)}">${icon("search", "size-3.5 text-fg-3")}${esc(t)}</button>`).join("")}</li>`;
      return;
    }
    const res = PRODUCTS.filter((p) => matches(p, q));
    searchLabel.textContent = res.length
      ? `${res.length} ${res.length === 1 ? "resultado" : "resultados"}`
      : `Nenhum resultado para “${q}”`;
    searchResults.innerHTML =
      res
        .slice(0, 6)
        .map(
          (
            p,
          ) => `<li><button type="button" class="flex w-full items-center gap-3 rounded-xl p-2 text-left text-fg hover:bg-surface focus-visible:bg-surface" data-open="${p.id}">
        <span class="flex h-[54px] w-11 shrink-0 items-end justify-center rounded-[10px] bg-tile px-0.5 py-1">${visual(p, { cls: isKit(p) ? "h-full w-11" : "" })}</span>
        <span class="flex min-w-0 flex-1 flex-col"><b class="truncate text-[14px] font-semibold">${esc(fullName(p))}</b><small class="text-[12px] text-fg-2">${esc(isKit(p) ? meta(p) : `${p.volume} · lacre VeriSeal`)}</small></span>
        <span class="text-[14px] font-bold whitespace-nowrap">${money(p.price)}</span></button></li>`,
        )
        .join("") +
      (res.length > 6
        ? `<li><button type="button" class="flex w-full items-center gap-3 rounded-xl p-2 text-left text-[14px] font-semibold text-accent hover:bg-surface" data-search-all="${esc(q)}">${icon("search", "size-4")}Ver os ${res.length} resultados</button></li>`
        : "");
  }
  function searchAll(q) {
    closeMenus();
    searchInput.blur();
    setFilter({ cat: "all", brand: null, q });
    $("#catalogo").scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  }
  safe("search", () => {
    searchInput.addEventListener("focus", () => setSearch(true));
    searchInput.addEventListener("input", () => {
      setSearch(true);
      renderSearch(searchInput.value);
    });
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        searchAll(searchInput.value.trim());
      }
      if (e.key === "ArrowDown") {
        const f = $("button", searchResults);
        if (f) {
          e.preventDefault();
          f.focus();
        }
      }
    });
    searchPanel.addEventListener("click", (e) => {
      const term = e.target.closest("[data-term]");
      if (term) {
        searchInput.value = term.dataset.term;
        renderSearch(term.dataset.term);
        searchInput.focus();
        return;
      }
      const all = e.target.closest("[data-search-all]");
      if (all) searchAll(all.dataset.searchAll);
    });

    document.addEventListener("pointerdown", (e) => {
      if (!searchPanel.hidden && !e.target.closest("#search")) setSearch(false);
    });
    searchBox.addEventListener("focusout", (e) => {
      if (!e.relatedTarget || !searchBox.contains(e.relatedTarget))
        setTimeout(() => {
          if (!searchBox.contains(document.activeElement)) setSearch(false);
        }, 0);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (!searchPanel.hidden) {
        setSearch(false);
        searchInput.focus();
        return;
      }
      if (stack.length) closeLayer(stack[stack.length - 1].el);
    });
  });

  initShowcase({ byId, fullName, sealGeo, shot, pct, abv });

  safe("categories", () => {
    const photo =
      "items-start justify-center bg-[radial-gradient(ellipse_60%_30%_at_50%_100%,rgba(0,0,0,.08),transparent_70%)] bg-(--tint)";
    const lift =
      "mt-[12%] h-[150%] transition-transform duration-[450ms] ease-smooth group-hover/cat:-translate-y-1.5 group-hover/cat:-rotate-4";
    const tiles = [
      {
        go: "ofertas",
        name: "Ofertas",
        cls: "flex-col items-center justify-center gap-0.5 bg-[linear-gradient(150deg,#ff5a4e,#d6191f)] text-white",
        html: `<span>${icon("tag", "inline-block size-[34px] align-baseline")}</span><span class="text-[20px] font-extrabold tracking-[-.03em]">-${Math.max(...PRODUCTS.map(pct))}%</span>`,
      },
      ...CATS.map((c) => {
        const p = byId[c.icon];
        return {
          go: c.id,
          name: c.name,
          cls: photo,
          tint: c.tint,
          html: p
            ? visual(p, { cls: (isKit(p) ? "w-[130%] " : "") + lift })
            : "",
        };
      }),
      {
        go: "verificar",
        name: "Verificar lacre",
        cls: "flex-col items-center justify-center gap-1.5 bg-[radial-gradient(ellipse_at_70%_20%,#0c4a99,var(--color-navy)_50%,var(--color-navy-ink))] text-cyan",
        html: `<span>${icon("contactless", "inline-block size-[38px] align-baseline")}</span>${vsMark("w-[34px]", true)}`,
      },
    ];
    $("#catRow").innerHTML = tiles
      .map(
        (
          t,
        ) => `<button class="group/cat flex min-w-0 flex-col items-center gap-2" type="button" data-cat-go="${t.go}">
        <span class="relative flex aspect-square w-full overflow-hidden rounded-[22px] transition-[translate,box-shadow] duration-[350ms] ease-smooth group-hover/cat:-translate-y-[3px] group-hover/cat:shadow-lift max-sm:rounded-[18px] ${t.cls}"${t.tint ? ` style="--tint:${t.tint}"` : ""}>${t.html}</span><span class="text-[14px] font-bold tracking-[-.01em] group-hover/cat:text-accent max-sm:text-[13px]">${esc(t.name)}</span></button>`,
      )
      .join("");
    $("#catRow").addEventListener("click", (e) => {
      const b = e.target.closest("[data-cat-go]");
      if (!b) return;
      const go = b.dataset.catGo;
      if (go === "ofertas" || go === "verificar") {
        $("#" + go).scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
        return;
      }
      setFilter({ cat: go, brand: null, q: "" });
      $("#catalogo").scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    });
  });

  safe("rails", () => {
    $("#offersRail").innerHTML = PRODUCTS.filter((p) => p.oldPrice && !isKit(p))
      .sort((a, b) => pct(b) - pct(a))
      .map(cardHTML)
      .join("");
    $("#topRail").innerHTML = PRODUCTS.filter((p) => p.featured)
      .map(cardHTML)
      .join("");
    const update = (r) => {
      const [prev, next] = $$(`[data-rail="${r.id}"]`);
      if (!prev) return;
      const max = r.scrollWidth - r.clientWidth - 2;
      prev.disabled = r.scrollLeft <= 2;
      next.disabled = r.scrollLeft >= max;
    };
    $$("[data-rail]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const r = $("#" + btn.dataset.rail),
          card = r.firstElementChild;
        r.scrollBy({
          left: +btn.dataset.dir * (card ? card.offsetWidth + 16 : 240) * 2,
          behavior: reduce ? "auto" : "smooth",
        });
      }),
    );
    $$("#offersRail, #topRail").forEach((r) => {
      r.addEventListener("scroll", () => update(r), { passive: true });
      addEventListener("resize", () => update(r));
      update(r);
    });

    const end = (() => {
      const d = new Date();
      const e = new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate() + ((7 - d.getDay()) % 7),
        23,
        59,
        59,
      );
      if (e <= d) e.setDate(e.getDate() + 7);
      return e;
    })();
    const el = Object.fromEntries(
      $$("[data-cd]").map((b) => [b.dataset.cd, b]),
    );
    const pad = (n) => String(n).padStart(2, "0");
    const tick = () => {
      const s = Math.max(0, Math.floor((end - Date.now()) / 1000));
      el.d.textContent = Math.floor(s / 86400);
      el.h.textContent = pad(Math.floor((s % 86400) / 3600));
      el.m.textContent = pad(Math.floor((s % 3600) / 60));
      el.s.textContent = pad(s % 60);
    };
    tick();
    setInterval(tick, 1000);
  });

  safe("kits", () => {
    $("#kitGrid").innerHTML = PRODUCTS.filter(isKit)
      .map(
        (
          p,
        ) => `<article class="group/card relative grid cursor-pointer grid-cols-[minmax(0,.95fr)_minmax(0,1.05fr)] gap-1 overflow-hidden rounded-[20px] border border-surface-2 bg-white p-2 transition-[box-shadow,translate,border-color] duration-300 ease-smooth hover:-translate-y-0.5 hover:border-transparent hover:shadow-lift max-sm:grid-cols-[1fr_1.1fr] max-xs:grid-cols-1" data-card>
        <div class="relative h-[250px] overflow-hidden rounded-[14px] bg-[radial-gradient(ellipse_60%_9%_at_50%_93%,rgba(4,37,85,.2),transparent_72%),linear-gradient(180deg,#f6f8fb,#e9eef5)] px-2 pt-[34px] pb-3 max-sm:h-[220px]">${badgeHTML(p)}<span class="${SEAL_PILL}">${vsMark(SEAL_PILL_MARK, true)}${p.bottles.length} lacres</span><div class="flex h-full items-end justify-center transition-transform duration-[450ms] ease-smooth group-hover/card:-translate-y-1 group-hover/card:scale-[1.03]">${visual(p)}</div></div>
        <div class="flex min-w-0 flex-col pt-3 pr-2.5 pb-2 pl-3">
          <p class="text-[12px] font-bold text-badge">${esc(p.badge || "Kit")}</p>
          <h3 class="mt-0.5 text-[20px] leading-[1.15] font-extrabold tracking-[-.025em] max-sm:text-[18px]"><a href="produtos/${p.id}/" class="text-left tracking-[inherit] text-inherit hover:text-accent" data-open="${p.id}">${esc(p.name)}</a></h3>
          <ul class="mt-2.5 grid gap-1">${kitGroups(p)
            .map(
              ([b, n]) =>
                `<li class="flex justify-between gap-2.5 border-b border-surface-2 pb-1 text-[13px]"><span>${n > 1 ? n + "× " : ""}${esc(b.brand)} ${esc(b.name)}</span><small class="text-[length:smaller] whitespace-nowrap text-fg-2">${esc(b.volume)}</small></li>`,
            )
            .join("")}</ul>
          <div class="mt-auto flex items-end justify-between gap-2 pt-2.5">${priceHTML(p)}${cta(p.id)}</div>
        </div>
      </article>`,
      )
      .join("");
    const k = byId["kit-tanqueray-3"];
    if (k)
      $("#kitBannerBtn").textContent =
        `Kit Tanqueray 3 garrafas · ${money(k.price)}`;
  });

  const { setFilter } = createCatalog({
    CATS,
    PRODUCTS,
    catName,
    matches,
    pct,
    fullName,
    cardHTML,
  });

  const bagCount = () => [...bag.values()].reduce((a, b) => a + b, 0);
  const subtotal = () => bagSubtotal(bag, byId);
  const saveBag = () => store.set("bag", Object.fromEntries(bag));

  function setQty(id, q) {
    q = clamp(q, 0, MAX_QTY);
    if (q) bag.set(id, q);
    else bag.delete(id);
    saveBag();
    refreshCTAs(id);
    updateBagUI();
  }
  function addToBag(id, n = 1, { notify = true } = {}) {
    const before = bag.get(id) || 0;
    if (before + n > MAX_QTY) {
      toast(`Máximo de ${MAX_QTY} unidades por item.`);
      return false;
    }
    setQty(id, before + n);
    const c = $("#bagCount");
    c.classList.remove("bump");
    void c.offsetWidth;
    c.classList.add("bump");
    if (notify)
      toast(
        `${fullName(byId[id])} na sacola${n > 1 ? ` (${n})` : ""}`,
        "Ver sacola",
        openBag,
      );
    return true;
  }
  function updateBagUI() {
    const n = bagCount(),
      c = $("#bagCount");
    c.hidden = !n;
    c.textContent = n;
    $("#bagBtn").classList.toggle("has-items", n > 0);
    $("#bagBtn").setAttribute(
      "aria-label",
      n
        ? `Sacola de compras, ${n} ${n === 1 ? "item" : "itens"}, ${money(subtotal())}`
        : "Sacola de compras",
    );
    $("#bagBarCount").textContent = n;
    $("#bagBarTotal").textContent = money(subtotal());
    updateBagBar();
    if (stack.some((s) => s.el.id === "bagDrawer")) renderBag();
  }
  function updateBagBar() {
    const show = bagCount() > 0 && !stack.length;
    $("#bagBar").hidden = !show;
    body.classList.toggle("has-bagbar", show);
  }
  function bagItemHTML(p, q) {
    const btn =
      "grid h-full w-8 place-items-center rounded-[50%] text-[17px] text-accent disabled:text-line";
    return `<li class="flex gap-3.5 border-b border-surface-2 py-4">
      <div class="flex h-[92px] w-[66px] shrink-0 items-end justify-center rounded-xl bg-[linear-gradient(180deg,#f6f8fb,#e9eef5)] px-1 pt-[7px] pb-[5px]">${visual(p)}</div>
      <div class="min-w-0 flex-1">
        <strong class="block text-[15px] leading-[1.25] tracking-[-.01em]">${esc(isKit(p) ? shortName(p) : fullName(p))}</strong>
        <small class="text-[12px] text-fg-2">${esc(isKit(p) ? meta(p) : `${p.volume} · lacre VeriSeal`)}</small>
        <div class="mt-2 flex items-center justify-between gap-2">
          <div class="inline-flex h-8 shrink-0 items-center rounded-full border border-line" role="group" aria-label="Quantidade">
            <button class="${btn}" type="button" data-dec="${p.id}" aria-label="Remover uma unidade de ${esc(fullName(p))}">−</button>
            <span class="min-w-5 text-center text-[14px] font-bold">${q}</span>
            <button class="${btn}" type="button" data-inc="${p.id}" aria-label="Adicionar uma unidade de ${esc(fullName(p))}"${q >= MAX_QTY ? " disabled" : ""}>+</button>
          </div>
          <span class="text-[15px] font-bold">${money(p.price * q)}</span>
        </div>
        <button class="mt-1.5 text-[12px] ${LINK_BTN}" type="button" data-remove="${p.id}">Remover</button>
      </div>
    </li>`;
  }
  function renderBag() {
    const bb = $("#bagBody"),
      bf = $("#bagFoot");
    if (!bag.size) {
      bb.innerHTML = `<div class="px-2.5 py-[60px] text-center text-fg-2">${icon("bag", "mx-auto mb-3.5 block size-[52px] text-fg-3")}<p class="mb-[18px]">Sua sacola está vazia.</p><a class="btn btn-primary" href="#ofertas" data-close>Ver ofertas</a></div>`;
      bf.innerHTML = "";
      bf.hidden = true;
      return;
    }
    bf.hidden = false;
    const sub = subtotal(),
      ship = shipping(sub),
      left = Math.max(0, FREE_SHIP - sub);
    const units = [...bag].reduce(
      (s, [id, q]) => s + q * (isKit(byId[id]) ? byId[id].bottles.length : 1),
      0,
    );
    bb.innerHTML = `
      <div class="mt-1.5 mb-2.5">
        <p class="mb-1.5 text-[13px] text-fg-2">${left > 0 ? `Faltam <strong class="text-fg">${money(left)}</strong> para o frete grátis.` : `<strong class="text-fg">Frete grátis</strong> nesta simulação.`}</p>
        <div class="h-[5px] overflow-hidden rounded-[3px] bg-surface-2"><i class="block h-full rounded-[3px] bg-[linear-gradient(90deg,var(--color-navy),var(--color-cyan))] transition-[width] duration-500 ease-smooth" style="width:${Math.min(100, (sub / FREE_SHIP) * 100).toFixed(1)}%"></i></div>
      </div>
      <p class="mt-3.5 mb-0.5 flex items-center gap-2.5 rounded-xl bg-[#e9f5fd] px-3 py-2.5 text-[13px] text-navy">${vsMark("w-[26px] shrink-0")}<span><b>${units} ${units === 1 ? "garrafa lacrada" : "garrafas lacradas"}</b> · cada uma com o próprio lacre VeriSeal</span></p>
      <ul>${[...bag].map(([id, q]) => bagItemHTML(byId[id], q)).join("")}</ul>`;
    bf.innerHTML = `
      ${
        address.address
          ? `<p class="mb-2 flex items-center gap-2 text-[13px] text-fg-2">${icon("pin", "size-4 text-ok")}<span class="min-w-0 flex-1">Entregar em <b class="text-fg">${esc(placeLabel(address.address))}</b> · ${etaText(address.address)}</span><button class="${LINK_BTN}" type="button" data-open-address>Alterar</button></p>`
          : `<form class="mb-1 flex gap-2" id="bagCepForm" novalidate><input class="h-10 min-w-0 flex-1 rounded-xl border border-line bg-white px-3.5 text-[15px] outline-none focus:border-accent focus:shadow-focus [&.invalid]:border-bad" id="bagCep" inputmode="numeric" placeholder="Consultar CEP" maxlength="9" aria-label="CEP de entrega" autocomplete="postal-code"><button class="btn btn-dark btn-sm" type="submit">OK</button></form><p class="${CEP_INFO}" id="bagCepInfo" aria-live="polite"></p>`
      }
      <div class="mt-1 mb-3.5">
        <div class="${ROW}"><span>Subtotal</span><span>${money(sub)}</span></div>
        <div class="${ROW}"><span>Entrega</span><span class="${ship ? "" : FREE}">${ship ? money(ship) : "Grátis"}</span></div>
        <div class="${GRAND}"><span>Total</span><span>${money(sub + ship)}</span></div>
        <div class="flex justify-end pb-[3px] text-[13px] font-semibold text-ok"><span>ou ${money(pix(sub) + ship)} no Pix</span></div>
      </div>
      <button class="btn btn-primary w-full" type="button" id="goCheckout"${storeOpen() ? "" : " data-closed"}>Simular checkout</button>
      <p class="mt-3 flex items-center gap-2.5 text-[12px] text-fg-2">${vsMark("w-[26px] shrink-0")}<span>Demonstração com preços e lacres fictícios. Nenhum pedido ou pagamento real é realizado.</span></p>`;
    const form = $("#bagCepForm");
    if (form) {
      const input = $("#bagCep");
      address.maskCep(input);
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        address.submitCep(input, $("#bagCepInfo"));
      });
    }
    $("#goCheckout").addEventListener("click", openCheckout);
  }
  function openBag() {
    closeMenus();
    renderBag();
    openLayer($("#bagDrawer"), $("#bagDrawer button[data-close]"));
  }

  function refocus(prev) {
    if (!prev) return;
    const attr = ["data-inc", "data-dec", "data-add"].find((a) =>
      prev.hasAttribute(a),
    );
    if (!attr) return;
    const id = prev.getAttribute(attr);
    const box = prev.closest("[data-cta]");
    const inBag = !!prev.closest("#bagBody");
    requestAnimationFrame(() => {
      const scope =
        box && document.contains(box) ? box : inBag ? $("#bagBody") : null;
      if (!scope) return;
      const t =
        scope.querySelector(`[${attr}="${id}"]:not([disabled])`) ||
        scope.querySelector(`[data-inc="${id}"], [data-add="${id}"]`);
      if (t) t.focus({ preventScroll: true });
    });
  }

  function openProduct(id) {
    const p = byId[id];
    if (!p) return;
    closeMenus();
    const kit = isKit(p);
    const i = inst(p.price);
    const media = $("#ppMedia");
    if (kit) {
      media.innerHTML = `<div class="h-[400px] w-full max-w-[400px] max-md:h-[280px]">${visual(p, { eager: true })}</div><p class="${NOTE_MARK}">${vsMark("w-[22px]")}${p.bottles.length} garrafas, cada uma com o próprio lacre</p>`;
    } else {
      const g = sealGeo(p);

      const ring = (anim) =>
        `<span class="absolute -top-8 -left-8 size-16 rounded-full border-2 border-cyan opacity-0 ${anim}"></span>`;
      const views = [
        {
          html: `<div class="relative h-full" style="--nfc:${g.nfc.toFixed(4)};--sw:${g.sw}">${shot(p, { eager: true, alt: fullName(p) })}<div class="pointer-events-none absolute top-[calc(var(--nfc,.2)*100%)] left-1/2 z-[3] size-0">${ring("animate-[ring_2.8s_var(--ease-smooth)_infinite]")}${ring("animate-[ring_2.8s_var(--ease-smooth)_.9s_infinite]")}${ring("animate-[ring_2.8s_var(--ease-smooth)_1.8s_infinite]")}</div><span class="absolute top-[calc(var(--nfc,.2)*100%)] left-[calc(50%_+_var(--sw,.15)*50%_+_26px)] z-[4] inline-flex -translate-y-1/2 items-center gap-2 rounded-full bg-navy px-3 py-1.5 text-[12px] font-bold whitespace-nowrap text-white shadow-[0_8px_20px_rgba(4,37,85,.3)] max-sm:left-[calc(50%_+_var(--sw,.15)*50%_+_20px)] max-sm:text-[11px]"><i class="absolute top-1/2 right-full h-[1.5px] w-6 bg-navy before:absolute before:-top-[3.5px] before:-left-1 before:size-2 before:rounded-full before:bg-cyan"></i>Lacre VeriSeal · NFC</span></div>`,
          thumb: p.img,
          label: "Garrafa com o lacre",
        },
        ...(p.gallery || []).map((x) => ({
          html: `<img class="max-h-full w-auto object-contain" src="${esc(x.src)}" alt="${esc(`${fullName(p)} — ${x.label.toLowerCase()}`)}" width="${x.size[0]}" height="${x.size[1]}">`,
          thumb: x.src,
          label: x.label,
        })),
      ];
      media.innerHTML = `<div class="relative h-[450px] max-h-[60vh] w-full max-md:h-[340px] max-sm:h-[300px]">${views.map((v, k) => `<div class="invisible absolute inset-0 flex items-end justify-center opacity-0 [transition:opacity_.35s_ease,visibility_.35s] [&.is-on]:visible [&.is-on]:opacity-100${k ? "" : " is-on"}" data-view="${k}">${v.html}</div>`).join("")}</div>
        ${views.length > 1 ? `<div class="flex gap-2" role="group" aria-label="Fotos do produto">${views.map((v, k) => `<button class="h-16 w-[54px] overflow-hidden rounded-xl border-2 border-transparent bg-white p-1 shadow-card aria-pressed:border-accent" type="button" data-view-btn="${k}" aria-pressed="${!k}" aria-label="${esc(v.label)}"><img class="size-full object-contain" src="${esc(v.thumb)}" alt=""></button>`).join("")}</div>` : ""}
        <p class="${NOTE_MARK}">${vsMark("w-[22px]")}Demonstração do lacre VeriSeal</p>`;
      $$("[data-view-btn]", media).forEach((b) =>
        b.addEventListener("click", () => {
          $$("[data-view]", media).forEach((v) =>
            v.classList.toggle("is-on", v.dataset.view === b.dataset.viewBtn),
          );
          $$("[data-view-btn]", media).forEach((x) =>
            x.setAttribute("aria-pressed", String(x === b)),
          );
        }),
      );
    }
    const stepBtn =
      "grid h-full w-[42px] place-items-center rounded-[50%] text-[20px] text-accent disabled:text-line";
    $("#ppInfo").innerHTML = `
      <p class="min-h-[18px] text-[12px] font-bold text-badge">${p.oldPrice ? `<span class="inline-block rounded-md bg-sale px-2 py-[3px] font-bold text-white">-${pct(p)}%${kit ? " no kit" : " esta semana"}</span>` : esc(p.badge || "")}</p>
      <p class="mt-1.5 text-[13px] font-semibold tracking-[.04em] text-fg-2 uppercase">${esc(kit ? `Kit · ${p.bottles.length} garrafas` : p.brand)}</p>
      <h2 class="mt-0.5 pr-[30px] text-[clamp(28px,3.4vw,36px)] leading-[1.06] font-extrabold tracking-[-.035em]" id="ppTitle">${esc(p.name)}</h2>
      <div class="mt-3.5 flex items-baseline gap-2.5">${p.oldPrice ? `<s class="text-[16px] text-fg-3">${money(p.oldPrice)}</s>` : ""}<b class="text-[28px] font-extrabold tracking-[-.025em]">${money(p.price)}</b></div>
      <p class="mt-0.5 text-[14px] text-fg-2"><strong class="font-bold text-ok">${money(pix(p.price))} no Pix</strong> (${PIX_LABEL} off)${i ? ` · ou ${i.n}x de ${money(i.v)} sem juros` : ""}</p>
      <p class="mt-4 text-[15px] text-fg-2">${esc(p.desc)}</p>
      ${
        kit
          ? `<ul class="mt-4 grid gap-2">${kitGroups(p)
              .map(
                ([b, n]) =>
                  `<li class="flex items-center gap-3 rounded-xl bg-surface px-3 py-2"><span class="flex h-[60px] w-7 shrink-0 items-end justify-center">${shot(b)}</span><span><b class="block text-[15px]">${n > 1 ? n + "× " : ""}${esc(b.brand)} ${esc(b.name)}</b><small class="text-[12px] text-fg-2">${esc(b.volume)} · ${abv(b)} vol. · ${esc(b.origin)}</small></span></li>`,
              )
              .join("")}</ul>`
          : `<div class="mt-[18px] grid grid-cols-3 gap-2">${[
              ["Volume", esc(p.volume)],
              ["Teor alcoólico", abv(p)],
              ["Origem", esc(p.origin)],
            ]
              .map(
                ([k, v]) =>
                  `<div class="rounded-xl bg-surface px-3 py-2.5"><span class="block text-[11px] text-fg-2">${k}</span><strong class="text-[15px] tracking-[-.01em]">${v}</strong></div>`,
              )
              .join("")}</div>`
      }
      <div class="mt-3.5 flex flex-wrap gap-1.5">${(p.notes || []).map((n) => `<span class="rounded-full border border-line px-2.5 py-[5px] text-[12px] text-fg-2">${esc(n)}</span>`).join("")}</div>
      <div class="mt-[18px] flex items-start gap-3 rounded-2xl bg-[linear-gradient(135deg,#e6f4fe,#f3f5f9)] px-4 py-3.5">${vsMark("mt-1 w-[34px] shrink-0")}<div><strong class="block text-[14px] text-navy">Lacre VeriSeal${kit ? " em cada garrafa" : ""}</strong><p class="text-[13px] leading-[1.45] text-fg-2">Exemplo visual de lacre inteligente. A verificação desta demonstração usa dados fictícios e não comprova autenticidade.</p></div></div>
      <p class="mt-3.5 flex items-center gap-2 text-[14px] text-fg-2">${
        address.address
          ? `${icon("truck", "size-[18px] text-accent")}<span><b class="text-fg">${etaText(address.address)}</b> em ${esc(placeLabel(address.address))}${shipping(p.price) === 0 ? " · frete grátis" : ""}</span>`
          : `${icon("pin", "size-[18px] text-accent")}<span><button class="${LINK_BTN}" type="button" data-open-address>Informe seu CEP</button> para consultar o endereço. Cobertura não confirmada.</span>`
      }</p>
      <div class="mt-[22px] flex items-center gap-3 pt-1">
        <div class="inline-flex h-[46px] shrink-0 items-center rounded-full border border-line" role="group" aria-label="Quantidade">
          <button class="${stepBtn}" type="button" data-pp="-1" aria-label="Diminuir quantidade">−</button><span class="min-w-[26px] text-center text-[16px] font-bold" id="ppQty">1</span><button class="${stepBtn}" type="button" data-pp="1" aria-label="Aumentar quantidade">+</button>
        </div>
        <button class="btn btn-primary flex-1" type="button" id="ppAdd" data-autofocus>Adicionar · ${money(p.price)}</button>
      </div>`;
    let q = 1;
    const qEl = $("#ppQty"),
      addBtn = $("#ppAdd");
    const sync = () => {
      qEl.textContent = q;
      addBtn.textContent = `Adicionar · ${money(p.price * q)}`;
      $('[data-pp="-1"]').disabled = q <= 1;
      $('[data-pp="1"]').disabled = q >= MAX_QTY;
    };
    $$("[data-pp]").forEach((b) =>
      b.addEventListener("click", () => {
        q = clamp(q + +b.dataset.pp, 1, MAX_QTY);
        sync();
      }),
    );
    addBtn.addEventListener("click", () => {
      if (addToBag(p.id, q)) closeLayer($("#productSheet"));
    });
    sync();
    openLayer($("#productSheet"), addBtn);
    $("#productPanel").scrollTop = 0;
  }

  const checkout = createCheckout({
    bag,
    byId,
    PRODUCTS,
    seals,
    fullName,
    isKit,
    subtotal,
    stack,
    getAddr: () => address.address,
    setAddr: address.setAddr,
    closeLayer,
    openLayer,
    openBag,
    saveBag,
    refreshCTAs,
    updateBagUI,
  });
  const openCheckout = checkout.open;

  const { verifyCode } = createVerification({
    seals,
    byId,
    shot,
    fullName,
    abv,
    toast,
  });

  document.addEventListener("click", (e) => {
    const t = e.target;
    let el;
    if ((el = t.closest("[data-add]"))) {
      addToBag(el.dataset.add);
      refocus(el);
      return;
    }
    if ((el = t.closest("[data-inc]"))) {
      const id = el.dataset.inc,
        q = (bag.get(id) || 0) + 1;
      if (q > MAX_QTY) {
        toast(`Máximo de ${MAX_QTY} unidades por item.`);
        return;
      }
      setQty(id, q);
      refocus(el);
      return;
    }
    if ((el = t.closest("[data-dec]"))) {
      setQty(el.dataset.dec, (bag.get(el.dataset.dec) || 0) - 1);
      refocus(el);
      return;
    }
    if ((el = t.closest("[data-remove]"))) {
      const id = el.dataset.remove,
        q = bag.get(id);
      setQty(id, 0);
      toast(`${fullName(byId[id])} removido.`, "Desfazer", () => setQty(id, q));
      return;
    }
    if ((el = t.closest("[data-open]"))) {
      if (
        el.tagName === "A" &&
        (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey)
      )
        return;
      e.preventDefault();
      openProduct(el.dataset.open);
      return;
    }
    if ((el = t.closest("[data-open-bag]"))) {
      e.preventDefault();
      openBag();
      return;
    }
    if ((el = t.closest("[data-open-address]"))) {
      e.preventDefault();
      closeMenus();
      openAddress();
      return;
    }
    if ((el = t.closest("[data-verify-code]"))) {
      const code = el.dataset.verifyCode;
      if (stack.length)
        [...stack]
          .reverse()
          .forEach((s) => closeLayer(s.el, { restoreFocus: false }));
      $("#verificar").scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      setTimeout(() => verifyCode(code), reduce ? 0 : 500);
      return;
    }
    if ((el = t.closest("a[data-cat]"))) {
      setFilter({ cat: el.dataset.cat, q: "" });
      closeMenus();
      return;
    }
    if (
      (el = t.closest("[data-card]")) &&
      !t.closest("[data-cta], button, a, input, select")
    ) {
      const o = el.querySelector("[data-open]");
      if (o) openProduct(o.dataset.open);
    }
  });

  $$("[data-free-shipping]").forEach((el) => {
    el.textContent = money(FREE_SHIP);
  });
  $$("[data-shipping-fee]").forEach((el) => {
    el.textContent = money(SHIP_FEE);
  });
  $$("[data-pix-discount]").forEach((el) => {
    el.textContent = PIX_LABEL;
  });
  $$("[data-max-installments]").forEach((el) => {
    el.textContent = MAX_INST;
  });
  const linkedProduct = new URLSearchParams(location.search).get("produto");
  if (linkedProduct && Object.hasOwn(byId, linkedProduct)) {
    if (store.get("age", false)) openProduct(linkedProduct);
    else
      $("#ageYes").addEventListener("click", () => openProduct(linkedProduct), {
        once: true,
      });
  }
  updateBagUI();
})();
