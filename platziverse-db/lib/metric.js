'use strict'

const Sequelize = require('sequelize')
const Op = Sequelize.Op

module.exports = function setupMetric (MetricModel, AgentModel) {
  async function create (uuid, metric) {
    // Primero buscamos al agente en la base de datos:
    let exitsAgent = await AgentModel.findOne({
      where: {
        uuid: {
          [Op.eq]: uuid
        }
      }
    })

    if (exitsAgent) { // si existe:
      Object.assign(metric, { agentId: exitsAgent.id }) // También puede ser metric.agentId = exitsAgent.id
      const result = await MetricModel.create(metric)
      return result.toJSON()
    }
  }

  async function findByAgentUuid (uuid) { // Tipos de métricas que el agente está reportando:
    const cond = {
      attributes: ['type'],
      group: ['type'],
      include: [{
        model: AgentModel,
        attributes: [],
        where: {
          uuid
        }
      }],
      raw: true
    }

    return MetricModel.findAll(cond)
  }

  async function findByTypeAgentUuid (type, uuid) {
    return MetricModel.findAll({
      attributes: ['id', 'type', 'value', 'createdAt'],
      where: {
        type
      },
      //limit: 20,
      order: [ ['createdAt', 'DESC'] ],
      include: [{
        model: AgentModel,
        attributes: ['pid'],
        where: {
          uuid
        }
      }],
      raw: true
    })
  }

  return {
    create,
    findByAgentUuid,
    findByTypeAgentUuid
  }
}
