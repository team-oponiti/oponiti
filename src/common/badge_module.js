
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
        BadgeModule.setBadge(value * 1)
    }
}

export const clearBadge = () => {
    if (Platform.OS == "ios") {
        PushNotificationIOS.setApplicationIconBadgeNumber(0)
    } else { 
     BadgeModule.clearBadge()
    }
}