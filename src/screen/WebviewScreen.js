
import React, { useCallback, useEffect, useState } from 'react';
import { BackHandler, Dimensions, Image, KeyboardAvoidingView, Linking, Text, Platform, SafeAreaView, StatusBar, View, Share, TouchableOpacity, Keyboard } from 'react-native';
import { useIsFocused, useNavigation, useScrollToTop } from '@react-navigation/native';
import CookieManager from '@react-native-cookies/cookies';
import { WebView } from "react-native-webview";
import styles from "../common/styles"
import queryString from 'query-string';
import { cart, home, more, search, talk, login, logout, environment } from "../define/webviewUri"
import messaging from '@react-native-firebase/messaging';

import { anxData } from '../common/asyncdataload';
import jsText from '../common/webviewScript'
import {
    getDeviceInfo,
    getDeviceInfoPM,
    jsonCookiesToCookieString,
    LoadingIndicatorView,
    onMessage,
    onQRScan,
    saveCookie,
    saveLastToken,
    setBade,
    setLanguage,
    setTabBadge,
    socialLogin,
    requestLocaitonPermision,
    openSetting,
    getText,
    clearBadge,
    WEBLoading
} from "../common/functions"
import supportWebViewBridge from '../common/fakeSuppordWBridge'
import { useGlobalAppLifeState, useGlobalBade, useGlobalLanguage, useGlobalLogin, useGlobalRefresh } from "../common/globalState"
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { appPrimaryColor } from '../define/config';
import { BottomTextBox } from './BottomTextBox';
import ErrorWebviewScreen from './ErrorWebviewScreen';

