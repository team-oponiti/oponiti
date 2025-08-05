/* eslint-disable quotes */
/* eslint-disable prettier/prettier */
import React, {useEffect, useState} from 'react';
import {BackHandler, Image, Text, View, TouchableOpacity, Linking, Platform} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import styles from "../common/styles"
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import WebviewScreen from "../screen/WebviewScreen"
import {home, search, health, profile, community, info} from "../define/webviewUri" 
import dynamicLinks from '@react-native-firebase/dynamic-links';
import messaging from '@react-native-firebase/messaging';import { getText, getLanguage } from "../common/functions"

import { useGlobalBade, useGlobalLanguage, useGlobalTabbar } from "../common/globalState"
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

var activeTab = {}

const mainTabs = [
    {
        name: "Home",
        icon: "home",
        href: home
    },

    {
        name: "Search",
        icon: "search",
        href: search,
    },
    {
      name: "Community",
      icon: "Community",
      href: community,
  },
    {
        name: "Info",
        icon: "info",
        href: info,
    }, 
    {
        name: "Profile",
        icon: "profile",
        href: profile
    }
  ]

const  icons = {
  "Home": {
      normal: require("../asset/images/ic_home.png"),
      active: require("../asset/images/ic_home_active.png"),
  },
  "Search": {
      normal: require("../asset/images/ic_search.png"),
      active: require("../asset/images/ic_search_active.png"),
  },
  "Community":  {
    normal: require("../asset/images/ic_community.png"),
    active: require("../asset/images/ic_community_active.png"),
  },
  "Info": {
      normal: require("../asset/images/ic_info.png"),
      active: require("../asset/images/ic_info_active.png"),
  }, 
  "Profile": {
      normal: require("../asset/images/ic_account.png"),
      active: require("../asset/images/ic_account_active.png"),
  }
}

const Dashboard = (props) => {
    var appProps = (props.route && props.route.params && props.route.params.appProps) || {}
    var isLogin = (props.route && props.route.params && props.route.params.isLogin) || false
    const [appData, setAppData] = useState([])
    const [language,] = useGlobalLanguage()
    const [showTabbar, setShowTabbar] = useGlobalTabbar()

    var navigation = useNavigation();
    const insets = useSafeAreaInsets();

    function handleBackButtonClick() {
        BackHandler.exitApp()
        return true
    }

    appProps.openCart = () => {
         
    }

    appProps.openHome = () => {
        navigation.navigate("Home")
    }

    useEffect(() => {
        var data = []
        for (var tab of mainTabs) {
            var xtab = {
                props: {
                    data: tab,
                    appProps: {...appProps, goBack: handleBackButtonClick},
                   // disableHandleBackPress: true
                },
                name: tab.name,
            }
            data.push(xtab)

        }
        setAppData(data)

    }, [])



    const handleDynamicLink = (link)=> {
      navigation.push("WebviewScreen", { data: { href: link }, appProps: appProps })
      console.log("handle link", link);
    }
    
useEffect(() => { 

  messaging().getInitialNotification().then(initialMessage => {
      if (initialMessage && initialMessage.data["contentUrl"]) {
          var link = initialMessage.data["contentUrl"];
          if (link && link != "" && link != "#") { 
              navigation.push("WebviewScreen", {data: {href: initialMessage.data["contentUrl"] }, appProps: appProps}) 
          }
      } 
   }) 

   messaging().onNotificationOpenedApp(remoteMessage => { 
    if (remoteMessage && remoteMessage.data["contentUrl"]) {
      var link = remoteMessage.data["contentUrl"];
      if (link && link != "" && link != "#") { 
          navigation.push("WebviewScreen", {data: {href: remoteMessage.data["contentUrl"] }, appProps: appProps}) 
      }
  } 
  });

  // const unsubscribe = dynamicLinks().onLink(handleDynamicLink); 
  // dynamicLinks()
  // .getInitialLink()
  // .then(link =>  handleDynamicLink(link));
  
  // return () => unsubscribe(); 

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

    Linking.canOpenURL(event.url).then((supported) => {
      if (supported) {
          handleDynamicLink(event.url)
      }
    });
   
  }

  Linking.addEventListener('url',handleEventLink); 
  return ()=> {
    Linking.removeEventListener('url',handleEventLink)
  };
}, [])



    if (appData.length < 1) {
        return <View></View>
    }

    const activeTabEvent = (data) => {
        activeTab = data 
        console.log("activeTab", activeTab)
    }
 
    return (
        <Tab.Navigator 
      lazy={true}
      // barStyle={{ backgroundColor: '#ffffff', height: 80 }}
      style={styles.flexContainer}
      backBehavior={"none"}
      initialRouteName= {"Home"}
      screenOptions={({ route }) => ({
        tabBarLabel: ({ focused, color, size }) => { 
          return <Text numberOfLines={1} style={{ 
            fontSize: 13,
            // marginBottom: 24,
            fontWeight: '500',
            color : !focused ? "#777777": color
          }}>{getText(route.name,language)}</Text>
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName; 
          
        iconName = focused ? icons[route.name].active : icons[route.name].normal        
          return (
            <View style={{     
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Image source={iconName} style={{
            width: 26,
            height: 26, 
            marginBottom: 0,
            marginTop: 8

          }}></Image>
            </View>
          )
        },
         tabBarStyle: {
                    paddingTop: 8,
                    paddingBottom: 24,
                    height: 90 ,
                    paddingLeft: 4, 
                    paddingRight: 4,
          },
          // tabBarHideOnKeyboard: true
      })}
 
      tabBarOptions={{ 
        flexContainer:1,
        activeBackgroundColor: 'white',
        inactiveBackgroundColor: 'white',
        activeTintColor: '#00C271',
        labelStyle: {   
          fontSize: 13,
          fontStyle: "normal",
          padding: 0
        },
        
        
        swipeEnabled: true,
        // tabBarVisible: false,
      
      }}
    >
      {appData.map((m, index) =>{
         

        return <Tab.Screen
      
          options={{headerShown: false,

            tabBarStyle: showTabbar ? {  
              paddingTop: 8,
                    paddingBottom: 24,
                    height: 90 ,
                    paddingLeft: 4, 
                    paddingRight: 4,
            } : {
              hpaddingTop: 8,
                    paddingBottom: 24,
                    height: 90 ,
                    paddingLeft: 4, 
                    paddingRight: 4,
              display: 'none' 
            },

          }}
          name={m.name}
          component={WebviewScreen}
          initialParams={{ ...m.props, activeTab: activeTabEvent }} />
          
          })}
          
    </Tab.Navigator>

        
    );
};
export default Dashboard;