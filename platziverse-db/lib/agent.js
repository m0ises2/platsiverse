'use strict'

const Sequelize = require('sequelize')
const Op = Sequelize.Op

module.exports = function setupAgent (AgentModel) {
  function findById (id) {
    return AgentModel.findById(id)
  }

  async function createOrUpdate (agent) {
    const cond = {
      where: {
        uuid: {
          [Op.eq]: agent.uuid
        }
      }
    }

    const exits = await AgentModel.findOne(cond)

    if (exits) { // Lo actualizo
      const updated = await AgentModel.update(agent, cond)

      return  updated ? await AgentModel.findOne(cond) : exits
    }

    let agentCreated = AgentModel.create(AgentModel)

    return agentCreated.toJSON()

  }

  return {
    findById,
    createOrUpdate
  }
}