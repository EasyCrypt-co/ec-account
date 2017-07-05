/**
 * EasyCrypt.co Account Management
 * Copyright 2017, EasyCrypt.co
 * See README for details.
 *
 * @version 0.1.37
 */

import "babel-polyfill";
import React from "react";
import ReactDOM from "react-dom";
import AccountPage from "./components/AccountPage";
import ProfileDetails from "./components/account/my-account/ProfileDetails";
import Password from "./components/account/my-account/Password";
import DeleteAccountConfirmation from "./components/DeleteAccountConfirmation";
import DeleteAccount from "./components/account/my-account/DeleteAccount";
import Advanced from "./components/account/advanced/Advanced";
import ViewKeys from "./components/account/advanced/ViewKeys";
import ImportKeys from "./components/account/advanced/ImportKeys";
import VerifyKeys from "./components/VerifyKeys";
import GenerateKeys from "./components/account/advanced/GenerateKeys";
import InviteFriends from "./components/account/invite-friends/InviteFriends";
import BackendEndpoints from "./utils/backendEndpoints";
import SignUpPage from "./components/SignUpPage";
import {Router, Route, browserHistory, IndexRedirect} from "react-router";
import {APP_CONFIG, URLS} from "./utils/constants";
require('../scss/style.scss');
require('../scss/internalpages.scss');


function authCheckLogin(nextState, replace, callback) {

    BackendEndpoints.checkIfUserIsLoggedIn().then((loggedIn) => {
        if (!loggedIn) {
            if (nextState.location) {
                if (nextState.location.pathname == "/delete") {
                    let index = nextState.location.search.indexOf("id=");
                    if (index >= 0) {
                        let deleteId = nextState.location.search.substring(index + "id=".length, nextState.location.search.length);
                        window.location.replace(APP_CONFIG.webMailURL + URLS.LOGIN + "?src=account&deleteId=" + deleteId);
                    }
                    else {
                        window.location.replace(APP_CONFIG.webMailURL + URLS.LOGIN + "?src=account");
                    }
                }
                else {
                    window.location.replace(APP_CONFIG.webMailURL + URLS.LOGIN + "?src=account");
                }
            }
            else {
                window.location.replace(APP_CONFIG.webMailURL + URLS.LOGIN + "?src=account");
            }
        }
        callback();
    });
}

const router = (
    <Router history={browserHistory}>
        <Route path="/signup" component={SignUpPage}></Route>
        <Route path="/account/oauth" component={AccountPage}></Route>
        <Route path="/" component={AccountPage} onEnter={authCheckLogin}>
            <IndexRedirect to="/account/email"/>
            <Route path="/account/email" component={ProfileDetails}>
            </Route>
            <Route path="/account/password" component={Password}>
            </Route>
            <Route path="/account/delete" component={DeleteAccount}>
            </Route>
            <Route path="/advanced" component={Advanced}>
            </Route>
            <Route path="/advanced/view-keys" component={ViewKeys}>
            </Route>
            <Route path="/advanced/import-keys" component={ImportKeys}>
            </Route>
            <Route path="/advanced/generate-keys" component={GenerateKeys}>
            </Route>
            <Route path="/invite" component={InviteFriends}>
            </Route>
        </Route>
        <Route path="/verification" component={VerifyKeys}>
        </Route>
        <Route path="/delete" component={DeleteAccountConfirmation}>
        </Route>
    </Router>
);

ReactDOM.render(router, document.getElementById('root'));
