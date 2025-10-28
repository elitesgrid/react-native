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
  Text
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

  const windowWidth = Dimensions.get('window').width;
  const videoHeight = (windowWidth * 9) / 16; // 16:9 ratio

  const isTablet = DeviceInfo.isTablet();
  const isIpad =
    isTablet &&
    DeviceInfo.getDeviceType() === 'Tablet' &&
    DeviceInfo.getModel().toLowerCase().includes('ipad');

  let currentTime = params.watched_time || 0;

  const changeOrientation = async function(portrait, force) {
    Orientation.getDeviceOrientation(async (orientation) => {
      if ((orientation !== 'LANDSCAPE-LEFT' && orientation !== 'LANDSCAPE-RIGHT') || force) {
        if (portrait) {
          Orientation.lockToPortrait();
          if (Platform.OS === 'android') {
            await SystemNavigationBar.stickyImmersive(true); // hides nav + status bar
          }
        } else {
          Orientation.lockToLandscape();
          if (Platform.OS === 'android') {
            await SystemNavigationBar.stickyImmersive(true); // hides nav + status bar
          }
        }
      } else {
        setIsFullscreen(true);
      }
    });
  }

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
      js = `function hide_ctrls(){var content = document.getElementById("content");                    if(content){                        var headers = content.querySelectorAll("header");                        headers.forEach(function(header) {                            header.style.display = "none";                        });                    }                                var app_content = document.getElementById("app");                    if(app_content){                        var headers = app_content.querySelectorAll("header");                        headers.forEach(function(header) {                            header.style.display = "none";                        });                    }                                var accessibilityHome = document.getElementById("accessibilityHome");                    if(accessibilityHome){                        accessibilityHome.style.display = "none";                    }                                var is_exist = document.getElementsByClassName('getty-notice');                    if(is_exist.length > 0){                        is_exist[0].style.display = 'none'                    }                                is_exist = document.getElementsByClassName('vjs-playback-range-control');                    if(is_exist.length > 0){                        is_exist[0].style.display = 'none'                    }                                is_exist = document.getElementsByClassName('trim-wrapper');                    if(is_exist.length > 0){                        is_exist[0].style.display = 'none'                    }                                is_exist = document.getElementsByClassName('mv-embed-top');                    if(is_exist.length > 0){                        is_exist[0].style.display = 'none'                    }                                is_exist = document.getElementsByClassName('mv-embed-middle');                    if(is_exist.length > 0){                        is_exist[0].style.display = 'none'                    }                                is_exist = document.getElementsByClassName('mv-embed-bottom');                    if(is_exist.length > 0){                        is_exist[0].style.display = 'none'                    }                                var floatingBtn = document.getElementById("ot-sdk-btn-floating");                    if(floatingBtn){floatingBtn.style.display = "none";} document.querySelectorAll('video').forEach(video => {
          video.disablePictureInPicture = true;
          video.addEventListener('enterpictureinpicture', (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
          });
        });}setInterval(function () {hide_ctrls();}, 2000);`;
      global.ZOOM_SCRIPT === '' ? '' : (js = 'var seek_to=' + currentTime + ';' + global.ZOOM_SCRIPT);
    } else if (videoUrl.includes('yout')) {
      js = `let interval = null; let arr = ["ytp-chrome-top-buttons", "ytp-title", "ytp-youtube-button ytp-button yt-uix-sessionlink", "ytp-button ytp-endscreen-next", "ytp-button ytp-endscreen-previous", "ytp-show-cards-title", "ytp-endscreen-content", "ytp-chrome-top", "ytp-share-button", "ytp-watch-later-button", "ytp-pause-overlay", "ytp-subtitles-button", "ytp-fullscreen-button"]; arr.forEach(function(str) { if (document.getElementsByClassName(str).length > 0) { document.getElementsByClassName(str)[0].style.display = 'none'; } });
       arr.forEach(function(str) { var elements = document.getElementsByClassName(str); while (elements.length > 0) { elements[0].parentNode.removeChild(elements[0]); } }); var content = document.getElementById("content"); if (content !== null) { var headers = content.querySelectorAll("header"); headers.forEach(function(header) { header.style.display = "none"; }); } var css = document.createElement('style'); css.type = 'text/css'; var styles = '.ytp-contextmenu { width: 0px !important}'; if (css.styleSheet) { css.styleSheet.cssText = styles; } else { css.appendChild(document.createTextNode(styles)); } document.getElementsByTagName('head')[0].appendChild(css); if (interval !== null) { clearInterval(interval); interval = null; } function hide_buttons() { var settingsMenu = document.querySelector('.ytp-settings-menu'); if (settingsMenu) { var menu = settingsMenu.querySelector('.ytp-panel-menu'); if (menu) { console.log("Hide Classes"); var lastChild = menu.lastElementChild; if (lastChild) { lastChild.style.display = 'none'; } } } let is_exist = document.getElementsByClassName('ytp-settings-button'); if (is_exist.length > 0) { is_exist[0].style.display = 'inline' } is_exist = document.getElementsByClassName('ytp-button'); if (is_exist.length > 0) { is_exist[0].style.display = 'inline' } is_exist = document.getElementsByClassName('ytp-iv-player-content'); if (is_exist.length > 0) { is_exist[0].style.display = 'none' } is_exist = document.getElementsByClassName('iv-branding'); if (is_exist.length > 0) { is_exist[0].style.display = 'none' } is_exist = document.getElementsByClassName('ytp-unmute-animated'); if (is_exist.length > 0) { is_exist[0].style.display = 'none' } is_exist = document.querySelectorAll('.ytp-menuitem-toggle-checkbox'); for (var i = 0; i < is_exist.length; i++) { var parent = is_exist[i].parentNode.parentNode; parent.style.display = 'none'; } document.addEventListener('contextmenu', event => event.preventDefault()); document.querySelectorAll("video").forEach(function(video) { video.addEventListener("contextmenu", function(ev) { ev.preventDefault(); }); }); } interval = setInterval(function() { hide_buttons(); }, 2000); setTimeout(function() { hide_buttons(); }, 500); setTimeout(function() { hide_buttons(); }, 1000); hide_buttons(); document.getElementsByClassName('ytp-play-button ytp-button')[0].click(); document.addEventListener('contextmenu', event => event.preventDefault());`;
      global.YOUTUBE_SCRIPT === '' ? '' : (js = global.YOUTUBE_SCRIPT);
    }
    //console.log("JS", js);
    webViewRef.current.injectJavaScript(js);
    setIsLoading(false);
  };

  // ------------------------------
  // Helper: extract YouTube ID
  // ------------------------------
  const extractYouTubeId = url => {
    const regExp =
      /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2] ? match[2] : null;
  };

  // ------------------------------
  // Update watched time
  // ------------------------------
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

  // ------------------------------
  // Launch Zoom externally if needed
  // ------------------------------
  const launchZoomApp = async url => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      Linking.openURL(url);
    } else {
      Alert.alert('Zoom Not Installed', 'Please install the Zoom app.', [
        {
          text: 'Install Zoom',
          onPress: () =>
            Linking.openURL(envVariables.STORE_LINK_ZOOM),
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  // ------------------------------
  // Identify video type & load player
  // ------------------------------
  async function identifyVideoType(url) {
    try {
      setIsLoading(true);
      console.log("url", url, params.webview);

      let vt = "";
      let vu = "";

      if (url.includes('youtu')) {
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

  // ------------------------------
  // Back Handler
  // ------------------------------
  const handleBackPress = () => {
    updateVideoTime();
    if (isFullscreen){
      changeOrientation(true, false)
      SystemNavigationBar.stickyImmersive(true);
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

  // ------------------------------
  // Load when focused
  // ------------------------------
  useEffect(() => {
    changeOrientation(true, false);
    const unsubscribe = navigation.addListener('focus', () => {
      identifyVideoType(params.url);
    });

    navigation.addListener('blur', async () => {
      await updateVideoTime();
      setVideoType('');
      setVideoUrl('');
    });

    return unsubscribe;
  }, [navigation, params]);

  // ------------------------------
  // Render: YouTube / WebView / Video
  // ------------------------------
  const renderPlayer = () => {
    const playerHeight = isFullscreen ? '100%' : videoHeight;
    const playerWidth = '100%';

    switch (videoType) {
      case 'youtube':
      case 'webview':
        return (
          <View
            style={{
              width: playerWidth,
              height: playerHeight,
              backgroundColor: 'black',
            }}>
            {
              videoType === "youtube" ? <WebView
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
                javaScriptEnabled
                allowsInlineMediaPlayback
                mediaPlaybackRequiresUserAction
                userAgent={
                  isIpad
                    ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
                    : undefined
                }
              /> : <WebView
                key={`webview-${videoType}-${isFullscreen ? 'land' : 'port'}`}
                ref={webViewRef}
                style={{ flex: 1 }}
                source={{ uri: videoUrl }}
                onLoad={handleLoad}
                javaScriptEnabled
                allowsInlineMediaPlayback
                mediaPlaybackRequiresUserAction
                userAgent={
                  isIpad
                    ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
                    : undefined
                }
              />
            }
            <TouchableOpacity
              onPress={toggleFullscreen}
              style={styles.fullscreenBtn}>
                <Text style={{ textAlign: 'center', justifyContent: 'center' }}>
                  <Icon name={isFullscreen ? "fullscreen-exit" : "fullscreen"} size={22} color="#fff" />
                </Text>
              </TouchableOpacity>
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
            />
            <TouchableOpacity
              onPress={toggleFullscreen}
              style={styles.fullscreenBtn}>
                <Text style={{ textAlign: 'center', justifyContent: 'center' }}>
                  <Icon name={isFullscreen ? "fullscreen-exit" : "fullscreen"} size={22} color="#fff" />
                </Text>
            </TouchableOpacity>
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

  // ------------------------------
  // MAIN RENDER
  // ------------------------------
  return (
    <>
      {isLoading ? (
        <LoadingComp />
      ) : (
        <View style={styles.container}>
          {
            !isFullscreen && <HeaderComp onPressBack={handleBackPress} headerTitle={params.title} />
          }
          {
            isFullscreen &&
              <TouchableOpacity
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

// ------------------------------
// Styles
// ------------------------------
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
