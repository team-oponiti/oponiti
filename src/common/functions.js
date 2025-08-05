/* eslint-disable react/self-closing-comp */
/* eslint-disable prettier/prettier */

// import ZaloKit from 'react-native-zalo-kit';
import React from 'react';
import { NativeModules, Platform, Text, TouchableOpacity, View, PermissionsAndroid, Clipboard} from 'react-native';
import AsyncStorage from "@react-native-community/async-storage"
import {GoogleSignin} from '@react-native-google-signin/google-signin';
// import {Constants, getApplicationHashKey, login} from 'react-native-zalo-kit'

// import * as KakaoKit from '@react-native-seoul/kakao-login'
// import {AccessToken, LoginManager} from 'react-native-fbsdk-next';
import {appleAuth} from '@invertase/react-native-apple-authentication';

import * as DeviceInfo from "react-native-device-info"  
 
import Icon from 'react-native-vector-icons/FontAwesome';
import styles from "./styles"
import ProgressBar from "react-native-animated-progress"
import * as RNLocaize from "react-native-localize"
import Geolocation from '@react-native-community/geolocation';
import jwt_decode from 'jwt-decode';
// import PushNotificationIOS from '@react-native-community/push-notification-ios';
// import messaging from '@react-native-firebase/messaging';
import messages from "./messages"
import {android_client_id, ios_client_id, web_client_id} from "../define/config";
 
import PushNotification, {Importance} from "react-native-push-notification";
import { openSettings, PERMISSIONS, request } from 'react-native-permissions';

const iconSize = 20
const normalColor = "#9e9e9e"
const selectedColor = "#0000ff"

const {BadgeModule} = NativeModules;
export const getDeviceLanguage =  () => {
   
    try {
        const deviceLanguage =  Platform.OS === 'ios'
      ? NativeModules.SettingsManager.settings.AppleLocale ||
        NativeModules.SettingsManager.settings.AppleLanguages[0] // iOS 13
      : NativeModules.I18nManager.localeIdentifier;

      if (deviceLanguage == null) {
        return null
      }

      return convertLanguage(deviceLanguage)
    } catch(e) {
   console.log("Error language ", e)
   return null;
    }
}
export const getItem = (icon, title, type = false) => {
    return <Icon name={icon} size={iconSize} color={type ? selectedColor : normalColor}></Icon>
}

export const LoadingIndicatorView = () => {
    return (<View style={{position: "relative", top: 0, left: 0, width: "100%", height: 2}}>
            <ProgressBar useNativeDriver={true} progress={100} height={2} backgroundColor="#00C271"/>
        </View>);
}

export const renderTabarItem = (item, index, selected = true, onTouch = null) => {
    return <TouchableOpacity
        onPress={() => (onTouch && onTouch(item, index))}
        key={index} style={styles.tabarItemContainer}>
        {item[selected ? "active" : "normal"].icon}
        <Text style={{textAlign: "center",}}>{item[selected ? "active" : "normal"].title}</Text>
    </TouchableOpacity>
}

export const onMessage = (message) => {
    return JSON.parse(message)
}

export const saveLastToken = async (token) => {
    global.userToken = token
    try {
        await AsyncStorage.setItem('usertoken', token || "");
    } catch (error) {
    }
}

export const getLastToken = async () => {

    try {
        let token = await AsyncStorage.getItem('usertoken');
        global.userToken = token
        return token
    } catch (error) {
    }
}

export const saveRefreshToken = async (token) => {
    global.refreshToken = token
    try {
        await AsyncStorage.setItem('refresh_token', token || "");
    } catch (error) {
    }
}

export const getRefreshToken = async () => {

    try {
        let token = await AsyncStorage.getItem('refresh_token');
        global.refreshToken = token
        return token
    } catch (error) {
    }
}


export const getLastBade = async () => {
    let bade = (await AsyncStorage.getItem('bade')) || 0;
    return bade;
}

export const copyClipboard = async (text) => {
    
    try {
        Clipboard.setString(text);
    } catch(e) {
        console.log(e)
    }
}
export const setBade = async (number) => {
    if (Platform.OS == "ios") {
      //  PushNotificationIOS.setApplicationIconBadgeNumber(number * 1);
    } else {
      //  NativeModules.BadgeAndroid.setBadge(number * 1);

    }
    await AsyncStorage.setItem('bade', number + "");

}

