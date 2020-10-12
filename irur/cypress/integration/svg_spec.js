/* eslint-disable no-undef */
describe('SvgSprite component', () => {
  it('Should load the svg sprite and write it to DOM', () => {
    cy.visit('/');
    cy.wait(500);
    cy.get('#loader').should('not.exist');
    cy.window().then(win => {
      win.app.__vue__.resetDB();
    });
    cy.wait(500);
    cy.get('#svg-sprite').should('have.descendants', 'svg');
    cy.get('#remote .knob .glyph').should('have.descendants', 'svg');
  });
});
