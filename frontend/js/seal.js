/* Lacre VeriSeal: o mesmo lacre do site da VeriSeal (repositório -VeriSeal).
   Uma tira só, que passa por cima da tampa: verso (880) + topo da tampa (612) + frente (880) = 2372 x 280.
   Cada ponta: a logo VeriSeal na lateral da tampa, a linha de ruptura na junção com o gargalo e, abaixo dela,
   o símbolo de aproximação; o verso é a frente girada 180°, para ficar de pé depois de dobrado.
   No meio, em cima da tampa, fica o holograma. Por dentro: a antena NFC corre a tira inteira, o chip fica embaixo
   do holograma e, ao lado dele, o circuito de ruptura (TagTamper). */
window.Seal = (() => {
  const PL = 880, // uma ponta: x = 0 na borda da tampa, ruptura em NX
    SH = 280,
    R = 24,
    NX = 420;
  const TOPW = 612, // o topo da tampa
    SW = 2 * PL + TOPW,
    MID = SW / 2;
  const FX = PL + TOPW, // onde começa a frente
    NB = PL - NX, // ruptura do verso
    NF = FX + NX; // ruptura da frente
  const FRONT = `translate(${FX} 0)`,
    BACK = `translate(${PL} ${SH}) rotate(180)`;
  const HX = 142, // holograma no desenho de origem, ampliado HK no topo
    HY = 140,
    HR = 94,
    HK = 1.12;
  const HOLO_AT = `translate(${MID} ${HY}) scale(${HK}) translate(${-HX} ${-HY})`;
  const WMX = -4, // logo VeriSeal: começa na curva da borda da tampa e termina antes de "ROMPE AO ABRIR"
    WMW = 380,
    WMH = (WMW * 100) / 833.41,
    WMY = SH / 2 - WMH / 2;
  const CTA_V = 598, // símbolo de aproximação: centro ao longo da ponta e altura
    NFC_H = 112;
  const UPRIGHT = `translate(0 ${SH}) rotate(-90)`; // de pé para quem olha a garrafa
  const notch = (x) => [
    `H${x - 11}L${x} 13L${x + 11} 0`,
    `H${x + 11}L${x} ${SH - 13}L${x - 11} ${SH}`,
  ];
  const OUTLINE = `M${R} 0${notch(NB)[0]}${notch(NF)[0]}H${SW - R}A${R} ${R} 0 0 1 ${SW} ${R}V${SH - R}A${R} ${R} 0 0 1 ${SW - R} ${SH}${notch(NF)[1]}${notch(NB)[1]}H${R}A${R} ${R} 0 0 1 0 ${SH - R}V${R}A${R} ${R} 0 0 1 ${R} 0Z`;
  const SANS = `Inter, -apple-system, 'Segoe UI', Roboto, sans-serif`;
  const MONO = `'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace`;
  const BRAND = "assets/brand/";
  // símbolo de aproximação (assets/brand/seal-nfc.svg, 403.8 x 217.1); as ondas saem do oval, em NFC_OVAL
  const NFC_AR = 403.8 / 217.1;
  const NFC_OVAL = [0.292, 0.476];
  const NFC_PING = [
    FX + CTA_V + (NFC_OVAL[1] - 0.5) * NFC_H,
    SH / 2 - (NFC_OVAL[0] - 0.5) * NFC_H * NFC_AR,
  ];
  const LABEL =
    "Lacre VeriSeal: uma faixa azul-marinho que passa por cima da tampa. No meio, o selo holográfico que fica no topo; dos dois lados, a logo VeriSeal, a linha de ruptura e o símbolo de aproximação com a frase “Aproxime o celular”. Por dentro, uma antena NFC de cobre em todo o comprimento, o chip NTAG 424 DNA no meio e, ao lado dele, um circuito que se rompe ao abrir a garrafa.";
  let uid = 0;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const damp = (cur, target, k, dt) =>
    cur + (target - cur) * (1 - Math.exp(-k * dt));

  // guilhoché: ondas sobrepostas, como na impressão de segurança de documentos
  function guilloche(n, amp, f1, f2, ph0) {
    let d = "";
    for (let i = 0; i < n; i++) {
      const ph = ph0 + i * 0.42;
      for (let x = -10, first = true; x <= SW + 10; x += 8, first = false) {
        const y =
          SH / 2 +
          amp *
            Math.sin(x * f1 + ph) *
            (0.62 + 0.38 * Math.sin(x * f2 - ph * 0.7));
        d += (first ? "M" : "L") + x + " " + y.toFixed(1);
      }
    }
    return d;
  }
  function rosette(cx, cy, r0, a, k, n) {
    let d = "";
    for (let i = 0; i < n; i++) {
      for (let j = 0; j <= 160; j++) {
        const t = (j / 160) * Math.PI * 2,
          r = r0 + a * Math.sin(k * t + i * 0.55);
        d +=
          (j ? "L" : "M") +
          (cx + r * Math.cos(t)).toFixed(1) +
          " " +
          (cy + r * Math.sin(t)).toFixed(1);
      }
      d += "Z";
    }
    return d;
  }

  /* o circuito, como no desenho técnico do lacre:
     - a antena NFC de cobre corre a tira inteira, em duas bobinas (uma de cada lado do chip): o celular lê em qualquer ponto;
     - o chip NTAG 424 DNA fica no meio da tira, embaixo do holograma (no topo da tampa);
     - ao lado dele, o circuito de ruptura (TagTamper), separado da antena: ele se rompe e a antena continua
       respondendo, para informar a adulteração */
  const CU = { line: "#e8894a", bright: "#ffb27a", glow: "#d9772f" };
  const RED = { line: "#ff5b4f", bright: "#ff8a80", glow: "#ff3b30" };
  const MOD = { l: MID - 96, r: MID + 96, t: 102, b: 178 };
  function antennaPath() {
    const n = 5,
      p = 13,
      x0 = 30,
      y0 = 30,
      y1 = 250;
    let d = "";
    // 1 = bobina do verso (à esquerda), -1 = a da frente, espelhada no meio
    for (const sd of [1, -1]) {
      const X = (x) => +(sd > 0 ? x : SW - x).toFixed(1);
      for (let k = 0; k < n; k++) {
        // cada volta sai de um contato do módulo, sobe em 45°, contorna a ponta da tira e volta ao módulo por baixo
        const top = y0 + k * p,
          bot = y1 - k * p,
          L = x0 + k * p,
          r = 16 - k * 2;
        const padT = 110 + k * 4.5,
          padB = 170 - k * 4.5,
          xj = MID - 104 - k * 22.5;
        d +=
          `M${X(MOD.l)} ${padT}H${X(xj)}L${X(xj - (padT - top))} ${top}H${X(L + r)}` +
          `Q${X(L)} ${top} ${X(L)} ${top + r}V${bot - r}Q${X(L)} ${bot} ${X(L + r)} ${bot}` +
          `H${X(xj - (bot - padB))}L${X(xj)} ${padB}H${X(MOD.l)}`;
      }
    }
    return d;
  }
  const ANTENNA = antennaPath();
  // TagTamper: um meandro no bloco à direita do chip, ligado ao chip por dois contatos próprios
  const TAMPER =
    `M${MID + 22} 126H${MID + 38}V160a5 5 0 0 0 10 0V120a5 5 0 0 1 10 0V160a5 5 0 0 0 10 0V120a5 5 0 0 1 10 0V160` +
    `V170H${MID + 30}V154H${MID + 22}`;
  const DIECUTS = (() => {
    let d = "";
    for (let y = 26, row = 0; y < SH - 10; y += 30, row++)
      for (let x = 24 + (row % 2) * 15; x < SW - 10; x += 30) {
        const flip = (x + y) % 60 < 30 ? 1 : -1;
        d += `M${x - 5} ${y}a5 5 0 0 ${flip > 0 ? 1 : 0} 10 0`;
      }
    return d;
  })();

  const antennaMarkup = () => `
    <path d="${ANTENNA}" fill="none" stroke="${CU.glow}" stroke-opacity=".3" stroke-width="6" stroke-linejoin="round"/>
    <path d="${ANTENNA}" fill="none" stroke="${CU.bright}" stroke-width="2.2" stroke-linejoin="round"/>`;
  const moduleMarkup = () => `
    <g>
      <rect x="${MOD.l}" y="${MOD.t}" width="48" height="76" rx="5" fill="#8f98a4" stroke="#c9d1db" stroke-width="1"/>
      <rect x="${MOD.l + 9}" y="${MOD.t + 13}" width="13" height="9" rx="1.5" fill="#5d6672"/><rect x="${MOD.l + 26}" y="${MOD.t + 40}" width="13" height="9" rx="1.5" fill="#5d6672"/>
      <circle cx="${MOD.l + 16}" cy="${MOD.t + 54}" r="4" fill="none" stroke="#5d6672" stroke-width="1.6"/>
      <rect x="${MID - 42}" y="108" width="64" height="64" rx="5" fill="#0b0d12" stroke="#2c3240" stroke-width="1.2"/>
      <rect x="${MID - 34}" y="116" width="48" height="48" rx="3" fill="none" stroke="#1f2531" stroke-width="1"/>
      <rect x="${MID + 28}" y="${MOD.t}" width="68" height="76" rx="5" fill="#8f98a4" stroke="#c9d1db" stroke-width="1"/>
      <path d="M${MID - 48} 126H${MID - 42}M${MID - 48} 154H${MID - 42}" stroke="${CU.bright}" stroke-width="2.4"/>
    </g>`;
  const tamperMarkup = () => `
    <path d="${TAMPER}" fill="none" stroke="${RED.glow}" stroke-opacity=".3" stroke-width="6" stroke-linejoin="round"/>
    <path d="${TAMPER}" fill="none" stroke="${RED.bright}" stroke-width="2.2" stroke-linejoin="round"/>
    <circle cx="${MID + 22}" cy="126" r="3" fill="${RED.bright}"/><circle cx="${MID + 22}" cy="154" r="3" fill="${RED.bright}"/>
    <rect x="${MID + 30}" y="108" width="62" height="70" rx="4" fill="none" stroke="${RED.line}" stroke-opacity=".7" stroke-width="1.4" stroke-dasharray="4 4"/>`;
  const tearMarkup = (op) =>
    `<path d="M${NB} 18V262M${NF} 18V262" stroke="#fff" stroke-opacity="${op}" stroke-width="1.6" stroke-dasharray="5 6"/>`;

  // uma ponta impressa (no desenho da frente; o verso é a mesma, girada): logo VeriSeal, aviso da ruptura e a ponta de baixo
  const endMarkup = () => `
    <image href="${BRAND}logo-dark-bg.svg" x="${WMX}" y="${WMY.toFixed(1)}" width="${WMW}" height="${WMH.toFixed(1)}"/>
    <text transform="translate(${NX - 14} 140) rotate(-90)" text-anchor="middle" font-family="${MONO}" font-size="9" letter-spacing="2" fill="#fff" fill-opacity=".55">ROMPE AO ABRIR</text>
    <g transform="${UPRIGHT}">
      <image href="${BRAND}seal-nfc.svg" x="${(SH / 2 - (NFC_H * NFC_AR) / 2).toFixed(1)}" y="${CTA_V - NFC_H / 2}" width="${(NFC_H * NFC_AR).toFixed(1)}" height="${NFC_H}"/>
      <g text-anchor="middle" font-family="${SANS}" font-size="34" font-weight="700" letter-spacing=".7" fill="#fff">
        <text x="${SH / 2}" y="${CTA_V + 115}">APROXIME</text><text x="${SH / 2}" y="${CTA_V + 156}">O CELULAR</text>
      </g>
    </g>`;

  // a face do lacre (película impressa)
  function printSVG() {
    const id = "vsl" + ++uid;
    return `<svg class="absolute inset-0 size-full overflow-visible" viewBox="0 0 ${SW} ${SH}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="${id}-clip"><path d="${OUTLINE}"/></clipPath>
        <linearGradient id="${id}-navy" gradientUnits="userSpaceOnUse" x1="${MID}" y1="0" x2="${SW}" y2="0" spreadMethod="reflect"><stop offset="0" stop-color="#0d3a80"/><stop offset=".45" stop-color="#062a63"/><stop offset="1" stop-color="#021a42"/></linearGradient>
        <linearGradient id="${id}-holo" class="holo-grad" gradientUnits="userSpaceOnUse" x1="${HX - HR}" y1="${HY - HR}" x2="${HX + HR}" y2="${HY + HR}">
          <stop offset="0" stop-color="#8fe3ff"/><stop offset=".18" stop-color="#b9a9ff"/><stop offset=".36" stop-color="#ffc4e5"/><stop offset=".52" stop-color="#fff1b0"/><stop offset=".7" stop-color="#b3ffd8"/><stop offset=".86" stop-color="#8fe3ff"/><stop offset="1" stop-color="#c8b8ff"/>
        </linearGradient>
        <radialGradient id="${id}-shine" cx=".35" cy=".3" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset=".35" stop-color="#fff" stop-opacity=".1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
        <path id="${id}-ring" d="M${HX} ${HY}m-80 0a80 80 0 1 1 160 0a80 80 0 1 1-160 0"/>
      </defs>
      <g clip-path="url(#${id}-clip)">
        <rect width="${SW}" height="${SH}" fill="url(#${id}-navy)"/>
        <path d="${guilloche(14, 108, 0.0115, 0.0042, 0)}" fill="none" stroke="#5fd0ff" stroke-opacity=".1" stroke-width="1"/>
        <path d="${guilloche(10, 70, 0.019, 0.006, 1.3)}" fill="none" stroke="#9fb5ff" stroke-opacity=".08" stroke-width="1"/>
      </g>
      <path d="${OUTLINE}" fill="none" stroke="#fff" stroke-opacity=".16" stroke-width="2"/>
      <rect x="12" y="12" width="${SW - 24}" height="${SH - 24}" rx="15" fill="none" stroke="#03adf9" stroke-opacity=".38" stroke-width="1.2"/>
      <g transform="${HOLO_AT}">
        <circle cx="${HX}" cy="${HY}" r="${HR}" fill="url(#${id}-holo)"/>
        <path d="${rosette(HX, HY, 50, 20, 7, 8)}" fill="none" stroke="#fff" stroke-opacity=".38" stroke-width=".8"/>
        <circle class="holo-shine" cx="${HX}" cy="${HY}" r="${HR}" fill="url(#${id}-shine)" opacity=".5"/>
        <circle cx="${HX}" cy="${HY}" r="${HR}" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.5"/>
        <text font-family="${MONO}" font-size="10.5" font-weight="600" letter-spacing="2.1" fill="#062a63" fill-opacity=".72"><textPath href="#${id}-ring">VERISEAL • PRODUTO ORIGINAL • VERISEAL • PRODUTO ORIGINAL •</textPath></text>
        <image href="${BRAND}logo-short-holo.svg" x="${HX - 46}" y="${HY - 24.7}" width="92" height="49.4"/>
      </g>
      ${tearMarkup(0.55)}
      <g transform="${BACK}">${endMarkup()}</g>
      <g transform="${FRONT}">${endMarkup()}</g>
    </svg>`;
  }

  // o que a lupa de raio-x mostra: o interior do lacre, com anotações
  function xraySVG() {
    const id = "vsx" + ++uid;
    let grid = "";
    for (let x = 20; x < SW; x += 20) grid += `M${x} 0V${SH}`;
    for (let y = 20; y < SH; y += 20) grid += `M0 ${y}H${SW}`;
    const label = (x, y, t, rot, anchor = "start", fill = "#9fe6ff") =>
      `<text ${rot ? `transform="translate(${x} ${y}) rotate(-90)" text-anchor="middle"` : `x="${x}" y="${y}" text-anchor="${anchor}"`} font-family="${MONO}" font-size="11" font-weight="600" letter-spacing="1.6" fill="${fill}">${t}</text>`;
    const ghost = `<image href="${BRAND}logo-xray.svg" x="${WMX}" y="${WMY.toFixed(1)}" width="${WMW}" height="${WMH.toFixed(1)}"/>`;
    return `<svg class="absolute top-0 left-0 origin-top-left overflow-visible will-change-transform" viewBox="0 0 ${SW} ${SH}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <defs><clipPath id="${id}-clip"><path d="${OUTLINE}"/></clipPath></defs>
      <path d="${OUTLINE}" fill="#020c1d"/>
      <g clip-path="url(#${id}-clip)"><path d="${grid}" stroke="#03adf9" stroke-opacity=".08" stroke-width="1"/></g>
      <path d="${OUTLINE}" fill="none" stroke="#03adf9" stroke-opacity=".45" stroke-width="1.5"/>
      <circle cx="${MID}" cy="${HY}" r="${HR * HK}" fill="none" stroke="#5fd0ff" stroke-opacity=".45" stroke-dasharray="3 5"/>
      <g transform="${BACK}">${ghost}</g><g transform="${FRONT}">${ghost}</g>
      <path d="${DIECUTS}" fill="none" stroke="#9fe6ff" stroke-opacity=".12" stroke-width="1.1"/>
      ${tearMarkup(0.5)}${antennaMarkup()}${moduleMarkup()}${tamperMarkup()}
      <path d="M${PL} 14V266M${FX} 14V266" stroke="#5fd0ff" stroke-opacity=".35" stroke-width="1.2" stroke-dasharray="2 6"/>
      ${label(110, 145, "ANTENA NFC · LEITURA EM QUALQUER PONTO")}${label(NF + 40, 145, "ANTENA NFC · LEITURA EM QUALQUER PONTO")}
      ${label(MID, 94, "CHIP NTAG 424 DNA", false, "middle")}${label(MID + 61, 198, "TAGTAMPER", false, "middle", "#ff8a80")}
      ${label(NF - 23, 140, "LINHA DE RUPTURA", true)}${label(NB + 34, 140, "LINHA DE RUPTURA", true)}
      ${label(PL - 14, 140, "BORDA DA TAMPA", true)}${label(FX + 26, 140, "BORDA DA TAMPA", true)}
    </svg>`;
  }

  // ondas de aproximação saindo do símbolo do celular
  function ping(face) {
    const p = document.createElement("i");
    p.className =
      "pointer-events-none absolute aspect-square w-[5%] rounded-full border-2 border-[rgba(95,208,255,.7)] opacity-0 [transform:translate(-50%,-50%)_scale(.2)]";
    p.style.left = (NFC_PING[0] / SW) * 100 + "%";
    p.style.top = (NFC_PING[1] / SH) * 100 + "%";
    face.appendChild(p);
    const a = p.animate(
      [
        { transform: "translate(-50%,-50%) scale(.2)", opacity: 0.9 },
        { transform: "translate(-50%,-50%) scale(2.6)", opacity: 0 },
      ],
      { duration: 1700, easing: "cubic-bezier(.22,.61,.36,1)" },
    );
    a.onfinish = () => p.remove();
  }

  // o lacre deitado, com inclinação 3D, holograma que muda com o ângulo e lupa de raio-x
  function mount(host, opts = {}) {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const narrowMQ = matchMedia("(max-width: 719px)");
    const pointerHost = opts.pointerHost || host;
    host.classList.add("perspective-[2000px]");
    if (!reduce) host.classList.add("is-pre");
    host.innerHTML = `
      <div class="absolute inset-0 will-change-transform [transform-style:preserve-3d]" role="img" aria-label="${LABEL}" data-tilt>
        <div class="absolute inset-0 drop-shadow-[0_18px_24px_rgba(0,0,0,.55)]" data-face>
          <div class="absolute inset-0 [.is-pre_&]:[clip-path:inset(0_100%_0_0)] [.is-intro_&]:animate-[drawIn_1.15s_var(--ease-io)_.2s_both]">${printSVG()}</div>
          <div class="pointer-events-none absolute inset-0 rounded-[1.01%/8.57%] bg-[radial-gradient(circle_at_var(--gx,30%)_var(--gy,10%),rgba(255,255,255,.2),rgba(255,255,255,0)_38%)] mix-blend-screen [.is-pre_&]:opacity-0 [.is-intro_&]:animate-[fade_.6s_ease_1.15s_both]" data-glare></div>
          <i class="pointer-events-none absolute -top-[8%] -bottom-[8%] left-0 w-0.5 bg-[linear-gradient(transparent,#bdf0ff_20%,#fff_50%,#bdf0ff_80%,transparent)] opacity-0 shadow-[0_0_18px_4px_rgba(3,173,249,.75),0_0_60px_14px_rgba(3,173,249,.35)] [.is-intro_&]:animate-[scanX_1.15s_var(--ease-io)_.2s_both]"></i>
        </div>
      </div>
      <div class="pointer-events-none absolute top-0 left-0 z-[5] size-[var(--ld,160px)] rounded-full will-change-transform [transform:translate3d(var(--lx,0),var(--ly,0),0)_translate(-50%,-50%)] [.is-pre_&]:opacity-0 [.is-intro_&]:animate-[loupeIn_.8s_var(--ease-spring)_1.25s_both]" data-loupe><div class="absolute inset-0 overflow-hidden rounded-full bg-[rgba(2,8,20,.78)] shadow-[inset_0_0_0_2px_rgba(255,255,255,.85),inset_0_0_26px_rgba(3,173,249,.45),0_0_0_6px_rgba(255,255,255,.06),0_18px_50px_rgba(0,0,0,.55),0_0_40px_rgba(3,173,249,.35)] after:pointer-events-none after:absolute after:inset-0 after:rounded-full after:bg-[radial-gradient(circle_at_32%_26%,rgba(255,255,255,.22),transparent_34%),repeating-linear-gradient(0deg,rgba(95,208,255,.05)_0_1px,transparent_1px_3px)]" data-view>${xraySVG()}</div><span class="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-cyan px-2.5 py-1 font-mono text-[11px] leading-none font-semibold tracking-[.14em] whitespace-nowrap text-[#021638] uppercase">Raio-X</span></div>`;
    const tiltEl = host.querySelector("[data-tilt]"),
      face = host.querySelector("[data-face]"),
      glare = host.querySelector("[data-glare]"),
      loupe = host.querySelector("[data-loupe]"),
      xsvg = host.querySelector("[data-view] svg"),
      holoGrad = host.querySelector(".holo-grad"),
      holoShine = host.querySelector(".holo-shine");

    const LU0 = (MID + 30) / SW, // parada, a lupa fica sobre o chip e o circuito de ruptura
      LV0 = 0.5;
    let sw = 1,
      sh = 1,
      ld = 160,
      zoom = 2,
      minX = 0,
      maxX = 1;
    let tiltX = 0,
      tiltY = 0,
      pX = 0,
      pY = 0,
      hover = false,
      dragging = false,
      lastInput = -1e9;
    let lu = LU0,
      lv = LV0,
      tu = LU0,
      tv = LV0;
    let started = false,
      pings = 0,
      nextPing = 1.6,
      inView = false,
      raf = 0,
      last = 0,
      t = 0;

    function layout() {
      sw = host.offsetWidth || 1;
      sh = host.offsetHeight || 1;
      // a tira é fina: a lente passa um pouco das bordas dela, e o aumento faz a altura inteira caber nela
      ld = narrowMQ.matches
        ? clamp(sh * 2.9, 104, 136)
        : clamp(sh * 1.55, 150, 230);
      zoom = ld / (0.95 * sh);
      // a lente não sai do cartão
      const hr = pointerHost.getBoundingClientRect(),
        sr = host.getBoundingClientRect();
      minX = hr.left - sr.left + ld / 2 + 6;
      maxX = Math.max(minX, hr.right - sr.left - ld / 2 - 6);
      loupe.style.setProperty("--ld", ld + "px");
      xsvg.setAttribute("width", sw * zoom);
      xsvg.setAttribute("height", sh * zoom);
    }

    const sealUV = (e) => {
      const r = host.getBoundingClientRect();
      return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height];
    };
    const aim = (u, v) => {
      tu = clamp(u, 0.02, 0.98);
      tv = clamp(v, 0.04, 0.96);
      lastInput = performance.now();
    };
    // mouse: inclinação no cartão inteiro, lupa sobre o lacre. Toque: arrastar a lente
    pointerHost.addEventListener(
      "pointermove",
      (e) => {
        if (e.pointerType !== "mouse" && !dragging) return;
        const hr = pointerHost.getBoundingClientRect();
        pX = clamp(((e.clientX - hr.left) / hr.width) * 2 - 1, -1, 1);
        pY = clamp(((e.clientY - hr.top) / hr.height) * 2 - 1, -1, 1);
        const [u, v] = sealUV(e);
        hover = u > -0.03 && u < 1.03 && v > -0.2 && v < 1.2;
        if (hover || dragging) aim(u, v);
      },
      { passive: true },
    );
    pointerHost.addEventListener("pointerleave", () => {
      hover = false;
      pX = pY = 0;
    });
    host.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse") return;
      dragging = true;
      aim(...sealUV(e));
    });
    addEventListener("pointerup", () => (dragging = false));
    addEventListener("pointercancel", () => (dragging = false));
    host.style.touchAction = "pan-y";

    function frame(now) {
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      t += dt;

      // inclinação: segue o ponteiro; parado, flutua devagar
      const idle = reduce ? 0 : 1;
      const targX = (fine ? -pY * 7 : 0) + idle * Math.sin(t * 0.5) * 2.2;
      const targY = (fine ? pX * 11 : 0) + idle * Math.sin(t * 0.37 + 1) * 3.5;
      tiltX = damp(tiltX, reduce ? 0 : targX, 5, dt);
      tiltY = damp(tiltY, reduce ? 0 : targY, 5, dt);
      tiltEl.style.transform = `rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`;

      // reflexo e holograma respondem à inclinação
      glare.style.setProperty("--gx", (50 + tiltY * 4).toFixed(1) + "%");
      glare.style.setProperty("--gy", (30 - tiltX * 5).toFixed(1) + "%");
      holoGrad.setAttribute(
        "gradientTransform",
        `rotate(${(tiltY * 9 - tiltX * 6 + t * 6).toFixed(1)} ${HX} ${HY})`,
      );
      holoShine.setAttribute(
        "opacity",
        (0.35 + 0.3 * Math.abs(Math.sin(tiltY * 0.25 + t * 0.3))).toFixed(3),
      );

      // lupa de raio-x: segue o ponteiro; parada, passeia pelo lacre
      const active = hover || dragging || now - lastInput < 2500;
      if (!active) {
        if (reduce) {
          tu = LU0;
          tv = LV0;
        } else {
          tu = 0.5 + 0.42 * Math.sin(t * 0.33);
          tv = 0.5 + 0.2 * Math.sin(t * 0.71);
        }
      }
      lu = damp(lu, tu, active ? 10 : 2.4, dt);
      lv = damp(lv, tv, active ? 10 : 2.4, dt);
      const x = clamp(lu * sw, minX, maxX),
        y = lv * sh;
      loupe.style.setProperty("--lx", x.toFixed(1) + "px");
      loupe.style.setProperty("--ly", y.toFixed(1) + "px");
      xsvg.style.transform = `translate(${(ld / 2 - x * zoom).toFixed(1)}px,${(ld / 2 - y * zoom).toFixed(1)}px)`;

      // ondas de aproximação: algumas vezes depois da entrada, e quando a lupa passa pelo símbolo
      if (started) {
        nextPing -= dt;
        const nearNfc =
          Math.abs(lu - NFC_PING[0] / SW) < 0.05 &&
          Math.abs(lv - NFC_PING[1] / SH) < 0.3;
        if (nextPing <= 0 && (pings < 3 || nearNfc)) {
          ping(face);
          pings++;
          nextPing = nearNfc ? 1.2 : 2.6;
        }
      }
      raf = inView ? requestAnimationFrame(frame) : 0;
    }

    layout();
    addEventListener("resize", layout);
    if ("ResizeObserver" in window) new ResizeObserver(layout).observe(host);
    new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          inView = e.isIntersecting;
          if (inView && !raf) {
            last = 0;
            layout();
            raf = requestAnimationFrame(frame);
          }
        }),
      { rootMargin: "80px" },
    ).observe(host);
    // entrada: a película se imprime da esquerda para a direita, o reflexo acende e a lupa aparece
    if (!reduce) {
      new IntersectionObserver(
        (es, o) =>
          es.forEach((e) => {
            if (!e.isIntersecting) return;
            o.disconnect();
            host.classList.replace("is-pre", "is-intro");
            started = true;
            setTimeout(() => host.classList.remove("is-intro"), 4200);
          }),
        { threshold: 0.5 },
      ).observe(host);
    }
    return { layout };
  }

  /* A tira nas fotos das garrafas: só a ponta da frente, de pé. No topo, o holograma (o topo da tampa visto de
     frente); na lateral da tampa, a logo VeriSeal; em NJ, a linha de ruptura, que coincide com a borda de baixo da
     tampa (seal.y em js/products.js); abaixo dela, no gargalo, o símbolo de aproximação. */
  const NJ = 58,
    NN = 1.9; // fundo dos entalhes da ruptura, nas bordas da tira
  function neckDefs() {
    return `
      <linearGradient id="vsnk-navy" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d3a80"/><stop offset=".5" stop-color="#062a63"/><stop offset="1" stop-color="#03204f"/></linearGradient>
      <linearGradient id="vsnk-holo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8fe3ff"/><stop offset=".22" stop-color="#b9a9ff"/><stop offset=".42" stop-color="#ffc4e5"/><stop offset=".6" stop-color="#fff1b0"/><stop offset=".8" stop-color="#b3ffd8"/><stop offset="1" stop-color="#8fe3ff"/></linearGradient>
      <linearGradient id="vsnk-cyl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".5"/><stop offset=".16" stop-color="#000" stop-opacity=".08"/><stop offset=".38" stop-color="#fff" stop-opacity=".24"/><stop offset=".52" stop-color="#fff" stop-opacity=".04"/><stop offset=".84" stop-color="#000" stop-opacity=".14"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient>`;
  }
  // guilhoché da tira de pé (as ondas correm ao longo dela)
  function neckGuilloche(y0, y1) {
    let d = "";
    for (let k = 0; k < 3; k++)
      for (let y = y0, first = true; y <= y1; y += 1.5, first = false)
        d +=
          (first ? "M" : "L") +
          (
            20 +
            13 *
              Math.sin(y * 0.23 + k * 2.1) *
              (0.55 + 0.45 * Math.sin(y * 0.05 + k))
          ).toFixed(2) +
          " " +
          y.toFixed(1);
    return d;
  }
  function neckSymbol(id, torn) {
    const zig = [];
    for (let i = 0; i <= 8; i++)
      zig.push([
        NN + (i * (40 - 2 * NN)) / 8,
        NJ + (torn ? (i % 2 ? 1.8 : -0.6) : 0),
      ]);
    const zr = zig.map(([x, y]) => `L${x.toFixed(2)} ${y.toFixed(1)}`).join("");
    const up = `M${40 - NN} ${NJ}L40 ${NJ - 1.5}V6Q40 0 34 0H6Q0 0 0 6V${NJ - 1.5}L${NN} ${NJ}${zr}Z`;
    const low = `M${NN} ${NJ}${zr}L40 ${NJ + 1.5}V106Q40 110 36 110H4Q0 110 0 106V${NJ + 1.5}Z`;
    const hologram = `
      <ellipse cx="20" cy="5" rx="17" ry="5.4" fill="url(#vsnk-holo)"/>
      <ellipse cx="20" cy="5" rx="17" ry="5.4" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width=".7"/>
      <path d="${rosette(20, 5, 3.2, 1, 7, 3)}" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width=".25"/>
      <image href="${BRAND}logo-short-holo.svg" x="16" y="2.85" width="8" height="4.3"/>`;
    // a logo corre ao longo da lateral da tampa, de cima para baixo, como no lacre impresso
    const upper = `
      <path d="${up}" fill="url(#vsnk-navy)"/>
      <path d="${neckGuilloche(11, NJ - 2)}" fill="none" stroke="#5fd0ff" stroke-opacity=".16" stroke-width=".4"/>
      <image href="${BRAND}logo-dark-bg.svg" x="0" y="0" width="43" height="5.16" transform="translate(22.58 11.5) rotate(90)"/>
      ${hologram}
      <path d="${up}" fill="url(#vsnk-cyl)"/>
      <path d="${up}" fill="none" stroke="#03adf9" stroke-opacity=".7" stroke-width=".7"/>`;
    const lower = `
      <path d="${low}" fill="url(#vsnk-navy)"/>
      <path d="${neckGuilloche(NJ + 3, 107)}" fill="none" stroke="#5fd0ff" stroke-opacity=".16" stroke-width=".4"/>
      <image href="${BRAND}seal-nfc.svg" x="7" y="70" width="26" height="${(26 / NFC_AR).toFixed(2)}"/>
      <g text-anchor="middle" font-family="${SANS}" font-size="4.4" font-weight="700" letter-spacing=".15" fill="#fff">
        <text x="20" y="93">APROXIME</text><text x="20" y="98.6">O CELULAR</text>
      </g>
      <path d="${low}" fill="url(#vsnk-cyl)"/>
      <path d="${low}" fill="none" stroke="#03adf9" stroke-opacity=".7" stroke-width=".7"/>`;
    if (!torn) {
      return `<symbol id="${id}" viewBox="0 0 40 110" overflow="visible">${lower}${upper}
        <path d="M${NN + 0.6} ${NJ}H${40 - NN - 0.6}" stroke="#fff" stroke-opacity=".75" stroke-width=".7" stroke-dasharray="1.6 1.3"/></symbol>`;
    }
    return `<symbol id="${id}" viewBox="0 0 40 110" overflow="visible">${lower}
      <path d="M${NN} ${NJ}${zr}" fill="none" stroke="#ff5b4f" stroke-width=".9"/>
      <circle cx="11" cy="${NJ + 2.2}" r="1.7" fill="#ff5b4f"/><circle cx="29" cy="${NJ + 2.2}" r="1.7" fill="#ff5b4f"/>
      <g transform="translate(4 -10) rotate(-13 40 ${NJ})">${upper}</g></symbol>`;
  }

  (function defineNeck() {
    if (document.getElementById("vs-neck")) return;
    document.body.insertAdjacentHTML(
      "beforeend",
      `<svg style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true" focusable="false"><defs>${neckDefs()}</defs>${neckSymbol("vs-neck", false)}${neckSymbol("vs-neck-torn", true)}</svg>`,
    );
  })();

  const NECK = { W: 40, H: 110, J: NJ, NFC: 63 };

  return { printSVG, xraySVG, mount, NECK };
})();
