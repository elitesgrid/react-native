//import liraries
import React, { Component } from 'react';
import { Image, View, Text, StyleSheet, TouchableOpacity,SafeAreaView, StatusBar } from 'react-native';
//import LinearGradient from 'react-native-linear-gradient';
//import { ifIphoneX,getStatusBarHeight,getBottomSpace } from 'react-native-iphone-x-helper'

import imagePaths from '../Constants/imagePaths';
import { useNavigation } from '@react-navigation/native';
import Colors from '../Constants/Colors';
import CommonStyles from '../Assets/Style/CommonStyle';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Using existing icon set

// create a component
const TestHeaderComp = ({
    onPressBack,
    togglePallete,
    headerStyles = {},
    headerTitle = "",
    headerTestTime = "00:00:00",
    ...props
}) => {
    const navigation = useNavigation();
    const goBack = function () {
        navigation.goBack(null);
    }
    return (
        <SafeAreaView style={{ ...CommonStyles.headerView, ...headerStyles }}>
            <StatusBar backgroundColor={Colors.THEME} barStyle="light-content" />
            <View style={CommonStyles.HeaderContainer}>
                <TouchableOpacity 
                 style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
                 onPress={!!onPressBack ? onPressBack : () => goBack()}>
                    <Icon name="arrow-left" size={22} color="#fff" />
                    <Text 
                        style={{ color: Colors.WHITE, fontSize: 18, marginLeft: 12 }}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >{headerTitle}</Text>
                </TouchableOpacity>
                <View style={{height:45}}>
                    <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
                        {
                            headerTestTime && <View style={{ paddingHorizontal: 8, marginVertical: 8, marginHorizontal: 10, borderRadius: 20, backgroundColor: "#81BADD" }}>
                                <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
                                    <Image style={{ width: 20, height: 20 }} source={imagePaths.TEST_TIMER_ICON} />
                                    <Text style={{ fontSize: 13, fontWeight: "400", color: Colors.BLACK, paddingLeft: 4 }}>{headerTestTime}</Text>
                                </View>
                            </View>
                        }
                        <TouchableOpacity style={{ alignItems: "center", marginRight: 10 }} onPress={togglePallete}>
                            <Image style={{ height: 20, width: 20 }} source={imagePaths.TEST_HAMBURGER} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

// define your styles
const styles = StyleSheet.create({
    image: {
        height: 20,
        width: 20,
        tintColor: Colors.WHITE,
    }
});

//make this component available to the app
export default TestHeaderComp;
