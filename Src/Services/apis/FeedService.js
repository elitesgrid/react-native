import {network_call} from '../NetworkCall.js';

async function get_feed_list(payload) {
    return await network_call("GET_FEED_LIST", payload);
}

export default  {
    get_feed_list
};