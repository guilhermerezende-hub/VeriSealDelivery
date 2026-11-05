export const categorias = [
  { id: 'whisky', nome: 'Whisky', icone: 'jw-black', tom: '#fbf1e4' },
  { id: 'vodka', nome: 'Vodka', icone: 'absolut-1l', tom: '#eaf2fd' },
  { id: 'gin', nome: 'Gin', icone: 'tanqueray', tom: '#e8f6ee' },
  { id: 'cachaca', nome: 'Cachaça', icone: 'cachaca-51', tom: '#fdf7dc' },
  { id: 'kits', nome: 'Kits', icone: 'kit-jack-trio', tom: '#ecebfa' }
];

const pasta = 'assets/produtos/';

export const produtos = [
  {
    id: 'jw-black',
    marca: 'Johnnie Walker',
    nome: 'Black Label 12 anos',
    categoria: 'whisky',
    volume: '750 ml',
    teor: 40,
    origem: 'Escócia',
    preco: 99.9,
    preco_antigo: 119.9,
    selo: 'Mais vendido',
    destaque: true,
    foto: pasta + 'jw-black.webp',
    tamanho: [304, 1100],
    lacre: { y: 0.18, largura: 0.15 },
    galeria: [{ src: pasta + 'jw-black-box.webp', tamanho: [385, 711], rotulo: 'Com estojo' }],
    descricao:
      'Blend de whiskies envelhecidos por no mínimo 12 anos. Encorpado e equilibrado, com fumaça suave, baunilha e frutas escuras.',
    notas: ['Defumado suave', 'Baunilha', 'Frutas escuras']
  },
  {
    id: 'jack-7',
    marca: "Jack Daniel's",
    nome: 'Old No.7',
    categoria: 'whisky',
    volume: '1 L',
    teor: 40,
    origem: 'EUA (Tennessee)',
    preco: 129.9,
    preco_antigo: 189.9,
    destaque: true,
    foto: pasta + 'jack-7.webp',
    tamanho: [365, 1100],
    lacre: { y: 0.097, largura: 0.13 },
    galeria: [{ src: pasta + 'jack-7-box.webp', tamanho: [514, 900], rotulo: 'Com estojo' }],
    descricao:
      'O Tennessee whiskey mais famoso do mundo, filtrado gota a gota em carvão de bordo. Macio, com caramelo, baunilha e carvalho tostado.',
    notas: ['Caramelo', 'Baunilha', 'Carvalho tostado']
  },
  {
    id: 'jack-apple',
    marca: "Jack Daniel's",
    nome: 'Tennessee Apple',
    categoria: 'whisky',
    volume: '1 L',
    teor: 35,
    origem: 'EUA (Tennessee)',
    preco: 139.9,
    destaque: true,
    foto: pasta + 'jack-apple.webp',
    tamanho: [241, 713],
    lacre: { y: 0.116, largura: 0.14 },
    descricao:
      'Licor de maçã verde com Jack Daniel’s Old No.7. Fresco e frutado, vai muito bem com gelo ou com tônica.',
    notas: ['Maçã verde', 'Caramelo', 'Refrescante']
  },
  {
    id: 'jack-fire',
    marca: "Jack Daniel's",
    nome: 'Tennessee Fire',
    categoria: 'whisky',
    volume: '1 L',
    teor: 35,
    origem: 'EUA (Tennessee)',
    preco: 139.9,
    foto: pasta + 'jack-fire.webp',
    tamanho: [301, 900],
    lacre: { y: 0.116, largura: 0.13 },
    descricao: 'Licor de canela picante com Jack Daniel’s Old No.7. Aquece na medida — perfeito em shot gelado.',
    notas: ['Canela', 'Especiarias', 'Final quente']
  },

  {
    id: 'absolut-1l',
    marca: 'Absolut',
    nome: 'Vodka',
    categoria: 'vodka',
    volume: '1 L',
    teor: 40,
    origem: 'Suécia',
    preco: 74.9,
    preco_antigo: 89.9,
    selo: 'Mais vendido',
    destaque: true,
    foto: pasta + 'absolut-1l.webp',
    tamanho: [201, 553],
    lacre: { y: 0.073, largura: 0.12 },
    descricao:
      'Vodka sueca feita com trigo de inverno e água de Åhus. Limpa e encorpada, base perfeita para qualquer drink.',
    notas: ['Limpa', 'Trigo', 'Final seco']
  },
  {
    id: 'absolut-750',
    marca: 'Absolut',
    nome: 'Vodka',
    categoria: 'vodka',
    volume: '750 ml',
    teor: 40,
    origem: 'Suécia',
    preco: 69.9,
    foto: pasta + 'absolut-750.webp',
    tamanho: [179, 505],
    lacre: { y: 0.071, largura: 0.12 },
    descricao: 'A mesma Absolut original na garrafa de 750 ml. Destilada continuamente, sem açúcar adicionado.',
    notas: ['Limpa', 'Trigo', 'Versátil']
  },
  {
    id: 'absolut-tabasco',
    marca: 'Absolut',
    nome: 'Tabasco',
    categoria: 'vodka',
    volume: '750 ml',
    teor: 38,
    origem: 'Suécia',
    preco: 99.9,
    selo: 'Novidade',
    foto: pasta + 'absolut-tabasco.webp',
    tamanho: [165, 490],
    lacre: { y: 0.08, largura: 0.13 },
    descricao: 'Vodka saborizada com a pimenta Tabasco: picância na medida, ótima para Bloody Mary e shots.',
    notas: ['Pimenta', 'Picante', 'Bloody Mary']
  },
  {
    id: 'skyy',
    marca: 'Skyy',
    nome: 'Vodka',
    categoria: 'vodka',
    volume: '980 ml',
    teor: 40,
    origem: 'EUA',
    preco: 34.9,
    preco_antigo: 46.9,
    foto: pasta + 'skyy.webp',
    tamanho: [164, 593],
    lacre: { y: 0.06, largura: 0.13 },
    descricao: 'Vodka americana destilada quatro vezes e filtrada três vezes. Suave e limpa, na icônica garrafa azul.',
    notas: ['Suave', 'Limpa', 'Garrafa azul']
  },
  {
    id: 'smirnoff',
    marca: 'Smirnoff',
    nome: 'Nº 21',
    categoria: 'vodka',
    volume: '998 ml',
    teor: 37.5,
    origem: 'Brasil',
    preco: 37.9,
    preco_antigo: 46.9,
    destaque: true,
    foto: pasta + 'smirnoff.webp',
    tamanho: [256, 900],
    lacre: { y: 0.203, largura: 0.15 },
    galeria: [{ src: pasta + 'smirnoff-back.webp', tamanho: [256, 900], rotulo: 'Verso' }],
    descricao: 'A receita Nº 21, filtrada dez vezes. Neutra e macia — a vodka mais vendida do mundo.',
    notas: ['Neutra', 'Macia', 'Dez vezes filtrada']
  },
  {
    id: 'orloff',
    marca: 'Orloff',
    nome: 'Vodka',
    categoria: 'vodka',
    volume: '1 L',
    teor: 37.5,
    origem: 'Brasil',
    preco: 29.9,
    foto: pasta + 'orloff.webp',
    tamanho: [250, 900],
    lacre: { y: 0.198, largura: 0.15 },
    descricao: 'Vodka cinco vezes destilada, de sabor leve. Ótimo custo-benefício para caipiroska e drinks de festa.',
    notas: ['Leve', '5x destilada', 'Caipiroska']
  },

  {
    id: 'tanqueray',
    marca: 'Tanqueray',
    nome: 'London Dry',
    categoria: 'gin',
    volume: '750 ml',
    teor: 47.3,
    origem: 'Reino Unido',
    preco: 94.9,
    preco_antigo: 109.9,
    selo: 'Favorito do gin tônica',
    destaque: true,
    foto: pasta + 'tanqueray.webp',
    tamanho: [267, 707],
    lacre: { y: 0.173, largura: 0.14 },
    descricao:
      'Versão Export Strength, com quatro botânicos — zimbro, coentro, angélica e alcaçuz — destilados quatro vezes. Seco e marcante, o gin do gin tônica clássico.',
    notas: ['Zimbro', 'Cítrico', 'Seco']
  },
  {
    id: 'bombay',
    marca: 'Bombay',
    nome: 'Sapphire',
    categoria: 'gin',
    volume: '1 L',
    teor: 40,
    origem: 'Inglaterra',
    preco: 139.9,
    destaque: true,
    foto: pasta + 'bombay.webp',
    tamanho: [300, 900],
    lacre: { y: 0.145, largura: 0.14 },
    descricao: 'Dez botânicos infundidos no vapor durante a destilação. Floral, cítrico e muito equilibrado.',
    notas: ['Floral', 'Cítrico', 'Infusão a vapor']
  },
  {
    id: 'beefeater-pink',
    marca: 'Beefeater',
    nome: 'Pink Strawberry',
    categoria: 'gin',
    volume: '750 ml',
    teor: 37.5,
    origem: 'Inglaterra',
    preco: 109.9,
    preco_antigo: 129.9,
    destaque: true,
    foto: pasta + 'beefeater-pink.webp',
    tamanho: [189, 710],
    lacre: { y: 0.163, largura: 0.17 },
    descricao: 'O London Dry da Beefeater com morango natural. Frutado e refrescante, sem perder o zimbro.',
    notas: ['Morango', 'Frutado', 'Refrescante']
  },
  {
    id: 'gordons',
    marca: "Gordon's",
    nome: 'London Dry',
    categoria: 'gin',
    volume: '750 ml',
    teor: 37.5,
    origem: 'Reino Unido',
    preco: 54.9,
    foto: pasta + 'gordons.webp',
    tamanho: [149, 491],
    lacre: { y: 0.164, largura: 0.15 },
    descricao: 'Receita de 1769, com zimbro em destaque e notas cítricas. Clássico, honesto e ótimo para o dia a dia.',
    notas: ['Zimbro', 'Cítrico', 'Clássico']
  },
  {
    id: 'eternity-melancia',
    marca: 'Eternity',
    nome: 'Gin Melancia',
    categoria: 'gin',
    volume: '900 ml',
    teor: 40,
    origem: 'Brasil',
    preco: 34.9,
    foto: pasta + 'eternity-melancia.webp',
    tamanho: [223, 799],
    lacre: { y: 0.094, largura: 0.14 },
    descricao: 'Gin doce sabor melancia. Leve e frutado, pronto para drinks com tônica ou soda e muito gelo.',
    notas: ['Melancia', 'Doce', 'Frutado']
  },

  {
    id: 'cachaca-51',
    marca: 'Cachaça 51',
    nome: 'Pirassununga',
    categoria: 'cachaca',
    volume: '965 ml',
    teor: 39,
    origem: 'Brasil',
    preco: 21.9,
    destaque: true,
    foto: pasta + 'cachaca-51.webp',
    tamanho: [227, 827],
    lacre: { y: 0.168, largura: 0.16 },
    descricao: 'A cachaça mais vendida do mundo, de Pirassununga (SP). A base certa para uma boa caipirinha.',
    notas: ['Caipirinha', 'Cana', 'Brasileira']
  },

  {
    id: 'kit-jack-trio',
    marca: "Jack Daniel's",
    nome: "Família Jack Daniel's",
    categoria: 'kits',
    selo: 'Kit mais pedido',
    destaque: true,
    itens: ['jack-7', 'jack-apple', 'jack-fire'],
    preco: 379.9,
    descricao: 'Old No.7, Tennessee Apple e Tennessee Fire — o trio completo para provar lado a lado ou montar o bar.',
    notas: ['Para presentear', 'Para o bar']
  },
  {
    id: 'kit-tanqueray-3',
    marca: 'Tanqueray',
    nome: 'Tanqueray 3 garrafas',
    categoria: 'kits',
    selo: 'Leve 3, pague menos',
    itens: ['tanqueray', 'tanqueray', 'tanqueray'],
    preco: 259.9,
    descricao:
      'Três garrafas de Tanqueray London Dry para a festa não parar no gin tônica. Cada uma com o próprio lacre.',
    notas: ['Gin tônica', 'Festa']
  },
  {
    id: 'kit-gin-tour',
    marca: 'Seleção',
    nome: 'Gin Tour',
    categoria: 'kits',
    selo: 'Para provar',
    itens: ['tanqueray', 'bombay', 'beefeater-pink'],
    preco: 314.9,
    descricao: 'Três estilos de gin: o seco Tanqueray, o floral Bombay Sapphire e o frutado Beefeater Pink.',
    notas: ['Degustação', 'Gin tônica']
  },
  {
    id: 'kit-whisky-classicos',
    marca: 'Seleção',
    nome: 'Clássicos do Whisky',
    categoria: 'kits',
    selo: 'Presente',
    itens: ['jw-black', 'jack-7'],
    preco: 209.9,
    descricao: 'Escócia e Tennessee na mesma caixa: Johnnie Walker Black Label e Jack Daniel’s Old No.7.',
    notas: ['Para presentear', 'Degustação']
  },
  {
    id: 'kit-festa-vodka',
    marca: 'Seleção',
    nome: 'Festa Vodka',
    categoria: 'kits',
    selo: 'Para a festa',
    itens: ['absolut-1l', 'smirnoff', 'orloff'],
    preco: 129.9,
    descricao: 'Absolut, Smirnoff e Orloff: quase três litros de vodka para caipiroska, drinks e muito gelo.',
    notas: ['Festa', 'Caipiroska']
  }
];

export const lacres_exemplo = {
  'VS-7K2M-9QXA': {
    produto: 'jack-7',
    situacao: 'ok',
    lote: 'L26-0914',
    producao: '14/09/2026',
    verificacoes: 1,
    enviado_ha: 26
  },
  'VS-3PWD-8FJT': {
    produto: 'tanqueray',
    situacao: 'ok',
    lote: 'L26-0822',
    producao: '22/08/2026',
    verificacoes: 2,
    enviado_em: 'ontem · 19:30'
  },
  'VS-4HZP-1LCE': {
    produto: 'jw-black',
    situacao: 'aberta',
    lote: 'L26-0730',
    producao: '30/07/2026',
    verificacoes: 6,
    aberta_em: '02/10/2026 · 21:42'
  }
};

export const codigos_exemplo = [
  { codigo: 'VS-7K2M-9QXA', rotulo: 'Original' },
  { codigo: 'VS-4HZP-1LCE', rotulo: 'Já aberta' },
  { codigo: 'VS-9XRT-0NDW', rotulo: 'Não reconhecido' }
];
