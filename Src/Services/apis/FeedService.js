import {network_call} from '../NetworkCall.js';

async function get_feed_list(payload) {
    return await network_call("GET_FEED_LIST", payload);
}


async function like_unlike_feed(payload) {
    return await network_call("LIKE_UNLIKE_FEED", payload);
}

async function post_feed(payload) {
    return await network_call("POST_FEED", payload);
}

async function get_feed_detail(payload) {
    return await network_call("GET_FEED_DETAIL", payload);
}

async function comment_feed(payload) {
    return await network_call("COMMENT_FEED", payload);
}

async function delete_post_comment(payload) {
    return await network_call("DELETE_POST_COMMENT", payload);
}

async function delete_feed(payload) {
    return await network_call("DELETE_FEED", payload);
}


async function get_feed_comments(payload) {
    return await network_call("GET_FEED_COMMENTS", payload);
}

async function delete_comment(payload) {
    return await network_call("DELETE_COMMENT", payload);
}
async function attempt_mcq(payload) {
    return await network_call("ATTEMPT_MCQ", payload);
}
async function hide_post(payload) {
    return await network_call("HIDE_POST", payload);
}

export default  {
    get_feed_list,
    post_feed,
    get_feed_detail,
    like_unlike_feed,
    comment_feed,
    delete_post_comment,
    delete_feed,
    get_feed_comments,
    delete_comment,
    attempt_mcq,
    hide_post
};