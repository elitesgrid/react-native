import {network_call} from '../NetworkCall.js';

async function get_live_classes(payload) {
    return await network_call("GET_LIVE_VIDEOS", payload);
}

async function get_recorded_classes(payload) {
    return await network_call("GET_RECORDED_CLASSES", payload);
}

async function update_video_time(payload) {
    return await network_call("MARK_COMPLETE_VIDEO", payload);
}

async function get_test_series(payload) {
    return await network_call("GET_TEST_SERIES", payload);
}

async function get_pdf(payload) {
    return await network_call("GET_PDF", payload);
}

async function mark_complete_pdf(payload){
    return await network_call("MARK_COMPLETE_PDF",payload);
}

async function get_notices(payload) {
    return await network_call("GET_NOTICES", payload);
}

async function generate_zoom_url(payload){
    return await network_call("GENERATE_ZOOM_PLAY_URL",payload);
}


export default  {
    get_live_classes,
    get_recorded_classes,
    update_video_time,
    get_test_series,
    get_pdf,
    mark_complete_pdf,
    get_notices,
    generate_zoom_url
};