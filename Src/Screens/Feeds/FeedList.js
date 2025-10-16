import React, {useEffect, useState, useRef, useMemo, useCallback} from 'react';
import {
  Text,
  View,
  Modal,
  ActivityIndicator,
  Image,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Alert,
  TextInput,
  StyleSheet
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

import imagePaths from '../../Constants/imagePaths';
import CustomHelper from '../../Constants/CustomHelper';
import FeedService from '../../Services/apis/FeedService';
import Colors from '../../Constants/Colors';
import navigationStrings from '../../Constants/navigationStrings';
import BottomSheet, {BottomSheetFlatList} from '@gorhom/bottom-sheet';
import Styles from '../../Assets/Style/LoginStyle';
import HomeService from '../../Services/apis/HomeService';

export const FeedList = props => {
  const {navigation} = props;

  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [feedList, setFeedList] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [courseId, setCourseId] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchFilter, setSearchFilter] = useState(0);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [postBottomSheetPayload, setPostBottomSheetPayload] = useState({});
  const [bottomSheetOpenPost, setBottomSheetOpenPost] = useState(false);

  const [activeFeedId, setActiveFeedId] = useState(0);
  const sheetRef = useRef(null);
  const [modalImageUrl, setModalImageUrl] = useState('');

  let is_courses_loaded = false;
  const getFeeds = async function () {
    if (is_courses_loaded === false) {
      is_courses_loaded = true;
      //console.log('Courses Server Loaded');
      getMyOrder();
    }

    let payload = {
      page: currentPage,
      search: searchFilter,
      id: 0,
      course_id: courseId,
    };
    console.log("Request Payload",payload);

    return await FeedService.get_feed_list(payload)
      .then(async data => {
        setIsLoading(false);
        if (data.status === true) {
          data = data.data;
          //console.log(data[0]);
          setFeedList(data);
        } else {
          setFeedList([]);
        }
        return true;
      })
      .catch(error => {
        Alert.alert('Error!', error.message);
        return false;
      });
  };

  const navToFeedDetail = function (obj) {
    navigation.navigate(navigationStrings.FEED_DETAIL, obj);
  };

  const likeUnlikeFeed = function (obj) {
    let payload = {
      my_like: obj.my_like === '0' ? '0' : '1',
      feed_id: obj.feed_id,
    };
    let index = obj.index;
    FeedService.like_unlike_feed(payload)
      .then(async data => {
        //console.log(payload);
        // let f_l = feedList;
        // console.log(f_l[index].my_like);
        // f_l[index].my_like = payload.my_like === "1" ? "0" : "1";
        // console.log(f_l[index].my_like);
        // setFeedList(f_l);
        fetchData();
      })
      .catch(error => {
        Alert.alert('Error!', error.message);
      });
  };

  const deleteFeed = function () {
    let obj = postBottomSheetPayload;
    let payload = {
      feed_id: obj.feed_id,
    };
    //console.log(payload);
    let index = obj.index;
  };

  const hideFeed = function () {
    let obj = postBottomSheetPayload;
    let payload = {
      feed_id: obj.feed_id,
    };
    let index = obj.index;
  };

  const getMyOrder = async function () {
    if (global.myCourses) {
      //console.log('Courses Local Loaded');
      setCourseList(global.myCourses);
      return;
    } else {
      return await HomeService.get_my_courses({})
        .then(async data => {
          setIsLoading(false);
          //console.log(data);
          if (data.status === true) {
            data = data.data;
            let dropdownData = [{value: 0, label: 'Select item'}];
            data.forEach(element => {
              if (element.is_doubt_avail === '1') {
                dropdownData.push({label: element.title, value: element.id});
              }
            });
            setCourseList(dropdownData);
            global.myCourses = dropdownData;
          }
          return true;
        })
        .catch(error => {
          Alert.alert('Error!', error.message);
          return false;
        });
    }
  };

  const openBottomSheet = function (obj) {
    //console.log(obj);
    setPostBottomSheetPayload(obj);
    setBottomSheetOpen(true);
    handleSnapPress(0);
  };

  const loadItems = function () {
    setCurrentPage(currentPage + 1);
    getFeeds();
  };

  const loadItemsPrev = function () {
    setCurrentPage(currentPage - 1);
    getFeeds();
  };

  function fixImageUrl(url, name) {
    try {
      let letter = name.charAt(0);
      letter = letter.toUpperCase();
      return url === '' ? imagePaths.LETTERS[letter] : {uri: url};
    } catch (e) {
      return imagePaths.DEFAULT_16_9;
    }
  }

  async function fetchData() {
    // You can await here
    const response = await getFeeds();
    //console.log(response);
  }

  const onRefresh = async () => {
    handleClosePress();
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };


  useEffect(function(){
    setCurrentPage(1);
    fetchData();
  }, [courseId]);

  useEffect(function(){
    setCurrentPage(1);
    fetchData();
  }, [searchFilter]);

  useEffect(
    function () {
      const unsubscribe = navigation.addListener('focus', () => {
        handleClosePress();
        fetchData();
      });
      return unsubscribe;
    },
    [navigation],
  );

  const renderLoader = () => {
    return (
      <View>
        {
          isLoading && <ActivityIndicator size="large" color="red" />
        }
      </View>
    );
  };

  //BottomSheet
  const data = useMemo(
    () =>
      Array(50)
        .fill(0)
        .map((_, index) => `index-${index}`),
    [],
  );
  const snapPoints = useMemo(() => ['25%', '50%', '90%'], []);

  // callbacks
  const handleSheetChange = useCallback(index => {
    if (index === 0) {
      console.log('handleSheetChange', index);
      // sheetRef.current?.close();
    } else {
      sheetRef.current?.snapToIndex(index);
    }
  }, []);

  const handleSnapPress = useCallback(index => {
    console.log('handleSheetChange:', index);
    sheetRef.current?.snapToIndex(index);
  }, []);

  const handleClosePress = useCallback(() => {
    sheetRef.current?.close();
  }, []);

  const setModalVisible = function (url) {
    setModalImageUrl(url);
  };

  return (
    <View style={{flex: 1, backgroundColor: '#F9F9F9'}}>
      <View
        style={{
          backgroundColor: Colors.WHITE,
          paddingHorizontal: 15,
          paddingVertical: 5,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <View
          style={{
            borderRadius: 50,
            borderColor: Colors.THEME,
            borderWidth: 1,
            width: 42,
            height: 42,
          }}>
          <Image
            style={{width: 40, height: 40, borderRadius: 50}}
            resizeMode="stretch"
            source={imagePaths.LOGO}></Image>
        </View>
        <View>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate(navigationStrings.CREATE_FEED);
            }}
            style={{
              ...Styles.inputSection,
              ...{
                width: '93%',
                marginLeft: 10,
                marginBottom: 0,
                paddingHorizontal: 10,
              },
            }}>
            <TextInput
              style={{width: '90%'}}
              placeholder={'Create Post'}
              autoCapitalize={'none'}
              keyboardType={'numeric'}
              editable={false}
            />
            <Image
              style={{height: 50, width: 20, height: 20}}
              source={imagePaths.CAMERA}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={{flexDirection: 'row'}}>
        <Dropdown
          style={{
            borderWidth: 0.2,
            height: 45,
            width: '47%',
            borderColor: Colors.IDLE,
            paddingHorizontal: 5,
            marginHorizontal: 5,
            marginVertical: 10,
            borderRadius: 5,
          }}
          placeholderStyle={{fontSize: 16, color: Colors.BLACK}}
          selectedTextStyle={{fontSize: 16, color: Colors.BLACK}}
          inputSearchStyle={{height: 40, fontSize: 16, color: Colors.BLACK}}
          iconStyle={{width: 20, height: 20, marginTop: 10, marginRight: 10}}
          data={courseList}
          //search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={'Select item'}
          //searchPlaceholder="Search..."
          value={courseId}
          onChange={item => {
            setCourseId(item.value);
          }}
        />
        <Dropdown
          style={{
            borderWidth: 0.2,
            height: 45,
            width: '47%',
            borderColor: Colors.IDLE,
            paddingHorizontal: 5,
            marginHorizontal: 5,
            marginVertical: 10,
            borderRadius: 5,
          }}
          placeholderStyle={{fontSize: 16, color: Colors.BLACK}}
          selectedTextStyle={{fontSize: 16, marginLeft: 10, color: Colors.BLACK}}
          inputSearchStyle={{height: 40, fontSize: 16, color: Colors.BLACK}}
          iconStyle={{width: 20, height: 20, marginTop: 2, marginRight: 10}}
          data={global.FEED_FILTERS || []}
          //search
          maxHeight={300}
          labelField="value"
          valueField="key"
          placeholder={'Select Filter'}
          //searchPlaceholder="Search..."
          // value={courseId}
          onChange={item => {
            //console.log("Item",item);
            setSearchFilter(item.key);
          }}
        />
      </View>
      {
        feedList && (
          <FlatList
              data={feedList}
              renderItem={item => {
                  let index = item.index;
                  item = item.item;
                  
                  const isLiked = item.my_like === '1';

                  return (
                      <View style={styles.feedCard}>
                          
                          {/* --- 1. Header (User Info and Options) --- */}
                          <TouchableOpacity
                              onPress={() => navToFeedDetail({feed_id: item.id})}
                              style={styles.feedHeaderTouch}>
                              
                              {/* Profile Image */}
                              <View style={styles.profileImageWrapper}>
                                  <Image
                                      source={fixImageUrl(item.profile_image, item.name)}
                                      resizeMode="cover" // 'cover' is generally better for profile images
                                      style={styles.profileImage}
                                  />
                              </View>
                              
                              {/* Name and Timestamp */}
                              <View style={styles.headerMeta}>
                                  <Text style={styles.userNameText}>{item.name}</Text>
                                  <Text style={styles.timestampText}>
                                      {CustomHelper.tsToDate(item.created, 'd-m-Y h:i A')}
                                  </Text>
                              </View>
                              
                              {/* More Options Button */}
                              <TouchableOpacity
                                  onPress={() => openBottomSheet({feed_id: item.id})}
                                  style={styles.moreOptionsButton}>
                                  <Image
                                      style={styles.moreOptionsIcon}
                                      resizeMode="contain"
                                      source={imagePaths.FEED_MORE_GRAY}
                                  />
                              </TouchableOpacity>
                          </TouchableOpacity>
                          
                          {/* --- 2. Content Body (Text and Media) --- */}
                          <View style={styles.contentBody}>
                              
                              {/* Post Text */}
                              <View style={styles.postTextWrapper}>
                                  <Text style={styles.postText}>{item.text}</Text>
                              </View>
                              
                              {/* Media Display (meta_url) */}
                              {item.meta_url !== '' && (
                                  <TouchableOpacity
                                      onPress={() => setModalVisible(item.meta_url)}
                                      style={styles.mediaContainer}>
                                      <Image
                                          style={styles.mediaImage}
                                          source={{uri: item.meta_url}}
                                          resizeMode="cover" // Changed to 'cover' for better filling
                                      />
                                  </TouchableOpacity>
                              )}
                              
                              {/* Media Display (meta_url_1) */}
                              {item.meta_url_1 !== '' && (
                                  <TouchableOpacity
                                      onPress={() => setModalVisible(item.meta_url_1)}
                                      style={styles.mediaContainer}>
                                      <Image
                                          style={styles.mediaImage}
                                          source={{uri: item.meta_url_1}}
                                          resizeMode="cover"
                                      />
                                  </TouchableOpacity>
                              )}
                          </View>
                          
                          {/* --- 3. Action Bar (Like/Comment) --- */}
                          <View style={styles.actionBar}>
                              
                              {/* Like/Unlike Button */}
                              <TouchableOpacity
                                  onPress={() =>
                                      likeUnlikeFeed({
                                          my_like: item.my_like,
                                          index: index,
                                          feed_id: item.id,
                                      })
                                  }
                                  style={styles.actionButton}>
                                  <Image
                                      style={styles.actionIcon}
                                      source={isLiked ? imagePaths.FEED_UNLIKE : imagePaths.FEED_LIKE}
                                  />
                                  <Text
                                      style={[
                                          styles.actionText,
                                          {
                                              color: isLiked ? Colors.THEME : Colors.BLACK,
                                              fontWeight: isLiked ? '600' : '400',
                                          },
                                      ]}>
                                      {' ' + item.total_likes + ' ' + (isLiked ? 'Liked' : 'Like')}
                                  </Text>
                              </TouchableOpacity>
                              
                              {/* Comment Button */}
                              <TouchableOpacity
                                  onPress={() => navToFeedDetail({feed_id: item.id})}
                                  style={styles.actionButton}>
                                  <Image
                                      style={styles.commentIcon}
                                      source={imagePaths.FEED_COMMENT}
                                  />
                                  <Text style={styles.actionText}>
                                      {' ' + item.total_comments + ' Comment'}
                                  </Text>
                              </TouchableOpacity>
                          </View>
                      </View>
                  );
              }}
              keyExtractor={item => item.id}
              refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              ListFooterComponent={renderLoader}
              onEndReached={loadItems}
              onScrollToTop={loadItemsPrev}
              onEndReachedThreshold={0.5}
          />
        )
      }
      {
        feedList.length === 0 && <View style={{
          flex: 1,
          backgroundColor: Colors.WHITE,
          alignItems:"center",
        }}>
          <Text style={{fontSize:20,color: Colors.FADDED_COLOR}}>No Post Found</Text>
        </View>
      }

      {bottomSheetOpen === true && (
        <BottomSheet
          ref={sheetRef}
          snapPoints={snapPoints}
          onChange={handleSheetChange}
          enablePanDownToClose={true}>
          <TouchableOpacity
            onPress={() => deleteFeed()}
            style={{
              flexDirection: 'row',
              marginHorizontal: 10,
              borderBottomWidth: 1,
              paddingVertical: 5,
              borderColor: Colors.IDLE,
            }}>
            <View>
              <Image
                source={imagePaths.DELETE}
                style={{width: 20, height: 20}}></Image>
            </View>
            <View style={{marginHorizontal: 10}}>
              <Text>{'Delete'}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => hideFeed()}
            style={{
              flexDirection: 'row',
              marginHorizontal: 10,
              borderBottomWidth: 1,
              paddingVertical: 5,
              borderColor: Colors.IDLE,
            }}>
            <View>
              <Image
                source={imagePaths.HIDE_EYE}
                style={{width: 20, height: 20}}></Image>
            </View>
            <View style={{marginHorizontal: 10}}>
              <Text>{'Hide Post'}</Text>
            </View>
          </TouchableOpacity>
        </BottomSheet>
      )}
      {bottomSheetOpenPost === true && (
        <BottomSheet
          ref={sheetRef}
          snapPoints={snapPoints}
          onChange={handleSheetChange}
          enablePanDownToClose={true}>
          <View
            style={{
              flexDirection: 'row',
              marginHorizontal: 10,
              borderBottomWidth: 1,
              paddingVertical: 5,
              borderColor: Colors.IDLE,
            }}>
            <View>
              <Image
                source={imagePaths.DELETE}
                style={{width: 20, height: 20}}></Image>
            </View>
            <View style={{marginHorizontal: 10}}>
              <Text>{'Delete'}</Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              marginHorizontal: 10,
              borderBottomWidth: 1,
              paddingVertical: 5,
              borderColor: Colors.IDLE,
            }}>
            <View>
              <Image
                source={imagePaths.HIDE_EYE}
                style={{width: 20, height: 20}}></Image>
            </View>
            <View style={{marginHorizontal: 10}}>
              <Text>{'Hide Post'}</Text>
            </View>
          </View>
        </BottomSheet>
      )}

      {modalImageUrl !== '' && (
        <Modal
          animationType="slide"
          //transparent={true}
          visible={modalImageUrl === '' ? false : true}
          onRequestClose={() => {
            setModalVisible(!modalImageUrl);
          }}>
          <SafeAreaView style={{marginTop: '8%'}}>
            <TouchableOpacity
              onPress={() => setModalVisible('')}
              style={{color: 'black'}}>
              <Text
                style={{
                  backgroundColor: Colors.THEME,
                  width: '20%',
                  paddingLeft: 20,
                  paddingVertical: 6,
                  color: Colors.WHITE,
                }}>
                Close
              </Text>
            </TouchableOpacity>
            <Image
              resizeMode="stretch"
              style={{height: '90%', width: '100%'}}
              source={{uri: modalImageUrl}}
            />
          </SafeAreaView>
        </Modal>
      )}
    </View>
  );
};


