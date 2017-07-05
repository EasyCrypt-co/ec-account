/**
 * EasyCrypt.co Account Management
 * Copyright 2017, EasyCrypt.co
 * See README for details.
 *
 * @version 0.1.37
 */

import React from "react";
import {ACCOUNT_URLS, NOTIFICATION_TYPE} from "../../../utils/constants";
import Notification from "../Notification";
import BackendEndpoints from "../../../utils/backendEndpoints";
import Utils from "../../../utils/utils";

export default class Advanced extends React.Component {
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
            backupKeysFileName: '',
            backupFileContent: ''
        };

        BackendEndpoints.getUserKeys().then((data) => {
            if (data) {
                this.setState({
                    email: data.email,
                    fingerprint: data.fingerprint,
                    publicKey: atob(data.keys.public_key),
                    privateKey: atob(data.keys.private_key),
                    keysLength: data.bits
                });

                let backupKeysFileName = Utils.computeKeyFileName("backup", data.email, data.fingerprint);
                let backupFileContent = atob(data.keys.public_key) + atob(data.keys.private_key);

                this.setState({
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

    goToPage(e, page) {
        e.preventDefault();
        this.props.goToPage(page);
    }

    render() {
        return (
            <div>
                <Notification notification={this.state.notification} notificationType={this.state.notificationType}
                              notificationMessage={this.state.notificationMessage}/>
                <div className="right-section">
                    <div className="welcome-sec">
                        <h1>Advanced</h1>
                        <h3>Key management - for advanced users only</h3>

                        <div className="user-form">
                            <div className="form-flds">
                                <label className ="left-align"><a href="#" onClick={(e) => this.goToPage(e, ACCOUNT_URLS.ADVANCED_VIEW_KEYS)}>View / Export keys</a></label>
                                <div className="textfield">
                                    <p>View, copy or download your public key, or export your public/private key pair</p>
                                </div>
                            </div>
                            <div className="form-flds">
                                <label className ="left-align"><a href="#" onClick={(e) => this.goToPage(e, ACCOUNT_URLS.ADVANCED_IMPORT_KEYS)}>Import
                                    keys</a></label>
                                <div className="textfield">
                                    <p>Import an existing PGP key pair</p>
                                </div>
                            </div>
                            <div className="form-flds">
                                <label className ="left-align"><a href="#" onClick={(e) => this.goToPage(e, ACCOUNT_URLS.ACCOUNT_DELETE)}>
                                  Delete account
                                </a></label>
                                <div className="textfield">
                                    <p>Wipe out your EasyCrypt account</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
