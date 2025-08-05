
import React, {useEffect, useState} from 'react';
import {StatusBar, Image, Text, View, StyleSheet, Linking} from 'react-native';
import {useNavigation} from '@react-navigation/native'; 
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import WebviewScreen from "../screen/WebviewScreen"
import {home, request, news, review, profile} from "../define/webviewUri" 
import dynamicLinks from '@react-native-firebase/dynamic-links';
import messaging from '@react-native-firebase/messaging';import { getText, getLanguage, setDidHandleInit, getDidHandleInit } from "../common/functions"
import {NavigationContainer} from '@react-navigation/native';

import { useGlobalBade, useGlobalLanguage, useGlobalTabbar } from "../common/globalState"
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LoginScreen = (props) => {
  var navigation = useNavigation();
  var appProps = (props.route && props.route.params && props.route.params.appProps) || {}

  const handleDynamicLink = (link)=> {
    navigation.push("WebviewScreen", { data: { href: link }, appProps: appProps })
    console.log("handle link", link);
  }
   
  useEffect(()=>{
    if (!getDidHandleInit()) { 
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
      setDidHandleInit(true)
    }
 

    const handleEventLink = (event)=> { 
      Linking.canOpenURL(event.url).then((supported) => {
        if (supported) {
            handleDynamicLink(event.url)
        }
      }); 
    }
  
    let event = Linking.addEventListener('url',handleEventLink); 
    return ()=> {
     event.remove()
    };
  }, [])
    return ( <WebviewScreen {...props}/>
    )
}
const styles = StyleSheet.create({
    flexContainer: {
        flex: 1,
        backgroundColor: "#ffffff"
    }
});
export default LoginScreen