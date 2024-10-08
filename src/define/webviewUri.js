 
import { NativeModules} from 'react-native';
export const chat =  NativeModules.AppNativeModule.chat || "https://tamtalk.com/chat/"
export const membership = NativeModules.AppNativeModule.membership ||  "https://tamtalk.com/detective-membership/"
export const account = NativeModules.AppNativeModule.account ||  "https://tamtalk.com/detective-account/"
export const more = NativeModules.AppNativeModule.more ||  "https://tamtalk.com/detective-more/"
export const blog = NativeModules.AppNativeModule.blog ||  "https://tamtalk.com/blog/"
export const domain = NativeModules.AppNativeModule.domain ||  "tamtalk.com"
export const login = NativeModules.AppNativeModule.login ||  "https://tamtalk.com/detective-login/"
export const logout = NativeModules.AppNativeModule.logout ||  "https://tamtalk.com/logout"
export const environment = NativeModules.AppNativeModule.env; 
// /http://43.203.213.15/ 
