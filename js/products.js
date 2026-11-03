window.lojacatalogo = {
  categorias: [
    { identificador: 'whisky', nome: 'Whisky', icone: 'jw-black', cor: '#fbf1e4' },
    { identificador: 'vodka', nome: 'Vodka', icone: 'absolut-1l', cor: '#eaf2fd' },
    { identificador: 'gin', nome: 'Gin', icone: 'tanqueray', cor: '#e8f6ee' },
    { identificador: 'cachaca', nome: 'Cachaça', icone: 'cachaca-51', cor: '#fdf7dc' },
    { identificador: 'kits', nome: 'Kits', icone: 'kit-jack-trio', cor: '#ecebfa' }
  ],

  produtos: [
    {
      identificador: 'jw-black',
      marca: 'Johnnie Walker',
      nome: 'Black Label 12 anos',
      categoria: 'whisky',
      volume: '750 ml',
      teoralcoolico: 40,
      origem: 'Escócia',
      preco: 99.90,
      prec antigo: 119.90,
      etiqueta: 'Mais vendido',
      destaque: true,
      imagem: 'assets/products/jw-black.webp',
      dimensoesimagem: [304, 1100],
      posicaolacre: { y: 0.180, largura: 0.15 },
      galeria: [
        {
          imagem: 'assets/products/jw-black-box.webp',
          dimensoesimagem: [385, 711],
          legenda: 'Com estojo'
        }
      ],
      descricao: 'Blend de whiskies envelhecidos por no mínimo 12 anos. Encorpado e equilibrado, com fumaça suave, baunilha e frutas escuras.',
      notas: ['Defumado suave', 'Baunilha', 'Frutas escuras']
    },

    {
      identificador: 'jack-7',
      marca: "Jack Daniel's",
      nome: 'Old No.7',
      categoria: 'whisky',
      volume: '1 L',
      teoralcoolico: 40,
      origem: 'EUA (Tennessee)',
      preco: 129.90,
      prec antigo: 189.90,
      destaque: true,
      imagem: 'assets/products/jack-7.webp',
      dimensoesimagem: [365, 1100],
      posicaolacre: { y: 0.097, largura: 0.13 },
      galeria: [
        {
          imagem: 'assets/products/jack-7-box.webp',
          dimensoesimagem: [514, 900],
          legenda: 'Com estojo'
        }
      ],
      descricao: 'O Tennessee whiskey mais famoso do mundo, filtrado gota a gota em carvão de bordo. Macio, com caramelo, baunilha e carvalho tostado.',
      notas: ['Caramelo', 'Baunilha', 'Carvalho tostado']
    },

    {
      identificador: 'kit-jack-trio',
      marca: "Jack Daniel's",
      nome: "Família Jack Daniel's",
      categoria: 'kits',
      etiqueta: 'Kit mais pedido',
      destaque: true,
      produtos: ['jack-7', 'jack-apple', 'jack-fire'],
      preco: 379.90,
      descricao: 'Old No.7, Tennessee Apple e Tennessee Fire — o trio completo para provar lado a lado ou montar o bar.',
      notas: ['Para presentear', 'Para o bar']
    }
  ],

  lacres: {
    'VS-7K2M-9QXA': {
      identificadorproduto: 'jack-7',
      estado: 'ok',
      lote: 'L26-0914',
      fabricadoem: '14/09/2026',
      consultas: 1,
      enviadohadias: 26
    },

    'VS-3PWD-8FJT': {
      identificadorproduto: 'tanqueray',
      estado: 'ok',
      lote: 'L26-0822',
      fabricadoem: '22/08/2026',
      consultas: 2,
      enviadoem: 'ontem · 19:30'
    },

    'VS-4HZP-1LCE': {
      identificadorproduto: 'jw-black',
      estado: 'aberto',
      lote: 'L26-0730',
      fabricadoem: '30/07/2026',
      consultas: 6,
      abertoem: '02/10/2026 · 21:42'
    }
  },

  codigosdeexemplo: [
    { codigo: 'VS-7K2M-9QXA', legenda: 'Original' },
    { codigo: 'VS-4HZP-1LCE', legenda: 'Já aberta' },
    { codigo: 'VS-9XRT-0NDW', legenda: 'Não reconhecido' }
  ]
};
