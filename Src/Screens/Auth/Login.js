import React, {useEffect, useState} from 'react';
import {
  Alert,
  SafeAreaView,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
} from 'react-native';
import {
  scale,
  verticalScale,
  moderateScale,
  moderateVerticalScale,
} from 'react-native-size-matters';
import RNRestart from 'react-native-restart';
import DeviceInfo from 'react-native-device-info';

import Auth from '../../Services/apis/AuthService';
import Styles from '../../Assets/Style/LoginStyle';
import navigationStrings from '../../Constants/navigationStrings';
import imagePaths from '../../Constants/imagePaths';
import Colors from '../../Constants/Colors';

export const Login = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isVisible, setisVisible] = useState(true);
  const [keyBoardHeight, setKeyBoardHeight] = useState(0);

  const doUserLogIn = async function () {
    // Note that this values come from state variables that we've declared before
    const usernameValue = username;
    const passwordValue = password;

    return await Auth.login({email: usernameValue, password: passwordValue})
      .then(async data => {
        Alert.alert('Alert!', data.message);
        if (data.status === true) {
          //navigation.navigate(navigationStrings.HOME);
          RNRestart.Restart();
        }
        return true;
      })
      .catch(error => {
        Alert.alert('Error!', error.message);
        return false;
      });
  };

  const showHidePassword = function () {
    isVisible ? setisVisible(false) : setisVisible(true);
  };

  useEffect(() => {
    const keyboardOnShow = Keyboard.addListener('keyboardDidShow', event => {
      setKeyBoardHeight(event.endCoordinates.height);
    });

    const keyboardOnHide = Keyboard.addListener('keyboardDidHide', event => {
      setKeyBoardHeight(0);
    });

    return () => {
      keyboardOnShow.remove();
      keyboardOnHide.remove();
    };
  }, []);

  return (
    <SafeAreaView style={Styles.container}>
      <View
        style={[
          Styles.containerChild,
          {paddingTop: moderateVerticalScale(120 - keyBoardHeight)},
        ]}>
        <View>
          <View style={Styles.logo_bg_parent}>
            <Image
              source={imagePaths.LOGIN_WITH_TITLE}
              style={Styles.logo_bg}
            />
          </View>
          <View style={Styles.title_master}>
            <Text style={Styles.title}>Sign In</Text>
          </View>
          <View style={Styles.form}>
            <View style={Styles.inputSection}>
              <Image source={imagePaths.EMAIL} />
              <TextInput
                style={Styles.form_input}
                value={username}
                placeholder={'Username'}
                onChangeText={text => setUsername(text)}
                autoCapitalize={'none'}
                keyboardType={'email-address'}
                placeholderTextColor={Colors.IDLE}
              />
            </View>
            <View style={Styles.inputSection}>
              <Image source={imagePaths.PASSWORD} />

              <TextInput
                style={Styles.form_input}
                value={password}
                placeholder={'Password'}
                secureTextEntry={isVisible}
                onChangeText={text => setPassword(text)}
                placeholderTextColor={Colors.IDLE}
              />
              <TouchableOpacity
                style={Styles.imageRightStyle}
                onPress={() => showHidePassword()}>
                <Image
                  source={
                    !isVisible ? imagePaths.SHOW_EYE : imagePaths.HIDE_EYE
                  }
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate(navigationStrings.FORGOT_PASSWORD)
              }>
              <Text style={Styles.forgot_password}>{'Forgot Password? '}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => doUserLogIn()}>
              <View style={Styles.button}>
                <Text style={Styles.button_label}>{'Sign in'}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        {Platform.OS === 'android' && (
          <View style={Styles.bottomView}>
            <TouchableOpacity
              onPress={() => navigation.navigate(navigationStrings.REGISTER)}>
              <Text style={Styles.login_footer_text}>
                {"Don't have an account? "}
                <Text style={Styles.login_footer_link}>{'Sign up'}</Text>
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={{alignItems: 'center'}}>
          <Text style={{color: Colors.IDLE}}>
            {'Version ' + DeviceInfo.getVersion()}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};
