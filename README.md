This is example of component testing approach when you expose the component reference from Storybook Story to test it whatever you wish in Cypress.

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
* Hosts Storybook Stories that contain bundled react components for test purpose.
* Provides a real non-synthetic environment to run tests.
* Each Story exposes one component in the global variable (to retrieve it in Cypress later).
* Each Story exposes a component mount point (to mount a component in test).
* Able to open each component in isolation in new tab.

Cypress:
* Contains and runs tests and Javascript.
* Visits isolated component Stories, retrieves component reference from the global variable.
* Renders component according to testing needs (with any data or test conditions such as mobile resolution).
* Provides UI to you see how your tests are going.
