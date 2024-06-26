//import liraries
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ImageBackground, Alert, Button } from 'react-native';
import * as Progress from 'react-native-progress';

import PortalService from '../../../Services/apis/PortalService';
import HeaderComp from '../../../Components/HeaderComp';
import imagePaths from '../../../Constants/imagePaths';
import navigationStrings from '../../../Constants/navigationStrings';
import LoadingComp from '../../../Components/LoadingComp';
import CustomHelper from '../../../Constants/CustomHelper';
import Colors from '../../../Constants/Colors';
import CommonStyles from '../../../Assets/Style/CommonStyle';
import PortalStyles from '../../../Assets/Style/PortalStyle';

// create a component
export const RecordedClasses3 = (props) => {
    const { route, navigation } = props;
    const { params } = route;

    const [isLoading, setIsLoading] = useState(true);
    const [recordedClasses, setRecordedClasses] = useState([]);
    const [payloadPrevScreen, setPayloadPrevScreen] = useState({});

    const getRecordedClasses = async function (params) {
        setPayloadPrevScreen(params);
        let payload = {
            page: 1,
            level: 3,
            subject_id: params.subject_id,
            topic_id: params.id,
        }
        //console.log(params);
        return await PortalService.get_recorded_classes(payload)
            .then(async (data) => {
                if (data.status === true) {
                    let data1 = data.data;
                    //console.log(data1);
                    let final_list = [];
                    data1.result.forEach(element => {
                        //if (data.time <= element.end_date) {
                        element.thumbnail = element.thumbnail === "" ? "https://www.elitesgrid.com/public/web_assets/elight-assets/images/logo/01.png" : element.thumbnail;
                        final_list.push(element);
                        //}
                    });
                    //console.log((final_list));
                    setRecordedClasses(final_list);
                }
                setIsLoading(false);
                return true;
            })
            .catch((error) => {
                Alert.alert('Error!', error.message);
                return false;
            });
    };

    const navToPlayer = function (item) {
        navigation.navigate(navigationStrings.PLAYER, item);
    }

    async function update_video_time(params) {
        let payload = {
            type: 'video',
            file_id: params.id,
            total_seconds: params.length,
            watched_time: 0,
            is_completed: params.is_completed === "0" ? "1" : "0",
            remark: "",
        }
        setIsLoading(true);
        let response = await PortalService.update_video_time(payload);
        recordedClasses.forEach((element, index) => {
            element.id === params.id ? recordedClasses[index].is_completed = payload.is_completed : "";
        });

        setIsLoading(false);
        setRecordedClasses(recordedClasses);
    }

    function calculatePercentage(watchedTime, totalTime) {
        watchedTime = parseInt(watchedTime);
        totalTime = parseInt(totalTime);
        if (typeof watchedTime !== 'number' || typeof totalTime !== 'number' || totalTime === 0) {
            return 0; // Return 0 if inputs are invalid or totalTime is zero
        }   
        let return_ = (watchedTime / totalTime) * 100;
        return parseInt(return_);
    }

    useEffect(function () {
        const unsubscribe = navigation.addListener('focus', () => {
            setRecordedClasses([]);
            async function fetchData() {
                // You can await here       
                const response = await getRecordedClasses(params);
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
                                data={recordedClasses}
                                numColumns={1}
                                renderItem={({ item, index }) => (
                                    <TouchableOpacity onPress={() => navToPlayer({url:item.url,title:item.title})} key={index} style={PortalStyles.SubjectTopicCard}>
                                        <View style={{ height: 200, paddingVertical: 20, paddingHorizontal: 10 }}>
                                            <View style={{ flex: 1, flexDirection: "row" }}>
                                                <View>
                                                    <ImageBackground source={{ uri: item.thumbnail }} resizeMode="contain" style={{ ...CommonStyles.videoListCardSize, ...{ height: 90, width: 90, marginHorizontal: 5 } }} blurRadius={1}>
                                                        <View style={CommonStyles.overlay}>
                                                            <Image source={imagePaths.PLAY} style={{ ...CommonStyles.playIcon, ...{ height: 35, width: 35 } }} />
                                                        </View>
                                                    </ImageBackground>
                                                </View>
                                                <View style={{ flex: 1, flexDirection: "column", marginLeft: 10 }}>
                                                    <Text style={PortalStyles.SubjectTopicInfoTitle}>{item.title}</Text>
                                                    <Text style={PortalStyles.SubjectTopicInfoMeta}>{"Total Time:" + CustomHelper.secFormat(item.length)}</Text>
                                                    <Text style={PortalStyles.SubjectTopicInfoMeta}>{"Watched Time:" + CustomHelper.secFormat(item.watched_time)}</Text>
                                                    <Text style={PortalStyles.SubjectTopicInfoMeta}>{"Remaining Time:" + CustomHelper.secFormat(item.length - item.watched_time)}</Text>
                                                </View>
                                            </View>
                                            <View style={{ marginBottom: 10 }}>
                                                <Progress.Bar progress={calculatePercentage(item.watched_time,item.length)/100} width={null} color={Colors.WARNING}/>
                                            </View>
                                            <View>
                                                <TouchableOpacity onPress={() => { update_video_time(item) }} style={{ alignItems: "center", backgroundColor: (item.is_completed === "1" || item.is_open === "1" ? Colors.SUCCESS : Colors.WARNING) }}>
                                                    <Text style={{ marginVertical: 8, fontSize: 14, color: Colors.WHITE }}>{(item.is_completed === "1" || item.is_open === "1" ? "Completed" : "Pending")}</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
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