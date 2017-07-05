/**
 * EasyCrypt.co Account Management
 * Copyright 2017, EasyCrypt.co
 * See README for details.
 *
 * @version 0.1.37
 */

import React from "react";

export default class AccountRight extends React.Component {
    render() {
        return (
            <div className="right-section">
                <div className="welcome-sec">
                    <h1>Welcome <span>EasyCrypt!</span></h1>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque et molestie nibh. </p>
                    <div className="user-form">
                        <div className="form-flds">
                            <label>Email address</label>
                            <div className="textfield">
                                <input type="email" id="email"/>
                            </div>
                        </div>
                        <div className="form-flds">
                            <label>Email Service Provider</label>
                            <div className="textfield">
                                <input type="text" id="emailservice"/>
                            </div>
                        </div>
                        <div className="form-flds">
                            <label>Authentication method</label>
                            <div className="textfield">
                                <input type="text" id="method"/>
                                <div className="submit-btn">
                                    <label></label>
                                    <input type="submit" value="Submit"/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}