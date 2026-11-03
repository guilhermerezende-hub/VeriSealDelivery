/* =========================================================
   VeriSeal Delivery — o lacre inteligente em SVG
   Mesma arte da landing da VeriSeal: faixa azul-marinho com
   guilhoché, holograma com o monograma, linha de ruptura,
   símbolo de aproximação e número de série. Por dentro (raio-X),
   o chip NFC, a antena e o circuito que se rompe ao abrir.
   Seal.mount() monta o lacre com lupa de raio-X que segue o
   ponteiro e "pings" de aproximação saindo do símbolo NFC.
   A tira que vai no gargalo de cada foto de garrafa fica no
   sprite como #vs-neck (íntegra) e #vs-neck-torn (rompida).
   Os logos vêm do sprite (#vs-wordmark, #vs-mark) do index.html.
   ========================================================= */

window.seal = (() => {
  const sealw = 1000, sealh = 280, radius = 24, nx = 655;
  const outline = `M${radius} 0H${nx - 11}L${nx} 13L${nx + 11} 0H${sealw - radius}A${radius} ${radius} 0 0 1 ${sealw} ${radius}V${sealh - radius}A${radius} ${radius} 0 0 1 ${sealw - radius} ${sealh}H${nx + 11}L${nx} ${sealh - 13}L${nx - 11} ${sealh}H${radius}A${radius} ${radius} 0 0 1 0 ${sealh - radius}V${radius}A${radius} ${radius} 0 0 1 ${radius} 0Z`;
  const sans = `Inter, -apple-system, 'Segoe UI', Roboto, sans-serif`;
  const mono = `'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace`;
  const nfcu = 0.706, nfcv = 0.336;   // posição do símbolo de aproximação na faixa (frações)
  let uid = 0;

  // guilhoché: ondas sobrepostas, como na impressão de segurança de documentos
  function guilloche(n, amp, f1, f2, ph0) {
    let d = '';
    for (let i = 0; i < n; i++) {
      const ph = ph0 + i * 0.42;
      for (let x = -10, first = true; x <= sealw + 10; x += 8, first = false) {
        const y = sealh / 2 + amp * Math.sin(x * f1 + ph) * (0.62 + 0.38 * Math.sin(x * f2 - ph * 0.7));
        d += (first ? 'M' : 'L') + x + ' ' + y.toFixed(1);
      }
    }
    return d;
  }
  function rosette(cx, cy, r0, a, k, n) {
    let d = '';
    for (let i = 0; i < n; i++) {
      for (let j = 0; j <= 160; j++) {
        const t = j / 160 * Math.PI * 2, r = r0 + a * Math.sin(k * t + i * 0.55);
        d += (j ? 'L' : 'M') + (cx + r * Math.cos(t)).toFixed(1) + ' ' + (cy + r * Math.sin(t)).toFixed(1);
      }
      d += 'Z';
    }
    return d;
  }
  // símbolo de aproximação (quatro arcos)
  function contactless(x, y, s, stroke, w) {
    let d = '';
    [0.22, 0.47, 0.72, 0.97].forEach((f) => {
      const r = s * f * 0.62, a = 52 * Math.PI / 180;
      d += `M${(x + r * Math.cos(-a)).toFixed(1)} ${(y + r * Math.sin(-a)).toFixed(1)}A${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${(x + r * Math.cos(a)).toFixed(1)} ${(y + r * Math.sin(a)).toFixed(1)}`;
    });
    return `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round"/>`;
  }
  /* ---------- tira do lacre no gargalo (desenhada por cima das fotos) ----------
     viewBox 0 0 40 110. A junção tampa/gargalo — a linha de ruptura — fica em
     y = 44: em cima, holograma com o monograma (na tampa); embaixo, guilhoché,
     símbolo de aproximação e "VERISEAL" (no vidro). Na versão rompida a metade
     de cima sai com a tampa e os contatos do circuito ficam expostos. */
  const nj = 44;
  function neckdefs() {
    return `
      <linearGradient id="vsnk-navy" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d3a80"/><stop offset=".5" stop-color="#062a63"/><stop offset="1" stop-color="#03204f"/></linearGradient>
      <linearGradient id="vsnk-holo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8fe3ff"/><stop offset=".22" stop-color="#b9a9ff"/><stop offset=".42" stop-color="#ffc4e5"/><stop offset=".6" stop-color="#fff1b0"/><stop offset=".8" stop-color="#b3ffd8"/><stop offset="1" stop-color="#8fe3ff"/></linearGradient>
      <linearGradient id="vsnk-cyl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".5"/><stop offset=".16" stop-color="#000" stop-opacity=".08"/><stop offset=".38" stop-color="#fff" stop-opacity=".24"/><stop offset=".52" stop-color="#fff" stop-opacity=".04"/><stop offset=".84" stop-color="#000" stop-opacity=".14"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient>`;
  }
  function necksymbol(id, torn) {
    const zig = [];
    for (let i = 0; i <= 8; i++) zig.push([i * 5, nj + (torn ? (i % 2 ? 1.8 : -0.6) : 0)]);
    const zr = zig.map(([x, y]) => `L${x} ${y.toFixed(1)}`).join('');
    const zl = zig.slice().reverse().map(([x, y]) => `L${x} ${y.toFixed(1)}`).join('');
    const up = `M40 ${nj}V6Q40 0 34 0H6Q0 0 0 6V${nj}${zr}Z`;
    const low = `M0 ${nj}${zr}V106Q40 110 36 110H4Q0 110 0 106Z`;
    let gl = '';
    for (let k = 0; k < 3; k++) for (let y = nj + 3, first = true; y <= 107; y += 1.5, first = false) {
      gl += (first ? 'M' : 'L') + (20 + 13 * Math.sin(y * 0.23 + k * 2.1) * (0.55 + 0.45 * Math.sin(y * 0.05 + k))).toFixed(2) + ' ' + y.toFixed(1);
    }
    const upper = `
      <path d="${up}" fill="url(#vsnk-navy)"/>
      <circle cx="20" cy="21" r="12.5" fill="url(#vsnk-holo)"/>
      <path d="${rosette(20, 21, 7.6, 2.4, 7, 4)}" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width=".35"/>
      <use href="#vs-mark" x="12.5" y="17" width="15" height="8.06" style="--lg-ink:#062a63;--lg-accent:#0a76c4"/>
      <circle cx="20" cy="21" r="12.5" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width=".6"/>
      <path d="${up}" fill="url(#vsnk-cyl)"/>
      <path d="${up}" fill="none" stroke="#03adf9" stroke-opacity=".75" stroke-width=".7"/>`;
    const lower = `
      <path d="${low}" fill="url(#vsnk-navy)"/>
      <path d="${gl}" fill="none" stroke="#5fd0ff" stroke-opacity=".22" stroke-width=".4"/>
      ${contactless(12.5, 63, 18, '#fff', 1.15)}
      <text transform="translate(31.6 105) rotate(-90)" font-family="${mono}" font-size="5.4" font-weight="600" letter-spacing="1.1" fill="#fff" fill-opacity=".86">VERISEAL</text>
      <rect x="6" y="82" width="15" height="1" rx=".5" fill="#fff" opacity=".35"/><rect x="6" y="86" width="11" height="1" rx=".5" fill="#fff" opacity=".25"/><rect x="6" y="90" width="13" height="1" rx=".5" fill="#fff" opacity=".25"/>
      <path d="${low}" fill="url(#vsnk-cyl)"/>
      <path d="${low}" fill="none" stroke="#03adf9" stroke-opacity=".75" stroke-width=".7"/>`;
    if (!torn) {
      return `<symbol id="${id}" viewBox="0 0 40 110" overflow="visible">${lower}${upper}
        <path d="M1.2 ${nj}H38.8" stroke="#fff" stroke-opacity=".75" stroke-width=".7" stroke-dasharray="1.6 1.3"/></symbol>`;
    }
    return `<symbol id="${id}" viewBox="0 0 40 110" overflow="visible">${lower}
      <path d="M0 ${nj}${zr}" fill="none" stroke="#ff5b4f" stroke-width=".9"/>
      <circle cx="11" cy="${nj + 2.2}" r="1.7" fill="#ff5b4f"/><circle cx="29" cy="${nj + 2.2}" r="1.7" fill="#ff5b4f"/>
      <g transform="translate(4 -10) rotate(-13 40 ${nj})">${upper}</g></symbol>`;
  }

  // antena: espiral retangular em volta da zona do celular
  function spiral(x0, y0, x1, y1, n, p) {
    const mid = (y0 + y1) / 2;
    let d = `M${x0} ${mid}`;
    for (let t = 0; t < n; t++) { const o = t * p; d += `V${y0 + o}H${x1 - o}V${y1 - o}H${x0 + o + p}V${mid}`; }
    return d;
  }
  const coil = spiral(718, 34, 968, 246, 6, 10);
  const loop = 'M684 128H600C584 128 576 120 576 104V64C576 50 568 42 554 42H66C52 42 44 50 44 64V216C44 230 52 238 66 238H554C568 238 576 230 576 216V176C576 160 584 152 600 152H684';
  const diecuts = (() => {
    let d = '';
    for (let y = 26, row = 0; y < sealh - 10; y += 30, row++) for (let x = 24 + (row % 2) * 15; x < sealw - 10; x += 30) {
      const flip = (x + y) % 60 < 30 ? 1 : -1;
      d += `M${x - 5} ${y}a5 5 0 0 ${flip > 0 ? 1 : 0} 10 0`;
    }
    return d;
  })();

  const coilmarkup = () => `
    <path d="${coil}M702 140H718" fill="none" stroke="#03adf9" stroke-opacity=".28" stroke-width="8" stroke-linejoin="round"/>
    <path d="${coil}" fill="none" stroke="#9fe6ff" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M702 140H718M778 140V156H700" fill="none" stroke="#9fe6ff" stroke-width="2.4" stroke-linejoin="round"/>
    <rect x="712" y="150" width="72" height="11" rx="3" fill="#06142c" stroke="#03adf9" stroke-opacity=".6"/>`;
  const chipmarkup = () => `
    <g>
      <rect x="664" y="122" width="38" height="38" rx="5" fill="#081a36" stroke="#9fe6ff" stroke-width="1.6"/>
      <rect x="672" y="130" width="22" height="22" rx="2" fill="#03adf9" fill-opacity=".25" stroke="#03adf9" stroke-opacity=".8"/>
      <path d="M668 122v-5M676 122v-5M684 122v-5M692 122v-5M698 122v-5M668 160v5M676 160v5M684 160v5M692 160v5M698 160v5" stroke="#9fe6ff" stroke-width="1.4"/>
    </g>`;
  const loopmarkup = () => `
    <path d="${loop}" fill="none" stroke="#03adf9" stroke-opacity=".3" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="${loop}" fill="none" stroke="#9fe6ff" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="684" cy="128" r="4" fill="#9fe6ff"/><circle cx="684" cy="152" r="4" fill="#9fe6ff"/>
    <g fill="none" stroke="#ff7a70" stroke-width="2"><circle cx="${nx}" cy="128" r="8"/><circle cx="${nx}" cy="152" r="8"/></g>`;
  const tearmarkup = (op) => `<path d="M${nx} 18V262" stroke="#fff" stroke-opacity="${op}" stroke-width="1.6" stroke-dasharray="5 6"/>`;

  // a face do lacre
  function printsvg(serial = 'A7F3K9B21') {
    const id = 'sl' + (++uid);
    return `<svg class="absolute inset-0 size-full overflow-visible" viewBox="0 0 ${sealw} ${sealh}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="${id}-clip"><path d="${outline}"/></clipPath>
        <linearGradient id="${id}-navy" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d3a80"/><stop offset=".45" stop-color="#062a63"/><stop offset="1" stop-color="#021a42"/></linearGradient>
        <linearGradient id="${id}-holo" class="holo-grad" gradientUnits="userSpaceOnUse" x1="56" y1="46" x2="244" y2="234">
          <stop offset="0" stop-color="#8fe3ff"/><stop offset=".18" stop-color="#b9a9ff"/><stop offset=".36" stop-color="#ffc4e5"/><stop offset=".52" stop-color="#fff1b0"/><stop offset=".7" stop-color="#b3ffd8"/><stop offset=".86" stop-color="#8fe3ff"/><stop offset="1" stop-color="#c8b8ff"/>
        </linearGradient>
        <radialGradient id="${id}-shine" cx=".35" cy=".3" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset=".35" stop-color="#fff" stop-opacity=".1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
        <path id="${id}-ring" d="M150 140m-80 0a80 80 0 1 1 160 0a80 80 0 1 1-160 0"/>
      </defs>
      <g clip-path="url(#${id}-clip)">
        <rect width="${sealw}" height="${sealh}" fill="url(#${id}-navy)"/>
        <path d="${guilloche(14, 108, .0115, .0042, 0)}" fill="none" stroke="#5fd0ff" stroke-opacity=".1" stroke-width="1"/>
        <path d="${guilloche(10, 70, .019, .006, 1.3)}" fill="none" stroke="#9fb5ff" stroke-opacity=".08" stroke-width="1"/>
        <text x="30" y="266" font-family="${mono}" font-size="7" letter-spacing="1.2" fill="#fff" fill-opacity=".28">${'VERISEAL · ORIGINAL · '.repeat(12)}</text>
      </g>
      <path d="${outline}" fill="none" stroke="#fff" stroke-opacity=".16" stroke-width="2"/>
      <rect x="12" y="12" width="976" height="256" rx="15" fill="none" stroke="#03adf9" stroke-opacity=".38" stroke-width="1.2"/>
      <g>
        <circle cx="150" cy="140" r="94" fill="url(#${id}-holo)"/>
        <path d="${rosette(150, 140, 50, 20, 7, 8)}" fill="none" stroke="#fff" stroke-opacity=".38" stroke-width=".8"/>
        <circle class="holo-shine" cx="150" cy="140" r="94" fill="url(#${id}-shine)" opacity=".5"/>
        <circle cx="150" cy="140" r="94" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.5"/>
        <text font-family="${mono}" font-size="10.5" font-weight="600" letter-spacing="2.1" fill="#062a63" fill-opacity=".72"><textPath href="#${id}-ring">VERISEAL • PRODUTO ORIGINAL • VERISEAL • PRODUTO ORIGINAL •</textPath></text>
        <use href="#vs-mark" x="104" y="115" width="92" height="49.4" style="--lg-ink:#062a63;--lg-accent:#0a76c4"/>
      </g>
      <use href="#vs-wordmark" x="290" y="74" width="330" height="54.4" style="--lg-ink:#fff;--lg-accent:#03adf9"/>
      <rect x="290" y="156" width="40" height="2.5" rx="1" fill="#03adf9"/>
      <text x="290" y="193" font-family="${mono}" font-size="15" font-weight="500" letter-spacing="3.2" fill="#fff" fill-opacity=".8">PRODUTO ORIGINAL</text>
      <text x="290" y="220" font-family="${mono}" font-size="12" letter-spacing="2.4" fill="#fff" fill-opacity=".5">LACRE INTELIGENTE · NFC</text>
      ${tearmarkup(.55)}
      <text transform="translate(641 140) rotate(-90)" text-anchor="middle" font-family="${mono}" font-size="9" letter-spacing="2" fill="#fff" fill-opacity=".55">ROMPE AO ABRIR</text>
      ${contactless(706, 94, 66, '#fff', 5)}
      <text x="774" y="88" font-family="${sans}" font-size="22" font-weight="700" letter-spacing=".3" fill="#fff">APROXIME O</text>
      <text x="774" y="114" font-family="${sans}" font-size="22" font-weight="700" letter-spacing=".3" fill="#fff">CELULAR</text>
      <rect x="700" y="144" width="262" height="1" fill="#fff" fill-opacity=".18"/>
      <text x="700" y="176" font-family="${mono}" font-size="12" letter-spacing="2.4" fill="#fff" fill-opacity=".55">Nº DE SÉRIE</text>
      <text class="seal-serial" x="700" y="212" font-family="${mono}" font-size="30" font-weight="600" letter-spacing="3" fill="#fff">${serial}</text>
      <text x="700" y="245" font-family="${sans}" font-size="13" letter-spacing=".2" fill="#fff" fill-opacity=".62">Verifique a autenticidade</text>
    </svg>`;
  }

  // o que a lupa de raio-x mostra: o interior do lacre, com anotações
  function xraysvg() {
    const id = 'xr' + (++uid);
    let grid = '';
    for (let x = 20; x < sealw; x += 20) grid += `M${x} 0V${sealh}`;
    for (let y = 20; y < sealh; y += 20) grid += `M0 ${y}H${sealw}`;
    const label = (x, y, t, rot) => `<text ${rot ? `transform="translate(${x} ${y}) rotate(-90)" text-anchor="middle"` : `x="${x}" y="${y}"`} font-family="${mono}" font-size="11" font-weight="600" letter-spacing="1.6" fill="#9fe6ff">${t}</text>`;
    return `<svg class="absolute top-0 left-0 origin-top-left overflow-visible" viewBox="0 0 ${sealw} ${sealh}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <defs><clipPath id="${id}-clip"><path d="${outline}"/></clipPath></defs>
      <path d="${outline}" fill="#020c1d"/>
      <g clip-path="url(#${id}-clip)"><path d="${grid}" stroke="#03adf9" stroke-opacity=".08" stroke-width="1"/></g>
      <path d="${outline}" fill="none" stroke="#03adf9" stroke-opacity=".45" stroke-width="1.5"/>
      <circle cx="150" cy="140" r="94" fill="none" stroke="#5fd0ff" stroke-opacity=".22" stroke-dasharray="3 5"/>
      <use href="#vs-wordmark" x="290" y="74" width="330" height="54.4" style="--lg-ink:rgba(95,208,255,.13);--lg-accent:rgba(95,208,255,.2)"/>
      <path d="${diecuts}" fill="none" stroke="#9fe6ff" stroke-opacity=".12" stroke-width="1.1"/>
      ${loopmarkup()}${tearmarkup(.5)}${coilmarkup()}${chipmarkup()}
      ${label(70, 66, 'CIRCUITO DE RUPTURA')}${label(632, 140, 'LINHA DE RUPTURA', true)}${label(796, 130, 'ANTENA NFC')}${label(664, 182, 'CHIP')}
      ${label(70, 222, 'ROMPE AO ABRIR A TAMPA')}
    </svg>`;
  }

  // embaralha os caracteres até revelar o número de série
  function scramble(el, final, ms = 900) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789', t0 = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - t0) / ms), lock = Math.floor(k * final.length);
      el.textContent = final.split('').map((c, i) => (i < lock || c === '-' ? c : chars[(Math.random() * chars.length) | 0])).join('');
      if (k < 1) requestAnimationFrame(step); else el.textContent = final;
    };
    requestAnimationFrame(step);
  }

  // onda de aproximação saindo do símbolo do celular
  function ping(host) {
    const p = document.createElement('i');
    p.className = 'pointer-events-none absolute aspect-square w-[12%] rounded-full border-2 border-[rgba(95,208,255,.75)] opacity-0 [transform:translate(-50%,-50%)_scale(.2)]';
    p.style.left = (nfcu * 100) + '%';
    p.style.top = (nfcv * 100) + '%';
    host.appendChild(p);
    const a = p.animate(
      [{ transform: 'translate(-50%,-50%) scale(.2)', opacity: .9 }, { transform: 'translate(-50%,-50%) scale(2.6)', opacity: 0 }],
      { duration: 1700, easing: 'cubic-bezier(.22,.61,.36,1)' }
    );
    a.onfinish = () => p.remove();
  }

  /* ---------- lacre interativo: inclinação, holograma, lupa de raio-x e pings ---------- */
  function mount(host, opts = {}) {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
    host.classList.add('perspective-[1600px]');
    host.innerHTML = `
      <div class="absolute inset-0 will-change-transform [transform-style:preserve-3d] [transform:rotateX(14deg)_rotateZ(-4deg)]" data-tilt>
        <div class="absolute inset-0 drop-shadow-[0_26px_30px_rgba(0,0,0,.5)] after:pointer-events-none after:absolute after:-top-[8%] after:-bottom-[8%] after:left-0 after:w-0.5 after:bg-[linear-gradient(transparent,#bdf0ff_20%,#fff_50%,#bdf0ff_80%,transparent)] after:opacity-0 after:shadow-[0_0_18px_4px_rgba(3,173,249,.75),0_0_60px_14px_rgba(3,173,249,.35)] [.is-intro_&]:after:animate-[scanX_1.3s_var(--ease-io)_.2s_both]" data-face>${printsvg(opts.serial)}<div class="pointer-events-none absolute inset-0 rounded-[2.4%/8.6%] bg-[radial-gradient(circle_at_var(--gx,30%)_var(--gy,10%),rgba(255,255,255,.22),rgba(255,255,255,0)_38%)] mix-blend-screen" data-glare></div></div>
      </div>
      <div class="pointer-events-none absolute top-0 left-0 z-[5] size-[var(--ld,160px)] rounded-full will-change-transform [transform:translate3d(var(--lx,0),var(--ly,0),0)_translate(-50%,-50%)]" data-loupe><div class="absolute inset-0 overflow-hidden rounded-full bg-[rgba(2,8,20,.78)] shadow-[inset_0_0_0_2px_rgba(255,255,255,.85),inset_0_0_26px_rgba(3,173,249,.45),0_0_0_6px_rgba(255,255,255,.06),0_18px_50px_rgba(0,0,0,.55),0_0_40px_rgba(3,173,249,.35)] after:pointer-events-none after:absolute after:inset-0 after:rounded-full after:bg-[radial-gradient(circle_at_32%_26%,rgba(255,255,255,.22),transparent_34%),repeating-linear-gradient(0deg,rgba(95,208,255,.05)_0_1px,transparent_1px_3px)]" data-view>${xraysvg()}</div><span class="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-cyan px-2.5 py-1 font-mono text-[11px] leading-none font-semibold tracking-[.14em] whitespace-nowrap text-[#021638] uppercase">Raio-X</span></div>`;
    const tiltel = host.querySelector('[data-tilt]'), face = host.querySelector('[data-face]');
    const glare = host.querySelector('[data-glare]'), loupe = host.querySelector('[data-loupe]');
    const xsvg = host.querySelector('[data-view] svg');
    const holograd = host.querySelector('.holo-grad'), holoshine = host.querySelector('.holo-shine');
    const pointerhost = opts.pointerhost || host;

    let sw = 1, sh = 1, ld = 160, zoom = 1.9;
    let tiltx = 0, tilty = 0, px = 0, py = 0, hover = false, lastinput = -1e9;
    let lu = 0.7, lv = 0.4, tu = 0.7, tv = 0.4, nextping = 1.4, inview = false, raf = 0, last = 0, t = 0;

    function layout() {
      sw = face.offsetWidth || 1; sh = face.offsetHeight || 1;
      ld = Math.max(96, Math.min(200, sw * 0.3));
      zoom = sw < 420 ? 2.3 : 1.9;
      loupe.style.setProperty('--ld', ld + 'px');
      xsvg.setAttribute('width', sw * zoom); xsvg.setAttribute('height', sh * zoom);
    }
    const damp = (cur, target, k, dt) => cur + (target - cur) * (1 - Math.exp(-k * dt));

    pointerhost.addEventListener('pointermove', (e) => {
      const r = face.getBoundingClientRect();
      const hr = pointerhost.getBoundingClientRect();
      px = Math.max(-1, Math.min(1, ((e.clientX - hr.left) / hr.width) * 2 - 1));
      py = Math.max(-1, Math.min(1, ((e.clientY - hr.top) / hr.height) * 2 - 1));
      const u = (e.clientX - r.left) / r.width, v = (e.clientY - r.top) / r.height;
      hover = u > -0.05 && u < 1.05 && v > -0.3 && v < 1.3;
      if (hover) { tu = Math.max(0.03, Math.min(0.97, u)); tv = Math.max(0.06, Math.min(0.94, v)); lastinput = performance.now(); }
    }, { passive: true });
    pointerhost.addEventListener('pointerleave', () => { hover = false; px = py = 0; });

    function frame(now) {
      const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now; t += dt;
      const idle = reduce ? 0 : 1;
      tiltx = damp(tiltx, reduce ? 0 : (fine ? -py * 6 : 0) + idle * Math.sin(t * 0.5) * 2, 5, dt);
      tilty = damp(tilty, reduce ? 0 : (fine ? px * 9 : 0) + idle * Math.sin(t * 0.37 + 1) * 3, 5, dt);
      tiltel.style.transform = `rotateX(${(14 + tiltx).toFixed(2)}deg) rotateY(${tilty.toFixed(2)}deg) rotateZ(-4deg)`;
      glare.style.setProperty('--gx', (50 + tilty * 4).toFixed(1) + '%');
      glare.style.setProperty('--gy', (30 - tiltx * 5).toFixed(1) + '%');
      if (holograd) holograd.setAttribute('gradientTransform', `rotate(${(tilty * 9 - tiltx * 6 + t * 8).toFixed(1)} 150 140)`);
      if (holoshine) holoshine.setAttribute('opacity', (0.35 + 0.3 * Math.abs(Math.sin(tilty * 0.25 + t * 0.3))).toFixed(3));

      // lupa: segue o ponteiro; parada, passeia sozinha pelo lacre
      const active = hover || now - lastinput < 2200;
      if (!active) { if (reduce) { tu = 0.72; tv = 0.42; } else { tu = 0.5 + 0.42 * Math.sin(t * 0.33); tv = 0.5 + 0.2 * Math.sin(t * 0.71); } }
      lu = damp(lu, tu, active ? 10 : 2.4, dt); lv = damp(lv, tv, active ? 10 : 2.4, dt);
      const x = lu * sw, y = lv * sh;
      loupe.style.setProperty('--lx', x.toFixed(1) + 'px'); loupe.style.setProperty('--ly', y.toFixed(1) + 'px');
      xsvg.style.transform = `translate(${(ld / 2 - x * zoom).toFixed(1)}px,${(ld / 2 - y * zoom).toFixed(1)}px)`;

      // pings: de tempos em tempos e sempre que a lupa passa pelo símbolo do celular
      if (!reduce) {
        nextping -= dt;
        const nearnfc = Math.abs(lu - nfcu) < 0.1 && Math.abs(lv - nfcv) < 0.25;
        if (nextping <= 0) { ping(face); nextping = nearnfc ? 1.1 : 2.6; }
      }
      raf = inview ? requestAnimationFrame(frame) : 0;
    }

    layout();
    addEventListener('resize', layout);
    if ('ResizeObserver' in window) new ResizeObserver(layout).observe(face);
    new IntersectionObserver((es) => es.forEach((e) => {
      inview = e.isIntersecting;
      if (inview && !raf) { last = 0; layout(); raf = requestAnimationFrame(frame); }
    }), { rootMargin: '80px' }).observe(host);
    if (!reduce && opts.serial) {
      const io = new IntersectionObserver((es, o) => es.forEach((e) => {
        if (!e.isIntersecting) return;
        o.disconnect();
        host.classList.add('is-intro');
        scramble(host.querySelector('.seal-serial'), opts.serial, 1100);
      }), { threshold: 0.5 });
      io.observe(host);
    }
    return { layout };
  }

  // registra a tira do gargalo no sprite do index.html (#vs-neck e #vs-neck-torn)
  (function defineneck() {
    const sprite = document.getElementById('sprite');
    if (!sprite || document.getElementById('vs-neck')) return;
    sprite.insertAdjacentHTML('beforeend', `<defs>${neckdefs()}</defs>${necksymbol('vs-neck', false)}${necksymbol('vs-neck-torn', true)}`);
  })();

  // proporções da tira: largura 40, altura 110, linha de ruptura em 44, símbolo NFC em 63
  const neck = { w: 40, h: 110, j: nj, nfc: 63 };

  return { printsvg, xraysvg, mount, ping, scramble, nfcu, nfcv, neck };
})();
