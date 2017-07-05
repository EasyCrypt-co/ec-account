/**
 * EasyCrypt.co Account Management
 * Copyright 2017, EasyCrypt.co
 * See README for details.
 *
 * @version 0.1.37
 */

import React from "react";
import StepHeader from "../StepHeader";
import OauthConfiguration from "./OauthConfiguration";
import PlainConfiguration from "./PlainConfiguration";
import ManualConfiguration from "./ManualConfiguration";
import {PROVIDER_CONFIG, PROVIDERS, APP_CONFIG, URLS, LOG} from "../../../utils/constants";

export default class EmailSetup extends React.Component {
    constructor(props) {
        super(props);
    }

    handleOauthClick() {
        if (this.props.oauthLink) {
            window.location.replace(this.props.oauthLink);
        }
    }

    handleLoginClick(event) {
        event.preventDefault();
        this.props.pushLog(LOG.HANDLE_LOGIN_CLICK);
        window.location.replace(APP_CONFIG.webMailURL + URLS.LOGIN + "?user=" + this.props.email);
    }

    handlePlainConnectionDetailsClick(password) {
        let settings = {};

        settings.providerId = this.props.providerId;
        settings.settings = this.props.connectionDetails;
        settings.credentials = {
            "imap": {
                "imap_username": this.props.email,
                "imap_password": password
            },
            "smtp": {
                "smtp_username": this.props.email,
                "smtp_password": password
            }
        };

        this.props.setConnectionSettings(settings);
    }

    handleManualConnectionDetailsClick(settings) {
        this.props.setConnectionSettings(settings);
    }

    getProvider(providerId) {
        switch (providerId) {
            case PROVIDERS.YAHOO.id:
                return PROVIDERS.YAHOO;
            case PROVIDERS.OUTLOOK.id:
                return PROVIDERS.OUTLOOK;
            case PROVIDERS.APPLE.id:
                return PROVIDERS.APPLE;
            case PROVIDERS.HOTMAIL.id:
                return PROVIDERS.HOTMAIL;
            case PROVIDERS.YANDEX.id:
                return PROVIDERS.YANDEX;
            case PROVIDERS.FASTMAIL.id:
                return PROVIDERS.FASTMAIL;
            case PROVIDERS.GMX.id:
                return PROVIDERS.GMX;
            case PROVIDERS.EASYCRYPT.id:
                return PROVIDERS.EASYCRYPT;
            default:
                return null;
        }
    }

    render() {
        let content;
        let okCheckImage;
        if (this.props.currentStep == this.props.step) {
            if (this.props.userCreated) {
                okCheckImage = (<img className="right-click" src="images/right-tick.png"/>);

                content = (
                    <div className="step3">
                        <div className="webmail-sec">
                            <p>Success! You are good to go.</p>
                        </div>
                        <div className="enterbtn">
                            <a href="#" onClick={(e) => this.handleLoginClick(e)}>Login to EasyCrypt</a>
                        </div>
                    </div>
                );
            }
            else {
                if (this.props.authType) {
                    if (this.props.authType == PROVIDER_CONFIG.OAUTH) {
                        //oauth
                        content = (<OauthConfiguration
                                handleOauthClick={() => this.handleOauthClick()}
                                providerId={this.props.providerId}
                                providerName={this.props.providerName}
                                pushLog={(message, type) => this.props.pushLog(message, type)}
                                />
                        );
                    }
                    else if (this.props.authType == PROVIDER_CONFIG.PLAIN) {
                        //plain
                        let currentProvider = null;
                        if(this.props.providerId >= 0) {
                            currentProvider = this.getProvider(this.props.providerId)
                        }

                        content = (<PlainConfiguration
                                handlePlainConnectionDetailsClick={(password) => this.handlePlainConnectionDetailsClick(password)}
                                email={this.props.email}
                                providerId={this.props.providerId}
                                providerName={this.props.providerName}
                                connectionDetails={this.props.connectionDetails}
                                settingConnectionSettings={this.props.settingConnectionSettings}
                                provider = {currentProvider}
                                />
                        );
                        // }
                    }
                    else if (this.props.authType == PROVIDER_CONFIG.MANUAL) {
                        //manual
                        content = (<ManualConfiguration
                                showError={(message) => this.props.showError(message)}
                                clearError={() => this.props.clearError()}
                                handleManualConnectionDetailsClick={(settings) => this.handleManualConnectionDetailsClick(settings)}
                                email={this.props.email}
                                providerId={this.props.providerId}
                                connectionDetails={this.props.connectionDetails}
                                settingConnectionSettings={this.props.settingConnectionSettings}
                                previousFailed={this.props.previousFailed}
                                />
                        );
                    }
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
        }
        return (
            <div className="step-row2">
                {okCheckImage}
                <StepHeader step={this.props.step} text={this.props.text}/>
                {content}
            </div>
        );
    }
}
