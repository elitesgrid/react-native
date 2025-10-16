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
    // Request permissions (required for iOS)
    await notifee.requestPermission();

    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });

    // Display a notification
    await notifee.displayNotification({
      title: payload.title,
      body: payload.body,
      android: {
        channelId,
        smallIcon: 'name-of-a-small-icon', // optional, defaults to 'ic_launcher'.
        // pressAction is needed if you want the notification to open the app when pressed
        pressAction: {
          id: 'default',
        },
      },
    });
  }

  async function checkApplicationPermission() {
    try {
      const messaging = getMessaging();

      // Request notification permission
      const authorizationStatus = await requestPermission(messaging);

      if (authorizationStatus === AuthorizationStatus.AUTHORIZED) {
        console.log('User has notification permissions enabled.');

        // Fetch the FCM token
        const token = await getToken(messaging);
        global.FB_TOKEN = token;
        console.log('FCM Token:', token);

        // Optionally, save the token to your server or use it for push notifications
        // For example: sendTokenToServer(token);
      } else if (authorizationStatus === AuthorizationStatus.PROVISIONAL) {
        console.log('User has provisional notification permissions.');

        // Fetch the FCM token even if the permission is provisional
        const token = await getToken(messaging);
        global.FB_TOKEN = token;
        console.log('FCM Token (provisional):', token);
      } else {
        console.log('User has notification permissions disabled');
      }
    } catch (e) {
      console.log('checkApplicationPermission', e);
    }
  }

  // Handle incoming messages when the app is in the foreground
  function handleForegroundNotifications() {
    const messaging = getMessaging();

    // This will be triggered when the app is in the foreground and a notification is received
    const unsubscribe = onMessage(messaging, async remoteMessage => {
      //console.log('Foreground notification received:', remoteMessage.data);
      var payload = {
        title: remoteMessage.data.title,
        body: remoteMessage.data.body,
        data: remoteMessage.data,
      };
      onDisplayNotification(payload);
      //Alert.alert('New Notification', remoteMessage.notification.body);
    });
    return unsubscribe; // Return the cleanup function for later removal
  }

  // Handle background and quit state notifications
  function handleBackgroundNotifications() {
    const messaging = getMessaging();

    // This will be triggered when the app is in the background or terminated
    setBackgroundMessageHandler(
      messaging,
      async remoteMessage => {
        var payload = {
          title: remoteMessage.data.title,
          body: remoteMessage.data.body,
          data: remoteMessage.data,
        };
        onDisplayNotification(payload);
        //console.log('Background/Terminated notification received:',remoteMessage);
        // Handle the background message, for example, show a notification
      },
    );
    //return unsubscribeBackground; // Return the cleanup function for background messages
  }

  useEffect(() => {
    checkSession();

    checkApplicationPermission();

    // Handle foreground notifications
    const unsubscribeForeground = handleForegroundNotifications();

    // Handle background notifications
    handleBackgroundNotifications()

    // Cleanup the listeners when the component unmounts
    return () => {
      unsubscribeForeground();
    };
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
