 
//import ZaloKit from 'react-native-zalo-kit';
import React from 'react';
import { NativeModules, Platform, Text, TouchableOpacity, View} from 'react-native';
import { } from 'react-native-permissions';
import  AsyncStorage  from '@react-native-community/async-storage';
//import Geolocation from 'react-native-geolocation-service';

//import {GoogleSignin} from '@react-native-google-signin/google-signin';
//import {Constants, getApplicationHashKey, login} from 'react-native-zalo-kit'

// import * as KakaoKit from '@react-native-seoul/kakao-login'
//import {AccessToken, LoginManager} from 'react-native-fbsdk-next';
// import {appleAuth} from '@invertase/react-native-apple-authentication';
import remoteConfig from '@react-native-firebase/remote-config';

import * as DeviceInfo from "react-native-device-info"

import Icon from 'react-native-vector-icons/FontAwesome';
import styles from "./styles"
import ProgressBar from "react-native-animated-progress"
import * as RNLocaize from "react-native-localize" 
import jwt_decode from 'jwt-decode';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import messaging from '@react-native-firebase/messaging';
import messages from "./messages"
import {android_client_id, appPrimaryColor, ios_client_id, web_client_id} from "../define/config";
import * as AppBadge from './badge_module'

const iconSize = 20
const normalColor = "#9e9e9e"
const selectedColor = "#0000ff"

const {BadgeModule} = NativeModules;

export const getItem = (icon, title, type = false) => {
    return <Icon name={icon} size={iconSize} color={type ? selectedColor : normalColor}></Icon>
}

