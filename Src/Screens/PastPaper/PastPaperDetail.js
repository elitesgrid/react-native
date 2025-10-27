import React, {useEffect, useState, useMemo} from 'react';
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
  useColorScheme,
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
import MyImageComponent from '../../Components/MyImageComponent';
import CustomHelper from '../../Constants/CustomHelper';

export const PastPaperDetail = props => {
  const {route, navigation} = props;
  const {width: windowWidth} = useWindowDimensions();
  const [isLoading, setIsLoading] = useState(true);
  const [paperDetail, setPaperDetail] = useState([]);
  const colorScheme = useColorScheme();
  const isNightMode = colorScheme === 'dark';
  const item = route.params;

  const htmlTagsStyles = useMemo(() => {
    const baseColor = isNightMode ? Colors.WHITE : Colors.TEXT_COLOR;
    return {
      body: {color: baseColor, lineHeight: 22, fontSize: 15},
      p: {color: baseColor, marginBottom: 8},
      li: {color: baseColor},
    };
  }, [isNightMode]);

  const getPaperDetail = async function (item_id) {
    return await HomeService.get_paper_detail({cat_id: item_id})
      .then(async data => {
        if (data.status === true) {
          setPaperDetail(data.data);
        } else {
          CustomHelper.showMessage('Syllabus not found.');
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
    if (Platform.OS === 'android' && (await Linking.canOpenURL('googlechrome://'))) {
      await Linking.openURL(`googlechrome://${url}`);
    } else {
      await Linking.openURL(url);
    }
  };

  useEffect(() => {
    getPaperDetail(item.id);
  }, []);

  return (
    <>
      {isLoading ? (
        <LoadingComp />
      ) : (
        <View style={[styles.container, {backgroundColor: isNightMode ? Colors.BLACK : Colors.WHITE}]}>
          <HeaderComp headerTitle={item.title} />

          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {/* Cover Image */}
            {paperDetail.image ? (
              <MyImageComponent
                url={paperDetail.image}
                fallbackImage={imagePaths.DEFAULT_16_9}
                resizeMode="cover"
                style={styles.coverImage}
              />
            ) : null}

            {/* Content Card */}
            <View style={[styles.contentCard, {backgroundColor: isNightMode ? '#1E1E1E' : Colors.WHITE}]}>
              <Text style={[styles.title, {color: isNightMode ? Colors.WHITE : Colors.TEXT_COLOR}]}>
                {item.title}
              </Text>

              {/* Short Description */}
              {paperDetail.short_desc ? (
                <View style={styles.htmlContainer}>
                  <HTML
                    contentWidth={windowWidth}
                    source={{html: paperDetail.short_desc}}
                    tagsStyles={htmlTagsStyles}
                  />
                </View>
              ) : null}

              {/* Syllabus Section */}
              <Text style={[styles.subtitle, {color: isNightMode ? Colors.WHITE : Colors.TEXT_COLOR}]}>
                Cat Syllabus
              </Text>

              {paperDetail.description ? (
                <View style={styles.htmlContainer}>
                  <HTML
                    contentWidth={windowWidth}
                    source={{html: paperDetail.description}}
                    tagsStyles={htmlTagsStyles}
                  />
                </View>
              ) : null}

              {/* Video Preview */}
              {paperDetail.video ? (
                <TouchableOpacity
                  onPress={() =>
                    navToPlayer({
                      url: paperDetail.video,
                      title: paperDetail.title,
                    })
                  }>
                  <ImageBackground
                    source={imagePaths.DEFAULT_16_9}
                    style={styles.videoThumb}
                    resizeMode="cover"
                    imageStyle={{borderRadius: 12}}
                    blurRadius={2}>
                    <View style={styles.playOverlay}>
                      <Image source={imagePaths.PLAY} style={CommonStyles.playIcon} />
                      <Text style={styles.playText}>Watch Video</Text>
                    </View>
                  </ImageBackground>
                </TouchableOpacity>
              ) : null}
            </View>
          </ScrollView>

          {/* Bottom Button */}
          {paperDetail.syllabus_url ? (
            <SafeAreaView>
              <TouchableOpacity
                onPress={() => openLinkInChrome(paperDetail.syllabus_url)}
                style={styles.downloadBtn}>
                <Text style={styles.downloadBtnText}>📄 Download Syllabus</Text>
              </TouchableOpacity>
            </SafeAreaView>
          ) : null}
        </View>
      )}
    </>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 0,
  },
  coverImage: {
    width: '100%',
    height: 200,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  contentCard: {
    margin: 15,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
  },
  htmlContainer: {
    marginBottom: 10,
  },
  videoThumb: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 10,
    overflow: 'hidden',
  },
  playOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playText: {
    color: Colors.WHITE,
    fontSize: 14,
    marginTop: 6,
  },
  downloadBtn: {
    backgroundColor: Colors.THEME,
    marginTop: 10,
    marginBottom: 20,
    marginHorizontal: 15,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 4,
  },
  downloadBtnText: {
    color: Colors.WHITE,
    fontWeight: '600',
    fontSize: 16,
  },
});
