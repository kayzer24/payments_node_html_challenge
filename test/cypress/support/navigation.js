const provideVerificationSection = (sectionName) => {
    if (sectionName == 'videos') {
        return '.video-body';
    }
    return `.${sectionName}-container`;
};

export const verifyUrlNavigation = (section) => {
    cy.on('uncaught:exception', (err, runnable) => {
        return false;
    });
    cy.log(`URL Navigation to be verified for ${section}`);
    cy.visit(`/${section}`);
    cy.get(provideVerificationSection(section)).should('be.visible');
};

export const verifyNavbarNavigation = (section) => {
    cy.on('uncaught:exception', (err, runnable) => {
        return false;
    });
    cy.log(`Navbar Navigation to be verified for ${section}`);
    cy.visit('/');
    cy.get(`.eco-navigation a[href="/${section}"]`).click();
    cy.get(provideVerificationSection(section)).should('be.visible');
};

export const verifyButtonNavigation = (section) => {
    cy.on('uncaught:exception', (err, runnable) => {
        return false;
    });
    cy.log(`Button Navigation to be verified for ${section}`);
    cy.visit('/');
    cy.get(`#${section}`).click();
    cy.get(provideVerificationSection(section)).should('be.visible');
};
