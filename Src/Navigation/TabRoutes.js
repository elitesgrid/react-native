import React, {useState, useEffect} from 'react';
import {Text, View, Image, Dimensions, Platform} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import DeviceInfo from 'react-native-device-info';

import {Home, MyPortal, MyOrder, Profile, Timeline} from '../Screens/index';
import navigationStrings from '../Constants/navigationStrings';
import Colors from '../Constants/Colors';
import CommonStyles from '../Assets/Style/CommonStyle';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const BottomTab = createBottomTabNavigator();

export default function TabRoutes() {
  const [isTablet, setIsTablet] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const checkIfTablet = async () => {
      const tablet = await DeviceInfo.isTablet();
      setIsTablet(tablet);
    };

    const handleOrientationChange = () => {
      const {width, height} = Dimensions.get('window');
      setIsLandscape(width > height);
    };

    checkIfTablet();
    handleOrientationChange();

    const sub = Dimensions.addEventListener('change', handleOrientationChange);
    return () => sub?.remove?.();
  }, []);

  const renderTabContent = (route, focused, iconSource) => {
    const color = focused ? Colors.THEME : Colors.IDLE;
    const icon = (
      <Icon
        name={iconSource}
        size={18}
        color={focused ? Colors.THEME : Colors.IDLE}
      />
    );

    const label = (
      <Text
        style={{
          ...CommonStyles.bottomTabLabel,
          color,
          marginLeft: isLandscape || isTablet ? 8 : 0,
          marginTop: isLandscape && isTablet ? 0 : 3,
        }}>
        {route.name}
      </Text>
    );

    // 📱 Portrait or phone view → icon above text
    if (!isTablet && !isLandscape) {
      return (
        <View style={{alignItems: 'center'}}>
          {icon}
          {label}
        </View>
      );
    }

    // 💻 Tablet landscape → icon beside text (row layout)
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 12,
          width: 140,
        }}>
        {icon}
        {label}
      </View>
    );
  };

  const screenOptions = {
    headerShown: false,
    tabBarInactiveTintColor: Colors.IDLE,
    tabBarActiveTintColor: Colors.THEME,
    tabBarStyle: {
      paddingTop: 5
      // height: isLandscape && isTablet ? 70 : 60,
      // paddingBottom: Platform.OS === 'ios' ? 8 : 5,
    },
  };

  const tabs = [
    {name: navigationStrings.HOME, comp: Home, icon: 'home-outline'},
    {name: navigationStrings.MY_PORTAL, comp: MyPortal, icon: 'file-document-outline'},
    {name: navigationStrings.MY_ORDER, comp: MyOrder, icon: 'cart-outline'},
    {name: navigationStrings.PROFILE, comp: Profile, icon: 'account-outline'},
    {name: navigationStrings.TIMELINE, comp: Timeline, icon: 'timeline-outline'},
  ];

  return (
    <BottomTab.Navigator screenOptions={screenOptions}>
      {tabs.map(tab => (
        <BottomTab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.comp}
          options={({route}) => ({
            tabBarLabel: () => null,
            tabBarIcon: ({focused}) =>
              renderTabContent(route, focused, tab.icon),
          })}
        />
      ))}
    </BottomTab.Navigator>
  );
}
