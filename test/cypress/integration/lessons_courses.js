import { faker } from '@faker-js/faker';

import * as nav from '../support/navigation';
import * as postnav from '../support/postnav';
import * as steps from '../support/lesson_courses_steps';

let cardData;

describe('Lesson Signup', () => {

    before(() => {
        cy.fixture('cards.json').then(function (testdata) {
            cardData = testdata;

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
            cy.wait(7500)
            steps.checkForPubKeyErrors();
        });
    });

    it('Should not find any Invalid/Hardcoded PubKey in the BeforeAll Hook Check:3.0', () => {
        // This TC is a placeholder for displaying the Help Text in case the learner has hardcoded the PubKey.
    });

    it('Should Load Lesson Courses Page from Main Page:3.3', () => {
        nav.verifyButtonNavigation('lessons');
        postnav.verifyAddRemoveLessons();
    });

    it('Should Load Lesson Courses Page via URL:3.4', () => {
        nav.verifyUrlNavigation('lessons');
        postnav.verifyAddRemoveLessons();
    });

    it("Should load Sripe JS:3.6", () => {
        nav.verifyUrlNavigation('lessons');
        postnav.verifyAddRemoveLessons();
        steps.verifyStipeLib();
    });
    
    it("Should load Stripe Elements:3.7", () => {
        nav.verifyUrlNavigation('lessons');
        postnav.verifyAddRemoveLessons();
        steps.verifyStipeElements();
    });
    
    it('Should allow user to change Lesson Time after Elements is shown:3.9', () => {
        nav.verifyUrlNavigation('lessons');
        postnav.verifyAddRemoveLessons();
        steps.verifyStipeElements();
        postnav.verifyAddRemoveLessons();
    });

    it('Should collect necessary Inputs from User:3.10', () => {
        nav.verifyUrlNavigation('lessons');
        postnav.verifyAddRemoveLessons();
        steps.verifyNecessaryInputs();
    });

    it('Should have Email and Name as Mandatory Fields:3.11', () => {
        nav.verifyUrlNavigation('lessons');
        postnav.verifyAddRemoveLessons();
        steps.verifyNecessaryInputs();
        steps.checkButtonDisabled();
    });

    it('Should disable the Request Lesson Button while Payment Intents are created/used:3.12', () => {

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
        steps.checkButtonDisabled();

    });

    it('Should disable the Request Lesson Button and show Spinner while Confirming Card Payment:3.13', () => {

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
        steps.checkButtonDisabled();
        steps.checkSpinnerVisible();

    });

    it('Should schedule a Lesson using a non 3DS Card:3.21', () => {

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

    });

    it('Should schedule a Lesson using a 3DS Card:3.22', () => {

        const valid3DSCard = cardData.visa.credit.valid.threeDS;

        nav.verifyUrlNavigation('lessons');
        steps.addCheckoutItems();
        steps.performCheckout(
            faker.name.findName(), 
            faker.internet.email(), 
            valid3DSCard.cardNumber, 
            '11/' + faker.datatype.number({ 'min': 22,'max': 30 }), 
            valid3DSCard.cvv, 
            faker.address.zipCodeByState('CA')
        );
        steps.submitPurchase();
        cy.wait(15000);
        steps.approve3DS();
        steps.confirmSuccessfulPayment();

    });

    it('Should show Last 4 Card Digits after Successful Payment:3.23', () => {

        const validCard = cardData.visa.credit.valid;
        const validCardNumber = validCard.cardNumber;
        const lastFourCardDigits = validCardNumber.slice(-4);

        nav.verifyUrlNavigation('lessons');
        steps.addCheckoutItems();
        steps.performCheckout(
            faker.name.findName(), 
            faker.internet.email(), 
            validCardNumber, 
            '11/' + faker.datatype.number({ 'min': 22,'max': 30 }), 
            validCard.cvv, 
            faker.address.zipCodeByState('CA')
        );
        steps.submitPurchase();
        steps.confirmCardDigits(lastFourCardDigits);

    });

    it('Should not allow Customer to use same Email Twice for Lesson Registration:3.24', () => {

        const validCard = cardData.visa.credit.valid;
        const emaiId = faker.internet.email();

        nav.verifyUrlNavigation('lessons');
        steps.addCheckoutItems();
        steps.performCheckout(
            faker.name.findName(), 
            emaiId, 
            validCard.cardNumber, 
            '11/' + faker.datatype.number({ 'min': 22,'max': 30 }), 
            validCard.cvv, 
            faker.address.zipCodeByState('CA')
        );
        steps.submitPurchase();
        steps.confirmSuccessfulPayment();
        steps.registerAgain();
        steps.addCheckoutItems();
        steps.performCheckout(
            faker.name.findName(), 
            emaiId, 
            validCard.cardNumber, 
            '11/' + faker.datatype.number({ 'min': 22,'max': 30 }), 
            validCard.cvv, 
            faker.address.zipCodeByState('CA')
        );
        steps.submitPurchase();
        steps.confirmEmailRejection(emaiId);

    });

    it('Should Display Card Declined Error Message when Invalid Card is used:3.25', () => {

        const invalidCard = cardData.visa.credit.invalid.card_declined;

        nav.verifyUrlNavigation('lessons');
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
        steps.confirmCardDecline();

    });

    it('Should Display Card Declined Error Message when Invalid 3DS Card is used:3.26', () => {

        const valid3DSCard = cardData.visa.credit.valid.threeDS;

        nav.verifyUrlNavigation('lessons');
        steps.addCheckoutItems();
        steps.performCheckout(
            faker.name.findName(), 
            faker.internet.email(), 
            valid3DSCard.cardNumber, 
            '11/' + faker.datatype.number({ 'min': 22,'max': 30 }), 
            valid3DSCard.cvv, 
            faker.address.zipCodeByState('CA')
        );
        steps.submitPurchase();
        cy.wait(15000);
        steps.decline3DS();
        steps.confirm3DSCardDecline();

    });

    it('Should allow Customer to Successfully Update and Make a Payment after Card Decline:3.27', () => {

        const invalidCard = cardData.visa.credit.invalid.card_declined;
        const validCard = cardData.visa.credit.valid;
        
        nav.verifyUrlNavigation('lessons');
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
        steps.confirmCardDecline();
        steps.updateCheckout(
            validCard.cardNumber, 
            '11/' + faker.datatype.number({ 'min': 22,'max': 30 }), 
            validCard.cvv,
            faker.address.zipCodeByState('CA')
        );
        steps.submitPurchase();
        steps.confirmSuccessfulPayment();

    });

});

