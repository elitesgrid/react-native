//import liraries
import React, { useEffect, useState } from 'react';
import { View, Text,  FlatList, useWindowDimensions, Image,Alert} from 'react-native';

import PortalService from '../../../Services/apis/PortalService';
import imagePaths from '../../../Constants/imagePaths';
import Colors from '../../../Constants/Colors';
import PortalStyles from '../../../Assets/Style/PortalStyle';
import { WebView } from 'react-native-webview';
import HTML from 'react-native-render-html';

// create a component
export const Notices = (props) => {
    const { navigation } = props;
    const { width: windowWidth } = useWindowDimensions();

    const [isLoading, setIsLoading] = useState(true);
    const [noticeList, setNoticesList] = useState([]);

    const getNotices = async function () {
        let payload = {
            page: 1,
            course_ids: "33,320,323,287,324,325,326,311",
        }
        return await PortalService.get_notices(payload)
            .then(async (data) => {
                setIsLoading(false);
                if (data.status === true) {
                    data = data.data;
                    console.log(data);
                    setNoticesList(data.notices);
                    setIsLoading(false);
                }
                return true;
            })
            .catch((error) => {
                Alert.alert('Error!', error.message);
                return false;
            });
    };

    useEffect(function () {
        async function fetchData() {
            // You can await here       
            const response = await getNotices();
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
                                data={noticeList}
                                numColumns={1}
                                renderItem={({ item, index }) => (
                                    <View  key={index} style={{...PortalStyles.SubjectTopicCard,...{flex:1}}}>
                                        <View style={PortalStyles.SubjectTopicContainer}>
                                            <Image source={imagePaths.DEFAULT_VIDEO} resizeMode='stretch' style={PortalStyles.SubjectTopicImage} />
                                            <View style={PortalStyles.SubjectTopicInfoSection}>
                                                <Text style={PortalStyles.SubjectTopicInfoTitle}>{item.course_title}</Text>
                                            </View>
                                        </View>
                                        <View style={{flex:1}}>
                                            <HTML contentWidth={windowWidth} source={{ html: item.description }} />
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

    const renderItem = ({ item }) => {
        return (
          <View style={styles.itemContainer}>
            <WebView
              originWhitelist={['*']}
              source={{ html: item.htmlContent }}
              style={styles.webview}
            />
          </View>
        );
    };
};