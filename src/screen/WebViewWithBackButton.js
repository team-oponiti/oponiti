import { useNavigation } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
 import { WebView } from 'react-native-webview';

const WebViewWithBackButton = (props) => {
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [title, setTitle] = useState('');
    const  navigation = useNavigation();
  const handleBackPress = () => {
    navigation.goBack()
  };
  const data =  props.route.params.data
  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBackPress} 
          style={[styles.backButton]}
        > 
          <Image  
            style={{width: 32, height:32}}
            source={require("../asset/images/chevron.png")}  />
         
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {title || ' '}
        </Text>
        <View  style={{width: 32, height:32}} ></View>
      </View>
  
      <WebView
      style={{
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 0,
        backgroundColor: "#FFFFFF"
      }}
        ref={webViewRef}
        source={{ uri: data.href }}
        onNavigationStateChange={(navState) => {
          setCanGoBack(navState.canGoBack);
          setTitle(navState.title || ' ');
        }}
        startInLoadingState={true} 
      />
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    padding: 10,
  },
  disabledButton: {
    opacity: 0.5,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loading: {
    textAlign: 'center',
    marginTop: 20,
  },
});

export default WebViewWithBackButton;