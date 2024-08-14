// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

beforeEach(() => {
    Cypress.on('uncaught:exception', () => false); // returning false here prevents Cypress from failing the test
    cy.intercept({ resourceType: /xhr|fetch/ }, { log: false });
})
//
//
// -- This is a parent command --
//* cy.login()
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
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })