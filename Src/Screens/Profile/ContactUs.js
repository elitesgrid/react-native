import React from 'react';
import {Text, View, Image, TouchableOpacity, StyleSheet} from 'react-native';

import HeaderComp from '../../Components/HeaderComp';
import imagePaths from '../../Constants/imagePaths';
import navigationStrings from '../../Constants/navigationStrings';
import Colors from '../../Constants/Colors';

export const ContactUS = props => {
  const {navigation} = props;

  return (
    <View style={{flex: 1}}>
      <HeaderComp headerTitle={'Contact Us'} />
      <View>
        <View style={styles.form}>
          <View style={{marginVertical: 20}}>
            <Text style={{color: 'gray', fontSize: 16}}>
              {
                'Please choose what types of support do you need and let us know.'
              }
            </Text>
          </View>
          <View style={styles.inputSection}>
            <View style={{flex: 0.2, alignItems: 'center'}}>
              <Image
                style={{width: 50, height: 50}}
                resizeMode="stretch"
                source={imagePaths.CONTACT_US_EMAIL}
              />
            </View>
            <View style={{flex: 0.8}}>
              <View>
                <Text style={{fontWeight: '500', color: Colors.TEXT_COLOR}}>{'Email'}</Text>
              </View>
              <View>
                <Text style={{opacity: 0.5, color: Colors.TAG_COLOR}}>
                  {global.CONTACT_DETAILS.email || 'elitegrid2016@shifty.com'}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.inputSection}>
            <View style={{flex: 0.2, alignItems: 'center'}}>
              <Image
                style={{width: 50, height: 50}}
                resizeMode="stretch"
                source={imagePaths.CONTACT_US_CALL}
              />
            </View>
            <View style={{flex: 0.8}}>
              <View>
                <Text style={{fontWeight: '500', color: Colors.TEXT_COLOR}}>{'Mobile'}</Text>
              </View>
              <View>
                <Text style={{opacity: 0.5, color: Colors.TAG_COLOR}}>
                  {global.CONTACT_DETAILS.mobile || '+91- 7009218049'}
                </Text>
              </View>
            </View>
          </View>
          <View
            style={{
              marginVertical: 40,
              alignItems: 'center',
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#E6E8EC',
              backgroundColor: Colors.THEME
            }}>
            <TouchableOpacity
              onPress={() => navigation.navigate(navigationStrings.HOME)}>
              <View style={{margin: 15}}>
                <Text style={styles.button_label}>{'Go To Homepage'}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    paddingHorizontal: 30,
  },
  inputSection: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E6E8EC',
    backgroundColor: Colors.WHITE,
    height: 70,
    alignItems: 'center',
    borderRadius: 10,
    marginVertical: 10,
  },
  button_label: {
    fontWeight: '500',
    fontSize: 15,
    color: Colors.WHITE
  },
});
