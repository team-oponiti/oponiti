/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {Node, useCallback, useEffect, useState} from 'react'
import {AppState, Image, Platform, StatusBar, StyleSheet, View, Text, Keyboard} from 'react-native';
import {domain} from "./src/define/webviewUri"
// import { Settings } from 'react-native-fbsdk-next';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createNativeStackNavigator} from 'react-native-screens/native-stack';
// import analytics from '@react-native-firebase/analytics';
import { SafeAreaProvider , useSafeAreaInsets} from 'react-native-safe-area-context';

import {
    getLastBade,
    getLastToken,
    getSaveCookie,
    jsonCookiesToCookieString,
    saveLastToken, setBade, 
    requestLocaitonPermision,getLanguage,
    requestLocation,
    createChannel,
    getRefreshToken
} from "./src/common/functions"

import { request, PERMISSIONS } from 'react-native-permissions';
// import {GoogleSignin} from '@react-native-google-signin/google-signin';
import DashboardScreen from './src/screen/DashboardScreen';
import WebviewScreen from './src/screen/WebviewScreen';
import CookieManager from "@react-native-cookies/cookies";
// import {login} from "react-native-zalo-kit";
import messaging from '@react-native-firebase/messaging';
import { useGlobalLanguage, useGlobalTimeStamp } from './src/common/globalState';


if (Platform.OS == "android") {
    var Stack = createNativeStackNavigator();
} else {
    var Stack = createStackNavigator();
}

async function requestPermission(refresh) { 
// Platform.OS == 'android' && await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS)
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
 try {
    await requestLocaitonPermision()
    let location = await requestLocation() 
    if (location.lat != null) {
        refresh && refresh(new Date().getTime())
    }
 } catch(e) {

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
  
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });
  
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in the background!', remoteMessage);
    });
  
    messaging().subscribeToTopic('noti').then(() => console.log('Subscribed to topic!'));
    messaging().subscribeToTopic('user').then(() => console.log('Subscribed to topic!'));

    /*messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage.notification,
      );
    });
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            'Notification caused app to open from quit state:',
            remoteMessage.notification,
          );
        }
      });*/
  }
  
 

