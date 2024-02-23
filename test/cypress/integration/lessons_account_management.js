import { faker } from '@faker-js/faker';

import * as nav from '../support/navigation';
import * as steps from '../support/lesson_courses_steps';

let cardData;

describe('Account Update Page', () => {

    let customerId;
    let emailIdTest;
    let oldPaymentMethod;
    let newPaymentMethod;

    before(() => {
        cy.fixture('cards.json').then(function (testdata) {
        cardData = testdata;
        });
    });

    it('Should Load and Display the Account Details:5.1.1', () => {

        const validCard = cardData.visa.credit.valid;
        const validCardNumber = validCard.cardNumber;
        const lastFourCardDigits = validCardNumber.slice(-4);
        const expYear = faker.datatype.number({ 'min': 22,'max': 30 });

        emailIdTest = faker.internet.email();

        nav.verifyUrlNavigation('lessons');
        steps.addCheckoutItems();
        steps.performCheckout(
            faker.name.findName(), 
            emailIdTest, 
            validCardNumber, 
            '11/' + expYear, 
            validCard.cvv, 
            faker.address.zipCodeByState('CA')
        );
        steps.submitPurchase();
        steps.confirmSuccessfulPayment();
        steps.visitAccountPage();
        steps.validateAccountUpdatePage(emailIdTest, 11, expYear, lastFourCardDigits);

    });

    it('Should allow Customer to Update Card Data without filling Name and EmailId:5.1.3', () => {

        const validCard = cardData.visa.credit.valid;
        const newCard = cardData.mastercard.credit.valid;
        const newCardNumber = newCard.cardNumber;
        const lastFourCardDigits = newCardNumber.slice(-4);

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
        steps.confirmSuccessfulPayment();
        cy.get('#customer-id', { timeout: 10000 }).should('be.visible').then(($span) => {
            customerId = $span[0].textContent;
            steps.stripeRequestHandler(
                `customers/${customerId}/payment_methods?type=card`
            ).then((response) => {
                oldPaymentMethod = response;                
            });            
        });
        steps.visitAccountPage();
        steps.updateCheckout(
            newCardNumber, 
            '11/' + faker.datatype.number({ 'min': 22,'max': 30 }), 
            newCard.cvv,
            faker.address.zipCodeByState('CA')
        );
        steps.submitAcctInfo();
        steps.confirmCardUpdate(lastFourCardDigits);

    });

    it('Should not allow usage of existing Customer Email ID while Updating Account Info:5.1.4', () => {

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
        steps.confirmSuccessfulPayment();
        steps.visitAccountPage();
        steps.checkDuplicateEmail(emailIdTest);

    });

    it('Should attach new Payment Method and Delete old one after Card Update:5.1.5', () => {

        steps.stripeRequestHandler(
            `customers/${customerId}/payment_methods?type=card`
        ).then((response) => {
            newPaymentMethod = response;
            expect(newPaymentMethod.status).to.eq(200);
            expect(newPaymentMethod.statusText).to.eq('OK');
            expect(newPaymentMethod.isOkStatusCode).to.be.true;
            expect(newPaymentMethod.body.has_more).to.be.false;

            expect(newPaymentMethod.body.data[0].id).to.not.eq(oldPaymentMethod.body.data[0].id);
            expect(newPaymentMethod.body.data[0].card.brand).to.not.eq(oldPaymentMethod.body.data[0].card.brand);
            expect(newPaymentMethod.body.data[0].card.last4).to.not.eq(oldPaymentMethod.body.data[0].card.last4);
            expect(newPaymentMethod.body.data[0].card.last4).to.eq(cardData.mastercard.credit.valid.cardNumber.slice(-4));

        }); 

    });

    it('Should show Error Message if Invalid Card is used while Updating Account Info:5.1.6', () => {

        const validCard = cardData.visa.credit.valid;
        const invalidCard = cardData.visa.credit.invalid.card_declined;

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
        steps.confirmSuccessfulPayment();
        steps.visitAccountPage();
        steps.updateCheckout(
            invalidCard.cardNumber, 
            '11/' + faker.datatype.number({ 'min': 22,'max': 30 }), 
            invalidCard.cvv,
            faker.address.zipCodeByState('CA')
        );
        steps.submitAcctInfo();
        steps.confirmCardDecline();

    });

    it('Should show Error Message if Invalid 3DS Card is used while Updating Account Info:5.1.7', () => {

        const validCard = cardData.visa.credit.valid;
        const valid3DSCard = cardData.visa.credit.valid.threeDS;

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
        steps.confirmSuccessfulPayment();
        steps.visitAccountPage();
        steps.updateCheckout(
            valid3DSCard.cardNumber, 
            '11/' + faker.datatype.number({ 'min': 22,'max': 30 }), 
            valid3DSCard.cvv,
            faker.address.zipCodeByState('CA')
        );
        steps.submitAcctInfo();
        cy.wait(15000);
        steps.decline3DS();
        steps.confirm3DSCardDecline();

    });

    it('Should allow Customer to Successfully Update Payment after Card Decline:5.1.8', () => {

        const validCard = cardData.visa.credit.valid;
        const invalidCard = cardData.visa.credit.invalid.card_declined;
        const newCard = cardData.mastercard.credit.valid;
        const newCardNumber = newCard.cardNumber;
        const lastFourCardDigits = newCardNumber.slice(-4);

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
        steps.confirmSuccessfulPayment();
        steps.visitAccountPage();
        steps.updateCheckout(
            invalidCard.cardNumber, 
            '11/' + faker.datatype.number({ 'min': 22,'max': 30 }), 
            invalidCard.cvv,
            faker.address.zipCodeByState('CA')
        );
        steps.submitAcctInfo();
        steps.confirmCardDecline();
        steps.updateCheckout(
            newCardNumber, 
            '11/' + faker.datatype.number({ 'min': 22,'max': 30 }), 
            newCard.cvv,
            faker.address.zipCodeByState('CA')
        );
        steps.submitAcctInfo();
        steps.confirmCardUpdate(lastFourCardDigits);

    });

});

