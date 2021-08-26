import * as CryptoJS from "crypto-js";
import SecureStorage from "secure-web-storage";
var SECRET_KEY = process.env.REACT_APP_WEB_STORAGE_SECURITY;

var secureStorage = new SecureStorage(localStorage, {
  hash: function hash(key) {
    key = CryptoJS.SHA256(key, SECRET_KEY);

    return key.toString();
  },
  encrypt: function encrypt(data) {
    data = CryptoJS.AES.encrypt(data, SECRET_KEY);

    data = data.toString();

    return data;
  },
  decrypt: function decrypt(data) {
    data = CryptoJS.AES.decrypt(data, SECRET_KEY);

    data = data.toString(CryptoJS.enc.Utf8);

    return data;
  },
});

var Session = (function () {
  var getSession = function (key) {
    return secureStorage.getItem(key);
  };

  var setSession = function (key, data) {
    console.log(data);
    try {
      secureStorage.setItem(key, data);
    } catch (error) {
      console.log(error);
    }
  };

  var clearSession = function (key) {
    return secureStorage.clear();
  };

  var clearItem = function (key) {
    return secureStorage.removeItem(key);
  };

  return {
    getSession: getSession,
    setSession: setSession,
    clearItem: clearItem,
    clearSession: clearSession,
  };
})();

export default Session;
