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

const VERIFY_TONE = {
  ok: {
    tone: "20 166 74",
    light: "#45e083",
    dark: "#14a64a",
    title: "text-[#0f8a3c]",
    btn: "bg-navy",
  },
  bad: {
    tone: "217 48 37",
    light: "#ff7166",
    dark: "#d93025",
    title: "text-bad",
    btn: "bg-bad",
  },
};

const BADGE_ANIM = {
  on: {
    ring: "[.is-on_&]:animate-[badgeStroke_.7s_var(--ease-io)_.3s_both]",
    fill: "[.is-on_&]:animate-[badgeFill_.4s_cubic-bezier(.3,.7,.4,1)_.85s_both]",
    glow: "[.is-on_&]:animate-[badgeGlow_.4s_ease_.95s_both]",
    shadow: "[.is-on_&]:before:animate-[badgeGlow_.4s_ease_.95s_both]",
    mark: "[.is-on_&]:animate-[badgeStroke_.35s_var(--ease-io)_1.15s_both]",
    dot: "[.is-on_&]:animate-[badgeStroke_.1s_var(--ease-io)_1.45s_both]",
  },
  loop: {
    ring: "animate-[vcBadgeRing_7s_var(--ease-io)_infinite]",
    fill: "animate-[vcBadgeFill_7s_cubic-bezier(.3,.7,.4,1)_infinite]",
    glow: "animate-[vcBadgeGlow_7s_ease_infinite]",
    shadow: "before:animate-[vcBadgeGlow_7s_ease_infinite]",
    mark: "animate-[vcBadgeMark_7s_var(--ease-io)_infinite]",
    dot: "animate-[vcBadgeMark_7s_var(--ease-io)_infinite]",
  },
};
let badgeCount = 0;

const verifyBadge = (kind = "ok", play = "on", cls = "") => {
  const t = VERIFY_TONE[kind],
    a = BADGE_ANIM[play];
  const grad = `vb-grad-${++badgeCount}`;
  const stroke = (d, anim) =>
    `<path class="verify-stroke verify-mark ${anim}" d="${d}" transform="translate(22 22) scale(1.0769)" pathLength="1"/>`;
  const glyph =
    kind === "ok"
      ? stroke("M15 27.5l7.5 7.5L37.5 19.5", a.mark)
      : stroke("M26 14.5v15", a.mark) + stroke("M26 37v.5", a.dot);
  return `<span class="verify-badge ${a.shadow} ${cls}" style="--tone:${t.tone}" aria-hidden="true"><svg viewBox="0 0 100 100"><defs><radialGradient id="${grad}" gradientUnits="userSpaceOnUse" cx="50" cy="30" r="86"><stop offset="0" stop-color="${t.light}"/><stop offset=".72" stop-color="${t.dark}"/></radialGradient></defs><circle class="verify-glow ${a.glow}" cx="50" cy="50" r="52.94"/><circle class="verify-track" cx="50" cy="50" r="50"/><circle class="verify-fill ${a.fill}" cx="50" cy="50" r="50" fill="url(#${grad})"/><path class="verify-stroke verify-ring ${a.ring}" d="M50 1.2a48.8 48.8 0 1 1 0 97.6a48.8 48.8 0 1 1 0-97.6" pathLength="1"/>${glyph}</svg></span>`;
};

const verifyScreen = ({ kind, title, sub, product, rows, note, btn }) => {
  const t = VERIFY_TONE[kind];
  const prod = product
    ? `<div class="verify-card verify-prod"><span class="verify-thumb">${product.thumb}</span><div class="min-w-0"><b class="verify-name">${product.name}</b><span class="verify-detail">${product.detail}</span></div></div>`
    : "";
  const data = rows
    .map(
      ([k, v, cls = ""]) =>
        `<div><dt>${k}</dt><dd class="${cls}">${v}</dd></div>`,
    )
    .join("");
  const action = btn.attrs
    ? `<button class="verify-btn ${t.btn} transition-[filter] duration-200 hover:brightness-110" type="button" ${btn.attrs}>${btn.label}</button>`
    : `<span class="verify-btn ${t.btn}">${btn.label}</span>`;
  return `<div class="verify">${verifyBadge(kind)}<p class="verify-title ${t.title}">${title}</p><p class="verify-sub">${sub}</p>${prod}<dl class="verify-card verify-data ${product ? "" : "mt-[7cqi]"}">${data}</dl>${note ? `<p class="verify-note">${note}</p>` : ""}${action}</div>`;
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
  VERIFY_TONE,
  verifyBadge,
  verifyScreen,
};
