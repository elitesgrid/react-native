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
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {TabView, TabBar} from 'react-native-tab-view';

import PortalService from '../../Services/apis/PortalService';
import HeaderComp from '../../Components/HeaderComp';
import imagePaths from '../../Constants/imagePaths';
import navigationStrings from '../../Constants/navigationStrings';
import LoadingComp from '../../Components/LoadingComp';
import CustomHelper from '../../Constants/CustomHelper';
import Colors from '../../Constants/Colors';
import CommonStyles from '../../Assets/Style/CommonStyle';
import PortalStyles from '../../Assets/Style/PortalStyle';
import TestSeriesStyle from '../../Assets/Style/TestSeriesStyle';

// create a component
const TimelineTabs = props => {
  const {fileType, navigation} = props;

  const [isLoading, setIsLoading] = useState(true);
  const [timeline, setTimeline] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [player1Payload, setPlayer1Payload] = useState({});
  const [player2Payload, setPlayer2Payload] = useState({});
  const [hasMoreData, setHasMoreData] = useState(true);
  const [page, setPage] = useState(1);

  const getTimeline = async function () {
    if (!hasMoreData) return;

    let payload = {
      page: page,
      file_type: fileType,
    };
    //console.log(payload);
    return await PortalService.get_timeline(payload)
      .then(async data => {
        //console.log(data);
        if (data.status === true) {
          setTimeline(prevData => [...prevData, ...data.data]);
          setPage(prevPage => prevPage + 1);
        }
        if (data.data.length === 0) {
          setHasMoreData(false);
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
      total_seconds: 0,
      watched_time: 0,
      is_completed: params.is_completed === '0' ? '1' : '0',
      remark: '',
    };
    // setIsLoading(true);
    await PortalService.update_video_time(payload);
    const updatedTimeline = timeline.map(element =>
      element.id === params.id
        ? {...element, is_completed: payload.is_completed}
        : element,
    );
    // setIsLoading(false);
    setTimeline(updatedTimeline);
  }

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
    // console.log(payload);
    // setIsLoading(true);
    let response = await PortalService.mark_complete_pdf(payload);
    // console.log(response);
    const updatedTimeline = timeline.map(element =>
      element.id === payload.file_id
        ? {...element, is_open: payload.is_open}
        : element,
    );

    // setIsLoading(false);
    setTimeline(updatedTimeline);
  };

  const navToStartTest = function (item) {
    if(global.WEBVIEW_TEST === "1"){
      navigation.navigate(navigationStrings.TEST_WEBVIEW, item);
    } else {
      if(item.internal_type == "View Result"){
        navigation.navigate(navigationStrings.TEST_VIEW_RESULT, item);
      } else if(item.internal_type == "View Rankers"){
        navigation.navigate(navigationStrings.TEST_RANKERS, item);
      } else {
        navigation.navigate(navigationStrings.TEST_INSTRUCTIONS, item);
      }
    }
  };

  useEffect(
    function () {
      setTimeline([]);
      getTimeline();
    },
    [fileType],
  );

  return (
    <>
      {isLoading ? (
        <LoadingComp />
      ) : (
        <View style={styles.container}>
          <FlatList
            data={timeline}
            numColumns={1}
            renderItem={({item, index}) => (
              <View>
                {parseInt(item.file_type) === 1 && (
                  <View
                    style={{
                      borderColor: '#EEEEEE',
                      backgroundColor: 'white',
                      borderWidth: 1,
                      borderRadius: 10,
                      marginVertical: 2.5,
                      marginHorizontal: 2.5,
                      width: '100%',
                      // height: 90,
                      paddingVertical: 10,
                      paddingHorizontal: 10,
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <View style={{width: 55}}>
                      <Image
                        resizeMode="stretch"
                        source={imagePaths.DEFAULT_PDF}
                        style={{
                          ...CommonStyles.playIcon,
                          ...{height: 55, width: 45, alignSelf: 'center'},
                        }}
                      />
                    </View>
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'column',
                        marginLeft: 10,
                      }}>
                      <View>
                        <Text
                          style={{
                            color: Colors.BLACK,
                            fontSize: 14,
                            fontWeight: '500',
                          }}>
                          {item.title}
                        </Text>
                        <Text
                          style={{
                            color: Colors.IDLE,
                            fontSize: 12,
                            marginVertical: 3,
                          }}>
                          <Text
                            style={{
                              color: Colors.BLACK,
                              fontSize: 12,
                              fontWeight: '500',
                            }}>
                            {'Description: '}
                          </Text>
                          {item.description.trim()}
                        </Text>
                        <Text
                          style={{
                            ...PortalStyles.SubjectTopicInfoMeta,
                            ...{marginBottom: 3},
                          }}>
                          {'File Type: PDF'}
                        </Text>
                      </View>
                      <View style={{flexDirection: 'row'}}>
                        <LinearGradient
                          colors={['#37B6F1', '#0274BA']}
                          style={{
                            borderRadius: 5,
                            justifyContent: 'center',
                            alignItems: 'center',
                            paddingHorizontal: 5,
                            marginRight: 8,
                          }}>
                          <TouchableOpacity
                            onPress={() => {
                              nav_to_pdf({title: item.title, url: item.url});
                            }}>
                            <Text
                              style={{
                                fontSize: 12,
                                paddingVertical: 3,
                                color: Colors.WHITE,
                              }}>
                              View
                            </Text>
                          </TouchableOpacity>
                        </LinearGradient>
                        <TouchableOpacity
                          onPress={() => {
                            update_pdf_state(item);
                          }}
                          style={{
                            alignItems: 'center',
                            justifyContent:'center',
                            backgroundColor:
                              item.is_open === '1'
                                ? Colors.SUCCESS
                                : Colors.WARNING,
                            paddingHorizontal: 5,
                            borderRadius: 5,
                          }}>
                          <Text
                            style={{
                              marginHorizontal: 8,
                              fontSize: 14,
                              color: Colors.WHITE,
                            }}>
                            {item.is_open === '1' ? 'Completed' : 'Pending'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}
                {parseInt(item.file_type) === 3 && (
                  <TouchableOpacity
                    onPress={() =>
                      item.url_2
                        ? choosePlayer({
                            url: item.url,
                            url_2: item.url_2,
                            id: item.id,
                            length: item?.length || 0,
                            watched_time: item?.watched_time || 0,
                            title: item.title,
                          })
                        : navToPlayer({
                            url: item.url,
                            id: item.id,
                            length: item?.length || 0,
                            watched_time: item?.watched_time || 0,
                            title: item.title,
                          })
                    }
                    key={index}
                    style={PortalStyles.SubjectTopicCard}>
                    <View
                      style={{
                        paddingVertical: 20,
                        paddingHorizontal: 10,
                      }}>
                      <View style={{flex: 1, flexDirection: 'row'}}>
                        <View>
                          <Image
                            source={imagePaths.DEFAULT_VIDEO}
                            style={{
                              ...CommonStyles.playIcon,
                              ...{
                                height: 55,
                                width: 55,
                                alignSelf: 'center',
                              },
                            }}
                          />
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
                            <Text
                              style={{
                                color: Colors.BLACK,
                                fontSize: 12,
                                fontWeight: '500',
                              }}>
                              {'Description: '}
                            </Text>
                            {item.description.trim()}
                          </Text>
                          <Text
                            style={{
                              ...PortalStyles.SubjectTopicInfoMeta,
                              ...{marginTop: 3},
                            }}>
                            {'File Type: Video'}
                          </Text>
                          <Text
                            style={{
                              ...PortalStyles.SubjectTopicInfoMeta,
                              ...{marginTop: 3},
                            }}>
                            {'Date: ' +
                              CustomHelper.tsToDate(
                                item.attach_date,
                                'd-m-Y h:i A',
                              )}
                          </Text>
                        </View>
                      </View>
                      <View style={{flexDirection: 'row', marginLeft: 60,marginTop: 5}}>
                        <LinearGradient
                          colors={['#37B6F1', '#0274BA']}
                          style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 5,
                            paddingHorizontal: 8,
                            marginHorizontal: 5,
                          }}>
                          <Text
                            style={{
                              marginVertical: 2,
                              fontSize: 14,
                              color: Colors.WHITE,
                            }}>
                            {'View'}
                          </Text>
                        </LinearGradient>
                        <TouchableOpacity
                          onPress={() => {
                            update_video_time(item);
                          }}
                          style={{
                            alignItems: 'center',
                            borderRadius: 5,
                            paddingHorizontal: 8,
                            backgroundColor:
                              item.is_completed === '1' || item.is_open === '1'
                                ? Colors.SUCCESS
                                : Colors.WARNING,
                          }}>
                          <Text
                            style={{
                              marginVertical: 2,
                              fontSize: 14,
                              color: Colors.WHITE,
                            }}>
                            {item.is_completed === '1' || item.is_open === '1'
                              ? 'Completed'
                              : 'Pending'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
                {parseInt(item.file_type) === 8 && (
                  <View
                    style={{
                      ...TestSeriesStyle.container,
                      ...TestSeriesStyle.testListContainer,
                    }}>
                    <View style={TestSeriesStyle.testListCart1}>
                      <View style={{justifyContent: 'center'}}>
                        <Image
                          resizeMode="stretch"
                          source={imagePaths.DEFAULT_TEST}
                          style={{height: 50, width: 50}}
                        />
                      </View>
                      <View style={TestSeriesStyle.testListCartTitle}>
                        <View>
                          <Text style={TestSeriesStyle.testListTitle}>
                            {item.title}
                          </Text>
                          <Text style={TestSeriesStyle.testListMeta}>
                            <Text
                              style={{
                                color: Colors.BLACK,
                                fontSize: 12,
                                fontWeight: '500',
                              }}>
                              {'Description: '}
                            </Text>
                            {item.description.trim()}
                          </Text>
                          <Text
                            style={{
                              ...PortalStyles.SubjectTopicInfoMeta,
                              ...{marginBottom: 5},
                            }}>
                            {'File Type: Test'}
                          </Text>
                          {item.report_id &&
                            item.state == '2' &&
                            item.res_seq_attempt == '1' && (
                              <Text
                                style={{
                                  ...TestSeriesStyle.testListMeta,
                                  ...TestSeriesStyle.testAttemptMarksLabel,
                                }}>
                                {'Marks: ' + item.marks}
                              </Text>
                            )}
                        </View>
                        <View>
                          <View style={TestSeriesStyle.testListCart2}>
                            {item.report_id && item.state == '2' && (
                              <LinearGradient
                                colors={['#37B6F1', '#0274BA']}
                                style={TestSeriesStyle.testListButton}>
                                <TouchableOpacity
                                  onPress={() => {
                                    navToStartTest({
                                      ...item,
                                      ...{internal_type: 'View Result'},
                                    });
                                  }}>
                                  <Text
                                    style={{
                                      fontSize: 12,
                                      fontWeight: '600',
                                      color: Colors.WHITE,
                                      textAlign: 'center',
                                    }}>
                                    {'View Result'}
                                  </Text>
                                </TouchableOpacity>
                              </LinearGradient>
                            )}
                            {item.report_id && item.state !== '2' && (
                              <LinearGradient
                                colors={['#37B6F1', '#0274BA']}
                                style={TestSeriesStyle.testListButton}>
                                <TouchableOpacity
                                  onPress={() => {
                                    navToStartTest({
                                      ...item,
                                      ...{internal_type: 'Resume Test'},
                                    });
                                  }}>
                                  <Text
                                    style={{
                                      marginVertical: 1,
                                      fontSize: 12,
                                      color: Colors.WHITE,
                                    }}>
                                    {'Resume'}
                                  </Text>
                                </TouchableOpacity>
                              </LinearGradient>
                            )}
                            {!item.report_id && (
                              <LinearGradient
                                colors={['#37B6F1', '#0274BA']}
                                style={TestSeriesStyle.testListButton}>
                                <TouchableOpacity
                                  onPress={() => {
                                    navToStartTest({
                                      ...item,
                                      ...{internal_type: 'Start Test'},
                                    });
                                  }}>
                                  <Text
                                    style={{
                                      marginVertical: 1,
                                      fontSize: 12,
                                      color: Colors.WHITE,
                                    }}>
                                    {'Attempt Now'}
                                  </Text>
                                </TouchableOpacity>
                              </LinearGradient>
                            )}
                            {item.report_id &&
                              item.view_rankers_count !== '0' && (
                                <LinearGradient
                                  colors={['#37B6F1', '#0274BA']}
                                  style={TestSeriesStyle.testListButton}>
                                  <TouchableOpacity
                                    onPress={() => {
                                      navToStartTest({
                                        ...item,
                                        ...{internal_type: 'View Rankers'},
                                      });
                                    }}>
                                    <Text
                                      style={{
                                        marginVertical: 1,
                                        fontSize: 12,
                                        color: Colors.WHITE,
                                      }}>
                                      {'View Rankers'}
                                    </Text>
                                  </TouchableOpacity>
                                </LinearGradient>
                              )}
                            {item.report_id &&
                              item.state == '2' &&
                              item.practice == '0' && (
                                <LinearGradient
                                  colors={['#37B6F1', '#0274BA']}
                                  style={TestSeriesStyle.testListButton}>
                                  <TouchableOpacity
                                    onPress={() => {
                                      navToStartTest({
                                        ...item,
                                        ...{internal_type: 'Start Practice'},
                                      });
                                    }}>
                                    <Text
                                      style={{
                                        marginVertical: 1,
                                        fontSize: 12,
                                        color: Colors.WHITE,
                                      }}>
                                      {'Practice'}
                                    </Text>
                                  </TouchableOpacity>
                                </LinearGradient>
                              )}
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            )}
            keyExtractor={item => item.id}
            contentContainerStyle={{marginHorizontal: 5, marginTop: 10}}
            onEndReached={getTimeline} // Fetch more data when end is reached
            onEndReachedThreshold={0.5} // Load data when halfway to the end
            ListFooterComponent={
              isLoading ? (
                <ActivityIndicator size="large" color="#0000ff" />
              ) : null
            }
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

export const Timeline = props => {
  const {route, navigation} = props;
  const {params} = route;
  const layout = useWindowDimensions();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    {key: 'all', title: 'All', fileType: '0'},
    {key: 'pdf', title: 'PDF', fileType: '1'},
    {key: 'video', title: 'Video', fileType: '3'},
    {key: 'test', title: 'Test', fileType: '8'},
  ]);

  const renderScene = ({route}) => (
    <TimelineTabs navigation={navigation} fileType={route.fileType} />
  );

  return (
    <>
      <View style={styles.container}>
        <HeaderComp headerTitle={'My Timeline'} />
        <TabView
          navigation={navigation}
          navigationState={{index, routes}}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{width: layout.width, backgroundColor: Colors.THEME}}
          lazy
          lazyPreloadDistance={0}
          renderTabBar={props => (
            <TabBar
              {...props}
              scrollEnabled
              tabStyle={{width: 'auto'}}
              indicatorStyle={{backgroundColor: 'white', height: 3}}
              style={{backgroundColor: Colors.THEME}}
            />
          )}
        />
      </View>
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
