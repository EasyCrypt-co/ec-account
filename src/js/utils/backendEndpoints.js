/**
 * EasyCrypt.co Account Management
 * Copyright 2017, EasyCrypt.co
 * See README for details.
 *
 * @version 0.1.37
 */

import axios from "axios";
import {APP_CONFIG, URLS} from "./constants";
import Utils from "./utils";

let BackendEndpoints = {};

/*
 *  No authentication
 */

BackendEndpoints.getToken = function (id) {
    return axios.get(APP_CONFIG.authURL + URLS.LINK + id)
        .then(function (response) {
            return response.data.data;
        })
        .catch(function (error) {
            console.log(error);
        });
};

BackendEndpoints.getUserDetails = function (token) {
    let config = null;
    let tokenConfig = {
        headers: {
            'X-EC-UI': token
        }
    };
    let cookieConfig = {
        withCredentials: true
    };
    config = token ? tokenConfig : cookieConfig;
    let randomString = Utils.generateRandom10CharactersString();
    return axios.get(APP_CONFIG.authURL + URLS.USER_INFO + "?" + randomString, config)
        .then(function (response) {
            return response;
            // return response.data.data;
        })
        .catch(function (error) {
            if (error.response) {
                if (error.response.status == 401) {
                    return "redirect";
                }
                else {
                    console.log(error);
                }
            } else {
                console.log(error);
            }
        });
};

/*
 *  Authenticate using token in X-EC-UI header
 */

BackendEndpoints.getProviderDetails = function (email, token) {
    return axios.post(APP_CONFIG.authURL + URLS.PROVIDER_DETAILS,
        {
            email: email
        },
        {
            headers: {
                'X-EC-UI': token
            }
        })
        .then(function (response) {
            return response;
            // return response.data.data;
        })
        .catch(function (error) {
            console.log(error);

        });
};

BackendEndpoints.setPassword = function (password, token) {
    return axios.post(APP_CONFIG.authURL + URLS.USER_PASSWORD,
        {
            password: password
        },
        {
            headers: {
                'X-EC-UI': token
            }
        })
        .then(function (response) {
            return response;
        })
        .catch(function (error) {
            console.log(error);
        });
};

BackendEndpoints.setConnectionSettings = function (settings, token) {
    return axios.post(APP_CONFIG.authURL + URLS.CONNECTION_SETTINGS,
        {
            provider_id: settings.providerId,
            credentials: settings.credentials,
            settings: settings.settings,
        },
        {
            headers: {
                'X-EC-UI': token
            }
        })
        .then(function (response) {
            return response;
        })
        .catch(function (error) {
            if(error.response) {
              return error.response;
            }
            return {gotError: true, error: error};
        });
};

BackendEndpoints.createUser = function (token) {
    return axios.get(APP_CONFIG.authURL + URLS.CREATE_USER,
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-EC-UI': token
            }
        })
        .then(function (response) {
            return response;
        })
        .catch(function (error) {
            console.log(error);
        });
};

/*
 *  Authenticate using cookie
 */

BackendEndpoints.checkIfUserIsLoggedIn = function () {
    let randomString = Utils.generateRandom10CharactersString();
    return axios.get(APP_CONFIG.authURL + URLS.USER_INFO + "?" + randomString,
        {
            withCredentials: true
        })
        .then(function (response) {
            return true;
        })
        .catch(function (error) {
            console.log(error);
            return false;
        });
};

BackendEndpoints.getEmailIdentities = function () {
    return axios.get(APP_CONFIG.authURL + URLS.USER_IDENTITIES,
        {
            withCredentials: true
        })
        .then(function (response) {
            return response.data.data;
        })
        .catch(function (error) {
            console.log(error);

        });
};

BackendEndpoints.setPasswordWithCookie = function (password) {
    return axios.post(APP_CONFIG.authURL + URLS.USER_PASSWORD,
        {
            password: password
        },
        {
            withCredentials: true
        })
        .then(function (response) {
            return "success";
        })
        .catch(function (error) {
            console.log(error);
        });
};

BackendEndpoints.getUserKeys = function () {
    return axios.get(APP_CONFIG.pkdURL + URLS.KEYS,
        {
            withCredentials: true
        })
        .then(function (response) {
            return response.data.data;
        })
        .catch(function (error) {
            console.log(error);
        });
};

