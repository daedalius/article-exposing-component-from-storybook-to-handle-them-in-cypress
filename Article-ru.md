# Cypress + Storybook. Хранение тестового сценария, данных и рендеринг компонента в одном месте.

Сперва Cypress воспринимался как инструмент e2e-тестирования. Было любопытно наблюдать за ростом интереса front-end инженеров к теме, в которой всю жизнь правил Selenium. В то время типичное видео или статья, демонстрирующие возможности Cypress, ограничивались блужданием по случайно выбранному сайту и заслуженными лестными отзывами об API для ввода данных.

Многие из нас догадались использовать Cypress для тестирования компонентов в изоляции предоставляемой такими средами как Storybook/Styleguidist/Docz. Хороший пример - статья Stefano Magni ["Testing a Virtual List component with Cypress and Storybook"](https://itnext.io/testing-a-virtual-list-component-with-cypress-and-storybook-494dc2d1d26b). В ней предлагается создать Storybook Story, разместить в ней компонент и поместить в глобальную переменную данные, которые будут полезны для теста. Этот подход хорош, но в нём тест разрывается между Storybook и Cypress. Если у нас много компонентов, такие тесты будет сложно читать и поддерживать.

В этой статье я попытаюсь показать, как пойти чуть дальше и взять максимум от возможности исполнять JavaScript в Cypress. Для того чтобы увидеть как это работает, прошу загрузить [исходный код](https://github.com/daedalius/article-exposing-component-from-storybook-to-handle-them-in-cypress) по адресу  и выполнить команды **npm i** и **npm run test**.

tl; dr:
* Вы можете вынести ссылку на компонент из Storybook Story чтобы протестировать его целиком силами Cypress (не разбивая логику теста на несколько частей).
* Cypress показался нашей команде настолько мощным, что мы полностью отказались от инструментов, использующих js-dom под капотом для тестирования UI-компонентов.

## Постановка задачи
Представим, что мы пишем адаптер для существующего компонента Datepicker который будет использоваться на всех сайтах компании. Чтобы случайно не сломать ни один сайт, мы хотим покрыть его тестами. 

## Storybook
Со стороны Storybook всё, что нам нужно - пустая Story в которой в глобальной переменной сохраняется ссылка на тестируемый компонент. Чтобы не быть совсем бесполезной, эта Story нам отрисует один DOM-узел. Его роль - предоставить место под полигон, на котором Cypress будет тестировать целевой компонент.

```javascript
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
Я предпочитаю начинать работу над компонентом с перечисления тест-кейсов. После того как мы определились с тестовым покрытием, получаем следующую заготовку:
```javascript
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

Окей. Для проведения теста нужна среда. Вспоминаем о только что развернутом Storybook. Перейдем напрямую к пустой Story, открыв её в новом окне по клику на кнопке "Open canvas in new tab" на sidebar. Скопируем URL и нацелим туда Cypress:
```javascript
const rootToMountSelector = '#component-test-mount-point';

before(() => {
    cy.visit('http://localhost:12345/iframe.html?id=datepicker--empty-story');
    cy.get(rootToMountSelector);
});
```

Как вы могли догадаться, мы будем рендерить интересующее нас состояние компонента в каждом тесте в одном и том же div с id=component-test-mount-point. Чтобы тесты не влияли друг на друга, нужно размонтировать этот компонент после каждого теста. Добавим код очистки:
```javascript
afterEach(() => {
    cy.document()
        .then((doc) => {
            ReactDOM.unmountComponentAtNode(doc.querySelector(rootToMountSelector));
        });
});
```

Попробуем написать тест. Достанем ссылку на компонент, отрисуем его на странице и проверим интересующее нас условие:
```javascript
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

Видите? Ничто не останавливает нас передать в компонент любой props. Любое состояние. Любые данные. И всё в одном месте - в Cypress!

## Тесты в несколько этапов, тестирование с обёрткой
Иногда нам хочется убедиться, что компонент ведёт себя корректно при последовательном изменении props.  
Для примера рассмотрим компонент \<Popup /\> c props по имени "showed". Когда "showed" true, \<Popup /\> видим. При изменении "showed" c true на false, \<Popup /\> должен скрыться.  
Как это протестировать?

Такие задачи элементарно решаются императивно, однако в случае с декларативным React нам нужно что-то придумать. 
В нашей команде мы обычно создаём вспомогательный компонент со state. В данном случае state это boolean, отвечающий за "showed" props.

```javascript
let setPopupTestWrapperState = null;
const PopupTestWrapper = ({ showed, win }) => {
    const [isShown, setState] = React.useState(showed);
    setPopupTestWrapperState = setState;
    return <win.Popup showed={isShown} />
}
```

Применив написанную обёртку, завершим работу над тестом:
```javascript
it('becomes hidden after being shown when showed=false passed.', () => {
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
```
> Совет: Если hook у вам не завёлся или вы против вызова setState извне компонента, перепишите на обычный class.

## Тестирование методов компонента
Честно говоря, я не писал таких тестов прежде, а идея пришла в голову уже перед публикацией статьи. Возможно, кому-то это будет полезно с точки зрения юнит-тестирования.

Сделать в Cypress это довольно просто. Достаточно предварительно создать ref на компонент. Для полноты картины стоит упомянуть, что ref даёт доступ к state и другим составляющим компонента.

Для демонстрации я добавил в \<Popup /\> метод, который принудительно его скрывает (пример ради примера). Тест выглядит следующим образом:
```javascript
it('closes via method call.', () => {
    // arrange
    let popup = React.createRef();
    cy.window().then((win) => {
        // initial state - popup is visible
        ReactDOM.render(
            <win.Popup
                showed={true}
                ref={popup}
            />,
            win.document.querySelector(rootToMountSelector)
        );
    });

    // act
    cy.then(() => { popup.current.hide(); })

    // assert
    cy
        .get(selectors.popupWindow)
        .should('not.be.visible');
})
```

## Подытог: роли каждого из участников
Storybook:
* Поднимает Storybook Stories содержащие собранные React компоненты для целей тестирования.
* Предоставляет реальную несинтетическую среду для исполнения тестов.
* Каждая Story устанавливает глобальную ссылку на компонент в window (чтобы затем получить её в Cypress).
* Каждая Story предоставляет точку монтирования, в которую затем будет рендерится компонент (при исполнении теста).
* Способен открыть каждый компонент в изоляции в чистой новой вкладке.

> Совет: Используйте отдельный экземпляр Storybook для библиотеки компонентов. Не смешивайте тестовые Stories с остальными.

Cypress:
* Содержит и запускает тесты и JavaScript для них.
* Переходит к отдельным Stories, получает ссылку на компонент из глобальной переменной.
* Отрисовывает компонент согласно логике теста с нужными данными и условиями (например, в мобильном разрешении).
* Взаимодействует с компонентом на странице.
* Предоставляет UI для визуализации процесса тестирования.

## Заключение
В этом разделе хотелось бы выразить личное мнение и позицию команды по некоторым вопросам, которые могли возникнуть у читателя. Написанное ниже не претендует на истину, может отличаться от реальности, а так же содержать арахис.

### Мои утилиты для тестирования используют js-dom под капотом. В чем я себя ограничиваю?
* Js-dom это синтетическая среда, ограничивающая охват покрытия. Отдельностоящий DOM это не весь браузер.  
* Не очень выходит работать с js-dom так как это делал бы пользователь. Особенно когда речь заходит об имитации событий ввода.  
* Много ли уверенности вам даёт написанный юнит-тест, если компонент может быть сломан в CSS одним неверным z-index? Если компонент тестируется в Cypress, вы увидите ошибку.  
* Вы пишите юнит-тесты вслепую. Но зачем?  

### Стоит ли мне выбрать описанный подход для тестирования компонентов?
Если вы воспринимаете тесты как среду для разработки - точно Да!  
Если вы воспринимаете тесты как **показательную** документацию - Да.  
Если вы пишете "низкоуровневые" юнит-тесты с покрытием деталей реализации и особенностей работы react-lifecycle - ... Не знаю. Я не писал таких тестов уже давно. Вы уверены, что тестируемая логика это уровень ответственности компонента? Может быть, её стоит вынести и тестировать отдельно?  

### Почему бы просто не использовать cypress-react-unit-test? Зачем мне Storybook?
Вне сомнений - за этим подходом будущее. Здесь пропадёт сама потребность содержать отдельный экземпляр Storybook, тесты будут целиком под ответственностью Cypress, упростится конфигурация и т.д.
Но сейчас этот инструмент имеет [ряд](https://github.com/bahmutov/cypress-react-unit-test/issues/34) [проблем ](https://github.com/bahmutov/cypress-react-unit-test/issues/52)не позволяющих использовать его как полноценную среду для запуска тестов. 
Надеюсь, Gleb Bahmutov и команда Cypress справятся с этими трудностями.

PS: Мой взгляд и мнение коллег сходятся в том, предложенный подход позволяет пересмотреть монополию инструментов использующих js-dom. Что вы думаете по этому поводу?