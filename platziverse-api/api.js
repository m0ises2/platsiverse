'use strict'

const debug = require('debug')('platziverse:api:routes')
const express = require('express')
const db = require('platziverse-db')
const config = require('./config')
const asyncify = require('express-asyncify')
const auth = require('express-jwt')
const guard = require('express-jwt-permissions')()

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
api.get('/agents', auth(config.auth), async (req, res, next) => {
  debug('Request has come to /agents')
  let agents = []
  const { user } = req
  if(!user || !user.username) {
    return next(new Error('Not authorized'))
  }

  try {
    if (user.admin) {
      console.log('Soy admin.')
      agents = await Agent.findConnected()
    } else {
      console.log('No soy admin.')
      agents = await Agent.findByUsername()      
    }
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

api.get('/metrics/:uuid', auth(config.auth), guard.check(['metrics:read']), async (req, res, next) => {
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
