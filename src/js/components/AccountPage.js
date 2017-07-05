/**
 * EasyCrypt.co Account Management
 * Copyright 2017, EasyCrypt.co
 * See README for details.
 *
 * @version 0.1.37
 */

import React from "react";
import swal from "sweetalert2";
import {APP_CONFIG, ACCOUNT_URLS, URLS} from "../utils/constants";
import {browserHistory} from "react-router";
import AccountHeader from "./account/AccountHeader";
import AccountMenu from "./account/AccountMenu";
import BackendEndpoints from "../utils/backendEndpoints";

export default class AccountPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            email: null,
            menuEntry: 0,
            url: this.props.location.pathname,
            showLoader: true,
            oauthError: null,
            errorEmailIdentity: false
        };

        this.getUserDetails();

        let self = this;
        setInterval(function () {
            self.getUserDetails();
        }, 30000);
    }

    getUserDetails() {
        BackendEndpoints.getUserDetails().then((data) => {
            if (data) {
                this.setState({
                    showLoader: false,
                });
                if (data == "redirect") {
                    window.location.replace(APP_CONFIG.webMailURL + URLS.LOGIN);
                }
                else {
                    if (this.state.url === '/account/oauth') {
                      this.goToPage(ACCOUNT_URLS.ACCOUNT_EMAIL);
                      if(this.props.location.query.err) {
                        this.setState({oauthError: this.props.location.query.err});
                      } else {
                        this.setState({oauthError: -1});
                      }
                    }
                    let currentEmail = this.state.email;
                    if (currentEmail) {
                        if (currentEmail != data.data.data.email) {
                            swal({
                                text: "You were logged out. Page will refresh now",
                                showCancelButton: false,
                                showConfirmButton: true,
                                width: 300,
                                animation: false,
                                allowOutsideClick: false,
                                allowEscapeKey: false,
                                customClass: "swal-custom swal-custom-confirm"
                            }).then(function () {
                                window.location.reload(true);
                            });
                        }
                    }
                    else {
                        this.setState({
                            email: data.data.data.email,
                        });
                    }
                }
            } else {
              window.location.replace(APP_CONFIG.webMailURL + URLS.LOGIN);
            }
        });
    }

    componentDidMount() {
        this.selectMenuEntry(this.props.location.pathname);
    }

    goToPage(page) {
        if (page) {
            browserHistory.push(page);
            this.selectMenuEntry(page);
        }
    }

    selectMenuEntry(urlPath) {
        if (urlPath) {
            switch (urlPath) {
                case ACCOUNT_URLS.ACCOUNT_EMAIL:
                    this.setState({
                        menuEntry: 1
                    });
                    break;
                case ACCOUNT_URLS.ACCOUNT_PASSWORD:
                    this.setState({
                        menuEntry: 2
                    });
                    break;
                case ACCOUNT_URLS.ADVANCED:
                    this.setState({
                        menuEntry: 3
                    });
                    break;
                case ACCOUNT_URLS.ADVANCED_VIEW_KEYS:
                    this.setState({
                        menuEntry: 4
                    });
                    break;
                case ACCOUNT_URLS.ADVANCED_IMPORT_KEYS:
                    this.setState({
                        menuEntry: 5
                    });
                    break;
                case ACCOUNT_URLS.ACCOUNT_DELETE:
                    this.setState({
                        menuEntry: 6
                    });
                    break;
                default:
                    //do nothing
                    break;
            }
        }
    }
    
    clearErrors(ignore) {
        this.setState({
            oauthError: null,
            errorEmailIdentity: (ignore === undefined ? false : true)
        });
    }

    setErrorOnEmailIdentity() {
        this.setState({
            errorEmailIdentity: true
        });
    }

    render() {
        let content;
        let loadingContent;
        let childrenWithProps = React.Children.map(this.props.children,
            (child) => React.cloneElement(child, {
                goToPage: (page) => this.goToPage(page),
                email: this.state.email,
                oauthError: this.state.oauthError,
                clearErrors: (data) => this.clearErrors(data),
                setErrorOnEmailIdentity: () => this.setErrorOnEmailIdentity()
            })
        );

          if (this.state.showLoader) {
              content = null;
              loadingContent = (
                  <div className="account-container">
                      <div className="form-logo">
                          <a href="#"><img src="/images/account-logo.png"/></a>
                      </div>
                      <div className="loader-container">
                          <img className="big-loader" src="/images/loader.gif"/>
                      </div>
                  </div>
              );
          } else {
            content = (
              <div>
                  <AccountHeader email={this.state.email}/>
                  <div className="clear"></div>
                  <section className="wrap-dashboard">
                      <AccountMenu goToPage={(page) => this.goToPage(page)}
                                   menuEntry={this.state.menuEntry}
                                   url={this.state.url}
                                   errorEmailIdentity={this.state.errorEmailIdentity}
                                   />
                      {childrenWithProps}
                  </section>
                  <footer className="dash-foot">
                      <div className="copyright">
                          <p>Copyright 2016 EasyCrypt | All Rights Reserved</p>
                      </div>
                  </footer>
              </div>
            )
          }

        return (
          <div>
            {loadingContent}
            {content}
          </div>
        )
    }
}
