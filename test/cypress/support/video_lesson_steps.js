// Helper method to get body of iframe which is not empty
const getIframe = (selector) => {
    return cy
    .get(selector)
    .its('0.contentDocument.body').should('not.be.empty')
    .then(cy.wrap);
};

export const submitPurchase = () => {
    cy.get('#submit').should('be.enabled').click().should('be.disabled'); 
    cy.get('#card-errors').should('be.visible').should('include.text', 'declined');    
};

export const addCheckoutItems = () => {
    cy.get('.video-summary').should('not.exist');
    cy.get('#piano').click();
    cy.get('#drums').click();
    cy.get('.summary-discount.summary-price').should('have.text', '$7');
    cy.get('.summary-subtotal.summary-price').should('have.text', '$35');
    cy.get('.summary-total.summary-price').should('have.text', '$28');
    cy.get('#submit').should('be.disabled');
};

export const performCheckout = (name, email, cardNumber, expDate, cvc, postalCode) => {
    cy.get("#name").type(name);
    cy.get("#email").type(email);
    getIframe('.__PrivateStripeElement iframe').find('input[name=cardnumber]').type(cardNumber);
    getIframe('.__PrivateStripeElement iframe').find('input[name=exp-date]').type(expDate);
    getIframe('.__PrivateStripeElement iframe').find('input[name=cvc]').type(cvc);
    getIframe('.__PrivateStripeElement iframe').find('input[name=postal]').type(postalCode);
};

export const updateCardData = (cardNumber, expDate, cvc, postalCode) => {
    getIframe('.__PrivateStripeElement iframe').find('input[name=cardnumber]').type(cardNumber);
    getIframe('.__PrivateStripeElement iframe').find('input[name=exp-date]').type(expDate);
    getIframe('.__PrivateStripeElement iframe').find('input[name=cvc]').type(cvc);
    getIframe('.__PrivateStripeElement iframe').find('input[name=postal]').type(postalCode);
};

export const updateCart = () => {
    cy.get('#guitar').click({force: true});
    cy.get('.summary-discount.summary-price').should('have.text', '$10');
    cy.get('.summary-subtotal.summary-price').should('have.text', '$50');
    cy.get('.summary-total.summary-price').should('have.text', '$40');
};

export const verifyPaymentIntent = () => {
    cy.intercept('POST', '**/payment_intents/**').as('paymentIntent');
    cy.get('#submit').should('be.enabled').click().should('be.disabled');
    cy.wait('@paymentIntent').then((interception) => {
        const paymentIntent = interception.request.url.split('/')[5];   
        cy.get('#card-errors').should('include.text', 'declined'); 
        updateCart();
        cy.intercept('POST', '**/payment_intents/**').as('secondPaymentIntent');
        cy.get('#submit').should('be.enabled').click().should('be.disabled');
        cy.wait('@secondPaymentIntent').its('request.url').should('include', paymentIntent);
        cy.get('#card-errors').should('include.text', 'declined');
    });   
};

export const verifyCurrency = (currency) => {
    cy.intercept('POST', '**/payment_intents/**').as('paymentIntent');
    cy.get('#submit').should('be.enabled').click().should('be.disabled');
    cy.wait('@paymentIntent').its('response.body.currency').should('eq', currency);
};

export const verifyEmailId = (emailId) => {
    cy.intercept('POST', '**/payment_intents/**').as('paymentIntent');
    cy.get('#submit').should('be.enabled').click().should('be.disabled');
    cy.wait('@paymentIntent').its('request.body').should('include', encodeURIComponent(emailId));
};