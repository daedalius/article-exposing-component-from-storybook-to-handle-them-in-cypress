/// <reference types="cypress" />

import React from 'react';
import ReactDOM from 'react-dom';

/**
 * <Datepicker />
 * * renders text field.
 * * renders desired placeholder text.
 * * renders chosen date.
 * * opens calendar after clicking on text field.
 */

context('<Datepicker />', () => {
    const rootToMountSelector = '#component-test-mount-point';
    const selectors = {
        innerInput: '.react-datepicker__input-container input',
        calendar: '.react-datepicker__month-container',
    };

    before(() => {
        cy.visit('http://localhost:12345/iframe.html?id=datepicker--empty-story');
        cy.get(rootToMountSelector);
    });

    // Page cleanup
    afterEach(() => {
        cy.document()
            .then((doc) => {
                ReactDOM.unmountComponentAtNode(doc.querySelector(rootToMountSelector));
            });
    });

    it('renders text field.', () => {
        cy.window().then((win) => {
            ReactDOM.render(
                <win.Datepicker />,
                win.document.querySelector(rootToMountSelector)
            );
        });

        cy
            .get(selectors.innerInput)
            .should('be.visible');
    });

    it('renders desired placeholder text.', () => {
        const desiredPlaceholder = 'desired placeholder';

        cy.window().then((win) => {
            ReactDOM.render(
                <win.Datepicker
                    placeholderText={desiredPlaceholder}
                />,
                win.document.querySelector(rootToMountSelector)
            );
        });

        cy
            .get(selectors.innerInput)
            .should('have.attr', 'placeholder', desiredPlaceholder);
    });

    it('renders chosen date.', () => {
        // Use moment.js in production instead of this :D
        const chosenDate = new Date(2000, 0, 1);

        cy.window().then((win) => {
            ReactDOM.render(
                <win.Datepicker
                    selected={chosenDate}
                    dateFormat="dd.MM.yyyy"
                />,
                win.document.querySelector(rootToMountSelector)
            );
        });

        cy
            .get(selectors.innerInput)
            .should('have.attr', 'value', '01.01.2000');
    });

    it('opens calendar after clicking on text field.', () => {
        cy.window().then((win) => {
            ReactDOM.render(
                <win.Datepicker />,
                win.document.querySelector(rootToMountSelector)
            );
        });

        cy
            .get(selectors.innerInput)
            .click();

        cy
            .get(selectors.calendar)
            .should('be.visible');
    });
})
