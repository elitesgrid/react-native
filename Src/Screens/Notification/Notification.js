import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';

import HeaderComp from '../../Components/HeaderComp';
import Styles from '../../Assets/Style/LoginStyle';
import imagePaths from '../../Constants/imagePaths';
import CustomHelper from '../../Constants/CustomHelper';
import NotificationService from '../../Services/apis/NotificationService';
import navigationStrings from '../../Constants/navigationStrings';
import Colors from '../../Constants/Colors';

export const Notification = props => {
  const {route, navigation} = props;
  const {params} = route;

  const [isLoading, setIsLoading] = useState(true);
  const [notificationList, setNotificationList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const getNotification = async function () {
    return await NotificationService.get_notifications({
      page: currentPage,
      id: 0,
    })
      .then(async data => {
        setIsLoading(false);
        if (data.status === true) {
          data = data.data;
          //console.log(data.notification.length);
          setNotificationList(data.notification);
        }
        return true;
      })
      .catch(error => {
        Alert.alert('Error!', error.message);
        return false;
      });
  };

  const loadItems = function () {
    setCurrentPage(currentPage + 1);
    getNotification();
  };

  const loadItemsPrev = function () {
    console.log('currentPage', currentPage);
    setCurrentPage(currentPage - 1);
    console.log('currentPage', currentPage);
    getNotification();
  };

  function fixImageUrl(message) {
    try {
      let letter = message.charAt(0);
      letter = letter.toUpperCase();
      return imagePaths.LETTERS[letter];
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

  useEffect(
    function () {
      const unsubscribe = navigation.addListener('focus', () => {
        async function fetchData() {
          // You can await here
          const response = await getNotification();
          //console.log(response);
        }
        fetchData();
      });
      return unsubscribe;
    },
    [navigation, params],
  );

  const renderLoader = () => {
    return (
      <View>
        <ActivityIndicator size="large" color={Colors.THEME} />
      </View>
    );
  };

  return (
    <View style={{flex: 1, backgroundColor: '#F9F9F9'}}>
      <HeaderComp headerTitle={'Notifications'} />
      <View>
        <FlatList
          data={notificationList}
          renderItem={item => {
            item = item.item;
            return (
              <TouchableOpacity
                onPress={() => notificationClick(item)}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  marginHorizontal: 10,
                  height: 80,
                  backgroundColor: '#FFFFFF',
                  borderRadius: 10,
                  marginTop: 6,
                  borderColor: '#FFFFFF',
                  borderWidth: 1,
                }}>
                <View style={{justifyContent: 'center', alignItems: 'center'}}>
                  <Image
                    source={fixImageUrl(item.message)}
                    resizeMode="stretch"
                    style={{height: 50, width: 50}}
                  />
                </View>
                <View
                  style={{
                    marginHorizontal: 15,
                    paddingTop: 6,
                    maxWidth: '82%',
                  }}>
                  <Text
                    style={{
                      fontSize: 14,
                      color: '#05030D',
                      marginVertical: 10,
                    }}>
                    {item.message}
                  </Text>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={{color: Colors.IDLE, fontSize: 12}}>
                      {CustomHelper.tsToDate(item.created, 'd-m-Y h:i A')}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          keyExtractor={item => item.id}
          ListFooterComponent={renderLoader}
          onEndReached={loadItems}
          onScrollToTop={loadItemsPrev}
          onEndReachedThreshold={0.8}
        />
      </View>
    </View>
  );
};
