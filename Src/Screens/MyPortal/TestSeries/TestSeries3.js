//import liraries
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ImageBackground, Alert, Button } from 'react-native';

import PortalService from '../../../Services/apis/PortalService';
import HeaderComp from '../../../Components/HeaderComp';
import navigationStrings from '../../../Constants/navigationStrings';
import LoadingComp from '../../../Components/LoadingComp';
import CustomHelper from '../../../Constants/CustomHelper';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../../../Constants/Colors';
import TestSeriesStyle from '../../../Assets/Style/TestSeriesStyle';

// create a component
export const TestSeries3 = (props) => {
    const { route, navigation } = props;
    const { params } = route;

    const [isLoading, setIsLoading] = useState(true);
    const [testSeries, setTestSeries] = useState([]);
    const [payloadPrevScreen, setPayloadPrevScreen] = useState({});

    const getTestSeries = async function (params) {
        setPayloadPrevScreen(params);
        let payload = {
            page: 1,
            level: 3,
            subject_id: params.subject_id,
            topic_id: params.id,
        }
        //console.log(params);
        return await PortalService.get_test_series(payload)
            .then(async (data) => {
                if (data.status === true) {
                    let data1 = data.data;
                    //console.log(data1);
                    let final_list = [];
                    data1.result.forEach(element => {
                        //if (data.time <= element.end_date) {
                        element.thumbnail = element.thumbnail === "" ? "https://davqvmc1muya7.cloudfront.net/public/web_assets/elight-assets/images/logo/01.png" : element.thumbnail;
                        final_list.push(element);
                        //}
                    });
                    //console.log((final_list));
                    setTestSeries(final_list);
                }
                setIsLoading(false);
                return true;
            })
            .catch((error) => {
                Alert.alert('Error!', error.message);
                return false;
            });
    };

    const navToTestInstructions = function (item) {
        navigation.navigate(navigationStrings.TEST_INSTRUCTIONS, item);
    }

    const navToViewRankers = function (item) {
        navigation.navigate(navigationStrings.TEST_RANKERS, item);
    }

    const navToTestResult = function (item) {
        navigation.navigate(navigationStrings.TEST_VIEW_RESULT, item);
    }

    useEffect(function () {
        const unsubscribe = navigation.addListener('focus', () => {
            setTestSeries([]);
            async function fetchData() {
                // You can await here       
                const response = await getTestSeries(params);
                //console.log(response);
            }
            fetchData();
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
                        <View style={styles.container}>
                            <HeaderComp headerTitle={payloadPrevScreen.title} />
                            <FlatList
                                data={testSeries}
                                numColumns={1}
                                renderItem={({ item, index }) => (
                                    <View style={{ ...TestSeriesStyle.container, ...TestSeriesStyle.testListContainer }}>
                                        <View style={TestSeriesStyle.testListCart1}>
                                            <View>
                                                <Image resizeMode='stretch' source={{ uri: item.thumbnail }} style={{ height: 35, width: 50 }} />
                                            </View>
                                            <View style={TestSeriesStyle.testListCartTitle}>
                                                <Text style={TestSeriesStyle.testListTitle}>{item.title}</Text>
                                                <Text style={TestSeriesStyle.testListMeta}>{"No Of Questions: " + item.total_questions + " | Time: " + CustomHelper.secFormat(item.length)}</Text>
                                                {
                                                    item.report_id && item.state == "2" && item.res_seq_attempt == "1" && (
                                                        <Text style={{ ...TestSeriesStyle.testListMeta, ...TestSeriesStyle.testAttemptMarksLabel }}>{"Marks: " + item.marks}</Text>
                                                    )
                                                }
                                                {
                                                    item.report_id && item.state == "2" && (
                                                        <Text style={{ ...TestSeriesStyle.testListMeta, ...TestSeriesStyle.testAttemptMarksLabel }}>{"Marks: " + item.marks + "/" + item.total_marks}</Text>
                                                    )
                                                }
                                            </View>
                                        </View>
                                        <View style={TestSeriesStyle.testListCart2}>
                                            {
                                                item.report_id && item.state == "2" && (
                                                    <LinearGradient colors={['#37B6F1', '#0274BA']} style={TestSeriesStyle.testListButton}>
                                                        <TouchableOpacity onPress={() => { navToTestResult({ ...item, ...{ internal_type: "View Result" } }) }}>
                                                            <Text style={{ marginVertical: 1, fontSize: 12, color: Colors.WHITE }}>{"View Result"}</Text>
                                                        </TouchableOpacity>
                                                    </LinearGradient>
                                                )
                                            }
                                            {
                                                item.report_id && item.state !== "2" && (
                                                    <LinearGradient colors={['#37B6F1', '#0274BA']} style={TestSeriesStyle.testListButton}>
                                                        <TouchableOpacity onPress={() => { navToTestInstructions({ ...item, ...{ internal_type: "Resume Test" } }) }}>
                                                            <Text style={{ marginVertical: 1, fontSize: 12, color: Colors.WHITE }}>{"Resume"}</Text>
                                                        </TouchableOpacity>
                                                    </LinearGradient>
                                                )
                                            }
                                            {
                                                !item.report_id && (
                                                    <LinearGradient colors={['#37B6F1', '#0274BA']} style={TestSeriesStyle.testListButton}>
                                                        <TouchableOpacity onPress={() => { navToTestInstructions({ ...item, ...{ internal_type: "Start Test" } }) }}>
                                                            <Text style={{ marginVertical: 1, fontSize: 12, color: Colors.WHITE }}>{"Attempt Now"}</Text>
                                                        </TouchableOpacity>
                                                    </LinearGradient>
                                                )
                                            }
                                            {
                                                item.report_id && item.view_rankers_count !== "0" && (
                                                    <LinearGradient colors={['#37B6F1', '#0274BA']} style={TestSeriesStyle.testListButton}>
                                                        <TouchableOpacity onPress={() => { navToViewRankers(item) }}>
                                                            <Text style={{ marginVertical: 1, fontSize: 12, color: Colors.WHITE }}>{"View Rankers"}</Text>
                                                        </TouchableOpacity>
                                                    </LinearGradient>
                                                )
                                            }
                                            {
                                                item.report_id && item.state == "2" && item.practice == "0" && (
                                                    <LinearGradient colors={['#37B6F1', '#0274BA']} style={TestSeriesStyle.testListButton}>
                                                        <TouchableOpacity onPress={() => {  navToTestInstructions({ ...item, ...{ internal_type: "Start Practice" } })  }}>
                                                            <Text style={{ marginVertical: 1, fontSize: 12, color: Colors.WHITE }}>{"Practice"}</Text>
                                                        </TouchableOpacity>
                                                    </LinearGradient>
                                                )
                                            }
                                        </View>
                                    </View>
                                )}
                                keyExtractor={(item) => item.id}
                                contentContainerStyle={{ marginHorizontal: 5, marginTop: 10 }}
                            />
                        </View>
                    )
            }
        </>
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1
    },
});