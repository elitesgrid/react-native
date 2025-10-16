import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {createDrawerNavigator} from '@react-navigation/drawer';

import navigationStrings from '../Constants/navigationStrings';
import TabRoutes from './TabRoutes';
import {
  MyOrder,
  MyPortal,
  ChangePassword,
  Bookmark,
  ContactUS,
  PastPaperDetail,
  Player,
  CourseDetail,
  ListCourses,
  ListPastPapers,
  ListChannelVideos,
  ListTestemonials,
  RecordedClasses2,
  RecordedClasses3,
  TestSeries2,
  TestSeries3,
  StudyMaterial2,
  StudyMaterial3,
  PdfViewer,
  Instructions,
  AttemptTest,
  ViewResult,
  TestWebView,
  Notification,
  FeedDetail,
  CreateFeed,
  C_Webview,
} from '../Screens/index';
import CustomDrawerContent from '../Components/CustomDrawerContent';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const StackNavigator = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen
      name={navigationStrings.TAB_ROUTES}
      component={TabRoutes}></Stack.Screen>
    <Stack.Screen
      name={navigationStrings.MY_PORTAL}
      component={MyOrder}></Stack.Screen>
    <Stack.Screen
      name={navigationStrings.CHANGE_PASSWORD}
      component={ChangePassword}></Stack.Screen>
    <Stack.Screen
      name={navigationStrings.BOOK_MARK}
      component={Bookmark}></Stack.Screen>
    <Stack.Screen
      name={navigationStrings.CONTACT_US}
      component={ContactUS}></Stack.Screen>
    <Stack.Screen
      name={navigationStrings.PAST_PAPER_DETAIL}
      component={PastPaperDetail}></Stack.Screen>
    <Stack.Screen
      name={navigationStrings.PLAYER}
      component={Player}></Stack.Screen>
    <Stack.Screen
      name={navigationStrings.COURSE_DETAIL}
      component={CourseDetail}></Stack.Screen>
    <Stack.Screen
      name={navigationStrings.LIST_PAST_PAPERS}
      component={ListPastPapers}></Stack.Screen>
    <Stack.Screen
      name={navigationStrings.LIST_COURSES}
      component={ListCourses}></Stack.Screen>
    <Stack.Screen
      name={navigationStrings.LIST_CHANNEL_VIDEOS}
      component={ListChannelVideos}></Stack.Screen>
    <Stack.Screen
      name={navigationStrings.LIST_TESTEMONIALS}
      component={ListTestemonials}></Stack.Screen>
    <Stack.Screen
      name={navigationStrings.RECORDED_VIDEO2}
      component={RecordedClasses2}></Stack.Screen>
    <Stack.Screen
      name={navigationStrings.RECORDED_VIDEO3}
      component={RecordedClasses3}></Stack.Screen>
    <Stack.Screen
      name={navigationStrings.TEST_SERIES2}
      component={TestSeries2}></Stack.Screen>
    <Stack.Screen
      name={navigationStrings.TEST_SERIES3}
      component={TestSeries3}></Stack.Screen>
    <Stack.Screen
      name={navigationStrings.PDF2}
      component={StudyMaterial2}></Stack.Screen>
    <Stack.Screen
      name={navigationStrings.PDF3}
      component={StudyMaterial3}></Stack.Screen>
    <Stack.Screen
      name={navigationStrings.PDF_VIEWER}
      component={PdfViewer}></Stack.Screen>
    <Stack.Screen
      name={navigationStrings.TEST_INSTRUCTIONS}
      component={Instructions}></Stack.Screen>
    <Stack.Screen
      name={navigationStrings.TEST_ATTEMPT}
      component={AttemptTest}></Stack.Screen>
    <Stack.Screen
      name={navigationStrings.TEST_VIEW_RESULT}
      component={ViewResult}></Stack.Screen>
    <Stack.Screen
      name={navigationStrings.TEST_WEBVIEW}
      component={TestWebView}></Stack.Screen>
    <Stack.Screen
      name={navigationStrings.NOTIFICATION}
      component={Notification}></Stack.Screen>
    <Stack.Screen
      name={navigationStrings.FEED_DETAIL}
      component={FeedDetail}></Stack.Screen>
    <Stack.Screen
      name={navigationStrings.CREATE_FEED}
      component={CreateFeed}></Stack.Screen>
    <Stack.Screen
      name={navigationStrings.C_WEBVIEW}
      component={C_Webview}></Stack.Screen>
  </Stack.Navigator>
);

export default function HomeStack() {
  return (
    <Drawer.Navigator
      screenOptions={{headerShown: false}}
      drawerContent={props => <CustomDrawerContent {...props} />}>
      <Drawer.Screen
        name={navigationStrings.STACK_NAV}
        component={StackNavigator}></Drawer.Screen>
    </Drawer.Navigator>
    // <Stack.Navigator screenOptions={{headerShown:false}}>
    //     <Stack.Screen name={navigationStrings.BOTTOM_TABS}  component={TabRoutes}/>
    // </Stack.Navigator>
  );
}
