/* eslint-disable no-undef */
describe('Undo component', () => {
  it('Delete an element and restore it', () => {
    cy.visit('/');
    cy.wait(500);
    cy.get('#loader').should('not.exist');
    cy.window().then(win => {
      win.app.__vue__.resetDB();
    });
    cy.wait(500);
    cy.get('#remote')
      .find('.knob')
      .should('have.length', 3);

    cy.get('#remote .knob:first-of-type').rightclick();
    cy.get('#remote .v-context a[data-name=remove]').click();
    cy.get('#prompt .confirm').click();
    cy.get('#remote')
      .find('.knob')
      .should('have.length', 2);
    cy.get('a#undo')
      .should('be.visible')
      .click();
    cy.get('#remote')
      .find('.knob')
      .should('have.length', 3);
  });
});
