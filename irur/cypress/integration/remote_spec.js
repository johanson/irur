/* eslint-disable no-undef */
describe('Remote component', () => {
  it('Start sorting mode when clickin sort from the context menu', () => {
    cy.visit('/');
    cy.wait(500);
    cy.get('#loader').should('not.exist');
    cy.window().then(win => {
      win.app.__vue__.resetDB();
    });
    cy.wait(500);
    cy.get('#remote .knob:first-of-type').rightclick();
    cy.get('#remote .v-context a[data-name=sort]').click();
    cy.get('#app').should('have.class', 'mode-sort');
  });

  it('Esc exits sort mode', () => {
    cy.get('body').trigger('keydown', { key: 'Escape' });
    cy.get('#app').should('not.have.class', 'mode-sort');
  });
});

// * sorting
// * intercept sendIR? or just command/check for notification promise
