import React, {useEffect, useState} from 'react';

import {NavigationContainer} from '@react-navigation/native';
import {Alert} from 'react-native';
import RNRestart from 'react-native-restart';

import AuthStack from './AuthStack';
import HomeStack from './HomeStack';
import StorageManager from '../Services/StorageManager';
import LoadingComp from '../Components/LoadingComp';
import VersionService from '../Services/apis/VersionService';
import notifee from '@notifee/react-native';
import {
  getMessaging,
  getToken,
  requestPermission,
  AuthorizationStatus,
  onMessage,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import envVariables from '../Constants/envVariables';
import { ConfirmDialogProvider, useConfirmDialog } from '../Components/ConfirmDialogContext';


/*
mkdir android/app/src/main/assets
react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res
react-native run-android
keytool -list -v -keystore app/elites.jks -alias key0 -storepass 12341234 -keypass 12341234
./gradlew assembleRelease
./gradlew bundleRelease
./gradlew clean
./gradlew signingReport

xcrun xctrace list devices
XCode-> Product -> Destination -> Select Phone/Simulators
*/

export default function Routes() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  async function checkSession() {
    let session = await StorageManager.get_session();
    let versions = await VersionService.get_version({});

    global.FEED_FILTERS = [];
    global.BOOKMARK_FILTERS = [];
    try {
      let min_version = parseFloat(versions.data.ios_version || 2.5);
      // console.log('min_version', currentVersion, versions.data.zoom_script);
      if (envVariables.VERSION < min_version && session.id) {
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
      global.BOOKMARK_FILTERS = versions.data.bookmark_filter || [];
      global.WEBVIEW_TEST = versions.data.test_webview || "0";
      // console.log(global.BOOKMARK_FILTERS);
    } catch (e) {
      console.log('Routes.js', e);
    }

    global.USER_ID = session.id || '';
    global.ZOOM_SCRIPT = versions?.data?.zoom_script || '';
    global.YOUTUBE_SCRIPT = versions?.data?.yt_script || '';
    Object.keys(session).length > 0
      ? setIsLoggedIn(true)
      : setIsLoggedIn(false);
    setIsLoading(false);
  }

  async function onDisplayNotification(payload) {
    try {
      await notifee.requestPermission();

      const channelId = await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
      });

      await notifee.displayNotification({
        title: payload.title,
        body: payload.body,
        android: {
          channelId,
          smallIcon: 'ic_launcher', // default fallback icon
          pressAction: { id: 'default' },
        },
      });
    } catch (e) {
      console.log('onDisplayNotification error:', e);
    }
  }

  async function checkApplicationPermission() {
    try {
      const messaging = getMessaging();
      const authorizationStatus = await requestPermission(messaging);

      if (
        authorizationStatus === AuthorizationStatus.AUTHORIZED ||
        authorizationStatus === AuthorizationStatus.PROVISIONAL
      ) {
        const token = await getToken(messaging);
        global.FB_TOKEN = token;
        console.log('FCM Token:', token);
      } else {
        console.log('User has notification permissions disabled');
      }
    } catch (e) {
      console.log('checkApplicationPermission error:', e);
    }
  }

  // Handle incoming messages when the app is in the foreground
  function handleForegroundNotifications() {
    const messaging = getMessaging();
    return onMessage(messaging, async remoteMessage => {
      const { title, body, ...data } = remoteMessage?.data || {};
      await onDisplayNotification({ title, body, data });
    });
  }

  // Handle background and quit state notifications
  function handleBackgroundNotifications() {
    const messaging = getMessaging();
    setBackgroundMessageHandler(messaging, async remoteMessage => {
      const { title, body, ...data } = remoteMessage?.data || {};
      await onDisplayNotification({ title, body, data });
    });
  }

  useEffect(() => {
    checkSession();
    checkApplicationPermission();

    const unsubscribeForeground = handleForegroundNotifications();
    handleBackgroundNotifications();

    return () => unsubscribeForeground();
  }, []);

  return (
    <>
      {isLoading ? (
        <LoadingComp />
      ) : (
        <ConfirmDialogProvider>
          <NavigationContainer>
            {isLoggedIn ? HomeStack() : AuthStack()}
          </NavigationContainer>
        </ConfirmDialogProvider>
      )}
    </>
  );
}
