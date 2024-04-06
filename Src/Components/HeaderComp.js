//import liraries
import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity,StatusBar } from 'react-native';
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
        <View style={{ ...styles.headerView, ...headerStyles }}>
            <StatusBar backgroundColor={Colors.THEME} barStyle="light-content" />
            <TouchableOpacity style={{ flex: 1, flexDirection: "row", alignItems: "center" }} onPress={!!onPressBack ? onPressBack : () => goBack()}>
                <Image
                    source={imagePaths.BACK}
                    style={styles.image}
                />
                <Text style={{ color: Colors.WHITE, fontSize: 18, marginLeft: 12 }}>{headerTitle}</Text>
                <Text></Text>
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
export default HeaderComp;
