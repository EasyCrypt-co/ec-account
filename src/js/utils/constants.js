/**
 * EasyCrypt.co Account Management
 * Copyright 2017, EasyCrypt.co
 * See README for details.
 *
 * @version 0.1.37
 */

export const PROVIDER_CONFIG = {
    PLAIN: "PLAIN",
    OAUTH: "OAUTH",
    MANUAL: "MANUAL"
};

export const APP_CONFIG = {
    ecDomain: '.easycrypt.co',
    webMailURL: 'https://webmail.easycrypt.co',
    authURL: 'https://auth.easycrypt.co',
    pkdURL: 'https://pkd.easycrypt.co',
    pageURL: 'https://easycrypt.co',
    accountURL: 'https://account.easycrypt.co'
};

export const URLS = {
    LINK: "/auth/secure-link/",
    USER_INFO: "/ui",
    PROVIDER_DETAILS: "/provider",
    USER_PASSWORD: "/user/password",
    CONNECTION_SETTINGS: "/user/connection_settings",
    CREATE_USER: "/user/create",
    LOGIN: "/login/",
    AUTH: "/auth",
    KEYS: "/user/keys",
    DELETE_ACCOUNT_EMAIL: "/user/delete",
    DELETE_ACCOUNT: "/user",
    USER_IDENTITIES: "/user/identities",
    LOGOUT: "/user/logout",
    LOG: "/user/log",
    IMPORT_KEY: "/key/import",
    VERIFY_KEY: "/key/confirm",
    CONNECTION_DETAILS: "/user/connection_details"
};

export const ACCOUNT_URLS = {
    ACCOUNT_EMAIL: "/account/email",
    ACCOUNT_PASSWORD: "/account/password",
    ACCOUNT_DELETE: "/account/delete",
    ADVANCED: "/advanced",
    ADVANCED_VIEW_KEYS: "/advanced/view-keys",
    ADVANCED_IMPORT_KEYS: "/advanced/import-keys"
};

export const PROVIDERS = {
  GMAIL: {
      id: 1,
      name: "Gmail",
      icon: "/images/providers/gmail.png",
  },
  YAHOO: {
      id: 2,
      name: "Yahoo",
      icon: "/images/providers/yahoo.png",
      iconSize: '120px',
      bubble: "<p>EasyCrypt could not connect to your email account.</p><p>You may need to make the following change to your account settings:</p><ol><li>Log into your Yahoo Mail account using browser</li><li>Click the gear icon and go to Account Info>Account security</li><li>Select “Allow apps that use less secure sign in”</li><li>Come back to this browser tab and click “Next”</li></ol>"
  },
  OUTLOOK: {
      id: 3,
      name: "Outlook",
      icon: "/images/providers/outlook.png",
      iconSize: '120px',
      bubble: "<p>EasyCrypt encountered a problem while connecting to your Outlook.com email account. Possible causes and remedies:</p> \
      <ol><li>You may need to approve \“unusual sign-in activity\“: \
      <ul style=\"list-style: none;\"><li>a. Log into your Outlook.com webmail</li> \
      <li>b. If there is a recent message in your Inbox reporting unusual sign-in activity, follow the instructions in the message to approve such activity</li> \
      <li>c. Come back here and click “Next”</li> \
      </ul></li>\
      <li>If you a have enabled two-step verification in your email account, you need to do the following: \
      <ul style=\"list-style: none;\"> \
      <li>a. Log into your Outlook.com webmail</li> \
      <li>b. Click \“Security\”</li> \
      <li>c. Click \"More security options\"</li> \
      <li>d. On the Additional Security options page choose \"Create a new app password\"</li> \
      <li>e. Come back here and use the password as your email password in EasyCrypt</li> \
      </ul>\
      </li></ol>"
  },
  MAILRU: {
      id: 4,
      name: "mailru",
      icon: "/images/providers/mailru.png",
  },
  APPLE: {
      id: 6,
      name: "Apple",
      icon: "/images/providers/icloud.png",
      bubble: "<p>If you are using two-factor authentication you need to do the following to use EasyCrypt with your iCloud account:</p><ol><li>Go to iCloud settings</li><li>Click “Manage Apple ID”</li><li>Under Security choose “Generate Password”</li><li>Use the generated password as your email password with EasyCrypt</li></ol><br/><p>If you are not using 2FA you can ignore this and proceed.</p>"
  },
  HOTMAIL: {
      id: 7,
      name: "Hotmail",
      icon: "/images/providers/outlook.png",
      bubble: "<p>EasyCrypt could not connect to your email account.</p><p>You may need to approve “unusual sign in activity“ in Outlook.com.</p><ol><li>Log into your Outlook.com webmail.</li><li>If there is a recent message in your Inbox reporting unusual sign-in activity, follow the instructions in the message to approve such activity.</li><li>Come back to this browser tab and click “Next”</li></ol>"
  },
  YANDEX: {
      id: 19,
      name: "Yandex",
      icon: "/images/providers/yandex.png",
      bubble: "<p>EasyCrypt could not connect to your email account.</p><p>You may need to generate a dedicated password for EasyCrypt.</p><ol><li>Log into your Yandex account using browser</li><li>Управление доступом >  Создать пароль приложения > Почтa</li><li>Generate and copy the new application password</li><li>Come back to this browser tab, paste the password and click “Next”</li></ol>"
  },
  FASTMAIL: {
      id: 20,
      name: "Fastmail",
      icon: "/images/providers/fastmail.png",
      bubble: "<p>EasyCrypt could not connect to your email account.</p><p>You may need to generate a dedicated password for EasyCrypt.</p><ol><li>Log into your Fastmail.com account using browser</li><li>Go to Settings > Password and Security > New App Password</li><li>Copy the new password</li><li>Come back to this browser tab, paste the password and click “Next”</li></ol>"
  },
  GMX: {
      id: 21,
      name: "GMX",
      icon: "/images/providers/gmx.png",
      bubble: "<p>EasyCrypt could not connect to your email account.</p><p>You may need to enable sending and receiving emails via an external program.</p><ol><li>Log into your GMX account using browser</li><li>Go to Email > Settings > Pop3 & IMAP</li><li>Select “Send and receive emails via external program”  and click Save</li><li>Come back to this browser tab and click “Next”</li></ol>"
  },
  AOL: {
      id: 22,
      name: "Aol. Mail",
      icon: "/images/providers/aol.png",
  },
  EASYCRYPT: {
      id: 24,
      name: "EasyCrypt",
      icon: "/images/providers/easycrypt.png",
      iconSize: '100px'
  }
};

