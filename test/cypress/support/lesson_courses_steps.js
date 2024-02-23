// Helper method to get body of iframe which is not empty
const getIframe = (selector) => {
    return cy
    .get(selector, { timeout: 40000 })
    .its('0.contentDocument.body').should('not.be.empty')
    .then(cy.wrap);
};

export const submitPurchase = () => {
    cy.get('#submit').should('be.enabled').click();
};

export const checkButtonDisabled = () => {
    cy.get('#submit').should('be.visible').should('be.disabled');
};

export const submitAcctInfo = () => {
    cy.get('#submit').should('be.enabled').click();
};

export const checkSpinnerVisible = () => {
    cy.get('#spinner.spinner').should('be.visible');
};

export const registerAgain = () => {
    cy.get('button').contains('Sign up again').should('be.visible').click();
};

export const confirmCardDecline = () => {
    cy.get('#card-errors', { timeout: 15000 }).should('be.visible').should('include.text', 'Your card has been declined.');
};

export const confirm3DSCardDecline = () => {
    cy.get('#card-errors', { timeout: 15000 }).should('be.visible').should('include.text', 'unable to authenticate your payment method');
};

export const checkForPubKeyErrors = () => {
    cy.get('.lesson-form div').each(($el) => {
        cy.wrap($el).should('not.contain', 'No such');
        cy.wrap($el).should('not.contain', 'Invalid API Key provided');
    });
};

export const verifyStipeLib = () => {
    cy.get('iframe[src*="https://js.stripe.com/"]').its('0.contentDocument').should('exist');
    cy.get(".StripeElement").should('have.value', '');
};

export const confirmCardDigits = (lastFourCardDigits) => {
    cy.get('#last4', { timeout: 10000 }).should('be.visible').should('have.text', lastFourCardDigits);
};

export const confirmCardUpdate = (lastFourCardDigits) => {
    cy.get('#signup-status', { timeout: 10000 }).should('be.visible').should('include.text', 'Payment Information updated');
    cy.get('#card-last4').should('be.visible').should('have.text', lastFourCardDigits);
};

export const confirmSuccessfulPayment = () => {
    cy.get('#signup-status', { timeout: 10000 }).should('be.visible').should('include.text', 'Woohoo');
};

export const visitAccountPage = () => {
    cy.get('#customer-id').should('be.visible').then(($span) => {
        console.log($span);
        cy.visit(`/account-update/${$span[0].textContent}`);
    });
};

export const postRequestHandler = (route, body, failOnStatusCode = true) => 
    cy.request({
        method: 'POST', 
        url: `${Cypress.env('API_URL')}/${route}`, 
        body: body, 
        failOnStatusCode: failOnStatusCode
    });

export const getRequestHandler = (route) => 
    cy.request({
        method: 'GET', 
        url: `${Cypress.env('API_URL')}/${route}`
    });

export const stripeRequestHandler = (route) => 
    cy.request({
        method: 'GET',
        url: `https://api.stripe.com/v1/${route}`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${Cypress.env('STRIPE_SECRET_KEY')}`
        }
    });

export const verifyStipeElements = () => {
    verifyStipeLib();
    getIframe('.__PrivateStripeElement iframe').find('input[name=cardnumber]').should('be.visible').should('have.value', '');
    getIframe('.__PrivateStripeElement iframe').find('input[name=exp-date]').should('be.visible').should('have.value', '');
    getIframe('.__PrivateStripeElement iframe').find('input[name=cvc]').should('be.visible').should('have.value', '');
};

export const verifyElementsPostSelection = () => {
    getIframe('.__PrivateStripeElement iframe').should('have.attr', 'src');
};

export const verifyNecessaryInputs = () => {
    cy.get('#name').should('be.visible').should('have.value', '');
    cy.get('#name').should('be.visible').should('have.value', '');
    getIframe('.__PrivateStripeElement iframe').find('input[name=cardnumber]').should('be.visible').should('have.value', '');
    getIframe('.__PrivateStripeElement iframe').find('input[name=exp-date]').should('be.visible').should('have.value', '');
    getIframe('.__PrivateStripeElement iframe').find('input[name=cvc]').should('be.visible').should('have.value', '');
};

export const addCheckoutItems = () => {
    cy.get('#first').click();
    const currDate = new Date();
    currDate.setDate(currDate.getDate() + 9);
    cy.get('#summary-table').should('include.text', currDate.toLocaleString('default', { day: '2-digit'}));
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

export const updateCheckout = (cardNumber, expDate, cvc, postalCode) => {
    getIframe('.__PrivateStripeElement iframe').find('input[name=cardnumber]').clear({force: true}).type(cardNumber);
    getIframe('.__PrivateStripeElement iframe').find('input[name=exp-date]').clear({force: true}).type(expDate);
    getIframe('.__PrivateStripeElement iframe').find('input[name=cvc]').clear({force: true}).type(cvc);
    getIframe('.__PrivateStripeElement iframe').find('input[name=postal]').clear({force: true}).type(postalCode);
};

export const approve3DS = () => {
    cy.get('iframe[src*="https://js.stripe.com/v3/authorize-with-url-inner"]', { timeout: 20 * 1000 }).first().getiFrameBody(() => {
      cy.get('iframe[id="challengeFrame"]', { timeout: 10 * 1000 }).first().getiFrameBody(() => {
        cy.get('iframe[name="acsFrame"]', { timeout: 10 * 1000 }).getiFrameBody(() => {
          cy.get("#test-source-authorize-3ds").click();
        });
      });
    });
};

export const decline3DS = () => {
    cy.get('iframe[src*="https://js.stripe.com/v3/authorize-with-url-inner"]', { timeout: 20 * 1000 }).first().getiFrameBody(() => {
      cy.get('iframe[id="challengeFrame"]', { timeout: 10 * 1000 }).first().getiFrameBody(() => {
        cy.get('iframe[name="acsFrame"]', { timeout: 10 * 1000 }).getiFrameBody(() => {
          cy.get("#test-source-fail-3ds").click();
        });
      });
    });
};

export const confirmEmailRejection = (emailId) => {
    cy.get('#customer-exists-error', { timeout: 15000 }).should('be.visible').should('include.text', 'already exists');
};

export const validateAccountUpdatePage = (emaiId, expMonth, expYear, lastFourCardDigits) => {
    cy.get('#billing-email').should('be.visible').should('have.text', emaiId);
    cy.get('#card-exp-month').should('be.visible').should('have.text', expMonth);
    cy.get('#card-exp-year').should('be.visible').should('have.text', `20${expYear}`);
    cy.get('#card-last4').should('be.visible').should('have.text', lastFourCardDigits);
};

export const checkDuplicateEmail = (emailIdTest) => {
    cy.get("#email").clear({force: true}).type(emailIdTest);
    submitAcctInfo();
    cy.get('#customer-exists-error').should('be.visible').should('include.text', 'Customer email already exists');
};