const largura_lacre = 1000;
const altura_lacre = 280;
const canto = 24;
const ruptura_x = 655;
const contorno = `M${canto} 0H${ruptura_x - 11}L${ruptura_x} 13L${ruptura_x + 11} 0H${largura_lacre - canto}A${canto} ${canto} 0 0 1 ${largura_lacre} ${canto}V${altura_lacre - canto}A${canto} ${canto} 0 0 1 ${largura_lacre - canto} ${altura_lacre}H${ruptura_x + 11}L${ruptura_x} ${altura_lacre - 13}L${ruptura_x - 11} ${altura_lacre}H${canto}A${canto} ${canto} 0 0 1 0 ${altura_lacre - canto}V${canto}A${canto} ${canto} 0 0 1 ${canto} 0Z`;
const sans = `Inter, -apple-system, 'Segoe UI', Roboto, sans-serif`;
const mono = `'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace`;
const nfc_x = 0.706;
const nfc_y = 0.336;
const juncao = 44;
let contador_id = 0;

export const gargalo = { largura: 40, altura: 110, juncao, nfc: 63 };

function guilloche(linhas, amplitude, f1, f2, fase) {
  let d = '';
  for (let i = 0; i < linhas; i++) {
    const fase_linha = fase + i * 0.42;
    for (let x = -10, primeiro = true; x <= largura_lacre + 10; x += 8, primeiro = false) {
      const y =
        altura_lacre / 2 +
        amplitude * Math.sin(x * f1 + fase_linha) * (0.62 + 0.38 * Math.sin(x * f2 - fase_linha * 0.7));
      d += (primeiro ? 'M' : 'L') + x + ' ' + y.toFixed(1);
    }
  }
  return d;
}

function roseta(cx, cy, raio, amplitude, petalas, aneis) {
  let d = '';
  for (let i = 0; i < aneis; i++) {
    for (let j = 0; j <= 160; j++) {
      const t = (j / 160) * Math.PI * 2;
      const r = raio + amplitude * Math.sin(petalas * t + i * 0.55);
      d += (j ? 'L' : 'M') + (cx + r * Math.cos(t)).toFixed(1) + ' ' + (cy + r * Math.sin(t)).toFixed(1);
    }
    d += 'Z';
  }
  return d;
}

function aproximacao(x, y, tamanho, espessura) {
  const a = (52 * Math.PI) / 180;
  let d = '';
  for (const f of [0.22, 0.47, 0.72, 0.97]) {
    const r = tamanho * f * 0.62;
    d += `M${(x + r * Math.cos(-a)).toFixed(1)} ${(y + r * Math.sin(-a)).toFixed(1)}A${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${(x + r * Math.cos(a)).toFixed(1)} ${(y + r * Math.sin(a)).toFixed(1)}`;
  }
  return `<path d="${d}" fill="none" stroke="#fff" stroke-width="${espessura}" stroke-linecap="round"/>`;
}

