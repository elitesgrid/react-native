import React, {useEffect, useState} from 'react';

import {NavigationContainer} from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import {Alert} from 'react-native';
import RNRestart from 'react-native-restart';

import AuthStack from './AuthStack';
import HomeStack from './HomeStack';
import StorageManager from '../Services/StorageManager';
import LoadingComp from '../Components/LoadingComp';
import VersionService from '../Services/apis/VersionService';

/*
mkdir android/app/src/main/assets
react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res
react-native run-android
*/

const currentVersion = DeviceInfo.getVersion();

export default function Routes() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  async function checkSession() {
    let session = await StorageManager.get_session();
    let versions = await VersionService.get_version({});

    global.FEED_FILTERS = [];
    try {
      let min_version = parseFloat(versions.data.ios_version || 2.5);
      //console.log('min_version', currentVersion, min_version);
      if (currentVersion < min_version && session.id) {
        session = {};
        await StorageManager.remove_key('JWT');
        await StorageManager.remove_session();

        Alert.alert(
          'Outdated',
          'New version available. Please Update the app.',
          [
            {
              text: 'OK',
              onPress: () => {
                RNRestart.Restart();
              },
            },
          ],
          {cancelable: false}, // Optional: set to true if you want the alert to be dismissed when tapping outside of it
        );
      }
      global.CONTACT_DETAILS = versions.data.contact_details || {};
      global.FEED_FILTERS = versions.data.feed_filter || [];
      //console.log(global.FEED_FILTERS);
    } catch (e) {
      console.log('Routes.js', e);
    }

    global.USER_ID = session.id || '';
    Object.keys(session).length > 0
      ? setIsLoggedIn(true)
      : setIsLoggedIn(false);
    setIsLoading(false);
  }

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <>
      {isLoading ? (
        <LoadingComp />
      ) : (
        <NavigationContainer>
          {isLoggedIn ? HomeStack() : AuthStack()}
        </NavigationContainer>
      )}
    </>
  );
}
