/* =========================================================
   VeriSeal Delivery — catálogo (dados estáticos do frontend)
   Só entram aqui garrafas com foto real em assets/products/.
   As fotos foram recortadas (fundo transparente) a partir das
   imagens originais guardadas em assets/originais/.

   img / size  → arquivo e tamanho em px da foto recortada
   seal        → onde o lacre VeriSeal cruza a garrafa:
                 y = junção tampa/gargalo (fração da altura),
                 w = largura da tira (fração da largura da foto)
   gallery     → fotos extras mostradas no detalhe do produto
   oldPrice    → preço "de" (oferta da semana)
   ========================================================= */

window.VSD_CATEGORIES = [
  { id: 'whisky',  name: 'Whisky',  icon: 'jw-black',      tint: '#fbf1e4' },
  { id: 'vodka',   name: 'Vodka',   icon: 'absolut-1l',    tint: '#eaf2fd' },
  { id: 'gin',     name: 'Gin',     icon: 'tanqueray',     tint: '#e8f6ee' },
  { id: 'cachaca', name: 'Cachaça', icon: 'cachaca-51',    tint: '#fdf7dc' },
  { id: 'kits',    name: 'Kits',    icon: 'kit-jack-trio', tint: '#ecebfa' }
];

{
const P = 'assets/products/';

window.VSD_PRODUCTS = [
  /* ---------------- Whisky ---------------- */
  {
    id: 'jw-black', brand: 'Johnnie Walker', name: 'Black Label 12 anos', category: 'whisky',
    volume: '750 ml', abv: 40, origin: 'Escócia', price: 169.90, oldPrice: 189.90, badge: 'Mais vendido', featured: true,
    img: P + 'jw-black.webp', size: [304, 1100], seal: { y: .18, w: .15 },
    gallery: [{ src: P + 'jw-black-box.webp', size: [385, 711], label: 'Com estojo' }],
    desc: 'Blend de whiskies envelhecidos por no mínimo 12 anos. Encorpado e equilibrado, com fumaça suave, baunilha e frutas escuras.',
    notes: ['Defumado suave', 'Baunilha', 'Frutas escuras']
  },
  {
    id: 'jack-7', brand: "Jack Daniel's", name: 'Old No.7', category: 'whisky',
    volume: '1 L', abv: 40, origin: 'EUA (Tennessee)', price: 169.90, oldPrice: 199.90, featured: true,
    img: P + 'jack-7.webp', size: [365, 1100], seal: { y: .09, w: .13 },
    gallery: [{ src: P + 'jack-7-box.webp', size: [514, 900], label: 'Com estojo' }],
    desc: 'O Tennessee whiskey mais famoso do mundo, filtrado gota a gota em carvão de bordo. Macio, com caramelo, baunilha e carvalho tostado.',
    notes: ['Caramelo', 'Baunilha', 'Carvalho tostado']
  },
  {
    id: 'jack-apple', brand: "Jack Daniel's", name: 'Tennessee Apple', category: 'whisky',
    volume: '1 L', abv: 35, origin: 'EUA (Tennessee)', price: 169.90, featured: true,
    img: P + 'jack-apple.webp', size: [241, 713], seal: { y: .11, w: .14 },
    desc: 'Licor de maçã verde com Jack Daniel’s Old No.7. Fresco e frutado, vai muito bem com gelo ou com tônica.',
    notes: ['Maçã verde', 'Caramelo', 'Refrescante']
  },
  {
    id: 'jack-fire', brand: "Jack Daniel's", name: 'Tennessee Fire', category: 'whisky',
    volume: '1 L', abv: 35, origin: 'EUA (Tennessee)', price: 169.90, oldPrice: 189.90,
    img: P + 'jack-fire.webp', size: [301, 900], seal: { y: .11, w: .13 },
    desc: 'Licor de canela picante com Jack Daniel’s Old No.7. Aquece na medida — perfeito em shot gelado.',
    notes: ['Canela', 'Especiarias', 'Final quente']
  },

  /* ---------------- Vodka ---------------- */
  {
    id: 'absolut-1l', brand: 'Absolut', name: 'Vodka', category: 'vodka',
    volume: '1 L', abv: 40, origin: 'Suécia', price: 89.90, oldPrice: 109.90, badge: 'Mais vendido', featured: true,
    img: P + 'absolut-1l.webp', size: [201, 553], seal: { y: .078, w: .14 },
    desc: 'Vodka sueca feita com trigo de inverno e água de Åhus. Limpa e encorpada, base perfeita para qualquer drink.',
    notes: ['Limpa', 'Trigo', 'Final seco']
  },
  {
    id: 'absolut-750', brand: 'Absolut', name: 'Vodka', category: 'vodka',
    volume: '750 ml', abv: 40, origin: 'Suécia', price: 74.90,
    img: P + 'absolut-750.webp', size: [179, 505], seal: { y: .085, w: .15 },
    desc: 'A mesma Absolut original na garrafa de 750 ml. Destilada continuamente, sem açúcar adicionado.',
    notes: ['Limpa', 'Trigo', 'Versátil']
  },
  {
    id: 'absolut-tabasco', brand: 'Absolut', name: 'Tabasco', category: 'vodka',
    volume: '1 L', abv: 38, origin: 'Suécia', price: 109.90, badge: 'Novidade',
    img: P + 'absolut-tabasco.webp', size: [165, 490], seal: { y: .21, w: .14 },
    desc: 'Vodka saborizada com a pimenta Tabasco: picância na medida, ótima para Bloody Mary e shots.',
    notes: ['Pimenta', 'Picante', 'Bloody Mary']
  },
  {
    id: 'skyy', brand: 'Skyy', name: 'Vodka', category: 'vodka',
    volume: '980 ml', abv: 40, origin: 'EUA', price: 49.90,
    img: P + 'skyy.webp', size: [164, 593], seal: { y: .06, w: .15 },
    desc: 'Vodka americana destilada quatro vezes e filtrada três vezes. Suave e limpa, na icônica garrafa azul.',
    notes: ['Suave', 'Limpa', 'Garrafa azul']
  },
  {
    id: 'smirnoff', brand: 'Smirnoff', name: 'Nº 21', category: 'vodka',
    volume: '998 ml', abv: 37.5, origin: 'Brasil', price: 44.90, oldPrice: 54.90, featured: true,
    img: P + 'smirnoff.webp', size: [256, 900], seal: { y: .2, w: .15 },
    gallery: [{ src: P + 'smirnoff-back.webp', size: [256, 900], label: 'Verso' }],
    desc: 'A receita Nº 21, filtrada dez vezes. Neutra e macia — a vodka mais vendida do mundo.',
    notes: ['Neutra', 'Macia', 'Dez vezes filtrada']
  },
  {
    id: 'orloff', brand: 'Orloff', name: 'Vodka', category: 'vodka',
    volume: '1 L', abv: 37.5, origin: 'Brasil', price: 34.90,
    img: P + 'orloff.webp', size: [250, 900], seal: { y: .195, w: .15 },
    desc: 'Vodka cinco vezes destilada, de sabor leve. Ótimo custo-benefício para caipiroska e drinks de festa.',
    notes: ['Leve', '5x destilada', 'Caipiroska']
  },

  /* ---------------- Gin ---------------- */
  {
    id: 'tanqueray', brand: 'Tanqueray', name: 'London Dry', category: 'gin',
    volume: '750 ml', abv: 43.1, origin: 'Reino Unido', price: 119.90, oldPrice: 139.90, badge: 'Favorito do gin tônica', featured: true,
    img: P + 'tanqueray.webp', size: [267, 707], seal: { y: .185, w: .14 },
    desc: 'Quatro botânicos — zimbro, coentro, angélica e alcaçuz — destilados quatro vezes. Seco e marcante, o gin do gin tônica clássico.',
    notes: ['Zimbro', 'Cítrico', 'Seco']
  },
  {
    id: 'bombay', brand: 'Bombay', name: 'Sapphire', category: 'gin',
    volume: '1 L', abv: 40, origin: 'Inglaterra', price: 149.90, featured: true,
    img: P + 'bombay.webp', size: [300, 900], seal: { y: .135, w: .14 },
    desc: 'Dez botânicos infundidos no vapor durante a destilação. Floral, cítrico e muito equilibrado.',
    notes: ['Floral', 'Cítrico', 'Infusão a vapor']
  },
  {
    id: 'beefeater-pink', brand: 'Beefeater', name: 'Pink Strawberry', category: 'gin',
    volume: '750 ml', abv: 37.5, origin: 'Inglaterra', price: 99.90, oldPrice: 119.90, featured: true,
    img: P + 'beefeater-pink.webp', size: [189, 710], seal: { y: .165, w: .17 },
    desc: 'O London Dry da Beefeater com morango natural. Frutado e refrescante, sem perder o zimbro.',
    notes: ['Morango', 'Frutado', 'Refrescante']
  },
  {
    id: 'gordons', brand: "Gordon's", name: 'London Dry', category: 'gin',
    volume: '750 ml', abv: 37.5, origin: 'Reino Unido', price: 74.90,
    img: P + 'gordons.webp', size: [149, 491], seal: { y: .175, w: .15 },
    desc: 'Receita de 1769, com zimbro em destaque e notas cítricas. Clássico, honesto e ótimo para o dia a dia.',
    notes: ['Zimbro', 'Cítrico', 'Clássico']
  },
  {
    id: 'eternity-melancia', brand: 'Eternity', name: 'Gin Melancia', category: 'gin',
    volume: '900 ml', abv: 40, origin: 'Brasil', price: 39.90,
    img: P + 'eternity-melancia.webp', size: [223, 799], seal: { y: .08, w: .14 },
    desc: 'Gin doce sabor melancia. Leve e frutado, pronto para drinks com tônica ou soda e muito gelo.',
    notes: ['Melancia', 'Doce', 'Frutado']
  },

  /* ---------------- Cachaça ---------------- */
  {
    id: 'cachaca-51', brand: 'Cachaça 51', name: 'Pirassununga', category: 'cachaca',
    volume: '965 ml', abv: 39, origin: 'Brasil', price: 19.90, featured: true,
    img: P + 'cachaca-51.webp', size: [227, 827], seal: { y: .16, w: .16 },
    desc: 'A cachaça mais vendida do mundo, de Pirassununga (SP). A base certa para uma boa caipirinha.',
    notes: ['Caipirinha', 'Cana', 'Brasileira']
  },

  /* ---------------- Kits ---------------- */
  {
    id: 'kit-jack-trio', brand: "Jack Daniel's", name: "Família Jack Daniel's", category: 'kits', badge: 'Kit mais pedido', featured: true,
    items: ['jack-7', 'jack-apple', 'jack-fire'], price: 469.90,
    desc: 'Old No.7, Tennessee Apple e Tennessee Fire — o trio completo para provar lado a lado ou montar o bar.',
    notes: ['Para presentear', 'Para o bar']
  },
  {
    id: 'kit-tanqueray-3', brand: 'Tanqueray', name: 'Tanqueray 3 garrafas', category: 'kits', badge: 'Leve 3, pague menos',
    items: ['tanqueray', 'tanqueray', 'tanqueray'], price: 329.90,
    desc: 'Três garrafas de Tanqueray London Dry para a festa não parar no gin tônica. Cada uma com o próprio lacre.',
    notes: ['Gin tônica', 'Festa']
  },
  {
    id: 'kit-gin-tour', brand: 'Seleção', name: 'Gin Tour', category: 'kits', badge: 'Para provar',
    items: ['tanqueray', 'bombay', 'beefeater-pink'], price: 339.90,
    desc: 'Três estilos de gin: o seco Tanqueray, o floral Bombay Sapphire e o frutado Beefeater Pink.',
    notes: ['Degustação', 'Gin tônica']
  },
  {
    id: 'kit-whisky-classicos', brand: 'Seleção', name: 'Clássicos do Whisky', category: 'kits', badge: 'Presente',
    items: ['jw-black', 'jack-7'], price: 309.90,
    desc: 'Escócia e Tennessee na mesma caixa: Johnnie Walker Black Label e Jack Daniel’s Old No.7.',
    notes: ['Para presentear', 'Degustação']
  },
  {
    id: 'kit-festa-vodka', brand: 'Seleção', name: 'Festa Vodka', category: 'kits', badge: 'Para a festa',
    items: ['absolut-1l', 'smirnoff', 'orloff'], price: 154.90,
    desc: 'Absolut, Smirnoff e Orloff: quase três litros de vodka para caipiroska, drinks e muito gelo.',
    notes: ['Festa', 'Caipiroska']
  }
];
}

/* lacres de exemplo (os pedidos feitos no site geram lacres novos) */
window.VSD_SEALS = {
  'VS-7K2M-9QXA': { product: 'jack-7', status: 'ok', lot: 'L26-0914', made: '14/09/2026', checks: 1, sentAgo: 26 },
  'VS-3PWD-8FJT': { product: 'tanqueray', status: 'ok', lot: 'L26-0822', made: '22/08/2026', checks: 2, sentAt: 'ontem · 19:30' },
  'VS-4HZP-1LCE': { product: 'jw-black', status: 'opened', lot: 'L26-0730', made: '30/07/2026', checks: 6, openedAt: '02/10/2026 · 21:42' }
};

window.VSD_SAMPLE_CODES = [
  { code: 'VS-7K2M-9QXA', label: 'Original' },
  { code: 'VS-4HZP-1LCE', label: 'Já aberta' },
  { code: 'VS-9XRT-0NDW', label: 'Não reconhecido' }
];
