//import liraries
import React, { Component } from 'react';
import { Image, View, Text, StyleSheet, TouchableOpacity,SafeAreaView, StatusBar } from 'react-native';
//import LinearGradient from 'react-native-linear-gradient';
import { ifIphoneX,getStatusBarHeight,getBottomSpace } from 'react-native-iphone-x-helper'

import imagePaths from '../Constants/imagePaths';
import { useNavigation } from '@react-navigation/native';
import Colors from '../Constants/Colors';


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
        <SafeAreaView style={{ ...styles.headerView, ...headerStyles }}>
            <StatusBar backgroundColor={Colors.THEME} barStyle="light-content" />
            <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <TouchableOpacity 
                 style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
                 onPress={!!onPressBack ? onPressBack : () => goBack()}>
                    <Image
                        source={imagePaths.BACK}
                        style={styles.image}
                    />
                    <Text 
                        style={{ color: Colors.WHITE, fontSize: 18, marginLeft: 12 }}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >{headerTitle}</Text>
                </TouchableOpacity>
                <View style={{height:45}}>
                    <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
                        <View style={{ paddingHorizontal: 8, marginVertical: 8, marginHorizontal: 10, borderRadius: 20, backgroundColor: "#81BADD" }}>
                            <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
                                <Image style={{ width: 20, height: 20 }} source={imagePaths.TEST_TIMER_ICON} />
                                <Text style={{ fontSize: 13, fontWeight: "400", color: Colors.BLACK, paddingLeft: 4 }}>{headerTestTime}</Text>
                            </View>
                        </View>
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
    headerView: {
        paddingTop: Platform.select({
              ios: 0,
              android: 20,
            }),
        height:
            Platform.select({
            ios: 80,
            android: 40,
            }) + getStatusBarHeight(),
        width: "100%",
        justifyContent: "center",
        backgroundColor: Colors.THEME
    },
    image: {
        height: 20,
        width: 20,
        marginLeft: 20,
        tintColor: Colors.WHITE
    }
});

//make this component available to the app
export default TestHeaderComp;
