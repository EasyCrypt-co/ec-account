/**
 * EasyCrypt.co Account Management
 * Copyright 2017, EasyCrypt.co
 * See README for details.
 *
 * @version 0.1.37
 */

import React from "react";
import swal from "sweetalert2";
import BackendEndpoints from "../../../utils/backendEndpoints";
import Utils from "../../../utils/utils";
import Notification from "../Notification";
import {NOTIFICATION_TYPE} from "../../../utils/constants";

export default class Password extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            notification: false,
            notificationType: '',
            notificationMessage: '',
            email: '',
            eyeActive: false,
            sendRequest: false
        };
    }

    handleSubmit(event) {
        event.preventDefault();

        //clear notifications
        this.setState({
            notification: false
        });

        let currentPassword = this.currentPassword.value;

        let password = this.password.value;
        let confirmPassword = this.confirmPassword.value;

        let passwordsOk = Utils.verifyPassword(password, confirmPassword);

        if (passwordsOk.ok) {
            let self = this;
            swal({
                title: "WARNING",
                text: "Your password is known only to you. If you forget it, your encrypted messages will be lost forever and you will not be able to use EasyCrypt with this email address. We will be technically unable to help you to restore your messages. If you have not written down your password, go back, re-enter it and write it down.",
                showCancelButton: true,
                confirmButtonText: "I have written down my password, proceed",
                cancelButtonText: "Go back",
                width: 650,
                animation: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
                customClass: "swal-custom"
            }).then(function () {
                self.clearInputs();
                self.disableButton();
                self.setState({
                  sendRequest: true
                });
                Utils.encryptWithNewPassphrase(currentPassword, password).then((data) => {
                    if (data) {
                        BackendEndpoints.updateUserKeys(self.props.email, Utils.hashString(password + self.props.email.toLowerCase()), data.public_key, data.private_key).then((data) => {
                            if (data && data == "success") {
                                self.setState({
                                    notification: true,
                                    notificationType: NOTIFICATION_TYPE.NOTIFICATION,
                                    notificationMessage: "Password updated"
                                });
                                self.enableButton();
                                self.setState({
                                  sendRequest: false
                                });
                            }
                            else {
                                self.setState({
                                    notification: true,
                                    notificationType: NOTIFICATION_TYPE.ERROR,
                                    notificationMessage: "Error updating password"
                                });
                                self.enableButton();
                                self.setState({
                                  sendRequest: false
                                });
                            }
                        });

                    }
                    else {
                        self.setState({
                            notification: true,
                            notificationType: NOTIFICATION_TYPE.ERROR,
                            notificationMessage: "Couldn't decrypt key. Please enter the passphrase again"
                        });
                        self.enableButton();
                        self.setState({
                          sendRequest: false
                        });
                    }
                  });
            });
        }
        else {
            this.setState({
                notification: true,
                notificationType: NOTIFICATION_TYPE.ERROR,
                notificationMessage: passwordsOk.error
            });
            this.enableButton();
            self.setState({
              sendRequest: false
            });
            return;
        }
    }

    clearInputs() {
        $("#currentPassword").val("");
        $("#newPassword").val("");
        $("#confirmNewPassword").val("");
    }

    enableButton() {
        $(".submit-btn input").prop('disabled', false);
    }

    disableButton() {
        $(".submit-btn input").prop('disabled', true);
    }

    showHidePasswords(event) {
        event.preventDefault();

        let currentPasswordInput = this.currentPassword;
        let passwordInput = this.password;
        let confirmPasswordInput = this.confirmPassword;
        this.setState({eyeActive: !this.state.eyeActive});

        if (currentPasswordInput.getAttribute("type") == "password") {
            currentPasswordInput.setAttribute("type", "text");
        }
        else {
            currentPasswordInput.setAttribute("type", "password");
        }

        if (passwordInput.getAttribute("type") == "password") {
            passwordInput.setAttribute("type", "text");
        }
        else {
            passwordInput.setAttribute("type", "password");
        }

        if (confirmPasswordInput.getAttribute("type") == "password") {
            confirmPasswordInput.setAttribute("type", "text");
        }
        else {
            confirmPasswordInput.setAttribute("type", "password");
        }
    }

    render() {
        let eyeIcon;

        if (this.state.eyeActive) {
            eyeIcon = <img className="password-eye" src="/images/eye_active.png"/>;
        } else {
            eyeIcon = <img className="password-eye" src="/images/eye.png"/>;
        }
        return (
            <div>
                <Notification notification={this.state.notification} notificationType={this.state.notificationType}
                              notificationMessage={this.state.notificationMessage}/>
                <div className="right-section">
                    <div className="welcome-sec">
                        <h1>EasyCrypt password</h1>
                        <div className="user-form">
                            <form onSubmit={(e) => this.handleSubmit(e)}>
                                <div className="form-flds custom-margin-1">
                                    <label className="left-align gray">Current password</label>
                                    <div className="textfield">
                                        <input type="password" id="currentPassword" required
                                               ref={(currentPassword) => this.currentPassword = currentPassword}
                                               placeholder="Current EasyCrypt password"/>
                                        <a href="#" onClick={(event) => this.showHidePasswords(event)}>
                                            {eyeIcon}
                                        </a>
                                    </div>
                                </div>
                                <br/>
                                <br/>
                                <div className="form-flds custom-margin-2">
                                    <label className="left-align gray">New password</label>
                                    <div className="textfield">
                                        <input type="password" id="newPassword" required
                                               ref={(password) => this.password = password}
                                               placeholder="New EasyCrypt password"/>
                                        <a href="#" onClick={(event) => this.showHidePasswords(event)}>
                                            {eyeIcon}
                                        </a>
                                        <span>(at least 8 characters,<br/> minimum 2 digits and 2 letters)</span>
                                    </div>
                                </div>
                                <div className="form-flds">
                                    <label className="left-align gray">Confirm new password</label>
                                    <div className="textfield">
                                        <input type="password" id="confirmNewPassword" required
                                               ref={(confirmPassword) => this.confirmPassword = confirmPassword}
                                               placeholder="New EasyCrypt password"/>
                                        <a href="#" onClick={(event) => this.showHidePasswords(event)}>
                                            {eyeIcon}
                                        </a>
                                    </div>
                                </div>
                                <br/>
                                <div className="form-flds">
                                    <div className="submit-btn">
                                        <input type="submit" value="Save"/>
                                        <img className="loader-request " src="/images/loader.gif"
                                        style={{display: (this.state.sendRequest ? "inline-block": "none")}}/>

                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
