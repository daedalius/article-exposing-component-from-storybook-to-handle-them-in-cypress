# Cypress + Storybook. Keeping test logic, data and component rendering in test. 
td; dr:
* You may expose the component reference from Storybook story to test it whatever you wish in Cypress.
* Cypress turned up so powerfull for our team, so we do not have another utility to test React Components. We left React Testing Library, Enzyme and knobs in past.

Первые версии Cypress воспринимались как инструмент e2e-тестирования. Было любопытно наблюдать за ростом интереса front-end инженеров к теме в которой всю жизнь правил Selenium. В то время типичное видео или статья демонстрирующая возможности Cypress ограничивались блужданием по случайно выбранному сайту и заслуженными лестными отзывами об API для ввода данных (прямо в JavaScript!).

Многие из нас догадались использовать Cypress для тестирования компонентов в изоляции предоставляемой такими средами как Storybook/Styleguidist/Docz. Хороший пример - статья Stefano Magni "Testing a Virtual List component with Cypress and Storybook". В ней предлагается создать Storybook Story, разместить в ней компонент и поместить в глобальную перменную данные, которые будут полезны для теста. Этот подход хорош, но в нём тест разрывается между Storybook и Cypress. Если у нас много компонентов, такие тесты будет сложно читать и поддерживать.

В этой короткой статье я попытаюсь показать как пойти чуть дальше и взять максимум от возможности писать на JavaScript в теле тестов Cypress. Для того чтобы увидеть как это работает, прошу загрузить исходный код по адресу https://github.com/daedalius/article-exposing-component-from-storybook-to-handle-them-in-cypress и выполнить команды **npm i** и **npn run test**.

Представим, что мы пишем адаптер для существующего компонента Datepicker и хотим покрыть его тестами. 

## Storybook
Со стороны Storybook всё что нам нужно - пустая Story в которой в глобальной переменной сохраняется ссылка на тестируемый компонент. Чтобы не быть совсем бесполезной, эта Story нам отрисует один DOM-узел. Его роль - предоставить место под полигон в котором Cypress будет тестировать целевой компонент. 

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
Мы закончили со Storybook. Теперь переместим всё внимание на Cypress.

## Cypress
Я предпочитаю начинать работу над компонентом или покрытие его тестами с перечисления тест-кейсов. После того как мы определились с покрытием, получаем следующую заготовку под тест, который исполнит Cypress:

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

Для проведения теста нужна среда. Вспоминаем о только что развернутом Storybook. Перейдем напрямую к пустой Story, открыв её в новом окне кликнув по кнопке "Open canvas in new tab" на sidebar. Скопируем URL и нацелим туда Cypress:
```jsx
    const rootToMountSelector = '#component-test-mount-point';

    before(() => {
        cy.visit('http://localhost:12345/iframe.html?id=datepicker--empty-story');
        cy.get(rootToMountSelector);
    });
```

Как вы могли догадаться, мы будем рендерить интересующее нас состояние компонента в каждом тесте в одном и том же div. Чтобы тесты не влияли друг на друга, нужно размонтировать этот компонент после каждого теста. Добавим код очистки:
```jsx
    afterEach(() => {
        cy.document()
            .then((doc) => {
                ReactDOM.unmountComponentAtNode(doc.querySelector(rootToMountSelector));
            });
    });
```

Попробуем написать тест. Достанем ссылку на компонент и отрисуем его на странице:
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

Вы чувствуете это? Ничто не останавливает нас передать в компонент любой props. Любое состояние. Любые данные. И всё теперь в одном месте - в Cypress!

## Тесты в несколько этапов, тестирование с обёрткой
Иногда компоненты содержат логику, которая исполняется при изменении props. Для примера возьмем Popup c props по имени showed.
Когда showed=true, Popup видим. При изменении showed c true на false, Popup должен скрыться. Как это протестировать?

Такие ситуации элементарно решаются императивно, однако в случае с декларативным React нам нужно что-то придумать. 
В нашей команде в таких ситуациях мы создаём вспомогательный component со state. В данном случае state это boolean отвечающий за showed props.
```jsx
let setPopupTestWrapperState = null;
const PopupTestWrapper = ({ showed, win }) => {
    const [isShown, setState] = React.useState(showed);
    setPopupTestWrapperState = setState;
    return <win.Popup showed={isShown} />
}
```
> Совет: Если у вас не завёлся hook (такое бывает), перепишите на обычный class.

Применив написанную обёртку, завершим работу над тестом:
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

