//import liraries
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { WebView } from 'react-native-webview';

import LinearGradient from 'react-native-linear-gradient';

import TestHeaderComp from '../../Components/TestHeaderComp';
import Colors from '../../Constants/Colors';
import TestSeriesStyle from '../../Assets/Style/TestSeriesStyle';
import imagePaths from '../../Constants/imagePaths';
import TestServices from '../../Services/apis/TestServices';
import CustomHelper from '../../Constants/CustomHelper';


// create a component
export const AttemptTest = (props) => {
    const { route, navigation } = props;
    const { params } = route;

    const [isLoading, setIsLoading] = useState(true);
    const [testSeries, setTestSeries] = useState({});
    const [testSections, setTestSections] = useState([]);
    const [webViewHeights, setWebViewHeights] = useState(40);

    async function getTestDetail(params) {
        let payload = {
            test_id: params.id,
            type: 0
        }
        return await TestServices.get_test_detail(payload).then(async (data) => {
            setIsLoading(false);
            if (data.status === true) {
                data = data.data;
                setTestSeries(data);

                let sections = [];
                data.questions.forEach(element => {
                    sections.push({ key: element.subject, title: element.subject });
                });
                setTestSections(sections);

                setIsLoading(false);
            }
            return true;
        }).catch((error) => {
            Alert.alert('Error!', error.message);
            return false;
        });
    }

    useEffect(function () {
        const unsubscribe = navigation.addListener('focus', () => {
            setTestSeries([]);
            async function fetchData() {
                const response = await getTestDetail(params);
            }
            fetchData();
        });
        return unsubscribe;
    }, [navigation, params]);

    const handleContentHeight = (event) => {
        // const webViewIndex = event.nativeEvent.index;
        console.log(event.nativeEvent);
        const newHeight = parseInt(event.nativeEvent.data, 10);
        setWebViewHeights(newHeight);
    };


    const contentHeightScript = `
            (function() {
                const contentHeight = document.body.scrollHeight;
                window.ReactNativeWebView.postMessage({ data: contentHeight });
            })();
        `;

    return (
        <>
            {
                isLoading ?
                    (
                        <LoadingComp />
                    )
                    :
                    (
                        <View style={TestSeriesStyle.container}>
                            <TestHeaderComp headerTitle={params.title} />
                            <View style={{ backgroundColor: Colors.THEME }}>
                                <ScrollView>
                                    {
                                        testSections.map((item, index) => {
                                            return (
                                                <View key={item.key} style={{ borderBottomColor: Colors.WHITE, borderBottomWidth: 3 }}>
                                                    <Text style={{ fontSize: 16, color: Colors.WHITE, marginHorizontal: 8, marginVertical: 5 }}>{item.title}</Text>
                                                </View>
                                            )
                                        })
                                    }
                                </ScrollView>
                            </View>
                            <View style={{ marginHorizontal: 8, marginVertical: 6 }}>
                                <Text style={{ color: "#000000" }}>{"Type : SC | Marks +3 -0"}</Text>
                            </View>
                            <View style={{ backgroundColor: "#0274ba42", width: "18%", alignItems: "center" }}>
                                <Text style={{ fontSize: 10, color: "#0274BA", marginVertical: 3 }}>{"Question: 01"}</Text>
                            </View>
                            <View style={{ flex: 1, marginHorizontal: 15, marginTop: 8 }}>
                                <ScrollView
                                >
                                    <View key={"1"} style={{ flex: 1 }}>
                                        <WebView
                                            key={"shortDesc"}
                                            //originWhitelist={['*']}
                                            source={{ html: CustomHelper.ReadyHTMLForWebView("<p>There point charges of +2μC,−3μC,−3μC are kept at the vertices A,B and C respectively of an equilateral triangle of side 20 cm as shown in the figure.What should be the sign and magnitude of the charge to be placed at the mid - point (M) of side BC so that the charge at A remains in equilibrium ?</p>") }}
                                            style={{ flex: 1,height:webViewHeights,borderRadius:20 }}
                                            injectedJavaScript={contentHeightScript}
                                            onMessage={handleContentHeight}
                                            javaScriptEnabled={true}
                                        />
                                    </View>
                                    <View key={"2"} style={{ flex: 1, flexDirection: "row", borderWidth: 1, borderColor: "#222222", borderRadius: 20,overflow:"scroll",marginVertical:3 }}>
                                        <View style={{ padding: 8 }}>
                                            <Image source={imagePaths.TEST_OPTION_A} />
                                        </View>
                                        <WebView
                                            style={{ flex: 1 }}
                                            source={{ html: CustomHelper.ReadyHTMLForWebView("<p>There point charges of</p>") }}
                                            javaScriptEnabled={true}
                                        />
                                    </View>
                                    <View key={"3"} style={{ flex: 1, flexDirection: "row", borderWidth: 1, borderColor: "#222222", borderRadius: 20,overflow:"scroll",marginVertical:3 }}>
                                        <View style={{ padding: 8 }}>
                                            <Image source={imagePaths.TEST_OPTION_B} />
                                        </View>
                                        <WebView
                                            style={{ flex: 1 }}
                                            source={{ html: CustomHelper.ReadyHTMLForWebView("<p>There point charges of</p>") }}
                                            javaScriptEnabled={true}
                                        />
                                    </View>
                                    <View key={"5"} style={{ flex: 1, flexDirection: "row", borderWidth: 1, borderColor: "#222222", borderRadius: 20,overflow:"scroll",marginVertical:3 }}>
                                        <View style={{ padding: 8 }}>
                                            <Image source={imagePaths.TEST_OPTION_C} />
                                        </View>
                                        <WebView
                                            style={{ flex: 1 }}
                                            source={{ html: CustomHelper.ReadyHTMLForWebView("<p>There point charges of</p>") }}
                                            javaScriptEnabled={true}
                                        />
                                    </View>
                                    <View key={"6"} style={{ flex: 1, flexDirection: "row", borderWidth: 1, borderColor: "#222222", borderRadius: 20,overflow:"scroll",marginVertical:3 }}>
                                        <View style={{ padding: 8 }}>
                                            <Image source={imagePaths.TEST_OPTION_D} />
                                        </View>
                                        <WebView
                                            style={{ flex: 1 }}
                                            source={{ html: CustomHelper.ReadyHTMLForWebView("<p>There point charges of</p>") }}
                                            javaScriptEnabled={true}
                                        />
                                    </View>
                                </ScrollView>
                            </View>
                        </View>
                    )
            }
        </>
    );
};