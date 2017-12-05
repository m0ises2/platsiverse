'use strict'

const setupAgentModel = require('./models/agent')
const setupMetricModel = require('./models/metric')
const setupDatabase = require('./lib/db')

module.exports = async function (config) {
  // Modelos:
  const sequelize = setupDatabase(config)
  const AgentModel = setupAgentModel(config)
  const MetricModel = setupMetricModel(config)

  // Librerias para los modelos:

  // Relaciones entre los modelos:
  AgentModel.hasMany(MetricModel)
  MetricModel.belongsTo(AgentModel)

  await sequelize.authenticate()

  // Instancias de los modelos ya vinculados con sus respectivas librerías y relacionados con los demas modelos:
  const Agent = {}
  const Metric = {}

  return {
    Agent,
    Metric
  }
}
