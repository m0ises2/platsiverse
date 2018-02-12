#!/usr/bin/env node

'use strict'

/* eslint new-cap: "off" */

const blessed = require('blessed')
const contrib = require('blessed-contrib')
const platziverseAgent = require('platziverse-agent')
const agent = new platziverseAgent()
const moment = require('moment')

// Instancia de la pantalla:
const screen = blessed.screen()

// references
const agents = new Map()
const agentMetrics = new Map()
let extended = []
let selected = {
  uuid: null,
  type: null
}

// Grid:
const grid = new contrib.grid({
  rows: 1,
  cols: 4,
  screen
})

// Tree component / agents list:
const tree = grid.set(0, 0, 1, 1, contrib.tree, {
  label: 'Connected Agents'
})

// Line/chart component:
const line = grid.set(0, 1, 1, 3, contrib.line, {
  label: 'Metric',
  showLegend: true,
  minY: 0,
  xPadding: 5
})

function renderData() {
  const treeData = {}
  let id = 0

  for (let [uuid, val] of agents) {
    const title = `${val.name} - ${val.pid}`
    treeData[title] = {
      uuid,
      agent: true,
      extended: extended.includes(uuid),
      children: {}
    }

    const metrics = agentMetrics.get(uuid)
    Object.keys(metrics).forEach(type => {
      const metric = { 
        uuid,
        type,
        metric: true
      }

      const metricName = ` ${type} ${" ".repeat(1000)} ${id}`      
      treeData[title].children[metricName] = metric
      ++id
    })
  }
  // Renderizamos en el arbol los datos:
  tree.setData({
    extended: true,
    children: treeData
  })  
  renderMetric()
}

function renderMetric () {
  if (!selected.uuid || !selected.type) {
    line.setData([{ x: [], y: [], title: '' }])
    screen.render()
    return
  }

  const metrics = agentMetrics.get(selected.uuid)
  const values = metrics[selected.type]
  const series = [{
    title: selected.type,
    x: values.map(v=> v.timestamp).slice(10),
    y: values.map(v=> v.value).slice(10)
  }]

  line.setData(series)

  screen.render()
}

agent.on('agent/connected', payload => {
  const { uuid } = payload.agent

  // Si no tengo al agente registrado, regístrelo, por favor:
  if (!agents.has(uuid)) {
    agents.set(uuid, payload.agent)
    agentMetrics.set(uuid, {})
  }

  renderData()
})

agent.on('agent/disconnected', payload => {
  const { uuid } = payload.agent

  if (agents.has(uuid)){
    agents.delete(uuid)
    agentMetrics.delete(uuid)
  }

  renderData()
})

agent.on('agent/message', payload => {
  const { uuid } = payload.agent
  const { timestampo } = payload

  if (!agents.has(uuid)) {
    agents.set(uuid, payload.agent)
    agentMetrics.set(uuid, {})
  }

  // Obtenemos las métricas:
  const metrics = agentMetrics.get(uuid)
  payload.metrics.forEach(metric => {
    const { type, value } = metric
    
    if (!Array.isArray(metrics[type])) {
      metrics[type] = []
    }

    const length = metrics[type].length
    // Si ya tenemos 20 o más métricas renderizadas, entonces borramos la primera para luego insertar una nueva:
    if (length >= 20) {
      metrics[type].shift()
    }

    metrics[type].push({
      value,
      timestamp: moment(metric.timestamp).format('HH:mm:ss')
    })

    // Renderizamos todo el arbol:
    renderData()
  })
})

tree.on('select', node => {
  const { uuid, type } = node
  
  if (node.agent) {
    node.extended ? extended.push(uuid) : extended = extended.filter(e => e !== uuid)
    selected.uuid = null
    selected.type = null
    return
  }

  selected.uuid = uuid
  selected.type = type

  renderMetric()

})

// Key pressed event:
screen.key(['escape', 'q', 'C-c'], (ch, key) => {
  process.exit(0)
})

agent.connect()

// Se le indica al arbol que reciba el focus del teclado, para así poder interactuar con él:
tree.focus()

// Render components:
screen.render()
