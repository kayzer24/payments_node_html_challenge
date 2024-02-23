const buttonClicker = (times, identifier) => {
    Cypress._.times(times, () => {
        cy.on('uncaught:exception', (err, runnable) => {
            return false;
        });
        cy.get(`${identifier}`).should('be.visible').click({force: true});
    });
};

export const verifyAddRemoveTickets = () => {
    cy.get('#subtract').should('be.disabled');
    buttonClicker(3, '#add');
    cy.get('#subtract').should('be.enabled');
    cy.get('#submit').should('include.text', '$80.00');
    buttonClicker(3, '#subtract');
    cy.get('#subtract').should('be.disabled');
    cy.get('#submit').should('include.text', '$20.00');
};

export const verifyAddRemoveVideos = () => {
    cy.get('#piano').click({force: true});
    cy.get('#drums').click({force: true});
    cy.get('.summary-discount.summary-price').should('have.text', '$7');
    cy.get('.summary-subtotal.summary-price').should('have.text', '$35');
    cy.get('.summary-total.summary-price').should('have.text', '$28');
    cy.get('#piano').click({force: true});
    cy.get('#drums').click({force: true});
};

export const verifyAddRemoveLessons = () => {
    cy.get('#first').click({force: true});
    const currDate = new Date();
    currDate.setDate(currDate.getDate() + 9);
    cy.get('#summary-table').should('include.text', currDate.toLocaleString('default', { day: '2-digit'}));
    cy.get('#second').click({force: true});
    currDate.setDate(currDate.getDate() + 5);
    cy.get('#summary-table').should('include.text', currDate.toLocaleString('default', { day: '2-digit'}));
};
