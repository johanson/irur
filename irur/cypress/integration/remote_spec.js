/* eslint-disable no-undef */
describe('Remote component', () => {
  it('XXX', () => {
    cy.visit('/');
    cy.get('#loading').should('not.be.visible');
    cy.wait(500);
  });
});

// * sorting
// * intercept sendIR? or just command/check for notifcaiton callback
// * remove knob
// * add knob (without adding text aka test context menubar
// * edit knob
