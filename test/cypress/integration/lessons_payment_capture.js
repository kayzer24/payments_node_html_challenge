import { faker } from '@faker-js/faker';

import * as nav from '../support/navigation';
import * as steps from '../support/lesson_courses_steps';

let scheduleLessonResponse;

describe('Schedule Lesson Route', () => {         

    before(() => {

        /*
        Before each test in this sub-section,
        - create a customer and attach a payment menthod
        - grab the customer id and make a request to schedule-lesson route using cust_id, amt and desc as i/p parameters
        - get back response and then validate it according to each TC 
        */

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
                steps.postRequestHandler(
                    'schedule-lesson',
                    {
                        customer_id: $span[0].textContent,
                        amount: '123',
                        description: 'Schedule Lesson Route API Test'
                    }
                ).then((response) => {
                    scheduleLessonResponse = response;
                });
            });
                          
        });

    });
    
    it('Should Accept Customer, Amount, and Description as its Input Parameters:4.1.1', () => {

        expect(scheduleLessonResponse.status).to.eq(200);
        expect(scheduleLessonResponse.statusText).to.eq('OK');
        expect(scheduleLessonResponse.isOkStatusCode).to.be.true;

    });

    it('Should Create a Payment Intent:4.1.2', () => {

        expect(scheduleLessonResponse.body.payment.id).to.exist;
        expect(scheduleLessonResponse.body.payment.id).to.not.be.null;
        expect(scheduleLessonResponse.body.payment.id).to.have.string('pi_');
        expect(scheduleLessonResponse.body.payment.amount_received).to.eq(0);
        expect(scheduleLessonResponse.body.payment.amount_capturable).to.eq(123);
        expect(scheduleLessonResponse.body.payment.status).to.eq('requires_capture');
        expect(scheduleLessonResponse.body.payment.charges.data[0].captured).to.be.false;

    });

    it('Should Return a Payment Intent Object upon Succesful Scheduling of a Lesson:4.1.3', () => {

        expect(scheduleLessonResponse.body.payment.object).to.exist;
        expect(scheduleLessonResponse.body.payment.object).to.not.be.null;
        expect(scheduleLessonResponse.body.payment.object).to.eq('payment_intent');

    });

    it('Should Return an Error when using an Invalid Customer ID:4.1.4', () => {

        const invalidCustomerId = 'ci_invalid';

        steps.postRequestHandler(
            'schedule-lesson',
            {
                customer_id: invalidCustomerId,
                amount: "123",
                description: "Schedule Lesson Route API Test",
            },
            false
        ).then((response) => {    
            expect(response.status).to.eq(400);
            expect(response.statusText).to.eq('Bad Request');
            expect(response.isOkStatusCode).to.be.false;

            expect(response.body.error).to.exist;
            
            expect(response.body.error.code).to.exist;
            expect(response.body.error.code).to.not.be.null;
            expect(response.body.error.code).to.eq('resource_missing');

            expect(response.body.error.message).to.exist;
            expect(response.body.error.message).to.not.be.null;
            expect(response.body.error.message).to.eq(`No such customer: '${invalidCustomerId}'`);
        });

    });

    it('Should Create Payment Intents in USD:4.1.5', () => {

        expect(scheduleLessonResponse.body.payment.currency).to.exist;
        expect(scheduleLessonResponse.body.payment.currency).to.not.be.null;
        expect(scheduleLessonResponse.body.payment.currency).to.eq('usd');

    });

});

