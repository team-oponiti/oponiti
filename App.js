/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { Node, useCallback, useEffect, useRef, useState } from 'react'
import { AppState, Image, Platform, SafeAreaView, KeyboardAvoidingView, StatusBar, Animated, Text, Easing , StyleSheet, View, Dimensions, PermissionsAndroid } from 'react-native';
import { domain } from "./src/define/webviewUri"

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createNativeStackNavigator } from 'react-native-screens/native-stack';

import {
    getLastBade,
    getLastToken,
    getSaveCookie,
    jsonCookiesToCookieString,
    saveLastToken, setBade,
    getLanguage,
    getDeviceInfo,
    getTabBadge,
    createChannel,
    WEBLoading
} from "./src/common/functions"

import { request, PERMISSIONS } from 'react-native-permissions';
// import {GoogleSignin} from '@react-native-google-signin/google-signin';
import DashboardScreen from './src/screen/DashboardScreen';
import WebviewScreen from './src/screen/WebviewScreen';
import CookieManager from "@react-native-cookies/cookies";
// import {login} from "react-native-zalo-kit";
import messaging from '@react-native-firebase/messaging';

import { useGlobalAppLifeState, useGlobalBade, useGlobalLanguage } from "./src/common/globalState"
import * as urlconfigs from "./src/define/webviewUri"
import { appPrimaryColor } from './src/define/config';
import WebViewWithBackButton from './src/screen/WebViewWithBackButton';
import NaverLogin from '@react-native-seoul/naver-login';


const consumerKey = 'PjFvTuK2e1I_VvKLOg9v';
const consumerSecret = '3mdLXbwDAv';
const appName = 'ddokddok';
const serviceUrlSchemeIOS = "ddokexpertauth"

if (Platform.OS == "android") {
    var Stack = createNativeStackNavigator();
} else {
    var Stack = createStackNavigator();
}

const requestNotificationPermission = async () => {
    console.log("request permisison ", Platform.Version)
    if (Platform.Version >= 33) {
        try {
            let value = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
            )
            console.log(value)
        } catch (err) {
            console.warn('requestNotificationPermission error: ', err)
        }
    }
}



async function requestPermission() {
    if (Platform.OS === 'android') {
        await requestNotificationPermission()
    }
    const granted = await messaging().requestPermission({
        alert: true,
        announcement: false,
        badge: true,
        carPlay: true,
        provisional: false,
        sound: true,
    });

    try {
        const fcmToken = await messaging().getToken();
        global.pushToken = fcmToken
    } catch (e) {
        console.log("FCM", e)
    }

}


async function registerAppWithFCM() {
    try {
        if (!messaging().isDeviceRegisteredForRemoteMessages) {
            await messaging().registerDeviceForRemoteMessages();
        }
    } catch (e) {
        console.log("errror == = = = = =", e)
    }


    messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('Message handled in the background!', remoteMessage);
    });

    messaging().subscribeToTopic('noti').then(() => console.log('Subscribed to topic!'));
    messaging().subscribeToTopic('detective').then(() => console.log('Subscribed to topic!'));

}



