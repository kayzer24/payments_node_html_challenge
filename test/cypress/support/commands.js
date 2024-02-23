// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

// Command to get the iFrame body
Cypress.Commands.add('getiFrameBody', { prevSubject: 'element' }, ($iframe, callback = () => {}) => {
    return cy
        .wrap($iframe)
        .should(iframe => expect(iframe.contents().find('body')).to.exist)
        .then(iframe => cy.wrap(iframe.contents().find('body')))
        .within({}, callback)
  })

  Cypress.Commands.add('getiFrameContent', { prevSubject: 'element' }, ($iframe, callback = () => {}) => {
    return cy
        .wrap($iframe)
        .should(iframe => expect(iframe.contents()).to.exist)
        .then(iframe => cy.wrap(iframe.contents()))
        .within({}, callback)
  })
  //Listen for Ready Event sent from iFrame
  Cypress.Commands.add('isIFrameReady', () => {
    return cy.window().then({ timeout: 10 * 1000 }, window => {
      return new Cypress.Promise(resolve => {
        window.addEventListener('message', e => {
          const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data
  
          if (data.code === 'Ready') {
            resolve()
          }
        })
      })
    })
  })