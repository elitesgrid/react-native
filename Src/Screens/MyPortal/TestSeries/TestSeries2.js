//import liraries
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';

import PortalService from '../../../Services/apis/PortalService';
import HeaderComp from '../../../Components/HeaderComp';
import imagePaths from '../../../Constants/imagePaths';
import navigationStrings from '../../../Constants/navigationStrings';
import LoadingComp from '../../../Components/LoadingComp';
import PortalStyles from '../../../Assets/Style/PortalStyle';

// create a component
export const TestSeries2 = (props) => {
    const { route, navigation } = props;
    const {params} = route;

    const [isLoading, setIsLoading] = useState(true);
    const [testSeries, setTestSeries] = useState([]);
    const [payloadPrevScreen, setPayloadPrevScreen] = useState({});

    const getTestSeries = async function (params) {
        setPayloadPrevScreen(params);
        let payload = {
            page: 1,
            level: 2,
            subject_id: params.id,
            topic_id: 0,
        }
        //console.log("Payload-2: "+JSON.stringify(payload));
        return await PortalService.get_test_series(payload)
            .then(async (data) => {
                if (data.status === true) {
                    data = data.data;
                    //console.log((data.result));
                    setTestSeries(data.result);
                }
                setIsLoading(false);
                return true;
            })
            .catch((error) => {
                Alert.alert('Error!', error.message);
                return false;
            });
    };

    const navToTestSeriesList = function (item) {
        navigation.navigate(navigationStrings.TEST_SERIES3, item);
    }

    useEffect(function () {
        //console.log("Effect-2: "+JSON.stringify(params));
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
                                    <TouchableOpacity onPress={() => navToTestSeriesList({ ...item, ...{ subject_id: payloadPrevScreen.id } })} key={index} style={{ borderColor: "#EEEEEE", backgroundColor: "white", borderWidth: 1, borderRadius: 10, marginVertical: 2.5, marginHorizontal: 2.5, width: "100%" }}>
                                        <View style={{ flex: 1, flexDirection: "row", height: 80, paddingVertical: 20, paddingHorizontal: 10 }}>
                                            <Image source={imagePaths.DEFAULT_TEST} resizeMode='stretch' style={{ height: 48, width: 48, marginHorizontal: 5 }} />
                                            <View style={{ flex: 1, flexDirection: "column", justifyContent: "center", marginLeft: 10 }}>
                                                <Text style={PortalStyles.SubjectTopicInfoTitle}>{item.title}</Text>
                                                <Text style={PortalStyles.SubjectTopicInfoMeta}>{"Completed:" + item.complete_count + ", Total:" + item.count}</Text>
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