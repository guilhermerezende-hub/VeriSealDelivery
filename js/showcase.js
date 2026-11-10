import {
  $,
  $$,
  clamp,
  esc,
  money,
  hhmm,
  pc,
  reduce,
  safe,
  icon,
  vsMark,
  medal,
} from "./ui.js";
import { SITE_HOST } from "./config.js";
import { pix } from "./commerce.js";

export function initShowcase({ byId, fullName, sealGeo, shot, pct, abv }) {
  // bg: fundo do slide · img: recorte da foto · shade: sombra que garante a leitura do texto
  const SLIDES = [
    {
      id: "absolut-1l",
      photo: "assets/photos/absolut-party.webp",
      alt: "Garrafa de Absolut Vodka numa mesa de festa, entre um gin tônica e um espresso martini",
      eyebrow: "Oferta da semana",
      title: "Sexta pede Absolut.",
      sub: "Absolut Vodka 1 L no catálogo demonstrativo. Explore a experiência de compra.",
      bg: "bg-[radial-gradient(ellipse_70%_90%_at_15%_30%,#16336e_0%,#0a1b40_55%,#050d22_100%)]",
      img: "w-[64%] object-[50%_42%] [mask-image:linear-gradient(90deg,transparent_0,#000_30%)] max-sm:object-[50%_36%]",
      shade:
        "after:bg-[linear-gradient(90deg,rgba(5,13,34,.78)_0%,rgba(5,13,34,.45)_36%,transparent_58%)] max-sm:after:bg-[linear-gradient(180deg,transparent_34%,rgba(5,13,34,.75)_50%,#050d22_62%)]",
    },
    {
      id: "tanqueray",
      photo: "assets/photos/tanqueray-gt.webp",
      alt: "Garrafa de Tanqueray London Dry ao lado de uma taça de gin tônica com limão",
      eyebrow: "Gin tônica perfeito",
      title: (p) => `Tanqueray com ${pct(p)}% off.`,
      sub: "O London Dry do gin tônica clássico, com uma demonstração do lacre VeriSeal.",
      bg: "bg-[radial-gradient(ellipse_60%_90%_at_20%_40%,#0f5a38_0%,#073522_60%,#04231a_100%)]",
      img: "w-[60%] object-[34%_50%] [mask-image:linear-gradient(90deg,transparent_0,#000_26%)] max-sm:object-[30%_40%]",
      shade:
        "after:bg-[linear-gradient(90deg,rgba(4,35,26,.78)_0%,rgba(4,35,26,.45)_36%,transparent_58%)] max-sm:after:bg-[linear-gradient(180deg,transparent_34%,rgba(4,35,26,.75)_50%,#04231a_62%)]",
    },
    {
      id: "kit-jack-trio",
      bottles: ["jack-apple", "jack-7", "jack-fire"],
      eyebrow: "Kit mais pedido",
      title: "Família Jack Daniel's.",
      sub: "Old No.7, Apple e Fire: três garrafas, três lacres, uma entrega.",
      bg: "bg-[radial-gradient(ellipse_46%_70%_at_74%_70%,#8a4512_0%,#44200a_42%,#170a03_100%)]",
      copy: "max-w-[min(430px,52%)]",
      shade:
        "after:bg-[linear-gradient(90deg,rgba(23,10,3,.85)_0%,rgba(23,10,3,.5)_38%,transparent_60%)] max-sm:after:bg-[linear-gradient(180deg,transparent_40%,rgba(23,10,3,.85)_64%)]",
    },
  ];
  // --o e --a vêm do JS: o slide anda o banner inteiro, a foto anda menos (parallax) e o texto some antes
  const PARALLAX =
    "[translate:calc(var(--o,0)*var(--pw)*-.42)_0] [scale:calc(1_+_var(--a,0)*.07)] will-change-transform";
  const FADE_OUT =
    "[translate:calc(var(--o,0)*var(--pw)*.14)_0] opacity-[calc(1_-_var(--a,0)*1.6)] will-change-[transform,opacity]";
  function slideHTML(s, i, n) {
    const p = byId[s.id];
    // sem loading="lazy": os slides ficam fora da tela até a troca, e a foto não pode chegar atrasada
    return `<article class="relative col-start-1 row-start-1 flex min-w-0 items-center overflow-hidden text-white backface-hidden will-change-transform [transform:translate3d(calc(var(--o,0)*100%),0,0)] before:pointer-events-none before:absolute before:inset-0 before:z-[3] before:bg-[#01050d] before:opacity-[calc(var(--a,0)*.5)] before:will-change-[opacity] after:pointer-events-none after:absolute after:inset-0 after:z-[1] max-sm:items-end ${s.bg} ${s.shade}" role="group" aria-roledescription="slide" aria-label="${i + 1} de ${n}">
      ${s.photo ? `<img class="absolute inset-0 left-auto h-full object-cover [-webkit-user-drag:none] max-sm:h-[58%] max-sm:w-full max-sm:[mask-image:linear-gradient(180deg,#000_60%,transparent)] ${PARALLAX} ${s.img}" src="${s.photo}" alt="${esc(s.alt)}" fetchpriority="${i ? "low" : "high"}" decoding="async" draggable="false">` : ""}
      ${s.bottles ? `<div class="absolute right-[6%] -bottom-[4%] z-[1] flex h-[92%] items-end max-sm:top-[5%] max-sm:right-1/2 max-sm:bottom-auto max-sm:h-[46%] max-sm:[transform:translateX(50%)] ${PARALLAX}" aria-hidden="true">${s.bottles.map((id, k) => shot(byId[id], { eager: true, cls: (k === 1 ? "z-[1] h-full" : "h-[88%]") + " -mx-[1.6%] drop-shadow-[0_24px_30px_rgba(0,0,0,.55)]" })).join("")}</div>` : ""}
      <div class="relative z-[2] px-12 pb-[54px] max-sm:px-[22px] max-sm:pb-16 ${s.copy || "max-w-[min(470px,54%)] max-sm:max-w-none"} ${FADE_OUT}">
        <p class="mb-3.5 inline-flex items-center rounded-full bg-white/18 px-[11px] py-[5px] text-[12px] font-bold tracking-[.04em] uppercase">${esc(s.eyebrow)}</p>
        <h2 class="text-[clamp(32px,3.8vw,50px)] leading-none font-extrabold tracking-[-.04em] text-balance max-sm:text-[32px]">${esc(typeof s.title === "function" ? s.title(p) : s.title)}</h2>
        <p class="mt-3 max-w-[380px] text-[16px] leading-[1.45] text-white/84 max-sm:text-[15px]">${esc(s.sub)}</p>
        <p class="mt-4 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">${p.oldPrice ? `<s class="text-[15px] text-white/62">${money(p.oldPrice)}</s>` : ""}<b class="text-[32px] leading-none font-extrabold tracking-[-.03em] max-sm:text-[26px]">${money(p.price)}</b><span class="text-[14px] font-semibold text-[#8ef5b0]">${money(pix(p.price))} no Pix</span></p>
        <div class="mt-5 flex flex-wrap items-center gap-3.5">
          <button class="btn btn-light" type="button" data-add="${p.id}" aria-label="Adicionar ${esc(fullName(p))} à sacola">${icon("plus")}Adicionar</button>
          <button class="inline-flex items-center gap-1 py-2 text-[15px] font-semibold text-white hover:underline" type="button" data-open="${p.id}">Ver detalhes ${icon("chev-r", "size-4")}</button>
        </div>
      </div>
      <span class="absolute top-[18px] right-[18px] z-[2] inline-flex items-center gap-[7px] rounded-full bg-navy-ink/50 py-1.5 pr-3 pl-[9px] text-[12px] font-bold shadow-[inset_0_0_0_1px_rgba(255,255,255,.18)] backdrop-blur-[10px] max-sm:top-3 max-sm:right-3 max-sm:text-[11px] ${FADE_OUT}">${vsMark("w-[22px]", true)}Lacre VeriSeal</span>
    </article>`;
  }
  // curva cubic-bezier do CSS, para animar em JS com a mesma sensação das transições
  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1,
      bx = 3 * (x2 - x1) - cx,
      ax = 1 - cx - bx;
    const cy = 3 * y1,
      by = 3 * (y2 - y1) - cy,
      ay = 1 - cy - by;
    const fx = (t) => ((ax * t + bx) * t + cx) * t,
      dx = (t) => (3 * ax * t + 2 * bx) * t + cx;
    return (x) => {
      if (x <= 0 || x >= 1) return clamp(x, 0, 1);
      let t = x;
      for (let k = 0; k < 6; k++) {
        const e = fx(t) - x,
          d = dx(t);
        if (Math.abs(e) < 1e-5 || Math.abs(d) < 1e-6) break;
        t -= e / d;
      }
      if (Math.abs(fx(t) - x) > 1e-4) {
        // Newton não convergiu: bissecção
        let lo = 0,
          hi = 1;
        t = x;
        for (let k = 0; k < 24; k++) {
          if (fx(t) < x) lo = t;
          else hi = t;
          t = (lo + hi) / 2;
        }
      }
      return ((ay * t + by) * t + cy) * t;
    };
  }
  /* Carrossel circular movido por transform (GPU), sem rolagem nativa: do último destaque segue para o
     primeiro sem rebobinar. Cada slide recebe --o, a distância até a posição atual (-1 saindo pela
     esquerda, 1 entrando pela direita), e --a = |o|; o CSS desliza o slide e faz o parallax da foto e do
     texto. O dedo (ou o mouse) arrasta 1:1 e, ao soltar, a velocidade do gesto decide o destino. A barrinha
     do ponto ativo mostra o tempo até o próximo destaque e para quando o mouse ou o foco está no banner. */
  safe("promo", () => {
    const promo = $("#promo"),
      track = $("#promoTrack"),
      dotsEl = $("#promoDots");
    const N = SLIDES.length;
    track.innerHTML = SLIDES.map((s, i) => slideHTML(s, i, N)).join("");
    // a barrinha do ponto ativo enche no tempo do destaque (dotFill); quando termina, o JS passa para o próximo
    dotsEl.innerHTML = SLIDES.map(
      (s, i) =>
        `<button class="group grid h-[30px] place-items-center px-2" type="button" data-dot="${i}" aria-label="Ver destaque ${i + 1}"><i class="relative block size-2 overflow-hidden rounded-[99px] bg-white/45 [transition:width_.5s_var(--ease-smooth),background-color_.3s] after:absolute after:inset-0 after:origin-left after:bg-white after:[transform:scaleX(0)] group-hover:bg-white/70 group-aria-[current=true]:w-[30px] group-aria-[current=true]:bg-white/30 group-aria-[current=true]:after:[transform:none] [.is-auto_[aria-current=true]_&]:after:animate-[dotFill_6.5s_linear_both] [.is-held_&]:after:[animation-play-state:paused]"></i></button>`,
    ).join("");
    const slides = [...track.children],
      dots = $$("[data-dot]", dotsEl);
    $$("img", track).forEach((img) => img.decode?.().catch(() => {})); // já decodificadas na primeira troca

    const wrap = (d) => (((d % N) + N * 1.5) % N) - N / 2; // distância circular, em [-N/2, N/2)
    const idx = (g) => ((g % N) + N) % N;
    const easeAuto = bezier(0.65, 0, 0.3, 1),
      easeTap = bezier(0.25, 0.8, 0.25, 1),
      easeFling = bezier(0.15, 0.6, 0.3, 1);
    let pos = 0,
      goal = 0,
      cur = -1,
      raf = 0;

    const paint = () =>
      slides.forEach((s, i) => {
        const o = wrap(i - pos);
        s.style.setProperty("--o", o.toFixed(4));
        s.style.setProperty("--a", Math.min(1, Math.abs(o)).toFixed(4));
      });
    function tween(dur, ease) {
      cancelAnimationFrame(raf);
      const from = pos,
        to = goal,
        t0 = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - t0) / dur);
        pos = from + (to - from) * ease(t);
        if (t < 1) raf = requestAnimationFrame(tick);
        else {
          raf = 0;
          pos = goal = idx(goal);
        } // normaliza: a posição não cresce sem fim
        paint();
      };
      raf = requestAnimationFrame(tick);
    }
    // how: 'auto' (tempo esgotado), 'tap' (setas, pontos, teclado) ou 'fling' (soltou o arraste, v em px/ms)
    function go(g, how = "tap", v = 0) {
      goal = g;
      setCurrent(idx(g), how);
      if (reduce) {
        cancelAnimationFrame(raf);
        raf = 0;
        pos = goal = idx(goal);
        paint();
        return;
      }
      const dist = Math.abs(goal - pos);
      if (how === "auto") tween(1050, easeAuto);
      else if (how === "fling")
        tween(
          clamp(
            (4 * dist * promo.clientWidth) / Math.max(Math.abs(v), 0.001),
            260,
            650,
          ),
          easeFling,
        );
      else tween(clamp(560 + dist * 240, 560, 900), easeTap);
    }
    const step = (d, how) => go(goal + d, how);
    const show = (i) => go(goal + wrap(i - idx(goal)));

    /* ---- tempo de cada destaque: a animação da barrinha do ponto ativo (6,5 s) ---- */
    const auto = !reduce;
    const holds = new Set();
    const hold = (why, on) => {
      holds[on ? "add" : "delete"](why);
      promo.classList.toggle("is-held", holds.size > 0);
    };
    const restartClock = () => {
      if (!auto) return;
      promo.classList.remove("is-auto");
      void promo.offsetWidth;
      promo.classList.add("is-auto");
    };
    dotsEl.addEventListener("animationend", (e) => {
      if (e.animationName === "dotFill") step(1, "auto");
    });
    function setCurrent(i, how) {
      track.setAttribute("aria-live", how === "auto" ? "off" : "polite");
      if (i !== cur) {
        cur = i;
        dots.forEach((d, k) => d.setAttribute("aria-current", String(k === i)));
        slides.forEach((s, k) => {
          s.inert = k !== i;
        });
      }
      restartClock();
    }

    /* ---- arrastar com o dedo ou o mouse ---- */
    let drag = null,
      dragged = false;
    promo.addEventListener("pointerdown", (e) => {
      if (
        (e.pointerType === "mouse" && e.button !== 0) ||
        e.target.closest("[data-promo-ui]")
      )
        return;
      drag = {
        id: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        on: false,
        p0: pos,
        w: promo.clientWidth,
        s: [],
      };
    });
    promo.addEventListener("pointermove", (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.on) {
        const dx = e.clientX - drag.x,
          dy = e.clientY - drag.y;
        if (Math.hypot(dx, dy) < 8) return;
        if (Math.abs(dy) > Math.abs(dx)) {
          drag = null;
          return;
        } // gesto vertical: é a página rolando
        drag.on = true;
        drag.x = e.clientX;
        drag.p0 = pos; // segue o dedo daqui em diante, sem salto
        cancelAnimationFrame(raf);
        raf = 0;
        try {
          promo.setPointerCapture(e.pointerId);
        } catch {
          /* ponteiro já liberado */
        }
        promo.classList.add("is-dragging");
        hold("drag", true);
      }
      pos = drag.p0 - (e.clientX - drag.x) / drag.w;
      paint();
      drag.s.push([e.timeStamp, e.clientX]);
      if (drag.s.length > 6) drag.s.shift();
    });
    const release = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag;
      drag = null;
      if (!d.on) return;
      promo.classList.remove("is-dragging");
      hold("drag", false);
      dragged = true;
      setTimeout(() => {
        dragged = false;
      }, 60); // o clique que vem junto com o soltar não vale
      // velocidade dos últimos ~100 ms (se o dedo parou antes de soltar, é zero)
      const s = d.s.filter(([t]) => e.timeStamp - t < 100);
      const v =
        s.length > 1
          ? (s[s.length - 1][1] - s[0][1]) /
            Math.max(1, s[s.length - 1][0] - s[0][0])
          : 0;
      const g =
        Math.abs(v) > 0.25
          ? v < 0
            ? Math.floor(pos) + 1
            : Math.ceil(pos) - 1
          : Math.round(pos);
      go(g, "fling", v);
    };
    promo.addEventListener("pointerup", release);
    promo.addEventListener("pointercancel", release);
    promo.addEventListener(
      "click",
      (e) => {
        if (dragged) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
      true,
    );
    promo.addEventListener("dragstart", (e) => e.preventDefault());

    /* ---- setas, pontos e teclado ---- */
    $$("[data-promo]", promo).forEach((b) =>
      b.addEventListener("click", () => step(+b.dataset.promo)),
    );
    dotsEl.addEventListener("click", (e) => {
      const d = e.target.closest("[data-dot]");
      if (d) show(+d.dataset.dot);
    });
    promo.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      step(e.key === "ArrowRight" ? 1 : -1);
    });

    /* ---- pausa: mouse em cima, foco do teclado, fora da tela ou aba escondida ---- */
    promo.addEventListener("pointerenter", (e) => {
      if (e.pointerType === "mouse") hold("hover", true);
    });
    promo.addEventListener("pointerleave", (e) => {
      if (e.pointerType === "mouse") hold("hover", false);
    });
    promo.addEventListener("focusin", (e) => {
      if (e.target.matches(":focus-visible")) hold("focus", true);
    });
    promo.addEventListener("focusout", (e) => {
      if (!promo.contains(e.relatedTarget)) hold("focus", false);
    });
    new IntersectionObserver(([e]) => hold("view", !e.isIntersecting)).observe(
      promo,
    );
    document.addEventListener("visibilitychange", () =>
      hold("tab", document.hidden),
    );
    // largura do banner em px, para o parallax andar na mesma escala em qualquer tela
    new ResizeObserver(() =>
      promo.style.setProperty("--pw", promo.clientWidth + "px"),
    ).observe(promo);

    paint();
    setCurrent(0, "auto");
  });

  // garrafas das animações de verificação: fotos com bordas limpas, que ficam bem no fundo escuro
  const DEMO = "jack-7",
    CARD = "tanqueray";

  /* ---------- cartão VeriSeal do topo: encostou o celular, o navegador já mostra o resultado ---------- */
  const APP_TINTS = [
    ["#9ad7ff", "#2f8cff"],
    ["#7ee7c7", "#2bb67d"],
    ["#ffb86b", "#ff6b6b"],
    ["#ffe58a", "#f4b400"],
    ["#b7a6ff", "#6c5ce7"],
    ["#ff9ac4", "#e84393"],
    ["#c4f08a", "#62b33a"],
    ["#e6e9ef", "#aab3c2"],
  ];
  safe("vsCard", () => {
    const p = byId[CARD],
      g = sealGeo(p);
    const stage = $("#vcStage");
    const ring = (anim) =>
      `<i class="absolute -top-10 -left-10 size-20 rounded-full border-2 border-cyan opacity-0 ${anim}"></i>`;
    const screen =
      "absolute inset-0 flex flex-col items-center text-center opacity-0";
    stage.innerHTML = `
      <div class="absolute -top-[2%] left-[2%] h-[64%] w-[76%] bg-[radial-gradient(closest-side,rgba(95,208,255,.5),rgba(3,173,249,.16)_58%,transparent)] blur-[8px]"></div>
      <div class="absolute top-[calc(31%_-_var(--nfc)*var(--bh))] left-[14%] aspect-[var(--ar)] h-(--bh) drop-shadow-[0_30px_40px_rgba(0,0,0,.5)] [--bh:560px] max-md:left-[24%] max-sm:left-[9%] max-sm:[--bh:520px]" style="--nfc:${g.nfc.toFixed(4)};--ar:${p.size[0]} / ${p.size[1]}">${shot(p, { eager: true, sealCls: "animate-[vcGlow_7s_var(--ease-smooth)_infinite]" })}
        <span class="absolute top-[calc(var(--nfc)*100%)] left-1/2 size-0 animate-[vcRead_7s_linear_infinite]">${ring("animate-[ring_1.2s_var(--ease-smooth)_infinite]")}${ring("animate-[ring_1.2s_var(--ease-smooth)_.4s_infinite]")}${ring("animate-[ring_1.2s_var(--ease-smooth)_.8s_infinite]")}</span>
        <span class="absolute top-[calc(var(--nfc)*100%_+_44px)] -left-[6%] z-[2] inline-flex animate-[vcOk_7s_var(--ease-smooth)_infinite] items-center gap-1.5 rounded-full bg-white py-[7px] pr-3 pl-2 text-[12px] font-bold whitespace-nowrap text-ok opacity-0 shadow-[0_12px_28px_rgba(0,0,0,.35)] motion-reduce:opacity-100! motion-reduce:[transform:none]! max-sm:hidden"><span class="rounded-full bg-ok-fill p-0.5 text-white">${icon("check", "size-[15px]")}</span>Original · lacre íntegro</span>
      </div>
      <div class="absolute top-[calc(31%_-_104px)] right-[26px] h-[210px] w-[104px] animate-[vcPhone_7s_var(--ease-smooth)_infinite] rounded-[22px] bg-[linear-gradient(145deg,#2b313b,#0b0e13_40%,#1f242c)] p-[5px] shadow-[inset_0_0_0_1.5px_rgba(255,255,255,.14),0_26px_40px_-18px_rgba(0,0,0,.7)] max-md:right-[22%] max-sm:right-[22px]"><div class="relative h-full overflow-hidden rounded-[17px] bg-[#f5f8fc] text-ink before:absolute before:top-1.5 before:left-1/2 before:z-[2] before:h-[9px] before:w-[34%] before:-translate-x-1/2 before:rounded-[9px] before:bg-[#05070a]">
        <span class="${screen} animate-[vcHome_7s_var(--ease-smooth)_infinite] bg-[radial-gradient(120%_70%_at_20%_0%,#2f6fd0,transparent_60%),linear-gradient(160deg,#0b2a66,#041330_70%)] pt-[30px] text-white motion-reduce:opacity-0!"><b class="text-[24px] leading-none font-semibold tracking-[-.03em]">${hhmm(new Date())}</b><span class="mt-4 grid grid-cols-[repeat(4,15px)] gap-[7px]">${APP_TINTS.map(([a, b]) => `<i class="size-[15px] rounded-[4px]" style="background:linear-gradient(135deg,${a},${b})"></i>`).join("")}</span></span>
        <span class="${screen} animate-[vcWeb_7s_var(--ease-smooth)_infinite] gap-[3px] bg-[#f5f8fc] bg-[radial-gradient(90px_70px_at_50%_38%,rgba(20,166,74,.14),transparent_70%)] pt-10 motion-reduce:opacity-100! motion-reduce:[transform:none]!"><span class="absolute inset-x-[7px] top-[19px] flex h-[13px] items-center justify-center gap-[3px] rounded-[5px] bg-[#e6ebf2] text-[7px] font-semibold text-[#3a4250]">${icon("lock", "size-[7px]")}${esc(SITE_HOST)}</span>${medal("ok", "loop", "50px", "mt-2.5 mb-2")}<b class="text-[14px] leading-[1.1] font-extrabold tracking-[-.02em] text-[#0f8a3c]">Autêntico</b><small class="text-[9.5px] text-fg-2">Nunca aberta</small></span>
      </div></div>`;
    // a animação só roda com o cartão na tela
    new IntersectionObserver(([e]) =>
      stage.classList.toggle("is-paused", !e.isIntersecting),
    ).observe(stage);
  });

  safe("how", () => {
    const scene = $("#howScene");
    const steps = $$("#howSteps li"),
      stepBtns = $$("#howSteps button");
    const seg = $("#howSeg"),
      segBtns = $$("button", seg),
      playBtn = $("#howPlay");
    const scr = {
      ok: $('[data-scr="ok"]', scene),
      bad: $('[data-scr="bad"]', scene),
    };
    const P = byId[DEMO],
      g = sealGeo(P);
    const hsBottle = $("#hsBottle");
    hsBottle.style.setProperty("--ar", `${P.size[0]} / ${P.size[1]}`);
    hsBottle.style.setProperty("--seal", g.nfc.toFixed(4)); // ondas e etiquetas saem do símbolo NFC
    hsBottle.style.setProperty("--seal-top", g.top.toFixed(4)); // o scanner desce a partir do topo da tira
    // recortes complementares: o da tampa invade 0,4% para baixo e esconde a emenda
    const zig = [];
    for (let k = 0; k <= 8; k++)
      zig.push([
        g.x - g.sw / 2 + (g.sw * k) / 8,
        g.y + (k % 2 ? 0.006 : -0.002),
      ]);
    const pts = (a, dy = 0) =>
      a.map(([x, y]) => `${pc(x)} ${pc(y + dy)}`).join(", ");
    const capClip = `polygon(0 0, 100% 0, 100% ${pc(g.y + 0.004)}, ${pts(zig.slice().reverse(), 0.004)}, 0 ${pc(g.y + 0.004)})`;
    const bodyClip = `polygon(0 ${pc(g.y)}, ${pts(zig)}, 100% ${pc(g.y)}, 100% 100%, 0 100%)`;
    const dot =
      "absolute -top-[3px] size-[7px] rounded-full bg-[#ff5b4f] shadow-[0_0_10px_2px_rgba(255,91,79,.8)]";
    $("#hsPhoto").innerHTML = `
      <div class="absolute inset-0" style="clip-path:${bodyClip}">${shot(P, { eager: true, sealCls: "[.is-reading_&]:[filter:drop-shadow(0_0_7px_rgba(95,208,255,.95))_drop-shadow(0_0_2px_#fff)]" })}<span class="absolute size-0 opacity-0 [transition:opacity_.3s_.4s] [.is-bad.st-2_&]:opacity-100" style="left:${pc(g.x)};top:${pc(g.y)}"><i class="${dot} -left-3.5"></i><i class="${dot} left-[7px]"></i></span></div>
      <div class="absolute inset-0 [transition:transform_.9s_var(--ease-spring)] [.is-bad.st-2_&]:[transform:translate(6%,-3.4%)_rotate(-10deg)]" style="clip-path:${capClip};transform-origin:${pc(g.x + g.sw)} ${pc(g.y)}">${shot(P, { eager: true })}</div>`;
    $$("[data-thumb]", scene).forEach((el) => {
      el.innerHTML = shot(P, {
        torn: el.dataset.thumb === "bad",
        cls: "mt-[.6cqi] h-full",
      });
    });
    $$("[data-medal]", scene).forEach((el) => {
      el.innerHTML = medal(el.dataset.medal, "on", "26cqi");
    });
    $$("[data-url]", scene).forEach((el) => {
      el.textContent = `${SITE_HOST}/${el.dataset.url}`;
    });
    $$("[data-prod]", scene).forEach((el) => {
      el.querySelector("b").textContent = P.name;
      el.querySelector("span").textContent =
        `${P.brand} · ${P.volume} · ${abv(P)}`;
    });
    const order = [
      [DEMO, 1],
      ["tanqueray", 1],
    ];
    $("#dpItems").innerHTML = order
      .map(([id, q]) => {
        const p = byId[id];
        return `<li class="flex items-center gap-[3cqi] rounded-[4cqi] bg-white px-[3cqi] py-[2.2cqi] shadow-[0_.5cqi_2cqi_rgba(15,26,46,.08),0_0_0_.3cqi_rgba(15,26,46,.05)]"><span class="flex h-[15cqi] w-[8cqi] flex-none items-end justify-center">${shot(p)}</span><span class="min-w-0 flex-1"><b class="block truncate text-[3.9cqi] font-bold">${esc(p.name)}</b><span class="block text-[3.3cqi] text-[#6e6e73]">${esc(p.brand)} · ${q}×</span></span><b class="text-[3.7cqi] font-bold whitespace-nowrap">${money(p.price * q)}</b></li>`;
      })
      .join("");
    $("#dpTotal").textContent = money(
      pix(order.reduce((s, [id, q]) => s + byId[id].price * q, 0)),
    );
    // horários do celular sempre relativos à hora atual
    const clock = () => {
      const now = Date.now(),
        at = (min) => hhmm(new Date(now + min * 60000));
      $$("[data-clock]", scene).forEach((t) => {
        t.textContent = at(0);
      });
      $("#dpEta").textContent = at(18);
      $("#apSent").textContent = "hoje · " + at(-24);
      $("#apBroken").textContent = "hoje · " + at(-3);
    };
    clock();
    setInterval(clock, 30000);

    const DUR = [3.6, 4.2, 7.4];
    const OPEN = 0.3; // na etapa 3, o ponto em que o navegador abre (já no resultado)
    let step = 0,
      local = 0,
      playing = !reduce,
      inView = false,
      started = false,
      bad = false,
      raf = 0,
      last = 0;
    function render() {
      const L = local,
        s2 = started && step === 2;
      scene.classList.toggle("is-started", started);
      ["st-0", "st-1", "st-2"].forEach((c, i) =>
        scene.classList.toggle(c, started && step === i),
      );
      scene.classList.toggle("is-scanned", started && step === 1 && L > 0.42);
      scene.classList.toggle("is-reading", s2 && L > 0.08 && L < OPEN + 0.04);
      scene.classList.toggle("ph-open", s2 && L >= OPEN);
      scene.classList.toggle("ph-result", s2 && L >= OPEN + 0.14);
      scr.ok.classList.toggle("is-on", s2 && L >= OPEN && !bad);
      scr.bad.classList.toggle("is-on", s2 && L >= OPEN && bad);
      steps.forEach((li, i) => {
        li.classList.toggle("is-active", started && i === step);
        li.classList.toggle("is-done", started && i < step);
        li.style.setProperty(
          "--sp",
          !started ? 0 : i < step ? 1 : i === step ? L.toFixed(3) : 0,
        );
        stepBtns[i].setAttribute(
          "aria-current",
          started && i === step ? "step" : "false",
        );
      });
    }
    function go(i, at = 0) {
      step = i;
      local = at;
      render();
    }
    function setPlaying(v) {
      playing = v;
      scene.classList.toggle("is-paused", !v);
      playBtn.classList.toggle("is-playing", v);
      playBtn.setAttribute(
        "aria-label",
        v ? "Pausar demonstração" : "Reproduzir demonstração",
      );
      if (v) loop();
    }
    function setBad(v) {
      bad = v;
      segBtns.forEach((b) => {
        const on = (b.dataset.mode === "bad") === v;
        b.setAttribute("aria-checked", String(on));
        b.tabIndex = on ? 0 : -1;
      });
      seg.classList.toggle("is-bad", v);
      scene.classList.toggle("is-bad", v);
    }
    // reinicia a animação do resultado mesmo quando a mesma tela já está aberta
    const replay = () => {
      scr.ok.classList.remove("is-on");
      scr.bad.classList.remove("is-on");
      void scene.offsetWidth;
    };
    stepBtns.forEach((b, i) =>
      b.addEventListener("click", () => {
        started = true;
        replay();
        go(i, i === 2 && !playing ? OPEN : 0);
      }),
    );
    playBtn.addEventListener("click", () => setPlaying(!playing));
    segBtns.forEach((b) =>
      b.addEventListener("click", () => {
        setBad(b.dataset.mode === "bad");
        started = true;
        replay();
        go(2, OPEN);
      }),
    );
    seg.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      const next = segBtns.find(
        (b) => b.getAttribute("aria-checked") !== "true",
      );
      next.click();
      next.focus();
    });
    function frame(now) {
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      if (started && inView && playing) {
        local += dt / DUR[step];
        if (local >= 1) go((step + 1) % 3);
        else render();
      }
      raf = inView && playing ? requestAnimationFrame(frame) : 0;
    }
    function loop() {
      if (!raf && inView && playing) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    }
    new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          inView = e.isIntersecting;
          if (inView && !started) {
            started = true;
            go(0);
          }
          loop();
        }),
      { threshold: 0.35 },
    ).observe(scene);
    setPlaying(playing);
    render();
  });

  /* ---------- lacre interativo (raio-X) ---------- */
  safe("sealTile", () => {
    window.Seal.mount($("#tileSeal"), {
      serial: "VS-7K2M-9QXA",
      pointerHost: $("#sealTile"),
    });
  });
}
