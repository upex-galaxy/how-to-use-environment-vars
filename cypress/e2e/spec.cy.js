
describe('Account - Login', () => {
  
  it('shoud login successfully', () => {
    cy.visit('/')
    cy.get('[data-test="username"]').type(Cypress.env('users').username)
    cy.get('[data-test="password"]').type(Cypress.env('users').password)
    cy.get('[data-test="login-button"]').click()

    cy.get('#inventory_container').should('be.visible')
  })

  it('shoud not login when username is invalid', () => {
    cy.visit('/')
    cy.get('[data-test="username"]').type(Cypress.env('users').username + 'qwe')
    cy.get('[data-test="password"]').type(Cypress.env('users').password)
    cy.get('[data-test="login-button"]').click()

    cy.get('[data-test="error"]')
      .should('have.text', 'Epic sadface: Username and password do not match any user in this service')
  })
})