# Uso y Configuración de Variables de Entorno

Este repositorio enseña cómo configurar y utilizar variables de entorno a nivel local utilizando un archivo `.env`, y cómo pasarlas a un archivo `yml` para los pipelines de CI. Además, se presenta una estrategia y solución para probar diferentes usuarios en distintos ambientes de prueba usando testing condicional. En este caso, se utilizó Cypress, pero la misma estrategia puede aplicarse con Playwright, Selenium u otros frameworks.

## Configuración Local

Para que este repositorio funcione a nivel local, es necesario configurar un archivo `.env` con las siguientes variables:

```bash
TEST_ENV=qa # could be dev, qa, uat, uat, staging, prod

QA_USERNAME_FREE=standard_user
QA_USERNAME_PREM=standard_user

UAT_USERNAME_FREE=performance_glitch_user
UAT_USERNAME_PREM=performance_glitch_user

PROD_USERNAME_FREE=locked_out_user
PROD_USERNAME_PREM=locked_out_user

PASSWORD=secret_sauce

IS_PREMIUM=true
```

## Dependencia
La dependencia `dotenv` se usa para manejar las variables de entorno a nivel local. [Click aquí para más info sobre esta dependencia](https://www.npmjs.com/package/dotenv)

## Configuración en CI (GitHub Actions)
En GitHub Actions, es importante establecer los secrets para llamar las variables en el pipeline. Puedes configurar estos secrets en la sección de "Settings >> Secrets >> Actions" de tu repositorio en GitHub.

### Ejemplo de Configuración en GitHub Actions
```yml
name: "Probando Var de Env"

on:
  workflow_dispatch:
    inputs:
      test_env:
        description: '🧪 Test Env to run on'
        required: true
        default: 'qa'
        type: choice
        options:
        - qa
        - uat
        - prod
      premium:
        description: '🔒 Premium User Tests'
        required: true
        default: false
        type: boolean
env:
  TEST_ENV: ${{github.event.inputs.test_env}} # manual option
  # directly from secret: 
  QA_USERNAME_FREE: ${{ secrets.QA_USERNAME_FREE }}
  QA_USERNAME_PREM: ${{ secrets.QA_USERNAME_PREM }}
  UAT_USERNAME_FREE: ${{ secrets.UAT_USERNAME_FREE }}
  UAT_USERNAME_PREM: ${{ secrets.UAT_USERNAME_PREM }}
  PROD_USERNAME_FREE: ${{ secrets.PROD_USERNAME_FREE }}
  PROD_USERNAME_PREM: ${{ secrets.PROD_USERNAME_PREM }}
  IS_PREMIUM: ${{ github.event.inputs.premium }}

jobs:
  ExecuteTestEnv:
    runs-on: ubuntu-latest

    steps:
    - name: Clonar el Repo
      uses: actions/checkout@v4

    - name: Instalar DevDependencies
      run: npm ci

    - name: Run Cypress Tests
      run: npm run test:ci
```

## Estrategia de Testing Condicional
Se enseñó una estrategia para probar diferentes usuarios en distintos ambientes de prueba usando testing condicional. En este repositorio, se utilizó Cypress, pero la misma estrategia puede aplicarse con Playwright, Selenium u otros frameworks.

### Ejemplo con Cypress

```javascript
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
      on('before:run', ()=>{
        console.log('This is the Env selected: ', ENV)
      })
    },
  },
  env: {
    users:{ username, password }
  }
});

```

Como estamos usando Cypress para este ejemplo, aprovechamos y aplicamos el Custom Action para establecer el método de Login, y aquí pueden observar cómo se usan las Variables tan fácil (ejemplo):
```javascript
// En el archivo de commands.js

Cypress.Commands.add('login', () => {
    cy.session('login', ()=>{
        cy.visit('/')
        cy.get('[data-test="username"]').type(Cypress.env('users').username)
        cy.get('[data-test="password"]').type(Cypress.env('users').password)
        cy.get('[data-test="login-button"]').click()
        cy.get('#inventory_container').should('be.visible')
    })
 })
//
```

Y Así se vería en un Caso de Prueba (casi que ni se nota que estamos iniciando sesión con solamente el usuario de versión "Free" según el Ambiente de Prueba donde estemos, ya sea QA, UAT, PROD, etc) como ejemplo:
```javascript
describe('Account - FreeUser Login', () => {

  it('Should login successfully for Free User', () => {
    cy.login()
  })
})
```