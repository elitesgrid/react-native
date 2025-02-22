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
} from 'react-native';

import imagePaths from '../../Constants/imagePaths';
import CustomHelper from '../../Constants/CustomHelper';
import FeedService from '../../Services/apis/FeedService';
import Colors from '../../Constants/Colors';
import navigationStrings from '../../Constants/navigationStrings';
import BottomSheet, {BottomSheetFlatList} from '@gorhom/bottom-sheet';
import Styles from '../../Assets/Style/LoginStyle';

export const FeedList = props => {
  const {navigation} = props;

  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [feedList, setFeedList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [postBottomSheetPayload, setPostBottomSheetPayload] = useState({});
  const [bottomSheetOpenPost, setBottomSheetOpenPost] = useState(false);

  const [activeFeedId, setActiveFeedId] = useState(0);
  const sheetRef = useRef(null);
  const [modalImageUrl, setModalImageUrl] = useState('');

  const getFeeds = async function () {
    return await FeedService.get_feed_list({page: currentPage, id: 0})
      .then(async data => {
        setIsLoading(false);
        if (data.status === true) {
          data = data.data;
          //console.log(data[0]);
          setFeedList(data);
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
    console.log(payload);
    let index = obj.index;
  };

  const hideFeed = function () {
    let obj = postBottomSheetPayload;
    let payload = {
      feed_id: obj.feed_id,
    };
    let index = obj.index;
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
    console.log(response);
  }

  const onRefresh = async () => {
    handleClosePress();
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

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
        <ActivityIndicator size="large" color="red" />
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
      <FlatList
        data={feedList}
        renderItem={item => {
          let index = item.index;
          item = item.item;
          return (
            <View
              style={{
                flex: 1,
                marginHorizontal: 10,
                backgroundColor: '#FFFFFF',
                borderRadius: 10,
                marginTop: 6,
                borderColor: '#FFFFFF',
                borderWidth: 1,
              }}>
              <TouchableOpacity
                onPress={() => navToFeedDetail({feed_id: item.id})}
                style={{flex: 1, flexDirection: 'row'}}>
                <View
                  style={{
                    flex: 0.15,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Image
                    source={fixImageUrl(item.profile_image, item.name)}
                    resizeMode="stretch"
                    style={{
                      height: 30,
                      width: 30,
                      borderRadius: 20,
                      borderWidth: 0.2,
                      borderColor: '#9096B4',
                    }}
                  />
                </View>
                <View style={{flex: 0.8, marginHorizontal: 10}}>
                  <Text
                    style={{fontSize: 12, color: '#0274BA', marginVertical: 3}}>
                    {item.name}
                  </Text>
                  <Text style={{color: '#9096B4', fontSize: 10}}>
                    {CustomHelper.tsToDate(item.created, 'd-m-Y h:i A')}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => openBottomSheet({feed_id: item.id})}>
                  <Image
                    style={{width: 4, height: 16, marginHorizontal: 5}}
                    resizeMode="stretch"
                    source={imagePaths.FEED_MORE_GRAY}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
              <View style={{marginVertical: 8}}>
                <View>
                  <Text style={{fontSize: 13, opacity: 0.6}}>{item.text}</Text>
                </View>
                {item.meta_url !== '' && (
                  <TouchableOpacity
                    onPress={() => setModalVisible(item.meta_url)}
                    style={{marginTop: 10}}>
                    <Image
                      style={{width: '100%', height: 200}}
                      source={{uri: item.meta_url}}
                      resizeMode="stretch"
                    />
                  </TouchableOpacity>
                )}
                {item.meta_url_1 !== '' && (
                  <TouchableOpacity
                    onPress={() => setModalVisible(item.meta_url_1)}
                    style={{marginTop: 10}}>
                    <Image
                      style={{width: '100%', height: 200}}
                      source={{uri: item.meta_url_1}}
                      resizeMode="stretch"
                    />
                  </TouchableOpacity>
                )}
              </View>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  height: 30,
                  marginLeft: 5,
                }}>
                <TouchableOpacity
                  onPress={() =>
                    likeUnlikeFeed({
                      my_like: item.my_like,
                      index: index,
                      feed_id: item.id,
                    })
                  }
                  style={{
                    flexDirection: 'row',
                    width: '30%',
                    alignItems: 'center',
                  }}>
                  <Image
                    style={{width: 20, height: 20}}
                    source={
                      item.my_like === '0'
                        ? imagePaths.FEED_LIKE
                        : imagePaths.FEED_UNLIKE
                    }
                  />
                  <Text
                    style={{
                      color: item.my_like === '0' ? Colors.BLACK : Colors.THEME,
                    }}>
                    {' ' +
                      item.total_likes +
                      ' ' +
                      (item.my_like === '0' ? 'Like' : 'Unlike')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navToFeedDetail({feed_id: item.id})}
                  style={{
                    flexDirection: 'row',
                    width: '30%',
                    alignItems: 'center',
                  }}>
                  <Image
                    style={{width: 15, height: 15}}
                    source={imagePaths.FEED_COMMENT}
                  />
                  <Text>{' ' + item.total_comments + ' Comment'}</Text>
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
