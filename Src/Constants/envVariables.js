import { Platform } from "react-native";
import VersionInfo from 'react-native-version-info';

export default {
    BASE_URL: 'https://www.elitesgrid.com/api/',
    BASE_URL_WEB: "https://www.elitesgrid.com/",
    BEARER_TOKEN: "21*dNerglnw3@@OI)30@I*Dm'@@",
    VERSION: VersionInfo.buildVersion,
    DEVICE_TYPE: Platform.OS === "ios" ? "2" : "1",
    CRYPT_KEY: "%!F*&^$)_*%3f&B+",
    PRIVACY_POLICY_URL: "https://www.elitesgrid.com/index.php/web/home/terms_condition?is_mobile=1",
    DELETE_ACCOUNT_URL: "https://www.elitesgrid.com/index.php/web/contact/delete"
}