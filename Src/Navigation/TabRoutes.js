import React, {useState, useEffect} from 'react';
import {Text, View, Image} from 'react-native';
//import { NavigationContainer } from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import DeviceInfo from 'react-native-device-info';

import {Home, MyPortal, MyOrder, Profile, Timeline} from '../Screens/index';
import navigationStrings from '../Constants/navigationStrings';
import imagePaths from '../Constants/imagePaths';
import Colors from '../Constants/Colors';
import CommonStyles from '../Assets/Style/CommonStyle';

const BottomTab = createBottomTabNavigator();

export default function TabRoutes() {
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkIfTablet = async () => {
      const isTablet = await DeviceInfo.isTablet();
      setIsTablet(isTablet && Platform.OS === 'ios');
    };

    checkIfTablet();
  }, []);

  return (
    <BottomTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarInactiveTintColor: Colors.IDLE,
        tabBarActiveTintColor: Colors.THEME,
      }}>
      <BottomTab.Screen
        options={({route}) => ({
          tabBarLabel: ({focused}) =>
            isTablet ? (
              <></>
            ) : (
              <Text style={{
                ...CommonStyles.bottomTabLabel,
                color: focused ? Colors.THEME : Colors.IDLE
              }}>{route.name}</Text>
            ),
          tabBarIcon: ({focused}) => {
            return (
              <>
                {!isTablet && (
                  <Image
                    style={{
                      ...CommonStyles.bottomTabImages,
                      ...{tintColor: focused ? Colors.THEME : Colors.IDLE},
                    }}
                    resizeMode="stretch"
                    source={imagePaths.HOME}
                  />
                )}
                {isTablet && (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      width: 90,
                    }}>
                    <Image
                      style={{
                        ...CommonStyles.bottomTabImages,
                        tintColor: focused ? Colors.THEME : Colors.IDLE,
                      }}
                      resizeMode="stretch"
                      source={imagePaths.HOME}
                    />
                    <Text
                      style={{
                        ...CommonStyles.bottomTabLabel,
                        ...{marginLeft: 8, marginTop: 3},
                        color: focused ? Colors.THEME : Colors.IDLE
                      }}>
                      {route.name}
                    </Text>
                  </View>
                )}
              </>
            );
          },
        })}
        name={navigationStrings.HOME}
        component={Home}
      />

      <BottomTab.Screen
        options={({route}) => ({
          tabBarLabel: ({focused}) =>
            isTablet ? (
              <></>
            ) : (
              <Text style={{
                ...CommonStyles.bottomTabLabel,
                color: focused ? Colors.THEME : Colors.IDLE
              }}>{route.name}</Text>
            ),
          tabBarIcon: ({focused}) => {
            return (
              <>
                {!isTablet && (
                  <Image
                    style={{
                      ...CommonStyles.bottomTabImages,
                      ...{tintColor: focused ? Colors.THEME : Colors.IDLE},
                    }}
                    resizeMode="stretch"
                    source={imagePaths.MY_PORTAL}
                  />
                )}
                {isTablet && (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      width: 100,
                    }}>
                    <Image
                      style={{
                        ...CommonStyles.bottomTabImages,
                        tintColor: focused ? Colors.THEME : Colors.IDLE,
                      }}
                      resizeMode="stretch"
                      source={imagePaths.MY_PORTAL}
                    />
                    <Text
                      style={{
                        ...CommonStyles.bottomTabLabel,
                        ...{marginLeft: 8, marginTop: 3},
                        color: focused ? Colors.THEME : Colors.IDLE
                      }}>
                      {route.name}
                    </Text>
                  </View>
                )}
              </>
            );
          },
        })}
        name={navigationStrings.MY_PORTAL}
        component={MyPortal}
      />
      <BottomTab.Screen
        options={({route}) => ({
          tabBarLabel: ({focused}) =>
            isTablet ? (
              <></>
            ) : (
              <Text style={{
                ...CommonStyles.bottomTabLabel,
                color: focused ? Colors.THEME : Colors.IDLE
              }}>{route.name}</Text>
            ),
          tabBarIcon: ({focused}) => {
            return (
              <>
                {!isTablet && (
                  <Image
                    style={{
                      ...CommonStyles.bottomTabImages,
                      ...{tintColor: focused ? Colors.THEME : Colors.IDLE},
                    }}
                    resizeMode="stretch"
                    source={imagePaths.MY_ORDER}
                  />
                )}
                {isTablet && (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      width: 100,
                    }}>
                    <Image
                      style={{
                        ...CommonStyles.bottomTabImages,
                        tintColor: focused ? Colors.THEME : Colors.IDLE,
                      }}
                      resizeMode="stretch"
                      source={imagePaths.MY_ORDER}
                    />
                    <Text
                      style={{
                        ...CommonStyles.bottomTabLabel,
                        ...{marginLeft: 8, marginTop: 3},
                        color: focused ? Colors.THEME : Colors.IDLE
                      }}>
                      {route.name}
                    </Text>
                  </View>
                )}
              </>
            );
          },
        })}
        name={navigationStrings.MY_ORDER}
        component={MyOrder}
      />
      <BottomTab.Screen
        options={({route}) => ({
          tabBarLabel: ({focused}) =>
            isTablet ? (
              <></>
            ) : (
              <Text style={{
                ...CommonStyles.bottomTabLabel,
                color: focused ? Colors.THEME : Colors.IDLE
              }}>{route.name}</Text>
            ),
          tabBarIcon: ({focused}) => {
            return (
              <>
                {!isTablet && (
                  <Image
                    style={{
                      ...CommonStyles.bottomTabImages,
                      ...{tintColor: focused ? Colors.THEME : Colors.IDLE},
                    }}
                    resizeMode="stretch"
                    source={imagePaths.PROFILE}
                  />
                )}
                {isTablet && (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      width: 100,
                    }}>
                    <Image
                      style={{
                        ...CommonStyles.bottomTabImages,
                        tintColor: focused ? Colors.THEME : Colors.IDLE,
                      }}
                      resizeMode="stretch"
                      source={imagePaths.PROFILE}
                    />
                    <Text
                      style={{
                        ...CommonStyles.bottomTabLabel,
                        ...{marginLeft: 8, marginTop: 3},
                        color: focused ? Colors.THEME : Colors.IDLE
                      }}>
                      {route.name}
                    </Text>
                  </View>
                )}
              </>
            );
          },
        })}
        name={navigationStrings.PROFILE}
        component={Profile}
      />
      <BottomTab.Screen
        options={({route}) => ({
          tabBarLabel: ({focused}) =>
            isTablet ? (
              <></>
            ) : (
              <Text style={{
                ...CommonStyles.bottomTabLabel,
                color: focused ? Colors.THEME : Colors.IDLE
              }}>{route.name}</Text>
            ),
          tabBarIcon: ({focused}) => {
            return (
              <>
                {!isTablet && (
                  <Image
                    style={{
                      ...CommonStyles.bottomTabImages,
                      ...{tintColor: focused ? Colors.THEME : Colors.IDLE},
                    }}
                    resizeMode="stretch"
                    source={imagePaths.TIMELINE}
                  />
                )}
                {isTablet && (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      width: 100,
                    }}>
                    <Image
                      style={{
                        ...CommonStyles.bottomTabImages,
                        tintColor: focused ? Colors.THEME : Colors.IDLE,
                      }}
                      resizeMode="stretch"
                      source={imagePaths.TIMELINE}
                    />
                    <Text
                      style={{
                        ...CommonStyles.bottomTabLabel,
                        ...{marginLeft: 8, marginTop: 3},
                        color: focused ? Colors.THEME : Colors.IDLE
                      }}>
                      {route.name}
                    </Text>
                  </View>
                )}
              </>
            );
          },
        })}
        name={navigationStrings.TIMELINE}
        component={Timeline}
      />
    </BottomTab.Navigator>
  );
}
