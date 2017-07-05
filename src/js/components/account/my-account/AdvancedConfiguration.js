/**
 * EasyCrypt.co Account Management
 * Copyright 2017, EasyCrypt.co
 * See README for details.
 *
 * @version 0.1.37
 */

import React from "react";

export default class AdvancedConfiguration extends React.Component {
    constructor(props) {
        super(props);

        if (props.connectionDetails) {
            let settings = {};
            if (props.connectionDetails.imap) {
                if (props.connectionDetails.imap.imap_host) {
                    let imapConnectionString = props.connectionDetails.imap.imap_host;
                    if (imapConnectionString) {
                        let splitImapConnectionString = imapConnectionString.split("://");
                        if (splitImapConnectionString.length == 2) {
                            settings.imapProtocol = splitImapConnectionString[0];
                            settings.imapHost = splitImapConnectionString[1];
                        }
                    }
                }
                if (props.connectionDetails.imap.imap_port) {
                    settings.imapPort = props.connectionDetails.imap.imap_port;
                }
            }
            if (props.connectionDetails.smtp) {
                let smtpConnectionString = props.connectionDetails.smtp.smtp_host;
                if (smtpConnectionString) {
                    let splitSmtpConnectionString = smtpConnectionString.split("://");
                    if (splitSmtpConnectionString.length == 2) {
                        settings.smtpProtocol = splitSmtpConnectionString[0];
                        settings.smtpHost = splitSmtpConnectionString[1];
                    }
                    if (props.connectionDetails.smtp.smtp_port) {
                        settings.smtpPort = props.connectionDetails.smtp.smtp_port;
                    }
                }
            }
            this.state = {
                settings: settings
            }
        }
        else {
            this.state = {
                settings: {}
            }
        }
    }

    showHidePassword(event) {
        event.preventDefault();

        let passwordInput = this.password;

        if (passwordInput.getAttribute("type") == "password") {
            passwordInput.setAttribute("type", "text");
        }
        else {
            passwordInput.setAttribute("type", "password");
        }
    }

    handleManualConfigSubmit(event) {
        event.preventDefault();

        this.props.clearError();

        let imapProtocol = this.imapProtocol.value;
        let imapHost = this.imapHost.value;
        let imapPort = parseInt(this.imapPort.value);
        let smtpProtocol = this.smtpProtocol.value;
        let smtpHost = this.smtpHost.value;
        let smtpPort = parseInt(this.smtpPort.value);
        let username = this.username.value;
        let password = this.password.value;

        if (imapProtocol && imapProtocol != "" && imapHost && imapHost != "" && imapPort && imapPort != "" &&
            smtpProtocol && smtpProtocol != "" && smtpHost && smtpHost != "" && smtpPort && smtpPort != "" &&
            username && username != "" && password && password != "") {
            let settings = {};
            if (this.props.previousFailed) {
                let dataChanged = this.checkIfDataChanged(imapProtocol, imapHost, imapPort, smtpProtocol, smtpHost, smtpPort);
                if (dataChanged) {
                    settings.providerId = 0;
                }
                else {
                    settings.providerId = this.props.providerId;
                }
            }
            else {
                // settings.providerId = 0;
                settings.providerId = this.props.providerId;
            }
            settings.settings = {
                "imap": {
                    "imap_host": imapProtocol + "://" + imapHost,
                    "imap_port": imapPort
                },
                "smtp": {
                    "smtp_host": smtpProtocol + "://" + smtpHost,
                    "smtp_port": smtpPort
                }
            };
            settings.credentials = {
                "imap": {
                    "imap_username": username,
                    "imap_password": password
                },
                "smtp": {
                    "smtp_username": username,
                    "smtp_password": password
                }
            };
            this.props.handleManualConnectionDetailsClick(settings);
        }
        else {
            this.props.showError("Please provide all connection details");
            return;
        }
    }

