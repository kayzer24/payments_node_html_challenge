const addContext = require('mochawesome/addContext')
import { faker } from '@faker-js/faker';

import {
  verifyUrlNavigation
} from '../support/navigation';

import * as steps from '../support/video_lesson_steps';

describe("Video Lessons Basic Setup", () => {
  let cardData

  before(() => {
    cy.fixture('cards.json').then(function (testdata) {
      cardData = testdata
    })
  })

  it("Checkout Basic Setup visits page /videos by url:2.3", () => {
    cy.visit("/videos")
    cy.log(cardData.visa.credit.valid.cardNumber)
    cy.log(cardData.visa.credit.invalid.insufficient_funds.cardNumber)
  })

  it("Checkout Basic Setup visits page /videos by Navbar:2.4.1", () => {
    cy.visit("/")
    cy.contains("Video Courses").click()
    cy.get("#piano").click()
    cy.get("#drums").click()
    cy.get("#g2").click()
    cy.get("#summary-table").within(() => {
      cy.get(".summary-subtotal.summary-price").contains('$70', { matchCase: false })
      cy.get(".summary-total.summary-price").contains('$56', { matchCase: false })
    })
    cy.get("#g2").click()
    cy.get("#summary-table").within(() => {
      cy.get(".summary-subtotal.summary-price").contains('$35', { matchCase: false })
      cy.get(".summary-total.summary-price").contains('$28', { matchCase: false })
    })
  })

  it("Checkout Basic Setup visits page /videos by clicking button:2.4.2", () => {
    cy.visit("/")
    cy.get("#videos").click()
    cy.get("#piano").click()
    cy.get("#drums").click()
    cy.get("#g2").click()
    cy.get("#summary-table").within(() => {
      cy.get(".summary-subtotal.summary-price").contains('$70', { matchCase: false })
      cy.get(".summary-total.summary-price").contains('$56', { matchCase: false })
    })
    cy.get("#g2").click()
    cy.get("#summary-table").within(() => {
      cy.get(".summary-discount.summary-price").contains('$7', { matchCase: false })
      cy.get(".summary-subtotal.summary-price").contains('$35', { matchCase: false })
      cy.get(".summary-total.summary-price").contains('$28', { matchCase: false })
    })
  })
})

