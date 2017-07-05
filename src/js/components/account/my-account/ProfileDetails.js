/**
 * EasyCrypt.co Account Management
 * Copyright 2017, EasyCrypt.co
 * See README for details.
 *
 * @version 0.1.37
 */

import React from "react";
import BackendEndpoints from "../../../utils/backendEndpoints";
import Notification from "../Notification";
import AdvancedConfiguration from "./AdvancedConfiguration";
import swal from "sweetalert2";
import {NOTIFICATION_TYPE, POPUP, APP_CONFIG} from "../../../utils/constants";
import Utils from "../../../utils/utils";

export default class ProfileDetails extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            notification: false,
            notificationType: '',
            notificationMessage: '',
            providerId: '',
            providerName: '',
            providerImage: null,
            authType: '',
            email: '',
            errorEmail: false,
            contentRecieved: false,
            advancedConfiguration: false,
            previousFailed: false,
            sendRequest: false
        };
        BackendEndpoints.getConnectionSettings().then((response) => {
          let responseData = response.data.data;
          let authType = responseData.auth_type.toUpperCase();
          if (authType == "OAUTH") {
            authType = "OAuth";
          } else if (authType == "PLAIN") {
            authType = "Password";
          } else if (authType == "MANUAL") {
            authType = "Manual";
          }

          this.setState({
              email: this.props.email,
              authType: authType,
              providerName: responseData.provider_name,
              providerImage: Utils.getProviderImage(responseData.provider_id),
              providerId: responseData.provider_id,
              providerOAuth: responseData.provider_oauth,
              oauthError: this.props.oauthError,
              authLink: responseData.auth_link,
              status: responseData.status,
              errorMessage: responseData.error_message,
              connectionDetails: responseData.connection_details

          });

          if(this.state.oauthError === -1) {
              this.props.clearErrors();
              this.setState({
                status: true
              });
              this.triggerPopups('oauth_success', this.state.providerName);
          } else if(this.state.status === false && this.state.errorMessage !== "provider_changed") {
              this.triggerPopups('connection_error');
              this.props.setErrorOnEmailIdentity();
          } else if(this.state.status === false && this.state.errorMessage === "provider_changed") {
                this.triggerPopups('provider_changed');
                this.props.setErrorOnEmailIdentity();
          } else {

          }

          if (this.state.oauthError == 1){
            this.setState({
              status: false
            });
            this.triggerPopups('oauth_error');
            this.props.clearErrors('ignore_email_icon');
          }

          this.setState({
            contentRecieved: true,
            loading: false
          });
        }).catch((error) => {

          this.triggerPopups(error);
        });
      }

      clearError() {
          this.setState({
              errorMessage: null
          });
      }

    showHidePasswords(event) {
      event.preventDefault();

      let passwordInput = this.password;
      let confirmPasswordInput = this.confirmPassword;

      this.setState({eyeActive: !this.state.eyeActive});

      if (passwordInput.getAttribute("type") == "password") {
          passwordInput.setAttribute("type", "text");
      }
      else {
          passwordInput.setAttribute("type", "password");
      }

      if (confirmPasswordInput.getAttribute("type") == "password") {
          confirmPasswordInput.setAttribute("type", "text");
      }
      else {
          confirmPasswordInput.setAttribute("type", "password");
      }

    }

    triggerPopups(error, popupData) {
        if(error) {
          switch(error) {
            case 'Error':
                swal({
                    html: 'Erorr',
                    showCancelButton: true,
                    showConfirmButton: false,
                    cancelButtonText: 'OK',
                    width: 650,
                    animation: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    customClass: "swal-custom"
                });
                break;
            case 'authentication_error' :
                swal({
                    html: POPUP.TITLE + POPUP.AUTH_ERROR,
                    showCancelButton: true,
                    showConfirmButton: false,
                    cancelButtonText: 'Try Again',
                    width: 650,
                    animation: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    customClass: "swal-custom cancel-center"
                }).then(() => {
                  window.location.reload();
                }, () => {
                });
                break;

            case 'authentication_reject':
              swal({
                  html: POPUP.AUTH_REJECT_TITLE + POPUP.AUTH_REJECT,
                  showCancelButton: true,
                  showConfirmButton: false,
                  cancelButtonText: 'OK',
                  width: 650,
                  animation: false,
                  allowOutsideClick: false,
                  allowEscapeKey: false,
                  customClass: "swal-custom cancel-center"
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

              case 'provider_changed':
                swal({
                    html: 'Provider Changed',
                    showCancelButton: true,
                    showConfirmButton: false,
                    cancelButtonText: 'OK',
                    width: 650,
                    animation: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    customClass: "swal-custom"
                });
                break;

              case 'oauth_success':
                swal({
                    html: 'Success! EasyCrypt is now connected to your ' + popupData + ' account.',
                    showCancelButton: true,
                    showConfirmButton: false,
                    cancelButtonText: 'OK',
                    width: 650,
                    animation: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    customClass: "swal-custom oauth-success"
                }).then(()=> {}, () => {
                  swal({
                      html: 'Success! EasyCrypt is now connected to your ' + popupData + ' account.',
                      showCancelButton: true,
                      showConfirmButton: false,
                      cancelButtonText: 'OK',
                      width: 650,
                      animation: false,
                      allowOutsideClick: false,
                      allowEscapeKey: false,
                      customClass: "swal-custom oauth-success loading"
                  });
                    window.location.replace(APP_CONFIG.webMailURL);
                  });
                break;

              case 'password_success':
                swal({
                    html: 'Success! EasyCrypt is now connected to your ' + popupData + ' account.',
                    showCancelButton: true,
                    showConfirmButton: false,
                    cancelButtonText: 'OK',
                    width: 650,
                    animation: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    customClass: "swal-custom oauth-success"
                }).then(()=> {}, () => {
                  swal({
                      html: 'Success! EasyCrypt is now connected to your ' + popupData + ' account.',
                      showCancelButton: true,
                      showConfirmButton: false,
                      cancelButtonText: 'OK',
                      width: 650,
                      animation: false,
                      allowOutsideClick: false,
                      allowEscapeKey: false,
                      customClass: "swal-custom oauth-success loading"
                  });
                    window.location.replace(APP_CONFIG.webMailURL);
                  });
                break;

              case 'oauth_error':
                swal({
                    html: 'Error connecting with the OAuth',
                    showCancelButton: true,
                    showConfirmButton: false,
                    cancelButtonText: 'OK',
                    width: 650,
                    animation: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    customClass: "swal-custom"
                });
                break;

              case 'connection_error':
                swal({
                    html: '<p>EasyCrypt could not connect to your service provider. </p> <p>Possibly EasyCrypt\'s permission to access your email account has been revoked, or your password has been changed.</p><p>Please follow the on-screen instructions to reconnect EasyCrypt to your email service provider.</p>',
                    showCancelButton: true,
                    showConfirmButton: false,
                    cancelButtonText: 'Next',
                    width: 650,
                    animation: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    customClass: "swal-custom"
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
                    // let log = self.state.logs;
                    // log.push(self.state.consoleLogs);
                    // BackendEndpoints.sendLog(log.join('\n'), self.state.ec_jwt);
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
              default:
                swal({
                    html: '<p>Error</p><p>' + error + '</p>',
                    showCancelButton: true,
                    showConfirmButton: false,
                    cancelButtonText: 'OK',
                    width: 650,
                    animation: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    customClass: "swal-custom"
                });
                break;
          }
        }
    }

    handleSavePassword(event) {
      event.preventDefault();

      let password = this.password.value;
      let confirmPassword = this.confirmPassword.value;

      let passwordsOk = Utils.verifyEmailPassword(password, confirmPassword);
      if (passwordsOk.ok) {
        let self = this;
        this.setState({
          sendRequest: true
        })
        this.handlePlainConnectionDetailsClick(password);
      } else {
        this.setState({
            notification: true,
            notificationType: NOTIFICATION_TYPE.ERROR,
            notificationMessage: passwordsOk.error
        });
        // this.enableButton();
        this.setState({
          sendRequest: false
        });
        return;
      }
    }

    handlePlainConnectionDetailsClick(password) {
        let settings = {};

        settings.providerId = this.state.providerId;
        settings.settings = this.state.connectionDetails;
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
        this.setConnectionSettings(settings);
    }

    setConnectionSettings(settings) {
      BackendEndpoints.putConnectionSettings(settings).then((data) => {
        if(data.data.status === "success") {
          this.clearInputs();
          this.props.clearErrors();
          this.setState({
            status: true,
            previousFailed: false, // reset advanced screen
            providerPlainFailed: false //reset advanced screen
          });
          this.triggerPopups('password_success', this.state.providerName);
        } else if(data.data.status === "failure" || data.data.status === "error") {
            if(this.state.providerPlainFailed) {
              this.setState({
                previousFailed: true
              });
            }
            if(this.state.errorMessage === 'provider_changed') {
            this.setState({
              providerPlainFailed: true
            });
          }
          this.triggerPopups(data.data.message);
        }
        this.setState({
          sendRequest: false
        });
      });
    }

    clearInputs() {
        $("#password").val("");
        $("#confirmPassword").val("");
    }

    connectOAuth(event) {
      event.preventDefault();
      if(this.state.providerOAuth) {
          window.location.replace(this.state.authLink);
      }
    }

    handleProviderChangedPassword(event) {
      event.preventDefault();
      let password = this.providerPassword.value;
      this.handlePlainConnectionDetailsClick(password);
    }

    handleAdvancedConfiguration(settings) {
       this.setConnectionSettings(settings);
    }

    render() {
      let largeImageProviders = ['aol', 'easycrypt', 'mailru', 'outlook', 'yahoo'];
      let newClass = (largeImageProviders.includes(this.state.providerName.toLowerCase())) ? 'large' : '';
      let eyeIcon, setPasswordContent, errorOnEmailContent, mainContent, providerChangedContent, content, authStatus,
          buttonText;

      if(this.state.status === true) {
        authStatus = (
          <span className="auth-success">(Connected)</span>
        )
      } else {
        authStatus = (
          <span className="auth-failure">(Authentication failed)</span>
        )
      }

      if (this.state.eyeActive) {
          eyeIcon = <img className="password-eye" src="/images/eye_active.png"/>;
      } else {
          eyeIcon = <img className="password-eye" src="/images/eye.png"/>;
      }

      if(this.state.authType === "Password" && this.state.status === false) {
          buttonText = 'Connect to email account';
      } else {
          buttonText = 'Save';
      }
      if(this.state.authType === "Password") {
        setPasswordContent = (
          <form onSubmit={(e) => this.handleSavePassword(e)}>
              <div className="form-flds">
                  <label className="left-align gray">New email password</label>
                  <div className="textfield">
                      <input type="password" id="password" required className="input-custom"
                             ref={(password) => this.password = password}
                             placeholder=""/>
                      <a href="#" onClick={(event) => this.showHidePasswords(event)}>
                          {eyeIcon}
                      </a>
                  </div>
              </div>
              <div className="form-flds">
                  <label className="left-align gray">Confirm password</label>
                  <div className="textfield">
                      <input type="password" className="input-custom" id="confirmPassword" required
                             ref={(confirmPassword) => this.confirmPassword = confirmPassword}
                             placeholder=""/>
                      <a href="#" onClick={(event) => this.showHidePasswords(event)}>
                          {eyeIcon}
                      </a>
                  </div>
              </div>
              <br/>
              <div className="form-flds">
                  <div className="submit-btn">
                      <input type="submit" className="small clean" value={buttonText}
                      disabled={this.state.sendRequest}
                      />
                      <img className="loader-request " src="/images/loader.gif"
                      style={{display: (this.state.sendRequest ? "inline-block": "none")}}/>
                      <span style={{display: (this.state.providerOAuth ? "inline-block": "none")}}>
                      <input className="connect small" type="submit" value={"Connect with " + this.state.providerName} />
                      <img className="loader-request " src="/images/loader.gif"
                      style={{display: (this.state.sendRequest ? "inline-block": "none")}}/>
                      </span>
                  </div>
              </div>
          </form>
        )
      } else if (this.state.authType === "OAuth" && this.state.status === false) {
        setPasswordContent = (
          <div className="form-flds">
              <div className="submit-btn">
                  <input className="connect-oauth small" type="submit" value={"Connect with " + this.state.providerName}
                  onClick={(event) => this.connectOAuth(event)}
                  />
                  <img className="loader-request " src="/images/loader.gif"
                  style={{display: (this.state.sendRequest ? "inline-block": "none")}}/>
              </div>

          </div>
        );
      }
      //if error occurs when setting password for plain password fails
      errorOnEmailContent = '';

      // if provider changed
      if ((this.state.status === false && this.state.errorMessage === "provider_changed") ||
          (this.state.status === false && this.state.providerPlainFailed)) {
          if(this.state.errorMessage === "provider_changed" && this.state.providerOAuth) {
         providerChangedContent = (
           <div>
           <div className="form-flds">
              <div className="left-details">
                <p className="left-align connect-text">Connect with {this.state.providerName}</p>
              </div>
              <div className="right-details">
                <img className={"oauth-provider-image " + newClass} src={this.state.providerImage}/>
              </div>
           </div>
           <div className="form-flds">
               <p className="left-align text-details">Your credentials will be encrypted by your public key</p>
           </div>
           <div className="submit-btn">
               <input className="small" type="submit" value="Next"
               onClick={(event) => this.connectOAuth(event)}
               />
               <img className="loader-request " src="/images/loader.gif"
               style={{display: (this.state.sendRequest ? "inline-block": "none")}}/>
           </div>
           </div>
         )
      // provider changed advanced screen
       } else if (this.state.providerPlainFailed) {
            providerChangedContent = (<AdvancedConfiguration
                showError={(message) => this.props.showError(message)}
                clearError={() => this.clearError()}
                handleManualConnectionDetailsClick={(settings) => this.handleAdvancedConfiguration(settings)}
                email={this.props.email}
                providerId={this.state.providerId}
                connectionDetails={this.state.connectionDetails}
                settingConnectionSettings={this.props.settingConnectionSettings}
                previousFailed={this.state.previousFailed}
                />
            )
          // plain provider_changed simple screen
       } else if(this.state.errorMessage === "provider_changed"){
            providerChangedContent = (
              <form onSubmit={(e) => this.handleProviderChangedPassword(e)}>
              <div className="form-flds">
                <div className="prv-chngd-1st-el">
                  <p className="left-align">Your mail password</p>
                </div>
                <div className="prv-chngd-2nd-el">
                  <input type="password" className="password-field" id="providerPassword" required  placeholder=""
                  ref={(providerPassword) => this.providerPassword = providerPassword}/>
                </div>
                <div className="prv-chngd-3rd-el">
                  <img className={"provider-changed-provider-image " + newClass} src={this.state.providerImage}/>
                </div>
              </div>
              <div className="form-flds margin-top">
                <div className="left-details">
                    <p>Your password will be encrypted by your public key</p>
                </div>
                <div className="right-details margin-left">
                    <div className="submit-btn clear">
                    <input type="submit" className="small" value="Next"/>
                    <img className="loader-request " src="/images/loader.gif"
                    style={{display: (this.state.sendRequest ? "inline-block": "none")}}/>
                    </div>
                </div>
              </div>
              </form>
            )
          }
        mainContent = (
          <div className="welcome-sec">
          <h1>Email identity</h1>
          <div className="user-form">
          {providerChangedContent}
          </div>
          </div>
        );
      } else if(this.state.contentRecieved) {
         mainContent = (
           <div className="welcome-sec">
               <h1>Email identity</h1>
               <div className="user-form">
                   <div className="form-flds">
                       <label className="left-align">Email address:</label>
                       <div className="textfield">
                           <p>{this.state.email}</p>
                       </div>
                   </div>
                   <div className="form-flds">
                       <label className="left-align">Email service provider:</label>
                       <div className="textfield">
                           <p>
                             {this.state.providerName}
                             <img className={"account-provider-image " + newClass} src={this.state.providerImage}/>
                           </p>
                       </div>
                   </div>
                   <div className="form-flds">
                       <label className="left-align">Authentication method: </label>
                       <div className="textfield">
                           <p>{this.state.authType} {authStatus}</p>
                       </div>
                   </div>
                   {setPasswordContent}
                   {errorOnEmailContent}
               </div>
           </div>
         )
      }

      if (this.state.loading) {
          content = (
              <div className="loader-container">
                  <img className="big-loader" src="/images/loader.gif"/>
              </div>
          )
      } else {
        content = (
          <div>
                {mainContent}
          </div>
        )
      }
        return (
          <div>
              <Notification notification={this.state.notification} notificationType={this.state.notificationType}
                            notificationMessage={this.state.notificationMessage}/>
              <div className="right-section">
                  {content}
              </div>
          </div>
        )
    }
}
