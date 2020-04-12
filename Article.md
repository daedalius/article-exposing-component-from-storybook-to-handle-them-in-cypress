# Cypress + Storybook. Keeping test scenario, data and component rendering in one place. 
td; dr:
* You may expose the component reference from Storybook story to test it whatever you wish in Cypress (without breaking testing logic into pieces).
* Cypress turned up so powerfull for our team, so we do not have another utility which use js-dom under the hood.

In the very begining Cypress feels like e2e testing tool. It was curious to look at rising interest of frontend-engineers to the topic where Selenium run the show. At that time any typical video or article about the power of Cypress was limited by wandering around the randomly chosen website and praising input API provided.  

Many of us have chosen Cypress as a tool to test components hosted via Storybook/Styleguidist/Docz.The good example - Stefano Magni article. He suggests to create Storybook Story, put component there and expose important data to the global variable in order to have an access in test. Nice approach actually, but test becomes broken into the pieces between Storybook and Cypress.  

Here I'd like to show how to go a little bit further and get the most out of environment that Cypress provides. To see it in action, you may download the source code from my Github and execute then **npm i** and **npm run test** in console.


Okay, let's start. Imagine that we are writing an adaptor for existing Datepicker component to use it across all company websites. We don't want to accidentally break anything, so we have to cover it by tests.

## Storybook
All we need from Storybook - an empty Story that saves reference to the testing component in global variable. In order not to be so useless this Story renders the single DOM node. This node will be our war zone inside the test.

```jsx
import React from 'react';
import Datepicker from './Datepicker.jsx';

export default {
  component: Datepicker,
  title: 'Datepicker',
};

export const emptyStory = () => {
    // Reference to retrieve it in Cypress during the test
    window.Datepicker = Datepicker;

    // Just a mount point
    return (
        <div id="component-test-mount-point"></div>
    )
};

```
Okay, we've finished with Storybook. Let's take a look at Cypress.

## Cypress
Personally, I like to getting started with test-cases enumeration. Seems we have next test structure:

```jsx
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
    it('renders text field.', () => { });

    it('renders desired placeholder text.', () => { });

    it('renders chosen date.', () => { });

    it('opens calendar after clicking on text field.', () => { });
})
```

Fine. We have to run these test in some environment. Open the Storybook, go directly to the empty Story by clicking at "Open canvas in new tab" button in sidebar. Copy that URL and make Cypress visit it:
```jsx
const rootToMountSelector = '#component-test-mount-point';

before(() => {
    cy.visit('http://localhost:12345/iframe.html?id=datepicker--empty-story');
    cy.get(rootToMountSelector);
});
```

As you may guessed, in order to test we are going to render all components states in the same \<div /\> with id=component-test-mount-point. So that the tests do not affect each other, we must unmount any component here before the next test execution. Let's add some cleanup code:
```jsx
afterEach(() => {
    cy.document()
        .then((doc) => {
            ReactDOM.unmountComponentAtNode(doc.querySelector(rootToMountSelector));
        });
});
```

Now we are ready to write the test. Retrieve the component reference, render the component and make some assertions:
```jsx
const selectors = {
    innerInput: '.react-datepicker__input-container input',
};

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
```

Do you see that? Nothing stops us from passing any props or data to the component directly! It's all in one place now - in Cypress!

## Testing in few steps with wrapper
Sometimes we'd like to test that component bechaves predictable according to changing props.  
Examine \<Popup /\> component with "showed" props. When "showed" is true, \<Popup \/> is visible. After that, changing "showed" to "false", \<Popup \/> should becomes hidden. How to test that transition?

Those problems easy to handle in imperative way, but in case of declarative React we need to come up with something.
In our team we use additional wrapper component with state to handle it. The state here is boolean, it response for "showed" props.
```jsx
let setPopupTestWrapperState = null;
const PopupTestWrapper = ({ showed, win }) => {
    const [isShown, setState] = React.useState(showed);
    setPopupTestWrapperState = setState;
    return <win.Popup showed={isShown} />
}
```

Now we about to finish the test:
```jsx
it('becomes hidden after being shown when showed=false passed.', () => {
    // arrange
    cy.window().then((win) => {
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
```
Tip: If a such hook haven't worked or you dislike calling the hook outside the component - rewrite the wrapper via simple class.


## Testing component methods
Actually, I've never written such a test. The idea has come up while writing this article. Probably it may be useful to test a component in unit test style.  

However you may easily to do it in Cypress. Just create a ref to the component before rendering. It is worth mentioning that the ref gives access to state and other elements of the component.  

I've added "hide" metod to \<Popup /\> which make it hidden forcibly (example for the sake of example). The following test looks like this:
```jsx
// arrange
let popup = React.createRef();
cy.window().then((win) => {
    // initial state - popup is visible
    popup = <win.Popup showed={true} ref={popup}/>;

    cy.window().then((win) => {
        ReactDOM.render(popup, win.document.querySelector(rootToMountSelector));
    });
});

// act
cy.then(() => {
    popup.ref.current.hide();
})

// assert
cy
    .get(selectors.popupWindow)
    .should('not.be.visible');
```

Still, In my mind, calling React-component method is a legal hack that should be used only if the problem is very difficult to solve declaratively.  


## To sum it up: roles of each participant
Storybook:
* Hosts "storybook stories" that contain bundled react components for test purpose.
* Provides real non-synthetic environment to run tests.
* Each "story" expose one component in global variable (to retrieve it in Cypress later).
* Each "story" expose a component mount point (to mount a component in test).
* Able to open each component in isolation at fullscreen.
> Tip: Please, run another instance of Storybook for your component library or pages.

Cypress:
* Contains and runs tests and Javascript.
* Visits isolated component Stories, retrieves component reference from the global variable.
* Renders component according to testing needs (with any data or test conditions such as mobile resolution).
* Provides UI to you see how your tests are going.

## Conclusion
Here I'd like to express my personal opinion and my collegues position about possible questions that may be appear during the reading. Written below doesn't pretend to be true, may differ from reality and contain nuts.

### My test utils use js-dom under the hood. Do I limit myself?
* Yes. Js-dom is synthetic environment. Separated DOM is not a real browser.
* It doesn't really work out to act with js-dom as it user do. Especially when it comes to simulating input events.  
* How much confidence can you get from a written unit test if a component can be broken in CSS due to one incorrect z-index? If the component is tested by Cypress, you will see an error.
* You write unit tests blindly. But why? 

### Should I choose the approach suggested?
* If you use tests as a development environment - definitely, Yes!
* If you look at tests as at **live** documentation - Yes.
* If you really write unit-tests to cover things that too close to implementation and react-lifecycle - ... I don't know. I haven't been writing such a test for long time. Are you sure that the covered logic is component responsibility? Maybe that logic should be extracted and tested accordingly?

### Why not to use cypress-react-unit-test then? Why do we need Storybook?
I have no doubts - it is our future to test components. There will be no need to maintain a separate instance of the Storybook, all tests will be entirely under the responsibility of Cypress, the configuration will be simplified, etc.  
But now tool has some problems that makes the provided environment incomplete for running tests. Hope that Gleb Bahmutov and the Cypress team will make it worked 🤞

PS: Our team opinion that the suggested approach allows us to review the monopoly of tools using js-dom. What do you think about it?