export const getTabBadge = async (tab) => {
    let bade = (await AsyncStorage.getItem('bade_' + tab)) || null;
    if (bade == "null") {
        bade = null
    }
    return bade
}

export const setTabBadge = async (tab, number) => {
    if (number == null || number == "null") {
        number = 0
    }
    await AsyncStorage.setItem('bade_' + tab, number + "");
}

export const socialLogin = async (type, webviewRef) => {
    const excuteString = (str) => {
        console.log(str)
        webviewRef.current && webviewRef.current.injectJavaScript(str)
    }
    if (type == "F") { // facebook
        // try {
        //     LoginManager.setTabBadge
        //     LoginManager.logInWithPermissions(["public_profile", "email"]).then(async function (result) {
        //         if (result.isCancelled) {
        //             console.log("login is cancelled.");
        //             excuteString("callbackLoginFail(`Login cancelled`)")
        //         } else {
        //             AccessToken.getCurrentAccessToken().then((data) => {
        //                 let token = data.accessToken.toString()
        //                 console.log("--- facebook token: " + token)
        //                 setTimeout(() => {
        //                     excuteString("callbackLoginSuccess(\"" + type + "\",`" + token + "`,``)")
        //                 }, 400);
        //             })
        //         }
        //     }, function (error) {
        //         console.log("--- facebook error:" + error)
        //         excuteString("callbackLoginFail(`" + error + "`)")
        //     });
        // } catch (e) {
        //     console.log("--- facebook error:" + error)
        //     excuteString("callbackLoginFail(`" + e + "`)")
        // }
    } else if (type == "G") { // Google
        GoogleSignin.configure({
            "webClientId": "317564366281-fhielplqjml2ue2fhhe1m82djfo01jve.apps.googleusercontent.com", 
            scopes: ['email', 'profile']
        });

        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();

            var token = userInfo.idToken;
            var info = ""
            if (userInfo.user != null) {
                console.log(userInfo)
                info = `id:${userInfo.user.id}@@@email:${userInfo.user.email}@@@name:${userInfo.user.name}@@@photo:${userInfo.user.photo}`
            }
            setTimeout(() => {
                excuteString("callbackLoginSuccess(\"" + type + "\",`" + token + "`,`" + info + "`)")
            }, 400);
        } catch (e) {
            console.log(e)
            excuteString("callbackLoginFail(`" + e + "`)")
        }
    } else if (type == "Z") {// zalo
        //  try {
        //      const data = await ZaloKit.login(ZaloKit.Constants.AUTH_VIA_APP_OR_WEB);
        //      const token = data.accessToken
        //      setTimeout(() => {
        //          excuteString("callbackLoginSuccess(\"" + type + "\",`" + token + "`,``)")
        //      }, 500);
        //  } catch (e) {
        //      excuteString("callbackLoginFail(`" + e + "`)")
        //  }
    } else if (type == "K") {   // kakaotalk
        try {
            let key = await KakaoKit.login();
            let token = key.accessToken

            setTimeout(() => {
                excuteString("callbackLoginSuccess(\"" + type + "\",`" + token + "`,``)")
            }, 400);
        } catch (e) {
            console.log(e)
            excuteString("callbackLoginFail(`" + e + "`)")
        }
    } else if (type == "A") {
        try {
            const appleAuthRequestResponse = await appleAuth.performRequest({
                requestedOperation: appleAuth.Operation.LOGIN,
                requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
            });
            const credentialState = await appleAuth.getCredentialStateForUser(appleAuthRequestResponse.user);
            if (credentialState === appleAuth.State.AUTHORIZED) {
                // user is authenticated
                let token = appleAuthRequestResponse.identityToken
                const tokenDecoder = jwt_decode(appleAuthRequestResponse.identityToken)
                info = `email:${tokenDecoder.email}`
                setTimeout(() => {
                    console.log("callbackLoginSuccess(\"" + type + "\",`" + token + "`,`" + info + "`)")
                    excuteString("callbackLoginSuccess(\"" + type + "\",`" + token + "`,`" + info + "`)")
                }, 400);
            } else {
                excuteString("LoginFail(`" + credentialState + "`)")
            }
        } catch (e) {
            console.log(e)
            excuteString("callbackLoginFail(`" + e + "`)")
        }
    }
}

