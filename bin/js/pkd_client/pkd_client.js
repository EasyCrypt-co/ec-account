/**
 * EasyCrypt.co Account Management
 * Copyright 2017, EasyCrypt.co
 * See README for details.
 *
 * @version 0.2.12
 */

"use strict";
let instance = null;

class PKDClient {

    constructor(conf = null, password = null, clearInstance = false) {
        
        if (clearInstance) instance = null;
        if (instance)
            return instance;
        if (conf) {
            this.conf = conf;
        }
        else {
            // Default values for config comes from pkd_conf.js file
            this.conf = pkdConf;
        }

        if (password)
            this.password = password;
        // Init pgp and workers
        this.initPgp();
        // Set instance holder
        instance = this;
        console.log("PKD client initialized");
        // return pkd client instance
        return instance;
    }


    /**
     * Initializes pgp engine with worker
     */
    initPgp() {
        this.pgp = openpgp;
        this.pgp.initWorker({path: '/js/pkd_client/openpgp.worker.js'});
    }


    setPassword(password) {
        this.password = password;
    }

    /**
     * Performs fetching data from the server using fetch API. Supplied config may specify any options of the originla
     * fetch() overriding them. Promise resolves to the JSON-decoded data
     *
     * @param {String} url relative or absolute URL for request. If relative is supplied, pkdUrl from config is
     *     prepended.
     * @param {Object} config `body` parameter undergoes transformaton, it is convertedto string using JSON.stringify
     *                          if not string already
     * @returns {Promise}
     */
    fetch(url, config, token) {
        let defaultConfig;
        if (!token) {
            defaultConfig = {
                method: 'post',
                credentials: 'include',
                mode: 'cors',
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                }
            };
        }
        else {
            defaultConfig = {
                method: 'post',
                mode: 'cors',
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                    "X-EC-UI": token
                }
            };
        }
        config = config || {};
        // making URL absolute if it is not absolute yet
        if (url.indexOf('http') == -1) {
            url = this.conf.api.base + url;
        }
        if (config.body && typeof config.body != 'string') {
            config.body = JSON.stringify(config.body);
        }
        return fetch(url, Object.assign({}, defaultConfig, config)).then(function (response) {
            if (response.status >= 200 && response.status < 300) {
                return Promise.resolve(response)
            } else {
                return Promise.reject(response);
            }
        }).then(function (response) {
            return response.json();
        });
    }

    /**
     * Accepts array of emails to loog keys for. Returns Promise that resolves to the hash of {email:{...}}
     * @param {Array} emails
     * @returns {Promise}
     */
    getPublicKeys(emails, nokeys) {
        let requestData = {
            include_keys: nokeys ? false : true,
            emails: {}
        };
        for (let email of emails) {
            requestData.emails[email] = null;
        }
        return this.fetch(this.conf.api.getPublicKeys, {
            body: requestData
        }).then(function (response) {
            if (response.status != 'success') {
                return Promise.reject(response.message);
            }
            let result = {};
            for (let key of response.data) {
                key.public_key = atob(key.public_key); //base64 decode
                result[key.email] = key;
            }
            return Object.assign(requestData, result);
        });
    }

    /**
     * Returns promise that resolves to the private key of the requested user's keypair
     *
     *
     * @param {String} email Email of the user for whom we request a keypair
     * @returns {Promise}
     */
    getUserKeys(getKeyHandler, setKeyHandler) {
        let config = {
            method: 'get',
            credentials: 'include',
            mode: 'cors',
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        };
        var keys = null;
        if (getKeyHandler) keys = getKeyHandler();

        if (!keys) {
            return this.fetch(this.conf.api.getKeyPair, config).then(function (response) {
                if (response.status != 'success') {
                    return Promise.reject(response.message);
                }
                var keys = {
                    'private_key': atob(response.data.keys.private_key),
                    'public_key': atob(response.data.keys.public_key)
                };
                if (setKeyHandler) setKeyHandler(keys);
                return keys;
            });
        } else {
            return {
                cache: true,
                keys: keys,
                then: function (call) {
                    return call(keys);
                }
            };
        }
    }

    /**
     * @param {Object} params
     */
    encrypt(params) {
        const emails = params.recipients,
            sender = params.sender,
            body = params.body;

        let pkd = this;

        // 1. Retrieve keys for recipients and sender
        var keys = null;
        var promises = [this.getPublicKeys(emails)];
        if (params.getKeyHandler) {
            keys = this.getUserKeys(params.getKeyHandler, params.setKeyHandler);
            if (keys.cache) keys = keys.keys;
            else {
                promises.push(keys);
                keys = null;
            }
        } else {
            promises.push(this.getUserKeys());
        }
        return Promise.all(promises)
        // this will be called when BOTH requests have finished.
            .then(function (results) {
                const keyData = results[0], senderKeyPair = keys || results[1];
                let publicKeys = [];
                // 2. Go through keys, read them and add to the array of keys to encrypt email with
                for (let email in keyData) {
                    if (!keyData.hasOwnProperty(email)) {
                        continue;
                    }
                    if (keyData[email] !== null) {
                        publicKeys = publicKeys.concat(pkd.pgp.key.readArmored(keyData[email].public_key).keys);
                    }
                }
                // 3. Run encryption routine
                let privateKey = pkd.pgp.key.readArmored(senderKeyPair.private_key).keys[0];
                if (pkd.password)
                    privateKey.decrypt(pkd.password);
                return pkd.pgp.encrypt({
                    data: body,
                    publicKeys: publicKeys,
                    privateKeys: privateKey,
                    armor: params.binary ? false : true
                })
            })
            .then(function (ciphertext) {
                return Promise.resolve(!params.binary ? ciphertext.data : ciphertext.message);
            })
            .catch(function (error) {
                console.error('Could not get public keys or sender\'s keypair', error);
                return Promise.reject(error);
            });
    }

    /**
     * Generates keypair. Returns promise that resolves to the keypair object.
     *
     * @param {Object} params Params for keypair generation. Email is required, others are optional
     * @returns {Promise}
     */
    generate(params) {
        let identity = {
                email: params.email
            },
            numBits = this.conf.numBits,
            email = params.email;
        
        if (params.name) {
            identity.name = params.name;
        }
        let options = {
            userIds: [identity],
            numBits: this.conf.numBits
        };
        
        if (params.passphrase) {
            options.passphrase = params.passphrase;
        }
        return this.pgp.generateKey(options).then(function (key) {
            return Promise.resolve({
                private_key: key.privateKeyArmored,
                public_key: key.publicKeyArmored,
                bits: numBits,
                email: email
            });
        });
    }

    decrypt(params) {
        const body = params.body;
        let pkd = this;

        return this.getUserKeys(params.getKeyHandler, params.setKeyHandler)
            .then(function (keys) {
                let privateKey = pkd.pgp.key.readArmored(keys.private_key).keys[0];

                if (pkd.password)
                    privateKey.decrypt(pkd.password);
                return pkd.pgp.decrypt({
                    message: params.binary ? pkd.pgp.message.read(body) : pkd.pgp.message.readArmored(body),
                    publicKey: pkd.pgp.key.readArmored(keys.public_key).keys,
                    privateKey: privateKey,
                    format: params.format || 'utf8'
                });
            })
            .then(function (plaintext) {
                return Promise.resolve(plaintext.data);
            });
    }

    /**
     * Generates keypair and saves it to the server. Returns promise that resolves to the server response.
     *
     *
     * @param {Object} params Params for keypair generation. Email is required, others are optional
     * @returns {Promise}
     */
    saveKeyPair(params) {
        var self = this;
        let identity = {
            email: params.email
        };
        if (params.name) {
            identity.name = params.name;
        }
        let options = {
            userIds: [identity],
            numBits: this.conf.numBits
        };

        if (params.passphrase) {
            options.passphrase = params.passphrase;
        }

        return this.pgp.generateKey(options)
            .then(function (key) {
                return self.fetch(self.conf.api.addKeyPair, {
                    body: {
                        email: params.email,
                        public_key: btoa(key.publicKeyArmored),
                        private_key: btoa(key.privateKeyArmored)
                    }
                });
            });
    }

    /**
     * Import user's  keypair. Returns promise that resolves to the keypair object.
     *
     * @param {Object} params Params for keypair import. See the https://pkd.easycrypt.co/docs/#api-PKD-Post_patchKeyImport
     * @returns {Promise}
     */
    importKeys(params, token) {
        var self = this;
        return self.fetch(self.conf.api.addKeyPair, {body: params}, token);
    }

    encryptWithNewKey(passphrase, newPassphrase) {
        let self = this;
        return this.getUserKeys()
            .then(function (keys) {
                var privateKey = self.pgp.key.readArmored(keys.private_key).keys[0];
                let decryptResult = privateKey.decrypt(passphrase);
                if (decryptResult) {
                    privateKey.encrypt(newPassphrase);
                    let updatedKeys = {
                        public_key: keys.public_key,
                        private_key: privateKey.armor()
                    };
                    return updatedKeys;
                }
                return null;
            }).then(function (updatedKeys) {
                return Promise.resolve(updatedKeys);
            });
    }

    getKeyFingerprint(keyContent) {
        let privateKey = this.pgp.key.readArmored(keyContent).keys[0];
        return privateKey.primaryKey.fingerprint;
    };

    encryptKeyWithPassword(keyContent, keyPassphrase, password) {
        let privateKey = this.pgp.key.readArmored(keyContent).keys[0];
        let decryptResult = privateKey.decrypt(keyPassphrase);
        if (decryptResult) {
            privateKey.encrypt(password);
            let updatedKeys = {
                public_key: privateKey.toPublic().armor(),
                private_key: privateKey.armor()
            };
            return updatedKeys;
        }
        return null;
    };

    hashString(text) {
        return this.pgp.util.hexidump(this.pgp.crypto.hash.digest(this.pgp.enums.hash.sha256, text));
    }
}