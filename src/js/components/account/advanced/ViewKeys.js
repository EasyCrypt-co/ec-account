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
import Utils from "../../../utils/utils";

export default class ViewKeys extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            notification: false,
            notificationType: '',
            notificationMessage: '',
            email: '',
            fingerprint: '',
            publicKey: '',
            privateKey: '',
            keysLength: '',
            publicKeyFileName: '',
            backupKeysFileName: '',
            backupFileContent: ''
        };


        BackendEndpoints.getUserKeys().then((data) => {
            if (data) {
                this.setState({
                    email: data.email,
                    fingerprint: data.fingerprint.match(/\w{4}(?=\w{1,4})|\w+/g).join(' '),
                    publicKey: atob(data.keys.public_key),
                    privateKey: atob(data.keys.private_key),
                    keysLength: data.bits
                });

                let publicKeyFileName = Utils.computeKeyFileName("public", data.email, data.fingerprint);
                let backupKeysFileName = Utils.computeKeyFileName("backup", data.email, data.fingerprint);
                let backupFileContent = atob(data.keys.public_key) + atob(data.keys.private_key);

                this.setState({
                    publicKeyFileName: publicKeyFileName,
                    backupKeysFileName: backupKeysFileName,
                    backupFileContent: backupFileContent
                });

            }
            else {
                this.setState({
                    notification: true,
                    notificationType: NOTIFICATION_TYPE.ERROR,
                    notificationMessage: 'Error fetching keys',
                });
            }
        });
    }

    copyPublicKey(event) {
        event.preventDefault();
        this.copyToClipboard(this.state.publicKey);
        this.setState({
            notification: true,
            notificationType: NOTIFICATION_TYPE.NOTIFICATION,
            notificationMessage: 'Copied',
        });
        let self = this;
        setTimeout(function () {
            self.setState({
                notification: false,
                notificationType: NOTIFICATION_TYPE.NOTIFICATION,
                notificationMessage: '',
            });
        }, 3000);
    }

    copyToClipboard(val) {
        let dummy = document.createElement("textarea");
        document.body.appendChild(dummy);
        dummy.setAttribute("id", "dummy_id");
        $("#dummy_id").val(val);
        dummy.select();
        document.execCommand("copy");
        document.body.removeChild(dummy);
    }

    render() {
        return (
            <div>
                <Notification notification={this.state.notification} notificationType={this.state.notificationType}
                              notificationMessage={this.state.notificationMessage}/>
                <div className="right-section">
                    <div className="welcome-sec">
                        <h1>View / Export keys</h1>
                        <div className="user-form">
                            <div className="form-flds">
                                <label className="left-align large gray">Fingerpint</label>
                                <div className="textfield smaller">
                                    <input className="view" type="text" id="fingerprint" placeholder="Fingerprint"
                                           value={this.state.fingerprint} disabled/>
                                </div>
                            </div>
                            <div className="form-flds">
                                <label className="left-align large gray">Key length</label>
                                <div className="textfield smaller">
                                    <p>{this.state.keysLength} bit</p>
                                </div>
                            </div>
                            <div className="form-flds">
                                <label className="left-align large gray">Public key</label>
                                <div className="textfield smaller">
                                    <textarea rows="14" className="view" value={this.state.publicKey} disabled/>
                                    <br/>
                                    <div className="right-links-container">
                                        <a href={"data:text/plain;charset=UTF-8," + encodeURIComponent(this.state.publicKey)}
                                           download={this.state.publicKeyFileName}
                                           className="left-link">Download
                                        </a>
                                        <a href="#" className="right-link" onClick={(e) => this.copyPublicKey(e)}>Copy
                                            to
                                            clipboard</a>
                                    </div>
                                </div>
                            </div>
                            <div className="form-flds lower">
                                <a href={"data:text/plain;charset=UTF-8," + encodeURIComponent(this.state.backupFileContent)}
                                   download={this.state.backupKeysFileName}>
                                    <div className="account-button">
                                        Export PGP key pair
                                    </div>
                                </a>
                                <span className="button-description"> The private key will be encrypted by your EasyCrypt password. </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
