//import liraries
import React, { Component } from 'react';
import { ifIphoneX,getStatusBarHeight,getBottomSpace } from 'react-native-iphone-x-helper';
import { View, Text, StyleSheet, TouchableOpacity,StatusBar,SafeAreaView } from 'react-native';
import { Image } from 'react-native-elements';
import imagePaths from '../Constants/imagePaths';
import { useNavigation } from '@react-navigation/native';
import Colors from '../Constants/Colors';


// create a component
const HeaderComp = ({
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
        <SafeAreaView  style={{ ...styles.headerView, ...headerStyles }}>
            <StatusBar backgroundColor={Colors.THEME} barStyle="light-content" />
            <TouchableOpacity style={{ flex: 1, flexDirection: "row", alignItems: "center" }} onPress={!!onPressBack ? onPressBack : () => goBack()}>
                <Image
                    source={imagePaths.BACK}
                    style={styles.image}
                />
                <Text style={{ color: Colors.WHITE, fontSize: 18, marginLeft: 12 }}>{headerTitle}</Text>
                <Text></Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

// define your styles
const styles = StyleSheet.create({
    headerView: {
        height:70 + getStatusBarHeight(),
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
export default HeaderComp;
