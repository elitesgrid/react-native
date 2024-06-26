//import liraries
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ImageBackground } from 'react-native';

import HeaderComp from '../../Components/HeaderComp';
import LoadingComp from '../../Components/LoadingComp';
import CommonStyles from '../../Assets/Style/CommonStyle';
import navigationStrings from '../../Constants/navigationStrings';
import imagePaths from '../../Constants/imagePaths';


// create a component
export const ListChannelVideos = (props) => {
    const { route, navigation } = props;
    var classes = route.params;

    //console.log(classes.length);

    const navToPlayer = function (item) {
        navigation.navigate(navigationStrings.PLAYER, item);
      }

    return (
        <View style={styles.container}>
            <HeaderComp headerTitle={"Past Paper List"} />
            <View style={{ flex: 1 }}>
                <ScrollView>
                    {classes.map((item, index) => {
                        return (<TouchableOpacity onPress={() => { navToPlayer({ url: item.url, title: item.title }) }} key={index} style={CommonStyles.courseListCard}>
                            <View style={{...CommonStyles.videoListCardSize,...{width:"100%",height:200}}}>
                                <View>
                                    <ImageBackground source={{ uri: item.image }} style={{...CommonStyles.videoListCardSize,...{width:"100%",height:200}}} resizeMode="cover" blurRadius={2}>
                                        <View style={CommonStyles.overlay}>
                                            <Image source={imagePaths.PLAY} style={CommonStyles.playIcon} />
                                        </View>
                                    </ImageBackground>
                                </View>
                            </View>
                        </TouchableOpacity>)
                    })}
                </ScrollView>
            </View>
        </View>
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
