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
//import { WebView } from 'react-native-webview';
import MenuDrawer from 'react-native-side-drawer'

import HTML from 'react-native-render-html';

import LinearGradient from 'react-native-linear-gradient';

import TestHeaderComp from '../../Components/TestHeaderComp';
import Colors from '../../Constants/Colors';
import TestSeriesStyle from '../../Assets/Style/TestSeriesStyle';
import imagePaths from '../../Constants/imagePaths';
import TestServices from '../../Services/apis/TestServices';
import CustomHelper from '../../Constants/CustomHelper';
import StorageManager from '../../Services/StorageManager';
import LoadingComp from '../../Components/LoadingComp'; // Assuming this is defined/used
import navigationStrings from '../../Constants/navigationStrings';

function useExamTimer(initialRemainSeconds = 0) {
  const [questionTime, setQuestionTime] = useState(0); // counts UP
  const [remainSeconds, setRemainSeconds] = useState(initialRemainSeconds); // counts DOWN
  const [formattedRemainTime, setFormattedRemainTime] = useState("");
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setQuestionTime(prev => prev + 1);

      setRemainSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    // Optimization: This effect is fine as it uses CustomHelper.secFormat
    // and updates the dependent state (formattedRemainTime)
    setFormattedRemainTime(CustomHelper.secFormat(remainSeconds));
  }, [remainSeconds]);

  return {
    questionTime,
    remainSeconds,
    formattedRemainTime,
    resetQuestionTime: () => setQuestionTime(0),
    setRemainSeconds, //allow changing from outside
    stopTimer: () => clearInterval(intervalRef.current),
  };
}

