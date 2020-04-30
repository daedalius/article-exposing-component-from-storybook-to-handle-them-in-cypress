/// <reference types="cypress" />
import React from "react";
import { mount } from "cypress-react-unit-test";
import Datepicker from "./Datepicker.jsx";

describe("<Datepicker />", () => {
  const selectors = {
    innerInput: ".react-datepicker__input-container input",
    calendar: ".react-datepicker__month-container",
  };

  it("renders text field.", () => {
    mount(<Datepicker />);
    cy.get(selectors.innerInput).should("be.visible");
  });

  it("renders desired placeholder text.", () => {
    const desiredPlaceholder = "desired placeholder";
    mount(<Datepicker placeholderText={desiredPlaceholder} />);

    cy.get(selectors.innerInput).should(
      "have.attr",
      "placeholder",
      desiredPlaceholder
    );
  });

  it("renders chosen date.", () => {
    // Use moment.js in production instead of this :D
    const chosenDate = new Date(2000, 0, 1);
    mount(<Datepicker selected={chosenDate} dateFormat="dd.MM.yyyy" />);

    cy.get(selectors.innerInput).should("have.attr", "value", "01.01.2000");
  });

  it("opens calendar after clicking on text field.", () => {
    mount(<Datepicker />);
    cy.get(selectors.innerInput).click();

    cy.get(selectors.calendar).should("be.visible");
  });
});
