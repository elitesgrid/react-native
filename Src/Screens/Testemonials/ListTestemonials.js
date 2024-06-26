//import liraries
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ImageBackground } from 'react-native';

import HeaderComp from '../../Components/HeaderComp';
import CommonStyles from '../../Assets/Style/CommonStyle';
import imagePaths from '../../Constants/imagePaths';
import Colors from '../../Constants/Colors';

// create a component
export const ListTestemonials = (props) => {
    const { route, navigation } = props;
    var testimonial = route.params;

    //console.log(testimonial.length);

    return (
        <View style={styles.container}>
            <HeaderComp headerTitle={"Our Student Expressions"} />
            <View style={{ flex: 1 }}>
                <ScrollView>
                    {testimonial.map((item, index) => {
                        return (<TouchableOpacity key={index} style={{...CommonStyles.reviewListCard,...{marginTop:10}}}>
                            <View style={{...CommonStyles.reviewListCardSize,...{width:"98%"}}}>
                                <View style={{ flex: 0.2, flexDirection: "row", position: "relative" }}>
                                    <View style={{ flex: 0.2, justifyContent: "center", alignItems: "center" }}>
                                        <Image source={{ uri: item.image }} style={[CommonStyles.playIcon, { borderRadius: 50, borderColor: Colors.BLACK, borderWidth: 1 }]} />
                                    </View>
                                    <View style={{ flex: 0.8 }}>
                                        <View>
                                            <Text style={[CommonStyles.sectionHeaderTitle, { fontWeight: "500", fontSize: 14 }]}>{(item.title.substring(0, 30)) + "..."}</Text>
                                        </View>
                                        <View>
                                            <Text>Student</Text>
                                        </View>
                                        <View style={{ flex: 1, flexDirection: "row" }}>
                                            <Image style={{ marginLeft: 5 }} source={imagePaths.STAR} />
                                            <Image style={{ marginLeft: 5 }} source={imagePaths.STAR} />
                                            <Image style={{ marginLeft: 5 }} source={imagePaths.STAR} />
                                            <Image style={{ marginLeft: 5 }} source={imagePaths.STAR} />
                                            <Image style={{ marginLeft: 5 }} source={imagePaths.STAR} />
                                        </View>
                                    </View>
                                </View>
                                <View style={{ position: "relative", flex: 0.8 }}>
                                    <ScrollView contentContainerStyle={{ flexGrow: 1, marginTop: 25 }}>
                                        <Text style={{}}>{item.description}</Text>
                                    </ScrollView>
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
