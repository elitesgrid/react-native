//import liraries
import React, { useEffect, useState, useRef } from 'react';
import { View,
    Text,
    ScrollView,
    useWindowDimensions,
    Image,
    TouchableOpacity,
    SafeAreaView,
    Alert,
    StyleSheet,
    TextInput,
    ImageBackground
} from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';

import TestHeaderComp from '../../Components/TestHeaderComp';
import Colors from '../../Constants/Colors';
import TestSeriesStyle from '../../Assets/Style/TestSeriesStyle';
import imagePaths from '../../Constants/imagePaths';
import TestServices from '../../Services/apis/TestServices';
import CustomHelper from '../../Constants/CustomHelper';
import HeaderComp from '../../Components/HeaderComp';

import { TimeAnalysis } from './TestResulComp/TimeAnalysis';
import { DifficultyAnalysis } from './TestResulComp/DifficultyAnalysis';
import { ScoreCard } from './TestResulComp/ScoreCard';

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
        time_analysis: () => <TimeAnalysis navigation={navigation} resultData={resultData}/>
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
    const [routes] = React.useState([
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
            } else {
                setIsLoading(false);
            }
            return true;
        }).catch((error) => {
            Alert.alert('Error!', error.message);
            return false;
        });
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
                        <HeaderComp headerTitle={"Test Result"} />
                        <TabView
                            navigation={navigation}
                            navigationState={{ index, routes }}
                            renderScene={renderScene}
                            onIndexChange={setIndex}
                            renderTabBar={renderTabBar}
                            initialLayout={{ width: layout.width,backgroundColor:Colors.THEME }}
                            lazyPreloadDistance={1}
                        />
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