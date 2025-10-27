//import liraries
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';

import HeaderComp from '../../Components/HeaderComp';
import navigationStrings from '../../Constants/navigationStrings';
import imagePaths from '../../Constants/imagePaths';
import Colors from '../../Constants/Colors';

// create a component
export const ListPastPapers = (props) => {
    const { route, navigation } = props;
    var pastPaperList = route.params;

    pastPaperList = pastPaperList.filter((item, index, self) => self.findIndex(t => t.id === item.id) === index);
    //console.log(pastPaperList.length);

    const navPastPaperDetail = function (item) {
        navigation.navigate(navigationStrings.PAST_PAPER_DETAIL, item);
    }

    return (
        <View style={styles.container}>
            <HeaderComp headerTitle={"Past Paper List"} />
            <View style={{ flex: 1, flexDirection: "row" }}>
                <FlatList
                    data={pastPaperList}
                    numColumns={2}
                    renderItem={({ item , index}) => (
                        <TouchableOpacity onPress={() => navPastPaperDetail(item)} key={index} style={{ borderColor: "#EEEEEE", backgroundColor: "white", borderWidth: 1, borderRadius: 10, marginVertical:2.5,marginHorizontal:2.5, width: "49%" }}>
                            <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", height: 48 }}>
                                <Image source={imagePaths.PAST_PAPER} style={{ height: 32, width: 32, marginHorizontal: 5 }} />
                                <Text style={{color: Colors.TEXT_COLOR}}>{item.title}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{marginHorizontal:5,marginTop:10}}
                />
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
