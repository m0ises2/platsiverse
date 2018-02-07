const PlatziverseAgent = require('../')

const agent = new PlatziverseAgent({
  name: 'myapp',
  usename: 'admin',
  interval: 2000
})

agent.addMetric('rss', function getRss() {
  return process.memoryUsage().rss
})

agent.addMetric('promiseMetric', function getRandomPromise () {
  return Promise.resolve(Math.random())
})

agent.addMetric('callbackMetric', function getRandomCallBack (callback) {
  setTimeout(() => {
    callback(null, Math.random())
  })
})

agent.connect()

// This agent only:
agent.on('connected', handler)
agent.on('message', handler)
agent.on('disconnected', handler)

// Other agents:
agent.on('agent/connected', handler)
agent.on('agent/disconnected', handler)
agent.on('agent/message', payload =>{
  console.log(payload)
})

function handler (payload) {
  console.log(payload)
}
