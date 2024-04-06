import CryptoJS from "react-native-crypto-js";
import envVariables from "../Constants/envVariables";

const cryptkey = envVariables.CRYPT_KEY;

function get_keys(key, token) {
    key = key.split("");
    token = token.toString().split("");
    let return_ = "";
    token.forEach(function (val) {
        return_ += key[val];
    });
    return return_;
}

async function encrypt(text, token) {
    try {
        let CBC_KEY = token !== "" ? get_keys(cryptkey, token.substr(0, 16)) : cryptkey;

        return CryptoJS.AES.encrypt(text, CBC_KEY).toString();
    } catch (err) {
//        console.error('encrypt error', err);
        return null;
    }
}

async function decrypt(text, token) {
    try {
        let CBC_KEY = token !== "" ? get_keys(cryptkey, token.substr(0, 16)) : cryptkey;

        text = text.split(":");
        text = text[0];

        let bytes  = CryptoJS.AES.decrypt(text, CBC_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (err) {
        //console.error('decrypt error', err);
        return null;
    }
}


module.exports = {
    encrypt: encrypt,
    decrypt: decrypt
};