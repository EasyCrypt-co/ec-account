/**
 * EasyCrypt.co Account Management
 * Copyright 2017, EasyCrypt.co
 * See README for details.
 *
 * @version 0.1.37
 */

import React from "react";
import Notification from "../Notification";
import {NOTIFICATION_TYPE, ACCOUNT_URLS, APP_CONFIG, URLS} from "../../../utils/constants";
import BackendEndpoints from "../../../utils/backendEndpoints";
import Utils from "../../../utils/utils";

export default class ImportKeys extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            email: '',
            notification: false,
            notificationType: '',
            notificationMessage: '',
            phase: 0,
            keyContent: null,
            fingerprint: '',
            keyId: '',
            emails: [],
            complete: false,
            keyReplaced: false,
            intervalId: null,
            eyeActive: false,
            sendRequest: false
        };

        this.getImportKeyStatus();
    }

    componentWillUnmount() {
        this.stopGetStatusInterval();
    }

    clearNotification() {
        this.setState({
            notification: false,
            notificationType: NOTIFICATION_TYPE.NOTIFICATION,
            notificationMessage: '',
        });
    }

    startGetStatusInterval() {
        let self = this;
        let intervalId = setInterval(function () {
            console.log("called");
            self.getImportKeyStatus();
        }, 10000);
        this.setState({
            intervalId: intervalId
        });
    }

    stopGetStatusInterval() {
        if (this.state.intervalId != null) {
            clearInterval(this.state.intervalId);
        }
    }

    getImportKeyStatus() {
        BackendEndpoints.getAuthKey().then((data) => {
            if (data) {
                this.setState({
                    loading: false
                });
                if (data.status == "empty") {
                    this.setState({
                        notification: false,
                        notificationType: '',
                        notificationMessage: '',
                        phase: 0,
                        keyContent: null,
                        fingerprint: '',
                        keyId: '',
                        emails: [],
                        complete: false,
                        keyReplaced: false,
                        enableImportButton: true
                    });
                }
                if (data.status == "pending") {
                    this.setState({
                        phase: 2,
                        bits: data.bits,
                        fingerprint: data.fingerprint,
                        emails: data.uids
                    });

                    if (!this.state.intervalId) {
                        this.startGetStatusInterval();
                    }
                }
                else if (data.status == "completed") {
                    this.setState({
                        phase: 2,
                        bits: data.bits,
                        fingerprint: data.fingerprint,
                        emails: data.uids,
                        complete: true
                    });
                    this.stopGetStatusInterval();
                }
                else if (data.status == "error") {
                    this.setState({
                        notification: false,
                        notificationType: '',
                        notificationMessage: '',
                        phase: -1,
                        keyContent: null,
                        fingerprint: '',
                        keyId: '',
                        emails: [],
                        complete: false,
                        keyReplaced: false,
                    });
                }
            }
            else {
                this.setState({
                    loading: false,
                    notification: true,
                    notificationType: NOTIFICATION_TYPE.ERROR,
                    notificationMessage: 'Error getting key import status',
                    enableImportButton: false
                });
            }
        });
    }

    handleSelectFileClick(event) {
        event.preventDefault();
        document.getElementById('fileInput').click();
    }

    readKeyFileContent(e) {
        this.clearNotification();

        let fileInput = e.target;
        let file = fileInput.files[0];
        let reader = new FileReader();

        let self = this;
        reader.onload = function (e) {

            let privateKeyStartString = "-----BEGIN PGP PRIVATE KEY BLOCK-----";
            let privateKeyEndString = "-----END PGP PRIVATE KEY BLOCK-----";
            let privateKeyContent = Utils.getStringBetweenTwoStrings(privateKeyStartString, privateKeyEndString, reader.result);
            if (privateKeyContent) {
                let fingerprint = Utils.getKeyFingerprint(privateKeyContent);
                if (fingerprint) {
                    let keyId = fingerprint.substr(fingerprint.length - 8);
                    self.setState({
                        keyContent: privateKeyContent,
                        fingerprint: fingerprint,
                        keyId: keyId,
                        phase: 1
                    });
                }
                else {
                    self.setState({
                        notification: true,
                        notificationType: NOTIFICATION_TYPE.ERROR,
                        notificationMessage: 'Invalid key uploaded',
                    });
                }
            }
            else {
                self.setState({
                    notification: true,
                    notificationType: NOTIFICATION_TYPE.ERROR,
                    notificationMessage: 'Error importing key: the file does not contain a private key in an armored ASCII format',
                });
            }
        };

        reader.readAsText(file);
    }

    handleConfirmClick(event) {
        event.preventDefault();

        $("#confirmButton").prop("disabled", true);
        this.clearNotification();

        let keyPassphrase = this.keyPassphrase.value;
        let ecPassword = this.ecPassword.value;

        let newKeys = Utils.encryptKeyWithPassword(this.state.keyContent, keyPassphrase, ecPassword);

        if (newKeys) {
            let self = this;

            self.setState({
              sendRequest : true
            });
            
            BackendEndpoints.authenticate(this.props.email, Utils.hashString(ecPassword + this.props.email.toLowerCase())).then((data) => {
                if (data) {
                    BackendEndpoints.updateUserKeys(self.props.email, null, newKeys.public_key, newKeys.private_key).then((data) => {
                        if (data) {
                            if (data.status == "error") {
                                if (data.message == "no_account_uid") {
                                    $("#confirmButton").prop("disabled", false);
                                    self.setState({
                                        notification: true,
                                        notificationType: NOTIFICATION_TYPE.ERROR,
                                        notificationMessage: "The key cannot be imported because is not associated with email identity " + self.props.email + ".",
                                        sendRequest: false

                                    });
                                }
                                else if (data.message == "subscriber_uid") {
                                    $("#confirmButton").prop("disabled", false);
                                    self.setState({
                                        notification: true,
                                        notificationType: NOTIFICATION_TYPE.ERROR,
                                        notificationMessage: "The key cannot be imported because it is associated with an email address of another subscriber with a different fingerprint.",
                                        sendRequest: false
                                    });
                                }
                                else if (data.message == "key_error") {
                                    $("#confirmButton").prop("disabled", false);
                                    self.setState({
                                        notification: true,
                                        notificationType: NOTIFICATION_TYPE.ERROR,
                                        notificationMessage: "The key cannot be imported because it is malformed, revoked or invalid.",
                                        sendRequest: false
                                    });
                                }
                                else if (data.message == "multiple_uid") {
                                    $("#confirmButton").prop("disabled", false);
                                    self.setState({
                                        notification: true,
                                        notificationType: NOTIFICATION_TYPE.ERROR,
                                        notificationMessage: "The key you are trying to upload is associated with multiple email addresses. This is currently not supported",
                                        sendRequest: false
                                    });
                                }
                                else {
                                    $("#confirmButton").prop("disabled", false);
                                    self.setState({
                                        notification: true,
                                        notificationType: NOTIFICATION_TYPE.ERROR,
                                        notificationMessage: "Error importing new key",
                                        sendRequest: false
                                    });
                                }
                            }
                            else {
                                self.getImportKeyStatus();
                                self.setState({
                                  sendRequest: false
                                });
                            }
                        }
                        else {
                            $("#confirmButton").prop("disabled", false);
                            self.setState({
                                notification: true,
                                notificationType: NOTIFICATION_TYPE.ERROR,
                                notificationMessage: "Error importing new key",
                                sendRequest: false
                            });
                        }
                    });
                }
                else {
                    $("#confirmButton").prop("disabled", false);
                    self.setState({
                        notification: true,
                        notificationType: NOTIFICATION_TYPE.ERROR,
                        notificationMessage: "Wrong EasyCrypt password",
                        sendRequest: false
                    });
                }
            });
        }
        else {
            $("#confirmButton").prop("disabled", false);
            this.setState({
                notification: true,
                notificationType: NOTIFICATION_TYPE.ERROR,
                notificationMessage: "Couldn't decrypt key. Please enter the passphrase again",
                sendRequest: false
            });
        }
    }

    handleAbortClick(event) {
        event.preventDefault();

        this.clearNotification();
        this.stopGetStatusInterval();

        BackendEndpoints.abortUserKeyImport().then((data) => {
            if (data) {
                this.setState({
                    phase: 0,
                    keyContent: null,
                    fingerprint: '',
                    keyId: '',
                    emails: [],
                    keyReplaced: false,
                    enableImportButton: true
                });
            }
            else {
                this.setState({
                    notification: true,
                    notificationType: NOTIFICATION_TYPE.ERROR,
                    notificationMessage: 'Error aborting key import process',
                });
            }
        });
    }

    handleReplaceClick(event) {
        event.preventDefault();

        this.clearNotification();

        $("#replaceKeysButton").prop('disabled', true);

        BackendEndpoints.replaceKeys().then((data) => {
            if (data) {
                $("#replaceKeysButton").prop('disabled', false);
                this.setState({
                    keyReplaced: true
                });
                this.stopGetStatusInterval();
            }
            else {
                $("#replaceKeysButton").prop('disabled', false);
                this.setState({
                    notification: true,
                    notificationType: NOTIFICATION_TYPE.ERROR,
                    notificationMessage: 'Error replacing keys',
                });
            }
        });
    }

    showHidePasswords(event) {
        event.preventDefault();

        let keyPassphraseInput = this.keyPassphrase;
        let ecPasswordInput = this.ecPassword;
        this.setState({eyeActive: !this.state.eyeActive});

        if (keyPassphraseInput.getAttribute("type") == "password") {
            keyPassphraseInput.setAttribute("type", "text");
        }
        else {
            keyPassphraseInput.setAttribute("type", "password");
        }

        if (ecPasswordInput.getAttribute("type") == "password") {
            ecPasswordInput.setAttribute("type", "text");
        }
        else {
            ecPasswordInput.setAttribute("type", "password");
        }
    }

    handlePasswordInputsChange() {
        if (this.keyPassphrase.value != null && this.keyPassphrase.value != '' && this.ecPassword.value != null && this.ecPassword.value != '') {
            $("#confirmButton").prop("disabled", false);
            let self = this;
            $("#confirmButton").off("click").on("click", function (e) {
                e.stopPropagation();
                self.handleConfirmClick(e);
            });
        }
        else {
            $("#confirmButton").prop("disabled", true);
        }
    }

    goToViewKeys(e) {
        e.preventDefault();

        window.location.replace(APP_CONFIG.accountURL + ACCOUNT_URLS.ADVANCED_VIEW_KEYS);
    }

    logout(e) {
      e.preventDefault();
      BackendEndpoints.logout().then((data) => {
          window.location.replace(APP_CONFIG.webMailURL + URLS.LOGIN);
      });
    }

    render() {
        let content = null;
        let description = (
          <p>
            <p>When you import a public/private PGP key pair, it replaces your existing keys.</p>
            <br/>
            <p>A verification message will be sent to the email address that is associated with the
             new key pair. You will need open the message in a PGP-enabled email client other than EasyCrypt.
              If more than one email address is associated with the new key pair, a separate verification
               message will be sent to each address.
            </p>
            <br/>
            <p>
            The new key pair will replace the existing key pair only after the verification
             process is completed for all the associated email addresses.
            </p>
          </p>
        );
        let explanation = (
            <div>
                <p>
                    The imported private key will be re-encrypted with your EasyCrypt password. The re-encryption
                    operation
                    will take place on your device only. EasyCrypt servers will remain ignorant of both your key
                    passphrase and your
                    EasyCrypt password.
                </p>
                <br />
                <p>Key to be imported: </p>
                <br/>
            </div>
        );
        let eyeIcon;

        if (this.state.eyeActive) {
            eyeIcon = <img className="password-eye" src="/images/eye_active.png"/>;
        } else {
            eyeIcon = <img className="password-eye" src="/images/eye.png"/>;
        }

        if (this.state.loading) {
            content = (
                <div className="loader-container">
                    <img className="big-loader" src="/images/loader.gif"/>
                </div>
            );
        }
        else {
            if (this.state.phase == -1) {
                content = (
                    <div>
                        <p>Something did not work properly during key import. If the problem persists, please <a
                            href="https://easycrypt.co/contact/" target="_blank">contact support</a>.</p>
                        <br/>
                        <div className="form-flds">
                            <button className="account-button danger" type="button"
                                    onClick={(e) => this.handleAbortClick(e)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                );
            }
            else if (this.state.phase == 0) {
                content = (
                    <div>
                        <h1>Import keys</h1>
                        <br/>
                        {description}
                        <br/>
                        <div className="form-flds">
                            <input id="fileInput" type="file" style={{display: "none"}}
                                   onChange={(e) => this.readKeyFileContent(e)}/>
                            <input type="button" className="account-button" disabled={this.state.enableImportButton ? false : true} value="Import PGP key pair (armored ASCII)"
                                   onClick={(e) => this.handleSelectFileClick(e)}/>
                            <button className="account-button danger cancel-import" type="button"
                                    onClick={(e) => this.handleAbortClick(e)}
                                    style={{display: (this.state.enableImportButton ? "none" : "inline-block")}}
                                    >
                                Cancel
                            </button>
                        </div>
                    </div>
                );
            }
            else if (this.state.phase == 1) {
                content = (
                    <div>
                        <h1>PGP key import and replacement</h1>
                        <br/>
                        {explanation}
                        <div className="form-flds">
                            <label className="left-align gray">Fingerprint</label>
                            <div className="textfield">
                                <input type="text" disabled placeholder="Key fingerprint"
                                       value={this.state.fingerprint.match(/\w{4}(?=\w{1,4})|\w+/g).join(' ')}/>
                            </div>
                        </div>
                        <div className="form-flds">
                            <label className="left-align gray">Key ID</label>
                            <div className="textfield">
                                <input type="text" disabled placeholder="Key fingerprint" value={this.state.keyId}/>
                            </div>
                        </div>
                        <div className="form-flds">
                            <label className="left-align gray">Key passphrase</label>
                            <div className="textfield">
                                <input type="password" id="keyPassphrase"
                                       ref={(keyPassphrase) => this.keyPassphrase = keyPassphrase}
                                       onChange={() => this.handlePasswordInputsChange()}
                                       placeholder="Key passphrase"/>
                                <a href="#" onClick={(event) => this.showHidePasswords(event)}>
                                    {eyeIcon}
                                </a>
                            </div>
                        </div>
                        <div className="form-flds">
                            <label className="left-align gray">EasyCrypt password</label>
                            <div className="textfield">
                                <input type="password" id="ecPassword"
                                       ref={(ecPassword) => this.ecPassword = ecPassword}
                                       onChange={() => this.handlePasswordInputsChange()}
                                       placeholder="EasyCrypt password"/>
                                <a href="#" onClick={(event) => this.showHidePasswords(event)}>
                                    {eyeIcon}
                                </a>
                            </div>
                        </div>
                        <br/>
                        <div className="form-flds">
                            <button className="account-button danger" type="button"
                                    onClick={(e) => this.handleAbortClick(e)}>
                                Cancel
                            </button>
                            <button id="confirmButton" className="account-button" type="button" disabled>
                                Proceed
                            </button>
                            <img className="loader-request " src="/images/loader.gif"
                            style={{display: (this.state.sendRequest ? "inline-block": "none")}}/>
                        </div>
                    </div>
                )
            }
            else if (this.state.phase == 2) {
                let phase2Content = null;
                if (this.state.keyReplaced) {
                    phase2Content = (
                        <div>
                            <p>Key replaced on {new Date().toGMTString()}</p>
                            <p>To start using the new key, you must log out now. The new key will be used after you log in again.</p>
                            <button className="account-button" type="button"
                                    onClick={(e) => this.logout(e)}>
                                OK, log me out
                            </button>
                        </div>
                    );
                }
                else {
                    let text = null;
                    let replaceButton = null;
                    if (this.state.complete) {
                        text = (
                            <p>Verification complete. Click Replace to complete key replacement.</p>
                        );
                        replaceButton = (
                            <button id="replaceKeysButton" className="account-button" type="button"
                                    onClick={(e) => this.handleReplaceClick(e)}>
                                Replace
                            </button>
                        );
                    }
                    else {
                        text = (
                            <p>You must click the link contained by the encrypted verification email(s) within the next
                                60
                                minutes; otherwise the key import process will be aborted.</p>
                        );
                    }
                    phase2Content = (
                        <div>
                            {
                                this.state.emails.map(function (email) {
                                    return <li key={email.uid}>{email.uid}
                                        {email.verified ? "" : "- verification email sent"}</li>
                                })
                            }
                            <br/>
                            {text}
                            <button className="account-button danger" type="button"
                                    onClick={(e) => this.handleAbortClick(e)}>
                                Cancel
                            </button>
                            {replaceButton}
                        </div>
                    )
                }
                content = (
                    <div>
                        {phase2Content}
                    </div>
                );
            }
        }
        return (
            <div>
                <Notification notification={this.state.notification} notificationType={this.state.notificationType}
                              notificationMessage={this.state.notificationMessage}/>
                <div className="right-section">
                    <div className="welcome-sec">
                        {content}
                    </div>
                </div>
            </div>
        )
    }
}
