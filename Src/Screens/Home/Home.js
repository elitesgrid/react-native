import React, { useEffect, useState } from 'react';
import { Text, ScrollView, TouchableOpacity, View, Image, ImageBackground, Pressable,Alert, Platform } from 'react-native';
import Styles from '../../Assets/Style/LoginStyle';
import HomeHeaderComp from '../../Components/HomeHeaderComp';
import BannerSlider from './includes/BannerSlider';
import Colors from '../../Constants/Colors';
import CommonStyles from '../../Assets/Style/CommonStyle';

import HomeService from "../../Services/apis/HomeService";
import imagePaths from '../../Constants/imagePaths';
import navigationStrings from '../../Constants/navigationStrings';
import LoadingComp from '../../Components/LoadingComp';


export const Home = (props) => {
  const { navigation } = props;
  const [isLoading, setIsLoading] = useState(true);
  const [bannerList, setBannerList] = useState([]);
  const [pastPaperList, setPastPaperList] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [classes, setClasses] = useState([]);
  const [testimonial, setTestimonial] = useState([]);

  const navPastPaperDetail = function (item) {
    navigation.navigate(navigationStrings.PAST_PAPER_DETAIL, item);
  }

  const navCourseDetail = function (item) {
    navigation.navigate(navigationStrings.COURSE_DETAIL, item);
  }

  const navToPlayer = function (item) {
    navigation.navigate(navigationStrings.PLAYER, item);
  }

  const getHome = async function () {
    return await HomeService.get_home({})
      .then(async (data) => {
        setIsLoading(false);
        if (data.status === true) {
          data = data.data;

          setBannerList(data.home_banners);
          setPastPaperList(data.previous_papers);
          setCourseList(data.courses);
          setClasses(data.classes);
          setTestimonial(data.testimonial);
          //console.log(Object.keys(data));
        }
        return true;
      })
      .catch((error) => {
        Alert.alert('Error!', error.message);
        return false;
      });
  };

  useEffect(function () {
    async function fetchData() {
      // You can await here       
      const response = await getHome();
      console.log(response);
    }
    fetchData();
  }, []);

  let topCategory = [];
  for (let i = 0; i < 3; i++) {
    topCategory.push(

    );
  }

  return (
    <>
      {
        isLoading ?
          (
            <LoadingComp />
          )
          :
          (
            <View style={Styles.container}>
              <HomeHeaderComp onPressBack={() => { navigation.openDrawer(); }} headingText="Home" />
              <ScrollView
                nestedScrollEnabled={true}
                >
                <View>
                  <BannerSlider imagesList={bannerList} />
                </View>
                <View style={{ position: "" }}>
                  <View style={CommonStyles.sectionHeader}>
                    <Text style={CommonStyles.sectionHeaderTitle}>Past Papers</Text>
                    <TouchableOpacity onPress={()=>{navigation.navigate(navigationStrings.LIST_PAST_PAPERS,pastPaperList)}}>
                      <Text style={{ color: Colors.THEME }}>See All</Text>
                    </TouchableOpacity>
                  </View>
                  <View>
                    <ScrollView 
                      horizontal={true}
                      showsHorizontalScrollIndicator={false}
                      >
                      {
                        pastPaperList
                          .filter((item, index, self) => self.findIndex(t => t.id === item.id) === index)
                          .map((item, index) => {
                            return (<TouchableOpacity onPress={() => navPastPaperDetail(item)} key={index} style={{ borderColor: "#EEEEEE", backgroundColor: "white", borderWidth: 1, borderRadius: 10, marginHorizontal: 5, paddingHorizontal: 8 }}>
                              <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", height: 48 }}>
                                <Image source={imagePaths.PAST_PAPER} style={{ height: 32, width: 32, marginHorizontal: 5 }} />
                                <Text style={{color:Colors.DARK}}>{item.title}</Text>
                              </View>
                            </TouchableOpacity>)
                          })
                      }
                    </ScrollView>
                  </View>
                </View>
                {
                  Platform.OS === "android" && <View style={{ position: "" }}>
                    <View style={CommonStyles.sectionHeader}>
                      <Text style={CommonStyles.sectionHeaderTitle}>Popular Courses</Text>
                      <TouchableOpacity onPress={()=>{navigation.navigate(navigationStrings.LIST_COURSES,courseList)}}>
                        <Text style={{ color: Colors.THEME }}>See All</Text>
                      </TouchableOpacity>
                    </View>
                    <View>
                      <ScrollView 
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        >
                        {courseList.map((item, index) => {
                          let price_after_dis = item.price;
                          if (parseInt(item.discount_percent) > 0) {
                            price_after_dis = parseInt(item.price) - ((parseFloat(item.price) * parseFloat(item.discount_percent)) / 100).toFixed();
                          }
                          return (<TouchableOpacity onPress={() => { navCourseDetail(item) }} key={index} style={CommonStyles.courseListCard}>
                            <View style={CommonStyles.courseListCardSize}>
                              <View>
                                <Image style={CommonStyles.courseListCardImage} source={{ uri: item.thumbnail }} />
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
                                    <Text>15K</Text>
                                  </View>
                                  <View style={CommonStyles.flexRowItemCenter}>
                                    <Image source={imagePaths.STAR} style={CommonStyles.CourseListIconStyle} />
                                    <Text>15K</Text>
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
                }
                <View style={{ position: "" }}>
                  <View style={CommonStyles.sectionHeader}>
                    <Text style={CommonStyles.sectionHeaderTitle}>Elitegrid Channel Videos</Text>
                    <TouchableOpacity onPress={()=>{navigation.navigate(navigationStrings.LIST_CHANNEL_VIDEOS,classes)}}>
                      <Text style={{ color: Colors.THEME }}>See All</Text>
                    </TouchableOpacity>
                  </View>
                  <View>
                    <ScrollView 
                      horizontal={true}
                      showsHorizontalScrollIndicator={false}
                      >
                      {classes.map((item, index) => {
                        return (<TouchableOpacity onPress={()=>{navToPlayer({url:item.url,title:item.title})}} key={index} style={CommonStyles.courseListCard}>
                          <View style={CommonStyles.videoListCardSize}>
                            <View>
                              <ImageBackground source={{ uri: item.image }} style={CommonStyles.videoListCardSize} resizeMode="cover" blurRadius={2}>
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
                <View style={{ position: "" }}>
                  <View style={CommonStyles.sectionHeader}>
                    <Text style={CommonStyles.sectionHeaderTitle}>Some Expressions Of Our Students</Text>
                    <TouchableOpacity onPress={()=>{navigation.navigate(navigationStrings.LIST_TESTEMONIALS,testimonial)}}>
                      <Text style={{ color: Colors.THEME }}>See All</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ marginBottom: 20 }}>
                    <ScrollView 
                      nestedScrollEnabled={true}
                      showsHorizontalScrollIndicator={false}
                      horizontal={true}
                      >
                      {testimonial.map((item, index) => {
                        return (<TouchableOpacity key={index} style={CommonStyles.reviewListCard}>
                          <View style={CommonStyles.reviewListCardSize}>
                            <View style={{ flex: 0.2, flexDirection: "row", position: "relative" }}>
                              <View style={{ flex: 0.4, justifyContent: "center", alignItems: "center" }}>
                                <Image source={{ uri: item.image }} style={[CommonStyles.playIcon, { borderRadius: 50, borderColor: Colors.BLACK, borderWidth: 1 }]} />
                              </View>
                              <View style={{ flex: 0.6 }}>
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
                              <ScrollView 
                                contentContainerStyle={{ paddingVertical: 10 }}
                                nestedScrollEnabled={true}
                                showsVerticalScrollIndicator={false}
                                >
                                <Text style={{lineHeight: 18, color: Colors.TAG_COLOR}}>{item.description}</Text>
                              </ScrollView>
                            </View>
                          </View>
                        </TouchableOpacity>)
                      })}
                    </ScrollView>
                  </View>
                </View>
              </ScrollView>
            </View>
          )
      }
    </>
  );
};