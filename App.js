/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {Node, useCallback, useEffect, useState} from 'react';
import {
  AppState,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  View,
  Text,
  Keyboard,
  SafeAreaView,
} from 'react-native';
import {domain, login} from './src/define/webviewUri';
import {firebase} from '@react-native-firebase/app';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createNativeStackNavigator} from 'react-native-screens/native-stack';
import LoginScreen from './src/screen/LoginScreen';
import {
  getLastBade,
  getLastToken,
  getRefreshToken,
  getSaveCookie,
  jsonCookiesToCookieString,
  saveLastToken,
  setBade,
  requestLocaitonPermision,
  getLanguage,
  requestLocation,
  createChannel,
  syncDeviceId,
} from './src/common/functions';

import {request, PERMISSIONS} from 'react-native-permissions';
// import {GoogleSignin} from '@react-native-google-signin/google-signin';
import DashboardScreen from './src/screen/DashboardScreen';
import WebviewScreen from './src/screen/WebviewScreen';
import CookieManager from '@react-native-cookies/cookies';
import messaging from '@react-native-firebase/messaging';
import {useGlobalLanguage} from './src/common/globalState';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {appPrimaryColor} from './src/define/config';

if (Platform.OS == 'android') {
  var Stack = createNativeStackNavigator();
} else {
  var Stack = createStackNavigator();
}

async function requestPermission() {
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
    global.pushToken = fcmToken;
  } catch (e) {
    console.log('FCM', e);
  }
  //  try {
  //     await requestLocaitonPermision()
  //     location = await requestLocation()
  //  } catch(e) {

  //  }
}

