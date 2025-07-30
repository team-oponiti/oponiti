import React, {useEffect,useCallback, useState} from 'react';
import {BackHandler,Image, Text, KeyboardAvoidingView, Linking, Platform, SafeAreaView, View, Share, NativeModules, StatusBar, Keyboard, Dimensions} from 'react-native';

import {useIsFocused, useNavigation, useScrollToTop} from '@react-navigation/native';
import CookieManager from '@react-native-cookies/cookies';
import {WebView} from "react-native-webview";
import styles from "../common/styles"
import queryString from 'query-string';
import {login} from "../define/webviewUri"
import ErrorWebView from "./ErrorWebviewScreen"
import {
    getDeviceInfo,
    getDeviceInfoPM,
    jsonCookiesToCookieString,
    LoadingIndicatorView,
    onMessage,
    onQRScan,
    saveCookie,
    saveLastStoreId,
    saveLastToken,
    setBade,
    setLanguage,
    setTabBadge,
    socialLogin,
    requestLocaitonPermision,
    openSetting,
    getText,
} from "../common/functions"
import supportWebViewBridge from '../common/fakeSuppordWBridge'
import {useGlobalAppLifeState, useGlobalBade, useGlobalLanguage, useGlobalLogin, useGlobalRefresh, useGlobalStoreId} from "../common/globalState"
import { anxData } from '../common/asyncdataload';
import { openSettings } from 'react-native-permissions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { appPrimaryColor } from '../define/config';
import { BottomTextBox } from './BottomTextBox';

