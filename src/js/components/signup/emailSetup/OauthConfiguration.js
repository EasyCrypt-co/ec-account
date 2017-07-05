/**
 * EasyCrypt.co Account Management
 * Copyright 2017, EasyCrypt.co
 * See README for details.
 *
 * @version 0.1.37
 */

import React from "react";
import {PROVIDERS, LOG} from "../../../utils/constants";

export default class OauthConfiguration extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            providerImage: this.getProviderImage(this.props.providerId)
        }

    }

    handleOauthClick(event) {
        event.preventDefault();

        this.props.pushLog(LOG.HANDLE_OAUTH_CLICK);
        this.props.handleOauthClick();
    }

    getProviderImage(providerId) {
        switch (providerId) {
            case PROVIDERS.GMAIL.id:
                return PROVIDERS.GMAIL.icon;
            case PROVIDERS.YAHOO.id:
                return PROVIDERS.YAHOO.icon;
            case PROVIDERS.OUTLOOK.id:
                return PROVIDERS.OUTLOOK.icon;
            default:
                //do nothing
                return null;
        }
    }

    render() {
        return (
            <div className="step2">
                <div className="webmail-sec">
                    <img src={this.state.providerImage}/>
                    <p>Connect with <span className="uppercase">{this.props.providerName} </span></p>
                </div>
                <div className="webmail-sec text-above-button">
                    <span>Your credentials will be encrypted by your public key </span>
                </div>
                <div className="webmail-sec">
                    <div className="enterbtn">
                        <a href="#" id="authorize" onClick={(e) => this.handleOauthClick(e)}>Next</a>
                    </div>
                </div>
            </div>
        );
    }
}
