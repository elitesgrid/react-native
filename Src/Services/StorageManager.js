
import AsyncStorage from '@react-native-async-storage/async-storage';
import {encrypt, decrypt} from './EncDec';


async function get_session() {
    return await get_key("USER_SESSION");
}

async function set_session(payload) {
    return await set_key("USER_SESSION", payload);
}

async function remove_session() {
    return await remove_key("USER_SESSION");
}

async function get_key(key) {
    let data = await  AsyncStorage.getItem(key);
    if (data === undefined || data === null) {
        data = {
            status: false
        };
    } else {
        data = {
            status: true,
            data: data
        };
    }
    if (data.status === true) {
        let _return = await decrypt(data.data, '');
        return JSON.parse(_return);
    }
    return {};
}

async function set_key(key, payload) {
    payload = await encrypt(JSON.stringify(payload), "");
    return await AsyncStorage.setItem(key, payload);
}

async function remove_key(key) {
    return await AsyncStorage.removeItem(key);
}

export default {
    get_session : get_session,
    set_session : set_session,
    remove_session : remove_session,
    get_key : get_key,
    set_key : set_key,
    remove_key : remove_key
};