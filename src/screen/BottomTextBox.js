
import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react"

import {Image,SafeAreaView,StyleSheet, View, Text, TextInput, TouchableOpacity} from 'react-native';
import { appPrimaryColor } from "../define/config";
 

const styles = StyleSheet.create({
    input: { 
      margin: 6, 
      paddingHorizontal: 18,
      flex: 1,
      backgroundColor: "#F6F6F6",
      borderRadius: 21,
      paddingTop: 12,
      paddingBottom: 12,
        maxHeight: 100
    },
    container: {
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: "#FFFFFF",
        justifyContent: 'center',
        alignItems:"center",
        paddingHorizontal: 20,
       
    },
    buttonAdd:{ 
        width: 34,
        height: 34, 
        justifyContent: 'center',
        alignItems:"center",
        borderRadius: 17
    },
    buttonSend:{ 
        width: 34,
        height: 34,
        backgroundColor: "#CFCFCF",
        justifyContent: 'center',
        alignItems:"center",
        borderRadius: 17
    },
    buttonSendActive:{ 
        width: 34,
        height: 34,
        backgroundColor: appPrimaryColor,
        justifyContent: 'center',
        alignItems:"center",
        borderRadius: 17
    },
    buttonAddIcon: {
        width: 16,
        height: 16, 
        objectFit: "contain",
        resizeMode: "contain"
    },
    buttonSendIcon: {
        width: 16,
        height: 16, 
        objectFit: "contain",
        resizeMode: "contain",
        marginLeft: 3
    }
  });
export const BottomTextBox = forwardRef(({webview,isEnable,onChange}, ref) => {
    const [value, setValue] = useState("")
    const [isActive, setIsActive] = useState(false)
    const [height, setHeight] = useState(42)
    useEffect(()=> {
        setIsActive(isEnable)
    }, [isEnable])
    const onChangeText = (text)=>{
       try {
            setValue(text) 
            //setIsActive(text.length > 0)
            onChange(text.length > 0)
        } catch(e){}
    }

    useImperativeHandle(ref, () => {
        return {
            send:() => {
                onSend()
            }
        }
    })

    const onSend = ()=> {
        if ( !isActive ) {
            return
        }
        if (webview == null) {
            return 
        }
        try {
            let sendValue = JSON.stringify( {text: value})
            let script = ` window.onAppChatInput(${sendValue}) `
             webview.injectJavaScript(script)
             setValue("")
            // setIsActive(false)
             onChange(false)
        } catch(e){}
    }

    const onSelectImage = ()=> { 
        if (webview == null) {
            return 
        }
        try {
 
        let script = `window.onTappSelectImage() `
         webview.injectJavaScript(script)
 
        } catch (e){}
    }

    
    return <View>
        <View style= {styles.container} >
        <TouchableOpacity
        onPress={()=> {
            onSelectImage()
        }}
      >
        <View style={styles.buttonAdd}>
            <Image  
            source={require("../asset/images/ic_add.png")} style={styles.buttonAddIcon} />
        </View>
        </TouchableOpacity>
        <TextInput
        placeholderTextColor={"#AAAAAA"}
        style={styles.input}
        onChangeText={onChangeText}
        value={value}
        placeholder="메세지를 입력하세요."
        keyboardType="default"
        multiline={true}
      />
      <TouchableOpacity
        onPress={()=> {
            onSend()
        }}
      >
      <View style={isActive ?  styles.buttonSendActive : styles.buttonSend} 
       >
        
            <Image  
            source={require("../asset/images/ic_send.png")} style={ styles.buttonSendIcon} />
        </View>
      </TouchableOpacity>
      
    </View>
    <SafeAreaView/>
    </View>
})