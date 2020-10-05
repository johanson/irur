/* eslint-disable no-undef */

describe('Settings component', () => {
  it('Window shows up when the settings button is clicked', () => {
    cy.visit('/');
    cy.get('#settings .btn').click();
    cy.get('#settings .window');
  });
});
