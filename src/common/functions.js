 
// import ZaloKit from 'react-native-zalo-kit';
import React, { Node, useCallback, useEffect, useRef, useState } from 'react';
 
import {NativeModules, TouchableOpacity,  Image, Platform, SafeAreaView, KeyboardAvoidingView, StatusBar, Animated, Text, Easing , StyleSheet, View, Dimensions, PermissionsAndroid } from 'react-native';

import AsyncStorage from "@react-native-community/async-storage"
// import {GoogleSignin} from '@react-native-google-signin/google-signin';
// import {Constants, getApplicationHashKey, login} from 'react-native-zalo-kit'

import * as KakaoKit from '@react-native-seoul/kakao-login'
//import {AccessToken, LoginManager} from 'react-native-fbsdk-next';
import {appleAuth} from '@invertase/react-native-apple-authentication';

import * as DeviceInfo from "react-native-device-info"  

import { request, PERMISSIONS, openSettings , checkLocationAccuracy, requestLocationAccuracy} from 'react-native-permissions';
import Icon from 'react-native-vector-icons/FontAwesome';
import styles from "./styles"
import ProgressBar from "react-native-animated-progress"
import * as RNLocaize from "react-native-localize"
 
import jwt_decode from 'jwt-decode';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import messaging from '@react-native-firebase/messaging';
import messages from "./messages"
import { appPrimaryColor } from '../define/config';
import PushNotification, {Importance} from "react-native-push-notification";

import * as AppBadge from './badge_module'
import NaverLogin from '@react-native-seoul/naver-login';
const iconSize = 20
const normalColor = "#9e9e9e"
const selectedColor = "#0000ff"

const {BadgeModule} = NativeModules;

export const getItem = (icon, title, type = false) => {
    return <Icon name={icon} size={iconSize} color={type ? selectedColor : normalColor}></Icon>
}

