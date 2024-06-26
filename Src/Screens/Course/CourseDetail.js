//import liraries
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image, SafeAreaView, ToastAndroid } from 'react-native';
import { WebView } from 'react-native-webview';
// import {
//     initConnection,
//     endConnection,
//     finishTransaction,
//     flushFailedPurchasesCachedAsPendingAndroid,
//     purchaseUpdatedListener,
//     purchaseErrorListener,
//     getProducts,
//     requestPurchase,
//   } from 'react-native-iap'

import HeaderComp from '../../Components/HeaderComp';
import HomeService from '../../Services/apis/HomeService';
import CommonStyles from '../../Assets/Style/CommonStyle';
import imagePaths from '../../Constants/imagePaths';
import Colors from '../../Constants/Colors';
import navigationStrings from '../../Constants/navigationStrings';
import CustomHelper from '../../Constants/CustomHelper';

// create a component
export const CourseDetail = (props) => {
    const { route, navigation } = props;
    const item = route.params;
    const [isLoading, setIsLoading] = useState(true);
    const [courseDetail, setCourseDetail] = useState([]);
    const [products, setProducts] = useState([]);


    const getCourseDetail = async function (item_id) {
        return await HomeService.get_course_detail({ course_id: item_id })
            .then(async (data) => {
                if (data.status === true) {
                    data = data.data;

                    data.course.price_after_dis = item.price;
                    if (parseInt(data.course.discount_percent) > 0) {
                        data.course.price_after_dis = parseInt(data.course.price) - ((parseFloat(data.course.price) * parseFloat(data.course.discount_percent)) / 100).toFixed();
                    }
                    //console.log(Object.keys(data.course));
                    //console.log(data.short_desc);
                    setCourseDetail(data.course);
                    //console.log(paperDetail.title)
                }

                setIsLoading(false);
                return true;
            })
            .catch((error) => {
                ToastAndroid.show(error.message, 2000);
                return false;
            });
    };

    const navToPlayer = function (item) {
        navigation.navigate(navigationStrings.PLAYER, item);
    }

    useEffect(function () {
        async function fetchData(item_id) {
            // You can await here       
            const response = await getCourseDetail(item_id);
        }
        fetchData(item.id);



        // const initializeConnection = async () => {
        //     try {
        //       await initConnection();
        //       if (Platform.OS === "android") {
        //         await flushFailedPurchasesCachedAsPendingAndroid();
        //       }
        //     } catch (error) {
        //       console.error("An error occurred", error.message);
        //     }
        // }

        // const purchaseUpdate = purchaseUpdatedListener(
        //     async (purchase) => {
        //       const receipt = purchase.transactionReceipt;
      
        //       if (receipt) {
        //         try {
        //           await finishTransaction({ purchase, isConsumable: true });
        //         } catch (error) {
        //           console.error("An error occurred", error.message);
        //         }
        //       }
        // });
      
        // const purchaseError = purchaseErrorListener((error) =>
        //     console.error('Purchase error', error.message));
        // initializeConnection();
        // //purchaseUpdate();
        // //purchaseError();
        // fetchProducts();
        // return () => {
        //     endConnection();
        //     //purchaseUpdate.remove();
        //     //purchaseError.remove();
        // }
    }, [item.id]);

    // const fetchProducts = async () => {
    //     try {
    //       const products = await getProducts({
    //         skus: Platform.select({
    //           ios: ['catcoursealpha2024'],
    //           //android: ['com.rniap.product100', 'com.rniap.product200'],
    //         })
    //       });
    //       console.log(products);
    //       setProducts(products);
    //     } catch (error) {
    //       console.error("Error occurred while fetching products", error.message);
    //     }
    //   };
    //   const makePurchase = async (sku) => {
    //     try {
    //       requestPurchase({ sku })
    //     } catch (error) {
    //       console.error("Error making purchase", error.message);
    //     }
    //   }

    return (
        <>
            {
                isLoading ?
                    (
                        <LoadingComp />
                    )
                    :
                    (
                        <View style={styles.container}>
                            <HeaderComp headerTitle={"Course Details"} />
                            <View>
                                <TouchableOpacity onPress={() => { navToPlayer({ url: courseDetail.promo_video, title: courseDetail.title }) }} >
                                    <ImageBackground source={{ uri: courseDetail.cover_image }} style={{ ...CommonStyles.videoListCardSize, ...{ width: "100%", height: 200 } }} resizeMode="stretch" blurRadius={2}>
                                        <View style={CommonStyles.overlay}>
                                            <Image source={imagePaths.PLAY} style={CommonStyles.playIcon} />
                                        </View>
                                    </ImageBackground>
                                </TouchableOpacity>
                            </View>
                            <View style={{ marginHorizontal: 10, flex: 1 }}>
                                <View style={{ paddingVertical: 10 }}>
                                    <Text style={{ fontSize: 18, fontWeight: "500", color: "black" }}>{courseDetail.title}</Text>
                                </View>
                                <View style={{ backgroundColor: Colors.THEME, paddingVertical: 10, paddingLeft: 10, borderRadius: 30, alignItems: "center" }}>
                                    <Text style={{ color: Colors.WHITE, fontSize: 18, fontWeight: "500" }}>Class Info</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <WebView
                                        key={"shortDesc"}
                                        //originWhitelist={['*']}
                                        source={{ html: CustomHelper.ReadyHTMLForWebView(courseDetail.description) }}
                                        //style={{ flex: 1 }}
                                        //injectedJavaScript={webViewScripts['webView1']}
                                        //onMessage={handleWebViewMessage}
                                        javaScriptEnabled={true}
                                    //injectedJavaScriptBeforeContentLoaded={runBeforeFirst}
                                    />
                                </View>
                                {/* <TouchableOpacity
                                    onPress={() => {
                                        //openLinkInChrome(paperDetail.syllabus_url)
                                    }}
                                    style={{
                                        backgroundColor: Colors.THEME,
                                        marginVertical: 10,
                                        paddingVertical: 10,
                                        paddingHorizontal: 20,
                                        borderRadius: 5,
                                        alignItems: "center"
                                    }}>
                                    <Text style={{ color: Colors.WHITE, fontWeight: "500" }}>Buy Now - {courseDetail.price_after_dis}</Text>
                                </TouchableOpacity> */}
                            </View>
                        </View>
                    )
            }
        </>
    )
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1
    },
});