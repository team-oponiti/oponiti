
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { NativeModules, Platform} from 'react-native';

const {BadgeModule} = NativeModules;

/**
 * 
 * @param {number} value 
 */
export const setBadge = (value) => {
    if (Platform.OS == "ios") {
        PushNotificationIOS.setApplicationIconBadgeNumber( value * 1)
    } else {
        console.log("set badge ", BadgeModule.setBadge)
        BadgeModule.setBadge(value * 1)
    }
}