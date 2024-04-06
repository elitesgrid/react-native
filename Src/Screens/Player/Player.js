//import liraries
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { WebView } from 'react-native-webview';
import Video from 'react-native-video';


import HeaderComp from '../../Components/HeaderComp';
// create a component
export const Player = (props) => {
    const { route, navigation } = props;
    const { params } = route;

    const [isLoading, setIsLoading] = useState(true);
    const [videoType, setVideoType] = useState("");

    const handleLoadStart = () => {
        setIsLoading(true);
    };

    const handleBuffer = (event) => {
        setIsBuffering(event.isBuffering);
    };

    const handleLoad = () => {
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

    function identifyVideoType(url) {
        console.log(url);
        let content = null;
        if (url.includes("yout")) {
            let ytId = extractYouTubeId(url);
            //console.log(ytId);
            content = <YoutubePlayer
                ref={this.playerRef}
                height={300}
                width={"100%"}
                videoId={ytId}
                //play={this.state.playing}
                //onChangeState={event => console.log(event)}
                //onReady={() => console.log("ready")}
                //onError={e => console.log(e)}
                onPlaybackQualityChange={q => console.log(q)}
                volume={50}
                playbackRate={1}
                initialPlayerParams={{
                    cc_lang_pref: "us",
                    showClosedCaptions: true
                }}

            />
        } else if (url.includes("http") && !url.includes("mp4")) {
            content = <WebView
                key={"webView"}
                style={{ flex: 1 }}
                source={{ uri: params.url }}
                clearCache={true}
            />
        } else if (!isNaN(parseInt(url))) {
            setVideoType("Zoom");
        } else {//Mp4,Mkv
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
        console.log(content);
        setIsLoading(false);
    }

    useEffect(function () {
        const unsubscribe = navigation.addListener('focus', () => {
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