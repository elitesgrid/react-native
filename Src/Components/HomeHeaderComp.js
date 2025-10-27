//import liraries
import React, {Component} from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {Image} from 'react-native-elements';
import imagePaths from '../Constants/imagePaths';
import {useNavigation} from '@react-navigation/native';

import CommonStyles from '../Assets/Style/CommonStyle';
import Colors from '../Constants/Colors';
import navigationStrings from '../Constants/navigationStrings';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// create a component
const HomeHeaderComp = ({
  onPressBack,
  headerStyles = {},
  headingText = {},
  ...props
}) => {
  const navigation = useNavigation();
  const goBack = function () {
    navigation.goBack();
  };

  const navToNofication = function () {
    navigation.navigate(navigationStrings.NOTIFICATION, {});
  };

  return (
    <SafeAreaView style={{...CommonStyles.headerView, ...headerStyles}}>
      <StatusBar backgroundColor={Colors.THEME} barStyle="light-content" />
      <View style={CommonStyles.HeaderContainer}>
        <TouchableOpacity
          onPress={!!onPressBack ? onPressBack : () => goBack()}>
          <Image
            source={imagePaths.HAMBURGER}
            style={CommonStyles.hamburgerImage}
          />
        </TouchableOpacity>
        <Text style={CommonStyles.headerText}>{headingText}</Text>
        <Icon
          onPress={() => {
            navToNofication();
          }}
          name="bell" size={22} color={Colors.WHITE} style={{}} />
      </View>
    </SafeAreaView>
  );
};

//make this component available to the app
export default HomeHeaderComp;
