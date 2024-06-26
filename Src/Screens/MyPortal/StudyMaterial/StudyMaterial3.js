//import liraries
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';

import PortalService from '../../../Services/apis/PortalService';
import HeaderComp from '../../../Components/HeaderComp';
import imagePaths from '../../../Constants/imagePaths';
import CommonStyles from '../../../Assets/Style/CommonStyle';
import navigationStrings from '../../../Constants/navigationStrings';
import LoadingComp from '../../../Components/LoadingComp';
import CustomHelper from '../../../Constants/CustomHelper';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../../../Constants/Colors';

// create a component
export const StudyMaterial3 = (props) => {
    const { route, navigation } = props;
    const { params } = route;

    const [isLoading, setIsLoading] = useState(true);
    const [studyMaterial, setStudyMaterial] = useState([]);
    const [payloadPrevScreen, setPayloadPrevScreen] = useState({});

    const getStudyMaterial = async function (params) {
        setPayloadPrevScreen(params);
        let payload = {
            page: 1,
            level: 3,
            subject_id: params.subject_id,
            topic_id: params.id,
        }
        //console.log(params);
        return await PortalService.get_pdf(payload)
            .then(async (data) => {
                if (data.status === true) {
                    let data1 = data.data;
                    //console.log(data1);
                    setStudyMaterial(data1.result);
                }
                setIsLoading(false);
                return true;
            })
            .catch((error) => {
                Alert.alert('Error!', error.message);
                return false;
            });
    };

    const nav_to_pdf = function (item) {
        navigation.navigate(navigationStrings.PDF_VIEWER, item);
   } 

    const update_pdf_state = async function (item){
        let payload = {
            type: '0',
            file_id: item.id,
            is_open: item.is_open === "0" ? "1" : "0",
            remark: "",
        }
        setIsLoading(true);
        let response = await PortalService.mark_complete_pdf(payload);
        studyMaterial.forEach((element, index) => {
            element.id === payload.file_id ? studyMaterial[index].is_open = payload.is_open : "";
        });

        setIsLoading(false);
        setStudyMaterial(studyMaterial);
    }

    useEffect(function () {
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
                                    <View style={{ borderColor: "#EEEEEE", backgroundColor: "white", borderWidth: 1, borderRadius: 10, marginVertical: 2.5, marginHorizontal: 2.5, width: "100%", height: 70, paddingVertical: 10, paddingHorizontal: 10, flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                        <View>
                                            <Image resizeMode='stretch' source={imagePaths.DEFAULT_PDF2} style={{ ...CommonStyles.playIcon, ...{ height: 30, width: 30 } }} />
                                        </View>
                                        <View style={{ flex: 1, flexDirection: "column", marginLeft: 10 }}>
                                            <Text style={{ color: Colors.BLACK, fontSize: 16, fontWeight: "500" }}>{item.title}</Text>
                                        </View>
                                        <View>
                                            <LinearGradient colors={['#37B6F1', '#0274BA']} style={{ borderRadius: 5, alignItems: "center", paddingHorizontal: 5 }}>
                                                <TouchableOpacity onPress={() => { nav_to_pdf({ title: item.title, url: item.url }) }}>
                                                    <Text style={{ marginVertical: 1, fontSize: 12, color: Colors.WHITE }}>View</Text>
                                                </TouchableOpacity>
                                            </LinearGradient>
                                            <TouchableOpacity onPress={() => { update_pdf_state(item) }} style={{ alignItems: "center", backgroundColor: (item.is_open === "1" ? Colors.SUCCESS : Colors.WARNING),marginTop:5,borderRadius:5 }}>
                                                <Text style={{ marginHorizontal: 8, fontSize: 14, color: Colors.WHITE }}>{(item.is_open === "1" ? "Completed" : "Pending")}</Text>
                                            </TouchableOpacity>
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