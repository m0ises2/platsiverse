<template>
  <div>
    <metric uuid="13bb8f2f-1863-4622-966f-1ed03fc955c6" type="callbackMetric" :socket="socket"></metric>
    <agent
      v-for="agent in agents"
      :uuid="agent.uuid"
      :key="agent.uuid"
      :socket="socket">
    </agent>
    <p v-if="error">{{error}}</p>
  </div>
</template>

<style>
  body {
    font-family: Arial;
    background: #f8f8f8;
    margin: 0;
  }
</style>

<script>
const request = require('request-promise-native')
const io = require('socket.io-client')
const { serverHost } = require('../config')
const socket = io()

module.exports = {
  data () {
    return {
      agents: [],
      error: null,
      socket
    }
  },

  mounted () {
    this.initialize()
  },

  methods: {
    async initialize () {
      
    }
  }
}
</script>
