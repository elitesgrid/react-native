import {network_call} from '../NetworkCall.js';

async function get_instructions(payload) {
    return await network_call("GET_TEST_INSTRUCTIONS", payload);
}
async function get_test_detail(payload) {
    return await network_call("GET_TEST_DETAIL", payload);
}

module.exports = {
    get_instructions,
    get_test_detail
};