export const NOTIFICATION_TYPE = {
    ERROR: "error",
    NOTIFICATION: "notification"
};

export const LOG = {
    URL: "URL",
    STEP: "STEP ",
    BROWSER: "BROWSER",
    CONSOLE: "CONSOLE LOGS : ",
    GET_USER_DETAILS: "Get user details",
    PASSWORD_SET: "Password set",
    ERROR_SETTING_PASSWORD: "Error setting password",
    KEYS_GENERATED: "Keys generated",
    ERROR_GENERATING_KEYS: "Error generating keys",
    EMAIL_PROVIDER_OAUTH: "Email provider with OAuth",
    EMAIL_PROVIDER_PLAIN: "Email provider plain",
    EMAIL_PROVIDER_MANUAL: "Email provider manual",
    EMAIL_PROVIDER_NOT_SUPPORTED: "Email provider not supported",
    NO_JWT: "No jwt",
    CONNECTION_DETAILS_SET: "Connection details set",
    ERROR_SETTING_CONNECTION_DETAILS: "Error setting connection details",
    INCORRECT_STATUS_MESSAGE: "Incorrect status message",
    LINK_EXPIRED: "Link Expired",
    EMAIL_NOT_FOUND: "Email address not found",
    USER_CREATED: "User created",
    ERROR_CREATING_USER: "Error creating user",
    HANDLE_LOGIN_CLICK: "Handle Login Click",
    HANDLE_OAUTH_CLICK: "Handle OAuth click",
    HANDLE_SUBMIT: "Handle submit",

};

export const POPUP = {
    ERROR_KEY_GENERATION: "<p>Key generation error occurred. Possible causes:</p><ul><li>Incompatible browser</li><li>Incompatible OS</li></ul>",
    AFTER_LOG_SENT: "Problem reported. EasyCrypt Support will get back to you at ",
    TITLE: "<p>EasyCrypt could not connect to your email account.</p>",
    AUTH_ERROR: "<p>Your email service provider says: Incorrect username or password</p>",
    AUTMATIC_CLIENT_LOG: "-------------- AUTOMATIC CLIENT LOG --------------",
    AUTH_REJECT_TITLE: "<p>EasyCrypt could not connect to your email account.This can be due to the following actions of your email service provider (ESP):</p>",
    AUTH_REJECT: "<ol>\
                  <li>The ESP requires use of an application-specific password for external applications such as EasyCrypt</li>\
                  <li>The ESP regards access from our servers in Switzerland as a suspicious login activity and has locked your account</li>\
                  <li>The ESP requires that you log into your account over Web and confirm that access by EasyCrypt is OK</li>\
                  </ol>\
                  <p>Please log into your email provider's website and take the appropriate action. You can then come back here to complete the sign-up.</p>",
    UNTRUSTED_CERT: "Email service provider uses untrusted SSL certificate and cannot be used with EasyCrypt",
    STEP2_ABORT: "<p>Please sign up with another email account<p>",
    GENERIC_ERROR: "<p>Email server refused connection or is not responding.</p>",
    GENERIC_ERROR_REPORTED: "<p>Problem reported. EasyCrypt Support will get back to you at</p>"
}
