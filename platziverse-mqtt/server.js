'use strict'

const debug = require('debug')('platziverse:mqtt')
const mosca = require('mosca')
const redis = require('redis')
const chalk = require('chalk')
const db = require('platziverse-db')
let { parsePayload } = require('./utils')

const backend = {
  type: 'redis',
  redis,
  return_buffers: true
}

const settings = {
  port: 1883,
  backend
}

const config = {
  database: process.env.DB_NAME || 'platziverse',
  username: process.env.DB_USER || 'platzi',
  password: process.env.DB_PASS || 'platzi',
  host: process.env.DB_HOST || 'localhost',
  dialect: 'postgres',
  logging: s => debug(s)
}

let Agent, Metric

const server = new mosca.Server(settings)
const clients = new Map()

// Events:
server.on('ready', async () => {
  const services = await db(config).catch(handleFatalError)

  Agent = services.Agent
  Metric = services.Metric

  console.log(`${chalk.green('[platziverse-mqtt]')} server is running`)
})

server.on('clientConnected', client => {
  debug(`Client Connected: ${client.id}`)
  console.log(`Client Connected: ${client.id}`)
  clients.set(client.id, null)
})

server.on('clientDisconnected', async client => {
  debug(`Client Disconnected: ${client.id}`)
  const agent = clients.get(client.id)
  if (agent) {
    // Mark has disconnected:
    agent.connected = false

    try {
      await Agent.createOrUpdate(agent)
    } catch (error) {
      return handleError(error)
    }
    // Delete from client's map:
    clients.delete(client.id)
    server.publish({
      topic: 'agent/disconnected',
      payload: JSON.stringify({
        agent: {
          uuid: agent.uuid
        }
      })
    })
    debug(`Client ${client.id} associated to Agent ${agent.uuid} marked has disconnected.`)
  }
})

server.on('published', async (packet, client) => {
  debug(`Received: ${packet.topic}`)
  switch (packet.topic) {
    case 'agent/connected':
      break
    case 'agent/disconnected':
      debug(`Payload: ${packet.payload}`)
      break
    case 'agent/message':
      const payload = parsePayload(packet.payload)
      if (payload) {
        payload.agent.connected = true

        let agent
        try {
          agent = await Agent.createOrUpdate(payload.agent)
        } catch (error) {
          return handleError(error)
        }

        debug(`Agent ${agent.uuid} saved.`)

        // Notify Agent is connected:
        if (!clients.get(client.id)) {
          clients.set(client.id, agent)
          server.publish({
            topic: 'agent/connected',
            payload: JSON.stringify({
              uuid: agent.uuid,
              name: agent.name,
              hostname: agent.hostname,
              pid: agent.pid,
              connected: agent.connected
            })
          })
        }
        // Store Metrics:
        for (const iterator of payload.metrics) { // El ciclo forOf, itera sobre el array de métricas y va guardando una por una, de manera serial/secuencial.
          let m
          try {
            m = await Metric.create(agent.uuid, iterator)
          } catch (error) {
            return handleError(error)
          }
          debug(`Metric ${m.id} saved on agent ${agent.uuid}`)
        }
      }

      break
  }
})

server.on('error', handleFatalError)

function handleFatalError (error) {
  console.error(`${chalk.red('[fatal error]')} ${error.message}`)
  console.error(error.stack)
  process.exit(1)
}

function handleError (error) {
  console.error(`${chalk.red('[error]')} ${error.message}`)
  console.error(error.stack)
}

process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)
