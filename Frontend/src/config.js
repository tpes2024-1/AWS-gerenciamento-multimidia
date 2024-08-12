var config = {
  baseURL: 'http://52.67.103.160:8000',
  filtros: [
    {
      name: 'normal',
      filter: [
        1, 0, 0, 0, 0,
        0, 1, 0, 0, 0,
        0, 0, 1, 0, 0,
        0, 0, 0, 1, 0,
      ],
      colorOne: null,
      colorTwo: null
    },
    {
      name: 'invertido',
      filter: 'invert',
      colorOne: null,
      colorTwo: null
    }, {
      name: 'noir',
      filter: 'grayscale',
      colorOne: null,
      colorTwo: null
    },
    {
      name: 'sepia',
      filter: 'sepia',
      colorOne: null,
      colorTwo: null
    }, {
      name: 'vermelho/azul',
      filter: 'duotone',
      colorOne: [250, 50, 50],
      colorTwo: [20, 20, 100]
    }, {
      name: 'verde/roxo',
      filter: 'duotone',
      colorOne: [50, 250, 50],
      colorTwo: [250, 20, 220]
    }, {
      name: 'azul claro/laranja',
      filter: 'duotone',
      colorOne: [40, 250, 250],
      colorTwo: [250, 150, 30]
    }, {
      name: 'azul/vermelho',
      filter: 'duotone',
      colorOne: [40, 70, 200],
      colorTwo: [220, 30, 70]
    }
    , {
      name: 'amaro',
      filter: [
        0.3, 0.6, 0.1, 0, 0,
        0.1, 0.5, 0.1, 0, 0,
        0.2, 0.4, 0.4, 0, 0,
        0, 0, 0, 1, 0
      ],
      colorOne: null,
      colorTwo: null
    }, {
      name: 'kalvin',
      filter: [
        0.63467516026, 0.1781653486, 0.0436880701, 0, 0,
        0.0566428529, 0.6214963644, 0.034960766, 0, 0,
        0.013829964, 0.0271999143, 0.1254453572, 0, 0,
        0, 0, 0, 1, 0
      ],
      colorOne: null,
      colorTwo: null
    }
    , {
      name: 'vintage',
      filter: [
        0.62793, 0.32021, -0.03965, 0, 0.03784,
        0.02578, 0.64411, 0.03259, 0, 0.02926,
        0.0466, -0.08512, 0.52416, 0, 0.02023,
        0, 0, 0, 1, 0
      ],
      colorOne: null,
      colorTwo: null
    }, {
      name: 'alto vermelho',
      filter: [
        2, -1, 0, 0, 0,
        -1, 2, -1, 0, 0,
        -1, -1, 2, 0, 0,
        0, 0, 0, 1, 0
      ],
      colorOne: null,
      colorTwo: null
    }
    , {
      name: 'azulado',
      filter: [
        0.272, 0.534, 0.131, 0, 0,
        0.349, 0.686, 0.168, 0, 0,
        0.393, 0.769, 0.189, 0, 0,
        0, 0, 0, 1, 0
      ],
      colorOne: null,
      colorTwo: null
    }
    , {
      name: 'clareador',
      filter: [
        0.5, 0.5, 0.5, 0, 0,
        0.5, 0.5, 0.5, 0, 0,
        0.5, 0.5, 0.5, 0, 0,
        0, 0, 0, 1, 0
      ],
      colorOne: null,
      colorTwo: null
    }
  ]
}

export default config