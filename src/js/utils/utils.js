/**
 * EasyCrypt.co Account Management
 * Copyright 2017, EasyCrypt.co
 * See README for details.
 *
 * @version 0.1.37
 */

import cookie from "react-cookie";
import {PROVIDERS, APP_CONFIG} from "./constants";
import XRegExp from "xregexp";
import CryptoJS from "crypto-js";

let Utils = {};

Utils.hashString = function (string) {
    return CryptoJS.SHA256(string).toString();

};

Utils.getStringBetweenTwoStrings = function (startString, endString, text) {
    if (text.indexOf(startString) >= 0 && text.indexOf(endString) >= 0) {
        let containedString = text.substring(text.indexOf(startString), text.indexOf(endString) + endString.length);
        return containedString;
    }
    return null;
};

Utils.generateKeys = function (email, passphrase) {
    let pkdClient = new PKDClient(pkdConf, null, true);

    var keyOptions = {
        email: email,
        passphrase: passphrase
    };

    return pkdClient.generate(keyOptions).then(function (data) {
        return data;
    }).catch(function (err) {
        console.log(err);
    });
};

Utils.importKeys = function (email, public_key, private_key, token) {
    let pkdClient = new PKDClient(pkdConf, null, true);

    var keyOptions = {
        email: email,
        public_key: public_key,
        private_key: private_key,
    };

    return pkdClient.importKeys(keyOptions, token).then(function (data) {
        return data;
    }).catch(function (err) {
        console.log(err);
    });
};

Utils.encryptWithNewPassphrase = function (passphrase, newPassphrase) {
    let pkdClient = new PKDClient(pkdConf, null, true);

    return pkdClient.encryptWithNewKey(passphrase, newPassphrase).then(function (data) {
        return data;
    }).catch(function (err) {
        console.log(err);
    });
};

Utils.getKeyFingerprint = function (keyContent, passphrase) {
    let pkdClient = new PKDClient(pkdConf, null, true);
    return pkdClient.getKeyFingerprint(keyContent, passphrase);
};

Utils.encryptKeyWithPassword = function (keyContent, keyPassphrase, password) {
    let pkdClient = new PKDClient(pkdConf, null, true);
    return pkdClient.encryptKeyWithPassword(keyContent, keyPassphrase, password);
};

Utils.verifyPassword = function (password, confirmPassword) {
    let response = {
        ok: true,
        error: ''
    };

    if (password != confirmPassword) {
        response.ok = false;
        response.error = "Passwords do not match";
    }
    else {
        if (password.length < 8) {
            response.ok = false;
            response.error = "Password must contain at least 8 digits or English letters, at least 2 digits and 2 letters";
        }
        else {
            let atLeastTwoDigits = new RegExp("[0-9].*[0-9]");
            let atLeastTwoCharacters = XRegExp("\\p{L}.*\\p{L}");
            let allExceptBrackets = new RegExp("[\\[\\]<>\\{\\}\\(\\)]");
            let whiteSpaceAndBackslash = new RegExp("\\s|\\\\");
            if (!this.matchRegex(password, allExceptBrackets)) {
                if (this.matchRegex(password, atLeastTwoCharacters)) {
                    if (this.matchRegex(password, atLeastTwoDigits)) {
                        if(!this.matchRegex(password, whiteSpaceAndBackslash)) {
                          response.ok = true;
                        } else {
                          response.ok = false;
                          response.error = "Password contains whitespaces or \\ character";
                        }
                    }
                    else {
                        response.ok = false;
                        response.error = "Password must contain at least 2 digits";
                    }
                }
                else {
                    response.ok = false;
                    response.error = "Password must contain at least 2 letters";
                }
            }
            else {
                response.ok = false;
                response.error = "Password must not contain brackets \' { } [ ] ( ) < > \'";
            }
        }
    }

    return response;
};

Utils.verifyEmailPassword = function (password, confirmPassword) {
  let response = {
      ok: true,
      error: ''
  };

  if (password !== confirmPassword) {
      response.ok = false;
      response.error = "Passwords do not match";
  }

  return response;
}

Utils.matchRegex = function (pwd, regex) {
    var valid = regex.test(pwd);
    return valid;
};

Utils.getProviderImage = function (providerId) {
    switch (providerId) {
        case PROVIDERS.GMAIL.id:
            return PROVIDERS.GMAIL.icon;
        case PROVIDERS.YAHOO.id:
            return PROVIDERS.YAHOO.icon;
        case PROVIDERS.OUTLOOK.id:
            return PROVIDERS.OUTLOOK.icon;
        case PROVIDERS.MAILRU.id:
            return PROVIDERS.MAILRU.icon;
        case PROVIDERS.APPLE.id:
            return PROVIDERS.APPLE.icon;
        case PROVIDERS.HOTMAIL.id:
            return PROVIDERS.HOTMAIL.icon;
        case PROVIDERS.YANDEX.id:
            return PROVIDERS.YANDEX.icon;
        case PROVIDERS.FASTMAIL.id:
            return PROVIDERS.FASTMAIL.icon;
        case PROVIDERS.GMX.id:
            return PROVIDERS.GMX.icon;
        case PROVIDERS.AOL.id:
            return PROVIDERS.AOL.icon;
        case PROVIDERS.EASYCRYPT.id:
            return PROVIDERS.EASYCRYPT.icon;
        default:
            //do nothing
            return null;
    }
};

Utils.deleteJWTCookie = function () {
    cookie.remove('ec_jwt', {
        domain: APP_CONFIG.ecDomain,
        path: '/',
        secure: true
    });
};

Utils.saveJWTCookie = function (jwtToken) {
    cookie.save('ec_jwt', jwtToken, {
        domain: APP_CONFIG.ecDomain,
        path: '/',
        secure: true
    });
};

Utils.computeKeyFileName = function (keyType, email, fingerprint) {
    let fileName = "";

    let processedEmail = email.replace("@", "_at_");
    fileName += processedEmail + " (0x";

    let last8Fingerprint = fingerprint.substr(fingerprint.length - 8);
    fileName += last8Fingerprint + ") ";

    switch (keyType) {
        case "public":
            fileName += "pub.asc";
            break;
        case "private":
            fileName += "sec.asc";
            break;
        case "backup":
            fileName += "pub-sec.asc";
            break;
        default:
            //do nothing
            break;
    }
    return fileName;
};

Utils.isSafari = function () {
    var isSafari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
        navigator.userAgent && !navigator.userAgent.match('CriOS');
    return isSafari;
};

Utils.generateRandom10CharactersString = function () {
    let randomString = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < 10; i++)
        randomString += possible.charAt(Math.floor(Math.random() * possible.length));

    return randomString;
};

Utils.getCurrentDate = function () {
    let date = new Date();
    date = date.toUTCString();
    return date;
};

Utils.getSafeSettings = function (settings) {
    let newSettings = JSON.parse(JSON.stringify(settings));
    newSettings.credentials.imap.imap_password = null;
    newSettings.credentials.smtp.smtp_password = null;

    return newSettings;
};

export default Utils;
