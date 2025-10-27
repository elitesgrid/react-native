//import liraries
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';

import PortalService from '../../../Services/apis/PortalService';
import HeaderComp from '../../../Components/HeaderComp';
import navigationStrings from '../../../Constants/navigationStrings';
import LoadingComp from '../../../Components/LoadingComp';
import CustomHelper from '../../../Constants/CustomHelper';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../../../Constants/Colors';

// create a component

export const TestSeries3 = props => {
  const {route, navigation} = props;
  const {params} = route;

  const [isLoading, setIsLoading] = useState(true);
  const [testSeries, setTestSeries] = useState([]);
  const [payloadPrevScreen, setPayloadPrevScreen] = useState({});

  const getTestSeries = async function (params) {
    setPayloadPrevScreen(params);
    let payload = {
      page: 1,
      level: 3,
      subject_id: params.subject_id,
      topic_id: params.id,
    };
    if (params.file_id) {
      payload.file_id = params.file_id;
    }
    //console.log(params);
    return await PortalService.get_test_series(payload)
      .then(async data => {
        if (data.status === true) {
          let data1 = data.data;
          //console.log(data1);
          let final_list = [];
          data1.result.forEach(element => {
            //if (data.time <= element.end_date) {
            element.thumbnail =
              element.thumbnail === ''
                ? 'https://elites-grid-prod.s3.ap-south-1.amazonaws.com/global_thumbnails/2339195logo.png'
                : element.thumbnail;
            final_list.push(element);
            //}
          });
          //console.log((final_list));
          setTestSeries(final_list);
        }
        setIsLoading(false);
        return true;
      })
      .catch(error => {
        CustomHelper.showMessage(error.message);
        return false;
      });
  };

  const navToStartTest = function (item) {
    if(global.WEBVIEW_TEST === "1"){
        navigation.navigate(navigationStrings.TEST_WEBVIEW, item);
    } else {
        if(item.internal_type == "View Result"){
            navigation.navigate(navigationStrings.TEST_VIEW_RESULT, item);
        } else if(item.internal_type == "View Rankers"){
            navigation.navigate(navigationStrings.TEST_RANKERS, item);
        } else {
            navigation.navigate(navigationStrings.TEST_INSTRUCTIONS, item);
        }
    }
  };

  useEffect(
    function () {
      const unsubscribe = navigation.addListener('focus', () => {
        setTestSeries([]);
        async function fetchData() {
          // You can await here
          const response = await getTestSeries(params);
          //console.log(response);
        }
        fetchData();
      });
      return unsubscribe;
    },
    [navigation, params],
  );

  return (
    <>
      {isLoading ? (
        <LoadingComp />
      ) : (
        <View style={styles.container}>
          <HeaderComp headerTitle={payloadPrevScreen.title} />
          <FlatList
            data={testSeries}
            numColumns={1}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => {
                // Prepare boolean flags for cleaner rendering logic
                const isCompleted = item.report_id && item.state === '2';
                const isResumable = item.report_id && item.state !== '2';
                const isAttemptable = !item.report_id;
                const showMarks1 = isCompleted && item.res_seq_attempt === '1'; // First Marks format
                const showMarks2 = isCompleted; // Second Marks format
                const showRankers = item.report_id && item.view_rankers_count !== '0';
                const showPractice = isCompleted && item.practice === '0';

                return (
                    <View style={styles.cardContainer}>
                        <View style={styles.cardContent}>
                            
                            {/* --- 1. Thumbnail and Title --- */}
                            <View style={styles.cardHeader}>
                                <Image
                                    resizeMode="stretch"
                                    source={{ uri: item.thumbnail }}
                                    style={styles.thumbnail}
                                />
                                <View style={styles.titleMetaContainer}>
                                    <Text style={styles.testTitle}>
                                        {item.title}
                                    </Text>
                                    <Text style={styles.testDescription} numberOfLines={1}>
                                        {'Desc: ' + item.description}
                                    </Text>
                                </View>
                            </View>

                            {/* --- 2. Metadata Block (Questions | Time) --- */}
                            <View style={styles.metaContainer}>
                                <Text style={styles.testMeta}>
                                    {'Questions: ' + item.total_questions}
                                </Text>
                                <Text style={styles.testMeta}>
                                    {'Time: ' + CustomHelper.secFormat(parseInt(item.length) * 60)}
                                </Text>
                            </View>

                            {
                                (showMarks1 || showMarks2) && 
                                <View style={styles.marksContainer}>
                                    {showMarks1 && (
                                        <Text style={styles.testAttemptMarksLabel}>
                                            {/* Note: This line seems redundant with the one below but is preserved from the original logic */}
                                            {'Marks: ' + item.marks} 
                                        </Text>
                                    )}
                                    {showMarks2 && (
                                        <Text style={styles.testAttemptMarksLabel}>
                                            {'Marks: ' + item.marks + '/' + item.total_marks}
                                        </Text>
                                    )}
                                </View>
                            }

                            {/* --- 4. Action Buttons --- */}
                            <View style={styles.buttonRow}>
                                
                                {/* 4a. View Result Button */}
                                {isCompleted && (
                                    <LinearGradient
                                        colors={['#37B6F1', '#0274BA']}
                                        style={styles.actionButtonGradient}>
                                        <TouchableOpacity onPress={() => navToStartTest({...item, internal_type: 'View Result'})}>
                                            <Text style={styles.actionButtonText}>{'View Result'}</Text>
                                        </TouchableOpacity>
                                    </LinearGradient>
                                )}

                                {/* 4b. Resume Button */}
                                {isResumable && (
                                    <LinearGradient
                                        colors={['#37B6F1', '#0274BA']}
                                        style={styles.actionButtonGradient}>
                                        <TouchableOpacity onPress={() => navToStartTest({...item, internal_type: 'Resume Test'})}>
                                            <Text style={styles.actionButtonText}>{'Resume'}</Text>
                                        </TouchableOpacity>
                                    </LinearGradient>
                                )}

                                {/* 4c. Attempt Now Button */}
                                {isAttemptable && (
                                    <LinearGradient
                                        colors={['#37B6F1', '#0274BA']}
                                        style={styles.actionButtonGradient}>
                                        <TouchableOpacity onPress={() => navToStartTest({...item, internal_type: 'Start Test'})}>
                                            <Text style={styles.actionButtonText}>{'Attempt Now'}</Text>
                                        </TouchableOpacity>
                                    </LinearGradient>
                                )}
                                
                                {/* 4d. View Rankers Button */}
                                {showRankers && (
                                    <LinearGradient
                                        colors={['#37B6F1', '#0274BA']}
                                        style={styles.actionButtonGradient}>
                                        <TouchableOpacity onPress={() => navToStartTest({...item, internal_type: 'View Rankers'})}>
                                            <Text style={styles.actionButtonText}>{'View Rankers'}</Text>
                                        </TouchableOpacity>
                                    </LinearGradient>
                                )}

                                {/* 4e. Practice Button */}
                                {showPractice && (
                                    <LinearGradient
                                        colors={['#37B6F1', '#0274BA']}
                                        style={styles.actionButtonGradient}>
                                        <TouchableOpacity onPress={() => navToStartTest({...item, internal_type: 'Start Practice'})}>
                                            <Text style={styles.actionButtonText}>{'Practice'}</Text>
                                        </TouchableOpacity>
                                    </LinearGradient>
                                )}
                            </View>

                        </View>
                    </View>
                );
            }}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.flatListContent}
        />
        </View>
      )}
    </>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatListContent: {
        marginHorizontal: 10,
        marginTop: 10,
        paddingBottom: 20,
    },
    cardContainer: {
        marginBottom: 15,
        borderRadius: 12,
        backgroundColor: Colors.WHITE || '#FFFFFF',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 6,
    },
    cardContent: {
        padding: 15,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.BORDER_COLOR || '#E0E0E0',
        paddingBottom: 10,
    },
    thumbnail: {
        height: 50,
        width: 50,
        borderRadius: 8,
        marginRight: 10,
    },
    titleMetaContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    testTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.DARK || '#333333',
        marginBottom: 2,
    },
    testDescription: {
        fontSize: 12,
        color: Colors.GRAY || '#757575',
        marginTop: 2,
    },
    metaContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        flexWrap: 'wrap',
        marginBottom: 10,
    },
    testMeta: {
        fontSize: 12,
        color: Colors.TEXT || '#555555',
        marginRight: 15,
        fontWeight: '500',
    },
    marksContainer: {
        marginBottom: 10,
    },
    testAttemptMarksLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.SUCCESS || '#4CAF50',
    },
    buttonRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        marginTop: 10,
        gap: 8,
    },
    actionButtonGradient: {
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 6,
        minWidth: 90,
    },
    actionButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.WHITE,
        textAlign: 'center',
    },
});
