/// <reference types="cypress" />
import React from "react";
import { mount } from "cypress-react-unit-test";
import Popup from "./Popup.jsx";

describe("<Popup />", () => {
  const selectors = {
    popupWindow: ".popup",
  };

  it("becomes hidden after being shown when showed=false passed.", () => {
    let setPopupTestWrapperState = null;
    const PopupTestWrapper = ({ showed, win }) => {
      const [isShown, setState] = React.useState(showed);
      setPopupTestWrapperState = setState;
      return <Popup showed={isShown} />;
    };

    mount(<PopupTestWrapper showed={true} />)
      .wait(1000) // so we can see it during test
      .then(() => {
        setPopupTestWrapperState(false);
      });

    cy.get(selectors.popupWindow).should("not.be.visible");
  });

  it("closes via method call.", () => {
    // arrange
    let popup = React.createRef();
    mount(<Popup showed={true} ref={popup} />)
      .wait(1000) // so we can see it during test
      .then(() => {
        popup.current.hide();
      });
    cy.get(selectors.popupWindow).should("not.be.visible");
  });
});
