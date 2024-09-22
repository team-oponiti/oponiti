import React from 'react';
import { NativeModules, Platform} from 'react-native';

import { requestLocation } from "./functions"; 
import { request, PERMISSIONS, openSettings , checkLocationAccuracy, requestLocationAccuracy, check, checkMultiple} from 'react-native-permissions';
 
  
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
        
        case "getLocation":
            console.log("GET LOCATION")
            var permission = (Platform.OS == "android") ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
            request( permission )
            requestLocation().then(thenValue).catch(catchValue)
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
 