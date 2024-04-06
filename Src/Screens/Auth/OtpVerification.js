import React, { useState } from 'react';

import { Alert, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { moderateVerticalScale } from 'react-native-size-matters';
import { useNavigation } from '@react-navigation/native';
// import Parse from 'parse/react-native';

import Auth from "../../Services/apis/AuthService";
import Styles from '../../Assets/Style/LoginStyle';
import imagePaths from '../../Constants/imagePaths';
import navigationStrings from '../../Constants/navigationStrings';


export const OtpVerification = () => {

  const [username, setUsername] = useState('');

  const doSendOTP = async function () {
    // Note that this values come from state variables that we've declared before
    const usernameValue = username;

    return await Auth.send_verification_otp({ email: usernameValue, password: passwordValue })
      .then(async (data) => {
        Alert.alert('Alert!', data.message);
        if (data.status === true) {
          navigation.navigate(navigationStrings.OTP_VERIFICATION);
        }
        return true;
      })
      .catch((error) => {
        Alert.alert('Error!', error.message);
        return false;
      });
  };

  return (
    <View style={[Styles.container, { paddingTop: moderateVerticalScale(50) }]}>
      <View>
        <TouchableOpacity style={{ marginLeft: 20,marginBottom:20 }} onPress={() => navigation.navigate(navigationStrings.LOGIN)}>
          <Image source={imagePaths.BACK} />
        </TouchableOpacity>
        <View style={[Styles.title_master, { marginTop: 0, marginBottom: 0 }]}>
          <Text style={Styles.title}>OTP Verification</Text>
          <Text>We’ve send you the verification code on +1 2620 0323 7631</Text>
        </View>
        <View style={Styles.form}>
          <View style={Styles.inputSection}>
            <Image
              source={imagePaths.MOBILE}
            />
            <TextInput
              style={Styles.form_input}
              value={username}
              placeholder={'Enter Mobile'}
              onChangeText={(text) => setUsername(text)}
              autoCapitalize={'none'}
            />
          </View>
          <TouchableOpacity onPress={() => doSendOTP()}>
            <View style={Styles.button}>
              <Text style={Styles.button_label}>{'Send'}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <View style={Styles.bottomView}>
        <TouchableOpacity onPress={() => navigation.navigate(navigationStrings.LOGIN)}>
          <Text style={Styles.login_footer_text}>
            {"Already have an account? "}
            <Text style={Styles.login_footer_link}>{'Log In'}</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};