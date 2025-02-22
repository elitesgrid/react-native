import React, {useEffect, useState} from 'react';

import {NavigationContainer} from '@react-navigation/native';

import AuthStack from './AuthStack';
import HomeStack from './HomeStack';
import StorageManager from '../Services/StorageManager';
import LoadingComp from '../Components/LoadingComp';

/*
mkdir android/app/src/main/assets
react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res
react-native run-android
*/

export default function Routes() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    async function checkSession() {
      let session = await StorageManager.get_session();
      global.USER_ID = session.id || '';
      Object.keys(session).length > 0
        ? setIsLoggedIn(true)
        : setIsLoggedIn(false);
      setIsLoading(false);
    }
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
