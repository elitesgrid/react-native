import * as React from 'react';
import { Text, View, Image } from 'react-native';
//import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Home, MyPortal, MyOrder, Profile } from "../Screens/index";
import navigationStrings from '../Constants/navigationStrings';
import imagePaths from '../Constants/imagePaths';
import Colors from '../Constants/Colors';
import CommonStyles from '../Assets/Style/CommonStyle';


const BottomTab = createBottomTabNavigator();

export default function TabRoutes() {
    return (
        <BottomTab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarInactiveTintColor: Colors.IDLE,
                tabBarActiveTintColor: Colors.THEME,
            }}
        >
            <BottomTab.Screen
                options={({ route }) => ({
                    tabBarLabel: ({ focused }) => (
                        <Text style={CommonStyles.bottomTabLabel}>{route.name}</Text>
                    ),
                    tabBarIcon: ({ focused }) => {
                        return (
                            <Image style={{ ...CommonStyles.bottomTabImages, ...{ tintColor: focused ? Colors.THEME : Colors.IDLE } }} source={imagePaths.HOME} />
                        )
                    }
                })}
                name={navigationStrings.HOME} component={Home} />

            <BottomTab.Screen
                options={({ route }) => ({
                    tabBarLabel: ({ focused }) => (
                        <Text style={CommonStyles.bottomTabLabel}>{route.name}</Text>
                    ),
                    tabBarIcon: ({ focused }) => {
                        return (
                            <Image style={{ ...CommonStyles.bottomTabImages, ...{ tintColor: focused ? Colors.THEME : Colors.IDLE } }} source={imagePaths.MY_PORTAL} />
                        )
                    }
                })}
                name={navigationStrings.MY_PORTAL} component={MyPortal} />
            <BottomTab.Screen
                options={({ route }) => ({
                    tabBarLabel: ({ focused }) => (
                        <Text style={CommonStyles.bottomTabLabel}>{route.name}</Text>
                    ),
                    tabBarIcon: ({ focused }) => {
                        return (
                            <Image style={{ ...CommonStyles.bottomTabImages, ...{ tintColor: focused ? Colors.THEME : Colors.IDLE } }} source={imagePaths.MY_ORDER} />
                        )
                    }
                })}
                name={navigationStrings.MY_ORDER} component={MyOrder} />
            <BottomTab.Screen
                options={({ route }) => ({
                    tabBarLabel: ({ focused }) => (
                        <Text style={CommonStyles.bottomTabLabel}>{route.name}</Text>
                    ),
                    tabBarIcon: ({ focused }) => {
                        return (
                            <Image style={{ ...CommonStyles.bottomTabImages, ...{ tintColor: focused ? Colors.THEME : Colors.IDLE } }} source={imagePaths.PROFILE} />
                        )
                    }
                })}
                name={navigationStrings.PROFILE} component={Profile} />
        </BottomTab.Navigator>
    );
}