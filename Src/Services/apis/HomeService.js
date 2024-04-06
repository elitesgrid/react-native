import {network_call} from '../NetworkCall.js';

async function get_home(payload) {
    return await network_call("GET_HOME", payload);
}

async function get_paper_detail(payload) {
    return await network_call("GET_SYLLABUS_DETAIL", payload);
}

async function get_course_detail(payload) {
    return await network_call("GET_COURSE_DETAIL", payload);
}

async function get_my_courses(payload) {
    return await network_call("GET_MY_COURSES", payload);
}

export default  {
    get_home,
    get_paper_detail,
    get_course_detail,
    get_my_courses
};