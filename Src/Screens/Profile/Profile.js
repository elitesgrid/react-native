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
import StorageManager from '../../Services/StorageManager';
import CustomHelper from '../../Constants/CustomHelper';
import Colors from '../../Constants/Colors';

export const Profile = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [activeSince, setActiveSince] = useState('');

  async function loadSession() {
    return await StorageManager.get_session();
  }

  function doSubmit() {
    let payment = {
      email: email,
      name: name,
      mobile: mobile,
    };
    CustomHelper.showMessage('Profile details update not allowed. Because Elites Grid Not allowed this. Please contact us in case of change.');
  }

  useEffect(function () {
    async function fetchData() {
      // You can await here
      const response = await loadSession();
      setName(response.name);
      setEmail(response.email);
      setMobile(response.mobile);
      setMobile(response.mobile);
      setActiveSince(CustomHelper.tsToDate(response.created, 'd M Y'));
    }
    fetchData();
  }, []);

  return (
    <View style={{flex: 1}}>
      <HeaderComp headerTitle={'My Profile'} />
      <View>
        <View style={Styles.form}>
          <View style={Styles.inputSection}>
            <Image source={imagePaths.USER} />
            <TextInput
              style={Styles.form_input}
              value={name}
              placeholder={'Enter Your Name'}
              onChangeText={text => setName(text)}
              editable={false}
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
              editable={false}
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
              editable={false}
              autoCapitalize={'none'}
              placeholderTextColor={Colors.IDLE}
            />
          </View>
          <View style={Styles.inputSection}>
            <Image source={imagePaths.PASSWORD} />

            <TextInput
              style={{...Styles.form_input, ...{maxWidth: '100%'}}}
              value={activeSince}
              placeholder={'Active Since'}
              onChangeText={text => setActiveSince(text)}
              editable={false}
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