describe('Setup Intents Route', () => {

    const name = faker.name.findName();
    const email = faker.internet.email();

    let retrieveCustomerResponse;
    let paymentMethodResponse;

    before(() => {

        const validCard = cardData.visa.credit.valid;

        nav.verifyUrlNavigation('lessons');
        steps.addCheckoutItems();
        steps.performCheckout(
            name, 
            email, 
            validCard.cardNumber, 
            '11/' + faker.datatype.number({ 'min': 22,'max': 30 }), 
            validCard.cvv, 
            faker.address.zipCodeByState('CA')
        );
        steps.submitPurchase();
        cy.get('#customer-id', { timeout: 10000 }).should('be.visible').then(($span) => {
            steps.stripeRequestHandler(
                `customers/${$span[0].textContent}`
            ).then((response) => {
                retrieveCustomerResponse = response;             
            });
            steps.stripeRequestHandler(
                `customers/${$span[0].textContent}/payment_methods?type=card`
            ).then((response) => {
                paymentMethodResponse = response;                
            });            
        });

    });

    it('Should attach only one Payment Method per Customer:3.28', () => {

        expect(paymentMethodResponse.status).to.eq(200);
        expect(paymentMethodResponse.statusText).to.eq('OK');
        expect(paymentMethodResponse.isOkStatusCode).to.be.true;

        expect(paymentMethodResponse.body.has_more).to.be.false;

    });

    it('Should set Name and Email on both the Customer and the Payment Method Objects:3.29', () => {

        expect(retrieveCustomerResponse.status).to.eq(200);
        expect(retrieveCustomerResponse.statusText).to.eq('OK');
        expect(retrieveCustomerResponse.isOkStatusCode).to.be.true;

        expect(retrieveCustomerResponse.body.name).to.exist;
        expect(retrieveCustomerResponse.body.email).to.exist;
        expect(retrieveCustomerResponse.body.name).to.not.be.null;
        expect(retrieveCustomerResponse.body.email).to.not.be.null;
        expect(retrieveCustomerResponse.body.name).to.eq(name);
        expect(retrieveCustomerResponse.body.email).to.eq(email);

        expect(paymentMethodResponse.body.data[0].billing_details.name).to.exist;
        expect(paymentMethodResponse.body.data[0].billing_details.email).to.exist;
        expect(paymentMethodResponse.body.data[0].billing_details.name).to.not.be.null;
        expect(paymentMethodResponse.body.data[0].billing_details.email).to.not.be.null;
        expect(paymentMethodResponse.body.data[0].billing_details.name).to.eq(name);
        expect(paymentMethodResponse.body.data[0].billing_details.email).to.eq(email);

    });

    it('Should add the Metadata about the First Lesson to the Customer Object:3.30', () => {
        
        const currDate = new Date();
        currDate.setDate(currDate.getDate() + 9);

        const lessonDateMonth = `${currDate.toLocaleString('default', { day: '2-digit'})} ${currDate.toLocaleString('default', { month: 'short'})}`;

        expect(retrieveCustomerResponse.body.metadata.first_lesson).to.exist;
        expect(retrieveCustomerResponse.body.metadata.first_lesson).to.not.be.null;
        expect(retrieveCustomerResponse.body.metadata.first_lesson).to.have.string(lessonDateMonth);

    });

});