//import liraries
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import PortalService from '../../../Services/apis/PortalService';
import HeaderComp from '../../../Components/HeaderComp';
import imagePaths from '../../../Constants/imagePaths';
import CommonStyles from '../../../Assets/Style/CommonStyle';
import navigationStrings from '../../../Constants/navigationStrings';
import LoadingComp from '../../../Components/LoadingComp';
import CustomHelper from '../../../Constants/CustomHelper';
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
            topic_id: params?.id || params?.topic_id,
        };
        if (params.file_id) {
            payload.file_id = params.file_id;
        }

        return await PortalService.get_pdf(payload)
            .then(async (data) => {
                if (data.status === true) {
                    let data1 = data.data;
                    setStudyMaterial(data1.result);
                }
                setIsLoading(false);
                return true;
            })
            .catch((error) => {
                CustomHelper.showMessage(error.message);
                return false;
            });
    };

    const nav_to_pdf = function (item) {
        navigation.navigate(navigationStrings.PDF_VIEWER, item);
    };

    const update_pdf_state = async function (item) {
        let payload = {
            type: '0',
            file_id: item.id,
            is_open: item.is_open === '0' ? '1' : '0',
            remark: '',
        };

        var newData = [...studyMaterial];
        let response = await PortalService.mark_complete_pdf(payload);

        newData.forEach((element, index) => {
            if (element.id === payload.file_id) {
                newData[index].is_open = payload.is_open;
            }
        });
        setStudyMaterial(newData);
    };

    useEffect(function () {
        const unsubscribe = navigation.addListener('focus', () => {
            setStudyMaterial([]);
            async function fetchData() {
                await getStudyMaterial(params);
            }
            fetchData();
        });
        return unsubscribe;
    }, [navigation, params]);

    const renderItem = ({ item }) => (
        <TouchableOpacity
            activeOpacity={0.8}
            style={styles.card}
        >
            <View style={styles.iconWrapper}>
                <Image
                    resizeMode="contain"
                    source={imagePaths.DEFAULT_PDF2}
                    style={[CommonStyles.playIcon, { height: 35, width: 35 }]}
                />
            </View>

            <View style={styles.cardContent}>
                <Text numberOfLines={1} style={styles.titleText}>{item.title}</Text>
                <Text numberOfLines={2} style={styles.descText}>
                    {item.description.trim()}
                </Text>

                <View style={styles.actionRow}>
                    <LinearGradient
                        colors={['#37B6F1', '#0274BA']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.viewBtn}
                    >
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => nav_to_pdf({ title: item.title, url: item.url })}
                        >
                            <Text style={styles.viewBtnText}>View</Text>
                        </TouchableOpacity>
                    </LinearGradient>

                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => update_pdf_state(item)}
                        style={[
                            styles.statusBtn,
                            { backgroundColor: item.is_open === '1' ? Colors.SUCCESS : Colors.WARNING},
                        ]}
                    >
                        <Text style={styles.statusBtnText}>
                            {item.is_open === '1' ? 'Completed' : 'Pending'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <>
            {isLoading ? (
                <LoadingComp />
            ) : (
                <View style={styles.container}>
                    <HeaderComp headerTitle={payloadPrevScreen.title} />

                    {studyMaterial.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Image
                                source={imagePaths.DEFAULT_PDF2}
                                style={{ height: 60, width: 60, opacity: 0.4 }}
                            />
                            <Text style={styles.emptyText}>No study materials found</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={studyMaterial}
                            numColumns={1}
                            keyExtractor={(item) => item.id}
                            renderItem={renderItem}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ padding: 10 }}
                        />
                    )}
                </View>
            )}
        </>
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.BACKGROUND || '#F8F9FB',
    },
    card: {
        flexDirection: 'row',
        backgroundColor: Colors.WHITE,
        borderRadius: 12,
        padding: 12,
        marginVertical: 6,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    iconWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cardContent: {
        flex: 1,
    },
    titleText: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.BLACK,
    },
    descText: {
        fontSize: 12,
        color: Colors.IDLE,
        marginTop: 4,
        marginBottom: 8,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    viewBtn: {
        borderRadius: 6,
        justifyContent: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginRight: 10,
        elevation: 2,
    },
    viewBtnText: {
        fontSize: 12,
        color: Colors.WHITE,
        fontWeight: '500',
    },
    statusBtn: {
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    statusBtnText: {
        fontSize: 12,
        color: Colors.WHITE,
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.8,
    },
    emptyText: {
        marginTop: 10,
        fontSize: 14,
        color: Colors.IDLE,
    },
});