export const LoadingIndicatorView = () => {
    return (<View style={{position: "relative", top: 0, left: 0, width: "100%", height: 2}}>
            <ProgressBar useNativeDriver={true} progress={100} height={2} backgroundColor={appPrimaryColor}/>
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
        await AsyncStorage.setItem('usertoken', String(token));
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
    setBagdeLx = true
    AppBadge.setBadge( number * 1)
    await AsyncStorage.setItem('bade', number + ""); 
    return true
}
export const clearBadge = async () => {
    AppBadge.clearBadge();
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
        /*try {
            LoginManager.setTabBadge
            LoginManager.logInWithPermissions(["public_profile", "email"]).then(async function (result) {
                if (result.isCancelled) {
                    console.log("login is cancelled.");
                    excuteString("callbackLoginFail(`Login cancelled`)")
                } else {
                    AccessToken.getCurrentAccessToken().then((data) => {
                        let token = data.accessToken.toString()
                        console.log("--- facebook token: " + token)
                        setTimeout(() => {
                            excuteString("callbackLoginSuccess(\"" + type + "\",`" + token + "`,``)")
                        }, 400);
                    })
                }
            }, function (error) {
                console.log("--- facebook error:" + error)
                excuteString("callbackLoginFail(`" + error + "`)")
            });
        } catch (e) {
            console.log("--- facebook error:" + error)
            excuteString("callbackLoginFail(`" + e + "`)")
        }*/
    } 
    // else if (type == "G") { // Google
    //     GoogleSignin.configure({
    //         "webClientId": "1000680627502-q1u6ck9erfndnqfbth67lvepqm8avd8c.apps.googleusercontent.com", 
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
    // } 
    // else if (type == "Z") {// zalo
    //      try {
    //          const data = await ZaloKit.login(ZaloKit.Constants.AUTH_VIA_APP);
    //          const token = data.accessToken
    //          setTimeout(() => {
    //              excuteString("callbackLoginSuccess(\"" + type + "\",`" + token + "`,``)")
    //          }, 500);
    //      } catch (e) {
    //          excuteString("callbackLoginFail(`" + e + "`)")
    //      }
    // }
    else if (type == "N") {
        const { failureResponse, successResponse } = await NaverLogin.login();

        console.log(failureResponse, successResponse)
        if (failureResponse != null) {
            excuteString("callbackLoginFail(`" + JSON.stringify(failureResponse) + "`)")
            return 
        }


        let accessToken =  successResponse.accessToken
        excuteString("callbackLoginSuccess(\"" + type + "\",`" + accessToken + "`,`tokenType:" + successResponse.tokenType + "`)")


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
    } 
    else if (type == "A") {
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
                let info = `email:${tokenDecoder.email}`
                setTimeout(() => {
                    console.log("callbackLoginSuccess(\"" + type + "\",`" + token + "`,`" + info + "`)")
                    excuteString("callbackLoginSuccess(\"" + type + "\",`" + token + "`,`" + info + "`)")
                }, 400);
            } else {
                excuteString("callbackLoginFail(`" + credentialState + "`)")
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
        global.userToken = await getLastToken() || ""
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
        deviceID = DeviceInfo.getUniqueIdSync()
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
     
        //location = await requestLocation()
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
    await AsyncStorage.setItem('language', language || "ko");
}

export const getLanguage = async () => {
    global.language = await AsyncStorage.getItem('language') || "ko";
    console.log("read lang" + global.language);
    return global.language
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

export async function requestLocaitonPermision() {
    var permission = (Platform.OS == "android") ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
     return await request(permission) 
}   

export const openSetting = async (webviewRef) => {  

    openSettings() 
}


export const createChannel = () => { 
   try {
    PushNotification.createChannel(
        {
          channelId: "app_custom_channel", 
          channelName: "App Notification", 
          channelDescription: "App Custom Notification", 
          playSound: true, 
          soundName: "sound.wav", 
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

 export const WEBLoading = ({
    logo,
    i1,
    i2, 
    i3
 }) => {

       
           const [startAnimation, setStartAnimation] = React.useState();
       
           const animationRef = useRef(new Animated.Value(0)).current;
           const animationRef2 = useRef(new Animated.Value(0)).current;
        
           const easingFunction = startAnimation ? Easing.inOut(Easing.linear) : Easing.out(Easing.linear);
        
            useEffect(()=>{
                Animated.timing(animationRef, {
                    toValue: -828 ,  
                    duration: 40000,  
                    easing: easingFunction,  
                    useNativeDriver: true, 
                  }).start();
            }, [animationRef, startAnimation])
            useEffect(()=>{
                Animated.timing(animationRef2, {
                    toValue: 830 ,  
                    duration: 40000,  
                    easing: easingFunction,  
                    useNativeDriver: true, 
                  }).start();
            }, [animationRef2, startAnimation])
            

        const windowWidth = Dimensions.get('window').width;
        const windowHeight = Dimensions.get('window').height;
     
        return <View style={[styles.flexContainer, {
            justifyContent: 'center',
            alignContent: 'center',
            alignItems: 'center',
            backgroundColor: "#DCF1F5",
            paddingBottom: 5 / 100 * windowHeight,
            // position: 'absolute',
            left: 0,
            top: 0,
            height: windowHeight,
            width: '100%'
        }]}>
            <Image 
            style={{ width: 105, height: 90, resizeMode: 'contain', marginBottom: 20 }} 
            source={logo}
            ></Image>
            <Text
                style={{
                    fontSize: 20,
                    fontWeight: 'semibold',
                    color:"black"
                }}
            >전문가가 필요한 순간, 똑똑</Text>
            
            <View style={{
                marginTop: 60,
                position: 'relative',
                height: 200,
                width: windowWidth
            }}>
               

 <Animated.View style={{ transform: [{ translateX: animationRef }], position: 'relative', width: 830 * 2, height: 64}}>
            <Image style={{
                                left: 0,
                                top: 0,
                                width: 836, 
                                height: 64, 
                                resizeMode: 'cover',
                                position: 'absolute' }} source={i1}></Image> 

            <Image style={{
                                left: 846,
                                top: 0,
                                width: 836, 
                                height: 64, 
                                resizeMode: 'cover',
                                position: 'absolute' }} source={i1}></Image> 
    </Animated.View>


    <Animated.View style={{ transform: [{ translateX: animationRef2 }], position: 'relative', width: 828 * 2, height: 64, top: 20}}>
    <Image style={{
         top: 0,
                     left: 0, 
                      width: 828, 
                      height: 64, 
                     resizeMode: 'cover',
                      position: 'absolute' }} source={i2}></Image> 

<Image style={{
    top: 0,
                     left: -838, 
                      width: 828, 
                      height: 64, 
                     resizeMode: 'cover',
                      position: 'absolute' }} source={i2}></Image> 
    </Animated.View> 


            </View> 
                <Image source={i3} style={{
                    position: 'absolute',
                    width: 500,
                    height: 500,
                    top: windowHeight - 140,
                }}></Image> 
        </View>
    }


 var webview;

 export const getCurrentWebview = () => {
    return webview
 }

 export const setCurrentWebview = (v) => {
    webview  = v
 }