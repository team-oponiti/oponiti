 
import React, {useEffect, useState} from 'react';
import {BackHandler, Image, Text, View, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import styles from "../common/styles";
import { getText, getLanguage , onQRScan} from "../common/functions";
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import WebviewScreen from "../screen/WebviewScreen";
import { blog, detective, message, more } from "../define/webviewUri";
import { useGlobalBade, useGlobalLanguage, useGlobalRefresh } from "../common/globalState";
import { Platform } from '../common/platform';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import messaging from '@react-native-firebase/messaging';
import { appPrimaryColor } from '../define/config';
import dynamicLinks from '@react-native-firebase/dynamic-links';

const Tab = createBottomTabNavigator();
const NOOP = () => null;

var activeTab = {};

const mainTabs = [

    {
        name: "Detective",
        icon: "detective",
        href: detective,
    },
    {
        name: "Message",
        icon: "message",
        href: message
    },

    {
        name: "Blog",
        icon: "blog",
        href: blog
    }, 
    {
        name: "More",
        icon: "more",
        href: more,
    }
];

var icons = {
    "Detective": {
        normal: require("../asset/images/ic_detective.png"),
        active: require("../asset/images/ic_detective_active.png"),
    },
    "Message": {
        normal: require("../asset/images/ic_message.png"),
        active: require("../asset/images/ic_message_active.png"),
    },
    "Blog": {
        normal: require("../asset/images/ic_menu.png"),
        active: require("../asset/images/ic_menu_active.png"),
    },
    "More": {
        normal: require("../asset/images/ic_more.png"),
        active: require("../asset/images/ic_more_active.png"),
    }
};

const Dashboard = (props) => {
    var appProps = (props.route && props.route.params && props.route.params.appProps) || {};
    const insets = useSafeAreaInsets();
    const [appData, setAppData] = useState([]);
    const [language,] = useGlobalLanguage();
    const [badge, setBadge]= useGlobalBade();
    const [, setGlobalRefresh ] = useGlobalRefresh();


    var navigation = useNavigation();

    function handleBackButtonClick() {
        if (activeTab.name != "Detective") {
            navigation.navigate("Detective");
        } else {
            BackHandler.exitApp();
        }
        return true;
    }

    appProps.openCart = () => {
     //   navigation.navigate({name: "Category", merge: true});
    };

    appProps.openHome = () => {
        navigation.navigate("Detective");
    };

    const navigateToUrl = (url) => {

    };
    
    const handleDynamicLink = (link)=> {
        navigation.push("WebviewScreen", { data: { href: link.url }, appProps: appProps }); 
      };


    useEffect(() => {

        const unsubscribe = dynamicLinks().onLink(handleDynamicLink); 

        dynamicLinks()
        .getInitialLink()
        .then(link =>  handleDynamicLink(link));


        const unsubscribe2 = messaging().onMessage(async remoteMessage => {
            setGlobalRefresh(1);
        });

        messaging().getInitialNotification().then(initialMessage => {
            if (initialMessage && initialMessage.data["contentUrl"]) {
                var link = initialMessage.data["contentUrl"];
                if (link && link != "" && link != "#") { 
                    if (link == detective) {
                        navigation.navigate("Detective");
                    }  else {
                        navigation.push("WebviewScreen", {data: {href: initialMessage.data["contentUrl"] }, appProps: appProps}); 
                    } 
                } else {
                    navigation.navigate("Detective");
                }
            } 
         }); 
      
         const unsubscribe3 = messaging().onNotificationOpenedApp(remoteMessage => { 
          if (remoteMessage && remoteMessage.data["contentUrl"]) {
            var link = remoteMessage.data["contentUrl"];
            if (link && link != "" && link != "#") { 

                if (link == detective) {
                    navigation.navigate("Detective");
                }  
                else {
                    navigation.push("WebviewScreen", {data: {href: remoteMessage.data["contentUrl"] }, appProps: appProps}); 
                }
            } else {
                navigation.navigate("Detective");
            }
        } 
        });

        var data = [];
        for (var tab of mainTabs) {
            var xtab = {
                props: {
                    data: tab,
                    appProps: {...appProps, goBack: handleBackButtonClick},
                    disableHandleBackPress: true
                },
                name: tab.name,
            };

            console.log(" global.comunity ",  global.comunity )
            if ( global.comunity == true && tab.name == "Blog") {
                continue
            }
            data.push(xtab);
        }
 

        setAppData(data);

        return () => { 
            unsubscribe2 && unsubscribe2();
            unsubscribe3 && unsubscribe3();      
            unsubscribe && unsubscribe();

        }; 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (appData.length < 1) {
        return <View></View>;
    }

    const activeTabEvent = (data) => {
        activeTab = data;
        console.log("active", data);
        console.log(activeTab);
    };

    const onScanQr = () => {
        if (global.currentPageView  != null) { 
            onQRScan(global.currentPageView ,navigation,{});
        }
    };

    return (
        <View  style={styles.flexContainer} >
            <Tab.Navigator
            lazy={true}
            barStyle={{backgroundColor: '#FFFFFF'}}
            style={styles.flexContainer}
            backBehavior={"none"}
            initialRouteName={"Detective"}
            screenOptions={({route}) => ({
                tabBarLabel: ({focused, color, size}) => {
                    return <View>
                        <Text style={{ fontSize: 11,
                        color: focused ? appPrimaryColor: "#444444",
                        padding: 0,
                        fontWeight: focused ? "bold": "normal",
                        marginTop: 6,
                        marginBottom: 14 }}>{
                            getText(route.name, language)
                        }</Text>
                    </View>
                },
                tabBarIcon: ({focused, color, size}) => {
                    let iconName;
                    iconName = focused ? icons[route.name].active : icons[route.name].normal
                    return <Image source={iconName} style={{
                        width: 24,
                        height: 24,
                        marginTop: 12,
                        marginBottom: 0,
                        borderRadius: 0
                    }}></Image>
                },
                tabBarStyle: {
                    paddingTop: 0,
                    paddingBottom: 0,
                    height: 65 ,
                    paddingLeft: 0, 
                    paddingRight: 0,
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
                    fontSize: Platform.SizeScale(12),
                    fontStyle: "normal",
                    padding: 0,
                },
                style: {
                    backgroundColor: '#FFFFFF',
                },
            }}
        >
            {appData.map((m, index) => { 
                let getBadge = (badge || {})[index + ""];
                return (
                    <Tab.Screen
                    key = {m.name}
                    name={m.name}
                    component={WebviewScreen}
                    initialParams={{...m.props, activeTab: activeTabEvent}}
                    options={{ tabBarBadge:  getBadge == 0 ? null : getBadge, tabBarBadgeStyle: {fontSize: 9,fontWeight: 600, marginTop: 2 ,backgroundColor: appPrimaryColor }, headerShown: false}}
                    
                    />
                );
            }
                )}
        </Tab.Navigator>
        </View>
    );
};
export default Dashboard;