const App = () => {

    const [loading, setLoading] = useState(true);
    const [isLogin, setLogin] = useState(false);
    const appState = React.useRef(AppState.currentState);
    const timeSetLife = React.useRef(null);
    const [, updateState] = React.useState();
    const [, setLanguage] = useGlobalLanguage();
    const [, setBadge] = useGlobalBade()
    const [, setLifeState] = useGlobalAppLifeState()

    const [startAnimation, setStartAnimation] = React.useState();

    const animationRef = useRef(new Animated.Value(0)).current;
    const animationRef2 = useRef(new Animated.Value(0)).current;
 
    const easingFunction = startAnimation ? Easing.inOut(Easing.linear) : Easing.out(Easing.linear);


  
    const openMain = () => {
        setLogin(true)
    }


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
    
    
    const _handleAppStateChange = (nextAppState) => {

        if (timeSetLife.current != null) {
            clearTimeout(timeSetLife.current)
        }

        setLifeState(nextAppState)
        timeSetLife.current = null

        if (
            appState.current.match(/inactive|background/) &&
            nextAppState === "active"
        ) {
            if (global.registReload != null) {
                global.registReload()
            }
            let timeEnd = global.endTime || Date.now()
            let timeCurrent = Date.now();
            let time = timeCurrent - timeEnd;
            let elapsed = Math.floor(time / 1000)

            if (elapsed > 20 * 60) {
                setLoading(true)
                setTimeout(() => {
                    setLoading(false)
                }, 2000)
            }
            global.endTime = Date.now()
        } else {
            global.endTime = Date.now()
            console.log("App has come to the active!");
        }

        getLastBade().then(m => {
            //   setBade(m)
        })
        appState.current = nextAppState;
        console.log("AppState", appState.current);
    };

    const logout = async () => {
        setLogin(false)
        saveLastToken("")
        // try {
        //     if (await GoogleSignin.isSignedIn()) {
        //         await GoogleSignin.signOut();
        //     }
        // } catch {
        // }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const appProps = {
        openMain: openMain,
        logout: logout,
    }

    const loadTabBadge = async () => {
        var badge = {}
        for (var i = 0; i < 4; i++) {
            badge[i] = await getTabBadge(i + "")
            if (badge[i] == 0) {
                badge[i] = null
            }
        }
        // setBadge(badge)
    }

    const getResource = async () => {
        try {
            setLanguage(await getLanguage())
        } catch (e) {
            console.log("errrorrrrr  ----------" + e)
        }
        try {
            await getSaveCookie()
        } catch (e) {

        }
        try {
            await loadTabBadge()
            let data = await getDeviceInfo(null)
            if (data != null) {
                global.appData = data
            }
        } catch (e) {

        }
        await checkCookie()
    }

    const checkCookie = async () => {
        var cookie = {}
        var lastToken = ""
        try {
            lastToken = await getLastToken();
            cookie = await CookieManager.get(domain, true)
            let x2 = jsonCookiesToCookieString(cookie)
            let x = await CookieManager.setFromResponse(domain, x2)
            console.log("coookie ", x, cookie)
        } catch (e) {
            console.log(e)
        }
        try {
            if (lastToken) {
                setLogin(true)
                return
            } else {
                setLogin(false)
                return
            }

            // if (cookie["APP_LOGIN"] && cookie["APP_LOGIN"].value && (cookie["APP_LOGIN"].value == true || cookie["APP_LOGIN"].value == "true")) {
            //     setLogin(true)
            // } else {
            //     setLogin(false)
            // }
        } catch (e) {

        }
    }

    useEffect(() => {
        NaverLogin.initialize({
            appName,
            consumerKey,
            consumerSecret,
            serviceUrlSchemeIOS,
            disableNaverAppAuthIOS: true,
          });
        // Settings.setAppID('820978288984618');
        // Settings.initializeSDK();
        createChannel()
        getResource().then(async () => {

            await requestPermission()
            registerAppWithFCM()
            // setupOneSignal()

            // if (Platform.OS == "android") {
            //     setTimeout(() => {
            //         setLoading(false)
            //         if (isLogin) {
            //              requestLocaitonPermision()
            //         }
            //     }, 2000)
            // } else {
            //     setLoading(false)
            //     if (isLogin) {
            //          requestLocaitonPermision()
            //     }
            // }
        })

        setTimeout(() => {
            if (loading) {
                setLoading(false)
            }
        }, 500)

        let sub = AppState.addEventListener('change', _handleAppStateChange);
        return () => {
            sub.remove()
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        let run = async () => {
            try {
                let cookie = await CookieManager.get(domain, true)
                console.log("eeee1", cookie)
            } catch (e) {
                console.log("eeee", e)
            }

            if (!loading) {
                //  requestLocaitonPermision()
            }
        }
        run()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLogin])

    const renderLoading = useCallback(() => {
        const windowWidth = Dimensions.get('window').width;
        const windowHeight = Dimensions.get('window').height;
        return <View style={[styles.flexContainer, {
            justifyContent: 'center',
            alignContent: 'center',
            alignItems: 'center',
            backgroundColor: "#DCF1F5",
            marginBottom: 5 / 100 * windowHeight,
        }]}>
            <Image style={{ width: 105, height: 90, resizeMode: 'contain', marginBottom: 20 }} source={require("./src/asset/images/logo.png")}></Image>
            <Text
                style={{
                    fontSize: 20,
                    fontWeight: 'semibold'
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
                                position: 'absolute' }} source={require("./src/asset/images/p1.png")}></Image> 

            <Image style={{
                                left: 846,
                                top: 0,
                                width: 836, 
                                height: 64, 
                                resizeMode: 'cover',
                                position: 'absolute' }} source={require("./src/asset/images/p1.png")}></Image> 
    </Animated.View>


    <Animated.View style={{ transform: [{ translateX: animationRef2 }], position: 'relative', width: 828 * 2, height: 64, top: 20}}>
    <Image style={{
         top: 0,
                     left: 0, 
                      width: 828, 
                      height: 64, 
                     resizeMode: 'cover',
                      position: 'absolute' }} source={require("./src/asset/images/p2.png")}></Image> 

<Image style={{
    top: 0,
                     left: -838, 
                      width: 828, 
                      height: 64, 
                     resizeMode: 'cover',
                      position: 'absolute' }} source={require("./src/asset/images/p2.png")}></Image> 
    </Animated.View>


            </View>

                <Image source={require("./src/asset/images/logox.png")} style={{
                    position: 'absolute',
                    width: 500,
                    height: 500,
                    top: windowHeight - 140,
                }}></Image>
        </View>
    }, [])
    //<Image style={{width: windowWidth <= 365  ?  227 : 230, resizeMode: 'contain'}} source={ windowWidth <= 365  ? require("./src/asset/images/logo1.png"): require("./src/asset/images/logo2.png")}></Image>
    const renderDashboard = useCallback(() => {
        return (
            <NavigationContainer>
                <Stack.Navigator initialRouteName="Dashboard" screenOptions={{
                    gestureEnabled: false
                }} >
                    <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} initialParams={{ appProps: appProps, isLogin }} />
                    <Stack.Screen name="WebviewScreen" component={WebviewScreen} initialParams={{ appProps: appProps, isLogin }}
                        options={{ headerShown: false }} />
                    <Stack.Screen name="Preview" component={WebViewWithBackButton} initialParams={{ appProps: appProps }} options={{ headerShown: false }} />

                </Stack.Navigator>
            </NavigationContainer>
        )
    }, [appProps, isLogin])


    const renderLogin = useCallback(() => {
        return (
            <NavigationContainer key="login">
                <Stack.Navigator screenOptions={{
                    gestureEnabled: false
                }} > 

                    <Stack.Screen name="Login" component={WebviewScreen} initialParams={{ appProps: appProps, data: { href: urlconfigs.login, isRoot : true } }} options={{ headerShown: false }} />
                    <Stack.Screen name="WebviewScreen" component={WebviewScreen} initialParams={{ appProps: appProps }} options={{ headerShown: false }} />
                    <Stack.Screen name="Preview" component={WebViewWithBackButton} initialParams={{ appProps: appProps }} options={{ headerShown: false }} />

                </Stack.Navigator>
            </NavigationContainer>
        )
    }, [appProps])
    const renderApp = () => {

       
        // if (loading) {
        //    return <WEBLoading
        // i1 = {require("./src/asset/images/p1.png")}
        // i2 = {require("./src/asset/images/p2.png")}
        // i3 = {require("./src/asset/images/logox.png")}
        // logo={ require("./src/asset/images/logo.png")}/>
        // }
        // if (!isLogin) {
          
        // }
        // return renderDashboard()
        return renderLogin()

    }


    


    return (

        <View style={styles.flexContainer}>

            <View style={[styles.flexContainer]}>
                {renderApp()}
            </View>

        </View>

    )

};

const styles = StyleSheet.create({
    flexContainer: {
        flex: 1,
        backgroundColor: "#ffffff"
    }
});

export default App;
