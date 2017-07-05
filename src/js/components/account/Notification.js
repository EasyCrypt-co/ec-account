/**
 * EasyCrypt.co Account Management
 * Copyright 2017, EasyCrypt.co
 * See README for details.
 *
 * @version 0.1.37
 */

import React from "react";
import {NOTIFICATION_TYPE} from "../../utils/constants";

export default class Notification extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.notification) {
            if (this.props.notificationType == NOTIFICATION_TYPE.ERROR) {
                return (
                    <div className="account-notification error">
                        <label>{this.props.notificationMessage}</label>
                    </div>
                );
            }
            else if (this.props.notificationType == NOTIFICATION_TYPE.NOTIFICATION) {
                return (
                    <div className="account-notification notification">
                        <label>{this.props.notificationMessage}</label>
                    </div>
                );
            }
            else {
                return null;
            }
        }
        else {
            return null;
        }
    }
}