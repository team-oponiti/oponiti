import React, {useState,useEffect, useCallback} from 'react';

// Import all the components we are going to use
import {
  Dimensions,
  View,
  StyleSheet,
  StatusBar, 
  TouchableOpacity,
  Image,
  BackHandler,
  Text
} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { useNavigation } from '@react-navigation/core';
import Icons from 'react-native-vector-icons/Ionicons';
import * as Animatable from "react-native-animatable";

Icons.loadFont();

export default function QrcodeScreen(props){
  const navigation = useNavigation();
  const onResult = props.onResult || ( props.route && props.route.params && props.route.params.onResult)  


  const  handleBackButtonClick = useCallback(() => {
      navigation.goBack && navigation.goBack()
      return true;
  },[navigation])

  useEffect(() => { 
      BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
      return () => {
          BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

    const onSuccess = e => {
      onResult && onResult(e)
      navigation.goBack()
    };

     function makeSlideOutTranslation(translationType, fromValue) {
        return {
          from: {
            [translationType]: SCREEN_WIDTH * -0.3
          },
          to: {
            [translationType]: SCREEN_WIDTH* 0.3
          }
        };
      }

      return (
        <View style={{width:"100%",height:"100%"}}>
        <StatusBar barStyle={'light-content'}  backgroundColor="transparent" translucent = {true} />
        <View style={{ position:"absolute",left:0,top:26,height: 60, padding:10,backgroundColor:"transparent",zIndex:100 }}>
         <TouchableOpacity style={{flexDirection:"row", alignContent:"center",alignItems:"center",}} onPress={()=>{ navigation.goBack()}}>
            <Icons name="ios-chevron-back" size={30}  color={"#ffffff"}></Icons>
            <Text style={{color:"#ffffff",fontSize:20, textAlign:"center",width:"89%"}} > </Text>
          </TouchableOpacity>          
        </View>
        <QRCodeScanner
          showMarker= {false}
          onRead={onSuccess}  
          cameraStyle={{ height: SCREEN_HEIGHT + 90 }} 
        />
        <View style={[styles.rectangleContainer]}>
          <View style={styles.topOverlay} />
            <View style={{ flexDirection: "row" ,zIndex:3}}>
              <View style={styles.leftAndRightOverlay} />
              <View style={styles.rectangle}>
                <Animatable.View
                  style={styles.scanBar}
                  direction="alternate-reverse"
                  iterationCount="infinite"
                  duration={1700}
                  easing="linear"
                  animation={makeSlideOutTranslation(
                    "translateY",
                    SCREEN_WIDTH * -0.2
                  )}
                />
               {
                /*
                 <Image source={require("../asset/images/ic_scan_top_left.png")}  style={{position:'absolute',top:-2,left:-2,width:60,height:60}}/>
                <Image source={require("../asset/images/ic_scan_top_right.png")}  style={{position:'absolute',top:-2,right:-2,width:60,height:60}}/>
                <Image source={require("../asset/images/ic_scan_bottom_left.png")}  style={{position:'absolute',bottom:-2,left:-2,width:60,height:60}}/>
                <Image source={require("../asset/images/ic_scan_bottom_right.png")}  style={{position:'absolute',bottom:-2,right:-2,width:60,height:60}}/> 
                */
               }
              </View>
              <View style={styles.leftAndRightOverlay} />
            </View>
          <View style={styles.bottomOverlay} />
          </View>
        </View>
      );
}


const SCREEN_HEIGHT = Dimensions.get("window").height;
const SCREEN_WIDTH = Dimensions.get("window").width;


const overlayColor = "rgba(0,0,0,0.0)"; // this gives us a black color with a 50% transparency

const rectDimensions = SCREEN_WIDTH * 0.65; // this is equivalent to 255 from a 393 device width
const rectBorderWidth = 0; // this is equivalent to 2 from a 393 device width
const rectBorderColor = "#000000";

const scanBarWidth = SCREEN_WIDTH * 0.46;  
const scanBarHeight = 2; 
const scanBarColor = "#000000";

const iconScanColor = "blue";

 
const styles = StyleSheet.create({
    centerText: {
      flex: 1,
      fontSize: 18,
      padding: 32,
      color: '#777'
    },
    textBold: {
      fontWeight: '500',
      color: '#000'
    },
    buttonText: {
      fontSize: 21,
      color: 'rgb(0,122,255)'
    },
    buttonTouchable: {
      padding: 16
    }, 
      rectangleContainer: {
        width:"100%",
        height:"100%",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent"
      },
    
      rectangle: {
        position:"relative",
        height: rectDimensions,
        width: rectDimensions,
        borderWidth: rectBorderWidth,
        borderColor: rectBorderColor,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
        zIndex:3
      },
    
      topOverlay: {
        flex: 1.5,
        height: SCREEN_WIDTH,
        width: SCREEN_WIDTH,
        backgroundColor: overlayColor,
        justifyContent: "center",
        alignItems: "center"
      },
    
      bottomOverlay: {
        flex: 1,
        height: SCREEN_WIDTH,
        width: SCREEN_WIDTH,
        backgroundColor: overlayColor,
        paddingBottom: SCREEN_WIDTH * 0.25
      },
    
      leftAndRightOverlay: {
        height: SCREEN_WIDTH * 0.65,
        flex:1,
        backgroundColor: overlayColor
      },
    
      scanBar: {
        width: scanBarWidth,
        height: scanBarHeight,
        backgroundColor: scanBarColor
      } 
  });