const styles = StyleSheet.create({
    // --- Card Container ---
    feedCard: {
        marginHorizontal: 10,
        backgroundColor: Colors.WHITE,
        borderRadius: 10,
        marginTop: 12, // Increased spacing between cards
        overflow: 'hidden', // Ensures borders/shadows are clean
        // Added shadow for a clean card effect
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 4,
    },
    
    // --- Header Styles ---
    feedHeaderTouch: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    profileImageWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    profileImage: {
        height: 38, // Slightly larger profile image
        width: 38,
        borderRadius: 19,
        borderWidth: 1, // Clearer border
        borderColor: Colors.BORDER_COLOR || '#E0E0E0',
    },
    headerMeta: {
        flex: 1,
        justifyContent: 'center',
    },
    userNameText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.THEME || '#0274BA',
        marginBottom: 2,
    },
    timestampText: {
        color: '#9096B4',
        fontSize: 11,
    },
    moreOptionsButton: {
        padding: 5, // Increased hit area
        marginLeft: 10,
    },
    moreOptionsIcon: {
        width: 4,
        height: 16,
    },

    // --- Content Body Styles ---
    contentBody: {
        paddingHorizontal: 15,
        paddingBottom: 10,
    },
    postTextWrapper: {
        marginBottom: 8,
    },
    postText: {
        fontSize: 13,
        opacity: 0.8, // Slightly increased opacity for better readability
        color: Colors.BLACK,
        lineHeight: 18,
    },
    mediaContainer: {
        marginTop: 10,
        borderRadius: 8, // Rounded corners for media
        overflow: 'hidden',
    },
    mediaImage: {
        width: '100%',
        height: 200,
    },

    // --- Action Bar Styles ---
    actionBar: {
        flexDirection: 'row',
        height: 40, // Standardized height
        borderTopWidth: 1,
        borderTopColor: Colors.BORDER_COLOR || '#F0F0F0',
        paddingHorizontal: 10,
    },
    actionButton: {
        flexDirection: 'row',
        width: 'auto', // Use auto-width for flexibility
        paddingHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginRight: 15, // Space between buttons
    },
    actionIcon: {
        width: 20,
        height: 20,
        marginRight: 4,
    },
    commentIcon: {
        width: 16, // Smaller icon size for comment
        height: 16,
        marginRight: 6,
    },
    actionText: {
        fontSize: 12,
        color: Colors.BLACK,
    },
});