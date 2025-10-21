//import liraries
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image,Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import HeaderComp from '../../Components/HeaderComp';
import Colors from '../../Constants/Colors';
import TestSeriesStyle from '../../Assets/Style/TestSeriesStyle';
import imagePaths from '../../Constants/imagePaths';
import TestServices from '../../Services/apis/TestServices';
import navigationStrings from '../../Constants/navigationStrings';

// create a component
export const Instructions = (props) => {
    const { route, navigation } = props;
    const { params } = route;

    const [isLoading, setIsLoading] = useState(true);
    const [testSeries, setTestSeries] = useState({});

    const startTest = function (item) {
        navigation.navigate(navigationStrings.TEST_ATTEMPT, item);
    }


    async function getTestInstructions(params) {
        let payload = {
            test_id: params.id,
            type: 0
        }
        return await TestServices.get_instructions(payload)
            .then(async (data) => {
                setIsLoading(false);
                if (data.status === true) {
                    data = data.data;
                    setTestSeries(data);
                    setIsLoading(false);
                }
                return true;
            })
            .catch((error) => {
                Alert.alert('Error!', error.message);
                return false;
            });
        return [];
    }

    useEffect(function () {
        const unsubscribe = navigation.addListener('focus', () => {
            setTestSeries([]);
            async function fetchData() {
                const response = await getTestInstructions(params);
            }
            fetchData();
        });
        return unsubscribe;
    }, [navigation, params]);

    return (
        <>
            {
                isLoading ?
                    (
                        <LoadingComp />
                    )
                    :
                    (
                        <View style={TestSeriesStyle.container}>
                            <HeaderComp headerTitle={params.title} />
                            <Text style={TestSeriesStyle.instHeading}>INSTRUCTION</Text>
                            <ScrollView>
                                <LinearGradient
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={TestSeriesStyle.instHeadingGradient}
                                    colors={['#0274BA', '#7cb7dbff']}>
                                    <Text style={TestSeriesStyle.instHeadingGradientText}>3 Sections</Text>
                                </LinearGradient>
                                <View style={TestSeriesStyle.container}>
                                    <View style={TestSeriesStyle.instPointTick}>
                                        <Image style={TestSeriesStyle.instPointTickImage} source={imagePaths.TEST_INSTRUCTION_CHECK} />
                                        <Text style={{color: Colors.TEXT}}>You will be provided with one section at a time</Text>
                                    </View>
                                    <View style={TestSeriesStyle.instPointTick}>
                                        <Image style={TestSeriesStyle.instPointTickImage} source={imagePaths.TEST_INSTRUCTION_CHECK} />
                                        <Text style={{color: Colors.TEXT}}>You will be taken to the next section once you submit the current section</Text>
                                    </View>
                                    <View style={TestSeriesStyle.instPointTick}>
                                        <Image style={TestSeriesStyle.instPointTickImage} source={imagePaths.TEST_INSTRUCTION_CHECK} />
                                        <Text style={{color: Colors.TEXT}}>Once you submit the section, you will not be able to go back to it,</Text>
                                    </View>
                                </View>
                                {
                                    Object.keys(testSeries).length > 0 && testSeries.questions.map((item, index) => {
                                        return (
                                            <View
                                                key={"lg" + index}
                                            >
                                                <LinearGradient
                                                    start={{ x: 0, y: 0 }}
                                                    end={{ x: 1, y: 1 }}
                                                    style={TestSeriesStyle.instHeadingGradient}
                                                    colors={['#0274BA', '#7cb7dbff']}>
                                                    <Text style={TestSeriesStyle.instHeadingGradientText}>{item.subject}</Text>
                                                </LinearGradient>
                                                <View style={TestSeriesStyle.container} key={"lv" + index}>
                                                    <View style={TestSeriesStyle.instPointTick}>
                                                        <Image style={TestSeriesStyle.instPointTickImage} source={imagePaths.TEST_INSTRUCTION_CHECK} />
                                                        <Text style={{color: Colors.TEXT}}>{item.questions.length} Questions in {item.section_timing} mins</Text>
                                                    </View>
                                                    <View style={TestSeriesStyle.instPointTick}>
                                                        <Image style={TestSeriesStyle.instPointTickImage} source={imagePaths.TEST_INSTRUCTION_CHECK} />
                                                        <Text style={{color: Colors.TEXT}}>The positive and negative marks for each question are mentioned</Text>
                                                    </View>
                                                    <View style={TestSeriesStyle.instPointTick}>
                                                        <Image style={TestSeriesStyle.instPointTickImage} source={imagePaths.TEST_INSTRUCTION_CHECK} />
                                                        <Text style={{color: Colors.TEXT}}>along with the question</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        )
                                    })
                                }
                                <LinearGradient
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={{ ...TestSeriesStyle.instHeadingGradient, ...{ height: 70 } }}
                                    colors={['#0274BA', '#7cb7dbff']}>
                                    <Text style={TestSeriesStyle.instHeadingGradientText}>Negative marking for unattempted questions</Text>
                                </LinearGradient>
                                <View style={TestSeriesStyle.container}>
                                    <View style={TestSeriesStyle.instPointTick}>
                                        <Image style={TestSeriesStyle.instPointTickImage} source={imagePaths.TEST_INSTRUCTION_CHECK} />
                                        <Text style={{color: Colors.TEXT}}>There is no -ve marking for unattempted questions</Text>
                                    </View>
                                </View>
                                <LinearGradient
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={TestSeriesStyle.instHeadingGradient}
                                    colors={['#0274BA', '#7cb7dbff']}>
                                    <Text style={TestSeriesStyle.instHeadingGradientText}>Selection, Navigate, Bookmark</Text>
                                </LinearGradient>
                                <View style={TestSeriesStyle.container}>
                                    <View style={TestSeriesStyle.instPointTick}>
                                        <Image style={TestSeriesStyle.instPointTickImage} source={imagePaths.TEST_INSTRUCTION_CHECK} />
                                        <Text style={{color: Colors.TEXT}}>Use next and previous buttons to navigate</Text>
                                    </View>
                                    <View style={TestSeriesStyle.instPointTick}>
                                        <Image style={TestSeriesStyle.instPointTickImage} source={imagePaths.TEST_INSTRUCTION_CHECK} />
                                        <Text style={{color: Colors.TEXT}}>You can also use the question numbers provided on the side to move quickly</Text>
                                    </View>
                                    <View style={TestSeriesStyle.instPointTick}>
                                        <Image style={TestSeriesStyle.instPointTickImage} source={imagePaths.TEST_INSTRUCTION_CHECK} />
                                        <Text style={{color: Colors.TEXT}}>You can bookmark any question to visit it later</Text>
                                    </View>
                                    <View style={TestSeriesStyle.instPointTick}>
                                        <Image style={TestSeriesStyle.instPointTickImage} source={imagePaths.TEST_INSTRUCTION_CHECK} />
                                        <Text style={{color: Colors.TEXT}}>Submit the test at anytime using the submit-test button</Text>
                                    </View>
                                </View>
                            </ScrollView>

                            <TouchableOpacity
                                onPress={() => {
                                    startTest(params)
                                }}
                                style={{
                                    backgroundColor: Colors.THEME,
                                    marginTop: 5,
                                    marginBottom: 20,
                                    paddingVertical: 10,
                                    marginHorizontal: 20,
                                    borderRadius: 5,
                                    alignItems: "center"
                                }}>
                                <Text style={{ color: Colors.WHITE, fontWeight: "500" }}>{params.internal_type}</Text>
                            </TouchableOpacity>
                        </View>
                    )
            }
        </>
    );
};