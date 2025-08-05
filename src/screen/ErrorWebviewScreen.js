
import React, {useEffect, useState} from 'react';
import {Dimensions, KeyboardAvoidingView, Linking, Platform, SafeAreaView, View, Image, Text, Button, TouchableOpacity} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
const SCREEN_HEIGHT = Dimensions.get("window").height;
const SCREEN_WIDTH = Dimensions.get("window").width;


export default ErrorWebView = (props) => {


    return <ScrollView style={{height: SCREEN_HEIGHT - 60, position:'absolute', top:0, left: 0, width: SCREEN_WIDTH,  backgroundColor: "white"}}>
                <View style={{alignItems:'center', padding: 20, paddingBottom: 200}}>
                    <View style={{height: '50%'}}></View>
                <Image style={{width: 80, height: 80, resizeMode: 'contain'}} source={require("../asset/images/internet.png")}></Image>
                <Text style={{textAlign: 'center',marginTop: 18, fontSize: 18, color:"#181E32", fontWeight:"bold"}} >{props.title}</Text>

                <Text style={{paddingVertical: 2, marginTop: 8, textAlign: 'center', fontSize: 15, lineHeight: 22, color:"#181E32"}} >{props.message}</Text>
                <View style={{height: 24}}></View>
                <TouchableOpacity onPress={props.onRefresh}>
                    <View style={{backgroundColor:'#00C271', paddingHorizontal: 18, paddingVertical: 8, borderRadius: 18}}>
                        <Text style = {{fontSize: 15, color: 'white', fontWeight: '600'}}>{props.button || "Try again"}</Text>
                    </View>
                </TouchableOpacity>
                </View>
        </ScrollView>
}