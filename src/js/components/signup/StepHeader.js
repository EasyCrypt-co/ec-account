/**
 * EasyCrypt.co Account Management
 * Copyright 2017, EasyCrypt.co
 * See README for details.
 *
 * @version 0.1.37
 */

import React from "react";

export default class StepHeader extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <div className="step-left">
                    <h3>STEP {this.props.step}</h3>
                </div>
                <div className="step-right">
                    <span>{this.props.text}</span>
                </div>
            </div>
        );
    }
};