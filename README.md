This is example of component testing approach when you expose the component reference from Storybook story to test it whatever you wish in Cypress.

## Roles of each participant:

Storybook:
* hosts "storybook stories" that contain bundled react components
* provides real non-synthetic environment to run tests
* each "story" expose one component in window (to retrieve it in Cypress)
* able to open each component in isolation at fullscreen
Look at "testing-story" as at shooting range. Please, run another instance of Storybook for your component library or pages.

Cypress:
* contains/runs tests and Javascript
* visit isolated (and empty in this case) component "story"
* retrieves component reference provided by "story"
* renders component according to testing needs (with any data or test conditions)
* the open-source king of input/assertions opportunities
* provides UI where you see how your test is going

## I have Jest and React Testing Library! Tell me where am I wrong?
* Because unit-test libraries run component tests in synthetic environment. It is a little bit faster, but limits feature coverage.
* Because unit-test libraries run component tests from developers perspective while trying to emulates input events.
* Because you write component tests via unit-test libraries blindly.

## Why not to use cypress-react-unit-test then? Why do we need Storybook?
Cypress has some tricky architecture. It runs in two iframes and sometimes it limits you. Imagine that you have a component to test that should look at document.activeElement. This reference in Cypress test run always will be null (because of iframes limitations or implementation issues).
So it is not a time and a lot of work should be done to use it freely.

## Should I migrate all the tests that written on Jest / React Testing Library?
* If you primarly use tests as a development environment - Yes!
* If you look at tests as at documentation - Yes.
* If you really write unit-tests to cover things that too close to implementation and react-lifecycle - ... i don't know. I haven't been writing such a code. Are you sure about the following the S-principle of SOLID? Maybe that code should be extracted and tested accordingly?
