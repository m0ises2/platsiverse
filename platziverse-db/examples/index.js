' use stric '

const db = require('../')

async function run () {
  try {
    const config = {
      database: process.env.DB_NAME || 'platziverse',
      username: process.env.DB_USER || 'platzi',
      password: process.env.DB_PASS || 'platzi',
      host: process.env.DB_HOST || 'localhost',
      dialect: 'postgres'
    }
  
    const { Agent, Metric } = await db(config).catch(handleFatalError)
  
    const agent = await Agent.createOrUpdate({
      uuid: "hola perro", 
      name: "doggo", 
      userName: "m0ises2", 
      hostName: "test", 
      pid: 1, 
      connected: true 
    }).catch(handleFatalError)
  
    console.log('--Agent--')
    console.log(agent)
  
    const agents = await Agent.findAll()
  
    console.log('--Agents--')
    console.log(agents)
  
    const metric = await Metric.create(agent.uuid, { value: "300", type: "memory" })
  
    const metrics = await Metric.findByAgentUuid(agent.uuid)
    console.log('--Metrics--')
    console.log(metrics)
  
    const metricsAll = await Metric.findByTypeAgentUuid('memory', agent.uuid)
    console.log('--Metrics by Agent and Type--')
    console.log(metricsAll)
  } catch (error) {
    handleFatalError(error)
  }
}

function handleFatalError (err) {
  console.log(err.message)
  console.log(err.stack)

  process.exit(1)
}

run()
