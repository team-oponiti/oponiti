export default `(function (window) {
  window.promiseReadData = null;

  if (window.WebViewBridge) {
    return;
  }
  if (window.dataTask == null) {
    window.dataTask = {}
  }
  var rnWebview = window.ReactNativeWebView
  var doc = window.document;
  doc.addEventListener("message", message => {
      callFunc(WebViewBridge.onMessage, message.data);
  });
  function callFunc(func, message) {
    if ('function' === typeof func) {
      func(message);
    }
  }
  
  var WebViewBridge = {
    send: function (message) {
       
      var rnWebview = window.ReactNativeWebView
      if ('string' !== typeof message) {
          callFunc(WebViewBridge.onError, "message is type '" + typeof message + "', and it needs to be string");
          return;
      }
      if (rnWebview == null){ 
      } else {
       rnWebview.postMessage(message);
      }
    },
    onMessage: null,
    onError: null
  };
  window.WebViewBridge = WebViewBridge; 
}(window)); 
if (window.appBridge == null) {
  function getcookie(name = '') {
    let cookies = document.cookie;
    let cookiestore = {};
    
    cookies = cookies.split(";");
    
    if (cookies[0] == "" && cookies[0][0] == undefined) {
        return undefined;
    }
    
    cookies.forEach(function(cookie) {
        cookie = cookie.split(/=(.+)/);
        if (cookie[0].substr(0, 1) == ' ') {
            cookie[0] = cookie[0].substr(1);
        }
        cookiestore[cookie[0]] = cookie[1];
    });
    
    return (name !== '' ? cookiestore[name] : cookiestore);
}

    function setCookie(cName, cValue, cDay)
    {
      var expire = new Date();
          expire.setDate(expire.getDate() + cDay);
          cookies = cName + '=' + escape(cValue) + '; path=/ '; // Ã­â€¢Å“ÃªÂ¸â‚¬ ÃªÂ¹Â¨Ã¬Â§ï¿½Ã¬ï¿½â€ž Ã«Â§â€°ÃªÂ¸Â°Ã¬Å“â€žÃ­â€¢Â´ escape(cValue)Ã«Â¥Â¼ Ã­â€¢Â©Ã«â€¹Ë†Ã«â€¹Â¤.
          if(typeof cDay != 'undefined') cookies += ';expires=' + expire.toGMTString() + ';';
          document.cookie = cookies;
    }

    var AppBridge = function (){
    }
    AppBridge.prototype = {
      onDataFromTask: function (messages) {
        var message = JSON.parse(messages)
        var uuid = message.id
        if ( window.dataTask[uuid]  == null ) {
          return
        }
        var task =  window.dataTask[uuid] 
        if (message.error) {
          task.reject(message.msg)
        } else {
          task.resolve(message.data)
        }
      },
      createDataTask: function (taskName, params, timeoutX = 10000) {
         var uuid = __guidGenerator() 
        
         var promis = new Promise(function(resolve, reject) {
          var timeout = setTimeout(function(){
              window.dataTask[uuid] =  null
              reject("timeout")
          }, timeoutX)
          
          window.dataTask[uuid] = {resolve, reject, timeout} 
        }) 
        
        window.WebViewBridge.send(JSON.stringify({type:"task",id:uuid, name: taskName, params: params})) 
        return promis
      },
      onReadedData: function(data) { 
        window.promiseReadData.resolve(data)
        window.promiseReadData = null
      },
    readLocalData: function() {
      if (window.promiseReadData != null) {
        window.promiseReadData.reject()
      }
      var promis = new Promise(function(resolve, reject) {
        window.promiseReadData = {resolve, reject} 
      }) 
      window.WebViewBridge.send(JSON.stringify({type:"readlocal",data:{}}))
      return promis;
    },
    writeLocalData: function (value) {
      window.WebViewBridge.send(JSON.stringify({type:"writelocal",data:value}))
    },
    setUserToken: function (value) {
      setCookie('test', "2", 1000); 
      window.WebViewBridge.send(JSON.stringify({type:"set-token",data:value}))
    },
    openCart: function(){
      window.WebViewBridge.send(JSON.stringify({type:"open",data:"cart"}))
    },
    loginSuccess:function(token){
      window.WebViewBridge.send(JSON.stringify({type:"open",data:"loginSuccess",token: token}))
    },
    openLogin: function(){
      window.WebViewBridge.send(JSON.stringify({type:"open",data:"login"}))
    },
    getLocationPermission: function() {
      return this.createDataTask("getLocationPermission")
    },
    getLocation: function() {
      return this.createDataTask("getLocation")
    },
    clearCache: function(){ 
      setCookie('test', "1", 1000); 
      return true
    },
    badgeMain: function(value){
      window.WebViewBridge.send(JSON.stringify({type:"badge-main",data:value}))
    },
    badgeTab: function(tab,value){
    
      window.WebViewBridge.send(JSON.stringify({type:"badge-tab",data:{tab,value}}))
    },
    close: function (data) {
      window.WebViewBridge.send(JSON.stringify({type:"open",data:"close",params: data}))
    },
    startMain: function (url) {
      setCookie('test', "2", 1000); 
      window.WebViewBridge.send(JSON.stringify({type:"open",data:"main",cookie: document.cookie, url: url}))
    },
    qrCode: function (groupId, token) {
      window.WebViewBridge.send(JSON.stringify({type:"open",data:"qrScane",params:{groupId, token}}))
    },
    logout: function () {
      setCookie('test', "3", 1000); 
      window.WebViewBridge.send(JSON.stringify({type:"logout",data:""}))
    },
    setLanguage: function(local) {
      setCookie('test', "4", 1000); 
      window.WebViewBridge.send(JSON.stringify({type:"language",data:local}))
    },clearCookie: function(){
    //  window.WebViewBridge.send(JSON.stringify({type:"clearCookie",data:""}))
    },socialLogin: function(type){
      window.WebViewBridge.send(JSON.stringify({type:"socialLogin",data:type}))
    },log: function(){ 
      window.WebViewBridge.send(JSON.stringify({type:"log",data:JSON.stringify(arguments)}))
    }, refresh: function(){ 
      window.WebViewBridge.send(JSON.stringify({type:"refresh",data:""}))
    }, getAppName: function(){ 
      return window.kma.appName || window.giaynhap.appName 
    }, getAppVersionCode: function(){
      return window.kma.appVersionCode || window.giaynhap.appVersionCode 
    }, getAppVersionName: function(){
      return window.kma.appVersionName || window.giaynhap.appVersionName 
    }, getOSName: function(){  
      return window.kma.osName  || window.giaynhap.osName 
    }, getOSType: function(){
      return window.kma.osType || window.giaynhap.osType 
    },getLatitude: function(){
      return window.kma.lat || window.giaynhap.lat 
    },getLongitude: function(){
      return window.kma.lng || window.giaynhap.lng 
    },getDeviceID: function(){
      return window.kma.deviceId || window.giaynhap.deviceId 
    },getFcmToken: function(){
      return window.kma.pushToken || window.giaynhap.pushToken || "Khong duoc"
    },getLanguage: function(){
      return window.kma.language || window.giaynhap.language || 'vi'
    },getCountryCode: function(){
      return window.kma.country  || window.giaynhap.country
    },getTimeZone: function(){
      return window.kma.timeZone || window.giaynhap.timeZone
    },getUserToken: function(){
      appBridge.log(window.giaynhap.userToken)
      return window.giaynhap.userToken
    },getOSVersion: function(){ 
      return window.kma.osVersion || window.giaynhap.osVersion
    },openAppSetting: function(){ 
      window.WebViewBridge.send(JSON.stringify({type:"open",data:"setting",cookie: document.cookie}))
    },  setEnableScroll: function(value){
      window.WebViewBridge.send(JSON.stringify({type:"disableScroll",data: value}))
    },
    setTimestamp(value){
      window.WebViewBridge.send(JSON.stringify({type:"set-time-stamp",data:value}))
    },
    setListenBackAction(value){
      window.WebViewBridge.send(JSON.stringify({type:"listent-back",data:value}))
    },
    openActivity(url) {
      window.WebViewBridge.send(JSON.stringify({type:"open-activity",data: url})) 
    },
    openUserApp(url) {
      window.WebViewBridge.send(JSON.stringify({type:"open-app",data: url})) 
    },
    navigateTo(url, param) {
      window.WebViewBridge.send(JSON.stringify({type:"navigate",data: url, params: param})) 
    }, setDisplayBottomNavigation(value) {
      window.WebViewBridge.send(JSON.stringify({type:"hide-navigation",data: value})) 
    },getRefreshToken: function(){
      return window.giaynhap.refreshToken
    },setRefreshToken: function (value) { 
      window.giaynhap.refreshToken = value
      window.WebViewBridge.send(JSON.stringify({type:"set-refresh",data:value}))
    },

   
  }; 
 if (window.kma == null) {  
  window.kma = window.giaynhap || {}
 }  
  window.appBridge = new AppBridge();  
  setCookie('test', "5", 1000); 
}  

if (window.navigator != null) {
    window.navigator.share = function(param)  {
      window.WebViewBridge.send(JSON.stringify({type:"share",data:param}))
    };
    if ( window.navigator.clipboard != null) {
      window.navigator.clipboard.writeText =  function(param)  {
        window.WebViewBridge.send(JSON.stringify({type:"copy-text",data:param}))
      }
    } else {
      window.navigator.clipboard =  {writeText : function(param)  {
        window.WebViewBridge.send(JSON.stringify({type:"copy-text",data:param}))
      }}
    } 
  } else {
    window.navigator = {
      share: function(param)  {
      window.WebViewBridge.send(JSON.stringify({type:"share",data:param}))
    }, 
    clipboard: {
      writeText: function(param)  {
        window.WebViewBridge.send(JSON.stringify({type:"copy-text",data:param}))
      }, 
    }
  };
}
 

function __guidGenerator() {
  var S4 = function() {
      return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
  };
  return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
} 
`