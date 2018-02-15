'use strict'

const debug = require('debug')('platziverse:db:setup')
const inquirer = require('inquirer')
const chalk = require('chalk')
const db = require('./')
const minimist = require('minimist')

const prompt = inquirer.createPromptModule()

const args = minimist(process.argv)

async function setup () {
  let anwser = null

  console.log(args)

  if (!args.yes) {
    anwser = await prompt([
      {
        type: 'confirm',
        name: 'setup',
        message: 'This will destroy the database, are you sure?'
      }
    ])
  }

  if (anwser && !anwser.setup) return console.log('Nothing happens :)')

  const config = {
    database: process.env.DB_NAME || 'platziverse',
    username: process.env.DB_USER || 'platzi',
    password: process.env.DB_PASS || 'platzi',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: s => debug(s),
    setup: true
  }

  await db(config).catch(handleFatalError)

  console.log('Success!')
  process.exit(0)
}

function handleFatalError (err) {
  console.error(`${chalk.red('[Fatal error]')} ${err.message}`)
  console.error(err.stack)

  process.exit(1)
}

setup()
