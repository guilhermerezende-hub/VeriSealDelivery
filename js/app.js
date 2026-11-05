import { categorias, produtos, lacres_exemplo, codigos_exemplo } from './produtos.js';
import { gargalo, montar_lacre, criar_simbolos_gargalo } from './lacre.js';

const achar = (seletor, raiz = document) => raiz.querySelector(seletor);
const achar_todos = (seletor, raiz = document) => [...raiz.querySelectorAll(seletor)];
const limitar = (valor, minimo, maximo) => Math.max(minimo, Math.min(maximo, valor));
const entidades_html = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escapar_html = (texto) => String(texto ?? '').replace(/[&<>"']/g, (c) => entidades_html[c]);
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const reais = (valor) => brl.format(Math.round(valor * 100) / 100);
const normalizar = (texto) => String(texto).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const hora = (data) => data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
const porcentagem = (valor) => (valor * 100).toFixed(2) + '%';
const menos_movimento = matchMedia('(prefers-reduced-motion: reduce)').matches;
const rolagem = menos_movimento ? 'auto' : 'smooth';
const definir_estado = (elemento, estado) => {
  if (estado) elemento.dataset.estado = estado;
  else delete elemento.dataset.estado;
};
const icone = (nome, classes = '') =>
  `<i class="icone ${classes}" style="--icone: url(assets/icones/${nome}.svg)" aria-hidden="true"></i>`;
const simbolo_vs = (classes = '', branco = false) =>
  `<img class="aspect-simbolo h-auto ${classes}" src="assets/marca/vs-simbolo${branco ? '-branco' : ''}.svg" alt="">`;

const selo_lacre =
  'absolute top-[9px] right-[9px] z-[2] inline-flex items-center gap-[5px] rounded-full bg-marinho py-[3px] pr-2 pl-1.5 text-[11px] font-bold text-white max-celular:pr-[7px] max-celular:pl-[5px] max-celular:text-[10px]';
const selo_lacre_marca = 'w-[18px] max-celular:w-[15px]';
const fundo_foto =
  'bg-[radial-gradient(ellipse_52%_9%_at_50%_93%,rgba(4,37,85,.2),transparent_72%),linear-gradient(180deg,#f6f8fb,#e9eef5)]';
const botao_link = 'text-destaque hover:underline';
const nota_marca = 'inline-flex items-center gap-2 text-[13px] font-bold text-marinho';
const linha_preco = 'flex justify-between py-[3px] text-[14px] text-tinta-2';
const linha_total = 'flex justify-between pt-2 pb-[3px] text-[19px] font-extrabold tracking-[-.02em] text-tinta';
const texto_gratis = 'font-semibold text-ok';
const info_cep = 'mb-2 min-h-4 text-[12px] text-tinta-2 data-[estado=erro]:text-erro data-[estado=ok]:text-ok';
const campo_caixa = 'flex min-w-0 flex-col gap-1.5';
const campo_rotulo = 'text-[13px] font-semibold text-tinta';
const campo_entrada =
  'w-full resize-y rounded-xl border border-linha bg-white px-3.5 py-3 text-[16px] outline-none transition-[border-color,box-shadow] duration-200 focus:border-destaque focus:shadow-foco [&.invalido]:border-erro';
const tag_opcional = ' <span class="font-normal text-tinta-2">(opcional)</span>';
const opcao_caixa =
  'flex cursor-pointer items-center gap-3.5 rounded-2xl border-[1.5px] border-linha px-4 py-3.5 transition-[border-color,background] duration-200 hover:border-tinta-3 has-checked:border-destaque has-checked:bg-destaque/4 has-disabled:cursor-default has-disabled:opacity-55';
const opcao_radio = 'm-0 size-[18px] shrink-0 accent-destaque';
const opcao_icone = 'grid size-9 shrink-0 place-items-center rounded-[10px] bg-fundo text-marinho';
const opcao_extra = 'pr-1 pb-1 pl-[50px] max-celular:pl-1';
const revisao_caixa = 'rounded-2xl bg-fundo px-[18px] py-3.5';
const revisao_titulo = 'mb-1.5 flex justify-between text-[13px] font-semibold text-tinta-2';
const linha_acoes = 'mt-[22px] flex justify-between gap-2.5 max-celular:flex-col-reverse';
const acao_principal = 'botao botao-primario ml-auto max-w-[340px] flex-1 max-celular:max-w-none';
const subir = 'animate-[subir_.5s_var(--ease-suave)_var(--atraso,0s)_both]';

const recorte_medalha =
  'M28 4.8Q35.82-1.17 39.6 7.91Q49.35 6.65 48.09 16.4Q57.17 20.18 51.2 28Q57.17 35.82 48.09 39.6Q49.35 49.35 39.6 48.09Q35.82 57.17 28 51.2Q20.18 57.17 16.4 48.09Q6.65 49.35 7.91 39.6Q-1.17 35.82 4.8 28Q-1.17 20.18 7.91 16.4Q6.65 6.65 16.4 7.91Q20.18-1.17 28 4.8Z';
const cores_medalha = {
  ok: ['#14a64a', 'rgba(20,166,74,.42)'],
  alerta: ['#e8930c', 'rgba(232,147,12,.42)'],
  erro: ['#d93025', 'rgba(217,48,37,.42)']
};
const cores_medalha_escuro = {
  ok: ['#22c55e', 'rgba(34,197,94,.5)'],
  alerta: ['#f5a524', 'rgba(245,165,36,.5)'],
  erro: ['#ff5b4f', 'rgba(255,91,79,.5)']
};
const animacoes_medalha = {
  agora: {
    selo: 'animate-[medalha-surgir_.75s_var(--ease-mola)_both]',
    tremer: 'animate-[medalha-surgir_.75s_var(--ease-mola)_both,medalha-tremer_.45s_ease_.85s]',
    traco: 'animate-[desenhar_.42s_var(--ease-vaivem)_.42s_forwards]',
    ponto: 'animate-[medalha-aparecer_.2s_ease_.8s_forwards]',
    onda: [
      'animate-[medalha-onda_1.1s_var(--ease-suave)_.28s_both]',
      'animate-[medalha-onda_1.1s_var(--ease-suave)_.5s_both]'
    ],
    halo: 'animate-[medalha-halo_.7s_var(--ease-suave)_.45s_both,medalha-girar_9s_linear_.45s_infinite]',
    brilho: 'animate-[medalha-brilho_2.6s_ease-in-out_.3s_infinite_both]',
    faisca: 'animate-[medalha-faisca_.95s_var(--ease-suave)_.3s_both]'
  },
  ligado: {
    selo: '[.ligado_&]:animate-[medalha-surgir_.75s_var(--ease-mola)_both]',
    tremer: '[.ligado_&]:animate-[medalha-surgir_.75s_var(--ease-mola)_both,medalha-tremer_.45s_ease_.85s]',
    traco: '[.ligado_&]:animate-[desenhar_.42s_var(--ease-vaivem)_.42s_forwards]',
    ponto: '[.ligado_&]:animate-[medalha-aparecer_.2s_ease_.8s_forwards]',
    onda: [
      '[.ligado_&]:animate-[medalha-onda_1.1s_var(--ease-suave)_.28s_both]',
      '[.ligado_&]:animate-[medalha-onda_1.1s_var(--ease-suave)_.5s_both]'
    ],
    halo: '[.ligado_&]:animate-[medalha-halo_.7s_var(--ease-suave)_.45s_both,medalha-girar_9s_linear_.45s_infinite]',
    brilho: '[.ligado_&]:animate-[medalha-brilho_2.6s_ease-in-out_.3s_infinite_both]',
    faisca: '[.ligado_&]:animate-[medalha-faisca_.95s_var(--ease-suave)_.3s_both]'
  },
  repetir: {
    selo: 'animate-[topo-surgir_7s_var(--ease-suave)_infinite]',
    traco: 'animate-[topo-desenhar_7s_linear_infinite]',
    ponto: '',
    onda: ['animate-[topo-onda_7s_var(--ease-suave)_infinite]', 'animate-[topo-onda-2_7s_var(--ease-suave)_infinite]'],
    halo: 'animate-[topo-halo_7s_linear_infinite]',
    brilho: 'animate-[topo-halo_7s_linear_infinite]',
    faisca: 'animate-[topo-faisca_7s_var(--ease-suave)_infinite]'
  }
};
const medalha = (tipo, estilo, tamanho, classes = '') => {
  const [cor, brilho] = (estilo === 'agora' ? cores_medalha_escuro : cores_medalha)[tipo];
  const animacao = animacoes_medalha[estilo];
  const traco =
    'fill-none stroke-white stroke-[5.4] [stroke-dasharray:1] [stroke-dashoffset:1] [stroke-linecap:round] [stroke-linejoin:round]';
  const onda = (k) =>
    `<i class="size-full rounded-full border-2 border-[var(--cor-medalha)] opacity-0 ${animacao.onda[k]}"></i>`;
  const faiscas = Array.from(
    { length: 8 },
    (_, k) =>
      `<i class="absolute top-1/2 left-1/2 rounded-full opacity-0 [transform:rotate(var(--angulo))] ${k % 2 ? '-mt-[2.5%] -ml-[2.5%] size-[5%] bg-[#5fd0ff]' : '-mt-[4%] -ml-[4%] size-[8%] bg-[var(--cor-medalha)]'} ${animacao.faisca}" style="--angulo:${k * 45 + 22}deg"></i>`
  ).join('');
  const simbolo =
    tipo === 'ok'
      ? `<path class="${traco} ${animacao.traco}" d="M18 28.5l7 7 13.5-14" pathLength="1"/>`
      : `<path class="${traco} ${animacao.traco}" d="M28 15.5v14.5" pathLength="1"/><circle class="fill-white opacity-0 ${animacao.ponto}" cx="28" cy="38.8" r="2.9"/>`;
  return `<span class="relative grid size-[var(--tamanho-medalha,96px)] flex-none place-items-center *:[grid-area:1/1] ${classes}" style="--tamanho-medalha:${tamanho};--cor-medalha:${cor};--brilho-medalha:${brilho}" aria-hidden="true">
      <i class="size-[160%] rounded-full bg-[radial-gradient(closest-side,var(--brilho-medalha),transparent_72%)] opacity-0 ${animacao.brilho}"></i><i class="size-[134%] rounded-full bg-[conic-gradient(#8fe3ff,#b9a9ff,#ffc4e5,#fff1b0,#b3ffd8,#8fe3ff)] opacity-0 [mask:radial-gradient(closest-side,transparent_83%,#000_85%,#000_96%,transparent_98%)] ${animacao.halo}"></i>${onda(0)}${onda(1)}
      <span class="relative size-full">${faiscas}</span>
      <svg class="relative z-[2] size-full overflow-visible [filter:drop-shadow(0_calc(var(--tamanho-medalha,96px)*.07)_calc(var(--tamanho-medalha,96px)*.14)_var(--brilho-medalha))] ${tipo === 'ok' || estilo === 'repetir' ? animacao.selo : animacao.tremer}" viewBox="-2 -2 60 60"><path class="fill-[var(--cor-medalha)]" d="${recorte_medalha}"/>${simbolo}</svg>
    </span>`;
};

const armazenamento = {
  ler(chave, padrao) {
    try {
      const valor = localStorage.getItem('vsd:' + chave);
      return valor == null ? padrao : JSON.parse(valor);
    } catch {
      return padrao;
    }
  },
  gravar(chave, valor) {
    try {
      localStorage.setItem('vsd:' + chave, JSON.stringify(valor));
    } catch {}
  }
};

const desconto_pix = 0.05;
const frete_gratis = 199;
const taxa_frete = 9.9;
const max_quantidade = 12;
const max_parcelas = 6;
const parcela_minima = 30;
const hora_abre = 8;
const hora_fecha = 3;
const dominio = 'veriseal.com.br';
const loja_aberta = (data = new Date()) => data.getHours() >= hora_abre || data.getHours() < hora_fecha;

const por_id = Object.fromEntries(produtos.map((p) => [p.id, p]));
const nome_categoria = Object.fromEntries(categorias.map((c) => [c.id, c.nome]));
for (const kit of produtos.filter((p) => p.itens)) {
  kit.garrafas = kit.itens.map((id) => por_id[id]);
  kit.preco_antigo = kit.garrafas.reduce((soma, garrafa) => soma + garrafa.preco, 0);
}
const lacres = { ...lacres_exemplo, ...armazenamento.ler('lacres', {}) };

const eh_kit = (p) => !!p.itens;
const percentual_desconto = (p) => (p.preco_antigo ? Math.round((1 - p.preco / p.preco_antigo) * 100) : 0);
const preco_pix = (valor) => valor * (1 - desconto_pix);
const parcelas = (total) => {
  const contagem = Math.min(max_parcelas, Math.floor(total / parcela_minima));
  return contagem >= 2 ? { contagem, valor: total / contagem } : null;
};
const teor_texto = (p) => String(p.teor).replace('.', ',') + '%';
const kit_resumo = (p) => `${p.garrafas.length} garrafas · ${p.garrafas.length} lacres VeriSeal`;
const gemeos = new Set(
  produtos
    .filter((p) => !eh_kit(p) && produtos.some((q) => q !== p && q.marca === p.marca && q.nome === p.nome))
    .map((p) => p.id)
);
const sufixo_volume = (p) => (gemeos.has(p.id) ? ' ' + p.volume : '');
const nome_completo = (p) => (eh_kit(p) ? `Kit ${p.nome}` : `${p.marca} ${p.nome}${sufixo_volume(p)}`);
const nome_curto = (p) => (eh_kit(p) ? `Kit ${p.nome}` : `${p.nome}${sufixo_volume(p)}`);
const grupos_kit = (p) => {
  const grupos = new Map();
  for (const garrafa of p.garrafas) grupos.set(garrafa, (grupos.get(garrafa) || 0) + 1);
  return [...grupos];
};
const combina = (p, busca) => {
  const texto = [p.marca, p.nome, p.volume, nome_categoria[p.categoria], p.origem, ...(p.notas || [])];
  for (const garrafa of p.garrafas || []) texto.push(garrafa.marca, garrafa.nome);
  const palavras = normalizar(texto.join(' ')).split(/[^a-z0-9]+/);
  const termos = normalizar(busca)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  return termos.every((termo) => palavras.some((palavra) => palavra.startsWith(termo)));
};

function posicao_lacre(p) {
  const [largura, altura] = p.tamanho;
  const lacre = p.lacre || { y: 0.15 };
  const largura_tira = lacre.largura || 0.145;
  const altura_tira = largura_tira * (largura / altura) * (gargalo.altura / gargalo.largura);
  return {
    x: lacre.x || 0.5,
    y: lacre.y,
    largura_tira,
    altura_tira,
    topo: lacre.y - (altura_tira * gargalo.juncao) / gargalo.altura,
    nfc: lacre.y + (altura_tira * (gargalo.nfc - gargalo.juncao)) / gargalo.altura
  };
}

function foto(p, opcoes = {}) {
  const posicao = posicao_lacre(p);
  const lacre = `<svg class="pointer-events-none absolute -translate-x-1/2 overflow-visible drop-shadow-[0_.6px_1px_rgba(0,0,0,.45)] ${opcoes.classe_lacre || ''}" viewBox="0 0 40 110" preserveAspectRatio="none" aria-hidden="true" focusable="false" style="left:${porcentagem(posicao.x)};top:${porcentagem(posicao.topo)};width:${porcentagem(posicao.largura_tira)};height:${porcentagem(posicao.altura_tira)}"><use href="#vs-neck${opcoes.rompido ? '-torn' : ''}"/></svg>`;
  return `<span class="relative block aspect-[var(--proporcao)] shrink-0 ${opcoes.classes || 'h-full'}" style="--proporcao:${p.tamanho[0]} / ${p.tamanho[1]}"><img class="block size-full object-contain select-none [-webkit-user-drag:none]" src="${escapar_html(p.foto)}" alt="${escapar_html(opcoes.alt || '')}" width="${p.tamanho[0]}" height="${p.tamanho[1]}" loading="${opcoes.imediato ? 'eager' : 'lazy'}" decoding="async" draggable="false">${lacre}</span>`;
}

function imagem_produto(p, opcoes = {}) {
  if (!eh_kit(p)) return foto(p, opcoes);
  const tamanho = (k) =>
    k === 1 ? 'z-[1] -mx-[5%] h-full' : p.garrafas.length === 2 ? '-mr-[3%] -ml-[5%] h-[96%]' : '-mx-[5%] h-[88%]';
  const garrafas = p.garrafas.map((garrafa, k) => foto(garrafa, { ...opcoes, classes: tamanho(k) })).join('');
  return `<span class="flex items-end justify-center ${opcoes.classes || 'size-full'}">${garrafas}</span>`;
}
const selo_html = (p) => {
  const classes = 'absolute top-[9px] left-[9px] z-[2] rounded-[7px] px-2 py-[3px] text-[11px] font-bold';
  return eh_kit(p)
    ? `<span class="${classes} bg-oferta text-white">-${percentual_desconto(p)}% no kit</span>`
    : p.preco_antigo
      ? `<span class="${classes} bg-oferta text-white">-${percentual_desconto(p)}%</span>`
      : p.selo
        ? `<span class="${classes} bg-white text-selo shadow-cartao">${escapar_html(p.selo)}</span>`
        : '';
};
const preco_html = (p) => `<div class="flex min-w-0 flex-col leading-[1.25]">
      ${p.preco_antigo ? `<s class="text-[12px] text-tinta-3">${reais(p.preco_antigo)}</s>` : ''}
      <span class="text-[18px] font-extrabold tracking-[-.02em] max-celular:text-[16px]">${reais(p.preco)}</span>
      <span class="text-[12px] font-semibold text-ok max-celular:text-[11px]">${reais(preco_pix(p.preco))} no Pix</span>
    </div>`;

const sacola = new Map(Object.entries(armazenamento.ler('sacola', {})).filter(([id, q]) => por_id[id] && q > 0));
function controle_conteudo(id) {
  const quantidade = sacola.get(id) || 0;
  const nome = escapar_html(nome_completo(por_id[id]));
  if (!quantidade)
    return `<button class="grid size-10 place-items-center rounded-xl bg-destaque text-white shadow-[0_6px_14px_rgba(0,106,168,.3)] transition-[background-color,scale] duration-200 hover:bg-destaque-escuro active:scale-90 max-celular:size-9" type="button" data-adicionar="${id}" aria-label="Adicionar ${nome} à sacola">${icone('mais', 'size-5')}</button>`;
  const botao =
    'grid h-10 w-8 place-items-center rounded-xl text-white hover:bg-white/14 max-celular:h-9 max-celular:w-7';
  return `<div class="inline-flex h-10 animate-[quantidade-entrar_.35s_var(--ease-mola)] items-center rounded-xl bg-destaque text-white shadow-[0_6px_14px_rgba(0,106,168,.3)] max-celular:h-9" role="group" aria-label="${nome} na sacola">
      <button class="${botao}" type="button" data-menos="${id}" aria-label="Remover uma unidade">${icone(quantidade === 1 ? 'fechar' : 'menos', 'size-4')}</button>
      <span class="min-w-4 text-center text-[15px] font-extrabold" aria-live="polite">${quantidade}</span>
      <button class="${botao}" type="button" data-mais="${id}" aria-label="Adicionar uma unidade">${icone('mais', 'size-4')}</button>
    </div>`;
}
const controle_html = (id) =>
  `<div class="relative z-[2] shrink-0" data-controle="${id}">${controle_conteudo(id)}</div>`;
const atualizar_controles = (id) => {
  for (const caixa of achar_todos(`[data-controle="${id}"]`)) caixa.innerHTML = controle_conteudo(id);
};

function cartao_html(p, i = 0) {
  const kit = eh_kit(p);
  const marcas_kit = () =>
    grupos_kit(p)
      .map(([garrafa, contagem]) => (contagem > 1 ? contagem + '× ' : '') + garrafa.marca)
      .join(' · ');
  const subtitulo = kit ? marcas_kit() : `${p.volume} · ${teor_texto(p)}`;
  return `<article class="group/cartao relative flex min-w-0 animate-[cartao-entrar_.5s_var(--ease-suave)_calc(var(--icone,0)*26ms)_both] cursor-pointer flex-col rounded-[18px] border border-fundo-2 bg-white px-2 pt-2 pb-3.5 transition-[box-shadow,translate,border-color] duration-300 ease-suave hover:-translate-y-0.5 hover:border-transparent hover:shadow-elevado max-celular:rounded-2xl max-celular:px-1.5 max-celular:pt-1.5 max-celular:pb-3" data-cartao style="--icone:${Math.min(i, 12)}">
      <div class="relative h-[232px] overflow-hidden rounded-[13px] ${fundo_foto} px-2.5 pt-[30px] pb-3 max-celular:h-[190px] max-celular:px-1.5 max-celular:pb-2.5">
        ${selo_html(p)}
        <span class="${selo_lacre}">${simbolo_vs(selo_lacre_marca, true)}${kit ? p.garrafas.length + ' lacres' : 'Lacrado'}</span>
        <div class="flex h-full items-end justify-center transition-transform duration-[450ms] ease-suave group-hover/cartao:-translate-y-1 group-hover/cartao:scale-[1.035]">${imagem_produto(p)}</div>
      </div>
      <div class="flex flex-1 flex-col px-1.5 pt-3 max-celular:px-1 max-celular:pt-2.5">
        <p class="text-[12px] font-semibold tracking-[.04em] text-tinta-2 uppercase">${escapar_html(kit ? `Kit · ${p.garrafas.length} garrafas` : p.marca)}</p>
        <h3 class="mt-0.5 text-[16px] leading-[1.22] font-bold tracking-[-.02em] max-celular:text-[15px]"><button type="button" class="text-left tracking-[inherit] hover:text-destaque" data-abrir="${p.id}">${escapar_html(p.nome)}</button></h3>
        <p class="mt-[3px] text-[13px] text-tinta-2">${escapar_html(subtitulo)}</p>
        <div class="mt-auto flex items-end justify-between gap-2 pt-2.5">${preco_html(p)}${controle_html(p.id)}</div>
      </div>
    </article>`;
}

const camadas = [];
const corpo = document.body;
const camada_aberta = (id) => camadas.some((camada) => camada.elemento.id === id);

function abrir_camada(elemento, alvo_foco) {
  if (camadas.some((camada) => camada.elemento === elemento)) return;
  elemento.hidden = false;
  elemento.classList.remove('fechando');
  camadas.push({ elemento, foco_anterior: document.activeElement });
  corpo.classList.add('travado');
  requestAnimationFrame(() => {
    const alvo =
      alvo_foco ||
      elemento.querySelector('[data-foco]') ||
      elemento.querySelector('input:not([type=hidden]), select, textarea, button:not([data-fechar]), a[href]') ||
      elemento.querySelector('button');
    if (alvo) alvo.focus({ preventScroll: true });
  });
  atualizar_barra();
}

function fechar_camada(elemento, { devolver_foco = true } = {}) {
  const indice = camadas.findIndex((camada) => camada.elemento === elemento);
  if (indice < 0) return;
  const [{ foco_anterior }] = camadas.splice(indice, 1);
  elemento.classList.add('fechando');
  setTimeout(
    () => {
      if (camadas.some((camada) => camada.elemento === elemento)) return;
      elemento.hidden = true;
      elemento.classList.remove('fechando');
    },
    menos_movimento ? 0 : 230
  );
  if (!camadas.length) corpo.classList.remove('travado');
  if (devolver_foco && foco_anterior && document.contains(foco_anterior)) foco_anterior.focus({ preventScroll: true });
  if (elemento.id === 'janela-compra') limpar_temporizadores();
  atualizar_barra();
}

function iniciar_camadas() {
  document.addEventListener('click', (e) => {
    const camada = e.target.closest('[data-fechar]')?.closest('[data-camada]');
    if (camada) fechar_camada(camada);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || !camadas.length) return;
    const focaveis = achar_todos(
      'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
      camadas.at(-1).elemento
    ).filter((elemento) => elemento.offsetParent !== null);
    if (!focaveis.length) return;
    const primeiro = focaveis[0];
    const ultimo = focaveis.at(-1);
    if (e.shiftKey && document.activeElement === primeiro) {
      ultimo.focus();
      e.preventDefault();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      primeiro.focus();
      e.preventDefault();
    }
  });
}

const caixa_aviso = achar('#aviso');
let tempo_aviso = 0;

function esconder_aviso() {
  caixa_aviso.classList.add('sumindo');
  setTimeout(() => {
    caixa_aviso.hidden = true;
    caixa_aviso.classList.remove('sumindo');
  }, 220);
}

function aviso(mensagem, acao, ao_clicar) {
  const botao = acao
    ? `<button class="rounded-full bg-white/16 px-3.5 py-[7px] text-[13px] font-bold whitespace-nowrap text-white hover:bg-white/26" type="button">${escapar_html(acao)}</button>`
    : '';
  caixa_aviso.innerHTML = `<span class="min-w-0">${escapar_html(mensagem)}</span>${botao}`;
  caixa_aviso.classList.remove('sumindo');
  caixa_aviso.hidden = false;
  if (acao) {
    caixa_aviso.querySelector('button').addEventListener('click', () => {
      esconder_aviso();
      ao_clicar();
    });
  }
  clearTimeout(tempo_aviso);
  tempo_aviso = setTimeout(esconder_aviso, 3800);
}

function iniciar_revelar() {
  const observador = new IntersectionObserver(
    (entradas) => {
      for (const entrada of entradas) {
        if (!entrada.isIntersecting) continue;
        entrada.target.classList.add('revelado');
        observador.unobserve(entrada.target);
      }
    },
    { rootMargin: '0px 0px -6% 0px', threshold: 0.06 }
  );
  for (const elemento of achar_todos('.revelar')) {
    const irmaos = [...elemento.parentElement.children].filter((irmao) => irmao.classList.contains('revelar'));
    elemento.style.setProperty('--atraso-revelar', (Math.min(irmaos.indexOf(elemento), 6) * 0.06).toFixed(2) + 's');
    observador.observe(elemento);
  }
}

function iniciar_idade() {
  const bloqueio = achar('#idade');
  if (armazenamento.ler('idade', false)) return;
  bloqueio.hidden = false;
  corpo.classList.add('travado');
  requestAnimationFrame(() => achar('#idade-sim').focus());
  achar('#idade-sim').addEventListener('click', () => {
    armazenamento.gravar('idade', true);
    bloqueio.classList.add('saindo');
    setTimeout(
      () => {
        bloqueio.hidden = true;
        if (!camadas.length) corpo.classList.remove('travado');
      },
      menos_movimento ? 0 : 320
    );
  });
  achar('#idade-nao').addEventListener('click', () => {
    achar('#idade-pergunta').hidden = true;
    achar('#idade-negada').hidden = false;
  });
}

let endereco = armazenamento.ler('endereco', null);
const so_digitos = (texto) => String(texto).replace(/\D/g, '');
const formatar_cep = (texto) => {
  const digitos = so_digitos(texto).slice(0, 8);
  return digitos.length > 5 ? digitos.slice(0, 5) + '-' + digitos.slice(5) : digitos;
};
const prazo_para = (cep) => {
  let mistura = 0;
  for (const digito of so_digitos(cep)) mistura = (mistura * 31 + +digito) % 997;
  const minimo = 25 + (mistura % 4) * 5;
  return [minimo, minimo + 15];
};
const prazo_texto = (lugar) => `${lugar.prazo[0]}–${lugar.prazo[1]} min`;
const chegada = (lugar) => hora(new Date(Date.now() + lugar.prazo[1] * 60000));
const nome_lugar = (lugar) => lugar.bairro || lugar.cidade || lugar.cep;
const cidade_uf = (lugar) => (lugar.cidade ? lugar.cidade + (lugar.uf ? '/' + lugar.uf : '') : '');

async function consultar_cep(valor) {
  const digitos = so_digitos(valor);
  if (digitos.length !== 8) return { erro: 'Digite os 8 números do CEP.' };
  if (/^(\d)\1{7}$/.test(digitos)) return { erro: 'CEP inválido. Confira os números.' };
  const lugar = { cep: formatar_cep(digitos), rua: '', bairro: '', cidade: '', uf: '', prazo: prazo_para(digitos) };
  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${digitos}/json/`, { signal: AbortSignal.timeout(4500) });
    const dados = await resposta.json();
    if (dados.erro) return { erro: 'Não encontramos esse CEP. Confira os números.' };
    return {
      ...lugar,
      rua: dados.logradouro || '',
      bairro: dados.bairro || '',
      cidade: dados.localidade || '',
      uf: dados.uf || ''
    };
  } catch {
    return lugar;
  }
}

const mensagem_entrega = (lugar) => {
  const onde = [lugar.bairro, cidade_uf(lugar)].filter(Boolean).join(', ');
  return `Entregamos${onde ? ' em ' + onde : ' no seu CEP'}: chega em ${prazo_texto(lugar)} (até ${chegada(lugar)}).`;
};

function definir_endereco(lugar) {
  endereco = lugar;
  armazenamento.gravar('endereco', lugar);
  atualizar_endereco();
}
function atualizar_endereco() {
  achar('#local-texto').innerHTML = endereco
    ? `<span>${escapar_html(nome_lugar(endereco))}</span><span class="max-celular:hidden"> · ${prazo_texto(endereco)}</span>`
    : `<span class="max-celular:hidden">Informe seu CEP</span><span class="hidden max-celular:inline">Seu CEP</span>`;
  achar('#botao-local').classList.toggle('com-cep', !!endereco);
  achar('#botao-local').setAttribute(
    'aria-label',
    endereco
      ? `Entrega em ${nome_lugar(endereco)}, ${prazo_texto(endereco)}. Alterar endereço`
      : 'Informar CEP de entrega'
  );
  achar('#prazo-entrega').textContent = endereco ? prazo_texto(endereco) : '30–60 min';
  const info = achar('#topo-cep-info');
  if (endereco) {
    info.textContent = mensagem_entrega(endereco);
    definir_estado(info, 'ok');
    achar('#topo-cep').value = endereco.cep;
  }
  if (camada_aberta('gaveta-sacola')) mostrar_sacola();
}

function mascara_cep(entrada) {
  entrada.addEventListener('input', () => {
    entrada.value = formatar_cep(entrada.value);
    entrada.classList.remove('invalido');
  });
}

async function enviar_cep(entrada, info) {
  definir_estado(info, '');
  info.textContent = 'Consultando o CEP…';
  const resultado = await consultar_cep(entrada.value);
  if (resultado.erro) {
    info.textContent = resultado.erro;
    definir_estado(info, 'erro');
    entrada.classList.add('invalido');
    entrada.focus();
    return null;
  }
  definir_endereco(resultado);
  info.textContent = mensagem_entrega(resultado);
  definir_estado(info, 'ok');
  return resultado;
}

function iniciar_cep() {
  const campo_topo = achar('#topo-cep');
  const campo_endereco = achar('#endereco-cep');
  mascara_cep(campo_topo);
  mascara_cep(campo_endereco);
  achar('#topo-cep-form').addEventListener('submit', (e) => {
    e.preventDefault();
    enviar_cep(campo_topo, achar('#topo-cep-info'));
  });
  achar('#endereco-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const resultado = await enviar_cep(campo_endereco, achar('#endereco-info'));
    if (resultado) setTimeout(() => fechar_camada(achar('#janela-endereco')), 1100);
  });
  atualizar_endereco();
}

function abrir_endereco() {
  const entrada = achar('#endereco-cep');
  const info = achar('#endereco-info');
  entrada.value = endereco ? endereco.cep : '';
  info.textContent = endereco ? mensagem_entrega(endereco) : '';
  definir_estado(info, endereco ? 'ok' : '');
  abrir_camada(achar('#janela-endereco'), entrada);
}

const caixa_busca = achar('#busca');
const campo_busca = achar('#busca-campo');
const painel_busca = achar('#busca-painel');
const resultados_busca = achar('#busca-resultados');
const rotulo_busca = achar('#busca-rotulo');
const termos_populares = ['Black Label', 'Tanqueray', 'Absolut', "Jack Daniel's", 'Gin', 'Kits'];

function alternar_busca(aberto) {
  if (painel_busca.hidden === !aberto) return;
  painel_busca.hidden = !aberto;
  corpo.classList.toggle('menu-aberto', aberto);
  if (aberto) mostrar_busca(campo_busca.value);
}

const popular_html = (termo) =>
  `<button type="button" class="inline-flex items-center gap-1.5 rounded-full border border-linha bg-white px-3 py-[7px] text-[14px] font-medium hover:border-tinta-3" data-termo="${escapar_html(termo)}">${icone('busca', 'size-3.5 text-tinta-3')}${escapar_html(termo)}</button>`;

const resultado_html = (
  p
) => `<li><button type="button" class="flex w-full items-center gap-3 rounded-xl p-2 text-left text-tinta hover:bg-fundo focus-visible:bg-fundo" data-abrir="${p.id}">
    <span class="flex h-[54px] w-11 shrink-0 items-end justify-center rounded-[10px] bg-bloco px-0.5 py-1">${imagem_produto(p, { classes: eh_kit(p) ? 'h-full w-11' : '' })}</span>
    <span class="flex min-w-0 flex-1 flex-col"><b class="truncate text-[14px] font-semibold">${escapar_html(nome_completo(p))}</b><small class="text-[12px] text-tinta-2">${escapar_html(eh_kit(p) ? kit_resumo(p) : `${p.volume} · lacre VeriSeal`)}</small></span>
    <span class="text-[14px] font-bold whitespace-nowrap">${reais(p.preco)}</span></button></li>`;

function mostrar_busca(texto) {
  const busca = texto.trim();
  if (!busca) {
    rotulo_busca.textContent = 'Mais buscados';
    resultados_busca.innerHTML = `<li class="flex flex-wrap gap-2 px-1.5 pb-1.5">${termos_populares.map(popular_html).join('')}</li>`;
    return;
  }
  const resultados = produtos.filter((p) => combina(p, busca));
  const contagem = resultados.length;
  rotulo_busca.textContent = contagem
    ? `${contagem} ${contagem === 1 ? 'resultado' : 'resultados'}`
    : `Nenhum resultado para “${busca}”`;
  const ver_todos =
    contagem > 6
      ? `<li><button type="button" class="flex w-full items-center gap-3 rounded-xl p-2 text-left text-[14px] font-semibold text-destaque hover:bg-fundo" data-buscar="${escapar_html(busca)}">${icone('busca', 'size-4')}Ver os ${contagem} resultados</button></li>`
      : '';
  resultados_busca.innerHTML = resultados.slice(0, 6).map(resultado_html).join('') + ver_todos;
}

function buscar_tudo(busca) {
  alternar_busca(false);
  campo_busca.blur();
  definir_filtro({ categoria: 'todas', marca: null, busca: busca });
  achar('#catalogo').scrollIntoView({ behavior: rolagem });
}

function iniciar_busca() {
  campo_busca.addEventListener('focus', () => alternar_busca(true));
  campo_busca.addEventListener('input', () => {
    alternar_busca(true);
    mostrar_busca(campo_busca.value);
  });
  campo_busca.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      buscar_tudo(campo_busca.value.trim());
    }
    const primeiro = achar('button', resultados_busca);
    if (e.key === 'ArrowDown' && primeiro) {
      e.preventDefault();
      primeiro.focus();
    }
  });
  painel_busca.addEventListener('click', (e) => {
    const termo = e.target.closest('[data-termo]');
    if (termo) {
      campo_busca.value = termo.dataset.termo;
      mostrar_busca(termo.dataset.termo);
      campo_busca.focus();
      return;
    }
    const todos = e.target.closest('[data-buscar]');
    if (todos) buscar_tudo(todos.dataset.buscar);
  });
  document.addEventListener('pointerdown', (e) => {
    if (!painel_busca.hidden && !e.target.closest('#busca')) alternar_busca(false);
  });
  caixa_busca.addEventListener('focusout', (e) => {
    if (!e.relatedTarget || !caixa_busca.contains(e.relatedTarget))
      setTimeout(() => {
        if (!caixa_busca.contains(document.activeElement)) alternar_busca(false);
      }, 0);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!painel_busca.hidden) {
      alternar_busca(false);
      campo_busca.focus();
      return;
    }
    if (camadas.length) fechar_camada(camadas.at(-1).elemento);
  });
}

const slides_destaque = [
  {
    id: 'absolut-1l',
    foto: 'assets/fotos/absolut-party.webp',
    alt: 'Garrafa de Absolut Vodka numa mesa de festa, entre um gin tônica e um espresso martini',
    chamada: 'Oferta da semana',
    titulo: 'Sexta pede Absolut.',
    subtitulo: 'Absolut Vodka 1 L, original e lacrada, na sua porta em até 60 minutos.',
    fundo: 'bg-[radial-gradient(ellipse_70%_90%_at_15%_30%,#16336e_0%,#0a1b40_55%,#050d22_100%)]',
    classe_foto:
      'w-[64%] object-[50%_42%] [mask-image:linear-gradient(90deg,transparent_0,#000_30%)] max-celular:object-[50%_36%]',
    sombra:
      'after:bg-[linear-gradient(90deg,rgba(5,13,34,.78)_0%,rgba(5,13,34,.45)_36%,transparent_58%)] max-celular:after:bg-[linear-gradient(180deg,transparent_34%,rgba(5,13,34,.75)_50%,#050d22_62%)]'
  },
  {
    id: 'tanqueray',
    foto: 'assets/fotos/tanqueray-gt.webp',
    alt: 'Garrafa de Tanqueray London Dry ao lado de uma taça de gin tônica com limão',
    chamada: 'Gin tônica perfeito',
    titulo: (p) => `Tanqueray com ${percentual_desconto(p)}% off.`,
    subtitulo: 'O London Dry do gin tônica clássico, com lacre VeriSeal conferido no envio.',
    fundo: 'bg-[radial-gradient(ellipse_60%_90%_at_20%_40%,#0f5a38_0%,#073522_60%,#04231a_100%)]',
    classe_foto:
      'w-[60%] object-[34%_50%] [mask-image:linear-gradient(90deg,transparent_0,#000_26%)] max-celular:object-[30%_40%]',
    sombra:
      'after:bg-[linear-gradient(90deg,rgba(4,35,26,.78)_0%,rgba(4,35,26,.45)_36%,transparent_58%)] max-celular:after:bg-[linear-gradient(180deg,transparent_34%,rgba(4,35,26,.75)_50%,#04231a_62%)]'
  },
  {
    id: 'kit-jack-trio',
    garrafas: ['jack-apple', 'jack-7', 'jack-fire'],
    chamada: 'Kit mais pedido',
    titulo: "Família Jack Daniel's.",
    subtitulo: 'Old No.7, Apple e Fire: três garrafas, três lacres, uma entrega.',
    fundo: 'bg-[radial-gradient(ellipse_46%_70%_at_74%_70%,#8a4512_0%,#44200a_42%,#170a03_100%)]',
    classe_texto: 'max-w-[min(430px,52%)]',
    sombra:
      'after:bg-[linear-gradient(90deg,rgba(23,10,3,.85)_0%,rgba(23,10,3,.5)_38%,transparent_60%)] max-celular:after:bg-[linear-gradient(180deg,transparent_40%,rgba(23,10,3,.85)_64%)]'
  }
];
const paralaxe =
  '[translate:calc(var(--posicao,0)*var(--largura-destaque)*-.42)_0] [scale:calc(1_+_var(--distancia,0)*.07)] will-change-transform';
const sumir_texto =
  '[translate:calc(var(--posicao,0)*var(--largura-destaque)*.14)_0] opacity-[calc(1_-_var(--distancia,0)*1.6)] will-change-[transform,opacity]';
function slide_html(slide, i, contagem) {
  const p = por_id[slide.id];
  const titulo = typeof slide.titulo === 'function' ? slide.titulo(p) : slide.titulo;
  const tamanho_garrafa = (k) =>
    (k === 1 ? 'z-[1] h-full' : 'h-[88%]') + ' -mx-[1.6%] drop-shadow-[0_24px_30px_rgba(0,0,0,.55)]';
  const imagem_destaque = slide.foto
    ? `<img class="absolute inset-0 left-auto h-full object-cover [-webkit-user-drag:none] max-celular:h-[58%] max-celular:w-full max-celular:[mask-image:linear-gradient(180deg,#000_60%,transparent)] ${paralaxe} ${slide.classe_foto}" src="${slide.foto}" alt="${escapar_html(slide.alt)}" fetchpriority="${i ? 'low' : 'high'}" decoding="async" draggable="false">`
    : `<div class="absolute right-[6%] -bottom-[4%] z-[1] flex h-[92%] items-end max-celular:top-[5%] max-celular:right-1/2 max-celular:bottom-auto max-celular:h-[46%] max-celular:[transform:translateX(50%)] ${paralaxe}" aria-hidden="true">${slide.garrafas.map((id, k) => foto(por_id[id], { imediato: true, classes: tamanho_garrafa(k) })).join('')}</div>`;
  return `<article class="relative col-start-1 row-start-1 flex min-w-0 items-center overflow-hidden text-white backface-hidden will-change-transform [transform:translate3d(calc(var(--posicao,0)*100%),0,0)] before:pointer-events-none before:absolute before:inset-0 before:z-[3] before:bg-[#01050d] before:opacity-[calc(var(--distancia,0)*.5)] before:will-change-[opacity] after:pointer-events-none after:absolute after:inset-0 after:z-[1] max-celular:items-end ${slide.fundo} ${slide.sombra}" role="group" aria-roledescription="slide" aria-label="${i + 1} de ${contagem}">
      ${imagem_destaque}
      <div class="relative z-[2] px-12 pb-[54px] max-celular:px-[22px] max-celular:pb-16 ${slide.classe_texto || 'max-w-[min(470px,54%)] max-celular:max-w-none'} ${sumir_texto}">
        <p class="mb-3.5 inline-flex items-center rounded-full bg-white/18 px-[11px] py-[5px] text-[12px] font-bold tracking-[.04em] uppercase">${escapar_html(slide.chamada)}</p>
        <h2 class="text-[clamp(32px,3.8vw,50px)] leading-none font-extrabold tracking-[-.04em] text-balance max-celular:text-[32px]">${escapar_html(titulo)}</h2>
        <p class="mt-3 max-w-[380px] text-[16px] leading-[1.45] text-white/84 max-celular:text-[15px]">${escapar_html(slide.subtitulo)}</p>
        <p class="mt-4 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">${p.preco_antigo ? `<s class="text-[15px] text-white/62">${reais(p.preco_antigo)}</s>` : ''}<b class="text-[32px] leading-none font-extrabold tracking-[-.03em] max-celular:text-[26px]">${reais(p.preco)}</b><span class="text-[14px] font-semibold text-[#8ef5b0]">${reais(preco_pix(p.preco))} no Pix</span></p>
        <div class="mt-5 flex flex-wrap items-center gap-3.5">
          <button class="botao botao-claro" type="button" data-adicionar="${p.id}" aria-label="Adicionar ${escapar_html(nome_completo(p))} à sacola">${icone('mais')}Adicionar</button>
          <button class="inline-flex items-center gap-1 py-2 text-[15px] font-semibold text-white hover:underline" type="button" data-abrir="${p.id}">Ver detalhes ${icone('seta-direita', 'size-4')}</button>
        </div>
      </div>
      <span class="absolute top-[18px] right-[18px] z-[2] inline-flex items-center gap-[7px] rounded-full bg-noite/50 py-1.5 pr-3 pl-[9px] text-[12px] font-bold shadow-[inset_0_0_0_1px_rgba(255,255,255,.18)] backdrop-blur-[10px] max-celular:top-3 max-celular:right-3 max-celular:text-[11px] ${sumir_texto}">${simbolo_vs('w-[22px]', true)}Lacre VeriSeal</span>
    </article>`;
}
function bezier(x1, y1, x2, y2) {
  const curva = (a, b, t) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
  return (x) => {
    let baixo = 0;
    let alto = 1;
    for (let i = 0; i < 20; i++) {
      const meio = (baixo + alto) / 2;
      if (curva(x1, x2, meio) < x) baixo = meio;
      else alto = meio;
    }
    return curva(y1, y2, (baixo + alto) / 2);
  };
}

const ponto_html = (_, i) =>
  `<button class="group grid h-[30px] place-items-center px-2" type="button" data-ponto="${i}" aria-label="Ver destaque ${i + 1}"><i class="relative block size-2 overflow-hidden rounded-[99px] bg-white/45 [transition:width_.5s_var(--ease-suave),background-color_.3s] after:absolute after:inset-0 after:origin-left after:bg-white after:[transform:scaleX(0)] group-hover:bg-white/70 group-aria-[current=true]:w-[30px] group-aria-[current=true]:bg-white/30 group-aria-[current=true]:after:[transform:none] [.automatico_[aria-current=true]_&]:after:animate-[ponto-encher_6.5s_linear_both] [.parado_&]:after:[animation-play-state:paused]"></i></button>`;

function iniciar_destaques() {
  const destaque = achar('#destaques');
  const trilho_slides = achar('#destaques-trilho');
  const caixa_pontos = achar('#destaques-pontos');
  const contagem = slides_destaque.length;
  trilho_slides.innerHTML = slides_destaque.map((slide, i) => slide_html(slide, i, contagem)).join('');
  caixa_pontos.innerHTML = slides_destaque.map(ponto_html).join('');
  const slides = [...trilho_slides.children];
  const pontos = achar_todos('[data-ponto]', caixa_pontos);
  for (const imagem of achar_todos('img', trilho_slides)) imagem.decode().catch(() => {});

  const circular = (distancia) => (((distancia % contagem) + contagem * 1.5) % contagem) - contagem / 2;
  const indice_de = (posicao) => ((posicao % contagem) + contagem) % contagem;
  const curva_auto = bezier(0.65, 0, 0.3, 1);
  const curva_toque = bezier(0.25, 0.8, 0.25, 1);
  const curva_arraste = bezier(0.15, 0.6, 0.3, 1);
  let posicao = 0;
  let destino = 0;
  let atual = -1;
  let quadro_id = 0;

  function pintar() {
    slides.forEach((slide, i) => {
      const deslocamento = circular(i - posicao);
      slide.style.setProperty('--posicao', deslocamento.toFixed(4));
      slide.style.setProperty('--distancia', Math.min(1, Math.abs(deslocamento)).toFixed(4));
    });
  }

  function transicao(duracao, aceleracao) {
    cancelAnimationFrame(quadro_id);
    const de = posicao;
    const para = destino;
    const inicio = performance.now();
    const atualizar = (agora) => {
      const t = Math.min(1, (agora - inicio) / duracao);
      posicao = de + (para - de) * aceleracao(t);
      if (t < 1) {
        quadro_id = requestAnimationFrame(atualizar);
      } else {
        quadro_id = 0;
        posicao = destino = indice_de(destino);
      }
      pintar();
    };
    quadro_id = requestAnimationFrame(atualizar);
  }

  function ir(alvo, como = 'toque', velocidade = 0) {
    destino = alvo;
    definir_atual(indice_de(alvo), como);
    if (menos_movimento) {
      cancelAnimationFrame(quadro_id);
      quadro_id = 0;
      posicao = destino = indice_de(destino);
      pintar();
      return;
    }
    const distancia = Math.abs(destino - posicao);
    if (como === 'auto') transicao(1050, curva_auto);
    else if (como === 'arraste')
      transicao(
        limitar((4 * distancia * destaque.clientWidth) / Math.max(Math.abs(velocidade), 0.001), 260, 650),
        curva_arraste
      );
    else transicao(limitar(560 + distancia * 240, 560, 900), curva_toque);
  }

  const etapa = (variacao, como) => ir(destino + variacao, como);
  const mostrar = (i) => ir(destino + circular(i - indice_de(destino)));

  const motivos = new Set();
  const segurar = (motivo, ligado) => {
    if (ligado) motivos.add(motivo);
    else motivos.delete(motivo);
    destaque.classList.toggle('parado', motivos.size > 0);
  };

  function definir_atual(i, como) {
    trilho_slides.setAttribute('aria-live', como === 'auto' ? 'off' : 'polite');
    if (i !== atual) {
      atual = i;
      pontos.forEach((ponto, k) => ponto.setAttribute('aria-current', String(k === i)));
      slides.forEach((slide, k) => {
        slide.inert = k !== i;
      });
    }
    if (menos_movimento) return;
    destaque.classList.remove('automatico');
    void destaque.offsetWidth;
    destaque.classList.add('automatico');
  }

  let arraste = null;
  let arrastou = false;
  destaque.addEventListener('pointerdown', (e) => {
    if ((e.pointerType === 'mouse' && e.button !== 0) || e.target.closest('[data-destaque-controles]')) return;
    arraste = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      movendo: false,
      inicio: posicao,
      largura: destaque.clientWidth,
      amostras: []
    };
  });
  destaque.addEventListener('pointermove', (e) => {
    if (!arraste || e.pointerId !== arraste.id) return;
    if (!arraste.movendo) {
      const dx = e.clientX - arraste.x;
      const dy = e.clientY - arraste.y;
      if (Math.hypot(dx, dy) < 8) return;
      if (Math.abs(dy) > Math.abs(dx)) {
        arraste = null;
        return;
      }
      arraste.movendo = true;
      arraste.x = e.clientX;
      arraste.inicio = posicao;
      cancelAnimationFrame(quadro_id);
      quadro_id = 0;
      try {
        destaque.setPointerCapture(e.pointerId);
      } catch {}
      destaque.classList.add('arrastando');
      segurar('arraste', true);
    }
    posicao = arraste.inicio - (e.clientX - arraste.x) / arraste.largura;
    pintar();
    arraste.amostras.push([e.timeStamp, e.clientX]);
    if (arraste.amostras.length > 6) arraste.amostras.shift();
  });

  function soltar(e) {
    if (!arraste || e.pointerId !== arraste.id) return;
    const terminado = arraste;
    arraste = null;
    if (!terminado.movendo) return;
    destaque.classList.remove('arrastando');
    segurar('arraste', false);
    arrastou = true;
    setTimeout(() => {
      arrastou = false;
    }, 60);
    const recentes = terminado.amostras.filter(([tempo]) => e.timeStamp - tempo < 100);
    const [primeiro, ultimo] = [recentes[0], recentes.at(-1)];
    const velocidade = recentes.length > 1 ? (ultimo[1] - primeiro[1]) / Math.max(1, ultimo[0] - primeiro[0]) : 0;
    const seguinte = velocidade < 0 ? Math.floor(posicao) + 1 : Math.ceil(posicao) - 1;
    ir(Math.abs(velocidade) > 0.25 ? seguinte : Math.round(posicao), 'arraste', velocidade);
  }

  destaque.addEventListener('pointerup', soltar);
  destaque.addEventListener('pointercancel', soltar);
  destaque.addEventListener(
    'click',
    (e) => {
      if (!arrastou) return;
      e.preventDefault();
      e.stopPropagation();
    },
    true
  );
  destaque.addEventListener('dragstart', (e) => e.preventDefault());

  for (const botao of achar_todos('[data-destaque]', destaque)) {
    botao.addEventListener('click', () => etapa(+botao.dataset.destaque));
  }
  caixa_pontos.addEventListener('click', (e) => {
    const ponto = e.target.closest('[data-ponto]');
    if (ponto) mostrar(+ponto.dataset.ponto);
  });
  caixa_pontos.addEventListener('animationend', (e) => {
    if (e.animationName === 'ponto-encher') etapa(1, 'auto');
  });
  destaque.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    etapa(e.key === 'ArrowRight' ? 1 : -1);
  });

  destaque.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'mouse') segurar('cursor', true);
  });
  destaque.addEventListener('pointerleave', (e) => {
    if (e.pointerType === 'mouse') segurar('cursor', false);
  });
  destaque.addEventListener('focusin', (e) => {
    if (e.target.matches(':focus-visible')) segurar('foco', true);
  });
  destaque.addEventListener('focusout', (e) => {
    if (!destaque.contains(e.relatedTarget)) segurar('foco', false);
  });
  new IntersectionObserver((entradas) => segurar('tela', !entradas.at(-1).isIntersecting)).observe(destaque);
  document.addEventListener('visibilitychange', () => segurar('aba', document.hidden));
  new ResizeObserver(() => destaque.style.setProperty('--largura-destaque', destaque.clientWidth + 'px')).observe(
    destaque
  );

  pintar();
  definir_atual(0, 'auto');
}

const demo_id = 'jack-7';
const topo_id = 'tanqueray';

const cores_apps = [
  ['#9ad7ff', '#2f8cff'],
  ['#7ee7c7', '#2bb67d'],
  ['#ffb86b', '#ff6b6b'],
  ['#ffe58a', '#f4b400'],
  ['#b7a6ff', '#6c5ce7'],
  ['#ff9ac4', '#e84393'],
  ['#c4f08a', '#62b33a'],
  ['#e6e9ef', '#aab3c2']
];
function iniciar_cartao_topo() {
  const p = por_id[topo_id];
  const lacre = posicao_lacre(p);
  const palco = achar('#topo-palco');
  const anel = (animacao) =>
    `<i class="absolute -top-10 -left-10 size-20 rounded-full border-2 border-ciano opacity-0 ${animacao}"></i>`;
  const tela = 'absolute inset-0 flex flex-col items-center text-center opacity-0';
  palco.innerHTML = `
      <div class="absolute -top-[2%] left-[2%] h-[64%] w-[76%] bg-[radial-gradient(closest-side,rgba(95,208,255,.5),rgba(3,173,249,.16)_58%,transparent)] blur-[8px]"></div>
      <div class="absolute top-[calc(31%_-_var(--nfc)*var(--altura-garrafa))] left-[14%] aspect-[var(--proporcao)] h-(--altura-garrafa) drop-shadow-[0_30px_40px_rgba(0,0,0,.5)] [--altura-garrafa:560px] max-tablet:left-[24%] max-celular:left-[9%] max-celular:[--altura-garrafa:520px]" style="--nfc:${lacre.nfc.toFixed(4)};--proporcao:${p.tamanho[0]} / ${p.tamanho[1]}">${foto(p, { imediato: true, classe_lacre: 'animate-[topo-brilho_7s_var(--ease-suave)_infinite]' })}
        <span class="absolute top-[calc(var(--nfc)*100%)] left-1/2 size-0 animate-[topo-leitura_7s_linear_infinite]">${anel('animate-[anel_1.2s_var(--ease-suave)_infinite]')}${anel('animate-[anel_1.2s_var(--ease-suave)_.4s_infinite]')}${anel('animate-[anel_1.2s_var(--ease-suave)_.8s_infinite]')}</span>
        <span class="absolute top-[calc(var(--nfc)*100%_+_44px)] -left-[6%] z-[2] inline-flex animate-[topo-ok_7s_var(--ease-suave)_infinite] items-center gap-1.5 rounded-full bg-white py-[7px] pr-3 pl-2 text-[12px] font-bold whitespace-nowrap text-ok opacity-0 shadow-[0_12px_28px_rgba(0,0,0,.35)] motion-reduce:opacity-100! motion-reduce:[transform:none]! max-celular:hidden"><span class="rounded-full bg-ok-forte p-0.5 text-white">${icone('certo', 'size-[15px]')}</span>Original · lacre íntegro</span>
      </div>
      <div class="absolute top-[calc(31%_-_104px)] right-[26px] h-[210px] w-[104px] animate-[topo-celular_7s_var(--ease-suave)_infinite] rounded-[22px] bg-[linear-gradient(145deg,#2b313b,#0b0e13_40%,#1f242c)] p-[5px] shadow-[inset_0_0_0_1.5px_rgba(255,255,255,.14),0_26px_40px_-18px_rgba(0,0,0,.7)] max-tablet:right-[22%] max-celular:right-[22px]"><div class="relative h-full overflow-hidden rounded-[17px] bg-[#f5f8fc] text-grafite before:absolute before:top-1.5 before:left-1/2 before:z-[2] before:h-[9px] before:w-[34%] before:-translate-x-1/2 before:rounded-[9px] before:bg-[#05070a]">
        <span class="${tela} animate-[topo-inicio_7s_var(--ease-suave)_infinite] bg-[radial-gradient(120%_70%_at_20%_0%,#2f6fd0,transparent_60%),linear-gradient(160deg,#0b2a66,#041330_70%)] pt-[30px] text-white motion-reduce:opacity-0!"><b class="text-[24px] leading-none font-semibold tracking-[-.03em]">${hora(new Date())}</b><span class="mt-4 grid grid-cols-[repeat(4,15px)] gap-[7px]">${cores_apps.map(([a, b]) => `<i class="size-[15px] rounded-[4px]" style="background:linear-gradient(135deg,${a},${b})"></i>`).join('')}</span></span>
        <span class="${tela} animate-[topo-web_7s_var(--ease-suave)_infinite] gap-[3px] bg-[#f5f8fc] bg-[radial-gradient(90px_70px_at_50%_38%,rgba(20,166,74,.14),transparent_70%)] pt-10 motion-reduce:opacity-100! motion-reduce:[transform:none]!"><span class="absolute inset-x-[7px] top-[19px] flex h-[13px] items-center justify-center gap-[3px] rounded-[5px] bg-[#e6ebf2] text-[7px] font-semibold text-[#3a4250]">${icone('cadeado', 'size-[7px]')}${escapar_html(dominio)}</span>${medalha('ok', 'repetir', '50px', 'mt-2.5 mb-2')}<b class="text-[14px] leading-[1.1] font-extrabold tracking-[-.02em] text-[#0f8a3c]">Autêntico</b><small class="text-[9.5px] text-tinta-2">Nunca aberta</small></span>
      </div></div>`;
  const pausar_fora_da_tela = (entradas) => palco.classList.toggle('pausado', !entradas.at(-1).isIntersecting);
  new IntersectionObserver(pausar_fora_da_tela).observe(palco);
}

function iniciar_categorias() {
  const foto_bloco =
    'items-start justify-center bg-[radial-gradient(ellipse_60%_30%_at_50%_100%,rgba(0,0,0,.08),transparent_70%)] bg-(--tom)';
  const elevar =
    'mt-[12%] h-[150%] transition-transform duration-[450ms] ease-suave group-hover/categoria:-translate-y-1.5 group-hover/categoria:-rotate-4';
  const blocos = [
    {
      ir: 'ofertas',
      nome: 'Ofertas',
      classes: 'flex-col items-center justify-center gap-0.5 bg-[linear-gradient(150deg,#ff5a4e,#d6191f)] text-white',
      html: `<span>${icone('etiqueta', 'inline-block size-[34px] align-baseline')}</span><span class="text-[20px] font-extrabold tracking-[-.03em]">-${Math.max(...produtos.map(percentual_desconto))}%</span>`
    },
    ...categorias.map((categoria) => {
      const p = por_id[categoria.icone];
      return {
        ir: categoria.id,
        nome: categoria.nome,
        classes: foto_bloco,
        tom: categoria.tom,
        html: imagem_produto(p, { classes: (eh_kit(p) ? 'w-[130%] ' : '') + elevar })
      };
    }),
    {
      ir: 'verificar',
      nome: 'Verificar lacre',
      classes:
        'flex-col items-center justify-center gap-1.5 bg-[radial-gradient(ellipse_at_70%_20%,#0c4a99,var(--color-marinho)_50%,var(--color-noite))] text-ciano',
      html: `<span>${icone('aproximacao', 'inline-block size-[38px] align-baseline')}</span>${simbolo_vs('w-[34px]', true)}`
    }
  ];
  achar('#categorias').innerHTML = blocos
    .map(
      (t) => `<button class="group/categoria flex min-w-0 flex-col items-center gap-2" type="button" data-ir="${t.ir}">
        <span class="relative flex aspect-square w-full overflow-hidden rounded-[22px] transition-[translate,box-shadow] duration-[350ms] ease-suave group-hover/categoria:-translate-y-[3px] group-hover/categoria:shadow-elevado max-celular:rounded-[18px] ${t.classes}"${t.tom ? ` style="--tom:${t.tom}"` : ''}>${t.html}</span><span class="text-[14px] font-bold tracking-[-.01em] group-hover/categoria:text-destaque max-celular:text-[13px]">${escapar_html(t.nome)}</span></button>`
    )
    .join('');
  achar('#categorias').addEventListener('click', (e) => {
    const bloco = e.target.closest('[data-ir]');
    if (!bloco) return;
    const alvo = bloco.dataset.ir;
    if (alvo === 'ofertas' || alvo === 'verificar') {
      achar('#' + alvo).scrollIntoView({ behavior: rolagem });
      return;
    }
    definir_filtro({ categoria: alvo, marca: null, busca: '' });
    achar('#catalogo').scrollIntoView({ behavior: rolagem });
  });
}

function iniciar_trilhos() {
  achar('#trilho-ofertas').innerHTML = produtos
    .filter((p) => p.preco_antigo && !eh_kit(p))
    .ordem((a, b) => percentual_desconto(b) - percentual_desconto(a))
    .map(cartao_html)
    .join('');
  achar('#trilho-pedidos').innerHTML = produtos
    .filter((p) => p.destaque)
    .map(cartao_html)
    .join('');

  const atualizar_setas = (trilho) => {
    const [anterior, proximo] = achar_todos(`[data-trilho="${trilho.id}"]`);
    anterior.disabled = trilho.scrollLeft <= 2;
    proximo.disabled = trilho.scrollLeft >= trilho.scrollWidth - trilho.clientWidth - 2;
  };
  for (const botao of achar_todos('[data-trilho]')) {
    botao.addEventListener('click', () => {
      const trilho = achar('#' + botao.dataset.trilho);
      const largura_cartao = trilho.firstElementChild.offsetWidth + 16;
      trilho.scrollBy({ left: +botao.dataset.direcao * largura_cartao * 2, behavior: rolagem });
    });
  }
  for (const trilho of achar_todos('#trilho-ofertas, #trilho-pedidos')) {
    trilho.addEventListener('scroll', () => atualizar_setas(trilho), { passive: true });
    addEventListener('resize', () => atualizar_setas(trilho));
    atualizar_setas(trilho);
  }

  const agora = new Date();
  const fim = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + ((7 - agora.getDay()) % 7), 23, 59, 59);
  if (fim <= agora) fim.setDate(fim.getDate() + 7);
  const digitos = Object.fromEntries(
    achar_todos('[data-unidade]').map((elemento) => [elemento.dataset.unidade, elemento])
  );
  const zeros = (numero) => String(numero).padStart(2, '0');
  const atualizar = () => {
    const segundos = Math.max(0, Math.floor((fim - Date.now()) / 1000));
    digitos.d.textContent = Math.floor(segundos / 86400);
    digitos.h.textContent = zeros(Math.floor((segundos % 86400) / 3600));
    digitos.m.textContent = zeros(Math.floor((segundos % 3600) / 60));
    digitos.s.textContent = zeros(segundos % 60);
  };
  atualizar();
  setInterval(atualizar, 1000);
}

const kit_lista_html = (p) =>
  grupos_kit(p)
    .map(
      ([garrafa, contagem]) =>
        `<li class="flex justify-between gap-2.5 border-b border-fundo-2 pb-1 text-[13px]"><span>${contagem > 1 ? contagem + '× ' : ''}${escapar_html(garrafa.marca)} ${escapar_html(garrafa.nome)}</span><small class="text-[length:smaller] whitespace-nowrap text-tinta-2">${escapar_html(garrafa.volume)}</small></li>`
    )
    .join('');

const kit_cartao_html = (
  p
) => `<article class="group/cartao relative grid cursor-pointer grid-cols-[minmax(0,.95fr)_minmax(0,1.05fr)] gap-1 overflow-hidden rounded-[20px] border border-fundo-2 bg-white p-2 transition-[box-shadow,translate,border-color] duration-300 ease-suave hover:-translate-y-0.5 hover:border-transparent hover:shadow-elevado max-celular:grid-cols-[1fr_1.1fr] max-mini:grid-cols-1" data-cartao>
    <div class="relative h-[250px] overflow-hidden rounded-[14px] bg-[radial-gradient(ellipse_60%_9%_at_50%_93%,rgba(4,37,85,.2),transparent_72%),linear-gradient(180deg,#f6f8fb,#e9eef5)] px-2 pt-[34px] pb-3 max-celular:h-[220px]">${selo_html(p)}<span class="${selo_lacre}">${simbolo_vs(selo_lacre_marca, true)}${p.garrafas.length} lacres</span><div class="flex h-full items-end justify-center transition-transform duration-[450ms] ease-suave group-hover/cartao:-translate-y-1 group-hover/cartao:scale-[1.03]">${imagem_produto(p)}</div></div>
    <div class="flex min-w-0 flex-col pt-3 pr-2.5 pb-2 pl-3">
      <p class="text-[12px] font-bold text-selo">${escapar_html(p.selo || 'Kit')}</p>
      <h3 class="mt-0.5 text-[20px] leading-[1.15] font-extrabold tracking-[-.025em] max-celular:text-[18px]"><button type="button" class="text-left tracking-[inherit] hover:text-destaque" data-abrir="${p.id}">${escapar_html(p.nome)}</button></h3>
      <ul class="mt-2.5 grid gap-1">${kit_lista_html(p)}</ul>
      <div class="mt-auto flex items-end justify-between gap-2 pt-2.5">${preco_html(p)}${controle_html(p.id)}</div>
    </div>
  </article>`;

function iniciar_kits() {
  achar('#kits-grade').innerHTML = produtos.filter(eh_kit).map(kit_cartao_html).join('');
  const kit = por_id['kit-tanqueray-3'];
  achar('#kit-banner-botao').textContent = `Kit Tanqueray 3 garrafas · ${reais(kit.preco)}`;
}

const filtros = { categoria: 'todas', marca: null, busca: '', ordem: 'relevancia' };
const filtro_categorias = achar('#filtro-categorias');
const linha_marcas = achar('#marcas');
const grade_produtos = achar('#produtos-grade');
const busca_catalogo = achar('#busca-catalogo');
const seletor_ordem = achar('#ordenar');

function mostrar_filtros() {
  filtro_categorias.innerHTML = [{ id: 'todas', nome: 'Todas' }, ...categorias]
    .map(
      (c) =>
        `<button class="shrink-0 rounded-full border border-linha bg-white px-4 py-2 text-[14px] font-semibold text-tinta transition-colors duration-200 hover:border-tinta-3 aria-pressed:border-marinho aria-pressed:bg-marinho aria-pressed:text-white" type="button" data-filtro="${c.id}" aria-pressed="${filtros.categoria === c.id}">${escapar_html(c.nome)}</button>`
    )
    .join('');
}
function mostrar_marcas() {
  const marcas =
    filtros.categoria === 'todas' || filtros.categoria === 'kits'
      ? []
      : [...new Set(produtos.filter((p) => p.categoria === filtros.categoria).map((p) => p.marca))];
  linha_marcas.hidden = marcas.length < 2;
  if (linha_marcas.hidden) {
    linha_marcas.innerHTML = '';
    return;
  }
  linha_marcas.innerHTML =
    `<span class="mr-1 text-[14px] text-tinta-2">Marcas:</span>` +
    [null, ...marcas]
      .map(
        (b) =>
          `<button class="border-b-2 border-transparent py-1 text-[14px] font-bold tracking-[-.01em] text-tinta-3 transition-colors duration-200 hover:text-tinta aria-pressed:border-destaque aria-pressed:text-destaque" type="button" data-marca="${escapar_html(b || '')}" aria-pressed="${filtros.marca === b}">${escapar_html(b || 'Todas')}</button>`
      )
      .join('');
}
const ordenadores = {
  'menor-preco': (a, b) => a.preco - b.preco,
  'maior-preco': (a, b) => b.preco - a.preco,
  desconto: (a, b) => percentual_desconto(b) - percentual_desconto(a),
  nome: (a, b) => nome_completo(a).localeCompare(nome_completo(b), 'pt-BR')
};

function listar_produtos() {
  const lista = produtos.filter(
    (p) =>
      (filtros.categoria === 'todas' || p.categoria === filtros.categoria) &&
      (!filtros.marca || p.marca === filtros.marca) &&
      (!filtros.busca || combina(p, filtros.busca))
  );
  const ordenador = ordenadores[filtros.ordem];
  return ordenador ? lista.ordem(ordenador) : lista;
}

function mostrar_catalogo() {
  const lista = listar_produtos();
  const contagem = lista.length;
  grade_produtos.innerHTML = lista.map(cartao_html).join('');
  const onde = filtros.categoria !== 'todas' ? ' em ' + nome_categoria[filtros.categoria] : '';
  const marca = filtros.marca ? ' · ' + filtros.marca : '';
  const busca = filtros.busca ? ` para “${filtros.busca}”` : '';
  achar('#resultado-total').textContent = `${contagem} ${contagem === 1 ? 'item' : 'itens'}${onde}${marca}${busca}`;
  achar('#vazio').hidden = contagem > 0;
}

function definir_filtro(mudanca) {
  if ('categoria' in mudanca && !('marca' in mudanca)) mudanca.marca = null;
  Object.assign(filtros, mudanca);
  if (busca_catalogo.value !== filtros.busca) busca_catalogo.value = filtros.busca;
  mostrar_filtros();
  mostrar_marcas();
  mostrar_catalogo();
}

function iniciar_catalogo() {
  filtro_categorias.addEventListener('click', (e) => {
    const opcao = e.target.closest('[data-filtro]');
    if (opcao) definir_filtro({ categoria: opcao.dataset.filtro });
  });
  linha_marcas.addEventListener('click', (e) => {
    const botao = e.target.closest('[data-marca]');
    if (botao) definir_filtro({ marca: botao.dataset.marca || null });
  });
  let temporizador = 0;
  busca_catalogo.addEventListener('input', () => {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => definir_filtro({ busca: busca_catalogo.value.trim() }), 160);
  });
  seletor_ordem.addEventListener('change', () => definir_filtro({ ordem: seletor_ordem.value }));
  achar('#limpar-filtros').addEventListener('click', () => {
    seletor_ordem.value = 'relevancia';
    definir_filtro({ categoria: 'todas', marca: null, busca: '', ordem: 'relevancia' });
  });
  definir_filtro({});
}

const total_itens = () => [...sacola.values()].reduce((soma, quantidade) => soma + quantidade, 0);
const subtotal_sacola = () => [...sacola].reduce((soma, [id, quantidade]) => soma + por_id[id].preco * quantidade, 0);
const frete_para = (subtotal) => (subtotal >= frete_gratis || subtotal === 0 ? 0 : taxa_frete);
const salvar_sacola = () => armazenamento.gravar('sacola', Object.fromEntries(sacola));

function definir_quantidade(id, quantidade) {
  const valor = limitar(quantidade, 0, max_quantidade);
  if (valor) sacola.set(id, valor);
  else sacola.delete(id);
  salvar_sacola();
  atualizar_controles(id);
  atualizar_sacola();
}

function adicionar_na_sacola(id, quantidade_nova = 1) {
  const antes = sacola.get(id) || 0;
  if (antes + quantidade_nova > max_quantidade) {
    aviso(`Máximo de ${max_quantidade} unidades por item.`);
    return false;
  }
  definir_quantidade(id, antes + quantidade_nova);
  const contador = achar('#sacola-quantidade');
  contador.classList.remove('pular');
  void contador.offsetWidth;
  contador.classList.add('pular');
  aviso(
    `${nome_completo(por_id[id])} na sacola${quantidade_nova > 1 ? ` (${quantidade_nova})` : ''}`,
    'Ver sacola',
    abrir_sacola
  );
  return true;
}

function atualizar_sacola() {
  const contagem = total_itens();
  const total = reais(subtotal_sacola());
  const contador = achar('#sacola-quantidade');
  contador.hidden = !contagem;
  contador.textContent = contagem;
  achar('#sacola-total').textContent = contagem ? total : 'Sacola';
  achar('#botao-sacola').classList.toggle('com-itens', contagem > 0);
  achar('#botao-sacola').setAttribute(
    'aria-label',
    contagem ? `Sacola de compras, ${contagem} ${contagem === 1 ? 'item' : 'itens'}, ${total}` : 'Sacola de compras'
  );
  achar('#barra-sacola-quantidade').textContent = contagem;
  achar('#barra-sacola-total').textContent = total;
  atualizar_barra();
  if (camada_aberta('gaveta-sacola')) mostrar_sacola();
}

function atualizar_barra() {
  const mostrar = total_itens() > 0 && !camadas.length;
  achar('#barra-sacola').hidden = !mostrar;
  corpo.classList.toggle('com-barra', mostrar);
}

function item_sacola_html(p, quantidade) {
  const nome = escapar_html(nome_completo(p));
  const botao = 'grid h-full w-8 place-items-center rounded-[50%] text-[17px] text-destaque disabled:text-linha';
  return `<li class="flex gap-3.5 border-b border-fundo-2 py-4">
      <div class="flex h-[92px] w-[66px] shrink-0 items-end justify-center rounded-xl bg-[linear-gradient(180deg,#f6f8fb,#e9eef5)] px-1 pt-[7px] pb-[5px]">${imagem_produto(p)}</div>
      <div class="min-w-0 flex-1">
        <strong class="block text-[15px] leading-[1.25] tracking-[-.01em]">${escapar_html(eh_kit(p) ? nome_curto(p) : nome_completo(p))}</strong>
        <small class="text-[12px] text-tinta-2">${escapar_html(eh_kit(p) ? kit_resumo(p) : `${p.volume} · lacre VeriSeal`)}</small>
        <div class="mt-2 flex items-center justify-between gap-2">
          <div class="inline-flex h-8 shrink-0 items-center rounded-full border border-linha" role="group" aria-label="Quantidade">
            <button class="${botao}" type="button" data-menos="${p.id}" aria-label="Remover uma unidade de ${nome}">−</button>
            <span class="min-w-5 text-center text-[14px] font-bold">${quantidade}</span>
            <button class="${botao}" type="button" data-mais="${p.id}" aria-label="Adicionar uma unidade de ${nome}"${quantidade >= max_quantidade ? ' disabled' : ''}>+</button>
          </div>
          <span class="text-[15px] font-bold">${reais(p.preco * quantidade)}</span>
        </div>
        <button class="mt-1.5 text-[12px] ${botao_link}" type="button" data-remover="${p.id}">Remover</button>
      </div>
    </li>`;
}

function mostrar_sacola() {
  const corpo_sacola = achar('#sacola-corpo');
  const rodape_sacola = achar('#sacola-rodape');
  rodape_sacola.hidden = !sacola.size;
  if (!sacola.size) {
    corpo_sacola.innerHTML = `<div class="px-2.5 py-[60px] text-center text-tinta-2">${icone('sacola', 'mx-auto mb-3.5 block size-[52px] text-tinta-3')}<p class="mb-[18px]">Sua sacola está vazia.</p><a class="botao botao-primario" href="#ofertas" data-fechar>Ver ofertas</a></div>`;
    rodape_sacola.innerHTML = '';
    return;
  }
  const subtotal = subtotal_sacola();
  const frete = frete_para(subtotal);
  const falta = Math.max(0, frete_gratis - subtotal);
  const unidades = [...sacola].reduce(
    (soma, [id, quantidade]) => soma + quantidade * (por_id[id].garrafas?.length || 1),
    0
  );
  const nota_frete =
    falta > 0
      ? `Faltam <strong class="text-tinta">${reais(falta)}</strong> para o frete grátis.`
      : `<strong class="text-tinta">Frete grátis</strong> garantido neste pedido.`;
  corpo_sacola.innerHTML = `
      <div class="mt-1.5 mb-2.5">
        <p class="mb-1.5 text-[13px] text-tinta-2">${nota_frete}</p>
        <div class="h-[5px] overflow-hidden rounded-[3px] bg-fundo-2"><i class="block h-full rounded-[3px] bg-[linear-gradient(90deg,var(--color-marinho),var(--color-ciano))] transition-[width] duration-500 ease-suave" style="width:${Math.min(100, (subtotal / frete_gratis) * 100).toFixed(1)}%"></i></div>
      </div>
      <p class="mt-3.5 mb-0.5 flex items-center gap-2.5 rounded-xl bg-[#e9f5fd] px-3 py-2.5 text-[13px] text-marinho">${simbolo_vs('w-[26px] shrink-0')}<span><b>${unidades} ${unidades === 1 ? 'garrafa lacrada' : 'garrafas lacradas'}</b> · cada uma com o próprio lacre VeriSeal</span></p>
      <ul>${[...sacola].map(([id, quantidade]) => item_sacola_html(por_id[id], quantidade)).join('')}</ul>`;
  const entrega = endereco
    ? `<p class="mb-2 flex items-center gap-2 text-[13px] text-tinta-2">${icone('local', 'size-4 text-ok')}<span class="min-w-0 flex-1">Entregar em <b class="text-tinta">${escapar_html(nome_lugar(endereco))}</b> · ${prazo_texto(endereco)}</span><button class="${botao_link}" type="button" data-abrir-endereco>Alterar</button></p>`
    : `<form class="mb-1 flex gap-2" id="sacola-cep-form" novalidate><input class="h-10 min-w-0 flex-1 rounded-xl border border-linha bg-white px-3.5 text-[15px] outline-none focus:border-destaque focus:shadow-foco [&.invalido]:border-erro" id="sacola-cep" inputmode="numeric" placeholder="CEP para calcular o frete" maxlength="9" aria-label="CEP de entrega" autocomplete="postal-code"><button class="botao botao-escuro botao-pequeno" type="submit">OK</button></form><p class="${info_cep}" id="sacola-cep-info" aria-live="polite"></p>`;
  rodape_sacola.innerHTML = `
      ${entrega}
      <div class="mt-1 mb-3.5">
        <div class="${linha_preco}"><span>Subtotal</span><span>${reais(subtotal)}</span></div>
        <div class="${linha_preco}"><span>Entrega</span><span class="${frete ? '' : texto_gratis}">${frete ? reais(frete) : 'Grátis'}</span></div>
        <div class="${linha_total}"><span>Total</span><span>${reais(subtotal + frete)}</span></div>
        <div class="flex justify-end pb-[3px] text-[13px] font-semibold text-ok"><span>ou ${reais(preco_pix(subtotal) + frete)} no Pix</span></div>
      </div>
      <button class="botao botao-primario w-full" type="button" id="finalizar">Finalizar pedido</button>
      <p class="mt-3 flex items-center gap-2.5 text-[12px] text-tinta-2">${simbolo_vs('w-[26px] shrink-0')}<span>Toda garrafa sai com lacre VeriSeal conferido. Lacre violado? Recuse sem custo.</span></p>`;
  const formulario = achar('#sacola-cep-form');
  if (formulario) {
    const entrada = achar('#sacola-cep');
    mascara_cep(entrada);
    formulario.addEventListener('submit', (e) => {
      e.preventDefault();
      enviar_cep(entrada, achar('#sacola-cep-info'));
    });
  }
  achar('#finalizar').addEventListener('click', abrir_compra);
}

function abrir_sacola() {
  alternar_busca(false);
  mostrar_sacola();
  abrir_camada(achar('#gaveta-sacola'), achar('#gaveta-sacola button[data-fechar]'));
}

function refocar(anterior) {
  const atributo = ['data-mais', 'data-menos', 'data-adicionar'].find((nome) => anterior.hasAttribute(nome));
  if (!atributo) return;
  const id = anterior.getAttribute(atributo);
  const caixa = anterior.closest('[data-controle]');
  const na_sacola = !!anterior.closest('#sacola-corpo');
  requestAnimationFrame(() => {
    const escopo = caixa && document.contains(caixa) ? caixa : na_sacola ? achar('#sacola-corpo') : null;
    if (!escopo) return;
    const alvo =
      escopo.querySelector(`[${atributo}="${id}"]:not([disabled])`) ||
      escopo.querySelector(`[data-mais="${id}"], [data-adicionar="${id}"]`);
    if (alvo) alvo.focus({ preventScroll: true });
  });
}

function abrir_produto(id) {
  const p = por_id[id];
  alternar_busca(false);
  const kit = eh_kit(p);
  const plano = parcelas(p.preco);
  const midia = achar('#produto-midia');
  if (kit) {
    midia.innerHTML = `<div class="h-[400px] w-full max-w-[400px] max-tablet:h-[280px]">${imagem_produto(p, { imediato: true })}</div><p class="${nota_marca}">${simbolo_vs('w-[22px]')}${p.garrafas.length} garrafas, cada uma com o próprio lacre</p>`;
  } else {
    const lacre = posicao_lacre(p);
    const anel = (animacao) =>
      `<span class="absolute -top-8 -left-8 size-16 rounded-full border-2 border-ciano opacity-0 ${animacao}"></span>`;
    const vistas = [
      {
        html: `<div class="relative h-full" style="--nfc:${lacre.nfc.toFixed(4)};--largura-lacre:${lacre.largura_tira}">${foto(p, { imediato: true, alt: nome_completo(p) })}<div class="pointer-events-none absolute top-[calc(var(--nfc,.2)*100%)] left-1/2 z-[3] size-0">${anel('animate-[anel_2.8s_var(--ease-suave)_infinite]')}${anel('animate-[anel_2.8s_var(--ease-suave)_.9s_infinite]')}${anel('animate-[anel_2.8s_var(--ease-suave)_1.8s_infinite]')}</div><span class="absolute top-[calc(var(--nfc,.2)*100%)] left-[calc(50%_+_var(--largura-lacre,.15)*50%_+_26px)] z-[4] inline-flex -translate-y-1/2 items-center gap-2 rounded-full bg-marinho px-3 py-1.5 text-[12px] font-bold whitespace-nowrap text-white shadow-[0_8px_20px_rgba(4,37,85,.3)] max-celular:left-[calc(50%_+_var(--largura-lacre,.15)*50%_+_20px)] max-celular:text-[11px]"><i class="absolute top-1/2 right-full h-[1.5px] w-6 bg-marinho before:absolute before:-top-[3.5px] before:-left-1 before:size-2 before:rounded-full before:bg-ciano"></i>Lacre VeriSeal · NFC</span></div>`,
        miniatura: p.foto,
        rotulo: 'Garrafa com o lacre'
      },
      ...(p.galeria || []).map((imagem) => ({
        html: `<img class="max-h-full w-auto object-contain" src="${escapar_html(imagem.src)}" alt="${escapar_html(`${nome_completo(p)} — ${imagem.rotulo.toLowerCase()}`)}" width="${imagem.tamanho[0]}" height="${imagem.tamanho[1]}">`,
        miniatura: imagem.src,
        rotulo: imagem.rotulo
      }))
    ];
    const vista_html = (vista, k) =>
      `<div class="invisible absolute inset-0 flex items-end justify-center opacity-0 [transition:opacity_.35s_ease,visibility_.35s] [&.ligado]:visible [&.ligado]:opacity-100${k ? '' : ' ligado'}" data-vista="${k}">${vista.html}</div>`;
    const miniatura_html = (vista, k) =>
      `<button class="h-16 w-[54px] overflow-hidden rounded-xl border-2 border-transparent bg-white p-1 shadow-cartao aria-pressed:border-destaque" type="button" data-mostrar="${k}" aria-pressed="${!k}" aria-label="${escapar_html(vista.rotulo)}"><img class="size-full object-contain" src="${escapar_html(vista.miniatura)}" alt=""></button>`;
    const miniaturas =
      vistas.length > 1
        ? `<div class="flex gap-2" role="group" aria-label="Fotos do produto">${vistas.map(miniatura_html).join('')}</div>`
        : '';
    midia.innerHTML = `<div class="relative h-[450px] max-h-[60vh] w-full max-tablet:h-[340px] max-celular:h-[300px]">${vistas.map(vista_html).join('')}</div>
        ${miniaturas}
        <p class="${nota_marca}">${simbolo_vs('w-[22px]')}Lacre conferido antes do envio</p>`;
    for (const botao of achar_todos('[data-mostrar]', midia)) {
      botao.addEventListener('click', () => {
        for (const vista of achar_todos('[data-vista]', midia)) {
          vista.classList.toggle('ligado', vista.dataset.vista === botao.dataset.mostrar);
        }
        for (const miniatura of achar_todos('[data-mostrar]', midia)) {
          miniatura.setAttribute('aria-pressed', String(miniatura === botao));
        }
      });
    }
  }
  const botao_etapa =
    'grid h-full w-[42px] place-items-center rounded-[50%] text-[20px] text-destaque disabled:text-linha';
  const oferta = p.preco_antigo
    ? `<span class="inline-block rounded-md bg-oferta px-2 py-[3px] font-bold text-white">-${percentual_desconto(p)}%${kit ? ' no kit' : ' esta semana'}</span>`
    : escapar_html(p.selo || '');
  const garrafa_html = ([garrafa, contagem]) =>
    `<li class="flex items-center gap-3 rounded-xl bg-fundo px-3 py-2"><span class="flex h-[60px] w-7 shrink-0 items-end justify-center">${foto(garrafa)}</span><span><b class="block text-[15px]">${contagem > 1 ? contagem + '× ' : ''}${escapar_html(garrafa.marca)} ${escapar_html(garrafa.nome)}</b><small class="text-[12px] text-tinta-2">${escapar_html(garrafa.volume)} · ${teor_texto(garrafa)} vol. · ${escapar_html(garrafa.origem)}</small></span></li>`;
  const ficha_html = ([rotulo, valor]) =>
    `<div class="rounded-xl bg-fundo px-3 py-2.5"><span class="block text-[11px] text-tinta-2">${rotulo}</span><strong class="text-[15px] tracking-[-.01em]">${valor}</strong></div>`;
  const ficha = [
    ['Volume', escapar_html(p.volume)],
    ['Teor alcoólico', teor_texto(p)],
    ['Origem', escapar_html(p.origem)]
  ];
  const detalhes = kit
    ? `<ul class="mt-4 grid gap-2">${grupos_kit(p).map(garrafa_html).join('')}</ul>`
    : `<div class="mt-[18px] grid grid-cols-3 gap-2">${ficha.map(ficha_html).join('')}</div>`;
  const notas = (p.notas || [])
    .map(
      (nota) =>
        `<span class="rounded-full border border-linha px-2.5 py-[5px] text-[12px] text-tinta-2">${escapar_html(nota)}</span>`
    )
    .join('');
  const entrega = endereco
    ? `${icone('caminhao', 'size-[18px] text-destaque')}<span>Chega em <b class="text-tinta">${prazo_texto(endereco)}</b> em ${escapar_html(nome_lugar(endereco))}${preco_pix(p.preco) >= frete_gratis ? ' · frete grátis' : ''}</span>`
    : `${icone('local', 'size-[18px] text-destaque')}<span><button class="${botao_link}" type="button" data-abrir-endereco>Informe seu CEP</button> para ver o prazo de entrega.</span>`;
  achar('#produto-info').innerHTML = `
      <p class="min-h-[18px] text-[12px] font-bold text-selo">${oferta}</p>
      <p class="mt-1.5 text-[13px] font-semibold tracking-[.04em] text-tinta-2 uppercase">${escapar_html(kit ? `Kit · ${p.garrafas.length} garrafas` : p.marca)}</p>
      <h2 class="mt-0.5 pr-[30px] text-[clamp(28px,3.4vw,36px)] leading-[1.06] font-extrabold tracking-[-.035em]" id="produto-titulo">${escapar_html(p.nome)}</h2>
      <div class="mt-3.5 flex items-baseline gap-2.5">${p.preco_antigo ? `<s class="text-[16px] text-tinta-3">${reais(p.preco_antigo)}</s>` : ''}<b class="text-[28px] font-extrabold tracking-[-.025em]">${reais(p.preco)}</b></div>
      <p class="mt-0.5 text-[14px] text-tinta-2"><strong class="font-bold text-ok">${reais(preco_pix(p.preco))} no Pix</strong> (5% off)${plano ? ` · ou ${plano.contagem}x de ${reais(plano.valor)} sem juros` : ''}</p>
      <p class="mt-4 text-[15px] text-tinta-2">${escapar_html(p.descricao)}</p>
      ${detalhes}
      <div class="mt-3.5 flex flex-wrap gap-1.5">${notas}</div>
      <div class="mt-[18px] flex items-start gap-3 rounded-2xl bg-[linear-gradient(135deg,#e6f4fe,#f3f5f9)] px-4 py-3.5">${simbolo_vs('mt-1 w-[34px] shrink-0')}<div><strong class="block text-[14px] text-marinho">Lacre VeriSeal${kit ? ' em cada garrafa' : ''}</strong><p class="text-[13px] leading-[1.45] text-tinta-2">Conferido no nosso centro antes do envio. Ao receber, aproxime o celular do lacre e confirme que a bebida é original e nunca foi aberta.</p></div></div>
      <p class="mt-3.5 flex items-center gap-2 text-[14px] text-tinta-2">${entrega}</p>
      <div class="mt-[22px] flex items-center gap-3 pt-1">
        <div class="inline-flex h-[46px] shrink-0 items-center rounded-full border border-linha" role="group" aria-label="Quantidade">
          <button class="${botao_etapa}" type="button" data-variacao="-1" aria-label="Diminuir quantidade">−</button><span class="min-w-[26px] text-center text-[16px] font-bold" id="produto-quantidade">1</span><button class="${botao_etapa}" type="button" data-variacao="1" aria-label="Aumentar quantidade">+</button>
        </div>
        <button class="botao botao-primario flex-1" type="button" id="produto-adicionar" data-foco>Adicionar · ${reais(p.preco)}</button>
      </div>`;
  let quantidade = 1;
  const texto_quantidade = achar('#produto-quantidade');
  const botao_adicionar = achar('#produto-adicionar');
  const atualizar = () => {
    texto_quantidade.textContent = quantidade;
    botao_adicionar.textContent = `Adicionar · ${reais(p.preco * quantidade)}`;
    achar('[data-variacao="-1"]').disabled = quantidade <= 1;
    achar('[data-variacao="1"]').disabled = quantidade >= max_quantidade;
  };
  for (const botao of achar_todos('[data-variacao]')) {
    botao.addEventListener('click', () => {
      quantidade = limitar(quantidade + +botao.dataset.variacao, 1, max_quantidade);
      atualizar();
    });
  }
  botao_adicionar.addEventListener('click', () => {
    if (adicionar_na_sacola(p.id, quantidade)) fechar_camada(achar('#janela-produto'));
  });
  atualizar();
  abrir_camada(achar('#janela-produto'), botao_adicionar);
  achar('#produto-painel').scrollTop = 0;
}

let compra = null;
let temporizadores = [];

function limpar_temporizadores() {
  temporizadores.forEach(clearTimeout);
  temporizadores = [];
}

const formatar_telefone = (texto) => {
  const digitos = so_digitos(texto).slice(0, 11);
  if (digitos.length <= 2) return digitos.length ? `(${digitos}` : '';
  if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  if (digitos.length <= 10) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
};

function horarios_entrega() {
  const horarios = [];
  const inicio = new Date(Date.now() + 90 * 60000);
  inicio.setMinutes(inicio.getMinutes() < 30 ? 30 : 60, 0, 0);
  if (!loja_aberta(inicio)) {
    inicio.setHours(hora_abre, 0, 0, 0);
    if (inicio < new Date()) inicio.setDate(inicio.getDate() + 1);
  }
  for (let k = 0; k < 8 && loja_aberta(inicio); k++) {
    const dia = inicio.getDate() === new Date().getDate() ? 'Hoje' : 'Amanhã';
    const fim = new Date(inicio.getTime() + 30 * 60000);
    horarios.push(`${dia}, ${hora(inicio)}–${hora(fim)}`);
    inicio.setMinutes(inicio.getMinutes() + 30);
  }
  return horarios;
}

function totais_compra() {
  const subtotal = subtotal_sacola();
  const frete = frete_para(subtotal);
  const desconto = compra.dados.pagamento === 'pix' ? subtotal * desconto_pix : 0;
  return { subtotal, frete, desconto, total: subtotal - desconto + frete };
}

const barra_etapas = (etapa) => {
  const barras = [0, 1, 2]
    .map(
      (i) =>
        `<span class="h-1 flex-1 rounded-[2px] transition-[background] duration-300 ${i <= etapa ? 'bg-destaque' : 'bg-fundo-2'}"></span>`
    )
    .join('');
  return `<div class="mt-4 mb-1.5 flex gap-1.5" aria-hidden="true">${barras}</div>
    <p class="mb-[22px] text-[12px] text-tinta-2">Etapa ${etapa + 1} de 3</p>`;
};

const titulo_compra = (texto) =>
  `<h2 class="pr-10 text-[28px] font-extrabold tracking-[-.03em] outline-none">${texto}</h2>`;

function abrir_compra() {
  if (!sacola.size) return;
  const perfil = armazenamento.ler('perfil', {});
  compra = {
    etapa: 0,
    dados: {
      nome: perfil.nome || '',
      telefone: perfil.telefone || '',
      cep: endereco?.cep || '',
      rua: endereco?.rua || '',
      numero: perfil.numero || '',
      complemento: perfil.complemento || '',
      bairro: endereco?.bairro || '',
      cidade: endereco ? cidade_uf(endereco) : '',
      quando: loja_aberta() ? 'agora' : 'agendar',
      horario: '',
      presente: false,
      mensagem: '',
      pagamento: 'pix',
      parcelas: 1,
      troco: ''
    }
  };
  if (camada_aberta('gaveta-sacola')) fechar_camada(achar('#gaveta-sacola'), { devolver_foco: false });
  mostrar_compra();
  abrir_camada(achar('#janela-compra'));
}

function campo(id, rotulo, valor, atributos = '', opcional = false, classes = 'flex-[1_1_180px]') {
  return `<div class="${campo_caixa} ${classes}"><label class="${campo_rotulo}" for="${id}">${rotulo}${opcional ? tag_opcional : ''}</label>
      <input class="${campo_entrada}" id="${id}" name="${id.replace('compra-', '')}" value="${escapar_html(valor)}" ${atributos}><span class="text-[12px] text-erro" data-erro hidden></span></div>`;
}

function mostrar_compra() {
  const etapas = [etapa_entrega, etapa_pagamento, etapa_revisao, etapa_concluida];
  etapas[compra.etapa](achar('#compra-conteudo'), compra.dados, totais_compra());
}

function ir_para_etapa(etapa) {
  compra.etapa = etapa;
  mostrar_compra();
  focar_titulo();
}

function etapa_entrega(conteudo, dados) {
  const horarios = horarios_entrega()
    .map((horario) => `<option${horario === dados.horario ? ' selected' : ''}>${horario}</option>`)
    .join('');
  const texto_agora = loja_aberta()
    ? `Chega em ${endereco ? prazo_texto(endereco) : '30–60 min'}`
    : `Abrimos às ${hora_abre}h — agende a entrega`;
  conteudo.innerHTML = `${titulo_compra('Entrega')}${barra_etapas(0)}
        <form class="flex flex-col gap-3.5" id="compra-form" novalidate>
          <div class="flex flex-wrap gap-3">${campo('compra-nome', 'Nome completo', dados.nome, 'autocomplete="name" required')}${campo('compra-telefone', 'Celular (WhatsApp)', dados.telefone, 'type="tel" inputmode="tel" autocomplete="tel" placeholder="(11) 98765-4321" required')}</div>
          <div class="flex flex-wrap gap-3"><div class="min-w-0 flex-[0_1_150px]">${campo('compra-cep', 'CEP', dados.cep, 'inputmode="numeric" maxlength="9" autocomplete="postal-code" required', false, 'h-full flex-1')}</div><div class="min-w-0 flex-[1_1_220px]">${campo('compra-rua', 'Rua', dados.rua, 'autocomplete="address-line1" required', false, 'h-full flex-1')}</div></div>
          <div class="flex flex-wrap gap-3"><div class="min-w-0 flex-[0_1_120px]">${campo('compra-numero', 'Número', dados.numero, 'inputmode="numeric" required', false, 'h-full flex-1')}</div><div class="min-w-0 flex-[1_1_220px]">${campo('compra-complemento', 'Complemento', dados.complemento, 'autocomplete="address-line2"', true, 'h-full flex-1')}</div></div>
          <div class="flex flex-wrap gap-3">${campo('compra-bairro', 'Bairro', dados.bairro, 'required')}${campo('compra-cidade', 'Cidade/UF', dados.cidade, 'required')}</div>
          <fieldset class="grid min-w-0 gap-2.5">
            <legend class="mb-2 px-0.5 text-[13px] font-semibold text-tinta-2">Quando entregar?</legend>
            <label class="${opcao_caixa}"><input class="${opcao_radio}" type="radio" name="quando" value="agora"${dados.quando === 'agora' ? ' checked' : ''}${loja_aberta() ? '' : ' disabled'}>
              <span class="${opcao_icone}">${icone('moto', 'size-5')}</span><span><strong class="block text-[16px]">Agora</strong><small class="text-[13px] text-tinta-2">${texto_agora}</small></span></label>
            <label class="${opcao_caixa}"><input class="${opcao_radio}" type="radio" name="quando" value="agendar"${dados.quando === 'agendar' ? ' checked' : ''}>
              <span class="${opcao_icone}">${icone('relogio', 'size-5')}</span><span><strong class="block text-[16px]">Agendar</strong><small class="text-[13px] text-tinta-2">Escolha uma janela de 30 minutos</small></span></label>
            <div class="${opcao_extra}" data-para="agendar"${dados.quando === 'agendar' ? '' : ' hidden'}><div class="${campo_caixa} flex-1"><label class="${campo_rotulo}" for="compra-horario">Horário</label>
              <select class="${campo_entrada}" id="compra-horario" name="horario">${horarios}</select></div></div>
          </fieldset>
          <label class="flex cursor-pointer items-start gap-2.5 text-[15px]"><input class="mt-0.5 size-[18px] shrink-0 accent-destaque" type="checkbox" name="presente"${dados.presente ? ' checked' : ''}><span class="inline-flex items-center gap-2">${icone('presente', 'size-[18px] text-destaque')}É presente? Incluir cartão com mensagem</span></label>
          <div class="${campo_caixa} flex-1" data-presente${dados.presente ? '' : ' hidden'}><label class="${campo_rotulo}" for="compra-mensagem">Mensagem do cartão</label>
            <textarea class="${campo_entrada}" id="compra-mensagem" name="mensagem" maxlength="140" rows="2" placeholder="Ex.: Feliz aniversário! Saúde!">${escapar_html(dados.mensagem)}</textarea>
            <span class="text-[12px] text-tinta-2">Até 140 caracteres. O cartão não mostra preços.</span></div>
          <div class="${linha_acoes}"><button type="button" class="botao botao-contorno" data-fechar>Cancelar</button><button type="submit" class="${acao_principal}">Continuar para pagamento</button></div>
        </form>`;
  const formulario = achar('#compra-form');
  const telefone = achar('#compra-telefone');
  const cep = achar('#compra-cep');
  telefone.addEventListener('input', () => {
    telefone.value = formatar_telefone(telefone.value);
  });
  cep.addEventListener('input', async () => {
    cep.value = formatar_cep(cep.value);
    if (cep.value.length !== 9) return;
    const lugar = await consultar_cep(cep.value);
    definir_erro(cep, lugar.erro || '');
    if (lugar.erro) return;
    definir_endereco(lugar);
    if (lugar.rua) achar('#compra-rua').value = lugar.rua;
    if (lugar.bairro) achar('#compra-bairro').value = lugar.bairro;
    if (lugar.cidade) achar('#compra-cidade').value = cidade_uf(lugar);
    achar('#compra-numero').focus();
  });
  formulario.addEventListener('change', (e) => {
    if (e.target.name === 'quando') achar('[data-para="agendar"]', formulario).hidden = e.target.value !== 'agendar';
    if (e.target.name === 'presente') achar('[data-presente]', formulario).hidden = !e.target.checked;
  });
  formulario.addEventListener('submit', (e) => {
    e.preventDefault();
    const valor_de = (id) => achar('#' + id).value.trim();
    Object.assign(dados, {
      nome: valor_de('compra-nome'),
      telefone: valor_de('compra-telefone'),
      cep: valor_de('compra-cep'),
      rua: valor_de('compra-rua'),
      numero: valor_de('compra-numero'),
      complemento: valor_de('compra-complemento'),
      bairro: valor_de('compra-bairro'),
      cidade: valor_de('compra-cidade'),
      quando: formulario.querySelector('[name=quando]:checked')?.value || 'agendar',
      horario: achar('#compra-horario').value,
      presente: formulario.presente.checked,
      mensagem: valor_de('compra-mensagem')
    });
    const verificacoes = [
      ['compra-nome', dados.nome.length < 3, 'Informe seu nome.'],
      ['compra-telefone', so_digitos(dados.telefone).length < 10, 'Informe um celular com DDD.'],
      ['compra-cep', so_digitos(dados.cep).length !== 8, 'Informe o CEP.'],
      ['compra-rua', !dados.rua, 'Informe a rua.'],
      ['compra-numero', !dados.numero, 'Informe o número.'],
      ['compra-bairro', !dados.bairro, 'Informe o bairro.'],
      ['compra-cidade', !dados.cidade, 'Informe a cidade.']
    ];
    for (const [id, invalido, mensagem] of verificacoes) definir_erro(achar('#' + id), invalido ? mensagem : '');
    const primeiro_erro = verificacoes.find(([, invalido]) => invalido);
    if (primeiro_erro) {
      achar('#' + primeiro_erro[0]).focus();
      return;
    }
    armazenamento.gravar('perfil', {
      nome: dados.nome,
      telefone: dados.telefone,
      numero: dados.numero,
      complemento: dados.complemento
    });
    if (endereco?.cep !== formatar_cep(dados.cep)) {
      definir_endereco({
        cep: formatar_cep(dados.cep),
        rua: dados.rua,
        bairro: dados.bairro,
        cidade: dados.cidade,
        uf: '',
        prazo: prazo_para(dados.cep)
      });
    }
    ir_para_etapa(1);
  });
}

function etapa_pagamento(conteudo, dados, totais) {
  const total = totais.subtotal + totais.frete;
  const plano = parcelas(total);
  const opcoes = Array.from({ length: plano ? plano.contagem : 1 }, (_, k) => k + 1)
    .map(
      (contagem) =>
        `<option value="${contagem}"${dados.parcelas === contagem ? ' selected' : ''}>${contagem}x de ${reais(total / contagem)} sem juros</option>`
    )
    .join('');
  conteudo.innerHTML = `${titulo_compra('Pagamento')}${barra_etapas(1)}
        <form class="flex flex-col gap-3.5" id="compra-form" novalidate>
          <fieldset class="grid min-w-0 gap-2.5"><legend class="sr-only">Forma de pagamento</legend>
            <label class="${opcao_caixa}"><input class="${opcao_radio}" type="radio" name="pagamento" value="pix"${dados.pagamento === 'pix' ? ' checked' : ''}>
              <span class="${opcao_icone}">${icone('pix', 'size-5')}</span><span><strong class="block text-[16px]">Pix · 5% off</strong><small class="text-[13px] text-tinta-2">Você economiza ${reais(totais.subtotal * desconto_pix)} · aprovação na hora</small></span></label>
            <label class="${opcao_caixa}"><input class="${opcao_radio}" type="radio" name="pagamento" value="cartao"${dados.pagamento === 'cartao' ? ' checked' : ''}>
              <span class="${opcao_icone}">${icone('cartao', 'size-5')}</span><span><strong class="block text-[16px]">Cartão de crédito</strong><small class="text-[13px] text-tinta-2">${plano ? `Em até ${plano.contagem}x de ${reais(plano.valor)} sem juros` : 'À vista'}</small></span></label>
            <div class="${opcao_extra}" data-para="cartao"${dados.pagamento === 'cartao' ? '' : ' hidden'}><div class="${campo_caixa} flex-1"><label class="${campo_rotulo}" for="compra-parcelas">Parcelas</label>
              <select class="${campo_entrada}" id="compra-parcelas" name="parcelas">${opcoes}</select></div></div>
            <label class="${opcao_caixa}"><input class="${opcao_radio}" type="radio" name="pagamento" value="entrega"${dados.pagamento === 'entrega' ? ' checked' : ''}>
              <span class="${opcao_icone}">${icone('dinheiro', 'size-5')}</span><span><strong class="block text-[16px]">Pagar na entrega</strong><small class="text-[13px] text-tinta-2">Cartão ou dinheiro, direto com o entregador</small></span></label>
            <div class="${opcao_extra}" data-para="entrega"${dados.pagamento === 'entrega' ? '' : ' hidden'}><div class="${campo_caixa} flex-1"><label class="${campo_rotulo}" for="compra-troco">Troco para${tag_opcional}</label>
              <input class="${campo_entrada}" id="compra-troco" name="troco" inputmode="decimal" placeholder="Ex.: 300" value="${escapar_html(dados.troco)}"></div></div>
          </fieldset>
          <p class="text-center text-[12px] text-tinta-3">Ambiente de demonstração: nenhum pagamento é processado.</p>
          <div class="${linha_acoes}"><button type="button" class="botao botao-contorno" data-voltar>Voltar</button><button type="submit" class="${acao_principal}">Revisar pedido</button></div>
        </form>`;
  const formulario = achar('#compra-form');
  formulario.addEventListener('change', (e) => {
    if (e.target.name !== 'pagamento') return;
    for (const extra of achar_todos('[data-para]', formulario)) extra.hidden = extra.dataset.para !== e.target.value;
  });
  formulario.addEventListener('submit', (e) => {
    e.preventDefault();
    dados.pagamento = formulario.querySelector('[name=pagamento]:checked').value;
    dados.parcelas = +achar('#compra-parcelas').value;
    dados.troco = achar('#compra-troco').value.trim();
    ir_para_etapa(2);
  });
}

function etapa_revisao(conteudo, dados, totais) {
  const texto_pagamento =
    dados.pagamento === 'pix'
      ? 'Pix · 5% de desconto'
      : dados.pagamento === 'cartao'
        ? `Cartão de crédito · ${dados.parcelas}x de ${reais(totais.total / dados.parcelas)}`
        : `Na entrega${dados.troco ? ` · troco para R$ ${escapar_html(dados.troco)}` : ''}`;
  const texto_quando =
    dados.quando === 'agora'
      ? `Agora · ${endereco ? prazo_texto(endereco) : '30–60 min'}`
      : `Agendado · ${escapar_html(dados.horario)}`;
  const editar = `text-[13px] ${botao_link}`;
  const itens = [...sacola]
    .map(
      ([id, quantidade]) =>
        `<li class="flex justify-between gap-2.5 py-[3px] text-[15px]"><span>${quantidade}× ${escapar_html(nome_completo(por_id[id]))}</span><span>${reais(por_id[id].preco * quantidade)}</span></li>`
    )
    .join('');
  const presente =
    dados.presente && dados.mensagem
      ? `<div class="${revisao_caixa} mt-2.5"><h4 class="${revisao_titulo}">Cartão de presente</h4><p class="text-[15px] italic">“${escapar_html(dados.mensagem)}”</p></div>`
      : '';
  const desconto = totais.desconto
    ? `<div class="${linha_preco}"><span>Desconto Pix (5%)</span><span class="${texto_gratis}">− ${reais(totais.desconto)}</span></div>`
    : '';
  conteudo.innerHTML = `${titulo_compra('Revisão')}${barra_etapas(2)}
        <div class="${revisao_caixa}"><h4 class="${revisao_titulo}">Itens <button class="${editar}" type="button" data-editar-sacola>Editar</button></h4>
          <ul>${itens}</ul></div>
        <div class="${revisao_caixa} mt-2.5"><h4 class="${revisao_titulo}">Entrega <button class="${editar}" type="button" data-etapa="0">Alterar</button></h4>
          <p class="text-[15px]">${escapar_html(dados.rua)}, ${escapar_html(dados.numero)}${dados.complemento ? ' — ' + escapar_html(dados.complemento) : ''}<br>${escapar_html(dados.bairro)} · ${escapar_html(dados.cidade)} · ${escapar_html(dados.cep)}</p><p class="mt-1 text-[14px] text-tinta-2">${texto_quando}</p></div>
        <div class="${revisao_caixa} mt-2.5"><h4 class="${revisao_titulo}">Pagamento <button class="${editar}" type="button" data-etapa="1">Alterar</button></h4><p class="text-[15px]">${texto_pagamento}</p></div>
        ${presente}
        <div class="mt-4 mb-3.5">
          <div class="${linha_preco}"><span>Subtotal</span><span>${reais(totais.subtotal)}</span></div>
          ${desconto}
          <div class="${linha_preco}"><span>Entrega</span><span class="${totais.frete ? '' : texto_gratis}">${totais.frete ? reais(totais.frete) : 'Grátis'}</span></div>
          <div class="${linha_total}"><span>Total</span><span>${reais(totais.total)}</span></div>
        </div>
        <label class="mt-1.5 flex cursor-pointer items-start gap-2.5 text-[14px]"><input class="mt-0.5 size-[18px] shrink-0 accent-destaque" type="checkbox" id="compra-idade"><span class="inline-flex items-center gap-2">Tenho 18 anos ou mais e vou apresentar documento com foto, se solicitado na entrega.</span></label>
        <p class="mt-2 text-[14px] text-erro" id="compra-idade-erro" role="alert" hidden>Confirme que você tem 18 anos ou mais para concluir.</p>
        <p class="mt-3.5 flex items-center gap-2.5 rounded-xl bg-[#eef7fd] px-3.5 py-3 text-[13px] text-tinta-2">${simbolo_vs('w-7 shrink-0')}<span>Cada garrafa sai com lacre VeriSeal conferido. Se chegar violado, recuse na hora e receba o valor integral.</span></p>
        <div class="${linha_acoes}"><button type="button" class="botao botao-contorno" data-voltar>Voltar</button><button type="button" class="${acao_principal}" id="compra-confirmar">Confirmar pedido · ${reais(totais.total)}</button></div>`;
  const idade = achar('#compra-idade');
  const erro_idade = achar('#compra-idade-erro');
  achar('#compra-confirmar').addEventListener('click', () => {
    if (!idade.checked) {
      erro_idade.hidden = false;
      idade.focus();
      return;
    }
    fazer_pedido();
  });
  idade.addEventListener('change', () => {
    erro_idade.hidden = true;
  });
}

function etapa_concluida(conteudo) {
  const pedido = compra.pedido;
  const item_andamento = (estado, titulo, texto) =>
    `<li class="${estado} relative flex gap-3.5 pb-[18px] before:absolute before:top-[26px] before:bottom-0.5 before:left-[11px] before:w-0.5 before:bg-fundo-2 last:pb-0 last:before:hidden [&.concluido]:before:bg-destaque"><span class="relative z-[1] grid size-6 shrink-0 place-items-center rounded-full border-2 border-linha bg-white transition-all duration-[400ms] [.atual_&]:border-destaque [.atual_&]:shadow-[0_0_0_5px_rgb(0_106_168/.1)] [.concluido_&]:border-destaque [.concluido_&]:bg-destaque">${icone('certo', 'size-[13px] text-white opacity-0 [.concluido_&]:opacity-100')}</span><div><strong class="block text-[15px] tracking-[-.01em] [li:not(.concluido):not(.atual)_&]:text-tinta-3">${titulo}</strong><small class="text-[13px] text-tinta-2">${texto}</small></div></li>`;
  const atual = pedido.agendado
    ? item_andamento(
        'atual',
        'Entrega agendada',
        `${escapar_html(pedido.horario)} · os lacres são conferidos antes de sair`
      )
    : item_andamento('atual', 'Separando e conferindo os lacres', 'Cada garrafa é escaneada antes de sair');
  const nota_pix =
    pedido.pagamento === 'pix'
      ? `<p class="mt-3 inline-flex items-center gap-2 rounded-full bg-ok-forte/10 px-3.5 py-1.5 text-[14px] font-semibold text-ok">${icone('pix', 'size-4')}Pix aprovado · você economizou ${reais(pedido.desconto)}</p>`
      : '';
  const itens_lacre = pedido.lacres
    .map(
      (lacre) =>
        `<li class="mb-1.5 flex items-center justify-between gap-2.5 rounded-xl bg-white px-3.5 py-2.5 text-[14px]"><span class="flex min-w-0 flex-col"><b class="truncate text-[13px] font-semibold">${escapar_html(lacre.nome)}</b><code class="font-mono text-[13px] font-semibold text-marinho">${lacre.codigo}</code></span><button class="text-[13px] whitespace-nowrap ${botao_link}" type="button" data-verificar="${lacre.codigo}">Verificar ›</button></li>`
    )
    .join('');
  conteudo.innerHTML = `<div class="text-center">
        <div class="mx-auto mt-1 mb-[18px] grid size-16 place-items-center rounded-full bg-ok-forte text-white">${icone('certo', 'size-[34px] animate-[desenhar_.6s_var(--ease-suave)_.2s_both]')}</div>
        <h2 class="text-[30px] font-extrabold tracking-[-.03em] outline-none">Pedido confirmado!</h2>
        <p class="mt-1.5 text-tinta-2">Pedido <span class="font-mono font-semibold text-tinta">#${pedido.numero}</span> · ${pedido.quando}</p>
        ${nota_pix}
        <ol class="mt-[26px] mb-2 text-left" id="compra-andamento">
          ${item_andamento('concluido', 'Pedido recebido', pedido.hora)}
          ${atual}
          ${item_andamento('', 'Saiu para entrega', 'Você recebe o aviso no WhatsApp')}
          ${item_andamento('', 'Entregue', 'Aproxime o celular do lacre e confira')}
        </ol>
        <div class="mt-[22px] mb-5 rounded-2xl bg-[#eef7fd] p-4 text-left">
          <h4 class="mb-2.5 flex items-center gap-2 text-[14px] font-bold text-marinho">${simbolo_vs('w-6')}Lacres VeriSeal do seu pedido</h4>
          <ul>${itens_lacre}</ul>
          <p class="mt-2 text-[12px] text-tinta-2">Guarde estes códigos: eles também estão impressos no lacre de cada garrafa.</p>
        </div>
        <button class="botao botao-primario w-full" type="button" data-fechar>Continuar comprando</button>
      </div>`;
  if (pedido.agendado) return;
  const itens = achar_todos('#compra-andamento > li');
  const avancar = () => {
    itens.forEach((item, i) => {
      item.classList.toggle('concluido', i < 2);
      item.classList.toggle('atual', i === 2);
    });
  };
  temporizadores.push(setTimeout(avancar, menos_movimento ? 0 : 4200));
}

function definir_erro(entrada, mensagem) {
  entrada.classList.toggle('invalido', !!mensagem);
  entrada.setAttribute('aria-invalid', String(!!mensagem));
  const texto = entrada.parentElement.querySelector('[data-erro]');
  texto.textContent = mensagem;
  texto.hidden = !mensagem;
}

function focar_titulo() {
  requestAnimationFrame(() => {
    const titulo = achar('#compra-conteudo h2');
    titulo.tabIndex = -1;
    titulo.focus({ preventScroll: true });
    achar('#compra-painel').scrollTop = 0;
  });
}

const caracteres_codigo = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const parte_aleatoria = () =>
  Array.from({ length: 4 }, () => caracteres_codigo[(Math.random() * caracteres_codigo.length) | 0]).join('');

function novo_codigo() {
  let codigo = '';
  while (!codigo || lacres[codigo]) codigo = `VS-${parte_aleatoria()}-${parte_aleatoria()}`;
  return codigo;
}

function fazer_pedido() {
  const dados = compra.dados;
  const totais = totais_compra();
  const agora = new Date();
  const numero = 'VSD-' + Math.floor(10000 + Math.random() * 89999);
  const lote = `L${String(agora.getFullYear()).slice(2)}-${String(agora.getMonth() + 1).padStart(2, '0')}${10 + ((Math.random() * 18) | 0)}`;
  const producao = new Date(agora.getTime() - (20 + Math.random() * 60) * 86400000).toLocaleDateString('pt-BR');
  const enviado_em = 'hoje · ' + hora(new Date(agora.getTime() + 6 * 60000));
  const lacres_pedido = [];
  const salvos = armazenamento.ler('lacres', {});
  for (const [id, quantidade] of sacola) {
    const p = por_id[id];
    const garrafas = eh_kit(p) ? p.garrafas : [p];
    for (let k = 0; k < quantidade; k++) {
      for (const garrafa of garrafas) {
        const codigo = novo_codigo();
        const registro = {
          produto: garrafa.id,
          situacao: 'ok',
          lote,
          producao,
          verificacoes: 0,
          enviado_em,
          pedido: numero
        };
        lacres[codigo] = registro;
        salvos[codigo] = registro;
        lacres_pedido.push({ codigo, nome: nome_completo(garrafa) });
      }
    }
  }
  armazenamento.gravar('lacres', salvos);
  armazenamento.gravar('ultimo_lacre', lacres_pedido[0].codigo);
  const prazo = endereco ? `${prazo_texto(endereco)} (até ${chegada(endereco)})` : '30–60 min';
  compra.pedido = {
    numero,
    pagamento: dados.pagamento,
    desconto: totais.desconto,
    hora: 'hoje · ' + hora(agora),
    lacres: lacres_pedido,
    agendado: dados.quando !== 'agora',
    horario: dados.horario,
    quando: dados.quando === 'agora' ? `chega em ${prazo}` : `agendado: ${escapar_html(dados.horario)}`
  };
  sacola.clear();
  salvar_sacola();
  for (const p of produtos) atualizar_controles(p.id);
  atualizar_sacola();
  ir_para_etapa(3);
}

function iniciar_compra() {
  achar('#compra-conteudo').addEventListener('click', (e) => {
    const link_etapa = e.target.closest('[data-etapa]');
    if (e.target.closest('[data-voltar]')) ir_para_etapa(compra.etapa - 1);
    if (link_etapa) ir_para_etapa(+link_etapa.dataset.etapa);
    if (e.target.closest('[data-editar-sacola]')) {
      fechar_camada(achar('#janela-compra'), { devolver_foco: false });
      abrir_sacola();
    }
  });
}

const campo_verificacao = achar('#verificar-campo');
const resultado_verificacao = achar('#verificar-resultado');
const erro_verificacao = achar('#verificar-erro');
const padrao_codigo = /^VS-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

function formatar_codigo(texto) {
  let codigo = String(texto)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  if (!codigo) return '';
  if (codigo.startsWith('VS')) codigo = codigo.slice(2);
  codigo = codigo.slice(0, 8);
  return 'VS-' + codigo.slice(0, 4) + (codigo.length > 4 ? '-' + codigo.slice(4) : '');
}

function verificar(codigo) {
  erro_verificacao.hidden = true;
  campo_verificacao.classList.remove('invalido');
  mostrar_resultado(codigo);
  if (resultado_verificacao.getBoundingClientRect().top > innerHeight - 120) {
    resultado_verificacao.scrollIntoView({ behavior: rolagem, block: 'start' });
  }
}

const resultado_cores = { ok: 'text-[#8ef5b0]', alerta: 'text-[#ffd67a]', erro: 'text-[#ffaaa3]' };
const mono = 'font-mono text-[14px] tracking-[.02em]';

const resultado_endereco = (codigo) =>
  `<p class="mx-auto mb-3.5 flex w-fit max-w-full items-center gap-1.5 rounded-full bg-white/8 px-3 py-1.5 font-mono text-[12px] leading-[1.2] font-medium text-[#c3cbd9] shadow-[inset_0_0_0_1px_rgba(255,255,255,.1)] ${subir}">${icone('cadeado', 'size-[13px] text-[#8ef5b0]')}<span>${escapar_html(dominio)}/v/${escapar_html(codigo.slice(3))}</span></p>`;

const resultado_topo = (tipo, titulo, texto) =>
  `<div class="flex flex-col items-center gap-3 pt-1.5 pb-0.5 text-center">${medalha(tipo, 'agora', '92px')}<div class="${subir}" style="--atraso:.38s"><b class="block text-[clamp(28px,3vw,36px)] leading-none font-extrabold tracking-[-.03em] ${resultado_cores[tipo]}">${titulo}</b><span class="mt-1.5 block text-[14px] text-white/78">${texto}</span></div></div>`;

const resultado_celula = ([rotulo, valor, classes]) =>
  `<div><dt class="text-[12px] text-[#94a0b8]">${rotulo}</dt><dd class="mt-0.5 font-semibold ${classes || 'text-[15px]'}">${valor}</dd></div>`;

const resultado_grade = (celulas, atraso) =>
  `<dl class="mt-4 grid grid-cols-2 gap-x-[18px] gap-y-3.5 rounded-2xl bg-white/5 px-4 py-3.5 max-celular:gap-x-3 max-celular:gap-y-2.5 ${subir}" style="--atraso:${atraso}">${celulas.map(resultado_celula).join('')}</dl>`;

const resultado_nota = (texto, atraso) =>
  `<p class="mt-4 text-[14px] leading-normal text-[#c3cbd9] ${subir}" style="--atraso:${atraso}">${texto}</p>`;

const jornada_entrada = [
  'animate-[subir_.45s_var(--ease-suave)_calc(var(--atraso,0s)_+_.1s)_both]',
  'animate-[subir_.45s_var(--ease-suave)_calc(var(--atraso,0s)_+_.2s)_both]',
  'animate-[subir_.45s_var(--ease-suave)_calc(var(--atraso,0s)_+_.3s)_both]',
  'animate-[subir_.45s_var(--ease-suave)_calc(var(--atraso,0s)_+_.4s)_both]'
];

const jornada_etapa = (k, titulo, texto, agora) =>
  `<li class="relative ${jornada_entrada[k]} pt-1 pb-2.5 [--subida:8px] before:absolute before:top-2 before:-left-6 before:size-2.5 before:rounded-full before:border-2 ${agora ? 'before:border-[#30d158] before:bg-[#30d158] before:shadow-[0_0_0_5px_rgba(48,209,88,.2)]' : 'before:border-[#03adf9] before:bg-noite'}"><b class="block text-[14px]">${titulo}</b><span class="block text-[12px] text-[#94a0b8]">${texto}</span></li>`;

function mostrar_resultado(codigo) {
  const lacre = lacres[codigo];
  const p = lacre && por_id[lacre.produto];
  if (!p) {
    resultado_verificacao.dataset.estado = 'erro';
    resultado_verificacao.innerHTML = `<div class="w-full">${resultado_endereco(codigo)}
          ${resultado_topo('erro', 'Não reconhecido', 'Este código não existe na base VeriSeal.')}
          ${resultado_grade(
            [
              ['Código', escapar_html(codigo), mono],
              ['Situação', 'sem registro', 'text-[15px] text-[#ff8a80]']
            ],
            '.5s'
          )}
          ${resultado_nota('Pode ser uma garrafa falsificada. Não consuma a bebida e avise a marca. Se a compra foi aqui, recuse a entrega e receba o valor integral.', '.6s')}
          <button class="botao botao-claro botao-pequeno mt-4 ${subir}" style="--atraso:.7s" type="button" data-avisar>Avisar a marca</button>
        </div>`;
    return;
  }
  lacre.verificacoes = (lacre.verificacoes || 0) + 1;
  salvar_lacre(codigo);
  const aberta = lacre.situacao === 'aberta';
  const produto = `<div class="mt-4 flex items-center gap-4 rounded-2xl bg-white/7 px-4 py-3 ${subir}" style="--atraso:.5s"><span class="flex h-[104px] w-[52px] shrink-0 items-end justify-center rounded-xl bg-[linear-gradient(#f4f8fd,#dfe7f2)] px-0.5 pt-1.5 pb-1 text-[13px] text-[#94a0b8]">${foto(p, { rompido: aberta })}</span><div><strong class="block text-[17px] tracking-[-.015em]">${escapar_html(nome_completo(p))}</strong><span class="text-[13px] text-[#94a0b8]">${escapar_html(p.volume)} · ${teor_texto(p)} vol. · ${escapar_html(p.origem)}</span></div></div>`;
  if (aberta) {
    resultado_verificacao.dataset.estado = 'alerta';
    resultado_verificacao.innerHTML = `<div class="w-full">${resultado_endereco(codigo)}
          ${resultado_topo('alerta', 'Já foi aberta', 'O circuito do lacre está rompido.')}
          ${produto}
          ${resultado_grade(
            [
              ['Lacre', escapar_html(codigo), mono],
              ['Lote', escapar_html(lacre.lote)],
              ['1ª abertura', escapar_html(lacre.aberta_em), 'text-[15px] text-[#ffd67a]'],
              ['Verificações', lacre.verificacoes]
            ],
            '.6s'
          )}
          ${resultado_nota('Comprou lacrada? Desconfie da procedência e fale com o vendedor. Nas compras feitas aqui, você pode recusar a entrega sem custo.', '.7s')}
        </div>`;
    return;
  }
  const enviado =
    lacre.enviado_ha != null
      ? 'hoje · ' + hora(new Date(Date.now() - lacre.enviado_ha * 60000))
      : lacre.enviado_em || 'antes do envio';
  resultado_verificacao.dataset.estado = 'ok';
  resultado_verificacao.innerHTML = `<div class="w-full">${resultado_endereco(codigo)}
        ${resultado_topo('ok', 'Autêntico', 'Original · lacre íntegro, nunca aberto')}
        ${produto}
        ${resultado_grade(
          [
            ['Lacre', escapar_html(codigo), mono],
            ['Lote', escapar_html(lacre.lote)],
            ['Produção', escapar_html(lacre.producao)],
            ['Verificações', lacre.verificacoes]
          ],
          '.6s'
        )}
        <ol class="relative mt-[18px] pl-[26px] before:absolute before:top-2 before:bottom-2 before:left-[7px] before:w-0.5 before:bg-[linear-gradient(#03adf9,#30d158)] ${subir}" style="--atraso:.7s">
          ${jornada_etapa(0, 'Produção', `${escapar_html(lacre.producao)} · linha de envase`)}
          ${jornada_etapa(1, 'Distribuidor autorizado', 'origem rastreada')}
          ${jornada_etapa(2, 'VeriSeal Delivery', `lacre conferido no envio · ${escapar_html(enviado)}`)}
          ${jornada_etapa(3, 'Você', 'agora · lacre íntegro', true)}
        </ol>
      </div>`;
}

function salvar_lacre(codigo) {
  const salvos = armazenamento.ler('lacres', {});
  if (!salvos[codigo]) return;
  salvos[codigo] = lacres[codigo];
  armazenamento.gravar('lacres', salvos);
}

function verificar_codigo(texto) {
  const codigo = formatar_codigo(texto);
  campo_verificacao.value = codigo;
  if (!padrao_codigo.test(codigo)) {
    erro_verificacao.textContent = 'Digite o código completo, no formato VS-XXXX-XXXX.';
    erro_verificacao.hidden = false;
    campo_verificacao.classList.add('invalido');
    campo_verificacao.focus();
    return;
  }
  verificar(codigo);
}

const exemplo_html = (exemplo) =>
  `<button class="rounded-full border border-linha bg-white px-3 py-1.5 font-mono text-[13px] text-tinta hover:border-tinta-3" type="button" data-codigo="${exemplo.codigo}">${exemplo.codigo}<em class="ml-1.5 font-sans text-[12px] text-tinta-2 not-italic">${escapar_html(exemplo.rotulo)}</em></button>`;

function iniciar_verificacao() {
  campo_verificacao.addEventListener('input', () => {
    campo_verificacao.value = formatar_codigo(campo_verificacao.value);
    campo_verificacao.classList.remove('invalido');
    erro_verificacao.hidden = true;
  });
  achar('#verificar-form').addEventListener('submit', (e) => {
    e.preventDefault();
    verificar_codigo(campo_verificacao.value);
  });
  achar('#codigos-exemplo').innerHTML = codigos_exemplo.map(exemplo_html).join('');
  achar('#codigos-exemplo').addEventListener('click', (e) => {
    const botao = e.target.closest('[data-codigo]');
    if (botao) verificar_codigo(botao.dataset.codigo);
  });
  achar('#botao-nfc').addEventListener('click', () => {
    const ultimo = armazenamento.ler('ultimo_lacre', null);
    const codigo = lacres[ultimo] ? ultimo : 'VS-7K2M-9QXA';
    campo_verificacao.value = codigo;
    verificar(codigo);
  });
  resultado_verificacao.addEventListener('click', (e) => {
    if (e.target.closest('[data-avisar]'))
      aviso('Aviso enviado à marca. Obrigado por ajudar a combater falsificações.');
  });
}

const demo_item_html = ([id, quantidade]) => {
  const p = por_id[id];
  return `<li class="flex items-center gap-[3cqi] rounded-[4cqi] bg-white px-[3cqi] py-[2.2cqi] shadow-celular"><span class="flex h-[15cqi] w-[8cqi] flex-none items-end justify-center">${foto(p)}</span><span class="min-w-0 flex-1"><b class="block truncate text-[3.9cqi] font-bold">${escapar_html(p.nome)}</b><span class="block text-[3.3cqi] text-[#6e6e73]">${escapar_html(p.marca)} · ${quantidade}×</span></span><b class="text-[3.7cqi] font-bold whitespace-nowrap">${reais(p.preco * quantidade)}</b></li>`;
};

function iniciar_como_funciona() {
  const cena = achar('#como-cena');
  const etapas = achar_todos('#como-passos li');
  const botoes_etapa = achar_todos('#como-passos button');
  const seletor_modo = achar('#como-modo');
  const botoes_modo = achar_todos('button', seletor_modo);
  const botao_tocar = achar('#como-tocar');
  const telas = { ok: achar('[data-tela="ok"]', cena), erro: achar('[data-tela="erro"]', cena) };
  const demo = por_id[demo_id];
  const lacre = posicao_lacre(demo);

  const caixa_garrafa = achar('#como-garrafa');
  caixa_garrafa.style.setProperty('--proporcao', `${demo.tamanho[0]} / ${demo.tamanho[1]}`);
  caixa_garrafa.style.setProperty('--lacre', lacre.nfc.toFixed(4));
  caixa_garrafa.style.setProperty('--lacre-topo', lacre.topo.toFixed(4));
  const zigue_zague = [];
  for (let k = 0; k <= 8; k++)
    zigue_zague.push([
      lacre.x - lacre.largura_tira / 2 + (lacre.largura_tira * k) / 8,
      lacre.y + (k % 2 ? 0.006 : -0.002)
    ]);
  const coordenadas = (lista, dy = 0) => lista.map(([x, y]) => `${porcentagem(x)} ${porcentagem(y + dy)}`).join(', ');
  const recorte_tampa = `polygon(0 0, 100% 0, 100% ${porcentagem(lacre.y + 0.004)}, ${coordenadas([...zigue_zague].reverse(), 0.004)}, 0 ${porcentagem(lacre.y + 0.004)})`;
  const recorte_corpo = `polygon(0 ${porcentagem(lacre.y)}, ${coordenadas(zigue_zague)}, 100% ${porcentagem(lacre.y)}, 100% 100%, 0 100%)`;
  const ponto = 'absolute -top-[3px] size-[7px] rounded-full bg-[#ff5b4f] shadow-[0_0_10px_2px_rgba(255,91,79,.8)]';
  achar('#como-foto').innerHTML = `
      <div class="absolute inset-0" style="clip-path:${recorte_corpo}">${foto(demo, { imediato: true, classe_lacre: '[.lendo_&]:[filter:drop-shadow(0_0_7px_rgba(95,208,255,.95))_drop-shadow(0_0_2px_#fff)]' })}<span class="absolute size-0 opacity-0 [transition:opacity_.3s_.4s] [.violado.etapa-2_&]:opacity-100" style="left:${porcentagem(lacre.x)};top:${porcentagem(lacre.y)}"><i class="${ponto} -left-3.5"></i><i class="${ponto} left-[7px]"></i></span></div>
      <div class="absolute inset-0 [transition:transform_.9s_var(--ease-mola)] [.violado.etapa-2_&]:[transform:translate(6%,-3.4%)_rotate(-10deg)]" style="clip-path:${recorte_tampa};transform-origin:${porcentagem(lacre.x + lacre.largura_tira)} ${porcentagem(lacre.y)}">${foto(demo, { imediato: true })}</div>`;
  for (const caixa of achar_todos('[data-miniatura]', cena)) {
    caixa.innerHTML = foto(demo, { rompido: caixa.dataset.miniatura === 'erro', classes: 'mt-[.6cqi] h-full' });
  }
  for (const caixa of achar_todos('[data-medalha]', cena))
    caixa.innerHTML = medalha(caixa.dataset.medalha, 'ligado', '26cqi');
  for (const caixa of achar_todos('[data-pagina]', cena)) caixa.textContent = `${dominio}/${caixa.dataset.pagina}`;
  for (const caixa of achar_todos('[data-produto]', cena)) {
    caixa.querySelector('b').textContent = demo.nome;
    caixa.querySelector('span').textContent = `${demo.marca} · ${demo.volume} · ${teor_texto(demo)}`;
  }
  const demo_pedido = [
    [demo_id, 1],
    ['tanqueray', 1]
  ];
  const demo_total = demo_pedido.reduce((soma, [id, quantidade]) => soma + por_id[id].preco * quantidade, 0);
  achar('#demo-itens').innerHTML = demo_pedido.map(demo_item_html).join('');
  achar('#demo-total').textContent = reais(preco_pix(demo_total));
  const atualizar_relogio = () => {
    const agora = Date.now();
    const em = (minutos) => hora(new Date(agora + minutos * 60000));
    for (const relogio of achar_todos('[data-relogio]', cena)) relogio.textContent = em(0);
    achar('#demo-prazo').textContent = em(18);
    achar('#demo-enviado').textContent = 'hoje · ' + em(-24);
    achar('#demo-rompido').textContent = 'hoje · ' + em(-3);
  };
  atualizar_relogio();
  setInterval(atualizar_relogio, 30000);

  const duracoes = [3.6, 4.2, 7.4];
  const abre_em = 0.3;
  let etapa = 0;
  let progresso = 0;
  let tocando = !menos_movimento;
  let visivel = false;
  let iniciado = false;
  let violado = false;
  let quadro_id = 0;
  let ultimo_tempo = 0;

  function desenhar() {
    const etapa_resultado = iniciado && etapa === 2;
    cena.classList.toggle('iniciado', iniciado);
    ['etapa-0', 'etapa-1', 'etapa-2'].forEach((nome, i) => cena.classList.toggle(nome, iniciado && etapa === i));
    cena.classList.toggle('escaneado', iniciado && etapa === 1 && progresso > 0.42);
    cena.classList.toggle('lendo', etapa_resultado && progresso > 0.08 && progresso < abre_em + 0.04);
    cena.classList.toggle('celular-aberto', etapa_resultado && progresso >= abre_em);
    cena.classList.toggle('celular-resultado', etapa_resultado && progresso >= abre_em + 0.14);
    telas.ok.classList.toggle('ligado', etapa_resultado && progresso >= abre_em && !violado);
    telas.erro.classList.toggle('ligado', etapa_resultado && progresso >= abre_em && violado);
    etapas.forEach((item, i) => {
      item.classList.toggle('ativo', iniciado && i === etapa);
      item.classList.toggle('feito', iniciado && i < etapa);
      item.style.setProperty('--progresso', !iniciado ? 0 : i < etapa ? 1 : i === etapa ? progresso.toFixed(3) : 0);
      botoes_etapa[i].setAttribute('aria-current', iniciado && i === etapa ? 'step' : 'false');
    });
  }

  function ir(i, em = 0) {
    etapa = i;
    progresso = em;
    desenhar();
  }

  function definir_tocando(valor) {
    tocando = valor;
    cena.classList.toggle('pausado', !valor);
    botao_tocar.classList.toggle('tocando', valor);
    botao_tocar.setAttribute('aria-label', valor ? 'Pausar demonstração' : 'Reproduzir demonstração');
    if (valor) animar();
  }

  function definir_violado(valor) {
    violado = valor;
    for (const botao of botoes_modo) {
      const ligado = (botao.dataset.modo === 'erro') === valor;
      botao.setAttribute('aria-checked', String(ligado));
      botao.tabIndex = ligado ? 0 : -1;
    }
    seletor_modo.classList.toggle('violado', valor);
    cena.classList.toggle('violado', valor);
  }

  function reiniciar() {
    iniciado = true;
    telas.ok.classList.remove('ligado');
    telas.erro.classList.remove('ligado');
    void cena.offsetWidth;
  }

  botoes_etapa.forEach((botao, i) => {
    botao.addEventListener('click', () => {
      reiniciar();
      ir(i, i === 2 && !tocando ? abre_em : 0);
    });
  });
  botao_tocar.addEventListener('click', () => definir_tocando(!tocando));
  for (const botao of botoes_modo) {
    botao.addEventListener('click', () => {
      definir_violado(botao.dataset.modo === 'erro');
      reiniciar();
      ir(2, abre_em);
    });
  }
  seletor_modo.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const proximo = botoes_modo.find((botao) => botao.getAttribute('aria-checked') !== 'true');
    proximo.click();
    proximo.focus();
  });

  function quadro(agora) {
    const dt = Math.min(0.05, (agora - (ultimo_tempo || agora)) / 1000);
    ultimo_tempo = agora;
    if (iniciado && visivel && tocando) {
      progresso += dt / duracoes[etapa];
      if (progresso >= 1) ir((etapa + 1) % 3);
      else desenhar();
    }
    quadro_id = visivel && tocando ? requestAnimationFrame(quadro) : 0;
  }

  function animar() {
    if (quadro_id || !visivel || !tocando) return;
    ultimo_tempo = 0;
    quadro_id = requestAnimationFrame(quadro);
  }

  new IntersectionObserver(
    (entradas) => {
      visivel = entradas.at(-1).isIntersecting;
      if (visivel && !iniciado) {
        iniciado = true;
        ir(0);
      }
      animar();
    },
    { threshold: 0.35 }
  ).observe(cena);
  definir_tocando(tocando);
  desenhar();
}

function iniciar_lacre() {
  montar_lacre(achar('#lacre-palco'), 'VS-7K2M-9QXA', achar('#lacre-bloco'));
}

function tratar_clique(e) {
  const alvo = e.target;

  const adicionar = alvo.closest('[data-adicionar]');
  if (adicionar) {
    adicionar_na_sacola(adicionar.dataset.adicionar);
    refocar(adicionar);
    return;
  }

  const aumentar = alvo.closest('[data-mais]');
  if (aumentar) {
    const id = aumentar.dataset.mais;
    const quantidade = (sacola.get(id) || 0) + 1;
    if (quantidade > max_quantidade) {
      aviso(`Máximo de ${max_quantidade} unidades por item.`);
      return;
    }
    definir_quantidade(id, quantidade);
    refocar(aumentar);
    return;
  }

  const diminuir = alvo.closest('[data-menos]');
  if (diminuir) {
    const id = diminuir.dataset.menos;
    definir_quantidade(id, (sacola.get(id) || 0) - 1);
    refocar(diminuir);
    return;
  }

  const remover = alvo.closest('[data-remover]');
  if (remover) {
    const id = remover.dataset.remover;
    const quantidade = sacola.get(id);
    definir_quantidade(id, 0);
    aviso(`${nome_completo(por_id[id])} removido.`, 'Desfazer', () => definir_quantidade(id, quantidade));
    return;
  }

  const produto = alvo.closest('[data-abrir]');
  if (produto) {
    e.preventDefault();
    abrir_produto(produto.dataset.abrir);
    return;
  }

  if (alvo.closest('[data-abrir-sacola]')) {
    e.preventDefault();
    abrir_sacola();
    return;
  }

  if (alvo.closest('[data-abrir-endereco]')) {
    e.preventDefault();
    alternar_busca(false);
    abrir_endereco();
    return;
  }

  const link_verificar = alvo.closest('[data-verificar]');
  if (link_verificar) {
    for (const camada of [...camadas].reverse()) fechar_camada(camada.elemento, { devolver_foco: false });
    achar('#verificar').scrollIntoView({ behavior: rolagem });
    setTimeout(() => verificar_codigo(link_verificar.dataset.verificar), menos_movimento ? 0 : 500);
    return;
  }

  const link_categoria = alvo.closest('a[data-categoria]');
  if (link_categoria) {
    definir_filtro({ categoria: link_categoria.dataset.categoria, busca: '' });
    alternar_busca(false);
    return;
  }

  const cartao = alvo.closest('[data-cartao]');
  if (cartao && !alvo.closest('[data-controle], button, a, input, select')) {
    abrir_produto(cartao.querySelector('[data-abrir]').dataset.abrir);
  }
}

criar_simbolos_gargalo();
iniciar_camadas();
iniciar_revelar();
iniciar_idade();
iniciar_cep();
iniciar_busca();
iniciar_destaques();
iniciar_cartao_topo();
iniciar_categorias();
iniciar_trilhos();
iniciar_kits();
iniciar_catalogo();
iniciar_compra();
iniciar_verificacao();
iniciar_como_funciona();
iniciar_lacre();
document.addEventListener('click', tratar_clique);
atualizar_sacola();
