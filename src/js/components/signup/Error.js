/**
 * EasyCrypt.co Account Management
 * Copyright 2017, EasyCrypt.co
 * See README for details.
 *
 * @version 0.1.37
 */

import React from "react";
import BackendEndpoints from "../../utils/backendEndpoints";
import swal from "sweetalert2";

export default class Error extends React.Component {
    constructor(props) {
        super(props);
    }

    sendLog(event) {
      event.preventDefault();

      let log = this.props.logs;
      log.push(this.props.consoleLogs);
      BackendEndpoints.sendLog(log.join('\n'), this.props.token).then((data) => {
        if(data) {
          swal({
            text: "Problem reported to EasyCrypt",
            showCancelButton: true,
            showConfirmButton: false,
            confirmButtonColor: '#57b031',
            cancelButtonText: 'Ok',
            width: 500,
            animation: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            customClass: "swal-custom"
          });
        }
      });

    }

    render() {
        if (this.props.errorMessage) {
            return (
                <div className="error-msg">
                    <label>{this.props.errorMessage}
                    <a className="send-log" href="#"
                     onClick={(event) => this.sendLog(event)}
                     title=" By clicking this link you will be sending personally identifiable information to EasyCrypt.
                     It will be used to resolve the reported technical problem and will then be deleted.
                     If you do not agree to this, do not click this link."
                     >
                     <span>Send log</span>
                      <i className="fa fa-question-circle-o" aria-hidden="true"></i>
                    </a> </label>
                </div>
            );
        }
        return null;
    }
};
