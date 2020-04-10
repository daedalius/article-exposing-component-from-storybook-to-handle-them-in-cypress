This is example of component testing approach when you expose the component reference from Storybook story to test it whatever you wish in Cypress.

# How to run
## CI/CD version 
```
npm run test
```
## Debug tests
```
npm run storybook
```
```
npm run cypress
```

## Roles of each participant:

Storybook:
* hosts "storybook stories" that contain bundled react components to test
* provides real non-synthetic environment to run tests
* each "story" expose one component in window (to retrieve it in Cypress)
* each "story" expose a mount point (to mount a component in test)
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
* Unit-test libraries run component tests in synthetic environment. It is a little bit faster, but limits feature coverage.
* Unit-test libraries run component tests from developers perspective while trying to emulates input events.
* You write component tests via unit-test libraries in blindly and painful way. Accept that.

## Why not to use cypress-react-unit-test then? Why do we need Storybook?
I have no doubts - it is our future to test components.

But now...  
It has some tricky architecture that runs component bundle and environment in two iframes. And sometimes it limits you.  
Example: Imagine that you have a component to test that should look at document.activeElement. This reference in Cypress test run will always point at document.body (because of iframes limitations or implementation issues).  
Also it has a lot of work to be done. 
Hope that Gleb Bahmutov and the Cypress team will make it worked 🤞

## Should I migrate all the tests that written on Jest / React Testing Library?
* If you use tests as a development environment - Yes!
* If you look at tests as at documentation - Yes.
* If you really write unit-tests to cover things that too close to implementation and react-lifecycle - ... I don't know. I haven't been writing such a code. Are you sure about the following the S-principle of SOLID? Maybe that code should be extracted and tested accordingly?
