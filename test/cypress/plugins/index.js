/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */

// plugins/index.js
const result = require('dotenv').config({ path: __dirname+'/./../../../code/server/.env' })

if (result.error) {
  throw result.error
}
console.log(result.parsed)
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  on('task', {
    log(message) {
      console.log(message)
      return null
    },
  })
  
  // `config` is the resolved Cypress config
  // copy any needed variables from process.env to config.env
  config.env.STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY
  config.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
  config.env.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET
  config.env.API_URL = process.env.DOMAIN
  console.log(config) 
  console.log(process) 
  // do not forget to return the changed config object!
  return config
}