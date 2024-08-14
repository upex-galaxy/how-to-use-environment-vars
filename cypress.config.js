const { defineConfig } = require("cypress");
require('dotenv').config()

const ENV = process.env.TEST_ENV ?? 'qa' // default to qa
const ENVIRONMENTS = {
  qa: 'https://www.saucedemo.com', //as example but really is https://qa.saucedemo.com
  uat: 'https://www.saucedemo.com', // as example but really is https://uat.saucedemo.com
  prod: 'https://www.saucedemo.com',
}
const USERS = {
  qa: process.env.QA_USERNAME,
  uat: process.env.UAT_USERNAME,
  prod: process.env.PROD_USERNAME,
}
//* Definition of Vars
const baseURL = ENVIRONMENTS[ENV]
// const baseURL2 = `https://${ENV === 'prod' ? 'www' : ENV }.saucedemo.com`
const username = USERS[ENV]
if(!username) throw new Error(`No username found for env ${ENV}`)
const password = process.env.PASSWORD
if(!password) throw new Error(`No password found`)

module.exports = defineConfig({
  defaultCommandTimeout: 5000,
  e2e: {
    watchForFileChanges: false,
    baseUrl: baseURL,
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('before:run', ()=>{
        console.log('This is the Env selected: ', ENV)
      })
    },
  },
  env: {
    users:{
      username: username,
      password: password,
    }
  }
});
