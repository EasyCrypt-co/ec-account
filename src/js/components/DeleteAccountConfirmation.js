/**
 * EasyCrypt.co Account Management
 * Copyright 2017, EasyCrypt.co
 * See README for details.
 *
 * @version 0.1.37
 */

import React from "react";
import swal from "sweetalert2";
import Notification from "./account/Notification";
import {NOTIFICATION_TYPE, APP_CONFIG} from "../utils/constants";
import BackendEndpoints from "../utils/backendEndpoints";

export default class DeleteAccountConfirmation extends React.Component {
    constructor(props) {
        super(props);

        if (this.props.location.query.id) {
            this.state = {
                notification: false,
                notificationType: '',
                notificationMessage: '',
                deleteId: this.props.location.query.id,
                email: null,
                ec_jwt: null,
                accountDeleted: false
            };

            BackendEndpoints.getToken(this.props.location.query.id).then((data) => {
                if (data) {
                    this.setState({
                        ec_jwt: data.ec_jwt,
                    });

                    BackendEndpoints.getUserDetails(this.state.ec_jwt).then((data) => {
                        if (data) {
                            this.setState({
                                email: data.data.data.email,
                            });
                        }
                        else {
                            this.setState({
                                notification: true,
                                notificationType: NOTIFICATION_TYPE.ERROR,
                                notificationMessage: 'Link expired',
                            });
                        }
                    });
                }
                else {
                    this.setState({
                        notification: true,
                        notificationType: NOTIFICATION_TYPE.ERROR,
                        notificationMessage: 'Link expired',
                    });
                }
            });
        }
        else {
            this.state = {
                notification: true,
                notificationType: NOTIFICATION_TYPE.ERROR,
                notificationMessage: 'Delete account id not found',
            };
        }
    }

    handleDeleteButtonClick(e) {
        e.preventDefault();

        let self = this;
        swal({
            text: "Have you exported and saved your PGP key? You will not be able to read your encrypted messages without it after you delete your EasyCrypt account!",
            showCancelButton: true,
            confirmButtonText: 'Yes, delete my account now',
            width: 500,
            animation: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            customClass: "swal-custom"
        }).then(function () {
            BackendEndpoints.deleteAccount(self.state.deleteId, self.state.ec_jwt).then((data) => {
                if (data) {
                    self.setState({
                        accountDeleted: true
                    });
                }
                else {
                    self.setState({
                        notification: true,
                        notificationType: NOTIFICATION_TYPE.ERROR,
                        notificationMessage: 'Error deleting account',
                    });
                }
            });
        })
    }

    handleCancelButtonClick(e) {
        e.preventDefault();
        window.location.replace(APP_CONFIG.accountURL);
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
            if (this.state.ec_jwt && this.state.email) {
                if (this.state.accountDeleted) {
                    content = (
                        <div className="welcome-sec">
                            <h1>Account deleted</h1>
                            <br/>
                            <p>Account {this.state.email} deleted.</p>
                            <br/>
                            <p>You can close this tab.</p>
                        </div>
                    );
                }
                else {
                    content = (
                        <div className="welcome-sec">
                            <h1>Delete account: {this.state.email}</h1>
                            <br/>
                            <p>Before deleting your account, export your encryption keys, import them into a PGP-enabled
                                email client such as Thunderbird, and make sure that you can decrypt your messages. If
                                you don’t export your keys before deleting your account, you will not be able to decrypt
                                your messages.</p>
                            <br/>
                            <p>Are you sure you want to delete your EasyCrypt account? If you confirm, the contents of
                                your EasyCrypt account will be wiped out and we will not be able to restore them.</p>
                            <br/>
                            <div className="form-flds">
                                <button className="account-button danger" type="button"
                                        onClick={(e) => this.handleDeleteButtonClick(e)}>
                                    Yes, I am sure. Delete my account.
                                </button>
                                <button id="confirmButton" className="account-button" type="button"
                                        onClick={(e) => this.handleCancelButtonClick(e)}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    );
                }
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
                    <div className="confirm-delete-account-section">
                        {content}
                    </div>
                </div>
            </div>
        )
    }
}
