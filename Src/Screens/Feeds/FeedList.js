import React, { useEffect, useState } from 'react';
import { Text, View, ActivityIndicator, Image, FlatList } from 'react-native';

import imagePaths from '../../Constants/imagePaths';
import CustomHelper from '../../Constants/CustomHelper';
import FeedService from '../../Services/apis/FeedService';


export const FeedList = (props) => {
  const { navigation } = props;

  const [isLoading, setIsLoading] = useState(true);
  const [feedList, setFeedList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const getFeeds = async function () {
    return await FeedService.get_feed_list({ page: currentPage, id: 0 })
      .then(async (data) => {

        setIsLoading(false);
        if (data.status === true) {
          data = data.data;
          setFeedList(data);
        }
        return true;
      })
      .catch((error) => {
        Alert.alert('Error!', error.message);
        return false;
      });
  };

  const loadItems = function () {
    setCurrentPage(currentPage + 1);
    getFeeds();
  }

  const loadItemsPrev = function () {
    setCurrentPage(currentPage - 1);
    getFeeds();
  }

  function fixImageUrl(url, name) {
    try {
      let letter = name.charAt(0);
      letter = letter.toUpperCase();
      return url === "" ? imagePaths.LETTERS[letter] : { uri: url };
    } catch (e) {
      return imagePaths.DEFAULT_16_9;
    }
  }

  useEffect(function () {
    const unsubscribe = navigation.addListener('focus', () => {
      async function fetchData() {
        // You can await here       
        const response = await getFeeds();
        console.log(response);
      }
      fetchData();
    });
    return unsubscribe;
  }, [navigation]);

  const renderLoader = () => {
    return (
      <View>
        <ActivityIndicator size="large" color="red" />
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F9F9F9" }}>
      <FlatList
        data={feedList}
        renderItem={(item) => {
          item = item.item;
          return (
            <View style={{ flex: 1, marginHorizontal: 10, backgroundColor: "#FFFFFF", borderRadius: 10, marginTop: 6, borderColor: "#FFFFFF", borderWidth: 1 }}>
              <View style={{ flex: 1, flexDirection: "row" }}>
                <View style={{ justifyContent: "center", alignItems: "center" }}>
                  <Image source={fixImageUrl(item.profile_image, item.name)} resizeMode='stretch' style={{ height: 50, width: 50 }} />
                </View>
                <View style={{ marginHorizontal: 10 }}>
                  <Text style={{ fontSize: 14, color: "#05030D", marginVertical: 5 }}>{item.name}</Text>
                  <Text style={{ color: "black" }}>{CustomHelper.tsToDate(item.created, "d-m-Y h:i A")}</Text>
                </View>
              </View>
              <View>
                <View>
                  <Text>{item.text}</Text>
                </View>
                {
                  item.meta_url !== "" && <View>
                    <Image source={item.meta_url} resizeMode='stretch' />
                  </View>
                }
              </View>
              <View>
                <Text>{"sdf"}</Text>
              </View>
            </View>
          )
        }}
        keyExtractor={item => item.id}
        ListFooterComponent={renderLoader}
        onEndReached={loadItems}
        onScrollToTop={loadItemsPrev}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
};