//import liraries
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Modal,
  Pressable,
  TouchableOpacity,
  Image,
  ImageBackground,
} from 'react-native';
import * as Progress from 'react-native-progress';

import PortalService from '../../../Services/apis/PortalService';
import HeaderComp from '../../../Components/HeaderComp';
import imagePaths from '../../../Constants/imagePaths';
import navigationStrings from '../../../Constants/navigationStrings';
import LoadingComp from '../../../Components/LoadingComp';
import CustomHelper from '../../../Constants/CustomHelper';
import Colors from '../../../Constants/Colors';
import CommonStyles from '../../../Assets/Style/CommonStyle';
import PortalStyles from '../../../Assets/Style/PortalStyle';

// create a component
export const RecordedClasses3 = props => {
  const {route, navigation} = props;
  const {params} = route;

  const [isLoading, setIsLoading] = useState(true);
  const [recordedClasses, setRecordedClasses] = useState([]);
  const [payloadPrevScreen, setPayloadPrevScreen] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [player1Payload, setPlayer1Payload] = useState({});
  const [player2Payload, setPlayer2Payload] = useState({});

  const getRecordedClasses = async function (params) {
    setPayloadPrevScreen(params);
    let payload = {
      page: 1,
      level: 3,
      subject_id: params.subject_id,
      topic_id: params.id,
    };
    if (params.file_id) {
      payload.file_id = params.file_id;
    }
    // console.log(payload);
    return await PortalService.get_recorded_classes(payload)
      .then(async data => {
        //console.log(data);
        if (data.status === true) {
          let data1 = data.data;
          //console.log(data1.result[0]);
          let final_list = [];
          data1.result.forEach(element => {
            //if (data.time <= element.end_date) {
            element.thumbnail =
              element.thumbnail === ''
                ? 'https://www.elitesgrid.com/public/web_assets/elight-assets/images/logo/01.png'
                : element.thumbnail;
            final_list.push(element);
            //}
          });
          //console.log((final_list));
          setRecordedClasses(final_list);
        }
        setIsLoading(false);
        return true;
      })
      .catch(error => {
        // console.log(error);
        setIsLoading(false);
        CustomHelper.showMessage(error.message);
        return false;
      });
  };

  const navToPlayer = function (item) {
    setModalVisible(false);
    if (item.url) {
      navigation.navigate(navigationStrings.PLAYER, item);
    } else {
      CustomHelper.showMessage('Please enter URL.' + item.url);
    }
  };

  const choosePlayer = function (item) {
    setModalVisible(true);

    var payload = {...item};
    delete payload.url_2;
    setPlayer1Payload(payload);

    payload = {...item};
    if (payload.url_2) {
      let meeting_id = payload.url_2.split('#');
      payload.url = meeting_id[0];
    }
    payload.webview = true;
    setPlayer2Payload(payload);
  };

  async function update_video_time(params) {
    let payload = {
      type: 'video',
      file_id: params.id,
      total_seconds: params.length,
      watched_time: 0,
      is_completed: params.is_completed === '0' ? '1' : '0',
      remark: '',
    };
    // setIsLoading(true);
    var newData = [...recordedClasses];
    let response = await PortalService.update_video_time(payload);
    newData.forEach((element, index) => {
      element.id === params.id
        ? (newData[index].is_completed = payload.is_completed)
        : '';
    });

    // setIsLoading(false);
    setRecordedClasses(newData);
  }

  function calculatePercentage(watchedTime, totalTime) {
    watchedTime = parseInt(watchedTime);
    totalTime = parseInt(totalTime);
    if (
      typeof watchedTime !== 'number' ||
      typeof totalTime !== 'number' ||
      totalTime === 0
    ) {
      return 0; // Return 0 if inputs are invalid or totalTime is zero
    }
    let return_ = (watchedTime / totalTime) * 100;
    return parseInt(return_);
  }

  useEffect(
    function () {
      const unsubscribe = navigation.addListener('focus', () => {
        setRecordedClasses([]);
        async function fetchData() {
          // You can await here
          const response = await getRecordedClasses(params);
          //console.log(response);
        }
        fetchData();
      });
      return unsubscribe;
    },
    [navigation, params],
  );

  return (
    <>
      {isLoading ? (
        <LoadingComp />
      ) : (
        <View style={styles.container}>
          <HeaderComp headerTitle={payloadPrevScreen.title} />
          <FlatList
              data={recordedClasses}
              numColumns={1}
              renderItem={({ item, index }) => {
                  const isCompletedOrOpen = item.is_completed === '1' || item.is_open === '1';

                  // Consolidated onPress logic for cleaner JSX
                  const handlePress = () => {
                      const navParams = {
                          url: item.url,
                          id: item.id,
                          length: item.length,
                          watched_time: item.watched_time,
                          title: item.title,
                      };

                      if (item.url_2) {
                          choosePlayer({ ...navParams, url_2: item.url_2 });
                      } else {
                          navToPlayer(navParams);
                      }
                  };

                  return (
                      <TouchableOpacity
                          onPress={handlePress}
                          key={index}
                          style={[PortalStyles.SubjectTopicCard, styles.videoCardContainer]}>
                          
                          <View style={styles.cardInnerContent}>
                              
                              {/* --- 1. Thumbnail and Info Row --- */}
                              <View style={styles.infoRow}>
                                  
                                  {/* Thumbnail Container */}
                                  <View style={styles.thumbnailWrapper}>
                                      <ImageBackground
                                          source={{ uri: item.thumbnail }}
                                          resizeMode="cover" // Changed to 'cover' for better visual fill
                                          style={[CommonStyles.videoListCardSize, styles.thumbnailImage]}
                                          blurRadius={1}>
                                          <View style={CommonStyles.overlay}>
                                              <Image
                                                  source={imagePaths.PLAY}
                                                  style={styles.playIcon}
                                              />
                                          </View>
                                      </ImageBackground>
                                  </View>
                                  
                                  {/* Text Metadata Column */}
                                  <View style={styles.metaColumn}>
                                      <Text style={PortalStyles.SubjectTopicInfoTitle} numberOfLines={2}>
                                          {item.title}
                                      </Text>
                                      <Text style={PortalStyles.SubjectTopicInfoMeta}>
                                          {'Total Time: ' + CustomHelper.secFormat(item.length)}
                                      </Text>
                                      <Text style={PortalStyles.SubjectTopicInfoMeta}>
                                          {'Watched Time: ' + CustomHelper.secFormat(item.watched_time)}
                                      </Text>
                                      <Text style={PortalStyles.SubjectTopicInfoMeta}>
                                          {'Remaining Time: ' + CustomHelper.secFormat(item.length - item.watched_time)}
                                      </Text>
                                      {/* Shortened Description line for better fit */}
                                      <Text style={PortalStyles.SubjectTopicInfoMeta} numberOfLines={1}>
                                          {'Desc: ' + item.description}
                                      </Text>
                                  </View>
                              </View>
                              
                              {/* --- 2. Progress Bar --- */}
                              <View style={styles.progressBarWrapper}>
                                  <Progress.Bar
                                      progress={
                                          calculatePercentage(item.watched_time, item.length) / 100
                                      }
                                      width={null}
                                      color={Colors.WARNING}
                                  />
                              </View>
                              
                              {/* --- 3. Action Button (Mark As Complete/Pending) --- */}
                              <View>
                                  <TouchableOpacity
                                      onPress={() => update_video_time(item)}
                                      style={[
                                          styles.actionButtonBase,
                                          {
                                              backgroundColor: isCompletedOrOpen ? Colors.SUCCESS : Colors.WARNING,
                                          },
                                      ]}>
                                      <Text style={styles.actionButtonText}>
                                          {'Marked As '}
                                          {isCompletedOrOpen ? 'Completed' : 'Pending'}
                                      </Text>
                                  </TouchableOpacity>
                              </View>
                          </View>
                      </TouchableOpacity>
                  );
              }}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.flatListContent}
          />
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(!modalVisible);
            }}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <View
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: Colors.IDLE,
                    margin: 10,
                  }}>
                  <Text
                    style={{fontSize: 18, fontWeight: '500', marginBottom: 5}}>
                    {'Choose Player'}
                  </Text>
                </View>
                <View
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: Colors.IDLE,
                    margin: 10,
                  }}>
                  <TouchableOpacity
                    onPress={() => {
                      navToPlayer(player1Payload);
                    }}
                    style={{
                      backgroundColor: Colors.THEME,
                      paddingVertical: 5,
                      paddingHorizontal: 10,
                      borderRadius: 5,
                      marginBottom: 10,
                    }}>
                    <Text style={{color: Colors.WHITE}}>{'Player 1'}</Text>
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: Colors.IDLE,
                  }}>
                  <TouchableOpacity
                    onPress={() => {
                      navToPlayer(player2Payload);
                    }}
                    style={{
                      backgroundColor: Colors.THEME,
                      paddingVertical: 5,
                      paddingHorizontal: 10,
                      borderRadius: 5,
                    }}>
                    <Text style={{color: Colors.WHITE}}>{'Player 2'}</Text>
                  </TouchableOpacity>
                </View>
                <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => setModalVisible(!modalVisible)}>
                  <Text style={styles.textStyle}>Hide Modal</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </View>
      )}
    </>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    // padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonClose: {
    marginVertical: 10,
  },
  flatListContent: { 
        marginHorizontal: 10, // Increased margin to 10 for better spacing
        marginTop: 10,
        paddingBottom: 20, // Ensure content isn't cut off at the bottom
    },
    // --- Card Styles ---
    videoCardContainer: {
        marginBottom: 15, // Space between cards
        borderRadius: 10,
        overflow: 'hidden',
        // Added shadow for a modern card lift effect
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardInnerContent: {
        minHeight: 200, 
        paddingVertical: 15, // Reduced padding for a less bulky card
        paddingHorizontal: 15, 
    },
    infoRow: { 
        flex: 1, 
        flexDirection: 'row',
        marginBottom: 10, // Added margin below the info block
    },
    // --- Thumbnail Styles ---
    thumbnailWrapper: {
        // Defines the fixed area for the image
        height: 90, 
        width: 90, 
        marginRight: 15, // Clear separation from text
        borderRadius: 8,
        overflow: 'hidden',
    },
    thumbnailImage: {
        // Overrides the spread inline style for clearer intent
        height: '100%', 
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    playIcon: {
        height: 35, 
        width: 35,
    },
    // --- Metadata Styles ---
    metaColumn: {
        flex: 1,
        flexDirection: 'column',
        // Removes marginLeft: 10 as it's handled by thumbnailWrapper's marginRight
    },
    // --- Progress Bar ---
    progressBarWrapper: { 
        marginBottom: 15, // Increased space below bar
        marginTop: 4 
    },
    // --- Action Button Styles ---
    actionButtonBase: {
        alignItems: 'center',
        borderRadius: 6, 
        paddingVertical: 10, // Standardized padding
    },
    actionButtonText: {
        fontSize: 15, 
        fontWeight: '700',
        color: Colors.WHITE,
    },
});
