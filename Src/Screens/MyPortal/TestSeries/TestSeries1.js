//import liraries
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ImageBackground } from 'react-native';

import PortalService from '../../../Services/apis/PortalService';
import imagePaths from '../../../Constants/imagePaths';
import navigationStrings from '../../../Constants/navigationStrings';
import Colors from '../../../Constants/Colors';
import PortalStyles from '../../../Assets/Style/PortalStyle';

// create a component
export const TestSeries1 = (props) => {
    const { navigation } = props;
    const [isLoading, setIsLoading] = useState(true);
    const [testSeries, setTestSeries] = useState([]);

    const getTestSeries = async function () {
        let payload = {
            page: 1,
            level: 1,
            subject_id: 0,
            topic_id: 0,
        }
        return await PortalService.get_test_series(payload)
            .then(async (data) => {
                setIsLoading(false);
                if (data.status === true) {
                    data = data.data;
                    //console.log((data.result[0]));
                    setTestSeries(data.result);
                    setIsLoading(false);
                }
                return true;
            })
            .catch((error) => {
                Alert.alert('Error!', error.message);
                return false;
            });
    };

    const navToTopic = function (item) {
        navigation.navigate(navigationStrings.TEST_SERIES2, item);
    }

    useEffect(function () {
        async function fetchData() {
            // You can await here       
            const response = await getTestSeries();
            console.log(response);
        }
        fetchData();
    }, []);

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
                            <FlatList
                                data={testSeries}
                                numColumns={1}
                                renderItem={({ item, index }) => (
                                    <TouchableOpacity onPress={() => navToTopic(item)} key={index} style={PortalStyles.SubjectTopicCard}>
                                        <View style={PortalStyles.SubjectTopicContainer}>
                                            <Image source={imagePaths.DEFAULT_TEST} resizeMode='stretch' style={PortalStyles.SubjectTopicImage} />
                                            <View style={PortalStyles.SubjectTopicInfoSection}>
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