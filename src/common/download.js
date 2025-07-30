import { Platform , PermissionsAndroid, Share} from 'react-native';
import RNFS from 'react-native-fs'; 
import RNBlobUtil from 'react-native-blob-util';
 
const requestStoragePermission = async () => {
  if (Platform.OS === 'android' && Platform.Version < 29) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'Quyền lưu tệp',
        message: 'Ứng dụng cần quyền để lưu tệp vào thiết bị',
        buttonPositive: 'Đồng ý',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
};

const getFileNameFromUrl = (url) => {
  try {
    const parts = url.split('?')[0].split('/');
    const last = parts[parts.length - 1];
    if (last && last.includes('.')) return last;
  } catch {}
  return `file_${Date.now()}.bin`; // fallback
};

export const downloadAndHandleFile = async (fileUrl) => {
  const fileName = getFileNameFromUrl(fileUrl);
  console.log('📥 downloadAndHandleFile:', fileUrl);
  if (Platform.OS === 'android') {
    try {
      await requestStoragePermission()
      const path = RNBlobUtil.fs.dirs.DownloadDir + '/' + fileName;

      await RNBlobUtil.config({
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          title: fileName,
          description: 'Tệp đang được tải xuống',
          mediaScannable: true,
          path,
        },
      }).fetch('GET', fileUrl);

      console.log('📥 Android download complete:', path);
    } catch (err) {
      console.error('❌ Android download error:', err);
    }
  } else {
    try {
      const path = `${RNFS.DocumentDirectoryPath}/${fileName}`;

      const res = await RNFS.downloadFile({
        fromUrl: fileUrl,
        toFile: path,
      }).promise;

      if (res.statusCode === 200) {
        console.log('📥 iOS download complete:', path);
 
        await Share.share({
          url: 'file://' + path,
          failOnCancel: false,
        });
      } else {
        console.warn('❌ iOS download failed:', res.statusCode);
      }
    } catch (err) {
      console.error('❌ iOS error:', err, fileUrl);
    }
  }
};