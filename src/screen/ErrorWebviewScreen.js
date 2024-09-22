
import React, {useEffect, useState} from 'react';
import {Dimensions, KeyboardAvoidingView, Linking, Platform, SafeAreaView, View, Image, Text, Button, TouchableOpacity} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
const SCREEN_HEIGHT = Dimensions.get("window").height;
const SCREEN_WIDTH = Dimensions.get("window").width;


export default ErrorWebView = (props) => {


    return<ScrollView style={{height: SCREEN_HEIGHT, position:'absolute', top:0, left: 0, width: SCREEN_WIDTH, height: SCREEN_HEIGHT, backgroundColor: "white"}}>
                <View style={{alignItems:'center', padding: 20, paddingBottom: 200}}>
                    <View style={{height: '40%'}}></View>
                <Image style={{width: 100, height: 100, resizeMode: 'contain'}} source={require("../asset/images/no_internet.png")}></Image>
                <Text style={{textAlign: 'center', fontSize: 15, color:"#181E32", fontWeight:"bold"}} >{props.title}</Text>

                <Text style={{paddingVertical: 2, textAlign: 'center', fontSize: 12, color:"#181E32"}} >{props.message}</Text>
                <View style={{height: 40}}></View>
                <TouchableOpacity onPress={props.onRefresh}>
                    <View style={{backgroundColor:'#4284F3', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8}}>
                        <Text style = {{fontSize: 15, color: 'white'}}>{props.button || "Thử lại"}</Text>
                    </View>
                </TouchableOpacity>
                </View>
        </ScrollView>
}