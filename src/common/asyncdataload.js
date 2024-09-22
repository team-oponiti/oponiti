import React from 'react';
import { NativeModules, Platform} from 'react-native';

import { requestLocation } from "./functions";
import NetInfo from "@react-native-community/netinfo";
import { request, PERMISSIONS, openSettings , checkLocationAccuracy, requestLocationAccuracy, check, checkMultiple} from 'react-native-permissions';
 
const {AppNativeModule} = NativeModules;

export const getListWifi = async () => {
    console.log("Your current  ",  AppNativeModule.getListWifi)

   try {
    if (AppNativeModule.getListWifi == null) {
        return []
    }

    var result = await AppNativeModule.getListWifi() 
    if (result == null) {
        return []
    }
    return JSON.parse(result)  
   } catch(e) {
    return []
   }
}

export const anxData = (webview, data) => {
 
    const resultData = (out) => {
      webview.injectJavaScript("window.appBridge && window.appBridge.onDataFromTask(`"+JSON.stringify({
        ...out,
        id: data.id
      })+"`)")
    }

    const thenValue = (data)=> {
        console.log(data)
        resultData({data: data, error: false})
    }
    const catchValue = (data)=> {
        resultData({msg: data, error: true})
    }
    switch (data.name) {
        case "getListWifi" : 
             getListWifi().then(thenValue).catch(catchValue)
            break;
        case "getLocation":
            requestLocation().then(thenValue).catch(catchValue)
            break;
        case "netInfo": 
        NetInfo.configure({
            shouldFetchWiFiSSID: true,
        })
        var requestPermission = null
        if (Platform.OS == "android") {
            requestPermission = request( PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
        } else {
            requestPermission = request( PERMISSIONS.IOS.LOCATION_ALWAYS)
        }
        requestPermission.then(() => {
            if (Platform.OS == "android") {
             NetInfo.fetch("wifi").then(thenValue).catch(catchValue)
            } else {
                NetInfo.fetch("wifi").then(thenValue).catch(catchValue)
            }
        })
        .catch(catchValue)
           
            break;
        case "getLocationPermission":
            
            try {
                var permission = (Platform.OS == "android") ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
                request( permission )
                check(permission).then(thenValue).catch(catchValue)
            } catch(e){
                catchValue(e)
            }
            break;
        default: 
        resultData({
            error: true,
            msg:"unknow command"
        })
    }
}
 