//import liraries
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ToastAndroid,
  ScrollView,
  useWindowDimensions,
  ImageBackground,
  SafeAreaView,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import {Image} from 'react-native-elements';
import HTML from 'react-native-render-html';

import HeaderComp from '../../Components/HeaderComp';
import LoadingComp from '../../Components/LoadingComp';
import HomeService from '../../Services/apis/HomeService';
import imagePaths from '../../Constants/imagePaths';
import Colors from '../../Constants/Colors';
import CommonStyles from '../../Assets/Style/CommonStyle';
import navigationStrings from '../../Constants/navigationStrings';
import CustomHelper from '../../Constants/CustomHelper';

// create a component
export const PastPaperDetail = props => {
  const {route, navigation} = props;
  const {width: windowWidth} = useWindowDimensions();
  const [isLoading, setIsLoading] = useState(true);
  const [paperDetail, setPaperDetail] = useState([]);

  const item = route.params;

  const handleWebViewMessage = event => {
    const {webViewId, height} = JSON.parse(event.nativeEvent.data);
    console.log(webViewId + ' ##  ' + height);
    setContentHeights(prevContentHeights => ({
      ...prevContentHeights,
      [webViewId]: height,
    }));
  };

  const getPaperDetail = async function (item_id) {
    return await HomeService.get_paper_detail({cat_id: item_id})
      .then(async data => {
        if (data.status === true) {
          data = data.data;
          //console.log(Object.keys(data));
          //console.log(data.short_desc);
          setPaperDetail(data);
          console.log(paperDetail);
        }

        setIsLoading(false);
        return true;
      })
      .catch(error => {
        ToastAndroid.show(error.message, 2000);
        return false;
      });
  };

  const navToPlayer = function (item) {
    navigation.navigate(navigationStrings.PLAYER, item);
  };

  const openLinkInChrome = async url => {
    if (
      Platform.OS === 'android' &&
      (await Linking.canOpenURL('googlechrome://'))
    ) {
      await Linking.openURL(`googlechrome://${url}`);
    } else {
      await Linking.openURL(url);
    }
  };

  useEffect(function () {
    async function fetchData(item_id) {
      // You can await here
      const response = await getPaperDetail(item_id);
    }
    fetchData(item.id);
  }, []);
  return (
    <>
      {isLoading ? (
        <LoadingComp />
      ) : (
        <View style={[styles.container]}>
          <HeaderComp headerTitle={item.title} />
          <ScrollView>
            {paperDetail.image !== '' && (
              <View>
                <Image
                  style={{width: '100%', height: 210}}
                  source={{uri: paperDetail.image}}
                  defaultSource={imagePaths.DEFAULT_16_9}></Image>
              </View>
            )}
            <View style={{marginHorizontal: 10}}>
              <View>
                <Text style={{fontSize: 18, fontWeight: '600', color: 'black'}}>
                  {item.title}
                </Text>
              </View>
              {paperDetail.short_desc && paperDetail.short_desc !== '' && (
                <View>
                  <HTML
                    contentWidth={windowWidth}
                    source={{html: paperDetail.short_desc}}
                  />
                </View>
              )}
              <View>
                <Text style={{fontSize: 18, fontWeight: '600', color: 'black'}}>
                  {'Cat Syllabus'}
                </Text>
              </View>
              {paperDetail.description && paperDetail.description !== '' && (
                <View>
                  <HTML
                    contentWidth={windowWidth}
                    source={{html: paperDetail.description}}
                  />
                </View>
              )}
              <View>
                <TouchableOpacity
                  onPress={() => {
                    navToPlayer({
                      url: paperDetail.video,
                      title: paperDetail.title,
                    });
                  }}>
                  <ImageBackground
                    source={imagePaths.DEFAULT_16_9}
                    style={{
                      ...CommonStyles.videoListCardSize,
                      ...{width: '100%'},
                    }}
                    resizeMode="cover"
                    blurRadius={2}>
                    <View style={CommonStyles.overlay}>
                      <Image
                        source={imagePaths.PLAY}
                        style={CommonStyles.playIcon}
                      />
                    </View>
                  </ImageBackground>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
          <SafeAreaView>
            <TouchableOpacity
              onPress={() => {
                openLinkInChrome(paperDetail.syllabus_url);
              }}
              style={{
                backgroundColor: Colors.THEME,
                marginVertical: 10,
                marginHorizontal: 10,
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 5,
                alignItems: 'center',
              }}>
              <Text style={{color: Colors.WHITE}}>Download Syllabus</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>
      )}
    </>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    // backgroundColor: '#2c3e50',
  },
});
