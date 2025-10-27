import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';

import Styles from '../../Assets/Style/LoginStyle';
import HeaderComp from '../../Components/HeaderComp';
import imagePaths from '../../Constants/imagePaths';

import Auth from '../../Services/apis/AuthService';
import navigationStrings from '../../Constants/navigationStrings';
import Colors from '../../Constants/Colors';
import CustomHelper from '../../Constants/CustomHelper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const ChangePassword = props => {
  const {navigation} = props;

  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  async function doSubmit() {
    let payload = {
      old_password: password,
      password: newPassword,
    };
    if (password === '') {
      CustomHelper.showMessage('Please enter old password');
      return false;
    }
    if (newPassword === '') {
      CustomHelper.showMessage('Please enter new password');
      return false;
    }
    let response = await Auth.update_password(payload);
    CustomHelper.showMessage(response.message);
    if (response.status === true) {
      navigation.navigate(navigationStrings.HOME);
    }
  }

  useEffect(function () {
    async function fetchData() {}
    fetchData();
  }, []);

  return (
    <View style={{flex: 1}}>
      <HeaderComp headerTitle={'Change Password'} />
      <View>
        <View style={Styles.form}>
          <View style={Styles.inputSection}>
            <Icon name="lock-outline" size={22} color={Colors.IDLE} style={{}} />
            <TextInput
              style={Styles.form_input}
              value={password}
              placeholder={'Enter Old Password'}
              onChangeText={text => setPassword(text)}
              editable={true}
              autoCapitalize={'none'}
              placeholderTextColor={Colors.IDLE}
            />
          </View>
          <View style={Styles.inputSection}>
            <Icon name="lock-outline" size={22} color={Colors.IDLE} style={{}} />
            <TextInput
              style={{...Styles.form_input, ...{maxWidth: '100%'}}}
              value={newPassword}
              placeholder={'Enter New Password'}
              onChangeText={text => setNewPassword(text)}
              editable={true}
              autoCapitalize={'none'}
              placeholderTextColor={Colors.IDLE}
            />
          </View>
          <TouchableOpacity onPress={() => doSubmit()}>
            <View style={Styles.button}>
              <Text style={Styles.button_label}>{'Submit'}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
