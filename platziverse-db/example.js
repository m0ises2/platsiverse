'use strict'
require('longjohn')

setTimeout( () => {
  throw new Error('Kaboom')
}, 2000)
