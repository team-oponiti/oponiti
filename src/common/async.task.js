import React from 'react';
import { NativeModules, Platform} from 'react-native';

import { requestLocaitonPermision, requestLocation } from "./functions"; 
import rpermision from 'react-native-permissions';
 
  
export const anxData = (webview, data) => {
 
    const resultData = (out) => {
      webview.injectJavaScript("window.appBridge && window.appBridge.onDataFromTask(`"+JSON.stringify({
        ...out,
        id: data.id
      })+"`)")
    }

    const thenValue = (data)=> { 
        resultData({data: data, error: false})
    }
    const catchValue = (data)=> { 
        resultData({error: true})
    }
    switch (data.name) {
        
        case "getLocation": 
        try {
            var permission = (Platform.OS == "android") ? rpermision.PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION : rpermision.PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
           /* request( permission ).then((status)=> { 
                if (status == "granted") { 
                    requestLocation().then(thenValue).catch(catchValue)
                } else {
                    catchValue(status)
                }
            }).catch(catchValue)*/
            requestLocaitonPermision().then((status) =>{
                if (status == "granted" || status == "limited")
                 {
                    requestLocation().then(thenValue).catch(catchValue)
                 } else {
                    catchValue(status)
                 }
            }).catch(catchValue)
        } catch(e){
            catchValue(e)
        }
            break;
          
        case "getLocationPermission":
            
            try {
                var permission = (Platform.OS == "android") ? rpermision.PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION : rpermision.PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
                rpermision.request( permission ) 
                rpermision.check(permission).then(thenValue).catch(catchValue)
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
 