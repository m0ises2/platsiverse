#!/usr/bin/env node

'use strict'

/* eslint new-cap: "off" */

const blessed = require('blessed')
const contrib = require('blessed-contrib')
// Instancia de la pantalla:
const screen = blessed.screen()

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

// Key pressed event:
screen.key(['escape', 'q', 'C-c'], (ch, key) => {
  process.exit(0)
})

// Render components:
screen.render()
