import React from 'react';
import PropTypes from 'prop-types';
import './Popup.css';

export default function Popup({ showed, children }) {
    if(!showed) {
        return null;
    }

    return (
        <div className="popup">
            {children}
        </div>
    )
};

Popup.propTypes = {
    showed: PropTypes.bool.isRequired,
    children: PropTypes.any
}