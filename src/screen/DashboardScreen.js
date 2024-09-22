/* eslint-disable quotes */
/* eslint-disable prettier/prettier */
import React, {useEffect, useState} from 'react';
import {BackHandler, Image, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import styles from "../common/styles"
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import WebviewScreen from "../screen/WebviewScreen"
import { account, blog, chat, membership, more } from "../define/webviewUri"
import dynamicLinks from '@react-native-firebase/dynamic-links';
import messaging from '@react-native-firebase/messaging';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getText } from '../common/functions';
import { appPrimaryColor } from '../define/config';
import { useGlobalBade, useGlobalRefresh } from '../common/globalState';

const Tab = createBottomTabNavigator();

var activeTab = {}

const mainTabs = [
    {
        name: "Home",
        icon: "home",
        href: chat
    },

    {
        name: "Comunity",
        icon: "comunity",
        href: blog,
    },
    {
        name: "Ticket",
        icon: "ticker",
        href: membership,
    },
    {
        name: "Account",
        icon: "account",
        href: account,
    },
    {
        name: "More",
        icon: "more",
        href: more
    },
     ]

var icons = {
    "Home": {
        normal: require("../asset/images/ic_message.png"),
        active: require("../asset/images/ic_message_active.png"),
    },
    "Comunity": {
        normal: require("../asset/images/ic_menu.png"),
        active: require("../asset/images/ic_menu_active.png"),
    },
    "Ticket": {
        normal: require("../asset/images/ic_ticket.png"),
        active: require("../asset/images/ic_ticket_active.png"),
    },
    "Account": {
        normal: require("../asset/images/ic-account.png"),
        active: require("../asset/images/ic-account_active.png"),
    },
    "More": {
        normal: require("../asset/images/ic_more.png"),
        active: require("../asset/images/ic_more_active.png"),
    } 
}

const Dashboard = (props) => {
    var appProps = (props.route && props.route.params && props.route.params.appProps) || {}
    var isLogin = (props.route && props.route.params && props.route.params.isLogin) || false
    const [appData, setAppData] = useState([])
    var navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const [badge, setBadge]= useGlobalBade()
    const [, setGlobalRefresh ] = useGlobalRefresh()

    function handleBackButtonClick() {
        if (activeTab.name != "Home") {
            navigation.navigate("Home")
        } else {
            BackHandler.exitApp()
        }
        return true
    }

    appProps.openCart = () => {
        //navigation.navigate({name: "Category", merge: true});
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
                    disableHandleBackPress: true
                },
                name: tab.name,
            }
            data.push(xtab)

        }
        setAppData(data) 
    }, [])



    const handleDynamicLink = (link)=> {
       // navigation.push("WebviewScreen", { data: { href: link.url }, appProps: appProps })
       // console.log("handle link", link);
      }
      
  useEffect(() => { 

    messaging().getInitialNotification().then( (initialMessage) => {
        if (initialMessage && initialMessage.data["contentUrl"]) {
            var link = initialMessage.data["contentUrl"];
            if (link && link != "" && link != "#") { 
                navigation.push("WebviewScreen", {data: {href: initialMessage.data["contentUrl"] }, appProps: appProps}) 
            }
        } 
     }) 

     const unsubscribe3 =  messaging().onNotificationOpenedApp(remoteMessage => {
        if (remoteMessage && remoteMessage.data["contentUrl"]) {
            var link = remoteMessage.data["contentUrl"];
            if (link && link != "" && link != "#") { 
                navigation.push("WebviewScreen", {data: {href: remoteMessage.data["contentUrl"] }, appProps: appProps}) 
            }
        } 
      });
      
    const unsubscribe2 = messaging().onMessage(async remoteMessage => {
        setGlobalRefresh(1)
    });
      
    const unsubscribe = dynamicLinks().onLink(handleDynamicLink); 

    dynamicLinks()
    .getInitialLink()
    .then(link =>  handleDynamicLink(link));
    
    return () => {
        unsubscribe && unsubscribe()
        unsubscribe2 && unsubscribe2()
        unsubscribe3 && unsubscribe3()
    }; 
  }, [])



    if (appData.length < 1) {
        return <View></View>
    }

    const activeTabEvent = (data) => {
        activeTab = data
        console.log("active", data)
        console.log(activeTab)
    }

    return (
        <Tab.Navigator
            lazy={true}
            barStyle={{backgroundColor: '#FFFFFF'}}
            style={styles.flexContainer}
            backBehavior={"none"}
            initialRouteName={"Home"}
            screenOptions={({route}) => ({
                tabBarLabel: ({focused, color, size}) => {
                    return <Text style={{ fontSize: 12,
                        color: focused ? appPrimaryColor: "#444444",
                        padding: 0,
                        fontWeight: focused ? "bold": "normal",
                        marginTop: 6,
                        marginBottom: 12 }}>{
                            getText(route.name, language)
                        }</Text>
                },
                tabBarIcon: ({focused, color, size}) => {
                    let iconName;
                    iconName = focused ? icons[route.name].active : icons[route.name].normal
                    return <Image source={iconName} style={{
                        width: 24,
                        height: 24,
                        marginTop: 10,
                        marginBottom: 0,
                        borderRadius: 0
                    }}></Image>
                },
                tabBarStyle: {
                    paddingTop: 0,
                    height: 65 + insets.bottom,
                },
                tabBarHideOnKeyboard: true
            })}

            tabBarOptions={{
                tabBarHideOnKeyboard: true,
                flexContainer: 1,
                activeBackgroundColor: '#FFFFFF',
                inactiveBackgroundColor: '#FFFFFF',
              //  activeTintColor: '#EEFAFC',
                showLabel: true,
                labelStyle: {
                    fontSize: 14,
                    fontStyle: "normal",
                    padding: 0,
                },
                style: {
                    backgroundColor: '#FFFFFF',
                },
            }}
        >
            {appData.map((m, index) =>{

                let getBadge =  (badge || {})[index + ""]
                return <Tab.Screen
                    name={m.name}
                    component={WebviewScreen}
                    initialParams={{...m.props, activeTab: activeTabEvent, isLogin}}
                    options={{ tabBarBadge:  getBadge == 0 ? null : getBadge, tabBarBadgeStyle: { backgroundColor: appPrimaryColor }, headerShown: false}}
                    
                    />
            }
                    )}
        </Tab.Navigator>
    );
};
export default Dashboard;