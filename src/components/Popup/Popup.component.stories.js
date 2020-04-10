import React from 'react';
import Popup from './Popup.jsx';

export default {
  component: Popup,
  title: 'Popup',
};

export const emptyStory = () => {
    // Reference to retrieve it in Cypress during the test
    window.Popup = Popup;

    // Just a mount point
    return (
        <div id="component-test-mount-point"></div>
    )
};