export const LoadingIndicatorView = () => {
    return (<View style={{position: "relative", top: 0, left: 0, width: "100%", height: 2}}>
            <ProgressBar indeterminate  progress={100} height={2} backgroundColor= {appPrimaryColor}/>
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
    if (token != null) {
        token += ""
    }
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

export const getLastBade = async () => {
    let bade = (await AsyncStorage.getItem('bade')) || 0;
    return bade;
}
var setBagdeLx = false
export const setBade = async (number) => {
    let last = await getLastBade()
    if (last == number && setBagdeLx) {
        return false
    }
   /* if (Platform.OS == "ios") {
        PushNotificationIOS.setApplicationIconBadgeNumber(number * 1);
    } else {
     //   NativeModules.BadgeAndroid.setBadge(number * 1);
        
    }*/
    setBagdeLx = true
    AppBadge.setBadge(number)
    await AsyncStorage.setItem('bade', number + "");
    return true
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
    // return;
    // if (type == "F") { // facebook
    //     try {
    //         LoginManager.logInWithPermissions(["public_profile", "email"]).then(async function (result) {
    //             if (result.isCancelled) {
    //                 console.log("login is cancelled.");
    //                 excuteString("callbackLoginFail(`Login cancelled`)")
    //             } else {
    //                 AccessToken.getCurrentAccessToken().then((data) => {
    //                     let token = data.accessToken.toString()
    //                     console.log("token: " + token)
    //                     setTimeout(() => {
    //                         alert("token: ".token);
    //                         excuteString("callbackLoginSuccess(\"" + type + "\",`" + token + "`,``)")
    //                     }, 400);
    //                 })
    //             }
    //         }, function (error) {
    //             excuteString("callbackLoginFail(`" + error + "`)")
    //         });
    //     } catch (e) {
    //         excuteString("callbackLoginFail(`" + e + "`)")
    //     }
    // } else if (type == "G") { // Google
    //     GoogleSignin.configure({
    //         "webClientId": web_client_id,
    //         "androidClientId": android_client_id,
    //         "iosClientId": ios_client_id,
    //         scopes: ['email', 'profile']
    //     });

    //     try {
    //         await GoogleSignin.hasPlayServices();
    //         const userInfo = await GoogleSignin.signIn();

    //         var token = userInfo.idToken;
    //         var info = ""
    //         if (userInfo.user != null) {
    //             console.log(userInfo)
    //             info = `id:${userInfo.user.id}@@@email:${userInfo.user.email}@@@name:${userInfo.user.name}@@@photo:${userInfo.user.photo}`
    //         }
    //         setTimeout(() => {
    //             excuteString("callbackLoginSuccess(\"" + type + "\",`" + token + "`,`" + info + "`)")
    //         }, 400);
    //     } catch (e) {
    //         console.log(e)
    //         excuteString("callbackLoginFail(`" + e + "`)")
    //     }
    // } else if (type == "Z") {// zalo
    //      try {
    //          const data = await ZaloKit.login(ZaloKit.Constants.AUTH_VIA_APP_OR_WEB);
    //          const token = data.accessToken
    //          setTimeout(() => {
    //              excuteString("callbackLoginSuccess(\"" + type + "\",`" + token + "`,``)")
    //          }, 500);
    //      } catch (e) {
    //          excuteString("callbackLoginFail(`" + e + "`)")
    //      }
    // } else if (type == "K") {   // kakaotalk
    //     try {
    //         let key = await KakaoKit.login();
    //         let token = key.accessToken

    //         setTimeout(() => {
    //             excuteString("callbackLoginSuccess(\"" + type + "\",`" + token + "`,``)")
    //         }, 400);
    //     } catch (e) {
    //         console.log(e)
    //         excuteString("callbackLoginFail(`" + e + "`)")
    //     }
    // } else if (type == "A") {
    //     try {
    //         const appleAuthRequestResponse = await appleAuth.performRequest({
    //             requestedOperation: appleAuth.Operation.LOGIN,
    //             requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    //         });
    //         const credentialState = await appleAuth.getCredentialStateForUser(appleAuthRequestResponse.user);
    //         if (credentialState === appleAuth.State.AUTHORIZED) {
    //             // user is authenticated
    //             let token = appleAuthRequestResponse.identityToken
    //             const tokenDecoder = jwt_decode(appleAuthRequestResponse.identityToken)
    //             info = `email:${tokenDecoder.email}`
    //             setTimeout(() => {
    //                 console.log("callbackLoginSuccess(\"" + type + "\",`" + token + "`,`" + info + "`)")
    //                 excuteString("callbackLoginSuccess(\"" + type + "\",`" + token + "`,`" + info + "`)")
    //             }, 400);
    //         } else {
    //             excuteString("callbackLoginFail(`" + credentialState + "`)")
    //         }
    //     } catch (e) {
    //         console.log(e)
    //         excuteString("callbackLoginFail(`" + e + "`)")
    //     }
    // }
}

export const onQRScan = (webviewRef, navigation, params) => {
    navigation.push("QRCodeScreen", {
        params: params, onResult: (e) => {
            setTimeout(() => {
                console.log("=>>> callback ", "callbackQrcode(`" + e.data + "`,`" + params.gorupId + "`,`" + params.token + "`)")
                if ( webviewRef.current == null) {
                    console.log("=>>>>> qr code errorr")
                    return  
                }
                webviewRef.current && webviewRef.current.injectJavaScript("callbackQrcode(`" + e.data + "`,`" + params.groupId + "`,`" + params.token + "`)")
            }, 400);
        }
    })
}

export const requestLocation = () => {

     

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
        deviceID = DeviceInfo.getUniqueIdSync()
        console.log("deviceID", deviceID)
        model = DeviceInfo.getModel()
    } catch (e) {
       console.log("gET DEVICE ERROR", e)
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
    let location = {}

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
        deviceID = DeviceInfo.getUniqueIdSync() || ""
        model = DeviceInfo.getModel()

        console.log("deviceID", deviceID)
    } catch (e) {
        console.log("GET DEVICE ERROR", e)
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
        //   location = await requestLocation()
    } catch {

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
    lang = "ko"
    if (messages[lang] == null) {
        return text
    }
    return messages[lang][text] || text
}

export const setLanguage = async (language) => {
    global.language = language
    await AsyncStorage.setItem('language', language || "vi");
}

export const getLanguage = async () => {
    global.language = await AsyncStorage.getItem('language') || "vi";
    return global.language
}

export const setHideComunity = async (comunity) => {
    global.comunity = (comunity == "") ? false : true
    console.log("SET global.comunity", global.comunity, comunity)
    await AsyncStorage.setItem('comunity', comunity || "");
}

export const getHideComunity = async () => {
    global.comunity = await AsyncStorage.getItem('comunity') || "";
    console.log("GET global.comunity", global.comunity)
    if ( global.comunity == "" ) {
        global.comunity = false
    } else {
        global.comunity = true
    }
    return global.comunity
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



export const saveLastStoreId = async (token) => {
    global.userStoreId = token
    try {
        await AsyncStorage.setItem('userstoreid', (token || "") + "");
    } catch (error) {
    }
}

export const getLastStoreId = async () => {

    try {
        let token = await AsyncStorage.getItem('userstoreid');
        global.userStoreId = token
        return token
    } catch (error) {
    }
}

export const openSetting = async (webviewRef) => {  
   
}

export async function requestLocaitonPermision() {
 
}   


export async function setupRemoteConfig() {
    try {
        await remoteConfig().fetchAndActivate()
    } catch(e) {
        console.log("remoteConfig().get", e)
    }
    console.log(`remoteConfig().getString("review") `, remoteConfig().getString("review"))
    if (remoteConfig().getString("review") == "1.0.1"){
        setHideComunity("true")
    } else {
        setHideComunity("")
    } 
}