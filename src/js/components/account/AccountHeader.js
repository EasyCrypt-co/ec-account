/**
 * EasyCrypt.co Account Management
 * Copyright 2017, EasyCrypt.co
 * See README for details.
 *
 * @version 0.1.37
 */

import React from "react";
import BackendEndpoints from "../../utils/backendEndpoints";
import Utils from "../../utils/utils";
import {APP_CONFIG, URLS} from "../../utils/constants";

export default class AccountHeader extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            email: ''
        };

        if (this.props.email) {
            this.setState({
                email: this.props.email
            });
        }
        else {
            BackendEndpoints.getUserDetails().then((data) => {
                if (data) {
                    this.setState({
                        email: data.email
                    });
                }
                else {
                    this.setState({
                        email: '',
                    });
                }
            });
        }
    }

    showDropDownMenu(e) {
        e.stopPropagation();
        if ($('.welcome-icon').hasClass('logout-sec')) {
            $('.welcome-icon').removeClass('logout-sec');
        } else {
            $('.welcome-icon').addClass('logout-sec');
        }
    }

    logout(e) {
      e.preventDefault();
      BackendEndpoints.logout().then((data) => {
          window.location.replace(APP_CONFIG.webMailURL + URLS.LOGIN);
      });
    }

    render() {
        return (
            <header>
                <div className="header-container">
                    <div className="header-left">
                        <div className="logo-img">
                            <a href="/"><img src="/images/logo-img.png"/></a>
                        </div>
                        <div className="header-details">
                            <span className="help">{this.state.email}</span>
                        </div>
                    </div>
                    <div className="header-right">
                        <div className="icon-list">
                            <ul>
                                <li className="help-icon">
                                    <a href="#" className="help" onClick={() => close()}>Close</a>
                                </li>
                                <li className="help-icon">
                                    <a className="help" href="http://easycrypt.co/help"
                                        target="_blank">
                                        <i className="fa fa-question" aria-hidden="true"></i>
                                        Help
                                    </a>

                                </li>
                                <li className="help-icon" onClick={(event) => this.logout(event)}>
                                    <a className="help" href="#"
                                        target="_blank">
                                        <i className="fa fa-sign-out" aria-hidden="true"></i>
                                        Logout
                                    </a>
                                </li>
                                { /*<li className="welcome-icon" onClick={(e) => this.showDropDownMenu(e)}>
                                    <span className="welcome-user">
                                        <a href="#">
                                           <i className="fa fa-cog" aria-hidden="true"></i>
                                        </a>
											<div className="user-dropdown">
												<ul>
                                                    <li><a href="http://easycrypt.co/help"
                                                           target="_blank">Help</a></li>
												</ul>
											</div>
										</span>
                                </li> */}
                            </ul>
                        </div>
                    </div>
                </div>
            </header>
        )
    }
}