function simbolo_gargalo(id, rompido) {
  let zigue_zague = '';
  for (let i = 0; i <= 8; i++) zigue_zague += `L${i * 5} ${(juncao + (rompido ? (i % 2 ? 1.8 : -0.6) : 0)).toFixed(1)}`;
  const caminho_superior = `M40 ${juncao}V6Q40 0 34 0H6Q0 0 0 6V${juncao}${zigue_zague}Z`;
  const caminho_inferior = `M0 ${juncao}${zigue_zague}V106Q40 110 36 110H4Q0 110 0 106Z`;
  let ondas = '';
  for (let k = 0; k < 3; k++) {
    for (let y = juncao + 3, primeiro = true; y <= 107; y += 1.5, primeiro = false) {
      const x = 20 + 13 * Math.sin(y * 0.23 + k * 2.1) * (0.55 + 0.45 * Math.sin(y * 0.05 + k));
      ondas += (primeiro ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(1);
    }
  }
  const superior = `
    <path d="${caminho_superior}" fill="url(#vsnk-navy)"/>
    <circle cx="20" cy="21" r="12.5" fill="url(#vsnk-holo)"/>
    <path d="${roseta(20, 21, 7.6, 2.4, 7, 4)}" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width=".35"/>
    <image href="assets/marca/vs-simbolo-lacre.svg" x="12.5" y="17" width="15" height="8.06"/>
    <circle cx="20" cy="21" r="12.5" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width=".6"/>
    <path d="${caminho_superior}" fill="url(#vsnk-cyl)"/>
    <path d="${caminho_superior}" fill="none" stroke="#03adf9" stroke-opacity=".75" stroke-width=".7"/>`;
  const inferior = `
    <path d="${caminho_inferior}" fill="url(#vsnk-navy)"/>
    <path d="${ondas}" fill="none" stroke="#5fd0ff" stroke-opacity=".22" stroke-width=".4"/>
    ${aproximacao(12.5, 63, 18, 1.15)}
    <text transform="translate(31.6 105) rotate(-90)" font-family="${mono}" font-size="5.4" font-weight="600" letter-spacing="1.1" fill="#fff" fill-opacity=".86">VERISEAL</text>
    <rect x="6" y="82" width="15" height="1" rx=".5" fill="#fff" opacity=".35"/><rect x="6" y="86" width="11" height="1" rx=".5" fill="#fff" opacity=".25"/><rect x="6" y="90" width="13" height="1" rx=".5" fill="#fff" opacity=".25"/>
    <path d="${caminho_inferior}" fill="url(#vsnk-cyl)"/>
    <path d="${caminho_inferior}" fill="none" stroke="#03adf9" stroke-opacity=".75" stroke-width=".7"/>`;
  if (!rompido) {
    return `<symbol id="${id}" viewBox="0 0 40 110" overflow="visible">${inferior}${superior}
      <path d="M1.2 ${juncao}H38.8" stroke="#fff" stroke-opacity=".75" stroke-width=".7" stroke-dasharray="1.6 1.3"/></symbol>`;
  }
  return `<symbol id="${id}" viewBox="0 0 40 110" overflow="visible">${inferior}
    <path d="M0 ${juncao}${zigue_zague}" fill="none" stroke="#ff5b4f" stroke-width=".9"/>
    <circle cx="11" cy="${juncao + 2.2}" r="1.7" fill="#ff5b4f"/><circle cx="29" cy="${juncao + 2.2}" r="1.7" fill="#ff5b4f"/>
    <g transform="translate(4 -10) rotate(-13 40 ${juncao})">${superior}</g></symbol>`;
}

export function criar_simbolos_gargalo() {
  document.body.insertAdjacentHTML(
    'beforeend',
    `<svg style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true" focusable="false"><defs>
      <linearGradient id="vsnk-navy" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d3a80"/><stop offset=".5" stop-color="#062a63"/><stop offset="1" stop-color="#03204f"/></linearGradient>
      <linearGradient id="vsnk-holo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8fe3ff"/><stop offset=".22" stop-color="#b9a9ff"/><stop offset=".42" stop-color="#ffc4e5"/><stop offset=".6" stop-color="#fff1b0"/><stop offset=".8" stop-color="#b3ffd8"/><stop offset="1" stop-color="#8fe3ff"/></linearGradient>
      <linearGradient id="vsnk-cyl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".5"/><stop offset=".16" stop-color="#000" stop-opacity=".08"/><stop offset=".38" stop-color="#fff" stop-opacity=".24"/><stop offset=".52" stop-color="#fff" stop-opacity=".04"/><stop offset=".84" stop-color="#000" stop-opacity=".14"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient>
    </defs>${simbolo_gargalo('vs-neck', false)}${simbolo_gargalo('vs-neck-torn', true)}</svg>`
  );
}

function espiral(x0, y0, x1, y1, voltas, espaco) {
  const meio = (y0 + y1) / 2;
  let d = `M${x0} ${meio}`;
  for (let t = 0; t < voltas; t++) {
    const o = t * espaco;
    d += `V${y0 + o}H${x1 - o}V${y1 - o}H${x0 + o + espaco}V${meio}`;
  }
  return d;
}

function picotes() {
  let d = '';
  for (let y = 26, linha = 0; y < altura_lacre - 10; y += 30, linha++) {
    for (let x = 24 + (linha % 2) * 15; x < largura_lacre - 10; x += 30) {
      d += `M${x - 5} ${y}a5 5 0 0 ${(x + y) % 60 < 30 ? 1 : 0} 10 0`;
    }
  }
  return d;
}

const linha_ruptura = (opacidade) =>
  `<path d="M${ruptura_x} 18V262" stroke="#fff" stroke-opacity="${opacidade}" stroke-width="1.6" stroke-dasharray="5 6"/>`;

function svg_impresso(serie) {
  const id = 'sl' + ++contador_id;
  return `<svg class="absolute inset-0 size-full overflow-visible" viewBox="0 0 ${largura_lacre} ${altura_lacre}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <defs>
      <clipPath id="${id}-clip"><path d="${contorno}"/></clipPath>
      <linearGradient id="${id}-navy" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d3a80"/><stop offset=".45" stop-color="#062a63"/><stop offset="1" stop-color="#021a42"/></linearGradient>
      <linearGradient id="${id}-holo" class="holo-gradiente" gradientUnits="userSpaceOnUse" x1="56" y1="46" x2="244" y2="234">
        <stop offset="0" stop-color="#8fe3ff"/><stop offset=".18" stop-color="#b9a9ff"/><stop offset=".36" stop-color="#ffc4e5"/><stop offset=".52" stop-color="#fff1b0"/><stop offset=".7" stop-color="#b3ffd8"/><stop offset=".86" stop-color="#8fe3ff"/><stop offset="1" stop-color="#c8b8ff"/>
      </linearGradient>
      <radialGradient id="${id}-shine" cx=".35" cy=".3" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset=".35" stop-color="#fff" stop-opacity=".1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
      <path id="${id}-ring" d="M150 140m-80 0a80 80 0 1 1 160 0a80 80 0 1 1-160 0"/>
    </defs>
    <g clip-path="url(#${id}-clip)">
      <rect width="${largura_lacre}" height="${altura_lacre}" fill="url(#${id}-navy)"/>
      <path d="${guilloche(14, 108, 0.0115, 0.0042, 0)}" fill="none" stroke="#5fd0ff" stroke-opacity=".1" stroke-width="1"/>
      <path d="${guilloche(10, 70, 0.019, 0.006, 1.3)}" fill="none" stroke="#9fb5ff" stroke-opacity=".08" stroke-width="1"/>
      <text x="30" y="266" font-family="${mono}" font-size="7" letter-spacing="1.2" fill="#fff" fill-opacity=".28">${'VERISEAL · ORIGINAL · '.repeat(12)}</text>
    </g>
    <path d="${contorno}" fill="none" stroke="#fff" stroke-opacity=".16" stroke-width="2"/>
    <rect x="12" y="12" width="976" height="256" rx="15" fill="none" stroke="#03adf9" stroke-opacity=".38" stroke-width="1.2"/>
    <g>
      <circle cx="150" cy="140" r="94" fill="url(#${id}-holo)"/>
      <path d="${roseta(150, 140, 50, 20, 7, 8)}" fill="none" stroke="#fff" stroke-opacity=".38" stroke-width=".8"/>
      <circle class="holo-brilho" cx="150" cy="140" r="94" fill="url(#${id}-shine)" opacity=".5"/>
      <circle cx="150" cy="140" r="94" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.5"/>
      <text font-family="${mono}" font-size="10.5" font-weight="600" letter-spacing="2.1" fill="#062a63" fill-opacity=".72"><textPath href="#${id}-ring">VERISEAL • PRODUTO ORIGINAL • VERISEAL • PRODUTO ORIGINAL •</textPath></text>
      <image href="assets/marca/vs-simbolo-lacre.svg" x="104" y="115" width="92" height="49.4"/>
    </g>
    <image href="assets/marca/vs-logotipo-branco.svg" x="290" y="74" width="330" height="54.4"/>
    <rect x="290" y="156" width="40" height="2.5" rx="1" fill="#03adf9"/>
    <text x="290" y="193" font-family="${mono}" font-size="15" font-weight="500" letter-spacing="3.2" fill="#fff" fill-opacity=".8">PRODUTO ORIGINAL</text>
    <text x="290" y="220" font-family="${mono}" font-size="12" letter-spacing="2.4" fill="#fff" fill-opacity=".5">LACRE INTELIGENTE · NFC</text>
    ${linha_ruptura(0.55)}
    <text transform="translate(641 140) rotate(-90)" text-anchor="middle" font-family="${mono}" font-size="9" letter-spacing="2" fill="#fff" fill-opacity=".55">ROMPE AO ABRIR</text>
    ${aproximacao(706, 94, 66, 5)}
    <text x="774" y="88" font-family="${sans}" font-size="22" font-weight="700" letter-spacing=".3" fill="#fff">APROXIME O</text>
    <text x="774" y="114" font-family="${sans}" font-size="22" font-weight="700" letter-spacing=".3" fill="#fff">CELULAR</text>
    <rect x="700" y="144" width="262" height="1" fill="#fff" fill-opacity=".18"/>
    <text x="700" y="176" font-family="${mono}" font-size="12" letter-spacing="2.4" fill="#fff" fill-opacity=".55">Nº DE SÉRIE</text>
    <text class="lacre-serie" x="700" y="212" font-family="${mono}" font-size="30" font-weight="600" letter-spacing="3" fill="#fff">${serie}</text>
    <text x="700" y="245" font-family="${sans}" font-size="13" letter-spacing=".2" fill="#fff" fill-opacity=".62">Verifique a autenticidade</text>
  </svg>`;
}

function svg_raio_x() {
  const id = 'xr' + ++contador_id;
  const bobina = espiral(718, 34, 968, 246, 6, 10);
  const circuito =
    'M684 128H600C584 128 576 120 576 104V64C576 50 568 42 554 42H66C52 42 44 50 44 64V216C44 230 52 238 66 238H554C568 238 576 230 576 216V176C576 160 584 152 600 152H684';
  let grade = '';
  for (let x = 20; x < largura_lacre; x += 20) grade += `M${x} 0V${altura_lacre}`;
  for (let y = 20; y < altura_lacre; y += 20) grade += `M0 ${y}H${largura_lacre}`;
  const rotulo = (x, y, texto, vertical) =>
    `<text ${vertical ? `transform="translate(${x} ${y}) rotate(-90)" text-anchor="middle"` : `x="${x}" y="${y}"`} font-family="${mono}" font-size="11" font-weight="600" letter-spacing="1.6" fill="#9fe6ff">${texto}</text>`;
  return `<svg class="absolute top-0 left-0 origin-top-left overflow-visible" viewBox="0 0 ${largura_lacre} ${altura_lacre}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <defs><clipPath id="${id}-clip"><path d="${contorno}"/></clipPath></defs>
    <path d="${contorno}" fill="#020c1d"/>
    <g clip-path="url(#${id}-clip)"><path d="${grade}" stroke="#03adf9" stroke-opacity=".08" stroke-width="1"/></g>
    <path d="${contorno}" fill="none" stroke="#03adf9" stroke-opacity=".45" stroke-width="1.5"/>
    <circle cx="150" cy="140" r="94" fill="none" stroke="#5fd0ff" stroke-opacity=".22" stroke-dasharray="3 5"/>
    <image href="assets/marca/vs-logotipo-raio-x.svg" x="290" y="74" width="330" height="54.4"/>
    <path d="${picotes()}" fill="none" stroke="#9fe6ff" stroke-opacity=".12" stroke-width="1.1"/>
    <path d="${circuito}" fill="none" stroke="#03adf9" stroke-opacity=".3" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="${circuito}" fill="none" stroke="#9fe6ff" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="684" cy="128" r="4" fill="#9fe6ff"/><circle cx="684" cy="152" r="4" fill="#9fe6ff"/>
    <g fill="none" stroke="#ff7a70" stroke-width="2"><circle cx="${ruptura_x}" cy="128" r="8"/><circle cx="${ruptura_x}" cy="152" r="8"/></g>
    ${linha_ruptura(0.5)}
    <path d="${bobina}M702 140H718" fill="none" stroke="#03adf9" stroke-opacity=".28" stroke-width="8" stroke-linejoin="round"/>
    <path d="${bobina}" fill="none" stroke="#9fe6ff" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M702 140H718M778 140V156H700" fill="none" stroke="#9fe6ff" stroke-width="2.4" stroke-linejoin="round"/>
    <rect x="712" y="150" width="72" height="11" rx="3" fill="#06142c" stroke="#03adf9" stroke-opacity=".6"/>
    <g>
      <rect x="664" y="122" width="38" height="38" rx="5" fill="#081a36" stroke="#9fe6ff" stroke-width="1.6"/>
      <rect x="672" y="130" width="22" height="22" rx="2" fill="#03adf9" fill-opacity=".25" stroke="#03adf9" stroke-opacity=".8"/>
      <path d="M668 122v-5M676 122v-5M684 122v-5M692 122v-5M698 122v-5M668 160v5M676 160v5M684 160v5M692 160v5M698 160v5" stroke="#9fe6ff" stroke-width="1.4"/>
    </g>
    ${rotulo(70, 66, 'CIRCUITO DE RUPTURA')}${rotulo(632, 140, 'LINHA DE RUPTURA', true)}${rotulo(796, 130, 'ANTENA NFC')}${rotulo(664, 182, 'CHIP')}
    ${rotulo(70, 222, 'ROMPE AO ABRIR A TAMPA')}
  </svg>`;
}

function embaralhar(elemento, final) {
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
  const inicio = performance.now();
  const etapa = (agora) => {
    const progresso = Math.min(1, (agora - inicio) / 1100);
    const travados = Math.floor(progresso * final.length);
    elemento.textContent = [...final]
      .map((c, i) => (i < travados || c === '-' ? c : caracteres[(Math.random() * caracteres.length) | 0]))
      .join('');
    if (progresso < 1) requestAnimationFrame(etapa);
  };
  requestAnimationFrame(etapa);
}

function sinal(base) {
  const onda = document.createElement('i');
  onda.className =
    'pointer-events-none absolute aspect-square w-[12%] rounded-full border-2 border-[rgba(95,208,255,.75)] opacity-0 [transform:translate(-50%,-50%)_scale(.2)]';
  onda.style.left = nfc_x * 100 + '%';
  onda.style.top = nfc_y * 100 + '%';
  base.appendChild(onda);
  onda.animate(
    [
      { transform: 'translate(-50%,-50%) scale(.2)', opacity: 0.9 },
      { transform: 'translate(-50%,-50%) scale(2.6)', opacity: 0 }
    ],
    { duration: 1700, easing: 'cubic-bezier(.22,.61,.36,1)' }
  ).onfinish = () => onda.remove();
}

export function montar_lacre(base, serie, area_ponteiro) {
  const menos_movimento = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mouse_preciso = matchMedia('(hover: hover) and (pointer: fine)').matches;
  base.classList.add('perspective-[1600px]');
  base.innerHTML = `
    <div class="absolute inset-0 will-change-transform [transform-style:preserve-3d] [transform:rotateX(14deg)_rotateZ(-4deg)]" data-inclinacao>
      <div class="absolute inset-0 drop-shadow-[0_26px_30px_rgba(0,0,0,.5)] after:pointer-events-none after:absolute after:-top-[8%] after:-bottom-[8%] after:left-0 after:w-0.5 after:bg-[linear-gradient(transparent,#bdf0ff_20%,#fff_50%,#bdf0ff_80%,transparent)] after:opacity-0 after:shadow-[0_0_18px_4px_rgba(3,173,249,.75),0_0_60px_14px_rgba(3,173,249,.35)] [.entrada_&]:after:animate-[varrer_1.3s_var(--ease-vaivem)_.2s_both]" data-face>${svg_impresso(serie)}<div class="pointer-events-none absolute inset-0 rounded-[2.4%/8.6%] bg-[radial-gradient(circle_at_var(--reflexo-x,30%)_var(--reflexo-y,10%),rgba(255,255,255,.22),rgba(255,255,255,0)_38%)] mix-blend-screen" data-reflexo></div></div>
    </div>
    <div class="pointer-events-none absolute top-0 left-0 z-[5] size-[var(--lente-tamanho,160px)] rounded-full will-change-transform [transform:translate3d(var(--lente-x,0),var(--lente-y,0),0)_translate(-50%,-50%)]" data-lente><div class="absolute inset-0 overflow-hidden rounded-full bg-[rgba(2,8,20,.78)] shadow-[inset_0_0_0_2px_rgba(255,255,255,.85),inset_0_0_26px_rgba(3,173,249,.45),0_0_0_6px_rgba(255,255,255,.06),0_18px_50px_rgba(0,0,0,.55),0_0_40px_rgba(3,173,249,.35)] after:pointer-events-none after:absolute after:inset-0 after:rounded-full after:bg-[radial-gradient(circle_at_32%_26%,rgba(255,255,255,.22),transparent_34%),repeating-linear-gradient(0deg,rgba(95,208,255,.05)_0_1px,transparent_1px_3px)]" data-vista>${svg_raio_x()}</div><span class="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-ciano px-2.5 py-1 font-mono text-[11px] leading-none font-semibold tracking-[.14em] whitespace-nowrap text-[#021638] uppercase">Raio-X</span></div>`;
  const inclinacao = base.querySelector('[data-inclinacao]');
  const face = base.querySelector('[data-face]');
  const reflexo = base.querySelector('[data-reflexo]');
  const lente = base.querySelector('[data-lente]');
  const raio_x = base.querySelector('[data-vista] svg');
  const holo_gradiente = base.querySelector('.holo-gradiente');
  const holo_brilho = base.querySelector('.holo-brilho');

  let largura_face = 1;
  let altura_face = 1;
  let tamanho_lente = 160;
  let zoom = 1.9;
  let inclinacao_x = 0;
  let inclinacao_y = 0;
  let ponteiro_x = 0;
  let ponteiro_y = 0;
  let cursor_em_cima = false;
  let ultima_interacao = -1e9;
  let lente_x = 0.7;
  let lente_y = 0.4;
  let alvo_x = 0.7;
  let alvo_y = 0.4;
  let proximo_sinal = 1.4;
  let visivel = false;
  let quadro_id = 0;
  let ultimo_tempo = 0;
  let tempo = 0;

  function medir() {
    largura_face = face.offsetWidth || 1;
    altura_face = face.offsetHeight || 1;
    tamanho_lente = Math.max(96, Math.min(200, largura_face * 0.3));
    zoom = largura_face < 420 ? 2.3 : 1.9;
    lente.style.setProperty('--lente-tamanho', tamanho_lente + 'px');
    raio_x.setAttribute('width', largura_face * zoom);
    raio_x.setAttribute('height', altura_face * zoom);
  }

  const suavizar = (atual, alvo, velocidade, dt) => atual + (alvo - atual) * (1 - Math.exp(-velocidade * dt));
  const limitar = (valor, minimo, maximo) => Math.max(minimo, Math.min(maximo, valor));

  area_ponteiro.addEventListener(
    'pointermove',
    (e) => {
      const caixa_face = face.getBoundingClientRect();
      const caixa_base = area_ponteiro.getBoundingClientRect();
      ponteiro_x = limitar(((e.clientX - caixa_base.left) / caixa_base.width) * 2 - 1, -1, 1);
      ponteiro_y = limitar(((e.clientY - caixa_base.top) / caixa_base.height) * 2 - 1, -1, 1);
      const u = (e.clientX - caixa_face.left) / caixa_face.width;
      const v = (e.clientY - caixa_face.top) / caixa_face.height;
      cursor_em_cima = u > -0.05 && u < 1.05 && v > -0.3 && v < 1.3;
      if (cursor_em_cima) {
        alvo_x = limitar(u, 0.03, 0.97);
        alvo_y = limitar(v, 0.06, 0.94);
        ultima_interacao = performance.now();
      }
    },
    { passive: true }
  );
  area_ponteiro.addEventListener('pointerleave', () => {
    cursor_em_cima = false;
    ponteiro_x = 0;
    ponteiro_y = 0;
  });

  function quadro(agora) {
    const dt = Math.min(0.05, (agora - (ultimo_tempo || agora)) / 1000);
    ultimo_tempo = agora;
    tempo += dt;
    const balanco_x = Math.sin(tempo * 0.5) * 2;
    const balanco_y = Math.sin(tempo * 0.37 + 1) * 3;
    inclinacao_x = suavizar(
      inclinacao_x,
      menos_movimento ? 0 : (mouse_preciso ? -ponteiro_y * 6 : 0) + balanco_x,
      5,
      dt
    );
    inclinacao_y = suavizar(
      inclinacao_y,
      menos_movimento ? 0 : (mouse_preciso ? ponteiro_x * 9 : 0) + balanco_y,
      5,
      dt
    );
    inclinacao.style.transform = `rotateX(${(14 + inclinacao_x).toFixed(2)}deg) rotateY(${inclinacao_y.toFixed(2)}deg) rotateZ(-4deg)`;
    reflexo.style.setProperty('--reflexo-x', (50 + inclinacao_y * 4).toFixed(1) + '%');
    reflexo.style.setProperty('--reflexo-y', (30 - inclinacao_x * 5).toFixed(1) + '%');
    holo_gradiente.setAttribute(
      'gradientTransform',
      `rotate(${(inclinacao_y * 9 - inclinacao_x * 6 + tempo * 8).toFixed(1)} 150 140)`
    );
    holo_brilho.setAttribute(
      'opacity',
      (0.35 + 0.3 * Math.abs(Math.sin(inclinacao_y * 0.25 + tempo * 0.3))).toFixed(3)
    );

    const ativo = cursor_em_cima || agora - ultima_interacao < 2200;
    if (!ativo && menos_movimento) {
      alvo_x = 0.72;
      alvo_y = 0.42;
    } else if (!ativo) {
      alvo_x = 0.5 + 0.42 * Math.sin(tempo * 0.33);
      alvo_y = 0.5 + 0.2 * Math.sin(tempo * 0.71);
    }
    lente_x = suavizar(lente_x, alvo_x, ativo ? 10 : 2.4, dt);
    lente_y = suavizar(lente_y, alvo_y, ativo ? 10 : 2.4, dt);
    const x = lente_x * largura_face;
    const y = lente_y * altura_face;
    lente.style.setProperty('--lente-x', x.toFixed(1) + 'px');
    lente.style.setProperty('--lente-y', y.toFixed(1) + 'px');
    raio_x.style.transform = `translate(${(tamanho_lente / 2 - x * zoom).toFixed(1)}px,${(tamanho_lente / 2 - y * zoom).toFixed(1)}px)`;

    if (!menos_movimento) {
      proximo_sinal -= dt;
      if (proximo_sinal <= 0) {
        sinal(face);
        const perto_nfc = Math.abs(lente_x - nfc_x) < 0.1 && Math.abs(lente_y - nfc_y) < 0.25;
        proximo_sinal = perto_nfc ? 1.1 : 2.6;
      }
    }
    quadro_id = visivel ? requestAnimationFrame(quadro) : 0;
  }

  medir();
  new ResizeObserver(medir).observe(face);
  new IntersectionObserver(
    (entradas) => {
      visivel = entradas.at(-1).isIntersecting;
      if (visivel && !quadro_id) {
        ultimo_tempo = 0;
        medir();
        quadro_id = requestAnimationFrame(quadro);
      }
    },
    { rootMargin: '80px' }
  ).observe(base);

  if (menos_movimento) return;
  const introducao = new IntersectionObserver(
    (entradas) => {
      if (!entradas.some((entrada) => entrada.isIntersecting)) return;
      introducao.disconnect();
      base.classList.add('entrada');
      embaralhar(base.querySelector('.lacre-serie'), serie);
    },
    { threshold: 0.5 }
  );
  introducao.observe(base);
}
