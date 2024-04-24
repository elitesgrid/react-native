//import liraries
import React, { useEffect, useState } from 'react';
import { View, SafeAreaView,StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';

//import TestHeaderComp from '../../Components/TestHeaderComp';
//import HeaderComp from '../../Components/HeaderComp';
import Colors from '../../Constants/Colors';
import TestSeriesStyle from '../../Assets/Style/TestSeriesStyle';
import envVariables from '../../Constants/envVariables';
import StorageManager from '../../Services/StorageManager';

// create a component
export const TestWebView = (props) => {
    const { route, navigation } = props;
    const { params } = route;
    const [isLoading, setIsLoading] = useState(true);
    const [testUrl, setTestUrl] = useState("");


    useEffect(function () {
        const unsubscribe = navigation.addListener('focus', async () => {
            setIsLoading(false);

            let user_id = 0;
            let session = await StorageManager.get_session();
            if (Object.keys(session).length > 0) {
                user_id = session.id;
            }
            console.log(params);
            let obj = {};
            if (params.internal_type === "bookmarked") {
                obj = {
                    type: "bookmarked",
                    user_id: user_id
                };
            } else if (params.internal_type === "Start Test" || params.internal_type === "Resume Test") {
                obj = {
                    type: "instructions",
                    user_id: user_id,
                    test_id: params.id,
                };
            } else if (params.internal_type === "View Result") {
                obj = {
                    type: "test_result",
                    user_id: user_id,
                    report_id: params.report_id,
                };
            } else if (params.internal_type === "View Rankers") {
                obj = {
                    type: "view_rankers",
                    user_id: user_id,
                    test_id: params.id,
                    view_rankers_count: params.view_rankers_count,
                    length: params.length,
                    title: params.title
                };
            } else if (params.internal_type === "Start Practice") {
                obj = {
                    type: "instructions",
                    user_id: user_id,
                    test_id: params.id,
                };
            }
            obj.timestamp = Math.random() * 10;

            var get_params = Object.keys(obj).map(function (key) {
                return key + '=' + obj[key];
            }).join('&');

            console.log(envVariables.BASE_URL_WEB + "web/login/android_login?" + get_params);
            setTestUrl(envVariables.BASE_URL_WEB + "web/login/android_login?" + get_params);
        });
        return unsubscribe;
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
                        <SafeAreaView style={{flex:1}}>
                            <StatusBar backgroundColor={Colors.THEME} barStyle="light-content" />
                            {/* <TestHeaderComp headerTitle={params.title} /> */}
                            {/* <HeaderComp headerTitle={params.title} /> */}
                            <View style={{ flex: 1 }}>
                                <WebView
                                    key={"shortDesc"}
                                    originWhitelist={['*']}
                                    source={{ uri: testUrl }}
                                    style={{
                                        flex: 1,
                                        height: 1450
                                    }}
                                    onMessage={event => {
                                        console.log("Test Webview Callback received: " + event.nativeEvent.data);
                                        const message = JSON.parse(event.nativeEvent.data);
                                        switch (message.call_type) {
                                            case "back":
                                                navigation.goBack(null);
                                                break;
                                        }
                                    }}
                                />
                            </View>
                       </SafeAreaView>
                    )
            }
        </>
    );
};