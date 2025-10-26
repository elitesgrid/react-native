import React from 'react';
import {Alert, Text, TouchableOpacity, View} from 'react-native';
// import Parse from 'parse/react-native';
import {useNavigation} from '@react-navigation/native';
import {StackActions} from '@react-navigation/native';
import Styles from '../../Assets/Style/LoginStyle';
import StorageManager from '../../Services/StorageManager'
import navigationStrings from '../../Constants/navigationStrings';
import CustomHelper from '../../Constants/CustomHelper';

export const Logout = () => {
  const navigation = useNavigation();

  const doUserLogOut = async function () {
      await StorageManager.remove_session()
      CustomHelper.showMessage('Logged out successfully');
      navigation.navigate(navigationStrings.LOGIN);
      return true;
   };

  return (
    <View style={Styles.login_wrapper}>
      <View style={Styles.form}>
        <TouchableOpacity onPress={() => doUserLogOut()}>
          <View style={Styles.button}>
            <Text style={Styles.button_label}>{'Logout'}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};