export const onQRScan = (webviewRef, navigation, params) => {
    navigation.push("QrcodeScreen", {
        params: params, onResult: (e) => {
            setTimeout(() => {
                console.log("=>>> callback ", "callbackQrcode(`" + e.data + "`,`" + params.gorupId + "`,`" + params.token + "`)")
                webviewRef.current && webviewRef.current.injectJavaScript("callbackQrcode(`" + e.data + "`,`" + params.groupId + "`,`" + params.token + "`)")
            }, 400);
        }
    })
}

export const requestLocation = () => {

    return new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(info => {
            try {
                let lat = info.coords.latitude
                let lng = info.coords.longitude
                if (lat != null && lng != null ) {
                    global.cacheLocation = {lat, lng};
                    setLastLocation( {lat, lng} )
                } 
                resolve({lat, lng})
            } catch {
                resolve({})
            }
        }, () => {
            resolve({})
        })
    })

}

export const getDeviceInfoPM = () => {

    var name = ""
    var appVersion = ""
    var buildNumber = ""
    var osVerison = ""
    var deviceID = ""
    var model = ""

    try {
        name = DeviceInfo.getApplicationName()
        appVersion = DeviceInfo.getVersion()
        buildNumber = DeviceInfo.getBuildNumber()
        osVerison = DeviceInfo.getSystemVersion()
        deviceID = DeviceInfo.getDeviceId()
        model = DeviceInfo.getModel()
    } catch (e) {
        alert(e)
    }

    let osName = Platform.OS
    let osType = (Platform.OS == "android") ? "A" : "I"

    let timeZone = ""
    let country = ""
    try {
        timeZone = RNLocaize.getTimeZone()
        country = RNLocaize.getCountry()
    } catch {

    }

    let language = global.language
    let userToken = global.userToken
    let pushToken = global.pushToken
    let location = global.cacheLocation  || {}

    let data = {
        appName: name,
        appVersionCode: buildNumber,
        appVersionName: appVersion,
        osName: osName,
        osType: osType,
        lat: location.lat + "",
        lng: location.lng + "",
        deviceId: deviceID,
        language: language,
        country: country,
        userToken: userToken,
        osVersion: osVerison,
        pushToken: pushToken,
        deviceModel: model,
        timeZone: timeZone
    }

    return data
}

const tryGetToken = async () => {
    try {
        if (global.userToken == null) {
            global.userToken = await getLastToken() || ""
        }
    } catch {
    }

    try {
        if (global.pushToken == null) {
            global.pushToken = await messaging().getToken();
        }
    } catch {
    }
}

export const getDeviceInfo = async (webview) => {

    await tryGetToken()

    var name = ""
    var appVersion = ""
    var buildNumber = ""
    var osVerison = ""
    var deviceID = ""
    var model = ""

    try {
        name = DeviceInfo.getApplicationName()
        appVersion = DeviceInfo.getVersion()
        buildNumber = DeviceInfo.getBuildNumber()
        osVerison = DeviceInfo.getSystemVersion()
        deviceID = DeviceInfo.getDeviceId()
        model = DeviceInfo.getModel()
    } catch (e) {
        alert(e)
    }

    let osName = Platform.OS
    let osType = (Platform.OS == "android") ? "A" : "I"

    let timeZone = ""
    let country = ""
    try {
        timeZone = RNLocaize.getTimeZone()
        country = RNLocaize.getCountry()
    } catch {

    }

    let language = global.language
    let userToken = global.userToken || "Token not found"
    let pushToken = global.pushToken || "Token not found"
    let location = {}

    try {
        console.log("========>>>>> REQUEST PERMISSION " );
       // let x =  await requestLocaitonPermision()
       // console.log("========>>>>> " + x);
        if (global.cacheLocation != null) {
        //  requestLocation() 
            location = global.cacheLocation
        }
        else {
          //  location = await requestLocation() 
        }
    } catch (e) {
        console.log("========>>>>> " + e);
    }

    let data = {
        appName: name,
        appVersionCode: buildNumber,
        appVersionName: appVersion,
        osName: osName,
        osType: osType,
        lat: location.lat + "",
        lng: location.lng + "",
        deviceId: deviceID,
        language: language,
        country: country,
        userToken: userToken,
        osVersion: osVerison,
        pushToken: pushToken,
        deviceModel: model,
        timeZone: timeZone
    }
    console.log(data)
    try {
        if (webview != null) {
            let script = ` 
                function applyConfig () {
                    message = ${JSON.stringify(data)}
                    if (window.appBridge == null){
                        setTimeout(function(){
                            applyConfig()
                        },1000)
                    } else { 
                        window.kma = message
                    }
                }
                applyConfig()  `
            await webview.injectJavaScript(script)
        }
    } catch (e) {
        console.log(e)
    }
    return data
}

