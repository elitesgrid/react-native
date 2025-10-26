import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet
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
        CustomHelper.showMessage(error.message);
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
        CustomHelper.showMessage(error.message);
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
        CustomHelper.showMessage(error.message);
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
      CustomHelper.showMessage('Please enter valid comment.');
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
        CustomHelper.showMessage(error.message);
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
        CustomHelper.showMessage(error.message);
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
      <View style={styles.feedDetailCard}>
    
          {/* --- 1. Header (User Info and Options) --- */}
          <View style={styles.feedHeaderRow}>
              
              {/* Profile Image */}
              <View style={styles.profileImageWrapper}>
                  <Image
                      source={fixImageUrl(feedDetail.profile_image, feedDetail.name)}
                      resizeMode="cover" // 'cover' is standard for profile images
                      style={styles.profileImage}
                  />
              </View>
              
              {/* Name and Timestamp */}
              <View style={styles.headerMeta}>
                  <Text style={styles.userNameText}>{feedDetail.name}</Text>
                  <Text style={styles.timestampText}>
                      {CustomHelper.tsToDate(feedDetail.created, 'd-m-Y h:i A')}
                  </Text>
              </View>
              
              {/* More Options Icon (No onPress, as this is a detail view) */}
              <View style={styles.moreOptionsContainer}>
                  <Image
                      style={styles.moreOptionsIcon}
                      resizeMode="contain"
                      source={imagePaths.FEED_MORE_GRAY}
                  />
              </View>
          </View>
          
          {/* --- 2. Content Body (Text and Media) --- */}
          <View style={styles.contentBody}>
              
              {/* Post Text */}
              <View style={styles.postTextWrapper}>
                  <Text style={styles.postText}>{feedDetail.text}</Text>
              </View>
              
              {/* Media Display (meta_url) */}
              {feedDetail.meta_url !== '' && (
                  <View style={styles.mediaContainer}>
                      <Image
                          style={styles.mediaImage}
                          source={{uri: feedDetail.meta_url}}
                          resizeMode="cover" // Changed to 'cover' for better filling
                      />
                  </View>
              )}
              
              {/* Media Display (meta_url_1) */}
              {feedDetail.meta_url_1 !== '' && (
                  <View style={styles.mediaContainer}>
                      <Image
                          style={styles.mediaImage}
                          source={{uri: feedDetail.meta_url_1}}
                          resizeMode="cover"
                      />
                  </View>
              )}
          </View>
          
          {/* --- 3. Action Bar (Like/Comment) --- */}
          <View style={styles.actionBar}>
              
              {/* Like/Unlike Button */}
              <TouchableOpacity
                  onPress={() =>
                      likeUnlikeFeed({
                          my_like: feedDetail.my_like,
                          feed_id: feedDetail.id,
                      })
                  }
                  style={styles.actionButton}>
                  <Image
                      style={styles.actionIcon}
                      source={
                          feedDetail.my_like === '0'
                              ? imagePaths.FEED_LIKE
                              : imagePaths.FEED_UNLIKE
                      }
                  />
                  <Text
                      style={[
                          styles.actionText,
                          {
                              color: feedDetail.my_like === '0' ? Colors.BLACK : Colors.THEME,
                          },
                      ]}>
                      {' ' +
                          feedDetail.total_likes +
                          ' ' +
                          (feedDetail.my_like === '0' ? 'Like' : 'Unlike')}
                  </Text>
              </TouchableOpacity>
              
              {/* Comment Button (Action is assumed to be handled elsewhere, this is for display) */}
              <TouchableOpacity style={styles.actionButton}>
                  <Image
                      style={styles.commentIcon}
                      source={imagePaths.FEED_COMMENT}
                  />
                  <Text style={styles.actionText}>
                      {' ' + feedDetail.total_comments + ' Comment'}
                  </Text>
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


const styles = StyleSheet.create({
    // --- Card Container ---
    feedDetailCard: {
        marginHorizontal: 10,
        backgroundColor: Colors.WHITE,
        borderRadius: 10,
        marginTop: 10,
        overflow: 'hidden',
        // Shadow for a clean card lift
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 4,
    },
    
    // --- Header Styles ---
    feedHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        minHeight: 45, // Ensures a minimum height
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
        borderWidth: 1, 
        borderColor: '#9096B4', // Used the original color here
        resizeMode: 'cover',
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
    moreOptionsContainer: {
        padding: 5,
        marginLeft: 10,
    },
    moreOptionsIcon: {
        width: 4,
        height: 16,
    },

    // --- Content Body Styles ---
    contentBody: {
        paddingHorizontal: 15, // Consistent padding
        paddingBottom: 10,
    },
    postTextWrapper: {
        marginBottom: 8,
    },
    postText: {
        fontSize: 13,
        opacity: 0.8, // Increased opacity for better readability
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
        width: 16,
        height: 16,
        marginRight: 6,
    },
    actionText: {
        fontSize: 12,
        color: Colors.BLACK,
    },
});