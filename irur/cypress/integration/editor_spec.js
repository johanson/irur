/* eslint-disable no-undef */
describe('Editor component', () => {
  it('Not have #editor in DOM while not editing', () => {
    cy.visit('/');
    cy.get('#loading').should('not.be.visible');
    cy.wait(500);
    cy.window().then(win => {
      win.app.__vue__.resetDB();
    });
    cy.get('#editor').should('not.be.visible');
  });

  it('Open and close editor with context menu (add)', () => {
    cy.get('#remote .knob:first-of-type').rightclick();
    cy.get('#remote .v-context a[data-name=add]').click();
    cy.get('#editor').should('be.visible');
    cy.get('#editor .close').click({ force: true });
    cy.get('#editor').should('not.be.visible');
  });

  it('Open and close editor with context menu (edit)', () => {
    cy.get('#remote .knob:first-of-type').rightclick();
    cy.get('#remote .v-context a[data-name=edit]').click();
    cy.get('#editor').should('be.visible');
    cy.get('#editor .close').click({ force: true });
    cy.get('#editor').should('not.be.visible');
  });

  it('Open and close editor with + knob', () => {
    cy.get('#remote .knob.add-item').click();
    cy.get('#editor').should('be.visible');
    cy.get('#editor .close').click({ force: true });
    cy.get('#editor').should('not.be.visible');
  });
});
