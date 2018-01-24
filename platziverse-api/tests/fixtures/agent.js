'use strict'

const agent = {
  id: 1,
  uuid: 'YYYYYYY',
  name: 'fixture',
  username: 'platzi',
  hostname: 'test-host',
  pid: 0,
  connected: true,
  createdAt: new Date(),
  updatedAt: new Date()
}

const agents = [
  agent,
  extend(agent, {id: 2, uuid: 'xxxxxx', connected: false, username: 'platziTest'}),
  extend(agent, {id: 3, uuid: 'YYY-YYYY-YYYX', connected: true}),
  extend(agent, {id: 4, uuid: 'YYY-YYYY-YYY23', connected: true, hostname: 'localTest'})
]

function extend (obj, values) {
  const clone = Object.assign({}, obj)

  return Object.assign(clone, values)
}

module.exports = {
  single: agent,
  all: agents,
  connected: agents.filter(a => a.connected),
  platzi: agents.filter(a => a.username === 'platzi'),
  byUuid: id => agents.filter(a => a.uuid === id).shift(),
  byId: id => agents.filter(a => a.id === id).shift()
}
