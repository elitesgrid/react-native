//import {machineId, machineIdSync} from 'node-machine-id';

import StorageManager from "../StorageManager.js";

import {network_call} from '../NetworkCall.js';

async function login(payload) {
    payload.device_id = "Android";//machineIdSync({original: true});
    payload.device_token = "DT";
    payload.device_type = "1";
    var result = await network_call("LOGIN_AUTH", payload);
    if (result.status === true) {
        await StorageManager.set_key("JWT", result.id);
        await StorageManager.set_session(result.data);
    }
    return result;
}

async function send_verification_otp(payload) {
    return await network_call("SEND_VERIFICATION_OTP", payload);
}

async function update_password(payload) {
    return await network_call("UPDATE_PASSWORD", payload);
}

async function logout(payload) {
    StorageManager.remove_session();
    StorageManager.remove_key("JWT");
    return {};
}


async function login_with_otp(event, payload) {
    payload.device_id = machineIdSync({original: true});
    payload.is_social = "0";
    var result = await network_call("LOGIN_WITH_OTP", payload);
    if (result.status === true && payload.otp) {
        if (result.status === true) {
            await StorageManager.set_key("JWT", result.data);
            result = await network_call("GET_MY_PROFILE", {cb: result.cb});
            if (result.status === true) {
                await StorageManager.set_session(result.data);
            }
        }
    }
    return result;
}

module.exports = {
    login,
    send_verification_otp,
    update_password,
    logout,
    login_with_otp
};