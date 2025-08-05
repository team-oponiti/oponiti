/* eslint-disable prettier/prettier */
import React, {useEffect, useState} from 'react';
import {BackHandler, KeyboardAvoidingView, Linking, Platform, Text, View, Share, Keyboard} from 'react-native';
import {Link, useIsFocused, useNavigation, useScrollToTop} from '@react-navigation/native';
import CookieManager from '@react-native-cookies/cookies';
import {WebView} from "react-native-webview";
import styles from "../common/styles"
import queryString from 'query-string';
import {cart, home, more, search, talk, login, logout, health, profile, info} from "../define/webviewUri"
 import ErrorWebView from "./ErrorWebviewScreen"
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
    jsonSaveData,
    jsonReadData,
    copyClipboard,
    getDeviceLanguage,
    convertLanguage,
    getText,
    saveRefreshToken,
} from "../common/functions"
import supportWebViewBridge from '../common/fakeSuppordWBridge'
import {useGlobalBade, useGlobalLanguage, useGlobalLogin, useGlobalTabbar, useGlobalTimeStamp} from "../common/globalState"
import { anxData } from '../common/async.task';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
 
const WebviewTab = (props) => {
    const webviewRef = React.useRef(null);
    var canGoBackRef = React.useRef(false);
    var forceBackRef = React.useRef(false);

    var [viewRefresh, setViewRefresh] = React.useState(false);
    var [needRefresh, setNeedRefresh] = React.useState(false);
    var [webLoading, setWebLoading] = React.useState(true); 
 
    const [language, changeLanguage] = useGlobalLanguage() 
    const [hookTabBade, setHookTabBade] = useGlobalBade()
    const [hookLogin, setHookIsLogin] = useGlobalLogin()
    const [canScroll, setCanScroll] = React.useState(true);
    const [timeStampx, setTimestamp] = useGlobalTimeStamp()
    const [showTabbar, setShowTabbar] = useGlobalTabbar()
    var [overrideUrl, setOverrideUrl] = React.useState(null);
    const inset = useSafeAreaInsets()

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
                    setOverrideUrl( null ) 
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

        console.log("=== url", url, firstLoad)
        if (!url) return;
        if ( (url == data.href || url == overrideUrl)) {
            setFirstLoad(false)
            console.log("reload " + url)
            return true
        }  

        if (!url.startsWith("http")) {

            console.log("open URI", url)
            if (!url.startsWith("maps")) {
                if (Platform.OS == "android") {
                    Linking.openURL( url.replace("maps:", "geo:") )
                } else {
                    Linking.openURL(url )
                }
            }
            else  {
                Linking.openURL(url).catch(console.log)
            }
            return false;
        }
        var checkUrl = url.split(/[?&]/);
        var open = true
        var hasAction = false
        for (var index in checkUrl) {
            let param = checkUrl[index]
            if (param == "appt=N") {
                navigation.push("WebviewScreen", {data: {href: url}, appProps: appProps})
                open = false    
                break
            } else if (param == "appt=D") {
                //navigation.push("WebviewScreen", {data: {href: url}, appProps: appProps})
                open = false
                Linking.openURL(url)
                break
            } else if (param == "appt=X") {
                let params = queryString.parseUrl(url)
                global.data = params.query['data']
                hasAction = true
                /*if (canGoBackRef.current) {
                    webviewRef.current && webviewRef.current.goBack && webviewRef.current.goBack();
                } else*/
                
                if (navigation.canGoBack()) {
                    navigation.goBack()
                }
                open = false
                console.log("\n\n\n======##### back\n\n\n")
                break
            } else if (param == "appt=C") {
                if (firstLoad) {
                    return false
                }
                let params = queryString.parseUrl(url)
                global.data = params.query['data']
                /*if (canGoBackRef.current) {
                    webviewRef.current && webviewRef.current.goBack && webviewRef.current.goBack();
                } else*/
                
                if ( hasNavigation && navigation.canGoBack()) {
                    navigation.goBack && navigation.goBack()
                } else {
                    appProps.goBack && appProps.goBack()
                }
            } else if (data.href == logout) {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Dashboard' }]
                })
            }
        }

        return open;
    }
    // onmessage
    const onMessageFromWebview = event => {
        const {data} = event.nativeEvent;
        console.log("=========> event", data)
        let message = onMessage(data)
        //
        
        if (message.type == "hide-navigation") { 
            setShowTabbar(message.data)
        } else if (message.type == "set-refresh") { 
            saveRefreshToken(message.data)
        } else if (message.type == "open-app") { 
            if (message.data == null || message.data.length == 0){
                return
            }
            if (Linking.canOpenURL("heal://healmate")) {
                Linking.openURL("heal://healmate")
            } else if (message.data != null){
                Linking.openURL(message.data)
            }
        } else if (message.type == "listent-back") { 
            forceBackRef.current = message.data
            console.log(forceBackRef.current, message.data)
        }
        else if (message.type == "navigate") {
            global.data = message.params
            navigation.navigate({name: message.data, merge: true});
        }
        else  if (message.type == "set-time-stamp") {
            setTimestamp(message.data)
        }
        else  if (message.type == "copy-text") {
            copyClipboard(message.data)
        } 
        else  if (message.type == "disableScroll") {  
            setCanScroll(message.data)
         } else
         if (message.type == "task") { 
           try {
            anxData(webviewRef.current || webviewRef, message)
           } catch(e){}
        } else 
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
                            let data = await getDeviceInfo(webviewRef.current)
                            if (data != null) {
                                global.appData = data
                            }
                            setTimeout(()=>{
                                setViewRefresh(true)
                                setTimeout(() => {
                                    setViewRefresh(false)
                                }, 200)
                            },100)
                        } 
                        excuteString("window.permissionLocationCallback && permissionLocationCallback('"+value+"')") 
                    })
                }
            } else
            if (message.data == "qrScane") {
                onQRScan(webviewRef, navigation, message.params)
            }
            if (message.data == "home") {
                appProps.openHome && appProps.openHome()
            } else if (message.data == "main") {
                appProps.openMain && appProps.openMain()
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Dashboard' }]
                })
                if (message.url != null ) {
                    setTimeout(()=> {
                        navigation.push("WebviewScreen", {data: {href: message.url}, appProps: appProps})
                    }, 400)
                }
               
            } else if (message.data == "close") {
                console.log("=========> CLOSE")
                global.data = message.params
                // if (canGoBackRef.current) {
                //     webviewRef.current && webviewRef.current.goBack && webviewRef.current.goBack();
                // } else 
                if ( hasNavigation && navigation.canGoBack()) {
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
            } else if (message.data == "loginSuccess") {
               setTimeout(()=> {
                setHookIsLogin(true)
                if (message.token != null) {
                    saveLastToken(message.token)
                }
                /*if (canGoBackRef.current) {
                    webviewRef.current && webviewRef.current.goBack && webviewRef.current.goBack();
                } else */
                // if (hasNavigation && navigation.canGoBack()) {
                //     navigation.goBack && navigation.goBack()
                // } else {
                //     appProps.goBack && appProps.goBack()
                // }
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Dashboard' }]
                })
               },100)
            }

        } else if (message.type == "clearCookie") {
            CookieManager.clearAll()
        } else if (message.type == "set-token") {
            saveLastToken(message.data)
            /*navigation.reset({
                index: 0,
                routes: [{ name: 'Dashboard' }]
            })*/
        } else if (message.type == "logout") { 
            appProps.logout && appProps.logout()
            setFirstLoad(true)
            setHookIsLogin(false)
            saveLastToken("")
            navigation.reset({
                index: 0,
                routes: [{ name: 'Dashboard' }]
            })
        } else if (message.type == "socialLogin") {
            socialLogin(message.data, webviewRef)
        } else if (message.type == "log") {
            console.log(message.data)
        } else if (message.type == "refresh") {
            setFirstLoad(true)
            setViewRefresh(true)
            setTimeout(() => {
                setViewRefresh(false)
            }, 200)
        } else if (message.type == "language") {
            setFirstLoad(true)
       
                setLanguage(message.data)
                changeLanguage(convertLanguage(message.data))
        
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
            setHookTabBade(bade)
        }else if (message.type == "writelocal") {
            jsonSaveData(message.data) 
        } else if (message.type == "readlocal") {
            jsonReadData().then((data)=>{
                webviewRef.current && webviewRef.current.injectJavaScript("window.appBridge && window.appBridge.onReadedData(`"+data+"`)")
            }).catch(()=>{
                webviewRef.current && webviewRef.current.injectJavaScript("window.appBridge && window.appBridge.onReadedData('')")
            }) 
        } else if (message.type == "share") {

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

        }
    }
    // check back
    var force = false 
    force = useIsFocused()
        useEffect(() => {
            if (force) {
                if (needRefresh) {
                    setNeedRefresh(false)
                    setFirstLoad(true)
                    setViewRefresh(true)
                    setTimeout(() => {
                        setViewRefresh(false)
                    }, 100)
                } 
                const excuteString = (str) => {
                    console.log("call js function =>>>>> "+str)
                    webviewRef.current && webviewRef.current.injectJavaScript(str)
                }
                
                if ( global.data != null && global.data.startsWith("http")) {
                    setFirstLoad(true)
                    setOverrideUrl( global.data) 
                }

                console.log("data: " + global.data)
                setTimeout(() => {
                    excuteString("window.callbackResume && callbackResume('"+global.data+"')")
                    global.data = ""
                }, 200)
                
             
                excuteString("window.callbackActiveTab && callbackActiveTab()")
                params.activeTab && params.activeTab(data)  
                
                getDeviceInfo(webviewRef.current).then((data) => {
                    if (data != null) {
                        global.appData = data
                    } 
                })
            }
            
            return ()=>{}

        }, [force])

    //     // first
        useEffect(() => {
           if (!force) {
                return ()=>{

                }
            } 
            var handleBackButtonClick = function () {
               /* if (this.current) {
                    webviewRef.current && webviewRef.current.goBack && webviewRef.current.goBack();
                } else 
                */

                console.log("app go back",forceBackRef.current)
                if ( forceBackRef.current ) {

                    const excuteString = (str) => {
                        console.log("call js function =>>>>> "+str)
                        webviewRef.current && webviewRef.current.injectJavaScript(str)
                    }

                    excuteString("window.onAppBack && onAppBack()")
                    return true;
                }
                 if ( hasNavigation && navigation.canGoBack()) {
                    navigation.goBack && navigation.goBack()
                 } else if ( appProps.goBack != null) {
                    console.log("app go back")
                    appProps.goBack && appProps.goBack()
                } else {
                     BackHandler.exitApp()
                 //  console.log("Exit app")
                }
                return true

            }.bind(canGoBackRef)

           let event =  BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
            return function () {
                event.remove()
            };


        }, [navigation, force]);

 
    useEffect(  () => {
        const fn = async ()=> {
            let data = await getDeviceInfo(webviewRef.current)
            if (data != null) {
                global.appData = data
            }
        }
        fn()
         return ()=>{}
    }, [])

 
    let appInfo = global.appData || getDeviceInfoPM() || {}

    console.log("refresh: \() " + language, language)
    let header = {
        APP_NAME: "HEALMATE DOCTOR",
        APP_OS_NAME: appInfo.osName,
        APP_OS_TYPE: appInfo.osType,
        APP_VERSION_CODE: appInfo.appVersionCode,
        APP_VERSION_NAME: appInfo.appVersionName,
        APP_OS_VERSION: appInfo.osVersion,
        APP_PUSH_TOKEN: appInfo.pushToken,
        APP_DEVICE_ID: appInfo.deviceId,
        APP_DEVICE_MODEL: appInfo.deviceModel,
        app_language:  global.language || getDeviceLanguage() || "ko",
        APP_COUNTRY_CODE: appInfo.country,
        APP_TIMEZONE: appInfo.timeZone,
        APP_LATITUDE: appInfo.lat,
        APP_LONGITUDE: appInfo.lng,
        USER_TOKEN: global.userToken || "",
        REFRESH_TOKEN: global.refreshToken || "",

    }

    if (Platform.OS == "android") {
        //   header["Cookie"] = global.cookie
    }

    let appAgent = "["
    for (var x in header) {
        if (x != "USER_TOKEN" && x !="APP_PUSH_TOKEN" ){
         appAgent += x + "@!@" + header[x] + ","
        }
    }

    appAgent += "]"
    var fakeBridge = supportWebViewBridge
    if (appInfo != null) {
        fakeBridge = `window.giaynhap = ${JSON.stringify({
            ...appInfo,
            userToken:  global.userToken,
            refreshToken: global.refreshToken
        })};` + ";\n" + supportWebViewBridge
    } else {
        fakeBridge = `window.giaynhap = {};` + ";\n" + supportWebViewBridge
    }

    useEffect(() => { 
        if (!force) {
            setNeedRefresh(true)
             return ()=>{}
        }
        setFirstLoad(true)
        setViewRefresh(true)
        setTimeout(() => {
            setViewRefresh(false)
        }, 100)
         return ()=>{}
        //webviewRef.current && webviewRef.current.reload()
    }, [language, hookLogin, timeStampx]);

    var source = {uri: overrideUrl || data.href, headers: header}
    
    const keyboardVerticalOffset = Platform.OS === 'ios' ? 40 : 0
    const lockBack = source.uri.indexOf(home) >= 0 || source.uri.indexOf(info) >= 0 || source.uri.indexOf(search) >= 0 || source.uri.indexOf(health) >= 0 || source.uri.indexOf(profile) >= 0

    if (viewRefresh) {
        return <View style={{backgroundColor: "gray"}}></View>
    }
    return ( 
        <View
            style={styles.flexContainer}>
                 <View style ={{height: inset.top, backgroundColor:   'white'}} /> 
            {webLoading ? <LoadingIndicatorView/> : null} 
             
            {/* <KeyboardAvoidingView
             style={[
            
                styles.flexContainer,
                {backgroundColor:   "white"}
            ]}
      behavior={Platform.select({ ios: "padding", android: null })}
      enabled
      contentContainerStyle={{ flex: 1 }}
      keyboardVerticalOffset={Platform.select({ ios: 0, android: 0 })} 
      >   */} 
                <WebView
                    key= {source.uri}
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
                    
                    allowsInlineMediaPlayback = {true}
                    startInLoadingState={false}
                    injectedJavaScriptBeforeContentLoaded={fakeBridge}
                    allowsBackForwardNavigationGestures = {!lockBack}
                    onNavigationStateChange={onNavigationStateChange}
                    onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
                    onLoadStart={() => setWebLoading(true)}
                    onLoadEnd={() => setWebLoading(false)}
                    allowFileAccess={true}
                    allowFileAccessFromFileURLs={true}
                    allowUniversalAccessFromFileURLs={true}
                    javaScriptEnabled={true}
                    scalesPageToFit={true}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    bounces={true}
                    scrollEnabled={canScroll}
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
                    userAgent={"Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.2 Mobile/15E148 Safari/604.1 " + appAgent}
                    originWhitelist={["zalo://", "https://*", "http://*", "file://*", "sms://*", "tel://*", "mail://*", "tel:","mail:","mailto:","maps:","map:","geo:"]}
                />
            {/* </KeyboardAvoidingView> */}
                {/* { inset.bottom > 10 &&  <View  style ={{height:   Math.max(0, _keyboardHeight ), backgroundColor: 'blue'}}/>} */}
        </View>

    );
}
export default WebviewTab