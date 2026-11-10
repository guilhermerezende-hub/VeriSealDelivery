const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
const money = (v) => BRL.format(Math.round(v * 100) / 100);
const norm = (s) =>
  String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const hhmm = (d) =>
  d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
const pc = (v) => (v * 100).toFixed(2) + "%";
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const safe = (name, fn) => {
  try {
    return fn();
  } catch (err) {
    console.error("[VeriSeal Delivery] " + name, err);
  }
};
const setState = (el, s) => {
  if (s) el.dataset.state = s;
  else delete el.dataset.state;
};
const icon = (name, cls = "") =>
  `<i class="icon icon-${name} ${cls}" aria-hidden="true"></i>`;
// logo curta (VS): a versão de fundo escuro é branca com a pontinha ciano
const vsMark = (cls = "", dark = false) =>
  `<img class="aspect-mark h-auto ${cls}" src="assets/brand/logo-short-${dark ? "dark" : "light"}-bg.svg" alt="">`;

const SEAL_PILL =
  "absolute top-[9px] right-[9px] z-[2] inline-flex items-center gap-[5px] rounded-full bg-navy py-[3px] pr-2 pl-1.5 text-[11px] font-bold text-white max-sm:pr-[7px] max-sm:pl-[5px] max-sm:text-[10px]";
const SEAL_PILL_MARK = "w-[18px] max-sm:w-[15px]";
const MEDIA_BG =
  "bg-[radial-gradient(ellipse_52%_9%_at_50%_93%,rgba(4,37,85,.2),transparent_72%),linear-gradient(180deg,#f6f8fb,#e9eef5)]";
const LINK_BTN = "text-accent hover:underline";
const NOTE_MARK =
  "inline-flex items-center gap-2 text-[13px] font-bold text-navy";
const ROW = "flex justify-between py-[3px] text-[14px] text-fg-2";
const GRAND =
  "flex justify-between pt-2 pb-[3px] text-[19px] font-extrabold tracking-[-.02em] text-fg";
const FREE = "font-semibold text-ok";
const CEP_INFO =
  "mb-2 min-h-4 text-[12px] text-fg-2 data-[state=err]:text-bad data-[state=ok]:text-ok";
const FIELD = "flex min-w-0 flex-col gap-1.5";
const LABEL = "text-[13px] font-semibold text-fg";
const INPUT =
  "w-full resize-y rounded-xl border border-line bg-white px-3.5 py-3 text-[16px] outline-none transition-[border-color,box-shadow] duration-200 focus:border-accent focus:shadow-focus [&.invalid]:border-bad";
const OPTIONAL = ' <span class="font-normal text-fg-2">(opcional)</span>';
const PAY_OPT =
  "flex cursor-pointer items-center gap-3.5 rounded-2xl border-[1.5px] border-line px-4 py-3.5 transition-[border-color,background] duration-200 hover:border-fg-3 has-checked:border-accent has-checked:bg-accent/4 has-disabled:cursor-default has-disabled:opacity-55";
const PAY_RADIO = "m-0 size-[18px] shrink-0 accent-accent";
const PAY_IC =
  "grid size-9 shrink-0 place-items-center rounded-[10px] bg-surface text-navy";
const PAY_EXTRA = "pr-1 pb-1 pl-[50px] max-sm:pl-1";
const REVIEW = "rounded-2xl bg-surface px-[18px] py-3.5";
const REVIEW_H =
  "mb-1.5 flex justify-between text-[13px] font-semibold text-fg-2";
const ACTIONS =
  "mt-[22px] flex justify-between gap-2.5 max-sm:flex-col-reverse";
const ACTION_MAIN =
  "btn btn-primary ml-auto max-w-[340px] flex-1 max-sm:max-w-none";
const VR_IN = "animate-[riseIn_.5s_var(--ease-smooth)_var(--d,0s)_both]";

const SCALLOP =
  "M28 4.8Q35.82-1.17 39.6 7.91Q49.35 6.65 48.09 16.4Q57.17 20.18 51.2 28Q57.17 35.82 48.09 39.6Q49.35 49.35 39.6 48.09Q35.82 57.17 28 51.2Q20.18 57.17 16.4 48.09Q6.65 49.35 7.91 39.6Q-1.17 35.82 4.8 28Q-1.17 20.18 7.91 16.4Q6.65 6.65 16.4 7.91Q20.18-1.17 28 4.8Z";
