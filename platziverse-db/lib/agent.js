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

      return updated ? AgentModel.findOne(cond) : exits
    }

    let agentCreated = await AgentModel.create(agent)

    return agentCreated.toJSON()
  }

  function findByUuid (uuid) {
    const cond = {
      where: {
        uuid: {
          [Op.eq]: uuid
        }
      }
    }

    return AgentModel.findOne(cond)
  }

  function findAll () {
    return AgentModel.findAll()
  }

  function findConnected () {
    const cond = {
      connected: {
        [Op.eq]: true
      }
    }

    return AgentModel.findAll(cond)
  }

  function findByUsername (usrnmae) {
    const cond = {
      username: {
        [Op.eq]: usrnmae
      },
      connected: {
        [Op.eq]: true
      }
    }

    return AgentModel.findAll(cond)
  }

  return {
    findById,
    createOrUpdate,
    findByUuid,
    findAll,
    findConnected,
    findByUsername
  }
}
