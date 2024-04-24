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

async function forgot_password(payload) {
    return await network_call("FORGOT_PASSWORD", payload);
}

async function update_password(payload) {
    return await network_call("UPDATE_PASSWORD", payload);
}

async function logout(payload) {
    StorageManager.remove_session();
    StorageManager.remove_key("JWT");
    return {};
}


async function registration(payload) {
    payload.device_id = "Android";//machineIdSync({original: true});
    payload.device_token = "DT";
    payload.device_type = "1"
    var result = await network_call("REGISTRATION", payload);
    if (result.status === true && payload.otp) {
        if (result.status === true) {
            await StorageManager.set_key("JWT", result.id);
            await StorageManager.set_session(result.data);
        }
    }
    return result;
}

module.exports = {
    login,
    forgot_password,
    update_password,
    logout,
    registration
};