

  
import { NativeModules} from 'react-native';
 
export const login =  NativeModules.AppNativeModule.login ||  "https://tamtalk.com/login/"
export const detective = NativeModules.AppNativeModule.detective ||  "https://tamtalk.com/detective/"
export const message = NativeModules.AppNativeModule.message ||   "https://tamtalk.com/chat/"
export const blog = NativeModules.AppNativeModule.blog ||  "https://tamtalk.com/blog/"
export const more = NativeModules.AppNativeModule.more ||   "https://tamtalk.com/more/" 
export const domain =  NativeModules.AppNativeModule.domain ||  "https://tamtalk.com"


export const environment = NativeModules.AppNativeModule.env;