const WebviewTab = (props) => {
    const bottomTextRef = React.useRef(null); 
    const webviewRef = React.useRef(null);
    var canGoBackRef = React.useRef(false);
    var [overrideUrl, setOverrideUrl] = React.useState(null);
    var [viewRefresh, setViewRefresh] = React.useState(false);
    var [webLoading, setWebLoading] = React.useState(true);
    const [language, changeLanguage] = useGlobalLanguage()
    const [storeId, setStoreIdState] = useGlobalStoreId();
    const [canScroll, setCanScroll] = React.useState(true);
    const [isShowTextbox, setIsShowTextBox] = React.useState(false);
    const [isEnableInputBox, setIsEnableInputBox] = React.useState(false);
    const insets = useSafeAreaInsets();
    const refHistory = React.useRef(false);

    const [hookTabBade, setHookTabBade] = useGlobalBade()
    const [hookLogin, setHookIsLogin] = useGlobalLogin()
    const [globalRefresh, setGlobalRefresh ] = useGlobalRefresh()
    const [currentAppLifeState, ] = useGlobalAppLifeState()
    var [_enableWebHistory, _setEnableWebhistory] = React.useState(false);
  const [_isKeyboardVisible, setKeyboardVisible] = useState(false)
    const [_keyboardHeight, setKeyboardHeight] = useState(0)

    const setEnableWebhistory = (value) => {
        refHistory.current = value
        _setEnableWebhistory(value)
    }
    
    var data = {}
    var params = {}
    var appProps = {}
    var startInit = () => {}
    var navigation = {}
    var hasNavigation = false
    var disableHandleBackPress = false
    var [firstLoad, setFirstLoad] = useState(Platform.OS == "ios")
    if (props.route != null) {
        data = props.route.params.data
        params = props.route.params
        disableHandleBackPress = props.route.params.disableHandleBackPress
        appProps = props.route.params.appProps
        if ( props.route.params.startInit != null) {
            startInit = props.route.params.startInit
        }
        //todo-fix sau
        try {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            navigation = useNavigation();
            hasNavigation = true
            // eslint-disable-next-line react-hooks/rules-of-hooks
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
        data = {href: props.href}
        appProps = props
    }

   
      useEffect(() => {
        const showSubscription = Keyboard.addListener('keyboardDidShow', e => _updateKeyboardData(e, true))
        const hideSubscription = Keyboard.addListener('keyboardDidHide', e => _updateKeyboardData(e, false))
    
        return () => {
          showSubscription.remove()
          hideSubscription.remove()
        }
    }, [])

    const _updateKeyboardData = (e, isVisible) => {
        setKeyboardHeight(isVisible ? e.endCoordinates?.height : 0)
        setKeyboardVisible(isVisible)
    }

    useEffect(()=> {
        if (globalRefresh > 0 && hookLogin) {
            webviewRef.current && webviewRef.current.injectJavaScript("window.needUpdateMessageBadge && window.needUpdateMessageBadge()")
            setGlobalRefresh(0)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        const {url} = request;
        if (request.navigationType == "backforward") {
            return true
        }

        if (url.startsWith("kakaoopen")) {
            console.log("kakaoopen")
            Linking.openURL(url)
            return false; 
        }
        if (url.indexOf(".page.link") >= 0) {
            Linking.openURL(url)
            return false;
        }
        if (url.indexOf("tamtalk.page.link") >= 0) {
            Linking.openURL(url)
            return false;
        }
        if (url.startsWith("page.link")) {
            console.log("kakaoopen")
            Linking.openURL(url)
            return false; 
        }
        
        if (url.indexOf("kakao") > 0) {
            Linking.openURL(url)
            return false;
         }

        console.log("=== url", url)
        if (!url) return;
        if ( (url == data.href || url == overrideUrl) && firstLoad) {
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
                navigation.push("Preview",  {data: {href:url}} )
                return false
            } else
            if (param == "appt=N") {
                navigation.push("WebviewScreen", {data: {href: url}, appProps: appProps})
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
                if (  refHistory.current &&  canGoBackRef.current) {
                    webviewRef?.current?.goBack?.();
                } else if (navigation.canGoBack()) {
                    navigation.goBack()
                }
                open = false
                console.log("\n\n\n======##### back\n\n\n")
                break
            } else if (param == "appt=C") {
                let params = queryString.parseUrl(url)
                global.data = params.query['data']
            } 
        }

        return open;
    }
 
    // onmessage
    const onMessageFromWebview = event => {
        const {data} = event.nativeEvent;
        console.log("=========> event", data)
        let message = onMessage(data)
        if (message.type == "navigate") {
            navigation.navigate({name: message.data, merge: true});
        } else if (message.type == "enableWebHistory") {
            setEnableWebhistory(message.data);
        }
        else if (message.type == "task") { 
            anxData(webviewRef.current || webviewRef, message)
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
        else 
        if (message.type == "open") {
            if (message.data == "setting") {
                const excuteString = (str) => {
                    console.log("call js function =>>>>> "+str)
                    webviewRef.current && webviewRef.current.injectJavaScript(str)
                }    
                openSetting()

                global.registReload = () => {
                    global.registReload = null 

                    requestLocaitonPermision().then( async (gx)=> {
                        let value = (gx== "granted") ? "true" : "false" 
                        if (value == "true") { 
                            setTimeout(()=>{
                                setViewRefresh(true)
                                setTimeout(() => {
                                    setViewRefresh(false)
                                }, 100)
                            },100)
                        } 
                        excuteString("window.permissionLocationCallback && permissionLocationCallback('"+value+"')") 
                    })
                }
            }else
            if (message.data == "qrScane") {
                onQRScan(webviewRef, navigation, message.params)
            }
            if (message.data == "home") {
                appProps.openHome && appProps.openHome()
            } else if (message.data == "main") {
                appProps.openMain && appProps.openMain()
            } else if (message.data == "close") {
                global.data = message.params
                if ( refHistory.current &&  canGoBackRef.current) {
                    webviewRef.current && webviewRef.current.goBack && webviewRef.current.goBack();
                } else if (!disableHandleBackPress && hasNavigation) {
                    navigation.goBack && navigation.goBack()
                } else {
                    appProps.goBack && appProps.goBack()
                }
            } else if (message.data == "cart") {
                if (!hookLogin) {
                    navigation.push("WebviewScreen", {data: {href: login}, appProps: appProps})
                } else {
                    appProps.openCart && appProps.openCart()
                }
            } else if (message.data == "login") {
                navigation.push("WebviewScreen", {data: {href: login}, appProps: appProps})
            } else if (message.data == "app") {
                Linking.openURL(message.name); 
            }  
            else if (message.data == "loginSuccess") {
                setHookIsLogin(true)
            } else if (message.data == "sys-setting") {
                if (Platform.OS == "ios") {
                    Linking.openURL("App-Prefs:root=WIFI");

                } else {
                    const {AppNativeModule} = NativeModules;
                    AppNativeModule.openAndroidWifiSetting()

                }
              

                global.registReload = () => {
                    global.registReload = null  
                    setTimeout(()=>{
                        setViewRefresh(true)
                        setTimeout(() => {
                            setViewRefresh(false)
                        }, 100)
                    },100)
                }
            }

        } else if (message.type == "clearCookie") {
            CookieManager.clearAll()
        } 
        else if (message.type == "showTextBox") {
           setIsShowTextBox(message.data)
        } 
        else if (message.type == "hideKeyboard") {
           Keyboard.dismiss()
         }  
        else if (message.type == "set-store") {
            
            saveLastStoreId(message.data)  
            if ( message.data != null && message.data != "" ){
                setTimeout(()=>{
                    setStoreIdState(message.data)
                },200)
                appProps.openMain && appProps.openMain()
                setStoreIdState(message.data)
            } else {
                setTimeout(()=>{
                    setStoreIdState(message.data)
                },200)
                appProps.logout && appProps.logout() 
            }
            

        } 
        else if (message.type == "set-token") {
            saveLastToken(message.data) 
        } else if (message.type == "logout") {
            console.log("=>>>>>> action logout", appProps.logout)
            global.userToken = ""
            setTimeout(()=>{
                appProps.logout && appProps.logout() 
            }, 100)
        } else if (message.type == "socialLogin") {
            socialLogin(message.data, webviewRef)
        } else if (message.type == "log") {
            console.log(message.data)
        } else if (message.type == "refresh") {
            // setFirstLoad(true)
            // webviewRef.current && webviewRef.current.reload()
            setFirstLoad(true)
            setViewRefresh(true)
            setTimeout(() => {
                setViewRefresh(false)
            }, 250) 

        } else if (message.tympe == "language") {
            setLanguage(message.data)
            changeLanguage(message.data)
        } else if (message.type == "badge-main") {
            setBade(message.data)
        } else if (message.type == "badge-tab") {
            let current = hookTabBade || {}
            let bade = {...current}
            if (message.data.value == 0) {
                message.data.value = null
            }
            bade[message.data.tab] = message.data.value
           
            setTabBadge(message.data.tab, message.data.value)
            if ( setBade( message.data.value ) ) {
                setHookTabBade(bade)
            }
           
        }  else if (message.type == "share") {

            let param  = message.data

            if (param.url == null && param.text == null) {
                return;
              } 
               Share.share(
                    {
                        title: param.title,
                        message: [param.text , param.url ].join("\n"),  
                        url: param.url
                    }
            ).then(()=>console.log("share success")).catch((e)=> {
                alert("Share error " + e)
                console.log(e)
            })

        } else if (message.type == "trigger-send") {
            triggetSend()
        }
    }
    // check back
    var force = false
 
        force = useIsFocused() 
        useEffect(() => {
            if (force) {
                if ( global.data == "refresh") {
                    setFirstLoad(true)
                    setViewRefresh(true)
                    setTimeout(() => {
                        setViewRefresh(false)
                    }, 100)
                }
                if ( global.data != null && global.data.startsWith("http")) {
                    setFirstLoad(true)
                    setOverrideUrl( global.data) 
                } 
                console.log("data: " + global.data)
                setTimeout(() => {
                    webviewRef.current && webviewRef.current.injectJavaScript("window.callbackResume && callbackResume('"+global.data+"')")
                    global.data = ""
                }, 500)
                webviewRef.current && webviewRef.current.injectJavaScript("window.callbackActiveTab && callbackActiveTab()")
                params.activeTab && params.activeTab(data)
            }

        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [force])

        // first
        useEffect(() => {
            if (!force) {
                return ()=> {}
            }
            
            global.currentPageView = webviewRef

            var handleBackButtonClick = function () {
                console.log("back")
                if ( refHistory.current && canGoBackRef.current) {
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


        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [navigation, force]);

 

   /* useEffect(() => {
        if (props?.route?.params?.result) {
            webviewRef?.current?.injectJavaScript?.("callbackQrcode(`" + props?.route?.params?.result?.data + "`)")
            setTimeout(() => {
                props.navigation.setParams({result: null})
            }, 200)
        }
    }, [props?.route?.params?.result])*/
    
    useEffect( () => { 
        let tx = async () => {
            try {
                let data = await getDeviceInfo(webviewRef.current)
                if (data != null) {
                    global.appData = data
                }
            } catch (e) {
                alert("123", e)
            }
        }
        tx()
    }, [])

    const triggetSend = () => {
        if (bottomTextRef.current == null) {
            return
        }
        bottomTextRef.current.send()
    }

    let appInfo = global.appData || getDeviceInfoPM() || {}
    useEffect(()=> {
        if (currentAppLifeState == null) {
            return
        }

       /* if (!force) {
            return
        }*/
        let str = 'window.appLifeCircleStateChanged && window.appLifeCircleStateChanged(`'+currentAppLifeState+'`)'
        console.log(str)
        webviewRef.current && webviewRef.current.injectJavaScript(str)

    }, [currentAppLifeState])
  //  console.log("refresh: \() " + language)
    let header = {
        APP_NAME: "DETECTIVE-USER",
        APP_OS_NAME: appInfo.osName,
        APP_OS_TYPE: appInfo.osType,
        APP_VERSION_CODE: appInfo.appVersionCode,
        APP_VERSION_NAME: appInfo.appVersionName,
        APP_OS_VERSION: appInfo.osVersion,
        APP_PUSH_TOKEN: global.pushToken,
        APP_DEVICE_ID: appInfo.deviceId || "",
        APP_DEVICE_MODEL: appInfo.deviceModel || "",
        app_language: language,
        APP_COUNTRY_CODE: appInfo.country,
        APP_TIMEZONE: appInfo.timeZone,
        APP_LATITUDE: appInfo.lat,
        APP_LONGITUDE: appInfo.lng,
        USER_TOKEN: global.userToken ?? "",
        STORE_ID: (storeId  ?? "") + ""

    }
    if (Platform.OS == "android") {
        //   header["Cookie"] = global.cookie
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

    console.log("refresh: \() " , header)

    useEffect(() => {

        if (force) {
            return ()=> {}
        }
   
        if (hookLogin && storeId == null) {
            return ()=> {}
        }

        setFirstLoad(true)
        setViewRefresh(true)
        setTimeout(() => {
            setViewRefresh(false)
        }, 100)
        //webviewRef.current && webviewRef.current.reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [language, hookLogin]);

    useEffect(() => {
        if (storeId == null ) {
            return ()=> {}
        }
        setFirstLoad(true)
        setViewRefresh(true)
        setTimeout(() => {
            setViewRefresh(false)
        }, 100)
        //webviewRef.current && webviewRef.current.reload()
    }, [storeId]);


    useEffect(()=>{
        if (webLoading || webviewRef.current == null) {
            return ()=> {}
        }
        startInit( webviewRef)
    },[webLoading])

    var source = {uri: overrideUrl || data.href, headers: header}
  
    const renderLoading = useCallback(() => {
        const windowWidth = Dimensions.get('window').width;
        const windowHeight = Dimensions.get('window').height;
        return <View style={[styles.flexContainer, {
            justifyContent: 'center',
            alignContent: 'center',
            alignItems: 'center',
            backgroundColor: appPrimaryColor,
            paddingBottom: 3.45 / 100 * windowHeight,
            position: 'absolute',
            left : 0,
            top: 0,
            width: '100%',
            height: '100%',
            zIndex: 10
        }]}>
           <Image style={{width: windowWidth <= 365  ? 227 : 230, resizeMode: 'contain'}} source={ windowWidth <= 365  ? require("../asset/images/logo1.png"): require("../asset/images/logo2.png")}></Image>
        </View>
    }, [])

    let specialUrls = [login] 
    let isSpecial = specialUrls.indexOf(source.uri) >= 0;
    let [isHideWebView, setHideWebView] = useState(isSpecial) 

    if (viewRefresh) {
        return <View style={{backgroundColor: "gray"}}></View>
    }

    return (
        <View
            style={[styles.flexContainer, {backgroundColor: isSpecial? appPrimaryColor : "white"}]}>
              {
                isSpecial ? <StatusBar backgroundColor={appPrimaryColor}/> : null
             }  
               {isHideWebView ? renderLoading() : null}
         
            {/* <KeyboardAvoidingView
            style= {[styles.flexContainer, {backgroundColor: isSpecial? appPrimaryColor : "white"}]}
      behavior={Platform.select({ ios: "padding", android: null })}
      enabled
      contentContainerStyle={{ flex: 1 }}
      keyboardVerticalOffset={Platform.select({ ios: 0 , android: 0 })} 
      >   */}
           {/* <SafeAreaView /> */}

            <View  style ={{height:  insets.top }}/>
            {webLoading ? <LoadingIndicatorView/> : null}
           
              
                <WebView 
                style={{ backgroundColor: isSpecial? appPrimaryColor : "white", opacity: isHideWebView ? 0 : 1  }}

                automaticallyAdjustContentInsets = {false}
                automaticallyAdjustsScrollIndicatorInsets=  {false}
                     scrollEnabled= {canScroll}
                    useWebKi = {true}
                    cacheEnabled={true}
                    thirdPartyCookiesEnabled={true}
                    sharedCookiesEnabled={Platform.OS == 'android'}
                    onMessage={onMessageFromWebview}
                    ref={webviewRef}
                    source={source}
                    hideKeyboardAccessoryView
                    bounces={true}
                    renderLoading={() => {
                        <View></View>
                    }}
                    renderError = {
                        (domain,errorCode, errorDescs)=> {
                           return  <ErrorWebView 
                           button = {getText("buttonError", language)}
                           title = {getText("titleError", language)}
                           message = {getText("messageError", language)} onRefresh = {() => {
                                    setFirstLoad(true)
                                    setViewRefresh(true)
                                    setTimeout(() => {
                                        setViewRefresh(false)
                                    }, 100) 
                           }}></ErrorWebView>
                        }
                    }
                    startInLoadingState={false}
                    injectedJavaScript={fakeBridge}
                    injectedJavaScriptBeforeContentLoaded={fakeBridge}
                    allowsBackForwardNavigationGestures={false}
                    onNavigationStateChange={onNavigationStateChange} 
                    onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
                    onLoadStart={() => setWebLoading(true)}
                    onLoadEnd={() => setWebLoading(false)}
                    allowFileAccess={true}
                    allowFileAccessFromFileURLs={true}
                    allowUniversalAccessFromFileURLs={true}
                    javaScriptEnabled={true}
                    scalesPageToFit={Platform.OS === 'android'}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    onLoad={()=> {
                        setTimeout(()=> {
                            setHideWebView(false)
                           }, 600)
                    }}
                    userAgent={"Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.2 Mobile/15E148 Safari/604.1 " + appAgent}
                    originWhitelist={["kakaoopen://","zalo://", "https://*", "http://*", "file://*", "sms://*", "tel://*", "mail://*","tg://*"]}
                /> 
                 
                 {isShowTextbox ? <BottomTextBox ref={bottomTextRef} webview={webviewRef.current} isEnable={isEnableInputBox} onChange={(v)=>setIsEnableInputBox(v)}/>: <SafeAreaView /> }
                  
             {/* </KeyboardAvoidingView> */}
            { insets.bottom > 10 &&  <View  style ={{height:   Math.max(0, _keyboardHeight)}}/>}
        </View>

    );
};
export default WebviewTab