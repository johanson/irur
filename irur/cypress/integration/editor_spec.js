/* eslint-disable no-undef */
describe('Editor component basics', () => {
  it('Not have #editor in DOM while not editing', () => {
    cy.visit('/');
    cy.wait(500);
    cy.get('#loader').should('not.exist');
    cy.window().then(win => {
      win.app.__vue__.resetDB();
    });
    cy.wait(500);
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

  it('Not allow to create a new knob without name and mqtt value', () => {
    cy.get('#remote .knob.add-item').click();
    cy.get('#editor').should('be.visible');
    cy.get('#editor button[form=editor]').click();
    cy.get('#editor').should('be.visible');
    cy.wait(1000);
    cy.get('.v-notices').should('exist');
  });

  it('Close the editor with esc keybind', () => {
    cy.get('body').type('{esc}');
    cy.get('#editor').should('not.be.visible');
  });

  it('Add a new knob and check its existance', () => {
    // browsers convert colors to rgb when setting style through JS
    const colorHex = '#FF0000';
    const colorRGB = 'rgb(255, 0, 0)';
    cy.get('#remote .knob.add-item').click();
    cy.get('#editor').should('be.visible');
    cy.get('#knob_name').type('Foo');
    cy.get('#knob_mqtt').type('Bar');
    cy.get('#knob_icon').type('sun'); // check if only this is visible/first one
    cy.get('#color_picker').type(colorHex);
    cy.window().then(win => {
      const id = win.app.__vue__.$refs.editor.knobSaveData.id;
      cy.wrap(id).as('testButton');
      cy.get('#editor').submit();
      cy.get(`#remote .knob[data-id='${id}']`)
        .should('be.visible')
        .should('have.attr', 'title', 'Foo')
        .find('svg')
        .should('have.attr', 'style', `fill: ${colorRGB};`);
      cy.get(`#remote .knob[data-id='${id}']`).rightclick();
      cy.get('#remote .v-context a[data-name=edit]').click();
      cy.get('#knob_mqtt').should('have.value', 'Bar');
    });
  });
});
