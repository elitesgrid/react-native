//import liraries
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { WebView } from 'react-native-webview';
import Video from 'react-native-video';

import HeaderComp from '../../Components/HeaderComp';
import PortalService from '../../Services/apis/PortalService';
// create a component
export const Player = (props) => {
    const { route, navigation } = props;
    const webViewRef = React.useRef(null);
    const { params } = route;

    const [isLoading, setIsLoading] = useState(true);
    const [videoType, setVideoType] = useState("");
    const [loadUrl, setLoadUrl] = useState("");

    const handleLoadStart = () => {
        setIsLoading(true);
    };

    const handleBuffer = (event) => {
        setIsBuffering(event.isBuffering);
    };

    const handleLoad = () => {
        let js = "";
        if(loadUrl.includes("zoom")){
            js = `function hide_ctrls(){var content = document.getElementById("content");                    if(content){                        var headers = content.querySelectorAll("header");                        headers.forEach(function(header) {                            header.style.display = "none";                        });                    }                                var app_content = document.getElementById("app");                    if(app_content){                        var headers = app_content.querySelectorAll("header");                        headers.forEach(function(header) {                            header.style.display = "none";                        });                    }                                var accessibilityHome = document.getElementById("accessibilityHome");                    if(accessibilityHome){                        accessibilityHome.style.display = "none";                    }                                var is_exist = document.getElementsByClassName('getty-notice');                    if(is_exist.length > 0){                        is_exist[0].style.display = 'none'                    }                                is_exist = document.getElementsByClassName('vjs-playback-range-control');                    if(is_exist.length > 0){                        is_exist[0].style.display = 'none'                    }                                is_exist = document.getElementsByClassName('trim-wrapper');                    if(is_exist.length > 0){                        is_exist[0].style.display = 'none'                    }                                is_exist = document.getElementsByClassName('mv-embed-top');                    if(is_exist.length > 0){                        is_exist[0].style.display = 'none'                    }                                is_exist = document.getElementsByClassName('mv-embed-middle');                    if(is_exist.length > 0){                        is_exist[0].style.display = 'none'                    }                                is_exist = document.getElementsByClassName('mv-embed-bottom');                    if(is_exist.length > 0){                        is_exist[0].style.display = 'none'                    }                                var floatingBtn = document.getElementById("ot-sdk-btn-floating");                    if(floatingBtn){floatingBtn.style.display = "none";}}setInterval(function () {hide_ctrls();}, 2000);`;
        }else if(loadUrl.includes("yout")){
            js = `let interval = null; let arr = ["ytp-chrome-top-buttons", "ytp-title", "ytp-youtube-button ytp-button yt-uix-sessionlink", "ytp-button ytp-endscreen-next", "ytp-button ytp-endscreen-previous", "ytp-show-cards-title", "ytp-endscreen-content", "ytp-chrome-top", "ytp-share-button", "ytp-watch-later-button", "ytp-pause-overlay", "ytp-subtitles-button", "ytp-fullscreen-button" ]; arr.forEach(function (str) { if (document.getElementsByClassName(str).length > 0) { document.getElementsByClassName(str)[0].style.display = 'none'; } }); arr.forEach(function (str) { var elements = document.getElementsByClassName(str); while (elements.length > 0) { elements[0].parentNode.removeChild(elements[0]); } }); //Zoom Download button hide var content = document.getElementById("content"); if(content !== null){ var headers = content.querySelectorAll("header"); headers.forEach(function(header) { header.style.display = "none"; }); } var css = document.createElement('style'); css.type = 'text/css'; var styles = '.ytp-contextmenu { width: 0px !important}'; if (css.styleSheet) { css.styleSheet.cssText = styles; } else { css.appendChild(document.createTextNode(styles)); } document.getElementsByTagName('head')[0].appendChild(css); if (interval !== null) { clearInterval(interval); interval = null; } function hide_buttons(){ let is_exist = document.getElementsByClassName('ytp-settings-button'); if(is_exist.length > 0){ is_exist[0].style.display = 'inline' } is_exist = document.getElementsByClassName('ytp-button'); if(is_exist.length > 0){ is_exist[0].style.display = 'inline' } is_exist = document.getElementsByClassName('ytp-iv-player-content'); if(is_exist.length > 0){ is_exist[0].style.display = 'none' } is_exist = document.getElementsByClassName('iv-branding'); if(is_exist.length > 0){ is_exist[0].style.display = 'none' } is_exist = document.getElementsByClassName('ytp-unmute-animated'); if(is_exist.length > 0){ is_exist[0].style.display = 'none' } is_exist = document.querySelectorAll('.ytp-menuitem-toggle-checkbox'); for (var i = 0; i < is_exist.length; i++) { var parent = is_exist[i].parentNode.parentNode; parent.style.display = 'none'; } document.addEventListener('contextmenu', event => event.preventDefault()); document.querySelectorAll("video").forEach(function(video) { video.addEventListener("contextmenu", function(ev) { ev.preventDefault(); }); }); } interval = setInterval(function () { hide_buttons(); }, 2000);`;
            js += ` setTimeout(function () { hide_buttons(); }, 500); setTimeout(function () { hide_buttons(); }, 1000); hide_buttons(); document.getElementsByClassName('ytp-play-button ytp-button')[0].click(); document.addEventListener('contextmenu', event => event.preventDefault());`;
        }
        //console.log(js);
        webViewRef.current.injectJavaScript(js);
        setIsLoading(false);
    };
    const extractYouTubeId = (url) => {
        // Regular expression to match YouTube video ID
        const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/;
        const match = url.match(regExp);

        if (match && match[2]) {
            return match[2];
        } else {
            return 'Invalid YouTube URL';
        }
    };

    const injectedJavaScript = `
    // Example: Change the background color of the webpage
    document.body.style.backgroundColor = 'lightblue';
  `;


    async function identifyVideoType(url) {
        console.log(url);
        let content = "";
        var zoom_meeting_url = null;
        if (url.includes("yout")) {
            let ytId = extractYouTubeId(url);
            console.log(ytId);
            content = <WebView
                key={"webView"}
                ref={webViewRef}
                style={{ flex: 1 }}
                source={{ uri: "https://www.youtube.com/embed/"+ytId }}
                clearCache={true}
                onLoad={handleLoad}
                javaScriptEnabled={true}
            />
        } else if (url.includes("http") && !url.includes("mp4")) {
            content = <WebView
                key={"webView"}
                ref={webViewRef}
                style={{ flex: 1 }}
                source={{ uri: url }}
                clearCache={true}
                onLoad={handleLoad}
                javaScriptEnabled={true}                
            />
        } else if (!isNaN(parseInt(url))) {
            setVideoType("Zoom");
            zoom_meeting_url = await PortalService.generate_zoom_url({meeting_id:url})
            if(zoom_meeting_url.data==1){
                content = <Video source={{ uri: zoom_meeting_url.url }}
                                ref={(ref) => {
                                    this.player = ref
                                }}
                                // onBuffer={this.onBuffer}
                                // onError={this.videoError}
                                style={styles.video}
                                controls={true}
                            />
            }else{
                Alert.alert("Url not found on zoom for this video.");
            }
        } else {//Mp4,Mkv
            setVideoType("mp4");
            content = <Video source={{ uri: params.url }}
                ref={(ref) => {
                    this.player = ref
                }}
                // onBuffer={this.onBuffer}
                // onError={this.videoError}
                style={styles.video}
                controls={true}
            />
        }
        setVideoType(content);
        //console.log(content);
        setIsLoading(false);
    }

    useEffect(function () {
        const unsubscribe = navigation.addListener('focus', () => {
            //params.url = "https://www.youtube.com/watch?v=oIsf_sAzgK8";
            setLoadUrl(params.url);
            identifyVideoType(params.url);
        });
    }, [navigation, params]);

    return (
        <>
            {
                isLoading ?
                    (
                        <LoadingComp />
                    )
                    :
                    (
                        <View style={[styles.container]}>
                            <HeaderComp headerTitle={params.title} />
                            {videoType}
                        </View>
                    )
            }
        </>
    )
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    video: {
        width: '100%',
        height: 250,
    }
});