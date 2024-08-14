const { defineConfig } = require("cypress");
require('dotenv').config()

const ENV = process.env.TEST_ENV ?? 'qa' // default to qa
const ENVIRONMENTS = {
  qa: 'https://www.saucedemo.com', //as example but really is https://qa.saucedemo.com
  uat: 'https://www.saucedemo.com', // as example but really is https://uat.saucedemo.com
  prod: 'https://www.saucedemo.com',
}
const USERS = {
  qa: {
    free: process.env.QA_USERNAME_FREE, 
    prem: process.env.QA_USERNAME_PREM
  },
  uat: {
    free: process.env.UAT_USERNAME_FREE, 
    prem: process.env.UAT_USERNAME_PREM
  },
  prod: {
    free: process.env.PROD_USERNAME_FREE, 
    prem: process.env.PROD_USERNAME_PREM
  },
}
//* Definition of Vars
const baseUrl = ENVIRONMENTS[ENV]
// const baseURL2 = `https://${ENV === 'prod' ? 'www' : ENV }.saucedemo.com`

//* ----- User Definition ------
const isPremium = process.env.IS_PREMIUM === 'true'
const username = isPremium ? USERS[ENV].prem : USERS[ENV].free
if(!username) throw new Error(`No username found for env ${ENV}`)
const specPattern = isPremium ? 'cypress/e2e/**/*.prem.cy.js' : 'cypress/e2e/**/*.free.cy.js'

const password = process.env.PASSWORD
if(!password) throw new Error(`No password found`)

module.exports = defineConfig({
  defaultCommandTimeout: 5000,
  pageLoadTimeout: 10000,
  
  e2e: {
    specPattern,
    baseUrl,
    watchForFileChanges: false,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  env: {
    users:{ username, password }
  }
});
