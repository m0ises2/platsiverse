'use strict'

const http = require('http')
const express = require('express')
const chalk = require('chalk')
const debug = require('debug')('platziverse:api')
const asyncify = require('express-asyncify')

const app = asyncify(express())
const server = http.createServer(app)

const port = process.env.POST || 3000

// imports de rutas:
const routesApi = require('./api')

app.use('/api', routesApi)

// Manejo de errores con un middleware:
app.use((err, req, res, next) => {
  debug(`Error: ${err.message}`)

  if (err.message.match(/not found/)) {
    return res.status(404).send({ error: err.message })
  }

  res.status(500).send({ error: err.message })
})

function handleFatalError (err) {
  console.error(`${chalk.red('[Fatal error]')} ${err.message}`)
  console.error(err.stack)

  process.exit(1)
}

// Si el módulo NO fue requerido, entonces la instancia escuchará:
if (!module.parent) {
  process.on('uncaughtException', handleFatalError)
  process.on('unhandledRejection', handleFatalError)

  server.listen(port, () => {
    console.log(`${chalk.green('[platziverse-api]')} server listening on post ${port}`)
  })
}

// de lo contrario, exportamos la instancia del server:
module.exports = server
