'use strict'

const debug = require('debug')('platziverse:api:routes')
const express = require('express')

const api = express.Router()

// Rutas:
api.get('/agents', (req, res) => {
  debug('Request has come to /agents')
  res.status(200).send({})
})

api.get('/agent/:uuid', (req, res, next) => {
  res.status(200).send({ uuid: req.params.uuid })
})

api.get('/metrics/:uuid', (req, res, next) => {
  res.status(200).send({ uuid: req.params.uuid })
})

api.get('/metrics/:uuid/:type', (req, res, next) => {
  res.status(200).send({ uuid: req.params.uuid, type: req.params.type })
})

module.exports = api
