import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';

import imagePaths from '../../Constants/imagePaths';
import HeaderComp from '../../Components/HeaderComp';
import CustomHelper from '../../Constants/CustomHelper';
import FeedService from '../../Services/apis/FeedService';
import Colors from '../../Constants/Colors';
import StorageManager from '../../Services/StorageManager';

export const FeedDetail = props => {
  const {route, navigation} = props;
  const {params} = route;

  const [isLoading, setIsLoading] = useState(true);
  const [feedDetail, setFeedDetail] = useState({});
  const [commentInput, setCommentInput] = useState('');
  const [commentList, setCommentList] = useState([]);
  const [userId, setUserId] = useState(0);

  const getFeedDetail = async function () {
    return await FeedService.get_feed_detail({feed_id: params.feed_id})
      .then(async data => {
        setIsLoading(false);
        if (data.status === true) {
          data = data.data;
          //console.log(data[0]);
          setFeedDetail(data);
        }
        return true;
      })
      .catch(error => {
        Alert.alert('Error!', error.message);
        return false;
      });
  };

  const getFeedComments = async function () {
    return await FeedService.get_feed_comments({feed_id: params.feed_id})
      .then(async data => {
        setIsLoading(false);
        if (data.status === true) {
          data = data.data;
          console.log(data);
          setCommentList(data);
        }
        return true;
      })
      .catch(error => {
        Alert.alert('Error!', error.message);
        return false;
      });
  };

  const likeUnlikeFeed = function (obj) {
    let payload = {
      my_like: obj.my_like === '0' ? '0' : '1',
      feed_id: obj.feed_id,
    };
    FeedService.like_unlike_feed(payload)
      .then(async data => {
        //console.log(payload);
        // let f_l = feedDetail;
        // f_l.my_like = payload.my_like === "1" ? "0" : "1";
        // setFeedDetail(f_l);
        getFeedDetail();
      })
      .catch(error => {
        Alert.alert('Error!', error.message);
      });
  };

  const deleteFeed = function (obj) {
    let payload = {
      feed_id: obj.feed_id,
    };
  };

  const hideFeed = function (obj) {
    let payload = {
      feed_id: obj.feed_id,
    };
  };

  const postComment = function () {
    if (commentInput === '') {
      Alert.alert('Error!', 'Please enter valid comment.');
      return false;
    }
    let payload = {
      comment: commentInput,
      feed_id: params.feed_id,
    };
    FeedService.comment_feed(payload)
      .then(async data => {
        //console.log(payload);
        // let f_l = feedDetail;
        // f_l.my_like = payload.my_like === "1" ? "0" : "1";
        // setFeedDetail(f_l);
        setCommentInput('');
        getFeedComments();
      })
      .catch(error => {
        Alert.alert('Error!', error.message);
      });
  };

  const deleteComment = function (comment_id) {
    let payload = {
      comment_id: comment_id,
      feed_id: params.feed_id,
    };
    FeedService.delete_comment(payload)
      .then(async data => {
        //console.log(payload);
        // let f_l = feedDetail;
        // f_l.my_like = payload.my_like === "1" ? "0" : "1";
        // setFeedDetail(f_l);
        getFeedComments();
      })
      .catch(error => {
        Alert.alert('Error!', error.message);
      });
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
    const response = await getFeedDetail();
    await getFeedComments();
    console.log(response);

    var session = await StorageManager.get_session();
    if (Object.keys(session).length > 0) {
      setUserId(session.id);
    }
  }

  useEffect(
    function () {
      const unsubscribe = navigation.addListener('focus', () => {
        console.log('Feed Detail');
        fetchData();
      });
      return unsubscribe;
    },
    [navigation, params],
  );

  return (
    <View style={{flex: 1}}>
      <HeaderComp headerTitle="Feed Details" />
      <View
        style={{
          marginHorizontal: 10,
          backgroundColor: '#FFFFFF',
          borderRadius: 10,
          marginTop: 6,
          borderColor: '#FFFFFF',
          borderWidth: 1,
        }}>
        <View style={{flexDirection: 'row', height: 40}}>
          <View
            style={{
              flex: 0.15,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Image
              source={fixImageUrl(feedDetail.profile_image, feedDetail.name)}
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
            <Text style={{fontSize: 12, color: '#0274BA', marginVertical: 3}}>
              {feedDetail.name}
            </Text>
            <Text style={{color: '#9096B4', fontSize: 10}}>
              {CustomHelper.tsToDate(feedDetail.created, 'd-m-Y h:i A')}
            </Text>
          </View>
          <View>
            <Image
              style={{width: 4, height: 16, marginHorizontal: 5}}
              resizeMode="stretch"
              source={imagePaths.FEED_MORE_GRAY}
            />
          </View>
        </View>
        <View style={{marginVertical: 8}}>
          <View style={{marginHorizontal: 5}}>
            <Text style={{fontSize: 13, opacity: 0.6, color: Colors.BLACK}}>{feedDetail.text}</Text>
          </View>
          {feedDetail.meta_url !== '' && (
            <View style={{marginTop: 10}}>
              <Image
                style={{width: '100%', height: 200}}
                source={{uri: feedDetail.meta_url}}
                resizeMode="stretch"
              />
            </View>
          )}
          {feedDetail.meta_url_1 !== '' && (
            <View style={{marginTop: 10}}>
              <Image
                style={{width: '100%', height: 200}}
                source={{uri: feedDetail.meta_url_1}}
                resizeMode="stretch"
              />
            </View>
          )}
        </View>
        <View style={{flexDirection: 'row', height: 30, marginLeft: 5}}>
          <TouchableOpacity
            onPress={() =>
              likeUnlikeFeed({
                my_like: feedDetail.my_like,
                feed_id: feedDetail.id,
              })
            }
            style={{flexDirection: 'row', width: '30%', alignItems: 'center'}}>
            <Image
              style={{width: 20, height: 20}}
              source={
                feedDetail.my_like === '0'
                  ? imagePaths.FEED_LIKE
                  : imagePaths.FEED_UNLIKE
              }
            />
            <Text
              style={{
                color: feedDetail.my_like === '0' ? Colors.BLACK : Colors.THEME,
              }}>
              {' ' +
                feedDetail.total_likes +
                ' ' +
                (feedDetail.my_like === '0' ? 'Like' : 'Unlike')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{flexDirection: 'row', width: '30%', alignItems: 'center'}}>
            <Image
              style={{width: 15, height: 15}}
              source={imagePaths.FEED_COMMENT}
            />
            <Text>{' ' + feedDetail.total_comments + ' Comment'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={commentList}
        renderItem={item => {
          item = item.item;
          return (
            <View
              style={{
                flex: 1,
                marginHorizontal: 10,
                marginVertical: 10,
                backgroundColor: '#FFFFFF',
                borderRadius: 10,
                marginTop: 6,
                borderColor: '#FFFFFF',
                borderWidth: 1,
              }}>
              <View style={{flex: 1, flexDirection: 'row'}}>
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
                {item.user_id === userId && (
                  <TouchableOpacity onPress={() => deleteComment(item.id)}>
                    <Image
                      style={{width: 16, height: 16, marginHorizontal: 5}}
                      resizeMode="stretch"
                      source={imagePaths.DELETE}
                    />
                  </TouchableOpacity>
                )}
              </View>
              <View style={{marginVertical: 8, marginHorizontal: 10}}>
                <View>
                  <Text style={{fontSize: 13, opacity: 0.6, color: Colors.BLACK}}>
                    {item.comment}
                  </Text>
                </View>
              </View>
            </View>
          );
        }}
        keyExtractor={item => item.id}
        onEndReachedThreshold={0.5}
      />
      <View
        style={{
          flexDirection: 'row',
          height: '7%',
          width: '100%',
          backgroundColor: 'white',
        }}>
        <TextInput
          style={{width: '75%', marginHorizontal: 15}}
          value={commentInput}
          placeholder={'Enter Comment'}
          onChangeText={text => setCommentInput(text)}
          autoCapitalize={'none'}
          placeholderTextColor={Colors.IDLE}
          // keyboardType={''}
        />
        <TouchableOpacity
          onPress={() => postComment()}
          style={{
            backgroundColor: Colors.THEME,
            width: '25%',
            justifyContent: 'center',
          }}>
          <Text
            style={{
              marginLeft: 10,
              color: Colors.WHITE,
              fontWeight: '500',
              fontSize: 16,
            }}>
            {'Post'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
