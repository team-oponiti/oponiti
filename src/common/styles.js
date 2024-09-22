/* eslint-disable prettier/prettier */

import React, { Node } from 'react';
import {
  StyleSheet,
  Platform
} from 'react-native';

export default StyleSheet.create({
  ActivityIndicatorStyle: {
    flex: 1,
    justifyContent: "center",
  },
  flexContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 0,
    backgroundColor: "#FFFFFF"
  },
  tabBarContainer: {

    backgroundColor: "#ffffff",
    height: 70,
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 16,
    justifyContent: "space-between",
    shadowOffset: {
      width: 0,
      height: -20
    },
    shadowOpacity: 0.1,
    shadowRadius: 8
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
  tabarItemContainer: {
    alignItems: "center",
    flexDirection: "column",
    maxWidth: 200,
    height: 56,
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: "transparent",
    justifyContent: "center"
  },
  tabbarItemTitle: {

  }
});