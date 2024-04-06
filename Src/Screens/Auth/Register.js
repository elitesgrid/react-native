import React, { useState } from 'react';
import { Alert, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { moderateVerticalScale } from 'react-native-size-matters';


// import Parse from 'parse/react-native';
import { useNavigation } from '@react-navigation/native';
import Styles from '../../Assets/Style/LoginStyle';
import imagePaths from '../../Constants/imagePaths';
import navigationStrings from '../../Constants/navigationStrings';
import HeaderComp from '../../Components/HeaderComp';


export const Register = () => {
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [email, setemail] = useState('');
  const [mobile, setmobile] = useState('');
  const [password, setPassword] = useState('');
  const [isVisible, setisVisible] = useState(true);

  const doUserSignUp = async function () {
    // Note that this values come from state variables that we've declared before
    const nameValue = name;
    const emailValue = email;
    const mobileValue = mobile;
    const passwordValue = password;
    // Since the signUp method returns a Promise, we need to call it using await
    return await User.signUp(nameValue, emailValue, mobileValue, passwordValue)
      .then((createdUser) => {
        console.log(nameValue);
        // Parse.User.signUp returns the already created ParseUser object if successful
        Alert.alert(
          'Success!',
          `User ${createdUser.get('username')} was successfully created!`,
        );

        navigation.navigate(navigationStrings.HOME);
        return true;
      })
      .catch((error) => {
        console.log(error.message);
        // signUp can fail if any parameter is blank or failed an uniqueness check on the server
        Alert.alert('Error!', error.message);
        return false;
      });
  };

  const showHidePassword = function () {
    isVisible ? setisVisible(false) : setisVisible(true);
  }

  return (
    <View style={Styles.container}>
      <HeaderComp />
      <View style={Styles.containerChild}>
        <View>
          <View style={[Styles.title_master, { marginTop: 0, marginBottom: 0 }]}>
            <Text style={Styles.title}>Sign Up</Text>
          </View>
          <View style={Styles.form}>
            <View style={Styles.inputSection}>
              <Image
                source={imagePaths.USER}
              />
              <TextInput
                style={Styles.form_input}
                value={email}
                placeholder={'Enter Your Name'}
                onChangeText={(text) => setName(text)}
                autoCapitalize={'none'}
              />
            </View>
            <View style={Styles.inputSection}>
              <Image
                source={imagePaths.EMAIL}
              />
              <TextInput
                style={Styles.form_input}
                value={email}
                placeholder={'Enter Email Address'}
                onChangeText={(text) => setemail(text)}
                autoCapitalize={'none'}
                keyboardType={'email-address'}
              />
            </View>
            <View style={Styles.inputSection}>
              <Image
                source={imagePaths.MOBILE}
              />
              <TextInput
                style={Styles.form_input}
                value={mobile}
                placeholder={'Enter Mobile'}
                onChangeText={(text) => setmobile(text)}
                autoCapitalize={'none'}
              />
            </View>
            <View style={Styles.inputSection}>
              <Image
                source={imagePaths.PASSWORD}
              />

              <TextInput
                style={Styles.form_input}
                value={password}
                placeholder={'Password'}
                secureTextEntry={isVisible}
                onChangeText={(text) => setPassword(text)}
              />
              <TouchableOpacity
                style={Styles.imageRightStyle}
                onPress={() => showHidePassword()}>
                <Image
                  source={!isVisible ? imagePaths.SHOW_EYE : imagePaths.HIDE_EYE}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => doUserSignUp()}>
              <View style={Styles.button}>
                <Text style={Styles.button_label}>{'Sign Up'}</Text>
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
    </View>
  );
};