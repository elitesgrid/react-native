//import liraries
import React, {Component} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Image} from 'react-native-elements';
import imagePaths from '../Constants/imagePaths';
import {useNavigation} from '@react-navigation/native';
import Colors from '../Constants/Colors';

// create a component
const NoDataFound = ({
  onPressBack,
  headerStyles = {},
  imageUrl = '',
  pageTitle = '',
  pageDesc = '',
  ...props
}) => {
  const navigation = useNavigation();
  const goBack = function () {
    navigation.goBack(null);
  };
  return (
    <View style={{flex: 1, marginTop: '30%', alignItems: 'center'}}>
      {imageUrl && (
        <View>
          <Image source={imageUrl}></Image>
        </View>
      )}
      {pageTitle && (
        <View>
          <Text style={{fontSize: 20}}>{pageTitle}</Text>
        </View>
      )}
      {pageDesc && (
        <View>
          <Text>{pageDesc}</Text>
        </View>
      )}
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  image: {
    height: 20,
    width: 20,
    marginLeft: 20,
    tintColor: Colors.WHITE,
  },
});

//make this component available to the app
export default NoDataFound;
