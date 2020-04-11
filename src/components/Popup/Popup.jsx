import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './Popup.css';

export default class Popup extends Component {
    constructor(props) {
        super(props);

        this.state = {
            closedOutside: false
        }
    }

    // Method doesn't have any sense.
    // It exists for example purposes only.
    hide() {
        this.setState({ closedOutside: true });
    }

    render() {
        if (!this.props.showed || this.state.closedOutside) {
            return null;
        }
        return (
            <div className="popup">
                {this.props.children}
            </div>
        )
    }
};

Popup.propTypes = {
    showed: PropTypes.bool.isRequired,
    children: PropTypes.any
}