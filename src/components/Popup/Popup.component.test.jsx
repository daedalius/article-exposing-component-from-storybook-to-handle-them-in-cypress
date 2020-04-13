/// <reference types="cypress" />

import React from 'react';
import ReactDOM from 'react-dom';

/**
 * <Popup />
 * * becomes hidden after being shown when showed=false passed.
 * * closes via method call.
 */

context('<Popup />', () => {
    const rootToMountSelector = '#component-test-mount-point';
    const selectors = {
        popupWindow: '.popup',
    };

    before(() => {
        cy.visit('http://localhost:12345/iframe.html?id=popup--empty-story');
        cy.get(rootToMountSelector);
    });

    // Page cleanup
    afterEach(() => {
        cy.document()
            .then((doc) => {
                ReactDOM.unmountComponentAtNode(doc.querySelector(rootToMountSelector));
            });
    });

    it('becomes hidden after being shown when showed=false passed.', () => {
        let setPopupTestWrapperState = null;
        const PopupTestWrapper = ({ showed, win }) => {
            const [isShown, setState] = React.useState(showed);
            setPopupTestWrapperState = setState;
            return <win.Popup showed={isShown} />
        }

        // arrange
        cy.window().then((win) => {
            // initial state - popup is visible
            ReactDOM.render(
                <PopupTestWrapper
                    showed={true}
                    win={win}
                />,
                win.document.querySelector(rootToMountSelector)
            );
        });

        // act
        cy.then(() => { setPopupTestWrapperState(false); })

        // assert
        cy
            .get(selectors.popupWindow)
            .should('not.be.visible');
    });

    it('closes via method call.', () => {
        // arrange
        let popup = React.createRef();
        cy.window().then((win) => {
            ReactDOM.render(
                <win.Popup showed={true} ref={popup} />,
                win.document.querySelector(rootToMountSelector)
            );
        });

        // act
        cy.then(() => {
            popup.current.hide();
        })

        // assert
        cy
            .get(selectors.popupWindow)
            .should('not.be.visible');
    })
})
