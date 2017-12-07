'use strict'

const setupAgentModel = require('./models/agent')
const setupAgent = require('./lib/agent')

const setupMetricModel = require('./models/metric')

const setupDatabase = require('./lib/db')
const defaults = require('defaults')

module.exports = async function (config) {
  config = defaults(config, {
    dialect: 'sqlite',
    pool: {
      max: 10,
      min: 0,
      idel: 10000
    },
    query: {
      raw: true
    }
  })

  // Modelos:
  const sequelize = setupDatabase(config)
  const AgentModel = setupAgentModel(config)
  const MetricModel = setupMetricModel(config)

  // Librerias para los modelos:

  // Relaciones entre los modelos:
  AgentModel.hasMany(MetricModel)
  MetricModel.belongsTo(AgentModel)

  await sequelize.authenticate()

  if (config.setup) {
    await sequelize.sync({ force: true })
  }

  // Instancias de los modelos ya vinculados con sus respectivas librerías y relacionados con los demas modelos:
  const Agent = setupAgent(AgentModel)
  const Metric = {}

  return {
    Agent,
    Metric
  }
}
