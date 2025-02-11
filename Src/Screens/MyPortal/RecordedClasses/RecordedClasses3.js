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
  Alert,
  Button,
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
        Alert.alert('Error!', error.message);
        return false;
      });
  };

  const navToPlayer = function (item) {
    setModalVisible(false);
    if (item.url) {
      navigation.navigate(navigationStrings.PLAYER, item);
    } else {
      Alert.alert('Error!', 'Please enter URL.' + item.url);
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
            renderItem={({item, index}) => (
              <TouchableOpacity
                onPress={() =>
                  item.url_2
                    ? choosePlayer({
                        url: item.url,
                        url_2: item.url_2,
                        id: item.id,
                        length: item.length,
                        watched_time: item.watched_time,
                        title: item.title,
                      })
                    : navToPlayer({
                        url: item.url,
                        id: item.id,
                        length: item.length,
                        watched_time: item.watched_time,
                        title: item.title,
                      })
                }
                key={index}
                style={PortalStyles.SubjectTopicCard}>
                <View
                  style={{
                    minHeight: 200,
                    paddingVertical: 20,
                    paddingHorizontal: 10,
                  }}>
                  <View style={{flex: 1, flexDirection: 'row'}}>
                    <View>
                      <ImageBackground
                        source={{uri: item.thumbnail}}
                        resizeMode="contain"
                        style={{
                          ...CommonStyles.videoListCardSize,
                          ...{height: 90, width: 90, marginHorizontal: 5},
                        }}
                        blurRadius={1}>
                        <View style={CommonStyles.overlay}>
                          <Image
                            source={imagePaths.PLAY}
                            style={{
                              ...CommonStyles.playIcon,
                              ...{height: 35, width: 35},
                            }}
                          />
                        </View>
                      </ImageBackground>
                    </View>
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'column',
                        marginLeft: 10,
                      }}>
                      <Text style={PortalStyles.SubjectTopicInfoTitle}>
                        {item.title}
                      </Text>
                      <Text style={PortalStyles.SubjectTopicInfoMeta}>
                        {'Total Time:' + CustomHelper.secFormat(item.length)}
                      </Text>
                      <Text style={PortalStyles.SubjectTopicInfoMeta}>
                        {'Watched Time:' +
                          CustomHelper.secFormat(item.watched_time)}
                      </Text>
                      <Text style={PortalStyles.SubjectTopicInfoMeta}>
                        {'Remaining Time:' +
                          CustomHelper.secFormat(
                            item.length - item.watched_time,
                          )}
                      </Text>
                      <Text style={PortalStyles.SubjectTopicInfoMeta}>
                        {'Desc: ' + item.description}
                      </Text>
                    </View>
                  </View>
                  <View style={{marginBottom: 10, marginTop: 4}}>
                    <Progress.Bar
                      progress={
                        calculatePercentage(item.watched_time, item.length) /
                        100
                      }
                      width={null}
                      color={Colors.WARNING}
                    />
                  </View>
                  <View>
                    <TouchableOpacity
                      onPress={() => {
                        update_video_time(item);
                      }}
                      style={{
                        alignItems: 'center',
                        borderRadius: 5,
                        backgroundColor:
                          item.is_completed === '1' || item.is_open === '1'
                            ? Colors.SUCCESS
                            : Colors.WARNING,
                      }}>
                      <Text
                        style={{
                          marginVertical: 8,
                          fontSize: 16,
                          fontWeight: '600',
                          color: Colors.WHITE,
                        }}>
                        {'Marked As '}
                        {item.is_completed === '1' || item.is_open === '1'
                          ? 'Completed'
                          : 'Pending'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={item => item.id}
            contentContainerStyle={{marginHorizontal: 5, marginTop: 10}}
          />
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              Alert.alert('Modal has been closed.');
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
});
