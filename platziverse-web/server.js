'use strict'

const debug = require('debug')('platziverse:web')
const chalk = require('chalk')
const http = require('http')
const express = require('express')
const path = require('path')
const socketio = require('socket.io')
const PlatziverseAgent = require('platziverse-agent')
const { pipe } = require('./utils')

// Puerto de conexión:
const port = process.env.PORT || 8080
// Express server:
const app = express()
const server = http.createServer(app)

// Instancia de socketIo
const io = socketio(server)
// Instancia del Agent:
const agent = new PlatziverseAgent()

// Middlewares:
// Sirviendo los archivos estáticos:
app.use(express.static(path.join(__dirname, 'public')))

// Manejo de conexiones al socket.io
io.on('connect', socket => {
  debug(`Connected ${socket.id}`)  
  pipe(agent, socket)
})

// Manejo de errores graves de la aplicación:
function handleFatalError (err) {
  console.error(`${chalk.red('[Fatal error]')} ${err.message}`)
  console.error(err.stack)

  process.exit(1)
}

process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)

server.listen(port, () => {
  console.log(`${chalk.green('Platziverse-web')} server listening on ${port}`)
  agent.connect()
})
