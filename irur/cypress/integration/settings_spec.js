/* eslint-disable no-undef */
describe('Settings component', () => {
  it('Makes settings window visible when the settings button is clicked', () => {
    cy.visit('/');
    cy.wait(500);
    cy.get('#loader').should('not.exist');
    cy.window().then(win => {
      win.app.__vue__.resetDB();
    });
    cy.wait(500);
    cy.get('#settings .btn').click();
    cy.get('#settings .window');
  });

  it('Makes manual changes to json', () => {
    cy.get('#settings .window textarea').clear();
    cy.get('#settings .window textarea').type(
      JSON.stringify({
        default: {
          name: 'Default',
          knobs: [
            {
              id: 'wn0gbd99',
              name: 'Foo',
              mqtt: 'Bar',
              icon: '',
              topic_send: '',
              isPlaceholder: false,
            },
          ],
        },
      }),
      {
        parseSpecialCharSequences: false,
      }
    );
  });

  it('Saves changes and makes the prompt window visible', () => {
    cy.get('#settings .save').click();
    cy.get('#prompt').should('be.visible');
  });

  it('Confirms changes are visible, corresponding to DOM/db', () => {
    cy.get('#prompt .confirm').click();
    cy.get('#remote')
      .find('.knob')
      .should('have.length', 2); // 1  + add new knob
  });

  it('Opens and closes settings window', () => {
    cy.get('#settings .btn').click({ force: true });
    cy.get('#settings .window');
    cy.get('#settings .close').click();
    cy.get('#settings .window').should('not.be.visible');
  });
});
