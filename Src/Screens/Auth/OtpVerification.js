import React, {useEffect, useState} from 'react';

import {
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import RNRestart from 'react-native-restart';
// import Parse from 'parse/react-native';

import Auth from '../../Services/apis/AuthService';
import Styles from '../../Assets/Style/LoginStyle';
import imagePaths from '../../Constants/imagePaths';
import navigationStrings from '../../Constants/navigationStrings';
import HeaderComp from '../../Components/HeaderComp';
import Colors from '../../Constants/Colors';

export const OtpVerification = props => {
  const {route, navigation} = props;
  const {params} = route;

  const [otp, setOTP] = useState('');
  const [username, setUsername] = useState(params.email);
  const [password, setNewPassword] = useState('');

  const doSendOTP = async function () {
    // Note that this values come from state variables that we've declared before
    let payload = params;
    payload.otp = otp;
    if (payload.otp === '' || payload.otp.length != 4) {
      Alert.alert('Error!', 'Please enter valid OTP.');
      return false;
    }
    if (payload.name) {
      return await Auth.registration(payload)
        .then(async data => {
          if (data.status === false) {
            Alert.alert('Warning!', data.message);
            return false;
          } else {
            Alert.alert('Success!', data.message);
            if (data.status === true) {
              RNRestart.Restart();
            }
            return true;
          }
        })
        .catch(error => {
          Alert.alert('Error!', error.message);
          return false;
        });
    } else {
      payload.password = password;
      return await Auth.forgot_password(payload)
        .then(async data => {
          if (data.status === false) {
            Alert.alert('Warning!', data.message);
            return false;
          } else {
            Alert.alert('Success!', data.message);
            if (data.status === true) {
              RNRestart.Restart();
            }
            return true;
          }
        })
        .catch(error => {
          Alert.alert('Error!', error.message);
          return false;
        });
    }
  };

  useEffect(
    function () {
      console.log('Effect-2: ' + JSON.stringify(params));
    },
    [navigation, params],
  );

  return (
    <View style={[Styles.container]}>
      <HeaderComp headerTitle="OTP Verification" />
      <View style={{marginTop: 80}}>
        <View style={[Styles.title_master, {marginTop: 0, marginBottom: 0}]}>
          <Text style={Styles.title}>OTP Verification</Text>
          <Text style={{color: Colors.IDLE, marginTop: 5}}>
            We’ve send you the verification code on {username}
          </Text>
        </View>
        <View style={Styles.form}>
          <View style={Styles.inputSection}>
            <Image source={imagePaths.EMAIL} />
            <TextInput
              style={Styles.form_input}
              value={otp}
              placeholder={'Enter OTP'}
              onChangeText={text => setOTP(text)}
              autoCapitalize={'none'}
            />
          </View>
          {params?.password === true && (
            <View style={Styles.inputSection}>
              <Image source={imagePaths.PASSWORD} />
              <TextInput
                style={Styles.form_input}
                value={password}
                placeholder={'Enter New Password'}
                onChangeText={text => setNewPassword(text)}
                editable={true}
                autoCapitalize={'none'}
              />
            </View>
          )}
          <TouchableOpacity onPress={() => doSendOTP()}>
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
  );
};