describe('Customer Deletion Route', () => {

    let customerId;
    let scheduleLessonResponse;
    let deleteUncapturedCustomerResponse;

    before(() => {

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
            customerId = $span[0].textContent;
            steps.postRequestHandler(
                'schedule-lesson',
                {
                    customer_id: customerId,
                    amount: '123',
                    description: 'Schedule Lesson Route API Test'
                }
            ).then((response) => {
                scheduleLessonResponse = response;
                steps.postRequestHandler(
                    `delete-account/${customerId}`,
                    null
                ).then((response) => {
                    deleteUncapturedCustomerResponse = response;
                });
            });
        });

    });

    it('Should not Delete Customers with Uncaptured Payments:5.2.2', () => {

        expect(deleteUncapturedCustomerResponse.status).to.eq(200);
        expect(deleteUncapturedCustomerResponse.statusText).to.eq('OK');
        expect(deleteUncapturedCustomerResponse.isOkStatusCode).to.be.true;

        expect(deleteUncapturedCustomerResponse.body.deleted).to.not.exist;
        expect(deleteUncapturedCustomerResponse.body.uncaptured_payments).to.exist;
        expect(deleteUncapturedCustomerResponse.body.uncaptured_payments).to.not.be.empty;

    });

    it('Should list Uncaptured Payments when Deleting Customers with Uncaptured Payments:5.2.3', () => {

        expect(deleteUncapturedCustomerResponse.body.uncaptured_payments).to.exist;
        expect(deleteUncapturedCustomerResponse.body.uncaptured_payments).to.not.be.empty;
        expect(deleteUncapturedCustomerResponse.body.uncaptured_payments[0]).to.eq(scheduleLessonResponse.body.payment.id);

    });

    it('Should Delete Customers with Captured Payments:5.2.1', () => {

        steps.postRequestHandler(
            'complete-lesson-payment',
            {
                payment_intent_id: scheduleLessonResponse.body.payment.id,
                amount: '123'
            }
        ).then(() => {
            steps.postRequestHandler(
                `delete-account/${customerId}`,
                null
            ).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.statusText).to.eq('OK');
                expect(response.isOkStatusCode).to.be.true;

                expect(response.body.deleted).to.exist;
                expect(response.body.deleted).to.be.true;

            });
        });

    });

});