const WebviewTab = (props) => {
    const bottomTextRef = React.useRef(null);
    const webviewRef = React.useRef(null);
    var canGoBackRef = React.useRef(false);
    var cancelGoBackRef = React.useRef(true);

    var [viewRefresh, setViewRefresh] = React.useState(false);
    var [webLoading, setWebLoading] = React.useState(true);
    var [overrideUrl, setOverrideUrl] = React.useState(null);
    const [canback, _setCanback] = React.useState(true);

    const [language, changeLanguage] = useGlobalLanguage()
    const [canScroll, setCanScroll] = React.useState(true);
    const [forceColor, setForceColor] = React.useState(null);
    const [isShowTextbox, setIsShowTextBox] = React.useState(false);
    const [isEnableInputBox, setIsEnableInputBox] = React.useState(false);
    const [didLoadFcm, setDidLoadFCM] = React.useState(false);

    const [hookTabBade, setHookTabBade] = useGlobalBade()
    const [hookLogin, setHookIsLogin] = useGlobalLogin()
    const [globalRefresh, setGlobalRefresh] = useGlobalRefresh()

    const [currentAppLifeState,] = useGlobalAppLifeState()

    const setCanback = (value)=> {
        cancelGoBackRef.current = value
        _setCanback(value)
    }

    const insets = useSafeAreaInsets()
    var data = {}
    var params = {}
    var appProps = {}
    var navigation = {}
    var hasNavigation = false
    var disableHandleBackPress = false
    var [firstLoad, setFirstLoad] = useState(Platform.OS == "ios")
    if (props.route != null) {
        data = props.route.params.data
        params = props.route.params
        disableHandleBackPress = props.route.params.disableHandleBackPress
        appProps = props.route.params.appProps

        try {
            navigation = useNavigation();
            hasNavigation = true
            useScrollToTop(React.useRef({
                scrollToTop: () => {
                    setFirstLoad(true)
                    webviewRef.current && webviewRef.current.injectJavaScript(" ( window.scrollY > 0)?window.scrollTo(0, 0):appBridge.refresh();")
                },
            }))
        } catch (e) {
            navigation = {}
        }
    } else {
        data = { href: props.href }
        appProps = props
    }

    useEffect(() => {
        if (globalRefresh > 0 && hookLogin) {
            webviewRef.current && webviewRef.current.injectJavaScript("window.needUpdateMessageBadge()")
            setGlobalRefresh(0)
        }
    }, [globalRefresh])

    const onLoadEnd = async (syntheticEvent) => {
        if (Platform.OS == "android") {
            let cookie = jsonCookiesToCookieString(await CookieManager.get(login))
            console.log(" Noi dung Cookie: ", cookie)
            saveCookie(cookie)
        }
    }


    const onNavigationStateChange = (newNavState) => {

        canGoBackRef.current = newNavState.canGoBack
        if (newNavState.loading == false) {
            webviewRef.current && webviewRef.current.injectJavaScript(supportWebViewBridge)
        }
    }


    // check load
    const onShouldStartLoadWithRequest = (request) => {
        const { url } = request;
        if (request.navigationType == "backforward") {
            return true
        }
        if (url.indexOf("kakao") > 0) {
            Linking.openURL(url)
            return false;
        }
        if (url.indexOf("tamtalk.page.link") > 0) {
            Linking.openURL(url)
            return false;
        }
        if (url.indexOf(".page.link") > 0) {
            Linking.openURL(url)
            return false;
        }
        if (url.startsWith("kakaoopen")) {
            console.log("kakaoopen")
            Linking.openURL(url)
            return false;
        }

        console.log("=== url", url)
        if (!url) return;
        if ((url == data.href || url == overrideUrl) && firstLoad) {
            setFirstLoad(false)
            console.log("reload " + url)
            return true
        }
        var checkUrl = url.split(/[?&]/);
        var open = true
        var hasAction = false
        for (var index in checkUrl) {
            let param = checkUrl[index]

            if (param == "appt=W") {
                navigation.push("Preview", { data: { href: url } })
                return false
            }
            else if (param == "appt=N") {
                navigation.push("WebviewScreen", { data: { href: url }, appProps: appProps })
                open = false
                break
            } else if (param == "appt=D") {
                open = false
                Linking.openURL(url)
                return false
            } else if (param == "appt=X") {
                let params = queryString.parseUrl(url)
                global.data = params.query['data']
                hasAction = true
                if (canGoBackRef.current) {
                    webviewRef.current && webviewRef.current.goBack && webviewRef.current.goBack();
                } else if (navigation.canGoBack()) {
                    navigation.goBack()
                }
                open = false
                console.log("\n\n\n======##### back\n\n\n")
                break
            } else if (param == "appt=C") {
                let params = queryString.parseUrl(url)
                global.data = params.query['data']
            } /*else if (data.href == logout) {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Dashboard' }]
                })
            }*/
        }

        return open;
    }
    // onmessage
    const onMessageFromWebview = event => {
        const { data } = event.nativeEvent;
        console.log("=========> event", data)
        let message = onMessage(data)
        if (message.type == "navigate") {
            global.data = message.params
            navigation.navigate({ name: message.data, merge: true });
        }
        else if (message.type == "disableScroll") {
            // anxData(webviewRef.current || webviewRef, message)
            setCanScroll(message.data)
        }
        else if (message.type == "setEnableInputBox") {
            setIsEnableInputBox(message.data)
        }
        else if (message.type == "openLink") {
            Linking.openURL(message.data)
        }
        else if (message.type == "allowBack") {
           setCanback(true)
        }
        else if (message.type == "cancelBack") {
            setCanback(false)
        }
        else if (message.type == "task") {
            anxData(webviewRef.current || webviewRef, message)
        } else
            if (message.type == "open") {
                if (message.data == "setting") {
                    const excuteString = (str) => {
                        console.log("call js function =>>>>> " + str)
                        webviewRef.current && webviewRef.current.injectJavaScript(str)
                    }
                    openSetting()

                    global.registReload = () => {
                        global.registReload = null

                        requestLocaitonPermision().then(async (gx) => {
                            let value = (gx == "granted") ? "true" : "false"
                            if (value == "true") {
                                let data = await getDeviceInfo(webviewRef.current)
                                if (data != null) {
                                    global.appData = data
                                }
                                setTimeout(() => {
                                    setViewRefresh(true)
                                    setTimeout(() => {
                                        setViewRefresh(false)
                                    }, 100)
                                }, 100)
                            }
                            excuteString("window.permissionLocationCallback && permissionLocationCallback('" + value + "')")


                        })
                    }
                } else
                    if (message.data == "qrScane") {
                        onQRScan(webviewRef, navigation, message.params)
                    }
                    if (message.data == "exitapp") {
                        BackHandler.exitApp()
                    } else 
                if (message.data == "home") {
                    appProps.openHome && appProps.openHome()
                } else if (message.data == "main") {
                    appProps.openMain && appProps.openMain()
                } else if (message.data == "close") {
                    console.log("=========> CLOSE")
                    global.data = message.params
                    if (canGoBackRef.current) {
                        webviewRef.current && webviewRef.current.goBack && webviewRef.current.goBack();
                    } else if (!disableHandleBackPress && hasNavigation) {
                        navigation.goBack && navigation.goBack()
                    } else {
                        appProps.goBack && appProps.goBack()
                    }
                } else if (message.data == "cart") {
                    if (!hookLogin) {
                        navigation.push("WebviewScreen", { data: { href: login }, appProps: appProps })
                    } else {
                        appProps.openCart && appProps.openCart()
                    }
                } else if (message.data == "login") {
                    navigation.push("WebviewScreen", { data: { href: login }, appProps: appProps })
                } else if (message.data == "loginSuccess") {
                    setTimeout(() => {
                        setHookIsLogin(true)
                        // if (message.token != null) {
                        //     saveLastToken(message.token)
                        // }
                        if (canGoBackRef.current) {
                            webviewRef.current && webviewRef.current.goBack && webviewRef.current.goBack();
                        } else if (!disableHandleBackPress && hasNavigation) {
                            navigation.goBack && navigation.goBack()
                        } else {
                            appProps.goBack && appProps.goBack()
                        }
                    }, 100)
                }

            } else if (message.type == "setColor") {
                setForceColor(message.data)
            }
            else if (message.type == "showTextBox") {
                setIsShowTextBox(message.data)
            }
            else if (message.type == "hideKeyboard") {
                Keyboard.dismiss()
            }
            else if (message.type == "clearCookie") {
                CookieManager.clearAll()
            } else if (message.type == "set-token") {
                global.userToken = message.data
                saveLastToken(message.data)
            } else if (message.type == "logout") {
                global.userToken = "NONE"
                appProps.logout && appProps.logout()
                setTimeout(() => {
                    setHookIsLogin(false)
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Dashboard' }]
                    })
                }, 200)
            } else if (message.type == "socialLogin") {
                socialLogin(message.data, webviewRef)
            } else if (message.type == "log") {
                console.log(message.data)
            } else if (message.type == "refresh") {
                setFirstLoad(true)

                setViewRefresh(true)
                setTimeout(() => {
                    setViewRefresh(false)
                }, 250)

            } else if (message.type == "language") {
                setLanguage(message.data)
                changeLanguage(message.data)
            } else if (message.type == "badge-main") {
                setBade(message.data)
            } else if (message.type == "badge-tab") {
                let current = hookTabBade || {}
                let bade = { ...current }
                if (message.data.value == 0) {
                    message.data.value = null
                }
                bade[message.data.tab] = message.data.value
                setTabBadge(message.data.tab, message.data.value)
                if (setBade(message.data.value)) {
                    setHookTabBade(bade)
                }

            } else if (message.type == "clear-badge") {
                setBade(0)
                clearBadge()
            }
            else if (message.type == "trigger-send") {
                triggetSend()
            } else if (message.type == "share") {

                let param = message.data

                if (param.url == null && param.text == null) {
                    return;
                }
                Share.share(
                    {
                        title: param.title,
                        message: [param.text, param.url].join("\n"),
                        url: param.url
                    }
                ).then(() => console.log("share success")).catch((e) => {
                    alert("Share error " + e)
                    console.log(e)
                })

            }

    }
    // check back
    var force = false
    try {
        force = useIsFocused()
        useEffect(() => {
            if (force) {

                if (global.data == "refresh") {
                    setFirstLoad(true)
                    webviewRef.current && webviewRef.current.reload()
                    global.data = ""
                }
                if (global.data != null && global.data.startsWith("http")) {
                    setFirstLoad(true)
                    setOverrideUrl(global.data)
                }
                const excuteString = (str) => {
                    console.log("call js function =>>>>> " + str)
                    webviewRef.current && webviewRef.current.injectJavaScript(str)
                }

                console.log("data: " + global.data)
                setTimeout(() => {
                    excuteString("window.callbackResume && window.callbackResume('" + global.data + "')")
                    global.data = ""
                }, 500)


                excuteString("window.callbackActiveTab && window.callbackActiveTab()")
                params.activeTab && params.activeTab(data)


            }

        }, [force])

        // first
        useEffect(() => {

            if (!force) {
                return
            }
            var handleBackButtonClick = function () {
                if (!cancelGoBackRef.current) {
                    BackHandler.exitApp() 
                    return
                }
                if (canGoBackRef.current) {
                    webviewRef.current && webviewRef.current.goBack && webviewRef.current.goBack();
                } else if (!disableHandleBackPress && hasNavigation && navigation.canGoBack()) {
                    navigation.goBack && navigation.goBack()
                } else {
                    if (appProps.goBack == null) {
                        BackHandler.exitApp()
                    } else {
                        appProps.goBack && appProps.goBack()
                    }

                }
                return true

            }

            BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
            return function () {
                BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
            };


        }, [navigation, force]);

    } catch (e) {

    }
    useEffect(() => {
        let tx = async () => {
            setTimeout(()=>{
                setHideWebView(false)
                setDidLoadFCM(true)
            }, 20000)
            try {
                const fcmToken = await messaging().getToken();
                global.pushToken = fcmToken
            } catch (e) {
                console.log("FCM", e)
            }

            try {
                console.log(" GET DEVICE INFO")
                let data = await getDeviceInfo(webviewRef.current)
                if (data != null) {
                    global.appData = data
                }
            } catch (e) {
                alert("123", e)
            } 
            setDidLoadFCM(true)
        } 
        tx()
    }, [])

    useEffect(() => {

    }, [data.href, props.route?.params?.isLogin])

    let appInfo = global.appData || getDeviceInfoPM() || {}

    useEffect(() => {
        if (currentAppLifeState == null) {
            return
        }

        let str = 'window.appLifeCircleStateChanged && window.appLifeCircleStateChanged(`' + currentAppLifeState + '`)'
        console.log(str)
        webviewRef.current && webviewRef.current.injectJavaScript(str)

    }, [currentAppLifeState])


    const handleDynamicLink = (link)=> {
        handleNavigateTolink(link)
        
      } 

    const handleNavigateTolink = (link) => {  
        // navigation.push("WebviewScreen", { data: { href: link }, appProps: appProps }) 
        if (  webviewRef.current == null) {
            setTimeout(()=> {
               webviewRef.current && webviewRef.current.injectJavaScript(`window.location.href="${link}"`)
            }, 2000)
         } else {
           webviewRef.current && webviewRef.current.injectJavaScript(`window.location.href="${link}"`)
         } 
    }
  
      

    useEffect(() => { 
            if (!data.isRoot) {
                return
            }
        messaging().getInitialNotification().then( (initialMessage) => {
            if (initialMessage && initialMessage.data["contentUrl"]) {
                var link = initialMessage.data["contentUrl"];
                if (link && link != "" && link != "#") { 
                    handleDynamicLink(link)
                }
            } 
         }) 
    
         const unsubscribe3 =  messaging().onNotificationOpenedApp(remoteMessage => {
            if (remoteMessage && remoteMessage.data["contentUrl"]) {
                var link = remoteMessage.data["contentUrl"];
                if (link && link != "" && link != "#") { 
                    handleDynamicLink(link)
                }
            } 
          });
          
        // const unsubscribe2 = messaging().onMessage(async remoteMessage => {
        //     // setGlobalRefresh(1)
        // });


            Linking.getInitialURL().then((url) => {
                if (url) {
                Linking.canOpenURL(url).then((supported) => {
                    if (supported) {
                    handleDynamicLink(url)
                    }
                }); 
                }
            })
            .catch((err) => {
                console.warn('An error occurred', err);
            });

            
            const handleEventLink = (event)=> {
                console.log("event", event)

                if (event.url == null || !event.url.startsWith("https")) {
                return
                }

                Linking.canOpenURL(event.url).then((supported) => {
                if (supported) {
                    handleDynamicLink(event.url)
                }
                });
            
            }

            var event =  Linking.addEventListener('url',handleEventLink); 
           
          
        
        return () => { 
            // unsubscribe2 && unsubscribe2()
            unsubscribe3 && unsubscribe3()
            event && event.remove && event.remove()
        }; 
      }, [])
    

    const triggetSend = () => {
        if (bottomTextRef.current == null) {
            return
        }
        bottomTextRef.current.send()
    }

    //console.log("refresh: \() " + language)
    let header = {
        APP_NAME: "DDOK-BIZ",
        APP_OS_NAME: appInfo.osName,
        APP_OS_TYPE: appInfo.osType,
        APP_VERSION_CODE: appInfo.appVersionCode,
        APP_VERSION_NAME: appInfo.appVersionName,
        APP_OS_VERSION: appInfo.osVersion,
        APP_PUSH_TOKEN: global.pushToken,
        APP_DEVICE_ID: appInfo.deviceId,
        APP_DEVICE_MODEL: appInfo.deviceModel,
        app_language: language,
        APP_LANGUAGE: language,
        APP_COUNTRY_CODE: appInfo.country,
        APP_TIMEZONE: appInfo.timeZone,
        APP_LATITUDE: appInfo.lat,
        APP_LONGITUDE: appInfo.lng,
        USER_TOKEN: global.userToken + "",
        AUTH: global.userToken,
    }
  
    let appAgent = "["
    for (var x in header) {
        appAgent += x + "@!@" + header[x] + ","
    }

    appAgent += "]"
    var fakeBridge = supportWebViewBridge
    if (appInfo != null) {
        fakeBridge = `window.giaynhap = ${JSON.stringify(appInfo)};` + ";\n" + supportWebViewBridge
    } else {
        fakeBridge = `window.giaynhap = {};` + ";\n" + supportWebViewBridge
    }

    useEffect(() => {
        if (force) {
            return
        }
        setFirstLoad(true)
        setViewRefresh(true)
        setTimeout(() => {
            setViewRefresh(false)
        }, 100)
        //webviewRef.current && webviewRef.current.reload()
    }, [language, hookLogin]);

    var source = { uri: overrideUrl || data.href, headers: header }

    const keyboardVerticalOffset = Platform.OS === 'ios' ? 40 : 0
    let specialUrls = ["https://expert.ddokddok.co/expert"]
    let isSpecial = specialUrls.indexOf(source.uri) >= 0;

    let [isHideWebView, setHideWebView] = useState(isSpecial)


    console.log("Headers", header)
    if (viewRefresh) {
        return <View style={{ backgroundColor: "gray" }}></View>
    }
    return (
        <View
            style={[

                styles.flexContainer,
                { backgroundColor: forceColor ||  "white" }
            ]}>
            {
                (isSpecial || forceColor != null) ? <StatusBar backgroundColor={forceColor || 'white'} /> : null
            }

            {isHideWebView ? <View style={{ width: "100%", height: "100%" }}>
                <WEBLoading
                    i1={require("../asset/images/p1.png")}
                    i2={require("../asset/images/p2.png")}
                    i3={require("../asset/images/logox.png")}
                    logo={require("../asset/images/logo.png")} />

            </View> : null}
            <SafeAreaView />


        

            <KeyboardAvoidingView
                style={[

                    styles.flexContainer,
                    { backgroundColor: forceColor ||  "white" }
                ]}
                behavior={Platform.select({ ios: "padding", android: null })}
                enabled
                contentContainerStyle={{ flex: 1 }}
                keyboardVerticalOffset={Platform.select({ ios: 0, android: 0 })}
            >
                {
                    didLoadFcm && <WebView
                    style={{ backgroundColor: forceColor ||  "white", opacity: isHideWebView ? 0 : 1 }}
                    scrollEnabled={canScroll}
                    useWebKit
                    cacheEnabled={true}
                    thirdPartyCookiesEnabled={true}
                    sharedCookiesEnabled={Platform.OS == 'android'}
                    onMessage={onMessageFromWebview}
                    ref={webviewRef}
                    source={source}
                    renderLoading={() => {
                        <View></View>
                    }}
                    startInLoadingState={false}
                    injectedJavaScriptBeforeContentLoaded={fakeBridge}
                    allowsBackForwardNavigationGestures={canback}
                    onNavigationStateChange={onNavigationStateChange}
                    onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
                    onLoadStart={() => setWebLoading(true)}
                    onLoadEnd={() => {
                        setWebLoading(false)
                        setHideWebView(false) 
                    }} 
                    allowFileAccess={true}
                    allowFileAccessFromFileURLs={true}
                    allowUniversalAccessFromFileURLs={true}
                    javaScriptEnabled={true}
                    scalesPageToFit={true}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    bounces={true}
                    userAgent={"Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.2 Mobile/15E148 Safari/604.1 " + appAgent}
                    originWhitelist={["zalo://", "https://*", "http://*", "file://*", "sms://*", "tel://*", "mail://*", "tg://*"]}

                    renderError={
                        (domain, errorCode, errorDescs) => {
                            return <ErrorWebviewScreen
                                button={getText("buttonError", language)}
                                title={getText("titleError", language)}
                                message={getText("messageError", language)}
                                onRefresh={() => {
                                    setFirstLoad(true)
                                    webviewRef.current && webviewRef.current.reload()
                                }}></ErrorWebviewScreen>
                        }
                    }

                />
}
                {isShowTextbox ? <BottomTextBox ref={bottomTextRef} webview={webviewRef.current} isEnable={isEnableInputBox} onChange={(v) => setIsEnableInputBox(v)} /> : <SafeAreaView />}

            </KeyboardAvoidingView>

        </View>

    );
}
export default WebviewTab