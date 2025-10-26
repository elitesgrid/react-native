//import liraries
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';

import PortalService from '../../../Services/apis/PortalService';
import HeaderComp from '../../../Components/HeaderComp';
import imagePaths from '../../../Constants/imagePaths';
import navigationStrings from '../../../Constants/navigationStrings';
import LoadingComp from '../../../Components/LoadingComp';
import PortalStyles from '../../../Assets/Style/PortalStyle';
import CustomHelper from '../../../Constants/CustomHelper';

// create a component
export const StudyMaterial2 = (props) => {
    const { route, navigation } = props;
    const {params} = route;

    const [isLoading, setIsLoading] = useState(true);
    const [studyMaterial, setStudyMaterial] = useState([]);
    const [payloadPrevScreen, setPayloadPrevScreen] = useState({});

    const getStudyMaterial = async function (params) {
        setPayloadPrevScreen(params);
        let payload = {
            page: 1,
            level: 2,
            subject_id: params.id,
            topic_id: 0,
        }
        //console.log("Payload-2: "+JSON.stringify(payload));
        return await PortalService.get_pdf(payload)
            .then(async (data) => {
                if (data.status === true) {
                    data = data.data;
                    //console.log((data.result));
                    setStudyMaterial(data.result);
                }
                setIsLoading(false);
                return true;
            })
            .catch((error) => {
                CustomHelper.showMessage(error.message);
                return false;
            });
    };

    const navToStudyMaterialList = function (item) {
        navigation.navigate(navigationStrings.PDF3, item);
    }

    useEffect(function () {
        //console.log("Effect-2: "+JSON.stringify(params));
        const unsubscribe = navigation.addListener('focus', () => {
            setStudyMaterial([]);
            async function fetchData() {
                // You can await here       
                const response = await getStudyMaterial(params);
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
                                data={studyMaterial}
                                numColumns={1}
                                renderItem={({ item, index }) => (
                                    <TouchableOpacity onPress={() => navToStudyMaterialList({ ...item, ...{ subject_id: payloadPrevScreen.id } })} key={index} style={PortalStyles.SubjectTopicCard}>
                                        <View style={PortalStyles.SubjectTopicContainer}>
                                            <Image source={imagePaths.DEFAULT_PDF} resizeMode='stretch' style={PortalStyles.SubjectTopicImage} />
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