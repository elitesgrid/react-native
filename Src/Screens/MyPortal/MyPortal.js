import React, { useEffect, useState } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';


import HeaderComp from '../../Components/HeaderComp';
import { LiveClasses1 } from './LiveClasses/LiveClasses1';
import { RecordedClasses1 } from './RecordedClasses/RecordedClasses1';
import { TestSeries1 } from './TestSeries/TestSeries1';
import { StudyMaterial1 } from './StudyMaterial/StudyMaterial1';
import Colors from '../../Constants/Colors';
import { FeedList } from '../Feeds/FeedList';
import { Notices } from './Notices/Notices';

export const MyPortal = (props) => {
  const { navigation } = props;
  const layout = useWindowDimensions();

  const renderScene = SceneMap({
    live_classes: () => <LiveClasses1 navigation={navigation} />,
    recorded_videos: () => <RecordedClasses1 navigation={navigation} />,
    test_series: () => <TestSeries1 navigation={navigation} />,
    study_material: () => <StudyMaterial1 navigation={navigation} />,
    feed: () => <FeedList navigation={navigation} />,
    notice_board: () => <Notices navigation={navigation} />,
  });

  // Render the tab bar
  const renderTabBar = props => (
    <TabBar
      {...props}
      scrollEnabled
      tabStyle={{ width: 'auto' }}
      indicatorStyle={{ backgroundColor: 'white',height:3 }}
      style={{ backgroundColor: Colors.THEME }}
    />
  );

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'live_classes', title: 'Live Classes' },
    { key: 'recorded_videos', title: 'Recorded Videos' },
    { key: 'test_series', title: 'Test Series' },
    { key: 'study_material', title: 'Study Material' },
    { key: 'feed', title: 'Feed' },
    { key: 'notice_board', title: 'Notice Board' },
  ]);

  return (
    <View style={{ flex: 1 }}>
      <HeaderComp headerTitle={"My Portal"} />
      <TabView
        navigation={navigation}
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        renderTabBar={renderTabBar}
        initialLayout={{ width: layout.width,backgroundColor:Colors.THEME }}
        lazyPreloadDistance={1}
      />
    </View>
  );
};