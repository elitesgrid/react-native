import {network_call} from '../NetworkCall.js';

async function get_instructions(payload) {
  return await network_call('GET_TEST_INSTRUCTIONS', payload);
}
async function get_test_detail(payload) {
  return await network_call('GET_TEST_DETAIL', payload);
}

async function get_bookmarked_question(payload) {
  return await network_call('GET_BOOKMARKED_QUESTIONS', payload);
}

async function remove_bookmarked_question(payload) {
  return await network_call('REMOVE_BOOKMARKED_QUESTIONS', payload);
}

async function submit_test_detail(payload) {
  return await network_call('SUBMIT_TEST_DETAIL', payload);
}

async function get_test_result(payload) {
  return await network_call('GET_TEST_RESULT', payload);
}

export default {
  get_instructions,
  get_test_detail,
  get_bookmarked_question,
  remove_bookmarked_question,
  submit_test_detail,
  get_test_result
};
