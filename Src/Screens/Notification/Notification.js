import React, {useEffect, useState, useCallback} from 'react';
import {
  Text,
  View,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';

import HeaderComp from '../../Components/HeaderComp';
import imagePaths from '../../Constants/imagePaths';
import CustomHelper from '../../Constants/CustomHelper';
import NotificationService from '../../Services/apis/NotificationService';
import navigationStrings from '../../Constants/navigationStrings';
import Colors from '../../Constants/Colors';
import HtmlRendererComp from '../../Components/HtmlRendererComp';

export const Notification = props => {
  const {route, navigation} = props;
  const {params} = route;

  const [isLoading, setIsLoading] = useState(true);
  const [notificationList, setNotificationList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const getNotification = useCallback(async (page = 1, append = false) => {
    try {
      if (append) setIsFetchingMore(true);
      else setIsLoading(true);

      const data = await NotificationService.get_notifications({
        page,
        id: 0,
      });

      if (data?.status === true) {
        const newNotifications = data.data.notification || [];

        setHasMore(newNotifications.length > 0);

        setNotificationList(prev =>
          append ? [...prev, ...newNotifications] : newNotifications,
        );
      }

    } catch (error) {
      CustomHelper.showMessage(error.message);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setCurrentPage(1);
      getNotification(1, false);
    });
    return unsubscribe;
  }, [navigation, params, getNotification]);

  const handleLoadMore = () => {
    if (!isFetchingMore && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      getNotification(nextPage, true);
    }
  };
  
  function fixImageUrl(message) {
    try {
      let letter = message.charAt(0);
      letter = letter.toUpperCase();
      return imagePaths.LETTERS[letter] || imagePaths.LOGO;
    } catch (e) {
      return imagePaths.DEFAULT_16_9;
    }
  }

  const notificationClick = async function (item) {
    if (item.type === '6') {
      navigation.navigate(navigationStrings.FEED_DETAIL, {
        feed_id: item.target_id,
      });
    } else {
      let json = JSON.parse(item.json);
      switch (json.file_type) {
        case '1':
          json.title = 'PDF List';
          navigation.navigate(navigationStrings.PDF3, json);
          break;
        case '3':
          json.title = 'Video List';
          navigation.navigate(navigationStrings.RECORDED_VIDEO3, json);
          break;
        case '8':
          json.title = 'Test Series List';
          navigation.navigate(navigationStrings.TEST_SERIES3, json);
          break;
      }
      console.log(json);
    }
  };

  const renderLoader = () =>
    isFetchingMore ? (
      <View style={{paddingVertical: 20}}>
        <ActivityIndicator size="small" color={Colors.THEME} />
      </View>
    ) : null;

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#F9F9F9',
        }}>
        <ActivityIndicator size="large" color={Colors.THEME} />
      </View>
    );
  }

  return (
    <View style={{flex: 1, backgroundColor: '#F9F9F9'}}>
      <HeaderComp headerTitle={'Notifications'} />
      <FlatList
        data={notificationList}
        renderItem={({item}) => (
          <TouchableOpacity
            onPress={() => notificationClick(item)}
            style={{
              flexDirection: 'row',
              backgroundColor: '#FFFFFF',
              marginHorizontal: 12,
              marginTop: 8,
              borderRadius: 12,
              padding: 10,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOpacity: 0.08,
              shadowRadius: 4,
              shadowOffset: {width: 0, height: 2},
              elevation: 2,
            }}>
            <View
              style={{
                height: 55,
                width: 55,
                borderRadius: 12,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#F2F7FB',
              }}>
              <Image
                source={fixImageUrl(item.message)}
                resizeMode="contain"
                style={{height: 35, width: 35}}
              />
            </View>
            <View
              style={{
                flex: 1,
                marginLeft: 12,
                justifyContent: 'center',
                maxWidth: '82%',
              }}>
              <HtmlRendererComp html={item.message} />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 6,
                }}>
                <Text style={{color: Colors.IDLE, fontSize: 12}}>
                  {CustomHelper.tsToDate(item.created, 'd-m-Y h:i A')}
                </Text>
                {item.is_read === '0' && (
                  <View
                    style={{
                      height: 8,
                      width: 8,
                      borderRadius: 4,
                      backgroundColor: Colors.THEME || '#0274BA',
                      marginRight: 4,
                    }}
                  />
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id.toString()}
        ListFooterComponent={renderLoader}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingVertical: 10}}
      />
    </View>
  );
};
