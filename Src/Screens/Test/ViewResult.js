//import liraries
import React, { useEffect, useState } from 'react';
import { View,
    Text,
    useWindowDimensions,
    TouchableOpacity,
    Alert,
    StyleSheet,
} from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';

import Colors from '../../Constants/Colors';
import TestServices from '../../Services/apis/TestServices';
import HeaderComp from '../../Components/HeaderComp';

import { TimeAnalysis } from './TestResulComp/TimeAnalysis';
import { DifficultyAnalysis } from './TestResulComp/DifficultyAnalysis';
import { ScoreCard } from './TestResulComp/ScoreCard';
import navigationStrings from '../../Constants/navigationStrings';
import CustomHelper from '../../Constants/CustomHelper';
import { TestToppersList } from './TestResulComp/TestToppersList';

// create a component
export const ViewResult = (props) => {
    const { route, navigation } = props;
    const { params } = route;
    const layout = useWindowDimensions();
    const [isLoading, setIsLoading] = useState(true);
    const [resultData, setResultData] = useState({});

    const renderScene = SceneMap({
        score_card: () => <ScoreCard navigation={navigation} resultData={resultData} />,
        difficulty_analysis: () => <DifficultyAnalysis navigation={navigation} resultData={resultData}/>,
        time_analysis: () => <TimeAnalysis navigation={navigation} resultData={resultData}/>,
        toppers_analysis: () => <TestToppersList navigation={navigation} testRankers={resultData?.my_progress?.toppers || []}/>
    });

    // Render the tab bar
    const renderTabBar = props => (
        <TabBar
          {...props}
          scrollEnabled
          tabStyle={{ width: 'auto' }}
          indicatorStyle={{ backgroundColor: 'white',height:3 }}
          style={{ backgroundColor: Colors.THEME }}
        />
    );
    
    const [index, setIndex] = React.useState(0);
    const [routes, setRoutes] = React.useState([
        { key: 'score_card', title: 'Score Card' },
        { key: 'difficulty_analysis', title: 'Difficulty Analysis' },
        { key: 'time_analysis', title: 'Time Analysis' }
    ]);

    
    async function getTestResult() {
        let payload = {
            test_id: params.id,
            result_id: params.report_id,
            type: 0
        }
        return await TestServices.get_test_result(payload).then(async (data) => {
            if (data.status === true) {
                data = data.data;
                setResultData(data);
                setIsLoading(false);

                let toppersList = data?.my_progress?.toppers || [];
                console.log(toppersList);
                setRoutes(prev => {
                    const alreadyExists = prev.some(r => r.key === 'toppers_analysis');
                    if (alreadyExists) return prev;

                    return [
                        ...prev,
                        ...(toppersList.length > 0
                        ? [{ key: 'toppers_analysis', title: 'Toppers List' }]
                        : []),
                    ];
                });
            } else {
                setIsLoading(false);
            }
            return true;
        }).catch((error) => {
            CustomHelper.showMessage(error.message);
            return false;
        });
    }

    const navToViewSolution = function () {
        navigation.navigate(navigationStrings.TEST_VIEW_SOLUTION, resultData);
    }

    useEffect(function () {
        // const unsubscribe = navigation.addListener('focus', () => {
            getTestResult();
        // });
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
                    <View style={{ flex: 1 }}>
                        <HeaderComp headerTitle={params.title || "Test Result"} />
                        <TabView
                            navigation={navigation}
                            navigationState={{ index, routes }}
                            renderScene={renderScene}
                            onIndexChange={setIndex}
                            renderTabBar={renderTabBar}
                            initialLayout={{ width: layout.width,backgroundColor:Colors.THEME }}
                            lazyPreloadDistance={1}
                        />
                        <View
                            style={{
                            paddingHorizontal: 20,
                            paddingBottom: 20,
                            paddingTop: 10,
                            backgroundColor: Colors.WHITE,
                            borderTopWidth: 1,
                            borderTopColor: Colors.LIGHT_GRAY,
                            }}
                        >
                            <TouchableOpacity
                            style={{
                                backgroundColor: Colors.THEME,
                                paddingVertical: 14,
                                borderRadius: 30,
                            }}
                            onPress={() => navToViewSolution()}
                            >
                            <Text
                                style={{
                                color: Colors.WHITE,
                                fontSize: 16,
                                fontWeight: '600',
                                textAlign: 'center',
                                }}
                            >
                                View Solution
                            </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )
            }
        </>
    );
};


const styles = StyleSheet.create({
  palleteRow:{
    flex:1,
    flexDirection:"row"
  },
});