const App: () => Node = () => {
    const [timeStampx, setTimestamp] = useGlobalTimeStamp()

    const [loading, setLoading] = useState(true);
    const [isLogin, setLogin] = useState(false);
    const appState = React.useRef(AppState.currentState);
    const [, updateState] = React.useState();
    const [language, setAppLanguage] = useGlobalLanguage()
      const inset = useSafeAreaInsets()
    const openMain = () => {
        setLogin(true)
    }


         const [_isKeyboardVisible, setKeyboardVisible] = useState(false)
        const [_keyboardHeight, setKeyboardHeight] = useState(0)
    
        useEffect(() => {
            const showSubscription = Keyboard.addListener('keyboardDidShow', e => _updateKeyboardData(e, true))
            const hideSubscription = Keyboard.addListener('keyboardDidHide', e => _updateKeyboardData(e, false))
        
            return () => {
              showSubscription.remove()
              hideSubscription.remove()
            }
        }, [])
    
        const _updateKeyboardData = (e, isVisible) => {
            // if (e.endCoordinates?.height > 100) {
                setKeyboardHeight(isVisible ? e.endCoordinates?.height : 0)
                setKeyboardVisible(isVisible)
            // }  else {
                //    setKeyboardHeight(0)
                // setKeyboardVisible(false)
            // }
        }
    
    const _handleAppStateChange = (nextAppState) => {

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
            try {
               // requestLocaitonPermision()
               // requestLocation() 
            } catch (e){}
        }

        getLastBade().then(m => {
            setBade(m)
        })
        appState.current = nextAppState;
        console.log("AppState", appState.current);
    };

    const logout = async () => {
     
        saveLastToken("")
        try {
            // if (await GoogleSignin.isSignedIn()) {
            //     await GoogleSignin.signOut();
            // }
            setLogin(false)
        } catch {
        }
    }

    const appProps = {
        openMain: openMain,
        logout: logout,
    }

    const getResource = async () => {
        createChannel()
        try {
           setAppLanguage(await getLanguage())
        } catch (e) {
        }
        try {
            await getSaveCookie()
        } catch (e) {

        }
        try {
            // await loadTabBadge()
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
            getRefreshToken();
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

            if (cookie["APP_LOGIN"] && cookie["APP_LOGIN"].value && (cookie["APP_LOGIN"].value == true || cookie["APP_LOGIN"].value == "true")) {
                setLogin(true)
            } else {
                setLogin(false)
            }
        } catch (e) {

        }
    }

    const appLog = async () => {
        try {
           
         } catch (e) {
           console.log(e)
         }
    }
    useEffect(() => {
    //    try {
    //     Settings.setAppID('330463519160091');
    //     Settings.initializeSDK();
    //    } catch(e){

    //    }

       appLog()

        getResource().then(async () => {
            
            try {
                await requestPermission(setTimestamp)
                registerAppWithFCM()
            } catch (e){}
            // setupOneSignal()

            //  if (Platform.OS == "android") {
            //      setTimeout(() => {
            //          setLoading(false)
            //          if (isLogin) {
            //               requestLocaitonPermision()
            //          }
            //      }, 2000)
            //  } else {
            //      setLoading(false)
            //      if (isLogin) {
            //           requestLocaitonPermision()
            //      }
            //  }
        })

        setTimeout(() => {
            if (loading) {
                setLoading(false)
            }
        }, 2300)

        let event =  AppState.addEventListener('change', _handleAppStateChange);
        return () => {
            // AppState.removeEventListener('change', _handleAppStateChange);
            // OneSignal.clearHandlers();
            event.remove()
        };
    }, []);

    useEffect(async () => {
        try {
            let cookie = await CookieManager.get(domain, true)
            console.log("eeee1", cookie)
        } catch (e) {
            console.log("eeee", e)
        }
        
    }, [])

    const renderLoading = useCallback(() => {
        if (Platform.os == "ios") {
            return <View></View>
        }
        return <View style={[styles.flexContainer, {
            justifyContent: 'center',
            alignContent: 'center',
            alignItems: 'center',
            backgroundColor: "#00C271"
        }]}>
            
            <Image style={{width: 118, height: 135,resizeMode: 'contain',}} source={require("./src/asset/images/logo_text.png")}></Image>
             <Text style={{color:'white', position : "absolute", "bottom": 52}}>좋은 암요양병원 찾기</Text>
             
        </View>
    }, [])

    const renderDashboard = useCallback(() => {
        return (
            <NavigationContainer>
                <Stack.Navigator initialRouteName="Dashboard">
                    <Stack.Screen name="Dashboard" component={DashboardScreen} options={{headerShown: false}} initialParams={{appProps: appProps, isLogin}}/>
                    <Stack.Screen name="WebviewScreen" component={WebviewScreen} initialParams={{appProps: appProps, isLogin}}
                                  options={{headerShown: false}}/>
                </Stack.Navigator>
            </NavigationContainer>
        )
    }, [appProps, isLogin])

    if (loading) {
            return renderLoading()
      }

    const renderApp = () => {   
      
        return renderDashboard()
//
    }

    return <View style={styles.flexContainer}>
        <StatusBar barStyle={'dark-content'} backgroundColor="#FFFFFF"/>
        {renderApp()}
          {inset.bottom > 10 &&  <View style={{height: inset.bottom + _keyboardHeight, backgroundColor: 'white'}}/> }
    </View>

};

const styles = StyleSheet.create({
    flexContainer: {
        flex: 1,
        backgroundColor: "#ffffff"
    }
});
const MainApp = () => {
     return ( 
        < SafeAreaProvider style={styles.flexContainer}> 
            <App></App>
        </ SafeAreaProvider> 
    )
}
export default MainApp;
