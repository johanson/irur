/* eslint-disable no-undef */
describe('Undo component', () => {
  it('XXX', () => {
    cy.visit('/');
    cy.get('#loading').should('not.be.visible');
    cy.wait(500);
    cy.window().then(win => {
      const db = win.app.__vue__.db;
      console.log(db);
      // remove one
      // do undo
      // compare
    });
  });
});
