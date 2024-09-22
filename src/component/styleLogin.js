
import React, {Node} from 'react'; 
import { 
  StyleSheet, 
} from 'react-native'; 


export default  StyleSheet.create({
    ActivityIndicatorStyle: {
      flex: 1,
      justifyContent: "center",
    },
    flexContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 0,
        backgroundColor: 'black'
    },
    tabBarContainer: {
      backgroundColor: "#EEFAFC",
      height: 56,
      alignItems: "center",
      flexDirection: "row",
      paddingHorizontal: 16,
      justifyContent: "space-between",
    },
    button: {
      fontSize: 24,
    },
    arrow: {
      color: "#ef4771",
    },
    icon: {
      width: 20,
      height: 20,
    },
  });