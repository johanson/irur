/* eslint-disable no-undef */
const loader = '#loading';
const settings = '#settings';
const settingsBtn = `${settings} .btn`;
const settingsWindow = `${settings} .window`;
const settingsWindowCloseBtn = `${settings} .close`;
const saveBtn = `${settings} .save`;
const textarea = `${settingsWindow} textarea`;
const prompt = '#prompt';
const promptConfirmButton = `${prompt} .confirm`;
const remote = '#remote';

describe('Settings component', () => {
  it('Makes settings window visible when the settings button is clicked', () => {
    cy.visit('/');
    cy.get(loader).should('not.be.visible');
    cy.wait(500);
    cy.window().then(win => {
      win.app.__vue__.resetDB();
    });
    cy.get(settingsBtn).click();
    cy.get(settingsWindow);
  });

  it('Makes manual changes to json', () => {
    cy.get(textarea).clear();
    cy.get(textarea).type(
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
    cy.get(saveBtn).click();
    cy.get(prompt).should('be.visible');
  });

  it('Confirms changes are visible, corresponding to DOM/db', () => {
    cy.get(promptConfirmButton).click();
    cy.get(remote)
      .find('.knob')
      .should('have.length', 2); // 1  + add new knob
  });

  it('Opens and closes settings window', () => {
    cy.get(settingsBtn).click();
    cy.get(settingsWindow);
    cy.get(settingsWindowCloseBtn).click();
    cy.get(settingsWindow).should('not.be.visible');
  });
});
