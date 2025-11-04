// services/api-list.js

//const jwtDecode = require('jwt-decode');
import axios from 'axios';
import StorageManager from './StorageManager';
import envVariables from '../Constants/envVariables';
import {Alert} from 'react-native';
import RNRestart from 'react-native-restart';

//const {reload_window} = require('../main/app-process.js');

const api_list = {
  GET_VERSION: 'version/get_version',
  LOGIN_AUTH: 'user/login',
  FORGOT_PASSWORD: 'user/forgot_password',
  REGISTRATION: 'user/registration',
  UPDATE_PASSWORD: 'user/change_password',
  DELETE_ACCOUNT: 'user/de_activate_account',
  GET_HOME: 'home/get_home',
  GET_SYLLABUS_DETAIL: 'courses/get_syllabus',
  GET_COURSE_DETAIL: 'courses/get_course_detail',
  GET_MY_COURSES: 'user/get_my_course',
  GET_LIVE_VIDEOS: 'windows/live_classes',
  GET_RECORDED_CLASSES: 'windows/get_recorded_classes',
  MARK_COMPLETE_VIDEO: 'courses/update_watch_time',
  GET_TEST_SERIES: 'windows/get_test_series',
  GET_TEST_INSTRUCTIONS: 'test/instruction_test',
  GET_TEST_DETAIL: 'test/get_detail_test',
  SUBMIT_TEST_DETAIL: 'test/submit_detail_test',
  GET_TEST_RESULT: 'test/result_test',
  GET_RANKERS: 'test/get_rankers',
  GET_BOOKMARKED_QUESTIONS: 'test/get_bookmarked_questions',
  REMOVE_BOOKMARKED_QUESTIONS: 'test/manage_bookmark',
  GET_NOTIFICATION: 'courses/get_notifications',
  READ_NOTIFICATION: 'user/read_notification',
  GET_NOTICES: 'courses/get_notices',
  GET_TIMELINE: 'courses/get_timeline',

  GET_PDF: 'windows/get_pdf',
  GENERATE_ZOOM_PLAY_URL: 'windows/ajax_generate_zoom_play_url',
  MARK_COMPLETE_PDF: 'courses/save_pdf_log',

  GET_FEED_LIST: 'feeds/get_post_list',
  POST_FEED: 'feeds/post_feed',
  GET_FEED_DETAIL: 'feeds/get_feed_detail',
  LIKE_UNLIKE_FEED: 'feeds/like_unlike_feed',
  COMMENT_FEED: 'feeds/comment_feed',
  DELETE_FEED: 'feeds/delete_feed',
  GET_FEED_COMMENTS: 'feeds/get_feed_comments',
  DELETE_COMMENT: 'feeds/delete_comment',
  ATTEMPT_MCQ: 'feeds/attempt_mcq',
  HIDE_POST: 'feeds/hide_post',

  UPLOAD_GENERATE_PRESIGNED_URL: 'windows/upload_generate_presigned_url'
};

async function network_call(API, payload) {
  let user_id = 0;
  let last_login = 0;
  let session = await StorageManager.get_session();
  if (Object.keys(session).length > 0) {
    user_id = session.id;
    last_login = session.last_login;
  }

  const refreshOptions = {
    method: 'POST',
    url: envVariables.BASE_URL + api_list[API],
    headers: {
      //'content-type': 'application/json',
      'Content-Type': 'multipart/form-data',
      Userid: user_id,
      LastLogin: last_login,
      Devicetype: envVariables.DEVICE_TYPE,
      Lang: '1',
      Version: envVariables.VERSION,
      Authorization: 'Bearer ' + envVariables.BEARER_TOKEN,
    },
  };
  Object.keys(payload).length > 0 ? (refreshOptions.data = payload) : '';
  console.log(refreshOptions.headers);
  // console.log(payload);

  try {
    const response = await axios(refreshOptions);
    // console.log(response);
    if (response.status === 200) {
      let _return = response.data;
      // console.log(refreshOptions);
      //console.log(_return);
      if (_return.auth_code !== undefined && _return.auth_code === '100100') {
        await StorageManager.remove_key('JWT');
        await StorageManager.remove_session();
        RNRestart.Restart();
      }
      if (_return.message && _return.message.includes('required')) {
        Alert.alert('Server says', _return.message);
      }
      return _return;
    } else {
      Alert.alert('Server says', response.data);
    }
  } catch (error) {
    console.log("API Call:",API);
    console.log('Error:', error?.message || error);
    if (error?.message === 'Network Error' || error?.code === 'ERR_NETWORK') {
      return {
        status: false,
        message:
          'No internet connection found. Please check ethernet cable or wifi is correctly connected.',
        data: {},
      };
    } else {
      return {
        status: false,
        message: 'API Error. Throwing exception.',
        data: {},
      };
    }
    //throw error;
  }
}

module.exports = {
  network_call,
};
