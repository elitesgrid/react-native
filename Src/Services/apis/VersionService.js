import {network_call} from '../NetworkCall.js';

async function get_version(payload) {
  return await network_call('GET_VERSION', payload);
}

export default {
  get_version,
};
