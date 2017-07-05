/**
 * EasyCrypt.co Account Management
 * Copyright 2017, EasyCrypt.co
 * See README for details.
 *
 * @version 0.1.37
 */

import React from "react";
import Notification from "./account/Notification";
import {NOTIFICATION_TYPE} from "../utils/constants";
import BackendEndpoints from "../utils/backendEndpoints";

export default class VerifyKeys extends React.Component {
    constructor(props) {
        super(props);

        if (this.props.location.query.id) {
            this.state = {
                notification: false,
                notificationType: '',
                notificationMessage: '',
                verificationId: this.props.location.query.id,
                type: null,
                verificationEmail: null
            };

            BackendEndpoints.verifyKey(this.props.location.query.id).then((data) => {
                if (data) {
                    this.setState({
                        type: data.type,
                        verificationEmail: data.email
                    });
                }
                else {
                    this.setState({
                        notification: true,
                        notificationType: NOTIFICATION_TYPE.ERROR,
                        notificationMessage: 'Error verifying key',
                    });
                }
            });
        }
        else {
            this.state = {
                notification: true,
                notificationType: NOTIFICATION_TYPE.ERROR,
                notificationMessage: 'Verification id not found',
                verificationId: null
            };
        }
    }

    render() {
        let content = null;
        if (this.state.notification) {
            content = (
                <Notification notification={this.state.notification} notificationType={this.state.notificationType}
                              notificationMessage={this.state.notificationMessage}/>

            );
        }
        else {
            if (this.state.type == "public") {
                content = (
                    <div className="welcome-sec">
                        <h1>{this.state.verificationEmail}</h1>
                        <br/>
                        <p>Your public key has been registered. From now on, messages sent to the above address by
                            EasyCrypt
                            users will be encrypted by your public key. Click <a
                                href="https://easycrypt.co/existing-pgp-user-guide/" target="_blank">here</a> to find
                            out
                            how to establish
                            bi-directional PGP communication with EasyCrypt users, and how you can use EasyCrypt to
                            encrypt
                            your communication with your non-technical friends.</p>
                        <p>You can close this tab.</p>
                    </div>
                );
            }
            else if (this.state.type == "private") {
                content = (
                    <div className="welcome-sec">
                        <h1>{this.state.verificationEmail}</h1>
                        <br/>
                        <p>
                           Binding between email address and PGP key verified. Please go back to Account>Advanced>Import
                           keys to complete the key import process.
                        </p>
                        <br/>
                        <p>You can close this tab.</p>
                    </div>
                );
            }
        }
        return (
            <div>
                <header style={{position: "absolute", top: "0"}}>
                    <div className="header-container">
                        <div className="header-left">
                            <div className="logo-img">
                                <a href="/"><img src="/images/logo-img.png"/></a>
                            </div>
                        </div>
                    </div>
                </header>
                <div className="mid-wrapper">
                    <div className="verify-keys-section">
                        {content}
                    </div>
                </div>
            </div>
        )
    }
}
