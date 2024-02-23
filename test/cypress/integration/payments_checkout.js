const addContext = require('mochawesome/addContext');

describe("Payments Checkout Basic Setup", () => {
  
  it("Checkout Basic Setup visits page /concerts by url:1.3", () => {
    cy.visit("/concert");
  });

  it("Checkout Basic Setup visits page /concerts by Navbar:1.4.1", () => {
    cy.visit("/");
    cy.contains("Concert Tickets").click();
  });

  it("Checkout Basic Setup visits page /concerts by clicking button:1.4.2", () => {
    cy.visit("/");
    cy.get("#concert").click();
  });


});

describe("Payments Checkout Payment Flow", () => {
  let sessionId;
  it("Checkout Basic Setup Adds 2 tickets (3 total):1.6.1", () => {
    cy.visit("/concert");
    cy.get("#add").click();
    cy.get("#add").click();
    cy.get("#quantity-input").should("have.value", 3);
  });
  it("Renders Stripe Checkout successfully - Total and Currency Check:1.6.2", () => {
    cy.visit("/concert", { followRedirect: false })
    cy.get("#add").click();
    cy.intercept({
      method: 'POST', 
      path: '**/create-checkout-session'})
    .as('getCheckoutSession')
    cy.get("#submit").click();
    debugger
    cy.wait('@getCheckoutSession').then((interception) => {
      cy.log(interception)
      expect(interception.response.statusCode).to.eq(200)
    })
    cy.get('#sessionId').contains('cs_test_', { matchCase: false });
    cy.get('#sessionId').invoke('text').then((divText) => {
        sessionId = divText
      });
    cy.get('#sessionId').invoke('text').as('sessionId2');
    cy.get('@sessionId2').then(val => {
      cy.log('sessionId2: ' + val)
      let stripesessionUrl = "https://api.stripe.com/v1/checkout/sessions/" + val;
      cy.request( {
        method: 'GET',
        url: stripesessionUrl,
        qs: {
          'expand[]': 'payment_intent'
        },
        headers: {       
          'Authorization': 'Bearer ' + Cypress.env('STRIPE_SECRET_KEY')
        },
      }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.not.be.null;
        expect(response.body).has.property('amount_total', 4000)
        expect(response.body).has.property('currency', 'usd')
      });
    });
  });

  it("Renders Stripe Checkout Product successfully - Product Name and Image check:1.6.3", () => {
    cy.visit("/concert", { followRedirect: false })
    const ccNumber = "4242424242424242";
    const month = "12";
    const year = "30";
    const cvc = "123";
    const zipCode = "90210";
    cy.get("#add").click();
    cy.get("#submit").click();
    cy.get('#sessionId').contains('cs_test_', { matchCase: false });
    cy.get('#sessionId').invoke('text').then((divText) => {
        sessionId = divText
      });
    cy.get('#sessionId').invoke('text').as('sessionId2');
    cy.get('@sessionId2').then(val => {
      cy.log('sessionId2: ' + val)
      let stripesessionUrl = "https://api.stripe.com/v1/checkout/sessions/" + val + "/line_items";
      cy.request( {
        method: 'GET',
        url: stripesessionUrl,
        qs: {
          'expand[]': 'data.price.product'
        },
        headers: {       
          'Authorization': 'Bearer ' + Cypress.env('STRIPE_SECRET_KEY')
        },
      }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.not.be.null;
        response.body.data.forEach((item) => {
          expect(item).has.property('amount_total', 4000)
          expect(item).has.property('currency', 'usd')
          expect(item).has.property('description', 'Spring Academy Concert')
          expect(item.price.product).has.property('name', 'Spring Academy Concert')
          item.price.product.images.forEach((imageItem) => {
            expect(imageItem).to.equal('https://d37ugbyn3rpeym.cloudfront.net/partner-program/edu/kidvert.jpeg')
          })
        });
      });
    });
  });
  it("Renders Stripe Checkout successfully - Card Payment Method Check:1.7", () => {
    cy.visit("/concert", { followRedirect: false })
    cy.get("#add").click();
    cy.get("#submit").click();
    cy.get('#sessionId').contains('cs_test_', { matchCase: false });
    cy.get('#sessionId').invoke('text').then((divText) => {
        sessionId = divText
      });
    cy.get('#sessionId').invoke('text').as('sessionId2');
    cy.get('@sessionId2').then(val => {
      cy.log('sessionId2: ' + val)
      let stripesessionUrl = "https://api.stripe.com/v1/checkout/sessions/" + val;
      cy.request( {
        method: 'GET',
        url: stripesessionUrl,
        qs: {
          'expand[]': 'payment_intent'
        },
        headers: {       
          'Authorization': 'Bearer ' + Cypress.env('STRIPE_SECRET_KEY')
        },
      }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.not.be.null;
        expect(response.body).has.property('amount_total', 4000)
        expect(response.body).has.property('currency', 'usd')
        expect(response.body).has.property('payment_method_types').to.have.length(1)
        response.body.payment_method_types.forEach((item) => {
          expect(item).to.equal('card')
        });
      });
    });
  });

  it("Renders Stripe Checkout successfully - Cancel and Success Url Check:1.8", () => {
    cy.visit("/concert", { followRedirect: false })
    cy.get("#add").click();
    cy.get("#submit").click();
    cy.get('#sessionId').contains('cs_test_', { matchCase: false });
    cy.get('#sessionId').invoke('text').then((divText) => {
        sessionId = divText
      });
    cy.get('#sessionId').invoke('text').as('sessionId2');
    cy.get('@sessionId2').then(val => {
      cy.log('sessionId2: ' + val)
      let stripesessionUrl = "https://api.stripe.com/v1/checkout/sessions/" + val;
      cy.request( {
        method: 'GET',
        url: stripesessionUrl,
        qs: {
          'expand[]': 'payment_intent'
        },
        headers: {       
          'Authorization': 'Bearer ' + Cypress.env('STRIPE_SECRET_KEY')
        },
      }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.not.be.null;
        expect(response.body).has.property('amount_total', 4000)
        expect(response.body).has.property('currency', 'usd')
        expect(response.body).has.property('cancel_url', Cypress.config().baseUrl + '/concert')
        expect(response.body).has.property('success_url', Cypress.config().baseUrl + '/concert-success/{CHECKOUT_SESSION_ID}')
        expect(response.body).has.property('payment_method_types').to.not.be.null
        // expect(response.body.payment_intent.metadata).has.property('concerttickets', '2')
        expect(response.body).has.property('payment_method_types').to.have.length(1)
        response.body.payment_method_types.forEach((item) => {
          expect(item).to.equal('card')
        });
      });
    });
  });

  it("Renders Stripe Checkout successfully - Payment Intent Metadata Check:1.9", () => {
    cy.visit("/concert", { followRedirect: false })
    cy.get("#add").click();
    cy.get("#submit").click();
    cy.get('#sessionId').contains('cs_test_', { matchCase: false });
    cy.get('#sessionId').invoke('text').then((divText) => {
        sessionId = divText
      });
    cy.get('#sessionId').invoke('text').as('sessionId2');
    cy.get('@sessionId2').then(val => {
      cy.log('sessionId2: ' + val)
      let stripesessionUrl = "https://api.stripe.com/v1/checkout/sessions/" + val;
      cy.request( {
        method: 'GET',
        url: stripesessionUrl,
        qs: {
          'expand[]': 'payment_intent'
        },
        headers: {       
          'Authorization': 'Bearer ' + Cypress.env('STRIPE_SECRET_KEY')
        },
      }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.not.be.null;
        expect(response.body).has.property('amount_total', 4000)
        expect(response.body).has.property('currency', 'usd')
        expect(response.body).has.property('cancel_url', Cypress.config().baseUrl + '/concert')
        expect(response.body).has.property('success_url', Cypress.config().baseUrl + '/concert-success/{CHECKOUT_SESSION_ID}')
        expect(response.body).has.property('payment_method_types').to.not.be.null
        expect(response.body.payment_intent.metadata).has.property('concerttickets', '2')
        expect(response.body).has.property('payment_method_types').to.have.length(1)
        response.body.payment_method_types.forEach((item) => {
          expect(item).to.equal('card')
        });
      });
    });
  });

  it("Renders Stripe Checkout successfully - Cancel and Success Url Check:1.10", () => {
    cy.visit("/concert", { followRedirect: false })
    cy.get("#add").click();
    cy.get("#submit").click();
    cy.get('#sessionId').contains('cs_test_', { matchCase: false });
    cy.get('#sessionId').invoke('text').then((divText) => {
        sessionId = divText
      });
    cy.get('#sessionId').invoke('text').as('sessionId2');
    cy.get('@sessionId2').then(val => {
      cy.log('sessionId2: ' + val)
      let stripesessionUrl = "https://api.stripe.com/v1/checkout/sessions/" + val;
      cy.request( {
        method: 'GET',
        url: stripesessionUrl,
        qs: {
          'expand[]': 'payment_intent'
        },
        headers: {       
          'Authorization': 'Bearer ' + Cypress.env('STRIPE_SECRET_KEY')
        },
      }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.not.be.null;
        expect(response.body).has.property('amount_total', 4000)
        expect(response.body).has.property('currency', 'usd')
        expect(response.body).has.property('cancel_url', Cypress.config().baseUrl + '/concert')
        expect(response.body).has.property('success_url', Cypress.config().baseUrl + '/concert-success/{CHECKOUT_SESSION_ID}')
        expect(response.body).has.property('payment_method_types').to.not.be.null
        // expect(response.body.payment_intent.metadata).has.property('concerttickets', '2')
        expect(response.body).has.property('payment_method_types').to.have.length(1)
        response.body.payment_method_types.forEach((item) => {
          expect(item).to.equal('card')
        });
      });
    });
  });
});

