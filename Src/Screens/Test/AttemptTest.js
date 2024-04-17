//import liraries
import React, { useEffect, useState, useRef } from 'react';
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

    const [webViewHeight, setWebViewHeight] = useState({ "1": 200, "2": 200 });


    const [isLoading, setIsLoading] = useState(true);
    const [testSeries, setTestSeries] = useState({});
    const [testSections, setTestSections] = useState([]);
    const [testQuestions, setTestQuestions] = useState([]);
    const [currentQuestions, setCurrentQuestions] = useState({});
    const [currentQuestionsIndex, setCurrentQuestionsIndex] = useState(0);

    async function load_question(index) {
        setCurrentQuestions(testQuestions[index]);
        setCurrentQuestionsIndex(index);
    }

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
                let questions = [];
                data.questions.forEach(element => {
                    sections.push({ key: element.subject, title: element.subject });
                    questions.push(...element.questions);
                });
                setTestSections(sections);
                setTestQuestions(questions);
                setTimeout(async function () {
                    await load_question(0);
                    setTimeout(async function () {
                        console.log(Object.keys(currentQuestions));
                    }, 300)
                }, 300)
                setIsLoading(false);
            }
            return true;
        }).catch((error) => {
            Alert.alert('Error!', error.message);
            return false;
        });
    }

    const handleMessage = (webViewNumber, event) => {
        console.log(event);
        const height = parseInt(event.nativeEvent.data);

        webViewHeight[webViewNumber] = height;
        setWebViewHeight(webViewHeight);
    };

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


    const webView1 = useRef(null);
    const webView2 = useRef(null);

    const [height1, setHeight1] = useState(400);
    const [height2, setHeight2] = useState(0);


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
                                                <View key={item.key} style={TestSeriesStyle.testSectionsCard}>
                                                    <Text style={TestSeriesStyle.testSectionsCardText}>{item.title}</Text>
                                                </View>
                                            )
                                        })
                                    }
                                </ScrollView>
                            </View>
                            <Text>{"sdf"}</Text>
                            <ScrollView>
                                <WebView
                                    ref={webView1}
                                    javaScriptEnabled={true}
                                    source={{ uri: 'https://stackoverflow.com/questions/6959120/how-to-display-php-code-on-html-page-in-browser' }}
                                    onNavigationStateChange={navState => {
                                        //console.log(navState);
                                        //setHeight1(navState.target);
                                    }}
                                    onMessage={event => {
                                        console.log("11111111111111111: " + event);
                                        const message = JSON.parse(event.nativeEvent.data);
                                        setHeight1(message.height);
                                    }}
                                    injectedJavaScript={`
                                        $(document).ready(function(){
                                            var body = document.body;
                                            var html = document.documentElement;
                                            $("#content").css({"background-color": "red"});
                                            var height = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
                                            (window["ReactNativeWebView"]||window).postMessage(JSON.stringify({"height":height}));
                                        });
                                    `}
                                    style={{ height: height1, width: '100%' }}
                                />
                                <WebView
                                    ref={webView2}
                                    javaScriptEnabled={true}
                                    source={{ uri: 'https://stackoverflow.com/questions/6959120/how-to-display-php-code-on-html-page-in-browser' }}
                                    onNavigationStateChange={navState => {
                                        //console.log(navState);
                                        //setHeight1(navState.target);
                                    }}
                                    injectedJavaScript={`
                                        $(document).ready(function(){
                                            var body = document.body;
                                            var html = document.documentElement;
                                            $("#content").css({"background-color": "green"});
                                            var height1 = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
                                            (window["ReactNativeWebView"]||window).postMessage(JSON.stringify({"height":height1}));
                                        });
                                    `}
                                    onMessage={event => {
                                        console.log("22222222222: " + event);
                                        const message = JSON.parse(event.nativeEvent.data);
                                        setHeight2(message.height);
                                    }}
                                    style={{ height: height2, width: '100%' }}
                                />
                            </ScrollView>
                            {
                                // currentQuestions && Object.keys(currentQuestions).length > 0 &&
                                // <ScrollView>
                                //     <View style={{ flex: 1 }}>
                                //         <View style={TestSeriesStyle.questionTypeCard}>
                                //             <Text style={TestSeriesStyle.questionTypeText}>{"Type : " + currentQuestions.question_type + " | Marks +" + currentQuestions.mark_per_que + " -" + currentQuestions.neg_mark_per_que}</Text>
                                //         </View>
                                //         <View style={TestSeriesStyle.questionNumberingCard}>
                                //             <Text style={TestSeriesStyle.questionNumberingText}>{"Question: " + currentQuestionsIndex}</Text>
                                //         </View>
                                //         <View style={TestSeriesStyle.questionCard}>
                                //             {currentQuestions.passage !== "" &&
                                //                 <View key={"passage"} style={{ flex: 1 }}>
                                //                     <WebView
                                //                         key={"shortDesc"}
                                //                         originWhitelist={['*']}
                                //                         source={{ html: CustomHelper.ReadyHTMLForWebView(currentQuestions.passage) }}
                                //                         style={{
                                //                             flex: 1,
                                //                             borderRadius: 20,
                                //                             backgroundColor: "#fff0",
                                //                             height: 1450
                                //                         }}
                                //                         onMessage={(event) => handleMessage(1, event)}
                                //                         onError={(error) => console.error('WebView error:', error)}
                                //                     />
                                //                 </View>
                                //             }
                                //             <View key={"1"} style={{ flex: 1 }}>
                                //                 <WebView
                                //                     key={"shortDesc"}
                                //                     originWhitelist={['*']}
                                //                     source={{ html: CustomHelper.ReadyHTMLForWebView(currentQuestions.question) }}
                                //                     style={{
                                //                         flex: 1,
                                //                         borderRadius: 20,
                                //                         backgroundColor: "#fff0",
                                //                         height: 100
                                //                     }}
                                //                     onMessage={(event) => handleMessage(2, event)}
                                //                     onError={(error) => console.error('WebView error:', error)}
                                //                 />
                                //             </View>
                                //             <View key={"2"} style={TestSeriesStyle.optionsCard}>
                                //                 <View style={{ padding: 8 }}>
                                //                     <Image source={imagePaths.TEST_OPTION_A} />
                                //                 </View>
                                //                 <WebView
                                //                     style={{ flex: 1 }}
                                //                     source={{ html: CustomHelper.ReadyHTMLForWebView(currentQuestions.option_1) }}
                                //                     javaScriptEnabled={true}
                                //                 />
                                //             </View>
                                //             <View key={"3"} style={TestSeriesStyle.optionsCard}>
                                //                 <View style={{ padding: 8 }}>
                                //                     <Image source={imagePaths.TEST_OPTION_B} />
                                //                 </View>
                                //                 <WebView
                                //                     style={{ flex: 1 }}
                                //                     source={{ html: CustomHelper.ReadyHTMLForWebView(currentQuestions.option_2) }}
                                //                     javaScriptEnabled={true}
                                //                 />
                                //             </View>
                                //             <View key={"5"} style={TestSeriesStyle.optionsCard}>
                                //                 <View style={{ padding: 8 }}>
                                //                     <Image source={imagePaths.TEST_OPTION_C} />
                                //                 </View>
                                //                 <WebView
                                //                     style={{ flex: 1 }}
                                //                     source={{ html: CustomHelper.ReadyHTMLForWebView(currentQuestions.option_3) }}
                                //                     javaScriptEnabled={true}
                                //                 />
                                //             </View>
                                //             <View key={"6"} style={TestSeriesStyle.optionsCard}>
                                //                 <View style={{ padding: 8 }}>
                                //                     <Image source={imagePaths.TEST_OPTION_D} />
                                //                 </View>
                                //                 <WebView
                                //                     style={{ flex: 1 }}
                                //                     source={{ html: CustomHelper.ReadyHTMLForWebView(currentQuestions.option_4) }}
                                //                     javaScriptEnabled={true}
                                //                 />
                                //             </View>
                                //             <View key={"7"} style={{ flex: 0.25 }}>
                                //                 <View style={{ flex: 1 }}>
                                //                     <View style={{ alignItems: "flex-end" }}>
                                //                         <TouchableOpacity style={{ borderColor: "#DA4A54", borderWidth: 1, borderRadius: 10, marginTop: 6, width: "35%", alignItems: "center" }}>
                                //                             <Text style={{ paddingVertical: 5, color: "#DA4A54" }}>{"Clear Response"}</Text>
                                //                         </TouchableOpacity>
                                //                     </View>
                                //                 </View>
                                //                 <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 }}>
                                //                     <View>
                                //                         <TouchableOpacity style={{ borderWidth: 1, borderColor: "#0000006b", borderRadius: 5 }}>
                                //                             <Text style={{ paddingHorizontal: 5, paddingVertical: 8 }}>{"Mark for Review & Next"}</Text>
                                //                         </TouchableOpacity>
                                //                     </View>
                                //                     <View>
                                //                         <TouchableOpacity style={{ borderWidth: 1, borderColor: Colors.THEME, borderRadius: 5 }}>
                                //                             <Text style={{ paddingHorizontal: 5, paddingVertical: 8, backgroundColor: Colors.THEME, color: Colors.WHITE }}>{"Save & Next"}</Text>
                                //                         </TouchableOpacity>
                                //                     </View>
                                //                 </View>

                                //             </View>
                                //         </View>
                                //     </View>
                                // </ScrollView>
                            }
                        </View>
                    )
            }
        </>
    );
};