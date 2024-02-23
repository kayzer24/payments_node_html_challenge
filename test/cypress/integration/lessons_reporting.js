import { faker } from '@faker-js/faker';

import * as nav from '../support/navigation';
import * as steps from '../support/lesson_courses_steps';

describe('Calculate Lesson Total Route', () => {

    const amount = 123;
    let finalLessonTotalResponse;
    let initialLessonTotalResponse;

    before(() => {

        cy.fixture('cards.json').then((cardData) => {

            const validCard = cardData.visa.credit.valid;

            nav.verifyUrlNavigation('lessons');
            steps.addCheckoutItems();
            steps.performCheckout(
                faker.name.findName(), 
                faker.internet.email(), 
                validCard.cardNumber, 
                '11/' + faker.datatype.number({ 'min': 22,'max': 30 }), 
                validCard.cvv, 
                faker.address.zipCodeByState('CA')
            );
            steps.submitPurchase();
            cy.get('#customer-id', { timeout: 10000 }).should('be.visible').then(($span) => {
                steps.getRequestHandler(
                    'calculate-lesson-total'
                ).then((response) => {
                    initialLessonTotalResponse = response;
                    steps.postRequestHandler(
                        'schedule-lesson',
                        {
                            customer_id: $span[0].textContent,
                            amount: amount,
                            description: 'Schedule Lesson Route API Test'
                        }
                    ).then((response) => {
                        steps.postRequestHandler(
                            'complete-lesson-payment',
                            {
                                payment_intent_id: response.body.payment.id,
                                amount:amount
                            }
                        ).then(() => {
                            steps.getRequestHandler(
                                'calculate-lesson-total'
                            ).then((response) => {
                                finalLessonTotalResponse = response;
                            });
                        });
                    });
                });                
            });
                          
        });
                
    });

    it('Should Exist:6.1.1', () => {

        expect(finalLessonTotalResponse.status).to.eq(200);
        expect(finalLessonTotalResponse.statusText).to.eq('OK');
        expect(finalLessonTotalResponse.isOkStatusCode).to.be.true;

    });

    it('Should Return the Payment Total, Fee Total and Net Total Values:6.1.2', () => {

        expect(finalLessonTotalResponse.body.net_total).to.exist;
        expect(finalLessonTotalResponse.body.fee_total).to.exist;
        expect(finalLessonTotalResponse.body.payment_total).to.exist;
        expect(finalLessonTotalResponse.body.net_total).to.not.be.null;
        expect(finalLessonTotalResponse.body.fee_total).to.not.be.null;
        expect(finalLessonTotalResponse.body.payment_total).to.not.be.null;
        expect(finalLessonTotalResponse.body.payment_total).to.eq(initialLessonTotalResponse.body.payment_total + amount);
        expect(finalLessonTotalResponse.body.payment_total).to.eq(finalLessonTotalResponse.body.net_total + finalLessonTotalResponse.body.fee_total);
        expect(finalLessonTotalResponse.body.fee_total).to.not.be.eq(initialLessonTotalResponse.body.fee_total);

    });

});

describe('Find Bad Payments Route', () => {

    const name = faker.name.findName();
    const email = faker.internet.email();
    const cardNumber = '4000000000000341';

    let customerId;
    let failedPaymentsResponse;

    before(() => {

        cy.fixture('cards.json').then((cardData) => {

            const validCard = cardData.visa.credit.valid;

            nav.verifyUrlNavigation('lessons');
            steps.addCheckoutItems();
            steps.performCheckout(
                name, 
                email, 
                cardNumber, 
                '11/' + faker.datatype.number({ 'min': 22,'max': 30 }), 
                validCard.cvv, 
                faker.address.zipCodeByState('CA')
            );
            steps.submitPurchase();
            steps.confirmSuccessfulPayment();

            cy.get('#customer-id', { timeout: 10000 }).should('be.visible').then(($span) => {
                customerId = $span[0].textContent;
                steps.postRequestHandler(
                    'schedule-lesson',
                    {
                        customer_id: customerId,
                        amount: 123,
                        description: 'Schedule Lesson Route API Test'
                    },
                    false
                ).then(() => {
                    steps.getRequestHandler(
                        'find-customers-with-failed-payments'
                    ).then((response) => {
                        failedPaymentsResponse = response;
                    });
                });               
            });            

        });
        
    });

    it('Should Exist:6.2.1', () => {

        expect(failedPaymentsResponse.status).to.eq(200);
        expect(failedPaymentsResponse.statusText).to.eq('OK');
        expect(failedPaymentsResponse.isOkStatusCode).to.be.true;

    });

    it('Should Return Information about the Customer, Customers Payment Method and Failed Payments:6.2.2', () => {

        expect(failedPaymentsResponse.body[0]).to.have.keys(customerId);
        expect(failedPaymentsResponse.body[0][customerId]).to.exist;
        expect(failedPaymentsResponse.body[0][customerId]).to.not.be.null;

        expect(failedPaymentsResponse.body[0][customerId].customer.name).to.eq(name);
        expect(failedPaymentsResponse.body[0][customerId].customer.email).to.eq(email);

        expect(failedPaymentsResponse.body[0][customerId].payment_method.brand).to.eq('visa');
        expect(failedPaymentsResponse.body[0][customerId].payment_method.last4).to.eq(cardNumber.slice(-4));

        expect(failedPaymentsResponse.body[0][customerId].payment_intent.status).to.eq('failed');
        expect(failedPaymentsResponse.body[0][customerId].payment_intent.error).to.eq('issuer_declined');

    });

});
