//import liraries
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Pressable } from 'react-native';

import HeaderComp from '../../Components/HeaderComp';
import LoadingComp from '../../Components/LoadingComp';
import CommonStyles from '../../Assets/Style/CommonStyle';
import navigationStrings from '../../Constants/navigationStrings';
import imagePaths from '../../Constants/imagePaths';


// create a component
export const ListCourses = (props) => {
    const { route, navigation } = props;
    var courseList = route.params;

    console.log(courseList.length);

    const navCourseDetail = function (item) {
        navigation.navigate(navigationStrings.COURSE_DETAIL, item);
    }

    return (
        <View style={styles.container}>
            <HeaderComp headerTitle={"Course List"} />
            <View style={{ flex: 1 }}>
                <ScrollView>
                    {courseList.map((item, index) => {
                        let price_after_dis = item.price;
                        if (parseInt(item.discount_percent) > 0) {
                            price_after_dis = parseInt(item.price) - ((parseFloat(item.price) * parseFloat(item.discount_percent)) / 100).toFixed();
                        }
                        return (<TouchableOpacity onPress={() => { navCourseDetail(item) }} key={index} style={{ ...CommonStyles.courseListCard, ...{ marginVertical: 5 } }}>
                            <View style={{ ...CommonStyles.courseListCardSize, ...{ width: "100%", height: 303 } }}>
                                <View>
                                    <Image style={{ ...CommonStyles.courseListCardImage, ...{ width: "100%", height: 200 } }} source={{ uri: item.thumbnail }} />
                                </View>
                                <View style={CommonStyles.CourseListInfo}>
                                    <View style={CommonStyles.courseListCardTitleContainer}>
                                        <Text style={CommonStyles.Title}>{item.title}</Text>
                                    </View>
                                    {/* <View>
                      <Text style={CommonStyles.Tag}>By Vikram Sharma</Text>
                    </View>
                    <View style={CommonStyles.flexRow}>
                      <View style={CommonStyles.flexRowItemCenter}>
                        <Image source={imagePaths.PEOPLE_COUNT} style={CommonStyles.CourseListIconStyle} />
                        <Text style={{color: Colors.TEXT_COLOR}}>15K</Text>
                      </View>
                      <View style={CommonStyles.flexRowItemCenter}>
                        <Image source={imagePaths.STAR} style={CommonStyles.CourseListIconStyle} />
                        <Tex style={{color: Colors.TEXT_COLOR}}t>15K</Text>
                      </View>
                    </View> */}
                                    <View style={CommonStyles.CourseListPriceSection}>
                                        <View>
                                            <Text style={CommonStyles.CourseListPrice}>₹ {price_after_dis}</Text>
                                        </View>
                                        <View>
                                            <Text style={CommonStyles.CourseListStrikePrice}>₹ {item.price}</Text>
                                        </View>
                                        <View style={CommonStyles.mr_5}>
                                            <Pressable onPress={() => { navCourseDetail(item) }} style={CommonStyles.CourseListDetailButton}>
                                                <Text style={CommonStyles.btnColor}>{"View Detail"}</Text>
                                            </Pressable>
                                        </View>
                                    </View>
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
