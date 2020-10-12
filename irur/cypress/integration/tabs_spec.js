/* eslint-disable no-undef */
describe('Tabs component', () => {
  it('Create a new tab', () => {
    cy.visit('/');
    cy.wait(500);
    cy.get('#loader').should('not.exist');
    cy.window().then(win => {
      win.app.__vue__.resetDB();
    });
    cy.wait(500);
    cy.get('.tab').rightclick();
    cy.get('#tabs .v-context a[data-name=add]').click();
    cy.get('.tab.active input')
      .clear()
      .type('FooBar{enter}');
    cy.get('.tab.active span').contains('FooBar');
  });

  it('Rename a tab', () => {
    cy.get('.tab span')
      .contains('FooBar')
      .rightclick();
    cy.get('#tabs .v-context a[data-name=rename]').click();
    cy.get('.tab.active input')
      .clear()
      .type('BarFoo{enter}');
    cy.get('.tab.active span').contains('BarFoo');
  });

  it('Delete a tab', () => {
    cy.get('.tab span')
      .contains('BarFoo')
      .rightclick();
    cy.get('#tabs .v-context a[data-name=remove]').click();
    cy.get('#prompt .confirm').click();
    cy.get('a#undo').should('be.visible');
    cy.get('#tabs')
      .find('.tab')
      .should('have.length', 1);
  });
});