    checkIfDataChanged(imapProtocol, imapHost, imapPort, smtpProtocol, smtpHost, smtpPort) {
        if (imapProtocol != this.state.settings.imapProtocol) {
            return true;
        }
        if (imapHost != this.state.settings.imapHost) {
            return true;
        }
        if (imapPort != this.state.settings.imapPort) {
            return true;
        }
        if (smtpProtocol != this.state.settings.smtpProtocol) {
            return true;
        }
        if (smtpHost != this.state.settings.smtpHost) {
            return true;
        }
        if (smtpPort != this.state.settings.smtpPort) {
            return true;
        }
        return false;
    }

    render() {
        return (
            <form onSubmit={(e) => this.handleManualConfigSubmit(e)}>
                <div className="step3">
                    <p>Please provide account info for {this.props.email}</p>
                    <div className="input-field">
                        <label className="font-sm">Incoming (IMAP) server</label>
                        <div className="form-input" style={{marginRight: "20px"}}>
                            <input type="text" className="sm" required
                                   defaultValue={this.state.settings.imapHost}
                                   ref={(imapHost) => this.imapHost = imapHost}/>
                        </div>
                        <label className="font-sm label-xs">Port</label>
                        <div className="form-input" style={{marginRight: "20px"}}>
                            <input type="number" min="0" max="65535" className="xs" required
                                   defaultValue={this.state.settings.imapPort}
                                   ref={(imapPort) => this.imapPort = imapPort}/>
                        </div>
                        <div className="form-input">
                            <select defaultValue={this.state.settings.imapProtocol}
                                    ref={(imapProtocol) => this.imapProtocol = imapProtocol}>
                                <option value="ssl">SSL</option>
                                <option value="tls">TLS</option>
                            </select>
                        </div>
                    </div>
                    <div className="input-field">
                        <label className="font-sm">Outgoing (SMTP) server</label>
                        <div className="form-input" style={{marginRight: "20px"}}>
                            <input type="text" className="sm" required
                                   defaultValue={this.state.settings.smtpHost}
                                   ref={(smtpHost) => this.smtpHost = smtpHost}/>
                        </div>
                        <label className="font-sm label-xs">Port</label>
                        <div className="form-input" style={{marginRight: "20px"}}>
                            <input type="number" min="0" max="65535" className="xs" required
                                   defaultValue={this.state.settings.smtpPort}
                                   ref={(smtpPort) => this.smtpPort = smtpPort}/>
                        </div>
                        <div className="form-input">
                            <select defaultValue={this.state.settings.smtpProtocol}
                                    ref={(smtpProtocol) => this.smtpProtocol = smtpProtocol}>
                                <option value="ssl">SSL</option>
                                <option value="tls">TLS</option>
                            </select>
                        </div>
                    </div>
                    <div className="input-field">
                        <label className="font-sm">Username</label>
                        <div className="form-input">
                            <input type="text" required
                                   defaultValue={this.props.email}
                                   ref={(username) => this.username = username}/>
                        </div>
                    </div>
                    <div className="input-field">
                        <label
                            className="font-sm">{this.props.previousFailed ? "Verify password" : "Password"}</label>
                        <div className="form-input">
                            <input type="password" required
                                   ref={(password) => this.password = password}/>
                            <a href="#" onClick={(event) => this.showHidePassword(event)}>
                                <img className="password-eye" src="/images/eye.png"/>
                            </a>
                            <br/>
                        </div>
                    </div>
                    <div className="input-field btn">
                    <div className="description">
                      <span> Your password will be encrypted by your public key </span>
                    </div>
                      <div className="enterbtn right">
                          <button id="enterclick" type="submit" disabled={this.props.settingConnectionSettings}>
                              NEXT
                          </button>
                          <img className="loader" src="images/loader.gif"
                               style={{display: this.props.settingConnectionSettings ? "inline-block" : "none"}}/>
                      </div>
                    </div>
                </div>
            </form>
        );
    }
}
