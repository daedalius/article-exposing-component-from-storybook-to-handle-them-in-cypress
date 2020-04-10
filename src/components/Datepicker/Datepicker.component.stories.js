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
