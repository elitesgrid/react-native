import { Platform } from "react-native";
import DeviceInfo from 'react-native-device-info';

export default {
    BASE_URL: 'https://www.elitesgrid.com/api/',
    BASE_URL_WEB: "https://www.elitesgrid.com/",
    BEARER_TOKEN: "21*dNerglnw3@@OI)30@I*Dm'@@",
    VERSION: Platform.OS === "ios" ? DeviceInfo.getVersion() : DeviceInfo.getBuildNumber(),
    DEVICE_TYPE: Platform.OS === "ios" ? "2" : "1",
    CRYPT_KEY: "%!F*&^$)_*%3f&B+",
    PRIVACY_POLICY_URL: "https://www.elitesgrid.com/index.php/web/home/terms_condition?is_mobile=1",
    STORE_LINK: Platform.OS === 'ios' ? 'https://apps.apple.com/app/id6499076715': 'https://play.google.com/store/apps/details?id=com.elearning.elite',
    STORE_LINK_ZOOM: Platform.OS === 'ios' ? 'https://apps.apple.com/app/id546505307': 'https://play.google.com/store/apps/details?id=us.zoom.videomeetings'
}