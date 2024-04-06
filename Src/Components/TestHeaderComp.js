//import liraries
import React, { Component } from 'react';
import { Image, View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import imagePaths from '../Constants/imagePaths';
import { useNavigation } from '@react-navigation/native';
import Colors from '../Constants/Colors';


// create a component
const TestHeaderComp = ({
    onPressBack,
    headerStyles = {},
    headerTitle = "",
    ...props
}) => {
    const navigation = useNavigation();
    const goBack = function () {
        navigation.goBack(null);
    }
    return (
        <View style={{ ...styles.headerView, ...headerStyles }}>
            <StatusBar backgroundColor={Colors.THEME} barStyle="light-content" />
            <TouchableOpacity style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }} onPress={!!onPressBack ? onPressBack : () => goBack()}>
                <Image
                    source={imagePaths.BACK}
                    style={styles.image}
                />
                <Text style={{ color: Colors.WHITE, fontSize: 18, marginLeft: 12 }}>{headerTitle}</Text>
                <View
                    style={{ paddingHorizontal: 8, marginVertical: 8, borderRadius: 20, backgroundColor: "#81BADD" }}
                >
                    <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
                        <Image style={{ width: 20, height: 20 }} source={imagePaths.TEST_TIMER_ICON} />
                        <Text style={{ fontSize: 13, fontWeight: "400", color: Colors.BLACK, paddingLeft: 4 }}>01:11:11</Text>
                    </View>
                </View>
                <View style={{ alignItems: "center", marginRight: 10 }}>
                    <Image style={{ height: 20, width: 20 }} source={imagePaths.TEST_HAMBURGER} />
                </View>
            </TouchableOpacity>
        </View>
    );
};

// define your styles
const styles = StyleSheet.create({
    headerView: {
        height: 42,
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
