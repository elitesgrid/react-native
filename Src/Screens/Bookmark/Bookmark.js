import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  useWindowDimensions,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  SafeAreaView,
} from 'react-native';

import Styles from '../../Assets/Style/LoginStyle';
import HeaderComp from '../../Components/HeaderComp';
import imagePaths from '../../Constants/imagePaths';
import HTML from 'react-native-render-html';

import navigationStrings from '../../Constants/navigationStrings';
import Colors from '../../Constants/Colors';
import TestServices from '../../Services/apis/TestServices';
import CustomHelper from '../../Constants/CustomHelper';
import ConfirmationPopup from '../../Constants/ConfirmationPopup';
import LoadingComp from '../../Components/LoadingComp';
import NoDataFound from '../../Components/NoDataFound';
import { useConfirmDialog } from '../../Components/ConfirmDialogContext';

export const Bookmark = props => {
  const {navigation} = props;
  const [totalNumbers, setTotalNumbers] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [questionsList, setQuestionList] = useState([]);
  const [activeQuestion, setActiveQuestion] = useState({});
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(-1);
  const {width: windowWidth} = useWindowDimensions();
  const [activeFilterTab, setActiveFilterTab] = useState('0');
  const {showConfirmDialog} = useConfirmDialog();

  const loadQuestion = index => {
    setActiveIndex(index);
    setCorrectAnswerIndex(-1);
    let que_list = questionsList;
    //console.log(index, que_list);
    setActiveQuestion(que_list[index]);
  };

  async function fetchData() {
    console.log({
      bookmark_type: activeFilterTab,
    });
    return await TestServices.get_bookmarked_question({
      bookmark_type: activeFilterTab,
    })
      .then(async data => {
        setIsLoading(false);
        data = data.data;
        // console.log(data);
        setTotalNumbers(data.length);
        setQuestionList(data);

        return true;
      })
      .catch(error => {
        Alert.alert('Error!', error.message);
        return false;
      });
  }

  const navToPlayer = function (item) {
    if (item.url) {
      navigation.navigate(navigationStrings.PLAYER, item);
    } else {
      Alert.alert('Error!', 'Please enter URL.' + item.url);
    }
  };

  const removeBookmark = async function (item) {
    showConfirmDialog({
      title: 'Elites Grid',
      message: 'Are you sure want to remove question from bookmark?',
      onConfirm: () => {
        TestServices.remove_bookmarked_question({
          test_id: 0,
          q_id: item.id,
          type: 0,
        }).then(async data => {
          setIsLoading(false);
          if (data.status === true) {
            const updatedQuestionsList = questionsList.filter(
              (_, i) => i !== activeIndex,
            );
            setQuestionList(updatedQuestionsList);
            setTotalNumbers(updatedQuestionsList.length);
          }
          return true;
        }).catch(error => {
          Alert.alert('Error!', error.message);
          return false;
        });
      },
    });
  };

  useEffect(
    function () {
      if (activeIndex === 0) {
        //console.log('Called 3');
        loadQuestion(0);
      } else {
        if (questionsList.length - 1 <= activeIndex) {
          //console.log('Called 1');
          loadQuestion(questionsList.length - 1);
        } else {
          //console.log('Called 2');
          loadQuestion(activeIndex);
        }
      }
    },
    [questionsList],
  );

  useEffect(function () {
    fetchData();
  }, []);

  useEffect(
    function () {
      console.log('API Called');
      fetchData();
    },
    [activeFilterTab],
  );

  return (
  <View style={{flex: 1, backgroundColor: Colors.BACKGROUND}}>
    <HeaderComp headerTitle={'Bookmarked Questions'} />
    {isLoading || (!activeQuestion && questionsList.length > 0) ? (
      <LoadingComp />
    ) : (
      <View style={{flex: 1}}>
        {/* Filter Tabs */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            backgroundColor: Colors.THEME,
            borderBottomWidth: 1,
            borderColor: Colors.WHITE,
          }}>
          {global.BOOKMARK_FILTERS.map((_, index) => (
            <TouchableOpacity
              onPress={() => setActiveFilterTab(_.key)}
              key={index}
              style={{
                width: `${100 / global.BOOKMARK_FILTERS.length}%`,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 10,
                borderBottomWidth: 3,
                borderColor:
                  activeFilterTab == _.key ? Colors.WHITE : Colors.THEME,
              }}>
              <Text
                style={{
                  color:
                    activeFilterTab == _.key
                      ? Colors.WHITE
                      : Colors.BACKGROUND,
                  fontSize: 14,
                  fontWeight: '500',
                }}>
                {_.value}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* No Data */}
        {questionsList.length === 0 ? (
          <NoDataFound
            pageTitle={'No Bookmarked Question Found'}
            imageUrl={imagePaths.DELETE}
          />
        ) : (
          <>
            {/* Question Pagination */}
            <View
              style={{
                backgroundColor: Colors.WHITE,
                margin: 12,
                padding: 10,
                borderRadius: 12,
                borderColor: '#E0E0E0',
                borderWidth: 1,
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowOffset: {width: 0, height: 1},
                shadowRadius: 3,
                elevation: 2,
              }}>
              <Text
                style={{
                  color: Colors.BLACK,
                  fontSize: 15,
                  fontWeight: '500',
                  marginBottom: 5,
                }}>
                How to read difficulty analysis
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{paddingVertical: 5}}>
                {Array.from({length: totalNumbers}).map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => loadQuestion(index)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor:
                        activeIndex == index ? Colors.THEME : Colors.WHITE,
                      borderWidth: 1,
                      borderColor:
                        activeIndex == index ? Colors.THEME : '#E0E0E0',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 6,
                    }}>
                    <Text
                      style={{
                        color:
                          activeIndex == index ? Colors.WHITE : Colors.BLACK,
                        fontSize: 13,
                        fontWeight: '500',
                      }}>
                      {index + 1}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Main Question Card */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{
                flex: activeQuestion.video ? 0.73 : 0.81,
                paddingBottom: 15,
              }}>
              <View
                style={{
                  backgroundColor: Colors.WHITE,
                  marginHorizontal: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#E0E0E0',
                  padding: 12,
                  shadowColor: '#000',
                  shadowOpacity: 0.08,
                  shadowOffset: {width: 0, height: 1},
                  shadowRadius: 3,
                  elevation: 1,
                }}>
                {/* Test Name Tag */}
                <View
                  style={{
                    alignSelf: 'center',
                    backgroundColor: Colors.THEME,
                    borderRadius: 15,
                    paddingHorizontal: 10,
                    paddingVertical: 3,
                    marginBottom: 10,
                  }}>
                  <Text style={{color: Colors.WHITE, fontSize: 12}}>
                    {activeQuestion.test_name}
                  </Text>
                </View>

                {/* Top Row */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 5,
                  }}>
                  <Text
                    style={{
                      backgroundColor: 'rgba(2,116,186,0.1)',
                      color: Colors.THEME,
                      borderRadius: 6,
                      fontSize: 11,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                    }}>
                    {'Question: ' + (activeIndex + 1)}
                  </Text>

                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text
                      style={{
                        color: activeQuestion.answer
                          ? Colors.SUCCESS
                          : Colors.WARNING,
                        backgroundColor: CustomHelper.hexToRgba(
                          activeQuestion.answer
                            ? Colors.SUCCESS
                            : Colors.WARNING,
                          0.1,
                        ),
                        borderRadius: 6,
                        fontSize: 11,
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        marginRight: 6,
                      }}>
                      {activeQuestion.answer
                        ? 'Attempted'
                        : 'Not Attempted'}
                    </Text>

                    <TouchableOpacity
                      onPress={() =>
                        removeBookmark({
                          id: activeQuestion.id,
                          index: activeIndex,
                        })
                      }
                      style={{
                        backgroundColor: CustomHelper.hexToRgba(
                          Colors.WARNING,
                          0.8,
                        ),
                        borderRadius: 6,
                        padding: 5,
                      }}>
                      <Image
                        source={imagePaths.DELETE}
                        style={{width: 12, height: 14, tintColor: Colors.WHITE}}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Question Content */}
                <HTML
                  contentWidth={windowWidth}
                  source={{html: activeQuestion.question}}
                />

                {/* Options */}
                {Array.from({length: 9}).map(
                  (_, index) =>
                    activeQuestion['option_' + (index + 1)] && (
                      <View
                        key={'numbering_' + index}
                        style={{
                          borderWidth: 1,
                          borderColor: Colors.THEME,
                          borderRadius: 25,
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginTop: 8,
                          paddingVertical: 3,
                          paddingRight: 10,
                        }}>
                        <View
                          style={{
                            height: 30,
                            width: 30,
                            borderRadius: 15,
                            backgroundColor:
                              index + 1 == correctAnswerIndex
                                ? Colors.THEME
                                : '#333',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginLeft: 6,
                          }}>
                          <Text
                            style={{
                              color: Colors.WHITE,
                              fontWeight: '500',
                              fontSize: 13,
                            }}>
                            {String.fromCharCode(65 + index)}
                          </Text>
                        </View>
                        <View style={{flex: 1, marginLeft: 10}}>
                          <HTML
                            contentWidth={windowWidth}
                            source={{
                              html: activeQuestion['option_' + (index + 1)],
                            }}
                          />
                        </View>
                      </View>
                    ),
                )}

                {/* Correct Answer Button */}
                <TouchableOpacity
                  onPress={() =>
                    setCorrectAnswerIndex(activeQuestion.answer)
                  }
                  style={{
                    alignSelf: 'flex-start',
                    marginTop: 12,
                    backgroundColor: Colors.SUCCESS,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                  }}>
                  <Text style={{color: Colors.WHITE, fontWeight: '600'}}>
                    Show Correct Answer
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Footer Buttons */}
            <SafeAreaView
              style={{
                flex: activeQuestion.video ? 0.20 : 0.08,
                backgroundColor: Colors.WHITE,
                paddingVertical: 10,
              }}>
              {activeQuestion.video && (
                <TouchableOpacity
                  onPress={() => navToPlayer({url: activeQuestion.video})}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: Colors.IDLE,
                    borderRadius: 10,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    marginHorizontal: 10,
                    marginBottom: 10,
                  }}>
                  <Image
                    source={imagePaths.DEFAULT_VIDEO}
                    style={{width: 30, height: 30, tintColor: Colors.WHITE}}
                  />
                  <Text
                    style={{
                      color: Colors.WHITE,
                      fontWeight: '600',
                      marginLeft: 10,
                    }}>
                    Video Solution
                  </Text>
                </TouchableOpacity>
              )}

              {/* Back / Next */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginHorizontal: 15,
                }}>
                <TouchableOpacity
                  disabled={!activeIndex}
                  onPress={() => loadQuestion(activeIndex - 1)}
                  style={{flex: 0.45}}>
                  <View
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: 45,
                      backgroundColor: Colors.FADDED_COLOR,
                      borderRadius: 25,
                      opacity: activeIndex ? 1 : 0.6,
                    }}>
                    <Text style={Styles.button_label}>{'Back'}</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={questionsList.length - 1 == activeIndex}
                  onPress={() => loadQuestion(activeIndex + 1)}
                  style={{flex: 0.45}}>
                  <View
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: 45,
                      backgroundColor:
                        questionsList.length - 1 == activeIndex
                          ? '#aacce0'
                          : Colors.THEME,
                      borderRadius: 25,
                      opacity:
                        questionsList.length - 1 == activeIndex ? 0.6 : 1,
                    }}>
                    <Text style={Styles.button_label}>{'Next'}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </>
        )}
      </View>
    )}
  </View>
);
};
