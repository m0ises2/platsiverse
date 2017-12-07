'use strict'

const test = require('ava')
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const Sequelize = require('sequelize')
const Op = Sequelize.Op

const agentFixtures = require('./fixtures/agent')

let config = {
  logging: function () {
  }
}

let MetricStub = {
  belongsTo: sinon.spy()
}

let single = Object.assign({}, agentFixtures.single)
let id = 1
let uuid = 'YYYYYYY'
let AgentStub = null
let db = null
let sandbox = null

let uuidArgs = {
  where: {
    uuid: {
      [Op.eq]: uuid
    }
  }
}

test.beforeEach(async () => {
  sandbox = sinon.sandbox.create()

  AgentStub = {
    hasMany: sandbox.spy()
  }
  // Model findOne Stub:
  AgentStub.findOne = sandbox.stub()
  AgentStub.findOne.withArgs(uuidArgs).returns(Promise.resolve(agentFixtures.byUuid(uuid)))

  // Model update:
  AgentStub.update = sandbox.stub()
  AgentStub.update.withArgs(single, uuidArgs).returns(Promise.resolve(single))


  // Model findById
  AgentStub.findById = sandbox.stub()
  AgentStub.findById.withArgs(id).returns(Promise.resolve(agentFixtures.byId(id)))

  const setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })

  db = await setupDatabase(config)
})

test.afterEach(() => {
  sandbox && sinon.sandbox.restore()
})

test('Agent', t => {
  t.truthy(db.Agent, 'Agent should exits')
})

test.serial('setup', t => {
  t.true(AgentStub.hasMany.called, 'AgentModel.hasMany was executed')
  t.true(AgentStub.hasMany.calledWith(MetricStub), 'Argument should be the MetricModel.')
  t.true(MetricStub.belongsTo.called, 'MetricModel.hasMany was executed')
  t.true(MetricStub.belongsTo.calledWith(AgentStub), 'Argument should be the AgentModel.')
})

test.serial('AgentFindById', async t => {
  let agent = await db.Agent.findById(id)

  t.true(AgentStub.findById.called, 'findById should be called')
  t.true(AgentStub.findById.calledOnce, 'findById should be called only once')
  t.true(AgentStub.findById.calledWith(id), 'findById should be called with id')

  t.deepEqual(agent, agentFixtures.byId(id), 'should be the same')
})

test.serial('Agent#createOrUpdate - exits', async t => {
  let agent = await db.Agent.createOrUpdate(single)

  t.true(AgentStub.findOne.called, 'findOne should be called on model.')
  t.true(AgentStub.findOne.calledTwice, 'findOne should be called twice.')
  t.true(AgentStub.update.calledOnce, 'update should be called once.')

  t.deepEqual(agent, single, 'agent should be the same.')

})
