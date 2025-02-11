//import liraries
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ImageBackground,
  Alert,
} from 'react-native';

import PortalService from '../../../Services/apis/PortalService';
import imagePaths from '../../../Constants/imagePaths';
import CommonStyles from '../../../Assets/Style/CommonStyle';
import navigationStrings from '../../../Constants/navigationStrings';
import Colors from '../../../Constants/Colors';

// create a component
export const LiveClasses1 = props => {
  const {navigation} = props;
  const [isLoading, setIsLoading] = useState(true);
  const [liveClasses, setLiveClasses] = useState([]);

  const getLiveClasses = async function () {
    return await PortalService.get_live_classes({})
      .then(async data => {
        setIsLoading(false);
        if (data.status === true) {
          let data1 = data.data;
          let final_list = [];
          data1.forEach(element => {
            if (data.time <= element.end_date) {
              element.thumbnail =
                element.thumbnail === ''
                  ? 'https://elites-grid-prod.s3.ap-south-1.amazonaws.com/global_thumbnails/2339195logo.png'
                  : element.thumbnail;
              final_list.push(element);
            }
          });
          //console.log((final_list));
          setLiveClasses(final_list);
          setIsLoading(false);
        }
        return true;
      })
      .catch(error => {
        Alert.alert('Error!', error.message);
        return false;
      });
  };

  const navToPlayer = function (item) {
    navigation.navigate(navigationStrings.PLAYER, item);
  };

  useEffect(function () {
    async function fetchData() {
      // You can await here
      const response = await getLiveClasses();
      console.log(response);
    }
    fetchData();
  }, []);

  return (
    <>
      {isLoading ? (
        <LoadingComp />
      ) : (
        <View style={styles.container}>
          {liveClasses.length > 0 && (
            <FlatList
              data={liveClasses}
              numColumns={1}
              renderItem={({item, index}) => (
                <TouchableOpacity
                  onPress={() =>
                    navToPlayer({title: item.title, url: item.url})
                  }
                  key={index}
                  style={{
                    borderColor: '#EEEEEE',
                    backgroundColor: 'white',
                    borderWidth: 1,
                    borderRadius: 10,
                    marginVertical: 2.5,
                    marginHorizontal: 2.5,
                    width: '100%',
                  }}>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      height: 80,
                      paddingHorizontal: 20,
                      paddingVertical: 10,
                    }}>
                    {/* <Image source={{ uri: item.thumbnail }} resizeMode='stretch' style={{ height: 48, width: 70, marginHorizontal: 5 }} /> */}
                    <View>
                      <ImageBackground
                        source={{uri: item.thumbnail}}
                        resizeMode="stretch"
                        style={{
                          ...CommonStyles.videoListCardSize,
                          ...{height: 60, width: 60, marginHorizontal: 5},
                        }}
                        blurRadius={2}>
                        <View style={CommonStyles.overlay}>
                          <Image
                            source={imagePaths.PLAY}
                            style={{
                              ...CommonStyles.playIcon,
                              ...{height: 25, width: 25},
                            }}
                          />
                        </View>
                      </ImageBackground>
                    </View>
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'column',
                        justifyContent: 'center',
                        marginLeft: 10,
                      }}>
                      <Text>{item.title}</Text>
                      <Text style={{color: Colors.IDLE}}>
                        {item.description}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={item => item.id}
              contentContainerStyle={{marginHorizontal: 5, marginTop: 10}}
            />
          )}
          {liveClasses.length === 0 && (
            <View
              style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
              <Text style={{fontSize: 20, color: Colors.BLACK}}>
                {'No Live Class Found'}
              </Text>
            </View>
          )}
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
});
