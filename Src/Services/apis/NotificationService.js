import {network_call} from '../NetworkCall.js';

async function get_notifications(payload) {
    return await network_call("GET_NOTIFICATION", payload);
}

async function read_notifications(payload) {
    return await network_call("READ_NOTIFICATION", payload);
}

export default  {
    get_notifications,
    read_notifications
};