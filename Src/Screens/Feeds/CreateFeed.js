import React, {useEffect, useState, useRef, useMemo, useCallback} from 'react';
import {
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {Dropdown} from 'react-native-element-dropdown';
import Compressor from 'react-native-compressor';
import {
  ifIphoneX,
  getStatusBarHeight,
  getBottomSpace,
} from 'react-native-iphone-x-helper';

import imagePaths from '../../Constants/imagePaths';
import Colors from '../../Constants/Colors';
import navigationStrings from '../../Constants/navigationStrings';
import HeaderComp from '../../Components/HeaderComp';
import HomeService from '../../Services/apis/HomeService';
import {S3Upload} from '../../Services/S3Upload';
import FeedService from '../../Services/apis/FeedService';

export const CreateFeed = props => {
  const {navigation} = props;

  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [courseList, setCourseList] = useState([]);
  const [courseId, setCourseId] = useState(0);
  const [imageUri1, setImageUri1] = useState(null);
  const [imageUri2, setImageUri2] = useState(null);

  const chooseImage = whichUri => {
    launchImageLibrary({mediaType: 'photo'}, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
        whichUri === '1' ? setImageUri1(null) : '';
        whichUri === '2' ? setImageUri2(null) : '';
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        const source = {uri: response.assets[0].uri};
        whichUri === '1' ? setImageUri1(source) : '';
        whichUri === '2' ? setImageUri2(source) : '';
      }
    });
  };

  const compressImage = async uri => {
    try {
      const compressedImage = await Compressor.Image.compress(uri.uri, {
        compressionMethod: 'auto', // Use auto method (based on file type)
        //compressFormat: 'JPEG', // Output format (could be PNG or JPEG)
        quality: 0.7, // Compression quality (0 to 1, where 1 is original quality)
        //maxWidth: 800, // Max width after compression
        //maxHeight: 600, // Max height after compression
        keepExif: true, // Keep EXIF metadata (important for orientation)
      });

      console.log('Compressed image:', compressedImage);
      return {uri: compressedImage}; // Upload the compressed image
    } catch (error) {
      console.error('Image compression failed: ', error);
      return uri;
    }
  };

  const submitPost = async () => {
    if (query.length < 10) {
      Alert.alert('Error', 'Please type atleast 10 character in query input.');
      return;
    }
    if (courseId === 0) {
      Alert.alert('Error', 'Please select course first.');
      return;
    }
    setIsLoading(true);
    let payload = {
      text: query,
      course_id: courseId,
      post_type: 1,
    };
    if (imageUri1 !== null) {
      let imageUri1x = await compressImage(imageUri1);
      let respose = await S3Upload(imageUri1x, 'ios', 'feed_1');
      if (respose.Location) {
        payload.meta_url = respose.Location;
      }
    }
    if (imageUri2 !== null) {
      let imageUri2x = await compressImage(imageUri2);
      let respose = await S3Upload(imageUri2x, 'ios', 'feed_2');
      if (respose.Location) {
        payload.meta_url_1 = respose.Location;
      }
    }

    FeedService.post_feed(payload)
      .then(async data => {
        setIsLoading(false);
        if (data.status === true) {
          setImageUri1(null);
          setImageUri2(null);
          setQuery('');
          setCourseId(0);
          Alert.alert('Server Says', data.message);
        } else {
          Alert.alert('Server Says', data.message);
        }
        return true;
      })
      .catch(error => {
        Alert.alert('Error!', error.message);
        return false;
      });
  };

  const getMyOrder = async function () {
    return await HomeService.get_my_courses({})
      .then(async data => {
        setIsLoading(false);
        //console.log(data);
        if (data.status === true) {
          data = data.data;
          let dropdownData = [];
          data.forEach(element => {
            if (element.is_doubt_avail === '1') {
              dropdownData.push({label: element.title, value: element.id});
            }
          });
          setCourseList(dropdownData);
        }
        return true;
      })
      .catch(error => {
        Alert.alert('Error!', error.message);
        return false;
      });
  };

  async function fetchData() {
    // You can await here
    const response = await getMyOrder();
    console.log(response);
  }

  const goBack = function () {
    navigation.goBack(null);
  };

  useEffect(
    function () {
      fetchData();
    },
    [navigation],
  );

  return (
    <View style={{flex: 1}}>
      <SafeAreaView style={styles.headerView}>
        <StatusBar backgroundColor={Colors.THEME} barStyle="light-content" />
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginRight: '4%',
          }}>
          <TouchableOpacity onPress={() => goBack()}>
            <Image source={imagePaths.BACK} style={styles.image} />
          </TouchableOpacity>
          <Text style={{color: Colors.WHITE, fontSize: 18, marginLeft: 12}}>
            {'Create New Post'}
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: Colors.WHITE,
              height: 25,
              paddingHorizontal: 10,
              justifyContent: 'center',
              borderRadius: 4,
            }}
            onPress={() => submitPost()}>
            <Text
              style={{color: Colors.THEME, fontSize: 18, fontWeight: '500'}}>
              {'Post'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <View style={{margin: 10, flex: 0.93}}>
        <Dropdown
          style={{
            marginTop: 3,
            borderWidth: 1,
            borderColor: Colors.IDLE,
            paddingHorizontal: 5,
            marginVertical: 3,
            borderRadius: 5,
          }}
          placeholderStyle={{fontSize: 16, color: Colors.BLACK}}
          selectedTextStyle={{fontSize: 16, color: Colors.BLACK}}
          itemTextStyle={{ fontSize: 16, color: Colors.BLACK }}
          inputSearchStyle={{height: 40, fontSize: 16, color: Colors.BLACK}}
          iconStyle={{width: 20, height: 30, marginTop: 10, marginRight: 10}}
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
        <View style={{marginTop: 10}}>
          <Text style={{color: Colors.TAG_COLOR}}>
            {'Write your doubt/query, Community Members will help you soon.'}
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: Colors.IDLE,
              borderRadius: 5,
              marginVertical: 10,
              padding: 10,
              height: 120,
            }}
            value={query}
            placeholder={'Enter your query'}
            onChangeText={text => setQuery(text)}
            autoCapitalize={'none'}
            multiline={true}
            textAlignVertical="top"
            placeholderTextColor={Colors.IDLE}
          />
        </View>
        <View>
          {imageUri1 && (
            <View>
              <TouchableOpacity
                onPress={() => {
                  setImageUri1(null);
                }}
                style={{position: 'absolute', zIndex: 1}}>
                <Text
                  style={{
                    color: Colors.WHITE,
                    backgroundColor: 'red',
                    paddingHorizontal: 5,
                    fontSize: 20,
                  }}>
                  {'x'}
                </Text>
              </TouchableOpacity>
              <Image source={imageUri1} style={{width: 100, height: 100}} />
            </View>
          )}
          {imageUri1 === null && (
            <TouchableOpacity
              onPress={() => {
                chooseImage('1');
              }}
              style={{
                backgroundColor: Colors.IDLE,
                padding: 30,
                borderRadius: 5,
                marginVertical: 10,
              }}>
              <Text
                style={{
                  color: Colors.WHITE,
                  alignSelf: 'center',
                  fontSize: 18,
                }}>
                {'Choose Image'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={{marginVertical: 10}}>
          {imageUri2 && (
            <View>
              <TouchableOpacity
                onPress={() => {
                  setImageUri2(null);
                }}
                style={{position: 'absolute', zIndex: 1}}>
                <Text
                  style={{
                    color: Colors.WHITE,
                    backgroundColor: 'red',
                    paddingHorizontal: 5,
                    fontSize: 20,
                  }}>
                  {'x'}
                </Text>
              </TouchableOpacity>
              <Image source={imageUri2} style={{width: 100, height: 100}} />
            </View>
          )}
          {imageUri2 === null && (
            <TouchableOpacity
              onPress={() => {
                chooseImage('2');
              }}
              style={{
                backgroundColor: Colors.IDLE,
                padding: 30,
                borderRadius: 5,
                marginVertical: 10,
              }}>
              <Text
                style={{
                  color: Colors.WHITE,
                  alignSelf: 'center',
                  fontSize: 18,
                }}>
                {'Choose Image'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={{flex: 0.07}}>
        <TouchableOpacity
          onPress={() => submitPost()}
          style={{backgroundColor: Colors.THEME, padding: 10, height: '100%'}}>
          <Text
            style={{
              alignSelf: 'center',
              color: Colors.WHITE,
              fontSize: 18,
              fontWeight: '500',
            }}>
            {'Submit Post'}
          </Text>
        </TouchableOpacity>
      </View>
      {isLoading && (
        <View
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            height: '100%',
            width: '100%',
          }}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  headerView: {
    paddingTop: Platform.select({
      ios: 0,
      android: 20,
    }),
    height: Platform.select({
      ios: 80,
      android: 40,
    }) + getStatusBarHeight(),
    width: '100%',
    justifyContent: 'center',
    backgroundColor: Colors.THEME,
  },
  image: {
    height: 20,
    width: 20,
    marginLeft: 20,
    tintColor: Colors.WHITE,
  },
});
