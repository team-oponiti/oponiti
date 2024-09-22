import {
  Dimensions,
  PixelRatio,
  Platform as PlatformBase,
  StatusBar,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const { height: heightScreen, width: widthScreen } = Dimensions.get('screen');

class PBase {
   deviceWidth = width;
   deviceHeight = height;
   screenHeight = heightScreen;
   sHeight = heightScreen;
   sWidth = widthScreen;
   bottomNavigatorBarHeight = Math.max(
    0,
    heightScreen - (StatusBar.currentHeight || 24) - height,
  );
   platform = PlatformBase.OS;
   borderWidth = 1.5 / PixelRatio.getPixelSizeForLayoutSize(1);
   baseScreenWith = 375;
   baseScreenHeight = 667;
   select = PlatformBase.select;
   OS = PlatformBase.OS;
   SizeScale = (size = 12) => {
    const scaleWidth = this.deviceWidth / this.baseScreenWith;
    const scaleHeight = this.deviceHeight / this.baseScreenHeight;
    const scale = Math.min(scaleWidth, scaleHeight);
    return Math.ceil(scale * size);
  };
}

export const Platform = new PBase();
