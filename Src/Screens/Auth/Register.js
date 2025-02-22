import React, {useState} from 'react';
import {
  Alert,
  Image,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// import Parse from 'parse/react-native';
import {useNavigation} from '@react-navigation/native';

import Auth from '../../Services/apis/AuthService';
import Styles from '../../Assets/Style/LoginStyle';
import imagePaths from '../../Constants/imagePaths';
import navigationStrings from '../../Constants/navigationStrings';
import HeaderComp from '../../Components/HeaderComp';
import envVariables from '../../Constants/envVariables';
import Colors from '../../Constants/Colors';

export const Register = () => {
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [isVisible, setisVisible] = useState(true);

  const navToWebView = function (obj) {
    navigation.navigate(navigationStrings.C_WEBVIEW, obj);
  };

  const doUserSignUp = async function () {
    // Since the signUp method returns a Promise, we need to call it using await
    let payload = {
      name: name,
      email: email,
      mobile: mobile,
      password: password,
    };
    return await Auth.registration(payload)
      .then(response => {
        if (response.status == false) {
          Alert.alert('Warning!', response.message);
          return false;
        } else {
          navigation.navigate(navigationStrings.OTP_VERIFICATION, payload);
          return true;
        }
      })
      .catch(error => {
        console.log(error.message);
        // signUp can fail if any parameter is blank or failed an uniqueness check on the server
        Alert.alert('Error!', error.message);
        return false;
      });
  };

  const showHidePassword = function () {
    isVisible ? setisVisible(false) : setisVisible(true);
  };

  return (
    <View style={Styles.container}>
      <HeaderComp headerTitle="Sign Up" />
      <View style={Styles.containerChild}>
        <View>
          <View style={[Styles.title_master, {marginTop: 10, marginBottom: 0}]}>
            <Text style={Styles.title}>Create an account!</Text>
          </View>
          <View style={Styles.form}>
            <View style={Styles.inputSection}>
              <Image source={imagePaths.USER} />
              <TextInput
                style={Styles.form_input}
                value={name}
                placeholder={'Enter Your Name'}
                onChangeText={text => setName(text)}
                autoCapitalize={'none'}
                placeholderTextColor={Colors.IDLE}
              />
            </View>
            <View style={Styles.inputSection}>
              <Image source={imagePaths.EMAIL} />
              <TextInput
                style={Styles.form_input}
                value={email}
                placeholder={'Enter Email Address'}
                onChangeText={text => setEmail(text)}
                autoCapitalize={'none'}
                keyboardType={'email-address'}
                placeholderTextColor={Colors.IDLE}
              />
            </View>
            <View style={Styles.inputSection}>
              <Image source={imagePaths.MOBILE} />
              <TextInput
                style={Styles.form_input}
                value={mobile}
                placeholder={'Enter Mobile'}
                onChangeText={text => setMobile(text)}
                autoCapitalize={'none'}
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
            <TouchableOpacity onPress={() => doUserSignUp()}>
              <View style={Styles.button}>
                <Text style={Styles.button_label}>{'Sign Up'}</Text>
              </View>
            </TouchableOpacity>
            <View style={{marginTop: 5, marginHorizontal: 20}}>
              <Text style={{textAlign: 'center'}}>
                {"By tapping 'Sign Up' you agree to the "}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  navToWebView({
                    title: 'Terms & Conditions',
                    url: envVariables.PRIVACY_POLICY_URL,
                  })
                }>
                <Text
                  style={{
                    color: Colors.THEME,
                    textAlign: 'center',
                    textDecorationLine: 'underline',
                  }}>
                  {'terms & conditions'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={Styles.bottomView}>
          <TouchableOpacity
            onPress={() => navigation.navigate(navigationStrings.LOGIN)}>
            <Text style={Styles.login_footer_text}>
              {'Already have an account? '}
              <Text style={Styles.login_footer_link}>{'Sign In'}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