// create a component
export const AttemptTest = (props) => {
    const { route, navigation } = props;
    const { width: windowWidth } = useWindowDimensions();
    const { params } = route;

    const [isOpen, setIsOpen] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [cusName, setCusName] = useState('');
    const [profileImage, setProfileImage] = useState('');
    const [testFormatRemainTime,setTestFormatRemainTime] = useState("00:00:00");
    const [testSeries, setTestSeries] = useState({});
    const [testSections, setTestSections] = useState([]);
    const [testQuestions, setTestQuestions] = useState([]);
    const [currentQuestions, setCurrentQuestions] = useState({});
    const [currentQuestionsIndex, setCurrentQuestionsIndex] = useState(0);
    const [finalJson, setFinalJson] = useState([]);
    const [resumeSectionId, setResumeSectionId] = useState(0);
    const {
        questionTime,
        remainSeconds,
        formattedRemainTime,
        resetQuestionTime,
        setRemainSeconds, // new
        stopTimer
    } = useExamTimer(0);
    const [fibActiveAnswers, setFibActiveAnswers] = useState(['', '', '', '']);
    const [drawerLegend, setDrawerLegend] = useState([
        { label: "Answered", key: "answered", count: 0 },
        { label: "Not Answered", key: "not_answered", count: 0 },
        { label: "Not Visited", key: "not_visited", count: 0 },
        { label: "Marked for Review", key: "marked_for_review", count: 0 },
        { label: "Answered & Marked for Review", key: "answered_marked_for_review", count: 0 },
    ]);

    useEffect(function(){
        if(remainSeconds > 0){
            setTestFormatRemainTime(formattedRemainTime);
        }
    }, [remainSeconds]);

    async function getSessionData() {
        let session = await StorageManager.get_session();
        if (Object.keys(session).length > 0) {
            setCusName(session.name);
            setProfileImage(session.profile_image);
        }
    }

    async function updateLengend(){
        // FIX: IMMUTABILITY - Create a new drawerLegend array instead of mutating the existing one (dl)
        let localStatesTotal = {
            answered: 0,
            not_answered: 0,
            not_visited: 0,
            marked_for_review: 0,
            answered_marked_for_review: 0
        }
        
        finalJson.forEach(val =>{ // Use finalJson directly
            ++localStatesTotal[val.state];
        });
        
        // Use map to create a new array with updated counts
        const updatedDrawerLegend = drawerLegend.map(val => ({
            ...val,
            count: localStatesTotal[val.key] || 0,
        }));
        
        setDrawerLegend(updatedDrawerLegend); // Set state with the new array
    }

     async function load_question(index) {
        let currentQuestion = testQuestions[index];
        if(!currentQuestion){
            return;
        }

        const userSavedAnswers = finalJson[index]?.answers || [];
        
        if(currentQuestion.question_type === "FIB") {
            if (userSavedAnswers.length > 0) {
                setFibActiveAnswers(userSavedAnswers);
            } else {
                setFibActiveAnswers(['', '', '', '']); 
            }
        } else {
            setFibActiveAnswers(['', '', '', '']); 
        }
        
        const newCurrentQuestion = {
            ...currentQuestion,
            answers: userSavedAnswers,
        }

        setCurrentQuestions(newCurrentQuestion);
        setCurrentQuestionsIndex(index);
        
        resetQuestionTime(finalJson[index]?.spent_time ?? 0); 
        
        if (isOpen) {
            togglePallete();
        }
    }

    function chooseOption(optionIndex){
        let newAnswers;
        if (currentQuestions.question_type == "FIB") {
            // optionIndex is actually the updatedAnswers array from TextInput
            newAnswers = optionIndex; 
        } else {
            // SC/MCQ logic
            newAnswers = ['0', '0', '0', '0'];
            newAnswers[optionIndex] = '1';
        }
        
        // FIX: IMMUTABILITY - Create a new object for currentQuestions update
        const newCurrentQuestions = {
            ...currentQuestions,
            answers: newAnswers
        }
        
        // finalJson update happens in saveAnswer, only update currentQuestions here
        setCurrentQuestions(newCurrentQuestions);
    }

    function chooseSection(secId) {
        const index = testQuestions.findIndex(item => item.section_id === secId);
        load_question(index);
    }

    function clearResponse() {
        const isFIB = currentQuestions.question_type == "FIB";
        const newAnswers = isFIB ? [] : ["0","0","0","0"];
        const newState = "not_answered";

        // FIX: IMMUTABILITY - Update finalJson
        const newFinalJson = finalJson.map((item, index) => {
            if (index === currentQuestionsIndex) {
                return {
                    ...item,
                    answers: newAnswers,
                    state: newState,
                };
            }
            return item;
        });

        // FIX: IMMUTABILITY - Update currentQuestions
        const newCurrentQuestions = {
            ...currentQuestions,
            answers: newAnswers,
        };

        setFinalJson(newFinalJson);
        setCurrentQuestions(newCurrentQuestions);
        
        if (isFIB) {
            // Update the auxiliary state used by TextInput
            setFibActiveAnswers(newAnswers);
        }
        updateLengend(); // Update legend based on new finalJson state
    }

    async function togglePallete(){
        setIsOpen(!isOpen);
    }

    async function saveAnswer(marked = false){
        const givenAnswers = currentQuestions.answers;
        let newState;

        // --- Determine newState ---
        if(currentQuestions.question_type === "FIB") {
            let count = givenAnswers.filter(item => item !== '' && item !== '0').length;
            newState = (count === 0) 
                ? (marked ? 'marked_for_review' : "not_answered")
                : (marked ? 'answered_marked_for_review' : "answered");
        } else {
            // Assuming givenAnswers is an array of "0" or "1"
            const countOfNonZero = givenAnswers.filter(item => item === "1").length;
            if (countOfNonZero === 0) {
                newState = marked ? 'marked_for_review' : "not_answered";
            } else {
                newState = marked ? 'answered_marked_for_review' : "answered";
            }
        }
        
        // FIX: IMMUTABILITY - Update finalJson
        const newFinalJson = finalJson.map((item, index) => {
            if (index === currentQuestionsIndex) {
                return { 
                    ...item, 
                    answers: givenAnswers, 
                    state: newState,
                    spent_time: questionTime, 
                };
            }
            return item;
        });

        setFinalJson(newFinalJson);
        updateLengend();
    }

    const nextQuestion = async function (){
        await saveAnswer(false);
        load_question(currentQuestionsIndex + 1);
    }

    async function markForReviewAndNext(){
        await saveAnswer(true);
        load_question(currentQuestionsIndex + 1);
    }

    const prevQuestion = async function (){
        // saveAnswer is NOT called here in the original flow, so we preserve that.
        load_question(currentQuestionsIndex - 1);
    }

    const submitTest = async function() {
        // ... submitTest logic remains unchanged ...
        let payload = {
            json: JSON.stringify(finalJson),
            time_taken: remainSeconds,
            test_id: params.id,
            section_sequence: resumeSectionId,
            state: 2,
            first_attempt: "1",
            last_question: parseInt(currentQuestionsIndex),
            active_section: currentQuestions.section_id
        }
        TestServices.submit_test_detail(payload).then(async (data) => {
            data = data.data;
            if (data.id) {
                testSeries.report_id = data.id;
                delete testSeries.questions;
                delete testSeries.resume;
                //console.log(testSeries);
                // Assuming navigationStrings.TEST_VIEW_RESULT is available globally
                navigation.replace(navigationStrings.TEST_VIEW_RESULT, testSeries); 
                console.log("Submit Test Success", testSeries);
            }
            console.log("Submit Test", data);
        });
    }

    async function getTestDetail(params) {
        // ... getTestDetail logic remains unchanged ...
        let payload = {
            test_id: params.id,
            type: 0
        }
        return await TestServices.get_test_detail(payload).then(async (data) => {
            if (data.status === true) {
                data = data.data;
                
                let resume_json = data.resume;
                let resume_que_json = [];
                let resume_time_taken = 0;
                if(resume_json){
                     resume_que_json = JSON.parse(resume_json.custom_json);
                     resume_time_taken = resume_json.time_taken;
                     setResumeSectionId(resume_json.active_section);
                }

                setTestSeries(data);

                let sections = [];
                let questions = [];
                let user_answers = [];
                let index = 0;
                let total_sec = remainSeconds;
                data.questions.forEach(element => {
                    element.questions.forEach((que, ind) => {
                        switch(que.question_type) {
                            case "3":
                                element.questions[ind].question_type = "FIB";
                                element.questions[ind].question = que.question.replace('FIB', '')
                                break;
                            case "0":
                                element.questions[ind].question_type = "SC";
                                break;
                            default: // Ensure question_type is set for consistency
                                element.questions[ind].question_type = "MC";
                                break;
                        }

                        let spent_time = 0;
                        let answers = element.questions[ind].question_type === "FIB" ? ['', '', '', ''] : ['0', '0', '0', '0'];
                        let state = "not_visited";
                        
                        let resume_que = resume_que_json.find(item => item.question_id === que.id);
                        if(resume_que) {
                            // Normalize state string
                            state = resume_que.state.replace('-', '_'); 

                            spent_time = parseInt(resume_que.spent_time);
                            answers = resume_que.given_answer;
                        }

                        user_answers.push({
                            que_id:que.id,
                            section_id:que.section_id,
                            index:index,
                            state: state,
                            spent_time: spent_time,
                            answers : answers
                        })
                        ++index;
                    });
                    sections.push({ key: element.id, title: element.subject });
                    questions.push(...element.questions);
                    total_sec += (parseInt(element.section_timing) * 60);
                });
                setFinalJson(user_answers);
                setTestSections(sections);
                setTestQuestions(questions);
                // Ensure initial time is correct
                setRemainSeconds(total_sec - (resume_time_taken || 0)); 
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

    useEffect(function(){
        if(finalJson.length > 0){
            if(resumeSectionId) {
                chooseSection(resumeSectionId);
            } else {
                load_question(0);
            }
        }
    }, [testQuestions, finalJson]) // Added finalJson dependency to ensure it runs after data load

    useEffect(function () {
        // ... setup and cleanup listeners ...

        // const unsubscribe = navigation.addListener('focus', () => {
            setTestSeries({}); // Reset testSeries on focus is questionable, but preserved.
            async function fetchData() {
                await getSessionData();
                const response = await getTestDetail(params);
            }
            fetchData();
        // });

        const blurListener = () => {
            stopTimer()
        };
        // const unsubscribeBlur = navigation.addListener('blur', blurListener);
        // return ()=>{
        //     unsubscribe,
        //     unsubscribeBlur
        // };
        
        // FIX: The original commented-out return statement was invalid syntax.
        // We will stick to the default behavior since the listeners are commented out.

    }, [navigation, params]);

    function pallete_highlighers(type, value, index) {
        // ... pallete_highlighers logic remains unchanged ...
        const config = {
            answered: {
                image: imagePaths.ANSWERED,
                textColor: Colors.WHITE,
                style: TestSeriesStyle.pallete_symblo_card_image,
            },
            not_answered: {
                image: imagePaths.NOT_ANSWERED,
                textColor: Colors.WHITE,
                style: TestSeriesStyle.pallete_symblo_card_image,
            },
            not_visited: {
                image: imagePaths.NOT_VISITED,
                textColor: Colors.BLACK,
                style: TestSeriesStyle.pallete_symblo_card_image,
            },
            marked_for_review: {
                image: imagePaths.MARK_FOR_REVIEW,
                textColor: Colors.WHITE,
                style: TestSeriesStyle.pallete_symblo_card_image,
            },
            answered_marked_for_review: {
                image: imagePaths.ANSWERED_MARK_FOR_REVIEW,
                textColor: Colors.WHITE,
                style: styles.answeredMarkedForReviewStyle, // Use new style
            },
        };

        const selected = config[type];
        if (!selected) return null;

        return (
            <TouchableOpacity onPress={() => index !== "" && load_question(index)}>
                <ImageBackground source={selected.image} style={selected.style}>
                    <Text style={{ color: selected.textColor }}>{value}</Text>
                </ImageBackground>
            </TouchableOpacity>
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
                        <MenuDrawer
                            open={isOpen}
                            onChange={(open) => setIsOpen(open)}
                            onClose={togglePallete}
                            drawerContent={
                                <SafeAreaView style={[TestSeriesStyle.pallete_container, styles.drawerContentContainer]}>
      
                                {/* Header */}
                                <View style={TestSeriesStyle.pallete_header}>
                                    <Image
                                    style={styles.profileImage}
                                    resizeMode="contain"
                                    source={profileImage === '' ? imagePaths.LOGO : {uri: profileImage}}
                                    />
                                    <Text
                                    style={styles.drawerProfileText} // Inline style moved to StyleSheet
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                    >
                                    {cusName}
                                    </Text>
                                </View>

                                {/* Legend Section */}
                                <View style={styles.legendContainer}>
                                    <Text style={styles.legendHeader}>
                                        Question Legend
                                    </Text>
                                    <View style={styles.legendRowContainer}>
                                    {drawerLegend.map((item, idx) => (
                                        <View
                                        key={idx}
                                        style={[
                                            styles.legendItem,
                                            {
                                                // Retained complex width logic as per original code
                                                width: idx == 4 ? "95%" : (idx % 2 === 0 ? "40%" : "60%"), 
                                            }
                                        ]}
                                        >
                                        {pallete_highlighers(item.key, item.count, "0")}
                                        <Text style={styles.legendText}>
                                            {item.label}
                                        </Text>
                                        </View>
                                    ))}
                                    </View>
                                </View>

                                {/* Choose Question Header */}
                                <View style={styles.chooseQuestionHeader}>
                                    <Text style={styles.chooseQuestionHeaderText}>
                                    Choose Question
                                    </Text>
                                </View>

                                {/* Question Palette */}
                                <ScrollView contentContainerStyle={styles.questionPaletteScroll}>
                                    <View style={styles.questionPaletteRow}>
                                    {finalJson.map((item, index) => (
                                        <View key={index} style={styles.questionPaletteItem}>
                                        {pallete_highlighers(item.state, item.index + 1, item.index)}
                                        </View>
                                    ))}
                                    </View>
                                </ScrollView>

                                {/* Close Button (Ensure this is correctly positioned using absolute styles) */}
                                {isOpen && (
                                    <TouchableOpacity
                                    onPress={() => setIsOpen(false)}
                                    style={styles.navCloseBtn}
                                    >
                                    <Text style={styles.navCloseText}>{'>'}</Text>
                                    </TouchableOpacity>
                                )}

                                {/* Submit Button */}
                                <TouchableOpacity
                                    style={styles.navSubmitBtn}
                                    onPress={()=> submitTest()}
                                >
                                    <Text style={styles.navSubmitText}>
                                    Submit Test
                                    </Text>
                                </TouchableOpacity>
                                </SafeAreaView>
                            }
                            drawerPercentage={80}
                            animationTime={250}
                            position={'right'}
                        >
                        <TestHeaderComp headerTitle={params.title} headerTestTime={testFormatRemainTime} togglePallete={togglePallete} />
                        <View style={styles.sectionHeaderBar}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{  }}>
                                {testSections.length && currentQuestions && testSections.map((section, idx) => (
                                    <TouchableOpacity 
                                    key={idx} 
                                    onPress={()=> chooseSection(section.key)}
                                    style={[
                                        styles.sectionButton,
                                        { 
                                            borderBottomColor: currentQuestions.section_id === section.key ? Colors.WHITE : Colors.THEME,
                                        }
                                    ]}>
                                        <Text style={styles.sectionButtonText}>{section.title}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                        {
                            currentQuestions && Object.keys(currentQuestions).length > 0 &&
                            <>
                                <ScrollView>
                                    <View style={{ flex: 1, marginBottom: 10 }}>
                                        <View style={TestSeriesStyle.questionTypeCard}>
                                            <Text style={TestSeriesStyle.questionTypeText}>{
                                                "Type : " + currentQuestions.question_type 
                                                + " | Marks +" + currentQuestions.mark_per_que 
                                                + " -" + currentQuestions.neg_mark_per_que
                                            }</Text>
                                        </View>
                                        <View style={TestSeriesStyle.questionNumberingCard}>
                                            <Text style={TestSeriesStyle.questionNumberingText}>{"Question: " + (currentQuestionsIndex + 1)}</Text>
                                        </View>
                                        <View style={TestSeriesStyle.questionCard}>
                                            {currentQuestions.passage !== "" &&
                                                <View key={"passage"} style={{ flex: 1 }}>
                                                    <Text>{"Passage"}</Text>
                                                    <HTML contentWidth={windowWidth} source={{ html: currentQuestions.passage }} />
                                                </View>
                                            }
                                            <View key={"1"}>
                                                {currentQuestions.passage !== "" &&
                                                    <Text>{"Question"}</Text>
                                                }
                                                <HTML contentWidth={windowWidth} source={{ html: currentQuestions.question }} />
                                            </View>
                                            {[1, 2, 3, 4].map((opt, i) => {
                                                const optionText = currentQuestions[`option_${opt}`];
                                                if (!optionText) return null;
                                                const selected = currentQuestions.answers == undefined || currentQuestions.answers.length < 1 || currentQuestions.answers[i] == "0" ? false : true;

                                                return (
                                                    <TouchableOpacity 
                                                        key={i} 
                                                        onPress={() => {
                                                            if (currentQuestions.question_type === "FIB") {
                                                                // FIB requires TextInput interaction, not button press
                                                            } else {
                                                                chooseOption(i);
                                                            }
                                                        } }
                                                        activeOpacity={currentQuestions.question_type === "FIB" ? 1 : 0.7}
                                                        style={[
                                                            TestSeriesStyle.optionsCard,
                                                            styles.optionCardBase, // New base style
                                                            {
                                                                borderColor: selected ? "#0274BA" : "#222222",
                                                            },
                                                            currentQuestions.question_type !== "FIB" && styles.optionCardWrap,
                                                        ]}
                                                    >
                                                        <View style={{ paddingRight: 8 }}>
                                                            <Image source={imagePaths[`TEST_OPTION_${String.fromCharCode(64 + opt)}`]} />
                                                        </View>
                                                        <View style={styles.optionContent}>
                                                            {
                                                                currentQuestions.question_type === "FIB" && <TextInput
                                                                    placeholder="Enter Answer"
                                                                    value={fibActiveAnswers[i] || ""}
                                                                    onChangeText={(text) => {
                                                                        const updatedAnswers = [...fibActiveAnswers];
                                                                        updatedAnswers[i] = text;
                                                                        setFibActiveAnswers(updatedAnswers);
                                                                        chooseOption(updatedAnswers);
                                                                    }}
                                                                    style={styles.fibInput}
                                                            />
                                                            }
                                                            {
                                                                currentQuestions.question_type !== "FIB" && <HTML 
                                                                    contentWidth={windowWidth - 60} // subtract padding + image width
                                                                    source={{ html: optionText }} 
                                                                />
                                                            }
                                                        </View>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                            <View key={"6"} style={{ flex: 1 }}>
                                                <View style={{ flex: 1 }}>
                                                    <View style={{ alignItems: "flex-end" }}>
                                                        <TouchableOpacity onPress={()=>clearResponse()} style={styles.clearResponseButton}>
                                                            <Text style={styles.clearResponseText}>{"Clear Response"}</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </ScrollView>
                                <View style={styles.bottomControlBar}>
                                    {
                                        currentQuestionsIndex > 0 &&
                                        <View>
                                            <TouchableOpacity onPress={() => prevQuestion()} style={styles.prevNextButton}>
                                                <Text style={styles.prevNextButtonText}>{"Prev"}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    }
                                    <View>
                                        <TouchableOpacity onPress={()=> markForReviewAndNext()} style={styles.markReviewButton}>
                                            <Text style={styles.markReviewText}>{"Mark for Review & Next"}</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View>
                                        {
                                            (currentQuestionsIndex + 1) < testQuestions.length &&
                                            <TouchableOpacity onPress={() => nextQuestion()} style={styles.prevNextButton}>
                                                <Text style={styles.prevNextButtonText}>{"Save & Next"}</Text>
                                            </TouchableOpacity>
                                        }
                                        {
                                            (currentQuestionsIndex + 1) >= testQuestions.length &&
                                            <TouchableOpacity onPress={() => submitTest()} style={styles.prevNextButton}>
                                                <Text style={styles.prevNextButtonText}>{"Submit"}</Text>
                                            </TouchableOpacity>
                                        }
                                    </View>
                                </View>
                            </>
                        }
                            
                    </MenuDrawer>
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
  // --- Drawer Styles ---
  drawerContentContainer: {
    backgroundColor: Colors.WHITE,
    flex: 1, // Ensure SafeAreaView takes up full height
  },
  profileImage: {
    width: 48, 
    height: 48, 
    borderRadius: 24 
  },
  drawerProfileText: {
    color: Colors.WHITE,
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 12,
  },
  legendContainer: { 
    padding: 16 
  },
  legendHeader: { 
    fontSize: 16, 
    fontWeight: "600", 
    marginBottom: 10, 
    color: Colors.DARK 
  },
  legendRowContainer: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    justifyContent: "space-between" 
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendText: { 
    marginLeft: 8, 
    fontSize: 14, 
    color: Colors.DARK 
  },
  chooseQuestionHeader: { 
    backgroundColor: Colors.THEME, 
    paddingVertical: 10, 
    paddingHorizontal: 16 
  },
  chooseQuestionHeaderText: { 
    color: Colors.WHITE, 
    fontWeight: "600", 
    fontSize: 16 
  },
  questionPaletteScroll: { 
    padding: 12 
  },
  questionPaletteRow: { 
    flexDirection: "row", 
    flexWrap: "wrap" 
  },
  questionPaletteItem: { 
    width: "14.28%", 
    padding: 4 
  },
  answeredMarkedForReviewStyle: { 
    height: 30, 
    width: 34, 
    alignItems: "center", 
    justifyContent: "center", 
    margin: 5 
  },

  // --- Drawer Controls ---
  navCloseBtn:{
        position: 'absolute',
        top: "50%",
        left: -20,
        transform: [{ translateY: -30 }],
        backgroundColor: Colors.TAG_COLOR,
        height: 60,
        width: 20,
        paddingLeft: 5,
        justifyContent: "center",
        alignItems: "center",
        borderTopLeftRadius: 5,
        borderBottomLeftRadius: 5,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    navCloseText: { 
        color: Colors.WHITE, 
        fontSize: 18 
    },
    navSubmitBtn:{
        backgroundColor: Colors.THEME,
        paddingVertical: 12,
        marginHorizontal: 16,
        marginVertical: 20,
        borderRadius: 8,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 3,
    },
    navSubmitText: { 
        color: Colors.WHITE, 
        fontWeight: "700", 
        fontSize: 16 
    },

    // --- Main Test Area Styles ---
    sectionHeaderBar: { 
        backgroundColor: Colors.THEME 
    },
    sectionButton: { 
        padding: 10, 
        marginHorizontal: 5, 
        borderBottomWidth: 3, 
        borderRadius: 5 
    },
    sectionButtonText: { 
        color: Colors.WHITE 
    },

    // --- Option Card Styles ---
    optionCardBase: {
        width: '100%',
        flexDirection: 'row',
        padding: 8,
    },
    optionCardWrap: {
        flexWrap: "wrap",
        alignItems: "flex-start",
    },
    optionContent: {
        flex: 1,
    },
    fibInput: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        fontSize: 16,
        color: "#222",
    },
    clearResponseButton: {
        borderColor: "#DA4A54", 
        borderWidth: 1, 
        borderRadius: 10, 
        marginTop: 6, 
        width: "35%", 
        alignItems: "center"
    },
    clearResponseText: {
        paddingVertical: 5, 
        color: "#DA4A54"
    },

    // --- Bottom Control Bar Styles ---
    bottomControlBar: { 
        flexDirection:"row",
        justifyContent:"space-between", 
        height:50,
        padding:10,
        backgroundColor:Colors.WHITE 
    },
    prevNextButton: { 
        borderWidth: 1, 
        borderColor: Colors.THEME, 
        borderRadius: 5 
    },
    prevNextButtonText: { 
        paddingHorizontal: 5, 
        paddingVertical: 5, 
        backgroundColor: Colors.THEME, 
        color: Colors.WHITE 
    },
    markReviewButton: { 
        borderWidth: 1, 
        borderColor: "#0000006b", 
        borderRadius: 5 
    },
    markReviewText: { 
        paddingHorizontal: 5, 
        paddingVertical: 5 
    }
});