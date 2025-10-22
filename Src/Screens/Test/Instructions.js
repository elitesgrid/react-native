//import liraries
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import HeaderComp from '../../Components/HeaderComp';
import Colors from '../../Constants/Colors';
import imagePaths from '../../Constants/imagePaths';
import TestServices from '../../Services/apis/TestServices';
import navigationStrings from '../../Constants/navigationStrings';
import LoadingComp from '../../Components/LoadingComp';

// create a component
export const Instructions = (props) => {
  const { route, navigation } = props;
  const { params } = route;

  const [isLoading, setIsLoading] = useState(true);
  const [testSeries, setTestSeries] = useState({});
  const [accepted, setAccepted] = useState(false);

  const startTest = (item) => {
    if (!accepted) {
      Alert.alert('Notice', 'Please accept the Terms & Conditions before starting the test.');
      return;
    }
    navigation.navigate(navigationStrings.TEST_ATTEMPT, item);
  };

  async function getTestInstructions(params) {
    let payload = {
      test_id: params.id,
      type: 0,
    };
    return await TestServices.get_instructions(payload)
      .then(async (data) => {
        setIsLoading(false);
        if (data.status === true) {
          data = data.data;
          delete data.questions[0].questions
          setTestSeries(data);
        }
        return true;
      })
      .catch((error) => {
        Alert.alert('Error!', error.message);
        return false;
      });
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setTestSeries({});
      async function fetchData() {
        await getTestInstructions(params);
      }
      fetchData();
    });
    return unsubscribe;
  }, [navigation, params]);

  if (isLoading) return <LoadingComp />;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.BACKGROUND }}>
      <HeaderComp headerTitle={params.title || 'Test Instructions'} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 30,
        }}
      >
        {/* Test Summary Card */}
        <LinearGradient
          colors={['#0569b4', '#099bdc']}
          style={{
            borderRadius: 12,
            padding: 18,
            marginTop: 15,
            shadowColor: '#000',
            shadowOpacity: 0.15,
            shadowOffset: { width: 0, height: 3 },
            shadowRadius: 5,
            elevation: 4,
          }}
        >
          <Text style={{ color: Colors.WHITE, fontSize: 18, fontWeight: '700' }}>
            {testSeries?.result?.title || 'Mock Test'}
          </Text>
          <Text style={{ color: Colors.WHITE, marginTop: 5, fontSize: 14 }}>
            {testSeries?.result?.description.trim() || ''}
          </Text>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 10,
            }}
          >
            <Text style={{ color: Colors.WHITE }}>
              🕒 Duration: {testSeries?.sections?.[0]?.section_timing || 0} mins
            </Text>
            <Text style={{ color: Colors.WHITE }}>
              ❓ Questions: {testSeries?.result?.total_questions || 0}
            </Text>
          </View>
        </LinearGradient>

        {/* Sections Overview */}
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: Colors.THEME,
            marginTop: 25,
          }}
        >
          Section Overview
        </Text>

        {testSeries?.questions?.map((section, index) => (
            <View
                key={index}
                style={{
                    backgroundColor: Colors.WHITE,
                    borderRadius: 12,
                    padding: 16,
                    marginVertical: 10,
                    borderWidth: 1,
                    borderColor: '#E5E8EB',
                    shadowColor: '#000',
                    shadowOffset: {width: 0, height: 2},
                    shadowOpacity: 0.1,
                    shadowRadius: 3,
                    elevation: 3,
                }}>
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                      <Text
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          style={{
                            flex: 1,
                            fontSize: 16,
                            fontWeight: '700',
                            color: Colors.THEME,
                            marginRight: 10,
                          }}>
                          {section.subject}
                      </Text>
                      <View
                          style={{
                            backgroundColor: Colors.THEME,
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 20,
                          }}>
                          <Text style={{color: Colors.WHITE, fontSize: 12}}>
                          {section.no_of_questions} Qs
                          </Text>
                      </View>
                  </View>

                  <View style={{marginTop: 10}}>
                    <View style={{flexDirection: 'row', marginBottom: 4}}>
                        <Text style={{color: Colors.TEXT, flex: 1}}>
                        ⏱️ Section Timing:
                        </Text>
                        <Text style={{color: Colors.BLACK, fontWeight: '600'}}>
                        {section.section_timing} mins
                        </Text>
                    </View>

                    <View style={{flexDirection: 'row', marginBottom: 4}}>
                        <Text style={{color: Colors.TEXT, flex: 1}}>
                        🏁 Marks per Question:
                        </Text>
                        <Text style={{color: Colors.BLACK, fontWeight: '600'}}>
                        {section.marks_per_question}
                        </Text>
                    </View>

                    <View style={{flexDirection: 'row', marginBottom: 4}}>
                        <Text style={{color: Colors.TEXT, flex: 1}}>
                        📘 Total Questions:
                        </Text>
                        <Text style={{color: Colors.BLACK, fontWeight: '600'}}>
                        {section.no_of_questions}
                        </Text>
                    </View>
                </View>
            </View>
        ))}

        {/* Instructions */}
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: Colors.THEME,
            marginTop: 25,
          }}
        >
          General Instructions
        </Text>

        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 16,
            marginTop: 10,
            borderWidth: 1,
            borderColor: '#e0e0e0',
          }}
        >
          {[
            'You will be provided with one section at a time.',
            'You will be taken to the next section once you submit the current section.',
            'Once a section is submitted, it cannot be reopened.',
            'The positive and negative marks for each question are mentioned.',
            'Negative marking for unattempted questions',
            'Use Next and Previous buttons to navigate.',
            'You can bookmark any question for later review.',
            'There is no negative marking for unattempted questions.',
            'Submit the test anytime using the Submit button.',
          ].map((point, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                marginVertical: 5,
              }}
            >
              <Image
                source={imagePaths.TEST_INSTRUCTION_CHECK}
                style={{
                  width: 18,
                  height: 18,
                  tintColor: Colors.THEME,
                  marginTop: 3,
                }}
              />
              <Text
                style={{
                  color: Colors.TEXT,
                  flex: 1,
                  marginLeft: 8,
                  fontSize: 14,
                  lineHeight: 20,
                }}
              >
                {point}
              </Text>
            </View>
          ))}
        </View>

        {/* Terms and Conditions */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 25,
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 12,
            borderWidth: 1,
            borderColor: '#e0e0e0',
          }}
        >
          <TouchableOpacity
            onPress={() => setAccepted(!accepted)}
            style={{
              width: 22,
              height: 22,
              borderWidth: 1.5,
              borderColor: Colors.THEME,
              borderRadius: 4,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: accepted ? Colors.THEME : '#fff',
            }}
          >
            {accepted && (
              <Image
                source={imagePaths.TEST_INSTRUCTION_CHECK}
                style={{
                  width: 14,
                  height: 14,
                  tintColor: Colors.WHITE,
                }}
              />
            )}
          </TouchableOpacity>

          <Text
            style={{
              color: Colors.TEXT,
              marginLeft: 10,
              fontSize: 14,
              flex: 1,
            }}
          >
            I have read and understood all the instructions and agree to the terms &
            conditions.
          </Text>
        </View>

        {/* Start Test Button */}
        <TouchableOpacity
          disabled={!accepted}
          onPress={() => startTest(params)}
          style={{
            backgroundColor: accepted ? Colors.THEME : '#ccc',
            marginTop: 20,
            // marginBottom: 20,
            paddingVertical: 14,
            borderRadius: 8,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 5,
            elevation: 4,
          }}
        >
          <Text
            style={{
              color: Colors.WHITE,
              fontWeight: '600',
              fontSize: 16,
            }}
          >
            Start Test
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};