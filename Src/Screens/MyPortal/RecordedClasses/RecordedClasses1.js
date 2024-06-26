//import liraries
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Alert } from 'react-native';

import PortalService from '../../../Services/apis/PortalService';
import imagePaths from '../../../Constants/imagePaths';
import navigationStrings from '../../../Constants/navigationStrings';
import Colors from '../../../Constants/Colors';
import PortalStyles from '../../../Assets/Style/PortalStyle';

// create a component
export const RecordedClasses1 = (props) => {
    const { navigation } = props;
    const [isLoading, setIsLoading] = useState(true);
    const [recordedClasses, setRecordedClasses] = useState([]);

    const getRecordedClasses = async function () {
        let payload = {
            page: 1,
            level: 1,
            subject_id: 0,
            topic_id: 0,
        }
        return await PortalService.get_recorded_classes(payload)
            .then(async (data) => {
                setIsLoading(false);
                if (data.status === true) {
                    data = data.data;
                    //console.log((data.result[0]));
                    setRecordedClasses(data.result);
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
        navigation.navigate(navigationStrings.RECORDED_VIDEO2, item);
    }

    useEffect(function () {
        async function fetchData() {
            // You can await here       
            const response = await getRecordedClasses();
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
                        <View style={PortalStyles.container}>
                            <FlatList
                                data={recordedClasses}
                                numColumns={1}
                                renderItem={({ item, index }) => (
                                    <TouchableOpacity onPress={() => navToTopic(item)} key={index} style={PortalStyles.SubjectTopicCard}>
                                        <View style={PortalStyles.SubjectTopicContainer}>
                                            <Image source={imagePaths.DEFAULT_VIDEO} resizeMode='stretch' style={PortalStyles.SubjectTopicImage} />
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