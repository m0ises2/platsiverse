'use strict'

const debug = require('debug')('platziverse:api:routes')
const express = require('express')
const db = require('platziverse-db')
const config = require('./config')
const asyncify = require('express-asyncify')

const api = asyncify(express.Router())

let services, Agent, Metric

api.use('*', async (req, res, next) => {
  if (!services) {
    debug('Connecting to database.')
    try {
      services = await db(config.db)
    } catch (error) {
      return next(error)
    }
    Agent = services.Agent
    Metric = services.Metric
  }
  next()
})

// Rutas:
api.get('/agents', async (req, res, next) => {
  debug('Request has come to /agents')
  let agents = []
  try {
    agents = await Agent.findConnected()
  } catch (error) {
    next(error)
  }
  res.send(agents)
})

api.get('/agent/:uuid', async (req, res, next) => {
  const { uuid } = req.params
  debug(`request to /agent/${uuid}`)
  let agent
  try {
    agent = await Agent.findByUuid(uuid)
  } catch (error) {
    next(error)
  }

  if (!agent) return next(new Error(`Agent not found with uuid ${uuid}`))

  res.send(agent)
})

api.get('/metrics/:uuid', async (req, res, next) => {
  const { uuid } = req.params
  debug(`request to /metrics/${uuid}`)
  let metrics = []
  try {
    metrics = await Metric.findByAgentUuid(uuid)
  } catch (error) {
    next(error)
  }

  if (!metrics || metrics.length === 0) return next(new Error(`Metrics not found for ${uuid}`))

  res.send(metrics)
})

api.get('/metrics/:uuid/:type', async (req, res, next) => {
  const { uuid, type } = req.params
  debug(`request to /metrics/${uuid}/${type}`)

  let metrics
  try {
    metrics = await Metric.findByTypeAgentUuid(type, uuid)
  } catch (error) {
    next(error)
  }

  if (!metrics || metrics.length === 0) return next(new Error(`Metrics (${type}) not found for ${uuid}`))

  res.send(metrics)
})

module.exports = api
