/**
 * EasyCrypt.co Account Management
 * Copyright 2017, EasyCrypt.co
 * See README for details.
 *
 * @version 0.1.37
 */

import React from "react";
import Utils from "../../../utils/utils";

export default class PlainConfiguration extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            providerImage: this.getProviderImage(this.props.providerId)
        }
    }

    getProviderImage(providerId) {
        return Utils.getProviderImage(providerId);
    }

    handlePlainConfigSubmit(event) {
        event.preventDefault();

        let password = this.password.value;

        if (password) {
            this.props.handlePlainConnectionDetailsClick(password);
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


    render() {
      let providerName, providerIcon, providerIconSize;
      if(!this.state.providerImage) {
        providerName = (
          <div className = "input-field">
            <label className="provider-name">{this.props.providerName}</label>
          </div>
        )
      }
      if(!this.props.provider) {
        providerIcon = null;
        providerIconSize = '';
      } else {
        providerIcon = this.props.provider.icon;
        providerIconSize = this.props.provider.iconSize;
      }
        return (
            <form onSubmit={(e) => this.handlePlainConfigSubmit(e)}>
                <div className={"step3 " + (providerName ? "margin-top-20" : "margin-top-40")}>
                    {providerName}
                    <div className="input-field v-align">
                        <label className="longer">Your mail password</label>
                        <div className="form-input v-align-form">
                            <input type="password" required
                                   ref={(password) => this.password = password}/>
                            <a href="#"
                               onClick={(event) => this.showHidePassword(event)}>
                                <img className="password-eye" src="images/eye.png"
                                     style={{display: this.props.providerImage ? "inline-block" : "none"}}/>
                            </a>
                            <img className="provider-image" src={providerIcon}
                            style={{maxWidth: providerIconSize}}
                            />
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