describe("Incorporating Elements and setting up the payment form", () => {

  let cardData

  before(() => {
    cy.fixture('cards.json').then(function (testdata) {
      cardData = testdata
    })
  })
  
  it("Check Stripe Js is loaded:2.6", () => {
    cy.visit("/videos")
    cy.get("#piano").click()
    cy.get("#drums").click()
    cy.get("#g2").click()
    cy.get("#summary-table").within(() => {
      cy.get(".summary-subtotal.summary-price").contains('$70', { matchCase: false })
      cy.get(".summary-total.summary-price").contains('$56', { matchCase: false })
    })
    cy.get("#payment-form").within(() => {
      cy.get('iframe[src*="https://js.stripe.com/"]')
      .its('0.contentDocument').should('exist')
      cy.get('iframe[src*="https://js.stripe.com/"]')
      cy.get("#card-element").should('have.value', '')
    })
  })

  it("Check Stripe Elements are loaded:2.7", () => {
    cy.visit("/videos")
    cy.get("#piano").click()
    cy.get("#drums").click()
    cy.get("#g2").click()
    cy.get("#summary-table").within(() => {
      cy.get(".summary-subtotal.summary-price").contains('$70', { matchCase: false })
      cy.get(".summary-total.summary-price").contains('$56', { matchCase: false })
    })
    cy.get("#payment-form").within(() => {
      cy.get('iframe[src*="https://js.stripe.com/"]')
      .its('0.contentDocument').should('exist')
      cy.get('iframe[src*="https://js.stripe.com/"]')
      cy.get("#card-element").should('have.value', '')
      cy.get("iframe").getiFrameBody(() => {
        cy.get('input[name=cardnumber]').should('have.value', '')
        cy.get('input[name=exp-date]').should('have.value', '')
        cy.get('input[name=cvc]').should('have.value', '')
        
      })
    })
  })

  it("Add Single Item to Cart Enables Payment form:2.8", () => {
    cy.visit("/videos")
    cy.get("#piano").click()
    cy.get("#summary-table").within(() => {
      cy.get(".summary-total.summary-price").contains('$25', { matchCase: false })
    })
    cy.get("#payment-form").within(() => {
      cy.get('iframe[src*="https://js.stripe.com/"]')
      .its('0.contentDocument').should('exist')
      cy.get('iframe[src*="https://js.stripe.com/"]')
      cy.get("#card-element").should('have.value', '')
      cy.get("iframe").getiFrameBody(() => {
        cy.get('input[name=cardnumber]').should('have.value', '')
        cy.get('input[name=exp-date]').should('have.value', '')
        cy.get('input[name=cvc]').should('have.value', '')
        
      })
      cy.get("#submit").should('be.disabled')
    })
  })

  it("Add Multiple Items to Cart Enables Payment form:2.9", () => {
    cy.visit("/videos")
    cy.get("#piano").click()
    cy.get("#drums").click()
    cy.get("#g2").click()
    cy.get("#summary-table").within(() => {
      cy.get(".summary-subtotal.summary-price").contains('$70', { matchCase: false })
      cy.get(".summary-total.summary-price").contains('$56', { matchCase: false })
    })
    cy.get("#payment-form").within(() => {
      cy.get('iframe[src*="https://js.stripe.com/"]')
      .its('0.contentDocument').should('exist')
      cy.get('iframe[src*="https://js.stripe.com/"]')
      cy.get("#card-element").should('have.value', '')
      cy.get("iframe").getiFrameBody(() => {
        cy.get('input[name=cardnumber]').should('have.value', '')
        cy.get('input[name=exp-date]').should('have.value', '')
        cy.get('input[name=cvc]').should('have.value', '')
        
      })
      cy.get("#submit").should('be.disabled')
    })
  })

  it("Add / Remove Multiple Items to Cart Check Payment form:2.10", () => {
    cy.visit("/videos")
    cy.get("#piano").click()
    cy.get("#drums").click()
    cy.get("#g2").click()
    cy.get("#summary-table").within(() => {
      cy.get(".summary-subtotal.summary-price").contains('$70', { matchCase: false })
      cy.get(".summary-total.summary-price").contains('$56', { matchCase: false })
    })
    cy.get("#payment-form").within(() => {
      cy.get("#submit").should('be.disabled')
    })
    cy.get("#g2").click()
    cy.get("#summary-table").within(() => {
      cy.get(".summary-discount.summary-price").contains('$7', { matchCase: false })
      cy.get(".summary-subtotal.summary-price").contains('$35', { matchCase: false })
      cy.get(".summary-total.summary-price").contains('$28', { matchCase: false })
    })
    cy.get("#payment-form").within(() => {
      cy.get('iframe[src*="https://js.stripe.com/"]')
      .its('0.contentDocument').should('exist')
      cy.get('iframe[src*="https://js.stripe.com/"]')
      cy.get("#card-element").should('have.value', '')
      cy.get("iframe").getiFrameBody(() => {
        cy.get('input[name=cardnumber]').should('have.value', '')
        cy.get('input[name=exp-date]').should('have.value', '')
        cy.get('input[name=cvc]').should('have.value', '')
        
      })
      cy.get("#submit").should('be.disabled')
    })
    
  })

  it("Check Payment Form Fields:2.11", () => {
    cy.visit("/videos")
    cy.get("#piano").click()
    cy.get("#drums").click()
    cy.get("#g2").click()
    cy.get("#summary-table").within(() => {
      cy.get(".summary-subtotal.summary-price").contains('$70', { matchCase: false })
      cy.get(".summary-total.summary-price").contains('$56', { matchCase: false })
    })
    cy.get("#payment-form").within(() => {
      cy.get('iframe[src*="https://js.stripe.com/"]')
      .its('0.contentDocument').should('exist')
      cy.get('iframe[src*="https://js.stripe.com/"]')
      cy.get("#card-element").should('have.value', '')
      cy.get("iframe").getiFrameBody(() => {
        cy.get('input[name=cardnumber]').should('have.value', '')
        cy.get('input[name=exp-date]').should('have.value', '')
        cy.get('input[name=cvc]').should('have.value', '')
        
      })
      cy.get("#name").should('have.value', '')
      cy.get("#email").should('have.value', '')
      cy.get("#card-element").should('have.value', '')
      cy.get("#submit").should('be.disabled')
    })
  })

  it("Check Name and Email fields are required for Payment:2.12", () => {
    cy.visit("/videos")
    cy.get("#piano").click()
    cy.get("#drums").click()
    cy.get("#g2").click()
    cy.get("#summary-table").within(() => {
      cy.get(".summary-subtotal.summary-price").contains('$70', { matchCase: false })
      cy.get(".summary-total.summary-price").contains('$56', { matchCase: false })
    })
    cy.get("#payment-form").within(() => {
      cy.get('iframe[src*="https://js.stripe.com/"]')
      .its('0.contentDocument').should('exist')
      cy.get('iframe[src*="https://js.stripe.com/"]')
      cy.get("#card-element").should('have.value', '')
      cy.get("iframe").getiFrameBody(() => {
        cy.get('input[name=cardnumber]').should('have.value', '')
        cy.get('input[name=exp-date]').should('have.value', '')
        cy.get('input[name=cvc]').should('have.value', '')
      })
      cy.get("#submit").should('be.disabled')
      cy.get("#name").should('have.value', '')
      cy.get("#email").should('have.value', '')
      cy.get("#card-element").should('have.value', '')
      cy.get("#name").type(faker.name.findName())
      cy.get("#submit").should('be.disabled')
      cy.get("#email").type(faker.internet.email())
      cy.get("#submit").should('be.disabled')
    })
  })

  it("Check Payment button is disabled during the Payment call:2.13", () => {
    cy.visit("/videos")
    cy.get("#piano").click()
    cy.get("#drums").click()
    cy.get("#summary-table").within(() => {
      cy.get(".summary-subtotal.summary-price").contains('$35', { matchCase: false })
      cy.get(".summary-total.summary-price").contains('$28', { matchCase: false })
    })
    cy.get("#payment-form").within(() => {
      cy.get('iframe[src*="https://js.stripe.com/"]')
      .its('0.contentDocument').should('exist')
      cy.get('iframe[src*="https://js.stripe.com/"]')
      cy.get("#card-element").should('have.value', '')
      
      cy.get("#submit").should('be.disabled')
      cy.get("#name").should('have.value', '')
      cy.get("#email").should('have.value', '')
      cy.get("#card-element").should('have.value', '')
      cy.get("#name").type(faker.name.findName())
      cy.get("#email").type(faker.internet.email())
      cy.get("iframe").getiFrameBody(() => {
        cy.get('input[name=cardnumber]').type(cardData.visa.credit.valid.cardNumber)
        cy.get('input[name=exp-date]').type('11/' + faker.datatype.number({ 'min': 22,'max': 30 }))
        cy.get('input[name=cvc]').type(cardData.visa.credit.valid.cvv)
        cy.get('input[name=postal]').type(faker.address.zipCodeByState('CA'))
      })

      cy.get("#submit").should('be.enabled')
      cy.intercept({
          method: 'POST', 
          path: '**/payment_intents/**/confirm',
          https: true,
          hostname: 'api.stripe.com'})
        .as('getPaymentIntent')
      cy.get("#submit").click()
      cy.get("#submit").should('be.disabled')
    })
  })

  it("Check Normal Payment is Successful:2.15", () => {
    cy.visit("/videos")
    cy.get("#piano").click()
    cy.get("#drums").click()
    cy.get("#summary-table").within(() => {
      cy.get(".summary-subtotal.summary-price").contains('$35', { matchCase: false })
      cy.get(".summary-total.summary-price").contains('$28', { matchCase: false })
    })
    cy.get("#payment-form").within(() => {
      cy.get('iframe[src*="https://js.stripe.com/"]')
      .its('0.contentDocument').should('exist')
      cy.get('iframe[src*="https://js.stripe.com/"]')
      cy.get("#card-element").should('have.value', '')
      
      cy.get("#submit").should('be.disabled')
      cy.get("#name").should('have.value', '')
      cy.get("#email").should('have.value', '')
      cy.get("#card-element").should('have.value', '')
      cy.get("#name").type(faker.name.findName())
      cy.get("#email").type(faker.internet.email())
      cy.get("iframe").getiFrameBody(() => {
        cy.get('input[name=cardnumber]').type(cardData.visa.credit.valid.cardNumber)
        cy.get('input[name=exp-date]').type('11/' + faker.datatype.number({ 'min': 22,'max': 30 }))
        cy.get('input[name=cvc]').type(cardData.visa.credit.valid.cvv)
        cy.get('input[name=postal]').type(faker.address.zipCodeByState('CA'))
      })

      cy.get("#submit").should('be.enabled')
      cy.intercept({
          method: 'POST', 
          path: '**/payment_intents/**/confirm',
          https: true,
          hostname: 'api.stripe.com'})
        .as('getPaymentIntent')
      cy.get("#submit").click()
      cy.get("#submit").should('be.disabled')
      cy.wait('@getPaymentIntent').then((interception) => {
        cy.log(interception)
        expect(interception.response.statusCode).to.eq(200)
        expect(interception.response.body.status).to.eq('succeeded')
      })
    })
    cy.contains('h3#order-status', 'Thank you for your order!' , { matchCase: false })
  })

  it("Check 3DS Payment is Successful:2.16", () => {
    cy.visit("/videos")
    cy.get("#piano").click()
    cy.get("#drums").click()
    cy.get("#summary-table").within(() => {
      cy.get(".summary-subtotal.summary-price").contains('$35', { matchCase: false })
      cy.get(".summary-total.summary-price").contains('$28', { matchCase: false })
    })
    cy.get("#payment-form").within(() => {
      cy.get('iframe[src*="https://js.stripe.com/"]')
      .its('0.contentDocument').should('exist')
      cy.get('iframe[src*="https://js.stripe.com/"]')
      cy.get("#card-element").should('have.value', '')
      
      cy.get("#submit").should('be.disabled')
      cy.get("#name").should('have.value', '')
      cy.get("#email").should('have.value', '')
      cy.get("#card-element").should('have.value', '')
      cy.get("#name").type(faker.name.findName())
      cy.get("#email").type(faker.internet.email())
      cy.get("iframe").getiFrameBody(() => {
        cy.get('input[name=cardnumber]').type(cardData.visa.credit.valid.threeDS.cardNumber)
        cy.get('input[name=exp-date]').type('11/' + faker.datatype.number({ 'min': 22,'max': 30 }))
        cy.get('input[name=cvc]').type(cardData.visa.credit.valid.threeDS.cvv)
        cy.get('input[name=postal]').type(faker.address.zipCodeByState('CA'))
      })
      cy.get("#submit").should('be.enabled')
      cy.get("#submit").click()
      cy.get("#submit").should('be.disabled')
      cy.wait(10000)
    })
    cy.get('iframe[src*="https://js.stripe.com/v3/authorize-with-url-inner"]', { timeout: 10 * 1000 }).first().getiFrameBody(() => {
      cy.get('iframe[id="challengeFrame"]', { timeout: 10 * 1000 }).first().getiFrameBody(() => {
        cy.get('iframe[name="acsFrame"]', { timeout: 10 * 1000 }).getiFrameBody(() => {
          cy.get("#test-source-authorize-3ds").click()
        })
      })
    })

    cy.contains('h3#order-status', 'Thank you for your order!' , { matchCase: false })
  })
  it("Check Unsuccessful Payment:2.17", () => {
    cy.visit("/videos")
    cy.get("#piano").click()
    cy.get("#drums").click()
    cy.get("#summary-table").within(() => {
      cy.get(".summary-subtotal.summary-price").contains('$35', { matchCase: false })
      cy.get(".summary-total.summary-price").contains('$28', { matchCase: false })
    })
    cy.get("#payment-form").within(() => {
      cy.get('iframe[src*="https://js.stripe.com/"]')
        .its('0.contentDocument').should('exist')
      cy.get('iframe[src*="https://js.stripe.com/"]')
      cy.get("#card-element").should('have.value', '')
      
      cy.get("#submit").should('be.disabled')
      cy.get("#name").should('have.value', '')
      cy.get("#email").should('have.value', '')
      cy.get("#card-element").should('have.value', '')
      cy.get("#name").type(faker.name.findName())
      cy.get("#email").type(faker.internet.email())
      cy.get("iframe").getiFrameBody(() => {
        cy.get('input[name=cardnumber]').type(cardData.visa.credit.invalid.card_declined.cardNumber)
        cy.get('input[name=exp-date]').type('11/' + faker.datatype.number({ 'min': 22,'max': 30 }))
        cy.get('input[name=cvc]').type(cardData.visa.credit.invalid.card_declined.cvv)
        cy.get('input[name=postal]').type(faker.address.zipCodeByState('CA'))
      })
      cy.get("#submit").should('be.enabled')
      cy.get("#submit").click()
      cy.get('#card-errors', { timeout: 15000 }).should('be.visible').should('include.text', 'Your card was declined.');     
    })
    
  })
  it("Check 3DS Payment is Not Successful:2.18", () => {
    cy.visit("/videos")
    cy.get("#piano").click()
    cy.get("#drums").click()
    cy.get("#summary-table").within(() => {
      cy.get(".summary-subtotal.summary-price").contains('$35', { matchCase: false })
      cy.get(".summary-total.summary-price").contains('$28', { matchCase: false })
    })
    cy.get("#payment-form").within(() => {
      cy.get('iframe[src*="https://js.stripe.com/"]')
        .its('0.contentDocument').should('exist')
      cy.get('iframe[src*="https://js.stripe.com/"]')
      cy.get("#card-element").should('have.value', '')
      
      cy.get("#submit").should('be.disabled')
      cy.get("#name").should('have.value', '')
      cy.get("#email").should('have.value', '')
      cy.get("#card-element").should('have.value', '')
      cy.get("#name").type(faker.name.findName())
      cy.get("#email").type(faker.internet.email())
      cy.get("iframe").getiFrameBody(() => {
        cy.get('input[name=cardnumber]').type(cardData.visa.credit.valid.threeDS.cardNumber)
        cy.get('input[name=exp-date]').type('11/' + faker.datatype.number({ 'min': 22,'max': 30 }))
        cy.get('input[name=cvc]').type(cardData.visa.credit.valid.threeDS.cvv)
        cy.get('input[name=postal]').type(faker.address.zipCodeByState('CA'))
      })
      cy.get("#submit").should('be.enabled')
      cy.get("#submit").click()
      cy.get("#submit").should('be.disabled')
      cy.wait(10000)
    })
    cy.get('iframe[src*="https://js.stripe.com/v3/authorize-with-url-inner"]', { timeout: 10 * 1000 }).first().getiFrameBody(() => {
      cy.get('iframe[id="challengeFrame"]', { timeout: 10 * 1000 }).first().getiFrameBody(() => {
        cy.get('iframe[name="acsFrame"]', { timeout: 10 * 1000 }).getiFrameBody(() => {
          cy.get("#test-source-fail-3ds").click()
        })
      })
    })
    cy.get('#card-errors', { timeout: 15000 }).should('be.visible').should('include.text', 'unable to authenticate your payment method');    
  })

  it("Should allow Customer to update Order after Decline:2.19", () => {

    const invalidCard = cardData.visa.credit.invalid.card_declined;

    verifyUrlNavigation('videos');
    steps.addCheckoutItems();
    steps.performCheckout(
      faker.name.findName(), 
      faker.internet.email(), 
      invalidCard.cardNumber, 
      '11/' + faker.datatype.number({ 'min': 22,'max': 30 }), 
      invalidCard.cvv, 
      faker.address.zipCodeByState('CA')
    );
    steps.submitPurchase();
    steps.updateCart();

  });

  it("Should use Original Payment Intent upon Order Failure and subsequent Cart Update:2.20", () => {

    const invalidCard = cardData.visa.credit.invalid.card_declined;

    verifyUrlNavigation('videos');
    steps.addCheckoutItems();
    steps.performCheckout(
      faker.name.findName(), 
      faker.internet.email(), 
      invalidCard.cardNumber, 
      '11/' + faker.datatype.number({ 'min': 22,'max': 30 }), 
      invalidCard.cvv, 
      faker.address.zipCodeByState('CA')
    );
    steps.verifyPaymentIntent();

  });
  
  it("Should make the Payments in USD:2.27", () => {

    const validCard = cardData.visa.credit.valid;

    verifyUrlNavigation('videos');
    steps.addCheckoutItems();
    steps.performCheckout(
      faker.name.findName(), 
      faker.internet.email(), 
      validCard.cardNumber, 
      '11/' + faker.datatype.number({ 'min': 22,'max': 30 }), 
      validCard.cvv, 
      faker.address.zipCodeByState('CA')
    );
    steps.verifyCurrency('usd');

  });

  it("Should set the payment_intent.receipt_email with the Correct Email ID:2.30", () => {

    const validCard = cardData.visa.credit.valid;
    const emailId = faker.internet.email();

    verifyUrlNavigation('videos');
    steps.addCheckoutItems();
    steps.performCheckout(
      faker.name.findName(), 
      emailId,
      validCard.cardNumber, 
      '11/' + faker.datatype.number({ 'min': 22,'max': 30 }), 
      validCard.cvv, 
      faker.address.zipCodeByState('CA')
    );
    steps.verifyEmailId(emailId);

  });

})