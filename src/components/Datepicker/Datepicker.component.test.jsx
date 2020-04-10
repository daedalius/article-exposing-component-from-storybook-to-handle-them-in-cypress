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

    // Totally optional helper to test multiple props with state. JFYI.
    const DatepickerTestWrapper = ({ placeholderText, selected, win }) => {

        // About setState:
        // You can put setState reference in closure to have an access in test-cases (if needed).
        // It works (100% works with classes) but not recommended if you test the component from user point of view.
        // If you do, do it clearly according to the test logic.

        return (
            <win.Datepicker
                placeholderText={placeholderText}
                selected={selected}
                dateFormat="dd.MM.yyyy"
            />
        );
    };

    it('renders text field.', () => {
        cy.window().then((win) => {
            ReactDOM.render(
                <DatepickerTestWrapper win={win} />,
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
                <DatepickerTestWrapper
                    placeholderText={desiredPlaceholder}
                    win={win}
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
                <DatepickerTestWrapper
                    selected={chosenDate}
                    win={win}
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
                <DatepickerTestWrapper win={win} />,
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
