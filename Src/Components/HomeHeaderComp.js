//import liraries
import React, { Component } from 'react';
import { View, Text, StatusBar, TouchableOpacity } from 'react-native';
import { Image } from 'react-native-elements';
import imagePaths from '../Constants/imagePaths';
import { useNavigation } from '@react-navigation/native';

import CommonStyles from '../Assets/Style/CommonStyle';
import Colors from '../Constants/Colors';


// create a component
const HomeHeaderComp = ({
    onPressBack,
    headerStyles = {},
    headingText = {},
    ...props
}) => {
    const navigation = useNavigation();
    const goBack = function () {
        navigation.goBack();
    }
    return (
        <View style={{...CommonStyles.headerView,...headerStyles}}>
            <StatusBar backgroundColor={Colors.THEME} barStyle="light-content" />
            <View style={CommonStyles.HeaderContainer}>
                <TouchableOpacity onPress={!!onPressBack ? onPressBack : () => goBack()}>
                    <Image
                        source={imagePaths.HAMBURGER}
                        style={CommonStyles.hamburgerImage}
                    />
                </TouchableOpacity>
                <Text style={CommonStyles.headerText}>{headingText}</Text>
                <Image
                    source={imagePaths.NOTIFICATION}
                    style={CommonStyles.notificationImage}
                />
            </View>
        </View>
    );
};

//make this component available to the app
export default HomeHeaderComp;
