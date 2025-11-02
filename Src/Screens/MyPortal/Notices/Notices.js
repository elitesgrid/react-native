//import liraries
import React, { useEffect, useState } from 'react';
import { View, Text,  FlatList, Image} from 'react-native';

import PortalService from '../../../Services/apis/PortalService';
import imagePaths from '../../../Constants/imagePaths';
import Colors from '../../../Constants/Colors';
import PortalStyles from '../../../Assets/Style/PortalStyle';
import { WebView } from 'react-native-webview';
import CustomHelper from '../../../Constants/CustomHelper';
import HtmlRendererComp from '../../../Components/HtmlRendererComp';

// create a component
export const Notices = (props) => {
    const [isLoading, setIsLoading] = useState(true);
    const [noticeList, setNoticesList] = useState([]);

    const getNotices = async function () {
        let payload = {
            page: 1,
            course_ids: "0",
        }
        return await PortalService.get_notices(payload)
            .then(async (data) => {
                setIsLoading(false);
                if (data.status === true && data.data.notices) {
                    data = data.data;
                    setNoticesList(data.notices);
                    setIsLoading(false);
                }
                return true;
            })
            .catch((error) => {
                CustomHelper.showMessage(error.message);
                return false;
            });
    };

    useEffect(function () {
        getNotices();
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
                            {
                                noticeList.length === 0 ? <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                                    <Text style={{fontSize: 20,fontWeight:'500',color:Colors.TEXT_COLOR}}>No Notice Available For you.</Text>
                                </View> : 
                                <FlatList
                                    data={noticeList}
                                    numColumns={1}
                                    renderItem={({ item, index }) => (
                                        <View  key={index} style={{...PortalStyles.SubjectTopicCard,...{flex:1}}}>
                                            <View style={PortalStyles.SubjectTopicContainer}>
                                                <Image source={imagePaths.DEFAULT_VIDEO} resizeMode='stretch' style={PortalStyles.SubjectTopicImage} />
                                                <View style={PortalStyles.SubjectTopicInfoSection}>
                                                    <Text style={PortalStyles.SubjectTopicInfoTitle}>{item.course_title}</Text>
                                                    <Text style={{color: Colors.TAG_COLOR}}>{"Created At: " + CustomHelper.tsToDate(item.created, 'd M Y')}</Text>
                                                </View>
                                            </View>
                                            <View style={{flex:1}}>
                                                <HtmlRendererComp html={item.description}></HtmlRendererComp>
                                            </View>
                                        </View>
                                    )}
                                    keyExtractor={(item) => item.id}
                                    contentContainerStyle={{ marginHorizontal: 5, marginTop: 10 }}
                                />
                            }
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