async function registerAppWithFCM() {
  try {
    await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
  } catch (e) {}
  try {
    if (!messaging().isDeviceRegisteredForRemoteMessages) {
      await messaging().registerDeviceForRemoteMessages();
    }
  } catch (e) {
    console.log('errror == = = = = =', e);
  }

  const unsubscribe = messaging().onMessage(async remoteMessage => {
    console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
  });

  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
  });

  messaging()
    .subscribeToTopic('noti')
    .then(() => console.log('Subscribed to topic!'));
  messaging()
    .subscribeToTopic('user')
    .then(() => console.log('Subscribed to topic!'));

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
  const [loading, setLoading] = useState(true);
  const [isLogin, setLogin] = useState(false);
  const appState = React.useRef(AppState.currentState);
  const [, updateState] = React.useState();
  const [language, setAppLanguage] = useGlobalLanguage();
  const insets = useSafeAreaInsets();
  const [_isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [_keyboardHeight, setKeyboardHeight] = useState(0);
  const openMain = () => {
    setLogin(true);
  };

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', e =>
      _updateKeyboardData(e, true),
    );
    const hideSubscription = Keyboard.addListener('keyboardDidHide', e =>
      _updateKeyboardData(e, false),
    );
    firebase;
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const _updateKeyboardData = (e, isVisible) => {
    setKeyboardHeight(isVisible ? e.endCoordinates?.height : 0);
    setKeyboardVisible(isVisible);
  };

  const _handleAppStateChange = nextAppState => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      if (global.registReload != null) {
        global.registReload();
      }
      let timeEnd = global.endTime || Date.now();
      let timeCurrent = Date.now();
      let time = timeCurrent - timeEnd;
      let elapsed = Math.floor(time / 1000);

      if (elapsed > 20 * 60) {
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
        }, 2000);
      }
      global.endTime = Date.now();
    } else {
      global.endTime = Date.now();
      console.log('App has come to the active!');
      try {
        // requestLocaitonPermision()
        // requestLocation()
      } catch (e) {}
    }

    getLastBade().then(m => {
      setBade(m);
    });
    appState.current = nextAppState;
    console.log('AppState', appState.current);
  };

  const logout = async () => {
    saveLastToken('');
    try {
      // if (await GoogleSignin.isSignedIn()) {
      //     await GoogleSignin.signOut();
      // }
      setLogin(false);
    } catch {}
  };

  const appProps = {
    openMain: openMain,
    logout: logout,
  };

  const getResource = async () => {
    createChannel();
    try {
      setAppLanguage(await getLanguage());
    } catch (e) {}
    try {
      await getSaveCookie();
    } catch (e) {}
    try {
      // await loadTabBadge()
      let data = await getDeviceInfo(null);
      if (data != null) {
        global.appData = data;
      }
    } catch (e) {}
    await checkCookie();
  };

  const checkCookie = async () => {
    var cookie = {};
    var lastToken = '';
    try {
      var refreshToken = await getRefreshToken();
      lastToken = await getLastToken();
      cookie = await CookieManager.get(domain, true);
      let x2 = jsonCookiesToCookieString(cookie);
      let x = await CookieManager.setFromResponse(domain, x2);
      console.log('coookie ', x, cookie);
    } catch (e) {
      console.log(e);
    }
    try {
      if (lastToken) {
        setLogin(true);
        return;
      } else {
        setLogin(false);
        return;
      }

      if (
        cookie['APP_LOGIN'] &&
        cookie['APP_LOGIN'].value &&
        (cookie['APP_LOGIN'].value == true ||
          cookie['APP_LOGIN'].value == 'true')
      ) {
        setLogin(true);
      } else {
        setLogin(false);
      }
    } catch (e) {}
  };

  const appLog = async () => {};
  useEffect(() => {
    firebase.initializeApp();
    try {
      Settings.setAppID('330463519160091');
      Settings.initializeSDK();
    } catch (e) {}

    appLog();

    getResource().then(async () => {
      try {
        await requestPermission();
        registerAppWithFCM();
      } catch (e) {}
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
    });

    setTimeout(() => {
      syncDeviceId().then(() => {
        if (loading) {
          setLoading(false);
        }
      });
    }, 2300);

    let event = AppState.addEventListener('change', _handleAppStateChange);
    return () => {
      event.remove();
    };
  }, []);

  useEffect(() => {
    if (login != true) {
      return;
    }
    if (!loading) {
      //  requestLocaitonPermision()
    }
  }, []);

  const renderLoading = useCallback(() => {
    return (
      <View
        style={[
          styles.flexContainer,
          {
            justifyContent: 'center',
            alignContent: 'center',
            alignItems: 'center',
            backgroundColor: appPrimaryColor,
          },
        ]}>
        <StatusBar
          barStyle={'dark-content'}
          backgroundColor={appPrimaryColor}
        />
        <Image
          style={{width: 160, height: 158, resizeMode: 'contain'}}
          source={require('./src/asset/images/logo_text.png')}></Image>
        <Text style={{color: 'white', position: 'absolute', bottom: 52}}>
          교통사고 한방병원 찾기
        </Text>
      </View>
    );
  }, []);

  const renderDashboard = useCallback(() => {
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Dashboard">
          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{headerShown: false}}
            initialParams={{appProps: appProps, isLogin}}
          />
          <Stack.Screen
            name="WebviewScreen"
            component={WebviewScreen}
            initialParams={{appProps: appProps, isLogin}}
            options={{headerShown: false}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }, [appProps, isLogin]);

  const renderLogin = useCallback(() => {
    return (
      <View style={styles.flexContainer}>
        <NavigationContainer key="login">
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              initialParams={{appProps: appProps, data: {href: login}}}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="WebviewScreen"
              component={WebviewScreen}
              initialParams={{appProps: appProps}}
              options={{headerShown: false}}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    );
  }, [appProps]);

  if (loading) {
    return renderLoading();
  }
  const renderApp = () => {
    if (!isLogin) {
      return renderLogin();
    }
    return renderDashboard();
  };

  return (
    <View style={styles.flexContainer}>
      <StatusBar barStyle={'dark-content'} backgroundColor="#FFFFFF" />
      {renderApp()}
      {Platform.OS == 'android' && insets.bottom > 10 && (
        <View
          style={{
            height: Math.max(0, _keyboardHeight) + insets.bottom,
            backgroundColor: 'white',
          }}
        />
      )}
      <SafeAreaView />
    </View>
  );
};

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});
const MainApp = () => {
  return (
    <GestureHandlerRootView style={styles.flexContainer}>
      <SafeAreaProvider style={styles.flexContainer}>
        <StatusBar barStyle={'dark-content'} backgroundColor="#FFFFFF" />
        <App></App>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default MainApp;