BackendEndpoints.updateUserKeys = function (email, password, public_key, private_key) {
    let params = {};
    if (password != null) {
        params = {
            email: email,
            password: password,
            public_key: public_key,
            private_key: private_key,
        }
    }
    else {
        params = {
            email: email,
            public_key: public_key,
            private_key: private_key,
        }
    }
    return axios.put(APP_CONFIG.pkdURL + URLS.KEYS,
        params,
        {
            withCredentials: true
        })
        .then(function (response) {
            return "success";
        })
        .catch(function (error) {
            if (error.response && error.response.data) {
                return error.response.data
            }
            console.log(error);
        });
};

BackendEndpoints.sendDeleteAccountEmail = function () {
    return axios.get(APP_CONFIG.authURL + URLS.DELETE_ACCOUNT_EMAIL,
        {
            withCredentials: true
        })
        .then(function (response) {
            return "success";
        })
        .catch(function (error) {
            console.log(error);
        });
};

BackendEndpoints.deleteAccount = function (id, token) {
    return axios({
        method: 'delete',
        url: APP_CONFIG.authURL + URLS.DELETE_ACCOUNT,
        data: {
            id: id
        },
        headers: {
            "X-EC-UI": token
        }
    }).then(function (response) {
        return "success";
    }).catch(function (error) {
        console.log(error);
    });
};

BackendEndpoints.logout = function () {
    return axios.post(APP_CONFIG.authURL + URLS.LOGOUT,
        {},
        {
            withCredentials: true
        })
        .then(function (response) {
            Utils.deleteJWTCookie();
            return response.data.data;
        })
        .catch(function (error) {
            console.log(error);
        });
};

BackendEndpoints.getAuthKey = function () {
    return axios.get(APP_CONFIG.pkdURL + URLS.IMPORT_KEY,
        {
            withCredentials: true
        })
        .then(function (response) {
            return response.data.data;
        })
        .catch(function (error) {
            if (error.response) {
                if (error.response.status == 400) {
                    return "empty";
                }
                else {
                    console.log(error);
                }
            } else {
                console.log(error);
            }
        });
};

BackendEndpoints.abortUserKeyImport = function () {
    return axios({
        method: 'delete',
        url: APP_CONFIG.pkdURL + URLS.IMPORT_KEY,
        withCredentials: true,
    }).then(function (response) {
        return "success";
    }).catch(function (error) {
        console.log(error);
    });
};

BackendEndpoints.verifyKey = function (id) {
    return axios.get(APP_CONFIG.pkdURL + URLS.VERIFY_KEY + "/" + id,
        {
            withCredentials: true
        })
        .then(function (response) {
            return response.data.data;
        })
        .catch(function (error) {
            console.log(error);
        });
};

BackendEndpoints.replaceKeys = function () {
    return axios.post(APP_CONFIG.pkdURL + URLS.IMPORT_KEY,
        {},
        {
            withCredentials: true
        })
        .then(function (response) {
            return "success";
        })
        .catch(function (error) {
            console.log(error);
        });
};

BackendEndpoints.authenticate = function (email, password) {
    return axios.post(APP_CONFIG.authURL + URLS.AUTH,
        {
            email: email,
            password: password
        },
        {
            withCredentials: true
        })
        .then(function (response) {
            return "success";
        })
        .catch(function (error) {
            console.log(error);
        });
};

BackendEndpoints.sendLog = function (log, token) {
    return axios.post(APP_CONFIG.authURL + URLS.LOG,
        {
          log: log,
        },
        {
          headers: {
          'X-EC-UI': token
          }
        })
        .then(function (response) {
            return "success";
        })
        .catch(function (error) {
            console.log(error);
        });
};

BackendEndpoints.putConnectionSettings = function (settings) {
    return axios.put(APP_CONFIG.authURL + URLS.CONNECTION_SETTINGS,
        {
          provider_id: settings.providerId,
          credentials: settings.credentials,
          settings: settings.settings,
        },
        {
            withCredentials: true
        })
        .then(function (response) {
            return {data:{status:"success"}};
        })
        .catch(function (error) {
            return error.response;
        });
};

BackendEndpoints.getConnectionSettings = function () {
    return axios.get(APP_CONFIG.authURL + URLS.CONNECTION_SETTINGS,
        {
            withCredentials: true
        })
        .then(function (response) {
            return response;
        })
        .catch(function (error) {
            throw error;
        });
};

export default BackendEndpoints;
