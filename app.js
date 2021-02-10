// I. Configuración
graf = d3.select('#graf')

ancho_total = graf.style('width').slice(0, -2)
alto_total = ancho_total * 9 / 16

graf.style('width', `${ ancho_total }px`)
    .style('height', `${ alto_total }px`)

margins = { top: 30, left: 80, right: 15, bottom: 120 }

ancho = ancho_total - margins.left - margins.right
alto  = alto_total - margins.top - margins.bottom

// II. Variables globales
svg = graf.append('svg')
          .style('width', `${ ancho_total }px`)
          .style('height', `${ alto_total }px`)

g = svg.append('g')
        .attr('transform', `translate(${ margins.left }, ${ margins.top })`)
        .attr('width', ancho + 'px')
        .attr('height', alto + 'px')

y = d3.scaleLinear()
          .range([alto, 0])

x = d3.scaleBand()
      .range([0, ancho])
      .paddingInner(0.1)
      .paddingOuter(0.3)

color = d3.scaleOrdinal()
          .range(d3.schemeCategory10)

xAxisGroup = g.append('g')
              .attr('transform', `translate(0, ${ alto })`)
              .attr('class', 'eje')
yAxisGroup = g.append('g')
              .attr('class', 'eje')

titulo = g.append('text')
          .attr('x', `${ancho / 2}px`)
          .attr('y', '-5px')
          .attr('text-anchor', 'middle')
          .text('Población de Hombres y Mujeres por estado')
          .attr('class', 'titulo-grafica')

dataArray = []

region = 'Todas'
regionSelect = d3.select('#region')

genero = 'gentotal'
generoSelect = d3.select('#genero')

ascendente = false

// III. render (update o dibujo)
function render(data) {
  bars = g.selectAll('rect')
            .data(data, d => d.estado)

  bars.enter()
      .append('rect')
        .style('width', '0px')
        .style('height', '0px')
        .attr('class','val')
        .style('y', `${y(0)}px`)
        .style('fill', '#000')
        .style('x', d => x(d.estado) + 'px')
      .merge(bars)
        .transition()
        .duration(600)
          .style('x', d => x(d.estado) + 'px')
          .style('y', d => (y(d[genero])) + 'px')
          .style('height', d => (alto - y(d[genero])) + 'px')
          .style('fill', d => color(d.region))
          .style('width', d => `${x.bandwidth()}px`)


  bars.exit()
  .transition()
  .duration(600)
    .style('height', '0px')
    .style('y', d => `${y(0)}px`)
    .style('fill', '#000')
      .remove()

      yAxisCall = d3.axisLeft(y)
                    .ticks(3)
      yAxisGroup.transition()
                .duration(600)
                .call(yAxisCall)

      xAxisCall = d3.axisBottom(x)
      xAxisGroup.transition()
                .duration(600)
                .call(xAxisCall)
                .selectAll('text')
                .attr('x', '-8px')
                .attr('y', '-5px')
                .attr('text-anchor', 'end')
                .attr('transform', 'rotate(-90)')
}

// IV. Carga de datos
d3.csv('datasets/dataset-inegi.csv')
.then(function(data) {
  data.forEach(d => {
    d.gentotal = +d.gentotal
    d.hombres = +d.hombres
    d.mujeres = +d.mujeres
  })

  dataArray = data

  maxy = d3.max(data, d => d.gentotal*1.2)
  y.domain([0, maxy])
  x.domain(data.map(d => d.estado))

  color.domain(data.map(d => d.region))

  regionSelect.append('option')
              .attr('value', 'Todas')
              .text('Todas')
  color.domain().forEach(d => {
  regionSelect.append('option')
              .attr('value', d)
              .text(d)
  })

  // V. Despliegue

  frame()
})
.catch(e => {
  console.log('No se tuvo acceso al archivo ' + e.message)
})

function frame() {
  dataframe = dataArray
  if (region != 'Todas') {
  dataframe = d3.filter(dataArray, d => d.region == region)
}

dataframe.sort((a, b) => {
  return ascendente ? a[genero] - b[genero] : b[genero] - a[genero]
})

  maxy = d3.max(dataframe, d => d[genero])
  y.domain([0, maxy])
  x.domain(dataframe.map(d => d.estado))

  render(dataframe)
}

regionSelect.on('change', () => {
  region = regionSelect.node().value
  frame()
})

generoSelect.on('change', () => {
  genero = generoSelect.node().value
  frame()
})

function cambiaOrden(){
  ascendente = !ascendente
  frame()
}