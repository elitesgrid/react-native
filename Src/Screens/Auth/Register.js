import React, {useState} from 'react';
import {
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  SafeAreaView,
  View,
} from 'react-native';
import {
  scale,
} from 'react-native-size-matters';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import Auth from '../../Services/apis/AuthService';
import Styles from '../../Assets/Style/LoginStyle';
import navigationStrings from '../../Constants/navigationStrings';
import HeaderComp from '../../Components/HeaderComp';
import envVariables from '../../Constants/envVariables';
import Colors from '../../Constants/Colors';
import CustomHelper from '../../Constants/CustomHelper';

export const Register = () => {
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [isVisible, setisVisible] = useState(true);

  const navToWebView = obj => navigation.navigate(navigationStrings.C_WEBVIEW, obj);

  const doUserSignUp = async function () {
    let payload = {name, email, mobile, password};
    return await Auth.registration(payload)
      .then(response => {
        if (response.status === true) {
          navigation.navigate(navigationStrings.OTP_VERIFICATION, payload);
        } else {
          CustomHelper.showMessage(response.message);
        }
      })
      .catch(error => {
        CustomHelper.showMessage(error.message);
        return false;
      });
  };

  const showHidePassword = () => setisVisible(!isVisible);

  return (
    <SafeAreaView style={[Styles.container, {backgroundColor: Colors.WHITE}]}>
      <HeaderComp headerTitle="Sign Up" />

      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingTop: 10,
            paddingBottom: 30,
          }}
          keyboardShouldPersistTaps="handled">
          <View style={{flex: 1}}>
            {/* Title */}
            <View style={{alignItems: 'center', marginVertical: 15}}>
              <Text style={[Styles.title, {fontSize: 24, fontWeight: '700', color: Colors.THEME}]}>
                Create an account
              </Text>
              <Text style={{color: Colors.IDLE, fontSize: 14, marginTop: 6}}>
                Please fill in your details to continue
              </Text>
            </View>

            {/* Form */}
            <View style={{marginTop: 10}}>
              {/* Name */}
              <View style={inputBox}>
                <Icon name="account-outline" size={22} color={Colors.IDLE} style={iconStyle} />
                <TextInput
                  style={textInput}
                  value={name}
                  placeholder="Enter your name"
                  onChangeText={setName}
                  autoCapitalize="words"
                  placeholderTextColor={Colors.IDLE}
                />
              </View>

              {/* Email */}
              <View style={inputBox}>
                <Icon name="email-outline" size={22} color={Colors.IDLE} style={iconStyle} />
                <TextInput
                  style={textInput}
                  value={email}
                  placeholder="Enter email address"
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholderTextColor={Colors.IDLE}
                />
              </View>

              {/* Mobile */}
              <View style={inputBox}>
                <Icon name="phone-outline" size={22} color={Colors.IDLE} style={iconStyle} />
                <TextInput
                  style={textInput}
                  value={mobile}
                  placeholder="Enter mobile number"
                  onChangeText={setMobile}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  placeholderTextColor={Colors.IDLE}
                />
              </View>

              {/* Password */}
              <View style={inputBox}>
                <Icon name="lock-outline" size={22} color={Colors.IDLE} style={iconStyle} />
                <TextInput
                  style={[textInput, {flex: 1}]}
                  value={password}
                  placeholder="Password"
                  secureTextEntry={isVisible}
                  onChangeText={setPassword}
                  placeholderTextColor={Colors.IDLE}
                />
                <TouchableOpacity onPress={showHidePassword}>
                  <Icon
                    name={isVisible ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color={Colors.IDLE}
                  />
                </TouchableOpacity>
              </View>

              {/* Sign Up Button */}
              <TouchableOpacity
                onPress={doUserSignUp}
                activeOpacity={0.8}
                style={{
                  backgroundColor: Colors.THEME,
                  borderRadius: 12,
                  paddingVertical: 14,
                  marginTop: 25,
                  shadowColor: Colors.THEME,
                  shadowOffset: {width: 0, height: 4},
                  shadowOpacity: 0.3,
                  shadowRadius: 6,
                  elevation: 3,
                }}>
                <Text style={{color: Colors.WHITE, textAlign: 'center', fontSize: 16, fontWeight: '600'}}>
                  Sign Up
                </Text>
              </TouchableOpacity>

              {/* Terms */}
              <View style={{marginTop: 18, alignItems: 'center'}}>
                <Text style={{textAlign: 'center', color: Colors.DARK_TEXT, fontSize: 13}}>
                  By tapping <Text style={{fontWeight: '600'}}>‘Sign Up’</Text> you agree to the
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
                      marginTop: 5,
                      fontWeight: '600',
                    }}>
                    Terms & Conditions
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={{marginBottom: 15, alignItems: 'center'}}>
            <TouchableOpacity onPress={() => navigation.navigate(navigationStrings.LOGIN)}>
              <Text style={{color: Colors.DARK_TEXT, fontSize: 14}}>
                Already have an account?{' '}
                <Text style={{color: Colors.THEME, fontWeight: '700'}}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const inputBox = {
  flexDirection: 'row',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#E0E0E0',
  borderRadius: scale(50),
  backgroundColor: '#fff',
  paddingHorizontal: 12,
  paddingVertical: Platform.OS === 'ios' ? 12 : 0,
  marginVertical: 8,
  shadowColor: '#000',
  shadowOpacity: 0.05,
  shadowRadius: 4,
  elevation: 1,
};

const iconStyle = {
  marginRight: 8,
};

const textInput = {
  flex: 1,
  fontSize: 15,
  color: Colors.DARK_TEXT,
};
