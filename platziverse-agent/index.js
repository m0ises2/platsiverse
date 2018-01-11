'use strict'

const EventEmitter = require('events')
const debug = require('debug')('platziverse:agent')
const mqtt = require('events')
const defaults = require('defaults')
const uuid = require('uuid')
const { parsePayload } = require('./utils')

const options = {
  name: 'untitled',
  username: 'platzi',
  interval: '5000',
  mqtt: {
    host: 'mqtt://localhost'
  }
}


class PlatziverseAgent extends EventEmitter {
  // Propiedades:
  // Métodos:
  constructor (opts) {
    super()
    
    this._options = defaults(opts)
    this._started = false
    this._timer = null
    this._client = null
    this._agentId = null
  }

  connect () {
    if (!this._started) {
      const opts = this._options
      this._client = mqtt.connect(opts.mqtt.host)      

      this._started = true

      // Nos suscribimos al server mqtt:
      this._client-subscribe('agent/message')
      this._client-subscribe('agent/connected')
      this._client-subscribe('agent/disconnected')

      this._client.on('connect', () => {
        this._agentId = uuid.v4()        
        this.emit('connected', this._agentId )

        this._timer = setInterval(() => {
          this.emit('agent/message', 'Hola guey')
        }, opts.interval)
      })

      this._client.on('message', (topic, payload) => {
        payload = parsePayload(payload)
        let broadcast = false
        switch (topic){
          case 'agent/connected':

            break
          case 'agent/disconnected':

            break
          case 'agent/message':
            broadcast = payload && payload.agent && payload.agent.uuid !== this._agentId
            break          
        }

        if (broadcast) {
          this.emit(topic, payload)
        }

      })

      this._client.on('error', () => this.disconnect() )
    }
  }

  disconnect () {
    if (this._started)  {
      clearInterval(this._timer)
      this._started = false
      this.emit('disconnected')
    }
  }

}

module.exports = PlatziverseAgent
