//import liraries
import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Alert, BackHandler, Linking} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import {WebView} from 'react-native-webview';
import Video from 'react-native-video';
import DeviceInfo from 'react-native-device-info';
import HeaderComp from '../../Components/HeaderComp';
import PortalService from '../../Services/apis/PortalService';
import LoadingComp from '../../Components/LoadingComp';
// create a component
export const Player = props => {
  const {route, navigation} = props;
  const webViewRef = React.useRef(null);
  const {params} = route;

  const [isLoading, setIsLoading] = useState(true);
  const [videoType, setVideoType] = useState('');
  var currentTime = params.watched_time || 0;
  const isTablet = DeviceInfo.isTablet();
  const isIpad = isTablet && DeviceInfo.getDeviceType() === 'Tablet' && DeviceInfo.getModel().toLowerCase().includes('ipad');

  var loadUrl = '';

  const handleLoad = () => {
    let js = '';
    if (loadUrl.includes('zoom')) {
      js = `function hide_ctrls(){var content = document.getElementById("content");                    if(content){                        var headers = content.querySelectorAll("header");                        headers.forEach(function(header) {                            header.style.display = "none";                        });                    }                                var app_content = document.getElementById("app");                    if(app_content){                        var headers = app_content.querySelectorAll("header");                        headers.forEach(function(header) {                            header.style.display = "none";                        });                    }                                var accessibilityHome = document.getElementById("accessibilityHome");                    if(accessibilityHome){                        accessibilityHome.style.display = "none";                    }                                var is_exist = document.getElementsByClassName('getty-notice');                    if(is_exist.length > 0){                        is_exist[0].style.display = 'none'                    }                                is_exist = document.getElementsByClassName('vjs-playback-range-control');                    if(is_exist.length > 0){                        is_exist[0].style.display = 'none'                    }                                is_exist = document.getElementsByClassName('trim-wrapper');                    if(is_exist.length > 0){                        is_exist[0].style.display = 'none'                    }                                is_exist = document.getElementsByClassName('mv-embed-top');                    if(is_exist.length > 0){                        is_exist[0].style.display = 'none'                    }                                is_exist = document.getElementsByClassName('mv-embed-middle');                    if(is_exist.length > 0){                        is_exist[0].style.display = 'none'                    }                                is_exist = document.getElementsByClassName('mv-embed-bottom');                    if(is_exist.length > 0){                        is_exist[0].style.display = 'none'                    }                                var floatingBtn = document.getElementById("ot-sdk-btn-floating");                    if(floatingBtn){floatingBtn.style.display = "none";} document.querySelectorAll('video').forEach(video => {
          video.disablePictureInPicture = true;
          video.addEventListener('enterpictureinpicture', (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
          });
        });}setInterval(function () {hide_ctrls();}, 2000);`;
      global.ZOOM_SCRIPT === '' ? '' : (js = 'var seek_to=' + currentTime + ';' + global.ZOOM_SCRIPT);
    } else if (loadUrl.includes('yout')) {
      js = `let interval = null; let arr = ["ytp-chrome-top-buttons", "ytp-title", "ytp-youtube-button ytp-button yt-uix-sessionlink", "ytp-button ytp-endscreen-next", "ytp-button ytp-endscreen-previous", "ytp-show-cards-title", "ytp-endscreen-content", "ytp-chrome-top", "ytp-share-button", "ytp-watch-later-button", "ytp-pause-overlay", "ytp-subtitles-button", "ytp-fullscreen-button"]; arr.forEach(function(str) { if (document.getElementsByClassName(str).length > 0) { document.getElementsByClassName(str)[0].style.display = 'none'; } });
       arr.forEach(function(str) { var elements = document.getElementsByClassName(str); while (elements.length > 0) { elements[0].parentNode.removeChild(elements[0]); } }); var content = document.getElementById("content"); if (content !== null) { var headers = content.querySelectorAll("header"); headers.forEach(function(header) { header.style.display = "none"; }); } var css = document.createElement('style'); css.type = 'text/css'; var styles = '.ytp-contextmenu { width: 0px !important}'; if (css.styleSheet) { css.styleSheet.cssText = styles; } else { css.appendChild(document.createTextNode(styles)); } document.getElementsByTagName('head')[0].appendChild(css); if (interval !== null) { clearInterval(interval); interval = null; } function hide_buttons() { var settingsMenu = document.querySelector('.ytp-settings-menu'); if (settingsMenu) { var menu = settingsMenu.querySelector('.ytp-panel-menu'); if (menu) { console.log("Hide Classes"); var lastChild = menu.lastElementChild; if (lastChild) { lastChild.style.display = 'none'; } } } let is_exist = document.getElementsByClassName('ytp-settings-button'); if (is_exist.length > 0) { is_exist[0].style.display = 'inline' } is_exist = document.getElementsByClassName('ytp-button'); if (is_exist.length > 0) { is_exist[0].style.display = 'inline' } is_exist = document.getElementsByClassName('ytp-iv-player-content'); if (is_exist.length > 0) { is_exist[0].style.display = 'none' } is_exist = document.getElementsByClassName('iv-branding'); if (is_exist.length > 0) { is_exist[0].style.display = 'none' } is_exist = document.getElementsByClassName('ytp-unmute-animated'); if (is_exist.length > 0) { is_exist[0].style.display = 'none' } is_exist = document.querySelectorAll('.ytp-menuitem-toggle-checkbox'); for (var i = 0; i < is_exist.length; i++) { var parent = is_exist[i].parentNode.parentNode; parent.style.display = 'none'; } document.addEventListener('contextmenu', event => event.preventDefault()); document.querySelectorAll("video").forEach(function(video) { video.addEventListener("contextmenu", function(ev) { ev.preventDefault(); }); }); } interval = setInterval(function() { hide_buttons(); }, 2000); setTimeout(function() { hide_buttons(); }, 500); setTimeout(function() { hide_buttons(); }, 1000); hide_buttons(); document.getElementsByClassName('ytp-play-button ytp-button')[0].click(); document.addEventListener('contextmenu', event => event.preventDefault());`;
      global.YOUTUBE_SCRIPT === '' ? '' : (js = global.YOUTUBE_SCRIPT);
    }
    webViewRef.current.injectJavaScript(js);
    setIsLoading(false);
  };
  const extractYouTubeId = url => {
    // Regular expression to match YouTube video ID
    const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/;
    const match = url.match(regExp);

    if (match && match[2]) {
      return match[2];
    } else {
      return 'Invalid YouTube URL';
    }
  };

  handleProgress = data => {
    currentTime = parseInt(data.currentTime);
  };

  async function update_video_time() {
    let payload = {
      type: 'video',
      file_id: params.id,
      total_seconds: params.length,
      watched_time: currentTime,
      remark: '',
    };
    // console.log(payload)
    setIsLoading(true);
    if (params.id !== undefined) {
      let response = await PortalService.update_video_time(payload);
    }
    // console.log(response);
  }

  const launchZoomApp = async url => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      Linking.openURL(url);
    } else {
      Alert.alert(
        'Zoom Not Installed',
        'Please install the Zoom app to join the meeting.',
        [
          {
            text: 'Install Zoom',
            onPress: () =>
              Linking.openURL('https://apps.apple.com/app/id546505307'),
          },
          {text: 'Cancel', style: 'cancel'},
        ],
      );
    }
  };

  async function identifyVideoType(url) {
    console.log(url);
    let content = '';
    var zoom_meeting_url = null;
    let which_player = 0;
    if (url.includes('yout')) {
      which_player = 1;
      let ytId = extractYouTubeId(url);
      console.log(ytId);
      content = (
        <WebView
          key={'webView'}
          ref={webViewRef}
          style={{flex: 1}}
          source={{uri: 'https://www.youtube.com/embed/' + ytId}}
          clearCache={true}
          onLoad={handleLoad}
          javaScriptEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={true}
          userAgent={
            isIpad
              ? "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
              : undefined // use default on other devices
          }
        />
      );
    } else if (
      (url.includes('http') && !url.includes('mp4')) ||
      params.webview == true
    ) {
      which_player = 2;
      if (!isNaN(parseInt(url))) {
        zoom_meeting_url = await PortalService.generate_zoom_url({
          meeting_id: url,
          play_url: 1,
        });
        console.log(zoom_meeting_url);
        if (zoom_meeting_url.data == 1) {
          url = zoom_meeting_url.play_url;
        }
        loadUrl = url;
      }
      console.log('params?.video_type', params.video_type);
      if (params.video_type === '6') {
        launchZoomApp(params.url);
        navigation.goBack(null);
        return;
      }
      content = (
        <WebView
          key={'webView'}
          ref={webViewRef}
          style={{flex: 1}}
          source={{uri: url}}
          clearCache={true}
          onLoad={handleLoad}
          javaScriptEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={true}
          onMessage={event => {
            console.log(
              'Received message from WebView:',
              event.nativeEvent.data,
            );
          }}
          userAgent={
            isIpad
              ? "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
              : undefined // use default on other devices
          }
        />
      );
    } else if (!isNaN(parseInt(url))) {
      which_player = 2;
      try {
        zoom_meeting_url = await PortalService.generate_zoom_url({
          meeting_id: url,
        });
        console.log(zoom_meeting_url);
        if (zoom_meeting_url.data == 1) {
          content = (
            <Video
              source={{uri: zoom_meeting_url.url}}
              ref={ref => {
                this.player = ref;
              }}
              // onBuffer={this.onBuffer}
              // onError={this.videoError}
              style={styles.video}
              controls={true}
              onProgress={handleProgress}
            />
          );
        } else {
          Alert.alert('Url not found on zoom for this video.');
        }
      } catch (e) {
        console.log(e);
      }
    } else {
      //Mp4,Mkv
      which_player = 3;
      content = (
        <Video
          source={{uri: params.url}}
          ref={ref => {
            this.player = ref;
          }}
          // onBuffer={this.onBuffer}
          // onError={this.videoError}
          style={styles.video}
          controls={true}
        />
      );
    }
    setVideoType(content);
    console.log(which_player);
    setIsLoading(false);
  }

  // Function to handle the back press
  const handleBackPress = () => {
    const jsFunction = 'get_current_time();';
    if(webViewRef.current){
      webViewRef.current.injectJavaScript(jsFunction);
      webViewRef.current.postMessage('backButtonPressed');
    }
    //console.log('Back Pressed');
    navigation.goBack(null);
    return true;
  };

  // Adding listener for back press on Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );

    return () => {
      backHandler.remove();
    };
  }, []);

  useEffect(
    function () {
      const unsubscribe = navigation.addListener('focus', () => {
        //params.url = "https://www.youtube.com/watch?v=oIsf_sAzgK8";
        loadUrl = params.url;
        identifyVideoType(params.url);
      });

      navigation.addListener('blur', async () => {
        await update_video_time();
        setVideoType(null);
      });
    },
    [navigation, params],
  );

  return (
    <>
      {isLoading ? (
        <LoadingComp />
      ) : (
        <View style={[styles.container]}>
          <HeaderComp
            onPressBack={handleBackPress}
            headerTitle={params.title}
          />
          {videoType}
        </View>
      )}
    </>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  video: {
    width: '100%',
    height: 250,
  },
});
