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

export const Bookmark = props => {
  const {navigation} = props;
  const [totalNumbers, setTotalNumbers] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [questionsList, setQuestionList] = useState([]);
  const [activeQuestion, setActiveQuestion] = useState({});
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(-1);
  const {width: windowWidth} = useWindowDimensions();
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [activeFilterTab, setActiveFilterTab] = useState('0');

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

  const removeBookmark = async function () {
    return await TestServices.remove_bookmarked_question({
      test_id: 0,
      q_id: activeQuestion.id,
      type: 0,
    })
      .then(async data => {
        setIsLoading(false);
        if (data.status === true) {
          const updatedQuestionsList = questionsList.filter(
            (_, i) => i !== activeIndex,
          );
          setQuestionList(updatedQuestionsList);
          setTotalNumbers(updatedQuestionsList.length);
        }
        return true;
      })
      .catch(error => {
        Alert.alert('Error!', error.message);
        return false;
      });
  };

  const handleDeleteConfirmation = item => {
    setItemToDelete(item);
    setPopupVisible(true);
  };

  const handleConfirm = async () => {
    setPopupVisible(false);
    await removeBookmark();
    setPopupVisible(false);
  };

  const handleCancel = () => {
    //console.log('User canceled');
    setPopupVisible(false);
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
    <View style={{flex: 1}}>
      <HeaderComp headerTitle={'Bookmarked Questions'} />
      <ConfirmationPopup
        visible={isPopupVisible}
        message="Are you sure you want to delete this item?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
      {isLoading || (!activeQuestion && questionsList.length > 0) ? (
        <LoadingComp />
      ) : (
        <View style={{flex: 1}}>
          <View
            style={{
              flex: 0.062,
              flexDirection: 'row',
              justifyContent: 'space-between',
              backgroundColor: Colors.THEME,
            }}>
            {global.BOOKMARK_FILTERS.map((_, index) => (
              <TouchableOpacity
                onPress={() => setActiveFilterTab(_.key)}
                key={index}
                style={{
                  borderBottomWidth: 4,
                  borderBlockColor:
                    activeFilterTab == _.key ? Colors.WHITE : Colors.THEME,
                  width: '25%',
                  height: 40,
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    color:
                      activeFilterTab == _.key
                        ? Colors.WHITE
                        : Colors.BACKGROUND,
                    fontSize: 15,
                    alignSelf: 'center',
                  }}>
                  {_.value}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {questionsList.length === 0 ? (
            <NoDataFound
              pageTitle={'No Bookmarked Question Found'}
              imageUrl={imagePaths.DELETE}
            />
          ) : (
            <>
              <View
                style={{
                  flex: 0.1,
                  borderWidth: 1,
                  borderColor: '#E4DFDF',
                  shadowColor: '#E4DFDF',
                  backgroundColor: Colors.WHITE,
                  shadowOpacity: 0.8,
                  shadowRadius: 2,
                  shadowOffset: {
                    height: 1,
                    width: 1,
                  },
                  margin: 10,
                  paddingBottom: 15,
                  padding: 8,
                  borderRadius: 10,
                }}>
                <View>
                  <Text
                    style={{
                      marginVertical: 5,
                      color: Colors.BLACK,
                      fontSize: 15,
                      color: Colors.BLACK,
                    }}>
                    How to read difficulty analysis
                  </Text>
                  <View>
                    <ScrollView
                      horizontal={true}
                      showsHorizontalScrollIndicator={false}>
                      {Array.from({length: totalNumbers}).map((_, index) => (
                        <TouchableOpacity
                          onPress={() => loadQuestion(index)}
                          key={index}
                          style={{
                            borderColor: '#E4DFDF',
                            backgroundColor:
                              activeIndex == index
                                ? Colors.THEME
                                : Colors.WHITE,
                            borderWidth: 1,
                            // paddingHorizontal: 9,
                            // paddingVertical: 4,
                            width: 30,
                            height: 30,
                            borderRadius: 15,
                            marginRight: 5,
                            justifyContent: 'center',
                          }}>
                          <Text
                            style={{
                              color:
                                activeIndex === index
                                  ? Colors.WHITE
                                  : Colors.BLACK,
                              fontSize: 12,
                              alignSelf: 'center',
                            }}>
                            {index + 1}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              </View>
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{
                  flex: activeQuestion.video ? 0.73 : 0.81,
                  marginBottom: 10,
                  paddingBottom: 15,
                }}>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: Colors.BACKGROUND,
                    shadowColor: '#E4DFDF',
                    backgroundColor: Colors.WHITE,
                    shadowOpacity: 0.8,
                    shadowRadius: 2,
                    shadowOffset: {
                      height: 1,
                      width: 1,
                    },
                    marginHorizontal: 10,
                    paddingHorizontal: 8,
                    borderRadius: 10,
                    marginTop: 10,
                  }}>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'center',
                      marginTop: -10,
                    }}>
                    <View
                      style={{
                        alignSelf: 'flex-start',
                        borderRadius: 15,
                        backgroundColor: Colors.THEME,
                      }}>
                      <Text
                        style={{
                          color: Colors.WHITE,
                          paddingVertical: 3,
                          paddingHorizontal: 8,
                        }}>
                        {activeQuestion.test_name}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      backgroundColor: Colors.WHITE,
                      borderRadius: 15,
                      marginRight: 5,
                      marginTop: 10,
                    }}>
                    <View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          marginHorizontal: 5,
                        }}>
                        <View
                          style={{
                            backgroundColor: 'rgba(2, 116, 186, 0.1)',
                            alignSelf: 'flex-start',
                            borderRadius: 5,
                          }}>
                          <Text
                            style={{
                              color: Colors.THEME,
                              fontSize: 10,
                              paddingHorizontal: 6,
                              paddingVertical: 3,
                            }}>
                            {'Question: ' + (activeIndex + 1)}
                          </Text>
                        </View>
                        <View style={{flexDirection: 'row'}}>
                          <View style={{borderRadius: 5}}>
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
                                paddingHorizontal: 6,
                                paddingVertical: 3,
                                fontSize: 10,
                              }}>
                              {activeQuestion.answer
                                ? 'Attempted'
                                : 'Not Attempted'}
                            </Text>
                          </View>
                          <TouchableOpacity
                            onPress={() =>
                              handleDeleteConfirmation({
                                id: activeQuestion.id,
                                index: activeIndex,
                              })
                            }
                            style={{
                              backgroundColor: CustomHelper.hexToRgba(
                                Colors.WARNING,
                                0.8,
                              ),
                              borderRadius: 5,
                            }}>
                            <Image
                              style={{
                                width: 10,
                                height: 12,
                                marginVertical: 3,
                                marginHorizontal: 5,
                              }}
                              source={imagePaths.DELETE}></Image>
                          </TouchableOpacity>
                        </View>
                      </View>
                      <View style={{margin: 5}}>
                        <HTML
                          contentWidth={windowWidth}
                          source={{html: activeQuestion.question}}
                        />
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
                                  marginTop: 5,
                                }}>
                                <View
                                  style={{
                                    height: 30,
                                    width: 30,
                                    backgroundColor:
                                      index + 1 == correctAnswerIndex
                                        ? Colors.THEME
                                        : Colors.BLACK,
                                    borderRadius: 30,
                                    justifyContent: 'center',
                                    margin: 5,
                                    // flex: 1,
                                  }}>
                                  <Text
                                    style={{
                                      alignSelf: 'center',
                                      fontSize: 13,
                                      color: Colors.WHITE,
                                      // flex: 0.2,
                                    }}>
                                    {String.fromCharCode(65 + index)}
                                  </Text>
                                </View>
                                <View style={{justifyContent: 'center'}}>
                                  <HTML
                                    style={{flex: 0.8}}
                                    contentWidth={windowWidth}
                                    source={{
                                      html: activeQuestion[
                                        'option_' + (index + 1)
                                      ],
                                    }}></HTML>
                                </View>
                              </View>
                            ),
                        )}
                      </View>
                      <View>
                        <TouchableOpacity
                          onPress={() =>
                            setCorrectAnswerIndex(activeQuestion.answer)
                          }
                          style={{
                            alignItems: 'flex-start',
                            borderRadius: 10,
                          }}>
                          <Text
                            style={{
                              backgroundColor: Colors.SUCCESS,
                              paddingHorizontal: 10,
                              paddingVertical: 5,
                              margin: 10,
                              color: Colors.WHITE,
                            }}>
                            Show Correct Answer
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </ScrollView>

              <SafeAreaView
                style={{
                  flex: activeQuestion.video ? 0.16 : 0.08,
                  backgroundColor: Colors.WHITE,
                }}>
                {activeQuestion.video && (
                  <TouchableOpacity
                    onPress={() => navToPlayer({url: activeQuestion.video})}
                    style={{
                      flexDirection: 'row',
                      flex: 1,
                      paddingVertical: 5,
                      paddingHorizontal: 10,
                      backgroundColor: Colors.IDLE,
                      alignItems: 'center',
                    }}>
                    <Image
                      style={{height: 30, width: 30}}
                      source={imagePaths.DEFAULT_VIDEO}></Image>
                    <Text
                      style={{
                        marginLeft: 10,
                        color: Colors.BLACK,
                        fontWeight: '500',
                      }}>
                      Video Solution
                    </Text>
                  </TouchableOpacity>
                )}
                <View
                  style={{
                    flexDirection: 'row',
                    flex: 1,
                    marginTop: 10,
                    justifyContent: 'space-between',
                    marginHorizontal: 10,
                  }}>
                  <TouchableOpacity
                    disabled={activeIndex ? false : true}
                    style={{flex: 0.35}}
                    onPress={() => loadQuestion(activeIndex - 1)}>
                    <View
                      style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 40,
                        flex: 1,
                        backgroundColor: Colors.FADDED_COLOR,
                        borderRadius: 50,
                      }}>
                      <Text style={Styles.button_label}>{'Back'}</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    disabled={
                      questionsList.length - 1 == activeIndex ? true : false
                    }
                    onPress={() => loadQuestion(activeIndex + 1)}
                    style={{flex: 0.35}}>
                    <View
                      style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 40,
                        flex: 1,
                        backgroundColor: '#0065A4',
                        borderRadius: 50,
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
