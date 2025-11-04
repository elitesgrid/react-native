//import liraries
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  BackHandler,
  Linking,
  Dimensions,
  TouchableOpacity,
  Platform,
  Text,
  ActivityIndicator
} from 'react-native';

import Orientation from 'react-native-orientation-locker';
import { WebView } from 'react-native-webview';
import Video from 'react-native-video';
import DeviceInfo from 'react-native-device-info';
import HeaderComp from '../../Components/HeaderComp';
import PortalService from '../../Services/apis/PortalService';
import LoadingComp from '../../Components/LoadingComp';
import Colors from '../../Constants/Colors';
import envVariables from '../../Constants/envVariables';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Using existing icon set
import SystemNavigationBar from 'react-native-system-navigation-bar';

// create a component
export const Player = props => {
  const { route, navigation } = props;
  const { params } = route;
  const webViewRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [videoType, setVideoType] = useState(''); // 'youtube', 'webview', 'video'
  const [videoUrl, setVideoUrl] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoadingWebView, setIsLoadingWebView] = useState(true);

  const windowWidth = Dimensions.get('window').width;
  const videoHeight = ((windowWidth * 9) / 16) + (Platform.OS === 'android' ? 0 : 60); // 16:9 ratio

  const isTablet = DeviceInfo.isTablet();
  const isIpad =
    isTablet &&
    DeviceInfo.getDeviceType() === 'Tablet' &&
    DeviceInfo.getModel().toLowerCase().includes('ipad');

  let currentTime = params.watched_time || 0;

  const toggleFullscreen = useCallback(() => {
    try {
      if (isFullscreen) {
        changeOrientation(true, true);
      } else {
        changeOrientation(false, true);
      }
      setIsFullscreen(prev => !prev);
    } catch (err) {
      console.log('Orientation error:', err);
    }
  }, [isFullscreen]);

  const handleLoad = () => {
    let js = '';
    if (videoUrl.includes('zoom')) {
      js = 'var seek_to=' + currentTime + ';';
      if(global.SHARE_URL_ZOOM_SCRIPT && videoUrl.includes('clips/')){
        js += global.SHARE_URL_ZOOM_SCRIPT
      } else {
        js += global.ZOOM_SCRIPT
      }
    } else if (videoUrl.includes('yout')) {
      js = '(function() {' +  global.YOUTUBE_SCRIPT + '})();';
    }
    setTimeout(() => {
      console.log(js);
      webViewRef.current?.injectJavaScript(js);
    }, 500);
    setIsLoading(false);
  };

  const extractYouTubeId = url => {
    const regExp =
      /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2] ? match[2] : null;
  };

  const updateVideoTime = async () => {
    try {
      if (!params.id) return;
      const payload = {
        type: 'video',
        file_id: params.id,
        total_seconds: params.length,
        watched_time: currentTime,
        remark: '',
      };
      await PortalService.update_video_time(payload);
    } catch (e) {
      console.log('Video time update failed:', e);
    }
  };

  const launchZoomApp = async (url) => {
    try {
      let zoomUrl = url;

      if (!url.startsWith('zoomus://') && !url.startsWith('https://')) {
        zoomUrl = `zoomus://zoom.us/join?confno=${url}`;
      }

      const canOpenZoomScheme = await Linking.canOpenURL('zoomus://');
      if (canOpenZoomScheme) {
        await Linking.openURL(zoomUrl);
        return;
      }

      const canOpenHttps = await Linking.canOpenURL(url);
      if (canOpenHttps) {
        await Linking.openURL(url);
        return;
      }

      Alert.alert('Zoom Not Installed', 'Please install the Zoom app.', [
        {
          text: 'Install Zoom',
          onPress: () =>
            Linking.openURL(envVariables.STORE_LINK_ZOOM),
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    } catch (error) {
      console.log('Error launching Zoom:', error);
      Alert.alert('Error', 'Something went wrong while opening Zoom.');
    }
  };

  async function identifyVideoType(url) {
    try {
      setIsLoading(true);
      console.log("url", url, params.webview);

      let vt = "";
      let vu = "";
      if(url.includes('dev-yt')){
          console.log('dev-yt', url);
          vt = 'youtube';
          vu = url.replace('dev-yt', '');
      } else if (url.includes('youtu')) {
        // YouTube
        const ytId = extractYouTubeId(url);
        if (ytId) {
          vt = 'youtube';
          vu = 'https://www.youtube-nocookie.com/embed/' + ytId + '?autoplay=1&playsinline=1&modestbranding=1&rel=0&showinfo=0&controls=1';
        } else {
          Alert.alert('Invalid YouTube URL');
        }
      } else if ((url.includes('http') && !url.includes('mp4')) || params.webview) {
        if (!isNaN(parseInt(url))) {
          zoom_meeting_url = await PortalService.generate_zoom_url({
            meeting_id: url,
            play_url: 1,
          });
          if (zoom_meeting_url.data == 1) {
            vu = zoom_meeting_url.play_url;
            vt = 'video';
          } else {
            Alert.alert('Url not found on zoom for this video.');
          }
        } else {
          if (params.video_type === '6') {
            launchZoomApp(url);
            navigation.goBack();
            return;
          }
          vt = 'webview';
          vu = url
        }
      } else if (!isNaN(parseInt(url))) {
        vt = 'video';
        try {
          zoom_meeting_url = await PortalService.generate_zoom_url({
            meeting_id: url,
          });
          console.log(zoom_meeting_url);
          if (zoom_meeting_url.data == 1) {
            vu = zoom_meeting_url.url;
          } else {
            Alert.alert('Url not found on zoom for this video.');
          }
        } catch (e) {
          console.log(e);
        }
      } else {
        // Raw Video (mp4 / mkv)  
        vt = 'video';
        vu = url;
      }

      console.log("video type:", vt,", video url:", vu);
      setVideoType(vt);
      setVideoUrl(vu);
    } catch (e) {
      console.log('Video detect error:', e);
    } finally {
      setIsLoading(false);
    }
  }


  const changeOrientation = async function(portrait, force) {
    Orientation.getDeviceOrientation(async (orientation) => {
      if ((orientation !== 'LANDSCAPE-LEFT' && orientation !== 'LANDSCAPE-RIGHT') || force) {
        if (portrait) {
          Orientation.lockToPortrait();
          if (Platform.OS === 'android') {
            await SystemNavigationBar.navigationShow(); // hides nav + status bar
          }
        } else {
          Orientation.lockToLandscape();
          if (Platform.OS === 'android') {
            await SystemNavigationBar.navigationHide(true);
          }
        }
      } else {
        setIsFullscreen(true);
      }
    });
  }

  const handleBackPress = () => {
    if(isFullscreen){
      toggleFullscreen();
      return;
    }
    updateVideoTime();
    if (isFullscreen){
      changeOrientation(true, false)
      SystemNavigationBar.navigationShow();
    }
    Orientation.unlockAllOrientations()
    navigation.goBack();
    return true;
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );
    return () => backHandler.remove();
  }, [isFullscreen]);

  useEffect(() => {
    changeOrientation(true, false);
    // console.log('SystemNavigationBar:', SystemNavigationBar);
    SystemNavigationBar.navigationShow();
    const unsubscribe = navigation.addListener('focus', () => {
      identifyVideoType(params.url);
    });

    navigation.addListener('blur', async () => {
      await updateVideoTime();
      setVideoType('');
      setVideoUrl('');
    });

    return unsubscribe;
  }, [navigation, params, 2]);

  const renderPlayer = () => {
    const playerHeight = isFullscreen ? '100%' : videoHeight;
    const playerWidth = '100%';

    switch (videoType) {
      case 'youtube':
        return (
          <View
            style={{
              width: playerWidth,
              height: playerHeight,
              backgroundColor: 'black',
            }}>
            <WebView
              key={`webview-${videoType}-${isFullscreen ? 'land' : 'port'}`}
              ref={webViewRef}
              style={{ flex: 1 }}
              source={{ 
                uri: videoUrl,
                headers: {
                  Referer: 'https://www.youtube-nocookie.com/',
                  Origin: 'https://www.youtube-nocookie.com/',
                  'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
                }
              }}
              onLoad={handleLoad}
              onLoadStart={() => setIsLoadingWebView(true)}
              onLoadEnd={() => {
                setTimeout(() => {
                  setIsLoadingWebView(false);
                }, 3000);
              }}
              javaScriptEnabled
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction
              userAgent={
                isIpad
                  ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
                  : undefined
              }
              onMessage={(event) => {
                try {
                  const msg = JSON.parse(event.nativeEvent.data);
                  if (msg.type === 'fullscreen') {
                    setIsFullscreen(msg.value);
                    console.log('Fullscreen changed:', msg.value);
                  }
                } catch {}
              }}
            />
            {isLoadingWebView && (
              <View
                style={{
                  ...StyleSheet.absoluteFillObject,
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 2,
                }}>
                <ActivityIndicator size="large" color="#fff" />
              </View>
            )}
            {
              !isFullscreen && Platform.OS === 'android' && <TouchableOpacity
              onPress={toggleFullscreen}
              style={styles.fullscreenBtn}>
                <Text style={{ textAlign: 'center', justifyContent: 'center' }}>
                  <Icon name={isFullscreen ? "fullscreen-exit" : "fullscreen"} size={22} color="#fff" />
                </Text>
              </TouchableOpacity>
            }
          </View>
        );
      case 'webview':
        return (
          <View
            style={{
              width: playerWidth,
              height: playerHeight,
              backgroundColor: 'black',
            }}>
            <WebView
              key={`webview-${videoType}-${isFullscreen ? 'land' : 'port'}`}
              ref={webViewRef}
              style={{ flex: 1 }}
              source={{ uri: videoUrl }}
              onLoad={handleLoad}
              onLoadStart={() => setIsLoadingWebView(true)}
              onLoadEnd={() => {
                setTimeout(() => {
                  setIsLoadingWebView(false);
                }, 3000);
              }}
              javaScriptEnabled
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction
              userAgent={
                isIpad
                  ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
                  : undefined
              }
              onMessage={(event) => {
                try {
                  const msg = JSON.parse(event.nativeEvent.data);
                  console.log(msg);
                  if (msg.type === 'fullscreen') {
                    setIsFullscreen(msg.value);
                    console.log('Fullscreen changed:', msg.value);
                  }
                } catch {}
              }}
            />
            {isLoadingWebView && (
              <View
                style={{
                  ...StyleSheet.absoluteFillObject,
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 2,
                }}>
                <ActivityIndicator size="large" color="#fff" />
              </View>
            )}
            {
              !isFullscreen && Platform.OS === 'android' && <TouchableOpacity
              onPress={toggleFullscreen}
              style={styles.fullscreenBtn}>
                <Text style={{ textAlign: 'center', justifyContent: 'center' }}>
                  <Icon name={isFullscreen ? "fullscreen-exit" : "fullscreen"} size={22} color="#fff" />
                </Text>
              </TouchableOpacity>
            }
          </View>
        );
      case 'video':
        return (
          <View
            style={{
              width: playerWidth,
              height: playerHeight,
              backgroundColor: 'black',
            }}>
            <Video
              source={{ uri: videoUrl }}
              style={{ width: '100%', height: '100%' }}
              controls
              resizeMode="contain"
              onProgress={data => (currentTime = parseInt(data.currentTime))}
              onFullscreenPlayerWillPresent={() => changeOrientation(false, true)}
              onFullscreenPlayerWillDismiss={() => changeOrientation(true, true)}
            />
          </View>
        );

      default:
        return (
          <View
            style={{
              width: '100%',
              height: videoHeight,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={{ color: Colors.IDLE }}>No video available</Text>
          </View>
        );
    }
  };

  return (
    <>
      {isLoading ? (
        <LoadingComp />
      ) : (
        <View style={styles.container}>
          {
            !isFullscreen ?
             <HeaderComp onPressBack={handleBackPress} headerTitle={params.title} />
             : <TouchableOpacity
                onPress={handleBackPress}
                style={{
                  position: 'absolute',
                  alignItems:'center',
                  justifyContent:'center',
                  top: 20,
                  left: 12,
                  backgroundColor: 'rgba(155, 155, 155, 0.3)', // semi-transparent
                  padding: 8,
                  borderRadius: 8,
                  zIndex: 99999
                }}
                activeOpacity={0.7} // adds click feedback
              >
                <Icon name="arrow-left" size={22} color="#fff" />
              </TouchableOpacity>
          }
          {renderPlayer()}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  fullscreenBtn: {
    position: 'absolute',
    bottom: 14,
    right: 8,
    backgroundColor: 'rgba(71, 69, 69, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
});
