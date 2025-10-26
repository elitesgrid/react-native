import React, {useState} from 'react';
import Auth from '../../Services/apis/AuthService';

import {
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {moderateVerticalScale} from 'react-native-size-matters';

// import Parse from 'parse/react-native';
import {useNavigation} from '@react-navigation/native';
import Styles from '../../Assets/Style/LoginStyle';
import imagePaths from '../../Constants/imagePaths';
import navigationStrings from '../../Constants/navigationStrings';
import HeaderComp from '../../Components/HeaderComp';
import Colors from '../../Constants/Colors';
import CustomHelper from '../../Constants/CustomHelper';

export const ForgotPassword = () => {
  const navigation = useNavigation();

  const [username, setUsername] = useState('');

  const doUserLogIn = async function () {
    // Note that this values come from state variables that we've declared before
    let payload = {email: username};
    return await Auth.forgot_password(payload)
      .then(async data => {
        CustomHelper.showMessage(data.message);
        if (data.status === true) {
          navigation.navigate(navigationStrings.OTP_VERIFICATION, {
            email: payload.email,
            password: true,
          });
        }
        return true;
      })
      .catch(error => {
        CustomHelper.showMessage(error.message);
        return false;
      });
  };

  return (
    <View style={Styles.container}>
      <HeaderComp headerTitle="Forgot Password" />
      <View
        style={[
          Styles.containerChild,
          {paddingTop: moderateVerticalScale(50)},
        ]}>
        <View>
          <View style={[Styles.title_master, {marginTop: 0, marginBottom: 0}]}>
            <Text style={Styles.title}>Forgot Password</Text>
            <Text
              style={{fontSize: 12, marginVertical: 15, color: Colors.IDLE}}>
              Please enter your mobile/email address or mobile number to receive
              verification code.
            </Text>
          </View>
          <View style={Styles.form}>
            <View style={Styles.inputSection}>
              <Image source={imagePaths.EMAIL} />
              <TextInput
                style={Styles.form_input}
                value={username}
                placeholder={'Enter Email/Mobile'}
                onChangeText={text => setUsername(text)}
                autoCapitalize={'none'}
                placeholderTextColor={Colors.IDLE}
              />
            </View>
            <TouchableOpacity onPress={() => doUserLogIn()}>
              <View style={Styles.button}>
                <Text style={Styles.button_label}>{'Send'}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <View style={Styles.bottomView}>
          <TouchableOpacity
            onPress={() => navigation.navigate(navigationStrings.LOGIN)}>
            <Text style={Styles.login_footer_text}>
              {'Already have an account? '}
              <Text style={Styles.login_footer_link}>{'Log In'}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