describe('Complete Lesson Payment Route', () => {

    let completePaymentResponse;

    before(() => {

        steps.postRequestHandler(
            'complete-lesson-payment',
            {
                payment_intent_id: scheduleLessonResponse.body.payment.id,
                amount: '123'
            }
        ).then((response) => {
            completePaymentResponse = response;
        });

    });

    it('Should Accept Payment Intent ID and an Optional Amount as Input Parameters.:4.2.1', () => {

        expect(completePaymentResponse.status).to.eq(200);
        expect(completePaymentResponse.statusText).to.eq('OK');
        expect(completePaymentResponse.isOkStatusCode).to.be.true;

    });

    it('Should Capture and Confirm the Payment Intent:4.2.2', () => {

        expect(completePaymentResponse.body.payment.id).to.exist;
        expect(completePaymentResponse.body.payment.id).to.not.be.null;
        expect(completePaymentResponse.body.payment.id).to.have.string('pi_');
        expect(completePaymentResponse.body.payment.amount_capturable).to.eq(0);
        expect(completePaymentResponse.body.payment.amount_received).to.eq(123);
        expect(completePaymentResponse.body.payment.status).to.eq('succeeded');
        expect(completePaymentResponse.body.payment.charges.data[0].captured).to.be.true;

    });

    it('Should Return a Payment Intent Object upon Succesful Payment Capture:4.2.3', () => {

        expect(completePaymentResponse.body.payment.object).to.exist;
        expect(completePaymentResponse.body.payment.object).to.not.be.null;
        expect(completePaymentResponse.body.payment.object).to.eq('payment_intent');

    });

    it('Should Return an Error when using Invalid Paramaters:4.2.4', () => {

        const invalidPaymentIntent = 'pi_invalid';

        steps.postRequestHandler(
            'complete-lesson-payment',
            {
                payment_intent_id: invalidPaymentIntent,
                amount: '123'
            },
            false
        ).then((response) => {    
            expect(response.status).to.eq(400);
            expect(response.statusText).to.eq('Bad Request');
            expect(response.isOkStatusCode).to.be.false;

            expect(response.body.error).to.exist;
            
            expect(response.body.error.code).to.exist;
            expect(response.body.error.code).to.not.be.null;
            expect(response.body.error.code).to.eq('resource_missing');

            expect(response.body.error.message).to.exist;
            expect(response.body.error.message).to.not.be.null;
            expect(response.body.error.message).to.eq(`No such payment_intent: '${invalidPaymentIntent}'`);
        });

    });

});

describe('Refund Lesson Payment Route', () => {

    let refundPaymentResponse;

    before(() => {

        steps.postRequestHandler(
            'refund-lesson',
            {
                payment_intent_id: scheduleLessonResponse.body.payment.id,
                amount: '123'
            }
        ).then((response) => {
            refundPaymentResponse = response;
        });

    });

    it('Should Accept Payment Intent ID and an Amount as Input Parameters.:4.3.1', () => {
        
        expect(refundPaymentResponse.status).to.eq(200);
        expect(refundPaymentResponse.statusText).to.eq('OK');
        expect(refundPaymentResponse.isOkStatusCode).to.be.true;

    });

    it('Should Refund the Customer for the Lesson Amount.:4.3.2', () => {

        const request = JSON.parse(refundPaymentResponse.requestBody);

        expect(request.amount).to.exist;
        expect(request.amount).to.not.be.null;
        expect(request.amount).to.eq('123');

    });

    it('Should Return a Refund Object ID if the Refund was Successful:4.3.3', () => {

        expect(refundPaymentResponse.body.refund).to.exist;
        expect(refundPaymentResponse.body.refund).to.not.be.null;
        expect(refundPaymentResponse.body.refund).to.have.string('re_');

    });

    it('Should Return an Error when using Invalid Paramaters:4.3.4', () => {

        const invalidPaymentIntent = 'pi_invalid';

        steps.postRequestHandler(
            'refund-lesson',
            {
                payment_intent_id: invalidPaymentIntent,
                amount: '123'
            },
            false
        ).then((response) => {    
            expect(response.status).to.eq(400);
            expect(response.statusText).to.eq('Bad Request');
            expect(response.isOkStatusCode).to.be.false;

            expect(response.body.error).to.exist;
            
            expect(response.body.error.code).to.exist;
            expect(response.body.error.code).to.not.be.null;
            expect(response.body.error.code).to.eq('resource_missing');

            expect(response.body.error.message).to.exist;
            expect(response.body.error.message).to.not.be.null;
            expect(response.body.error.message).to.eq(`No such payment_intent: '${invalidPaymentIntent}'`);
        });

    });

});