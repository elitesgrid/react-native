import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import {
  moderateVerticalScale,
} from 'react-native-size-matters';
import RNRestart from 'react-native-restart';

import Auth from '../../Services/apis/AuthService';
import Styles from '../../Assets/Style/LoginStyle';
import navigationStrings from '../../Constants/navigationStrings';
import imagePaths from '../../Constants/imagePaths';
import Colors from '../../Constants/Colors';
import envVariables from '../../Constants/envVariables';
import CustomHelper from '../../Constants/CustomHelper';

export const Login = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isVisible, setisVisible] = useState(true);
  const [keyBoardHeight, setKeyBoardHeight] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const doUserLogIn = async function () {
    // Note that this values come from state variables that we've declared before
    const usernameValue = username;
    const passwordValue = password;
    setIsLoading(true);
    return await Auth.login({email: usernameValue, password: passwordValue})
      .then(async data => {
        setIsLoading(false);
        CustomHelper.showMessage(data.message);
        if (data.status === true) {
          //navigation.navigate(navigationStrings.HOME);
          RNRestart.Restart();
        }
        return true;
      })
      .catch(error => {
        setIsLoading(false);
        CustomHelper.showMessage(error.message);
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <ScrollView
          contentContainerStyle={{flexGrow: 1}}
          keyboardShouldPersistTaps="handled">
          <View
            style={[
              Styles.containerChild,
              {paddingTop: moderateVerticalScale(120)},
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
                {/* Email input */}
                <View style={Styles.inputSection}>
                  <Image 
                    source={imagePaths.EMAIL}
                    style={{ width: 24, height: 24, resizeMode: 'contain' }}
                     />
                  <TextInput
                    style={Styles.form_input}
                    value={username}
                    placeholder={'Your email id'}
                    onChangeText={text => setUsername(text)}
                    autoCapitalize={'none'}
                    keyboardType={'email-address'}
                    placeholderTextColor={Colors.IDLE}
                  />
                </View>

                {/* Password input */}
                <View style={Styles.inputSection}>
                  <Image 
                    source={imagePaths.PASSWORD}
                    style={{ width: 24, height: 24, resizeMode: 'contain' }}
                     />
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
                    onPress={showHidePassword}>
                    <Image
                      style={{ width: 24, height: 24, resizeMode: 'contain' }}
                      source={
                        !isVisible ? imagePaths.SHOW_EYE : imagePaths.HIDE_EYE
                      }
                    />
                  </TouchableOpacity>
                </View>

                {/* Forgot Password */}
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate(navigationStrings.FORGOT_PASSWORD)
                  }>
                  <Text style={Styles.forgot_password}>Forgot Password?</Text>
                </TouchableOpacity>

                {/* Sign In */}
                <TouchableOpacity 
                  onPress={doUserLogIn}
                  disabled={isLoading}
                  style={Styles.button}
                >
                  <Text style={Styles.button_label}>{isLoading? "Please wait...": "Sign in"}</Text>
                  {
                    isLoading && <ActivityIndicator style={{marginLeft: 20}} color="#fff" size="small" />
                  }
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer */}
            {Platform.OS === 'android' && (
              <View style={Styles.bottomView}>
                <TouchableOpacity
                  onPress={() => navigation.navigate(navigationStrings.REGISTER)}>
                  <Text style={Styles.login_footer_text}>
                    {"Don't have an account? "}
                    <Text style={Styles.login_footer_link}>Sign up</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={{alignItems: 'center'}}>
              <Text style={{color: Colors.IDLE}}>
                {'Version ' + envVariables.VERSION}
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
