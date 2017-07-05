/**
 * EasyCrypt.co Account Management
 * Copyright 2017, EasyCrypt.co
 * See README for details.
 *
 * @version 0.1.37
 */

import React from "react";
import StepHeader from "./StepHeader";
import Utils from "../../utils/utils";
import swal from "sweetalert2";
import {LOG} from "../../utils/constants";

export default class SetPassword extends React.Component {
    constructor(props) {
        super(props);
    }

    showHidePasswords(event) {
        event.preventDefault();

        let passwordInput = this.password;
        let confirmPasswordInput = this.confirmPassword;

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

    handleSubmit(event) {
        event.preventDefault();
        this.props.pushLog(LOG.HANDLE_SUBMIT);
        this.props.clearError();

        let password = this.password.value;
        let confirmPassword = this.confirmPassword.value;

        let passwordsOk = Utils.verifyPassword(password, confirmPassword);

        if (passwordsOk.ok) {
            let parentProps = this.props;
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
                parentProps.setPassword(password);
            });
        }
        else {
            this.props.pushLog(LOG.ERROR_SETTING_PASSWORD + ':' + passwordsOk.error);
            this.props.showError(passwordsOk.error);
            return;
        }
    }

    render() {
        let content;
        let okCheckImage;
        if (this.props.currentStep == this.props.step) {
            if (this.props.generatingKeys) {
                content = (
                    <div className="step2">
                        <div className="step2-para">
                            <p className="large-font">
                                Generating 4096 bit RSA keys…
                                <span><img className="big-loader" src="/images/loader.gif"/></span>
                            </p>
                            <p>(this may take a minute or two)</p>


                        </div>
                    </div>
                );
            }
            else {
                if (!this.props.keysGenerated) {
                    content = (
                        <form onSubmit={(e) => this.handleSubmit(e)}>
                            <div className="step1">
                                <div className="password-feild">
                                    <label>Choose password</label>
                                    <div className="enterldigits">
                                        <input id="passwordInput" type="password"
                                               ref={(password) => this.password = password}
                                               required/>
                                        <a href="#" onClick={(event) => this.showHidePasswords(event)}>
                                            <img className="password-eye" src="images/eye.png"/>
                                        </a>
                                        <span>(at least 8 characters,<br/> minimum 2 digits and 2 letters)</span>
                                    </div>
                                </div>
                                <div className="password-feild">
                                    <label>Confirm password</label>
                                    <div className="enterldigits">
                                        <input id="confirmPasswordInput" type="password"
                                               ref={(confirmPassword) => this.confirmPassword = confirmPassword}
                                               required/>
                                        <a href="#"
                                           onClick={(event) => this.showHidePasswords(event)}>
                                            <img className="password-eye" src="images/eye.png"/>
                                        </a>
                                    </div>
                                </div>
                                <div className="password-feild button-right">
                                <p className="set-password-text">
                                  Currently only Chrome, Firefox, Safari (non-Private mode) and Tor
                                  <br/>browsers are supported
                                </p>
                                  <div className="enterbtn">
                                      <button id="enterclick" type="submit" disabled={this.props.settingPassword}>
                                          Next
                                      </button>
                                      <img className="loader" src="images/loader.gif"
                                           style={{display: this.props.settingPassword ? "inline-block" : "none"}}/>
                                  </div>
                                </div>
                            </div>
                        </form>
                    );
                }
                else {
                    content = "";
                }
            }
        }
        else {
            if (this.props.currentStep > this.props.step) {
                okCheckImage = (<img className="right-click" src="images/right-tick.png"/>);
            }
            else {
                content = "";
            }
        }

        return (
            <div className="step-row">
                {okCheckImage}
                <StepHeader step={this.props.step} text={this.props.text}/>
                {content}
            </div>
        );
    }
}
