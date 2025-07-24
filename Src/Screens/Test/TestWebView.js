//import liraries
import React, {useEffect, useState} from 'react';
import {View, SafeAreaView, StatusBar, Alert} from 'react-native';
import {WebView} from 'react-native-webview';
import {
  ifIphoneX,
  getStatusBarHeight,
  getBottomSpace,
} from 'react-native-iphone-x-helper';

//import TestHeaderComp from '../../Components/TestHeaderComp';
//import HeaderComp from '../../Components/HeaderComp';
import Colors from '../../Constants/Colors';
import TestSeriesStyle from '../../Assets/Style/TestSeriesStyle';
import envVariables from '../../Constants/envVariables';
import StorageManager from '../../Services/StorageManager';
import navigationStrings from '../../Constants/navigationStrings';

// create a component
export const TestWebView = props => {
  const {route, navigation} = props;
  const {params} = route;
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigatingToPlayer, setIsNavigatingToPlayer] = useState(false);
  const [testUrl, setTestUrl] = useState('');

  useEffect(
    function () {
      const unsubscribe = navigation.addListener('focus', async () => {
        setIsLoading(false);
        if (isNavigatingToPlayer) {
          setIsNavigatingToPlayer(false); // Reset flag
          console.log('came back from player');
          return;
        }
        let user_id = 0;
        let session = await StorageManager.get_session();
        if (Object.keys(session).length > 0) {
          user_id = session.id;
        }
        console.log(params);
        let obj = {};
        if (params.internal_type === 'bookmarked') {
          obj = {
            type: 'bookmarked',
            user_id: user_id,
          };
        } else if (
          params.internal_type === 'Start Test' ||
          params.internal_type === 'Resume Test'
        ) {
          obj = {
            type: 'instructions',
            user_id: user_id,
            test_id: params.id,
          };
        } else if (params.internal_type === 'View Result') {
          obj = {
            type: 'test_result',
            user_id: user_id,
            report_id: params.report_id,
            test_id: params.id,
          };
        } else if (params.internal_type === 'View Rankers') {
          obj = {
            type: 'view_rankers',
            user_id: user_id,
            test_id: params.id,
            view_rankers_count: params.view_rankers_count,
            length: params.length,
            title: params.title,
          };
        } else if (params.internal_type === 'Start Practice') {
          obj = {
            type: 'test_practice',
            user_id: user_id,
            test_id: params.id,
          };
        }
        obj.timestamp = Math.random() * 10;

        var get_params = Object.keys(obj)
          .map(function (key) {
            return key + '=' + obj[key];
          })
          .join('&');

        console.log(
          envVariables.BASE_URL_WEB + 'web/login/android_login?' + get_params,
        );
        setTestUrl(
          envVariables.BASE_URL_WEB + 'web/login/android_login?' + get_params,
        );
      });
      return unsubscribe;
    },
    [navigation, params],
  );

  return (
    <>
      {isLoading ? (
        <LoadingComp />
      ) : (
        <View style={{flex: 1}}>
          {/* <StatusBar backgroundColor={Colors.THEME} barStyle="light-content" /> */}
          {/* <TestHeaderComp headerTitle={params.title} /> */}
          {/* <HeaderComp headerTitle={params.title} /> */}
          <SafeAreaView style={{backgroundColor: Colors.THEME}}></SafeAreaView>
          <View style={{flex: 1}}>
            {
              testUrl && <WebView
                key={'shortDesc'}
                originWhitelist={['*']}
                source={{uri: testUrl}}
                style={{
                  flex: 1,
                  //marginTop:30 + getStatusBarHeight(),
                  //backgroundColor:Colors.THEME
                }}
                onMessage={event => {
                  console.log(
                    'Test Webview Callback received: ' + event.nativeEvent.data,
                  );
                  const message = JSON.parse(event.nativeEvent.data);
                  switch (message.call_type) {
                    case 'back':
                      setIsNavigatingToPlayer(false);
                      navigation.goBack(null);
                      break;
                    case 'player':
                      let item = {
                        url: message.file_url,
                        title: 'Solution Video',
                      };
                      setIsNavigatingToPlayer(true);
                      navigation.navigate(navigationStrings.PLAYER, item);
                      break;
                  }
                }}
                onError={(e)=>{
                  console.log('TWebView Error:', testUrl, e.nativeEvent);
                }}
              />
            }
          </View>
          <SafeAreaView style={{backgroundColor: Colors.THEME}}></SafeAreaView>
        </View>
      )}
    </>
  );
};