export const getText = (text, lang) => {
    //if (messages[lang] == null) {
        return messages["ko"][text]  || text
  //  }
    //return messages[lang][text] || text
}

export const setLanguage = async (language) => {
    global.language = convertLanguage(language)
    await AsyncStorage.setItem('language', language || getDeviceLanguage() || "ko");
}

export const getLanguage = async () => {
    // global.language = convertLanguage(await AsyncStorage.getItem('language') || getDeviceLanguage()  || "ko");
    // return global.language
    return "ko"
}

export const convertLanguage = (language) => {
    if (language == null){
        return "ko"
    }
   if (language.startsWith("en")) {
        return "en"  
    } else if (language.startsWith("ko")) {
    return "ko"
    } else {
    return "en"
    }
}



export const setLastLocation = async (locationData) => {
   try {
    await AsyncStorage.setItem('location', JSON.stringify(locationData));
   } catch (e) {

   }
}

export const getLastLocation = async () => {
    var data = await AsyncStorage.getItem('location');
    if ( data == null) {
        return null
    }
    try {
        return JSON.parse(data)
    } catch(e) {
        return null;
    } 
}


export const saveCookie = async (cookie) => {

    console.log("GiayNhap ====== save cokie ====== ", cookie)
    if (global.cookie == cookie) {
        return
    }
    await AsyncStorage.setItem('cookie', cookie || "");
    global.cookie = cookie
}

export const getSaveCookie = async () => {
    console.log("GiayNhap ====== get cokie ====== ")
    global.cookie = await AsyncStorage.getItem('cookie') || "";

    var location =  await getLastLocation();
    if (location != null) {
        global.cacheLocation = location;
    }
    return global.cookie
}

export const jsonCookiesToCookieString = (json) => {

    let cookiesString = '';
    try {
        for (let [key, value] of Object.entries(json)) {
            cookiesString += `${key}=${value.value}; `;
        }
    } catch (E) {

    }
    return cookiesString;
};

export async function requestLocaitonPermision() {
    console.log("requestLocaitonPermision")
    if (Platform.OS == "android") {
        await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS, 
          )
    }   
   try {
    if (Platform.OS == "android") {
    //    return  await PermissionsAndroid.request(
    //         PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, 
    //       )
     var permission =   PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        return await request(permission) 
    } else {
        var permission =   PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        return await request(permission) 
        
    }
    
   } catch (e) {
    
   }

}

export const openSetting = async (webviewRef) => {  

    openSettings() 
}


export const jsonSaveData = async (data) => {
    await AsyncStorage.setItem('jsondata', data);
}

export const jsonReadData = async (data) => {
    return  await AsyncStorage.getItem('jsondata') || "";
}

export const createChannel = () => { 
    try {
     PushNotification.createChannel(
         {
           channelId: "app_custom_channel", 
           channelName: "App Notification", 
           channelDescription: "App Custom Notification", 
           playSound: true, 
          // soundName: "sound.wav", 
           importance: Importance.HIGH,  
           vibrate: true,  
         },
         (created) => console.log(`createChannel returned '${created}'`)  
       );
    }catch(e){
 
     console.log("ALER!!!!")
     console.log(e)
    }
 }