const MEDAL_TINT = {
  ok: ["#14a64a", "rgba(20,166,74,.42)"],
  warn: ["#e8930c", "rgba(232,147,12,.42)"],
  bad: ["#d93025", "rgba(217,48,37,.42)"],
};
const MEDAL_TINT_DARK = {
  ok: ["#22c55e", "rgba(34,197,94,.5)"],
  warn: ["#f5a524", "rgba(245,165,36,.5)"],
  bad: ["#ff5b4f", "rgba(255,91,79,.5)"],
};
const MEDAL_ANIM = {
  now: {
    badge: "animate-[mPop_.75s_var(--ease-spring)_both]",
    shake: "animate-[mPop_.75s_var(--ease-spring)_both,mShake_.45s_ease_.85s]",
    glyph: "animate-[draw_.42s_var(--ease-io)_.42s_forwards]",
    dot: "animate-[mFade_.2s_ease_.8s_forwards]",
    shock: [
      "animate-[mShock_1.1s_var(--ease-smooth)_.28s_both]",
      "animate-[mShock_1.1s_var(--ease-smooth)_.5s_both]",
    ],
    halo: "animate-[mHalo_.7s_var(--ease-smooth)_.45s_both,mSpin_9s_linear_.45s_infinite]",
    glow: "animate-[mGlow_2.6s_ease-in-out_.3s_infinite_both]",
    spark: "animate-[mSpark_.95s_var(--ease-smooth)_.3s_both]",
  },
  on: {
    badge: "[.is-on_&]:animate-[mPop_.75s_var(--ease-spring)_both]",
    shake:
      "[.is-on_&]:animate-[mPop_.75s_var(--ease-spring)_both,mShake_.45s_ease_.85s]",
    glyph: "[.is-on_&]:animate-[draw_.42s_var(--ease-io)_.42s_forwards]",
    dot: "[.is-on_&]:animate-[mFade_.2s_ease_.8s_forwards]",
    shock: [
      "[.is-on_&]:animate-[mShock_1.1s_var(--ease-smooth)_.28s_both]",
      "[.is-on_&]:animate-[mShock_1.1s_var(--ease-smooth)_.5s_both]",
    ],
    halo: "[.is-on_&]:animate-[mHalo_.7s_var(--ease-smooth)_.45s_both,mSpin_9s_linear_.45s_infinite]",
    glow: "[.is-on_&]:animate-[mGlow_2.6s_ease-in-out_.3s_infinite_both]",
    spark: "[.is-on_&]:animate-[mSpark_.95s_var(--ease-smooth)_.3s_both]",
  },
  loop: {
    badge: "animate-[vcPop_7s_var(--ease-smooth)_infinite]",
    glyph: "animate-[vcDraw_7s_linear_infinite]",
    dot: "",
    shock: [
      "animate-[vcShock_7s_var(--ease-smooth)_infinite]",
      "animate-[vcShock2_7s_var(--ease-smooth)_infinite]",
    ],
    halo: "animate-[vcHalo_7s_linear_infinite]",
    glow: "animate-[vcHalo_7s_linear_infinite]",
    spark: "animate-[vcSpark_7s_var(--ease-smooth)_infinite]",
  },
};
const medal = (kind = "ok", play = "now", ms = "96px", cls = "") => {
  const [mc, mg] = (play === "now" ? MEDAL_TINT_DARK : MEDAL_TINT)[kind];
  const a = MEDAL_ANIM[play];
  const glyph =
    "fill-none stroke-white stroke-[5.4] [stroke-dasharray:1] [stroke-dashoffset:1] [stroke-linecap:round] [stroke-linejoin:round]";
  const shock = (k) =>
    `<i class="size-full rounded-full border-2 border-[var(--mc)] opacity-0 ${a.shock[k]}"></i>`;
  return `<span class="relative grid size-[var(--ms,96px)] flex-none place-items-center *:[grid-area:1/1] ${cls}" style="--ms:${ms};--mc:${mc};--mg:${mg}" aria-hidden="true">
      <i class="size-[160%] rounded-full bg-[radial-gradient(closest-side,var(--mg),transparent_72%)] opacity-0 ${a.glow}"></i><i class="size-[134%] rounded-full bg-[conic-gradient(#8fe3ff,#b9a9ff,#ffc4e5,#fff1b0,#b3ffd8,#8fe3ff)] opacity-0 [mask:radial-gradient(closest-side,transparent_83%,#000_85%,#000_96%,transparent_98%)] ${a.halo}"></i>${shock(0)}${shock(1)}
      <span class="relative size-full">${Array.from({ length: 8 }, (_, k) => `<i class="absolute top-1/2 left-1/2 rounded-full opacity-0 [transform:rotate(var(--a))] ${k % 2 ? "-mt-[2.5%] -ml-[2.5%] size-[5%] bg-[#5fd0ff]" : "-mt-[4%] -ml-[4%] size-[8%] bg-[var(--mc)]"} ${a.spark}" style="--a:${k * 45 + 22}deg"></i>`).join("")}</span>
      <svg class="relative z-[2] size-full overflow-visible [filter:drop-shadow(0_calc(var(--ms,96px)*.07)_calc(var(--ms,96px)*.14)_var(--mg))] ${kind === "ok" || play === "loop" ? a.badge : a.shake}" viewBox="-2 -2 60 60"><path class="fill-[var(--mc)]" d="${SCALLOP}"/>${
        kind === "ok"
          ? `<path class="${glyph} ${a.glyph}" d="M18 28.5l7 7 13.5-14" pathLength="1"/>`
          : `<path class="${glyph} ${a.glyph}" d="M28 15.5v14.5" pathLength="1"/><circle class="fill-white opacity-0 ${a.dot}" cx="28" cy="38.8" r="2.9"/>`
      }</svg>
    </span>`;
};

export {
  $,
  $$,
  clamp,
  esc,
  BRL,
  money,
  norm,
  hhmm,
  pc,
  reduce,
  safe,
  setState,
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
  FIELD,
  LABEL,
  INPUT,
  OPTIONAL,
  PAY_OPT,
  PAY_RADIO,
  PAY_IC,
  PAY_EXTRA,
  REVIEW,
  REVIEW_H,
  ACTIONS,
  ACTION_MAIN,
  VR_IN,
  SCALLOP,
  MEDAL_TINT,
  MEDAL_TINT_DARK,
  MEDAL_ANIM,
  medal,
};
