/**
 * EasyCrypt.co Account Management
 * Copyright 2017, EasyCrypt.co
 * See README for details.
 *
 * @version 0.1.37
 */

import React from "react";
import Notification from "../Notification";
import {NOTIFICATION_TYPE} from "../../../utils/constants";
import BackendEndpoints from "../../../utils/backendEndpoints";

export default class DeleteAccount extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            notification: false,
            notificationType: '',
            notificationMessage: '',
            sendingEmail: false
        };
    }

    handleClick(event) {
        event.preventDefault();

        this.setState({
            sendingEmail: true
        });

        let self = this;
        BackendEndpoints.sendDeleteAccountEmail().then((data) => {
            if (data) {
                self.setState({
                    notification: true,
                    notificationType: NOTIFICATION_TYPE.NOTIFICATION,
                    notificationMessage: 'Account deletion confirmation email sent. Please check your inbox',
                    sendingEmail: false
                });
                setTimeout(function () {
                    self.setState({
                        notification: false,
                        notificationType: NOTIFICATION_TYPE.NOTIFICATION,
                        notificationMessage: '',
                    });
                }, 30000);
            }
            else {
                this.setState({
                    notification: true,
                    notificationType: NOTIFICATION_TYPE.ERROR,
                    notificationMessage: 'Error sending delete account email',
                    sendingEmail: false
                });
            }
        });
    }

    render() {
        return (
            <div>
                <Notification notification={this.state.notification} notificationType={this.state.notificationType}
                              notificationMessage={this.state.notificationMessage}/>
                <div className="right-section">
                    <div className="welcome-sec">
                        <h1>Delete account</h1>
                        <br/>
                        <p>If you delete your EasyCrypt account, your account data will be wiped out. Among other
                            things, your encryption keys, email address and passwords will be deleted, and EasyCrypt
                            will forget that this account ever existed. This action is irreversible.</p>
                        <br/>
                        <p>Your emails are stored by your email service provider and will not be deleted if you
                            delete your EasyCrypt account. However, you must make sure that you can decrypt
                            them.</p>
                        <br/>
                        <p>Before deleting your account, export your encryption keys, import them into a PGP-enabled
                            email client such as Thunderbird, and make sure that you can decrypt your messages. If
                            you don’t export your keys before deleting your account, you will not be able to decrypt
                            your messages.</p>
                    </div>
                    <div className="form-flds">
                        <button className="account-button" type="button" onClick={(e) => this.handleClick(e)}
                                disabled={this.state.sendingEmail}>
                            Delete account
                        </button>
                        <img className="loader-request " src="/images/loader.gif"
                        style={{display: (this.state.sendingEmail ? "inline-block": "none")}}/>
                    </div>
                </div>
            </div>
        )
    }
}
