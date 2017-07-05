/**
 * EasyCrypt.co Account Management
 * Copyright 2017, EasyCrypt.co
 * See README for details.
 *
 * @version 0.1.37
 */

import React from "react";
import swal from "sweetalert2";
import Utils from "../utils/utils";
import Error from "./signup/Error";
import BackendEndpoints from "../utils/backendEndpoints";
import SetPassword from "./signup/SetPassword";
import EmailSetup from "./signup/emailSetup/EmailSetup";
import {PROVIDER_CONFIG, PROVIDERS, APP_CONFIG, URLS, LOG, POPUP} from "../utils/constants";

export default class SignUpPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            errorMessage: null,
            showLoader: this.props.location.query.id ? true : false,
            linkExpired: false,
            link: this.props.location.query.id,
            ec_jwt: null,
            currentStep: 0,
            email: '',
            password: '',
            settingPassword: false,
            generatingKeys: false,
            keysGenerated: false,
            publicKey: '',
            privateKey: '',
            userCreated: false,
            authType: '',
            providerId: -1,
            providerName: '',
            connectionDetails: null,
            oauthLink: '',
            settingConnectionSettings: false,
            previousFailed: false,
            logs: [],
            consoleLogs: LOG.CONSOLE
        };

        if (this.state.link) {
            BackendEndpoints.getToken(this.state.link).then((data) => {
                if (data) {
                    this.setState({
                        ec_jwt: data.ec_jwt,
                    });
                    BackendEndpoints.getUserDetails(this.state.ec_jwt).then((response) => {
                      let data = response.data.data;
                        if (data) {
                            this.setState({
                                email: data.email,
                            });
                            this.pushLog(LOG.GET_USER_DETAILS +
                              ' [ ' + APP_CONFIG.authURL + URLS.USER_INFO + ', ' + response.status + ', ' + JSON.stringify(response.data) + ' ]');

                            if (data.sub_reg_status == "2" || data.sub_reg_status == "3") {
                                this.setState({
                                    currentStep: 1,
                                    showLoader: false
                                });
                            }
                            else if (data.sub_reg_status == "4") {
                                this.setState({
                                    keysGenerated: true,
                                    currentStep: 2,
                                    showLoader: true
                                });

                                this.getProviderDetails();

                                if (this.props.location.query.err == "1") {
                                    let warningMessage = '';
                                    if (this.props.location.query.d) {
                                        warningMessage = "You selected " + this.props.location.query.d + " instead of " + this.state.email + ". Please go back and select " + this.state.email + ".";
                                    }
                                    else {
                                        warningMessage = "You selected another email address instead of " + this.state.email + ". Please go back and select " + this.state.email + ".";
                                    }
                                    let parentPros = this;
                                    swal({
                                        text: warningMessage,
                                        showCancelButton: false,
                                        confirmButtonText: 'Go back and change selection',
                                        width: 500,
                                        animation: false,
                                        allowOutsideClick: false,
                                        allowEscapeKey: false,
                                        customClass: "swal-custom"
                                    }).then(function () {
                                        window.location.replace(parentPros.state.oauthLink);
                                    })
                                }
                            }
                            else if (data.sub_reg_status == "6") {
                                this.setState({
                                    keysGenerated: true,
                                    currentStep: 2,
                                    showLoader: true
                                });
                                this.createUser();
                            }
                            else {
                                this.setState({
                                    linkExpired: true
                                });
                            }
                        }
                        else {
                          this.pushLog(LOG.EMAIL_NOT_FOUND +
                            ' [ ' + APP_CONFIG.authURL + URLS.USER_INFO + ', ' + response.status + ', ' + JSON.stringify(response.data) + ' ]');
                            this.showError("Email address not found");
                            this.setState({
                                showLoader: false
                            });
                        }
                    });
                }
                else {
                  this.pushLog(LOG.LINK_EXPIRED +
                    ' [ ' + APP_CONFIG.authURL + URLS.LINK  + ' ]');
                    this.setState({
                        linkExpired: true,
                        showLoader: false
                    });
                }
            });
        }
    }

    clearError() {
        this.setState({
            errorMessage: null
        });
    }

    showError(message) {
        this.setState({
            errorMessage: message
        });
    }


    setUserPassword(password) {
        this.clearError();
        if (this.state.ec_jwt) {
            this.setState({
                settingPassword: true
            });
            let hashedPassword = Utils.hashString(password + this.state.email.toLowerCase());
            BackendEndpoints.setPassword(hashedPassword, this.state.ec_jwt).then((data) => {
                if (data) {
                    this.setState({
                        password: password,
                        settingPassword: false
                    });
                    this.pushLog(`${LOG.PASSWORD_SET} [${APP_CONFIG.authURL}${URLS.USER_PASSWORD}, ${data.status}, ${JSON.stringify(data.data)}]`);
                    this.generateAndImportKeys();
                }
                else {
                    this.pushLog(`${LOG.ERROR_SETTING_PASSWORD} [${APP_CONFIG.authURL}${URLS.USER_PASSWORD}]`);
                    this.showError(LOG.ERROR_SETTING_PASSWORD);
                    this.setState({
                        settingPassword: false
                    });
                }
            });
        }
    }

    generateAndImportKeys() {
        this.clearError();

        let helperSwal = () => {
            let log = this.state.logs;
            log.push(this.state.consoleLogs);
            BackendEndpoints.sendLog(log.join('\n'), this.state.ec_jwt);
            swal({
              text: POPUP.AFTER_LOG_SENT + this.state.email,
              showCancelButton: false,
              confirmButtonText: 'Ok',
              width: 650,
              animation: false,
              allowOutsideClick: false,
              allowEscapeKey: false,
              customClass: "swal-custom button-swal-right"
            }).then(() => {
              window.location.reload();
            });
        };

        if (this.state.ec_jwt) {
            this.setState({
                generatingKeys: true
            });
            Utils.generateKeys(this.state.email, this.state.password).then((data) => {
                if (data) {
                    this.setState({
                        privateKey: data.private_key,
                        publicKey: data.public_key
                    });
                    Utils.importKeys(this.state.email, this.state.publicKey, this.state.privateKey, this.state.ec_jwt).then((data) => {
                        if (data) {
                            this.setState({
                                keysGenerated: true,
                                generatingKeys: false
                            });
                            this.pushLog(LOG.KEYS_GENERATED);
                            this.getProviderDetails();
                        }
                        else {
                            this.pushLog(LOG.ERROR_GENERATING_KEYS);
                            this.setState({
                              generatingKeys: false
                            });
                            swal({
                                html: POPUP.ERROR_KEY_GENERATION,
                                showCancelButton: true,
                                cancelButtonText: 'Cancel',
                                confirmButtonText: 'Report and send logs',
                                width: 650,
                                animation: false,
                                allowOutsideClick: false,
                                allowEscapeKey: false,
                                customClass: "swal-custom"
                            }).then(helperSwal,
                                () => {
                                  window.location.reload();
                                }
                            );
                        }
                    });
                }
                else {
                    this.pushLog(LOG.ERROR_GENERATING_KEYS);
                    this.setState({
                      generatingKeys: false
                    });
                    swal({
                        html: POPUP.ERROR_KEY_GENERATION,
                        showCancelButton: true,
                        cancelButtonText: 'Cancel',
                        confirmButtonText: 'Report and send logs',
                        width: 650,
                        animation: false,
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        customClass: "swal-custom"
                    }).then(helperSwal,
                        () => {
                          window.location.reload();
                        }
                      );
                }
            });
        }
    }

    getProviderDetails() {
        this.clearError();
        if (this.state.ec_jwt) {
            BackendEndpoints.getProviderDetails(this.state.email, this.state.ec_jwt).then((response) => {
              let data = response.data.data;
                if (data) {
                    this.setState({
                        showLoader: false,
                        currentStep: 2,
                        providerId: data.provider_id
                    });
                    if (data.auth_type == PROVIDER_CONFIG.OAUTH) {
                        //oauth
                        this.setState({
                            authType: PROVIDER_CONFIG.OAUTH,
                            providerName: data.provider_name,
                            oauthLink: data.auth_link
                        });
                        this.pushLog(LOG.EMAIL_PROVIDER_OAUTH +
                          ' [ ' + APP_CONFIG.authURL + URLS.PROVIDER_DETAILS + ', ' + response.status + ', ' + JSON.stringify(response.data) + ' ]');

                    }
                    else {
                        if (data.auth_type == PROVIDER_CONFIG.PLAIN && data.provider_id > 0) {
                            //plain
                            this.setState({
                                authType: PROVIDER_CONFIG.PLAIN,
                                providerName: data.provider_name,
                                connectionDetails: data.connection_details
                            });
                            this.pushLog(LOG.EMAIL_PROVIDER_PLAIN +
                              ' [ ' + APP_CONFIG.authURL + URLS.PROVIDER_DETAILS + ', ' + response.status + ', ' +  JSON.stringify(response.data) + ' ]');
                        }
                        else {
                            //manual
                            this.setState({
                                authType: PROVIDER_CONFIG.MANUAL,
                                connectionDetails: data.connection_details
                            });
                            this.pushLog(LOG.EMAIL_PROVIDER_MANUAL +
                              ' [ ' + APP_CONFIG.authURL + URLS.PROVIDER_DETAILS + ', ' + response.status + ', ' + JSON.stringify(response.data) + ' ]');
                        }
                    }
                }
                else {
                    this.setState({
                        showLoader: false
                    });
                    this.pushLog(LOG.EMAIL_PROVIDER_NOT_SUPPORTED +
                    ' [ ' + APP_CONFIG.authURL + URLS.PROVIDER_DETAILS + ' ] ');
                    this.showError(LOG.EMAIL_PROVIDER_NOT_SUPPORTED);
                }
            });
        } else {
          this.pushLog(LOG.NO_JWT);
        }
    }

    getBubbleNotificationContent(providerId) {
        switch (providerId) {
            case PROVIDERS.YAHOO.id:
                return PROVIDERS.YAHOO.bubble;
            case PROVIDERS.OUTLOOK.id:
                return PROVIDERS.OUTLOOK.bubble;
            case PROVIDERS.APPLE.id:
                return PROVIDERS.APPLE.bubble;
            case PROVIDERS.HOTMAIL.id:
                return PROVIDERS.HOTMAIL.bubble;
            case PROVIDERS.YANDEX.id:
                return PROVIDERS.YANDEX.bubble;
            case PROVIDERS.YANDEX_COM.id:
                return PROVIDERS.YANDEX_COM.bubble;
            case PROVIDERS.FASTMAIL.id:
                return PROVIDERS.FASTMAIL.bubble;
            case PROVIDERS.GMX.id:
                return PROVIDERS.GMX.bubble;
            default:
                return "We could not connect to your email service. Please check your password and connection details, correct them if needed, and click Next again.";
        }
    }

    setConnectionSettings(settings) {

            let sendLog = () => {
              let log = [POPUP.AUTMATIC_CLIENT_LOG];
              log.push(this.state.logs);
              log.push(this.state.consoleLogs);
              BackendEndpoints.sendLog(log.join('\n'), this.state.ec_jwt);
            };

            this.clearError();

            if (this.state.ec_jwt) {
                this.setState({
                    settingConnectionSettings: true
                });
                let self = this;
                let safeSettings = Utils.getSafeSettings(settings);
                BackendEndpoints.setConnectionSettings(settings, this.state.ec_jwt).then((data) => {
                    if (data.gotError) {
                      console.log('Error on post at:', URLS.CONNECTION_SETTINGS, data.error);
                      swal({
                          html: '<p>' + data.error + '</p>',
                          showCancelButton: true,
                          showConfirmButton: false,
                          cancelButtonText: 'OK',
                          width: 650,
                          animation: false,
                          allowOutsideClick: false,
                          allowEscapeKey: false,
                          customClass: "swal-custom"
                      }).then( () => {}, () => {
                        window.location.reload();
                      });
                      return;
                    }

                    if (data.data.status === "success") {
                        this.setState({
                            settingConnectionSettings: false
                        });
                        this.pushLog(LOG.CONNECTION_DETAILS_SET +
                          ' [ ' + APP_CONFIG.authURL + URLS.CONNECTION_SETTINGS + ', ' + data.status + ', ' + JSON.stringify(data.data) +
                          ', Connection Details:' +  JSON.stringify(safeSettings) + ' ]');
                        this.createUser();
                    }
                    else if(data.data.status === "failure") {
                      this.pushLog(LOG.ERROR_SETTING_CONNECTION_DETAILS +
                        ' [ ' + APP_CONFIG.authURL + URLS.CONNECTION_SETTINGS  + ', Connection Details:' +  JSON.stringify(safeSettings)+ ' ]');


                        if(this.state.previousFailed) {
                          this.pushLog(LOG.ERROR_SETTING_CONNECTION_DETAILS + ' Advanced Screen' +
                            ' [ ' + APP_CONFIG.authURL + URLS.CONNECTION_SETTINGS  + ', Connection Details:' +  JSON.stringify(safeSettings)+ ' ]');

                          if(data.data.message) {
                              switch(data.data.message) {
                                case 'authentication_error' :
                                  sendLog();
                                    swal({
                                        html: POPUP.TITLE + POPUP.AUTH_ERROR,
                                        showCancelButton: true,
                                        cancelButtonText: 'Try Again',
                                        confirmButtonText: 'Restart sign-up',
                                        width: 650,
                                        animation: false,
                                        allowOutsideClick: false,
                                        allowEscapeKey: false,
                                        customClass: "swal-custom button-swal-right swal2-cancel-left"
                                    }).then(() => {
                                      window.location.reload();
                                    }, () => {
                                    });
                                    break;

                                case 'authentication_reject':
                                  sendLog();
                                  swal({
                                      html: POPUP.AUTH_REJECT_TITLE + POPUP.AUTH_REJECT,
                                      showCancelButton: true,
                                      cancelButtonText: 'OK',
                                      confirmButtonText: 'Restart sign-up',
                                      width: 650,
                                      animation: false,
                                      allowOutsideClick: false,
                                      allowEscapeKey: false,
                                      customClass: "swal-custom button-swal-right swal2-cancel-left ol-indented"
                                  }).then(() => {
                                    window.location.reload();
                                  }, () => {
                                  });
                                  break;

                                case 'untrusted_cert':
                                  swal({
                                      html: POPUP.TITLE + POPUP.UNTRUSTED_CERT,
                                      showCancelButton: false,
                                      confirmButtonText: 'Restart sign-up',
                                      width: 650,
                                      animation: false,
                                      allowOutsideClick: false,
                                      allowEscapeKey: false,
                                      customClass: "swal-custom button-swal-right swal2-cancel-left"
                                  }).then(() => {
                                    swal({
                                        html: POPUP.STEP2_ABORT,
                                        showCancelButton: true,
                                        showConfirmButton: false,
                                        cancelButtonText: 'OK',
                                        width: 650,
                                        animation: false,
                                        allowOutsideClick: false,
                                        allowEscapeKey: false,
                                        customClass: "swal-custom"
                                    });
                                  });
                                  break;

                                  case 'generic_error':
                                    swal({
                                        html: POPUP.TITLE + POPUP.GENERIC_ERROR,
                                        showCancelButton: true,
                                        cancelButtonText: 'Cancel',
                                        confirmButtonText: 'Report and send logs',
                                        width: 650,
                                        animation: false,
                                        allowOutsideClick: false,
                                        allowEscapeKey: false,
                                        customClass: "swal-custom"
                                    }).then(() => {
                                        let log = self.state.logs;
                                        log.push(self.state.consoleLogs);
                                        BackendEndpoints.sendLog(log.join('\n'), self.state.ec_jwt);
                                        swal({
                                            html: POPUP.GENERIC_ERROR_REPORTED + '<p>' + self.state.email + '</p>',
                                            showCancelButton: true,
                                            showConfirmButton: false,
                                            cancelButtonText: 'OK',
                                            width: 650,
                                            animation: false,
                                            allowOutsideClick: false,
                                            allowEscapeKey: false,
                                            customClass: "swal-custom"
                                        }).then(() => {},() => {
                                          window.location.reload();
                                        });
                                    },
                                      //REJECT
                                      () => {
                                        window.location.reload();
                                      }
                                  );
                                    break;
                              }

                          } else {
                            console.log('Message on the response expected');
                          }
                        } else {
                            let bubbleContent = this.getBubbleNotificationContent(this.state.providerId);
                            if (bubbleContent) {
                                swal({
                                    html: bubbleContent,
                                    showCancelButton: true,
                                    showConfirmButton: false,
                                    cancelButtonText: 'OK',
                                    width: 650,
                                    animation: false,
                                    allowOutsideClick: false,
                                    allowEscapeKey: false,
                                    customClass: "swal-custom" + (this.state.providerId === PROVIDERS.OUTLOOK.id ? " small-font" : "")
                                });
                            }
                        }

                        this.setState({
                            settingConnectionSettings: false,
                            authType: PROVIDER_CONFIG.MANUAL,
                            previousFailed: true
                        });
                    } else {
                      this.pushLog(LOG.ERROR_SETTING_CONNECTION_DETAILS + ' ' + LOG.INCORRECT_STATUS_MESSAGE +
                        ' [ ' + APP_CONFIG.authURL + URLS.CONNECTION_SETTINGS  + ', Connection Details:' +  JSON.stringify(safeSettings)+ ' ]');

                    }
                });
            }
        }

    createUser() {
        this.clearError();
        if (this.state.ec_jwt) {
            BackendEndpoints.createUser(this.state.ec_jwt).then((data) => {
                if (data) {
                    this.setState({
                        userCreated: true,
                        showLoader: false
                    });
                    this.pushLog(LOG.USER_CREATED +
                      ' [ ' + APP_CONFIG.authURL + URLS.CREATE_USER + ', ' + data.status + ', ' + JSON.stringify(data.data) + ' ]');
                }
                else {
                    this.setState({
                        showLoader: false
                    });
                    this.pushLog(LOG.ERROR_CREATING_USER +
                      ' [ ' + APP_CONFIG.authURL + URLS.CREATE_USER + ' ]');
                    this.showError(LOG.ERROR_CREATING_USER);
                }
            });
        }
    }

    handleLinkExpiredClick() {
        window.location.replace(APP_CONFIG.webMailURL + URLS.LOGIN);
    }

    pushLog(message, type) {
      let logs = this.state.logs;
      let prefix = '';
      let stepDate = Utils.getCurrentDate();
      stepDate = stepDate.split(',')[1];

      switch(type) {
        case undefined:
          prefix = LOG.STEP + this.state.currentStep;
          break;
        default:
          prefix = type;
      }

      logs.push(prefix + ' -' + stepDate + ' : ' + message);
      this.setState({
        logs: logs
      });
      // console.log(this.state.logs);
    }

    pushConsoleLog(message) {
      let consoleLogs = this.state.consoleLogs;
      consoleLogs = consoleLogs.concat(message + '\n');
      this.setState({
        consoleLogs: consoleLogs
      });
    }

    componentDidMount() {
      let self = this;
      (function() {
          var exLog = console.log;
          var exError = console.error;
          console.log = function(msg) {
              self.pushConsoleLog(msg);
              exLog.apply(console, arguments);
          }
          console.error = function(msg) {
              self.pushConsoleLog(msg);
              exError.apply(console, arguments);
          }
      })();

      this.pushLog(window.location.href, LOG.URL);
    }

    render() {
        let welcomeMessage;
        let content;
        let expiredLinkContent;
        let loadingContent;
        if (this.state.email && this.state.email != "") {
            welcomeMessage = (
                <div className="webmail-sec">
                    <p>Welcome, {this.state.email}!</p>
                </div>
            );
        }
        else {
            welcomeMessage = "";
        }

        if (this.state.showLoader) {
            content = null;
            expiredLinkContent = null;
            loadingContent = (
                <div className="account-container">
                    <div className="form-logo">
                      <img src="images/account-logo.png"/>
                    </div>
                    <div className="loader-container">
                        <img className="big-loader" src="images/loader.gif"/>
                    </div>
                </div>
            );
        }
        else {
            if (this.state.linkExpired) {
                content = null;
                expiredLinkContent = (
                    <div className="account-container">
                        <div className="form-logo">
                          <img src="images/account-logo.png"/>
                        </div>

                        <div className="step3">
                            <div className="webmail-sec">
                                <p>The invitation link has expired</p>
                            </div>
                            <div className="enterbtn">
                                <a href="#" onClick={(e) => this.handleLinkExpiredClick(e)}>OK</a>
                            </div>
                        </div>
                    </div>
                );
            }
            else {
                expiredLinkContent = null;
                content = (
                    <div className="account-container">
                        <div className="form-logo">
                            <img src="images/account-logo.png"/>
                        </div>
                        {welcomeMessage}
                        <Error errorMessage={this.state.errorMessage}
                               logs={this.state.logs}
                               consoleLogs={this.state.consoleLogs}
                               token={this.state.ec_jwt}
                        />
                        <div>
                            <SetPassword step={1} text={"Security setup"}
                                         showError={(message) => this.showError(message)}
                                         clearError={() => this.clearError()}
                                         setPassword={(password) => this.setUserPassword(password)}
                                         currentStep={this.state.currentStep}
                                         keysGenerated={this.state.keysGenerated}
                                         generatingKeys={this.state.generatingKeys}
                                         settingPassword={this.state.settingPassword}
                                         pushLog={(message, type) => this.pushLog(message, type)}
                                         />
                            <EmailSetup step={2} text={"Connect to your email service"}
                                        showError={(message) => this.showError(message)}
                                        clearError={() => this.clearError()}
                                        currentStep={this.state.currentStep}
                                        userCreated={this.state.userCreated}
                                        authType={this.state.authType}
                                        providerId={this.state.providerId}
                                        providerName={this.state.providerName}
                                        connectionDetails={this.state.connectionDetails}
                                        oauthLink={this.state.oauthLink}
                                        email={this.state.email}
                                        setConnectionSettings={(settings) => this.setConnectionSettings(settings)}
                                        settingConnectionSettings={this.state.settingConnectionSettings}
                                        previousFailed={this.state.previousFailed}
                                        pushLog={(message, type) => this.pushLog(message, type)}
                                        />
                        </div>
                    </div>
                );
            }
        }

        return (
            <div>
                {loadingContent}
                {expiredLinkContent}
                {content}
            </div>
        );
    }
}
