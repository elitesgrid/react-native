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
        let dl = drawerLegend;
        let fj = finalJson;
        let localStatesTotal = {
            answered: 0,
            not_answered: 0,
            not_visited: 0,
            marked_for_review: 0,
            answered_marked_for_review: 0
        }
        fj.forEach(val =>{
            ++localStatesTotal[val.state];
        });
        
        dl.forEach((val, ind) => {
            dl[ind].count = localStatesTotal[val.key];
        });
        setDrawerLegend(dl);
    }

    async function load_question(index) {
        //console.log("sdfg",finalJson[index].answers);
        //console.log(testQuestions[index].section_id, testSections);
        let currentQuestion = testQuestions[index];
        if(!currentQuestion){
            return;
        }

        if(currentQuestion.question_type == "FIB" && finalJson[index].answers) {
            setFibActiveAnswers(finalJson[index].answers)
        } else if (currentQuestion.question_type == "FIB") {
            //console.log(Object.keys(finalJson[index]));
            setFibActiveAnswers(['', '', '', ''])
        }
        currentQuestion.answers = finalJson[index].answers;
        setCurrentQuestions(currentQuestion);
        setCurrentQuestionsIndex(index);
        resetQuestionTime(finalJson[index]?.spent_time ?? 0);
        
        isOpen ? togglePallete() : "";
    }

    function chooseOption(optionIndex){
        if (currentQuestions.question_type == "FIB") {
            currentQuestions.answers = optionIndex;
        } else {
            let x = ['0', '0', '0', '0'];
            x[optionIndex] = '1';
            currentQuestions.answers = x;
        }
        //finalJson[currentQuestionsIndex].answers = currentQuestions.answers;
        setCurrentQuestions(currentQuestions);
    }

    function chooseSection(secId) {
        const index = testQuestions.findIndex(item => item.section_id === secId);
        //console.log("index", index);
        load_question(index);
    }

    function clearResponse() {
        if (currentQuestions.question_type == "FIB") {
            finalJson[currentQuestionsIndex].answers = [];
            currentQuestions.answers = [];
            setFibActiveAnswers(currentQuestions.answers);
        } else {
            finalJson[currentQuestionsIndex].answers = ["0","0","0","0"];
            currentQuestions.answers = ["0","0","0","0"];
        }
        finalJson[currentQuestionsIndex].state = "not_answered";
        setCurrentQuestions(currentQuestions);
        setFinalJson(finalJson);
    }

    async function togglePallete(){
        setIsOpen(!isOpen);
    }

    async function saveAnswer(marked = false){
        finalJson[currentQuestionsIndex].answers = currentQuestions.answers;
        if(currentQuestions.question_type === "FIB") {
            let count = currentQuestions.answers.filter(item => item !== '' && item !== '0').length;
            if (count === 0) {
                finalJson[currentQuestionsIndex].state = marked ? 'marked_for_review' : "not_answered";
            } else {
                finalJson[currentQuestionsIndex].state = marked ? 'answered_marked_for_review' : "answered";
            }
            console.log("FIB On write answers", finalJson[currentQuestionsIndex].answers, count, finalJson[currentQuestionsIndex].state);
        } else {
            const countOfZero = finalJson[currentQuestionsIndex].answers.filter(item => item === "0").length;
            const countOfNonZero = finalJson[currentQuestionsIndex].answers.filter(item => item === "1").length;
            if (finalJson[currentQuestionsIndex].answers.length === countOfZero) {
                finalJson[currentQuestionsIndex].state = marked ? 'marked_for_review' : "not_answered";
            } else if (countOfNonZero > 0) {
                finalJson[currentQuestionsIndex].state = marked ? 'answered_marked_for_review' : "answered";
            }
            console.log("On write answers", finalJson[currentQuestionsIndex].answers, countOfZero, finalJson[currentQuestionsIndex].state);
        }
        finalJson[currentQuestionsIndex].spent_time = questionTime;
        setFinalJson(finalJson);
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
        load_question(currentQuestionsIndex - 1);
    }

    const submitTest = async function() {
        console.log(finalJson);
        let payload = {
            test_id: params.id,
            json: JSON.stringify(finalJson),
            time_taken: remainSeconds,
            section_sequence: resumeSectionId,
            state: 2
        }
        TestServices.submit_test_detail(payload).then(async (data) => {
            console.log("submit_test_detail", data);
            if (data.status === true) {

            }
        });
        Alert.alert("Submit Test");
    }

    async function getTestDetail(params) {
        let payload = {
            test_id: params.id,
            type: 0
        }
        return await TestServices.get_test_detail(payload).then(async (data) => {
            if (data.status === true) {
                data = data.data;
                
                let resume_json = data.resume;
                console.log(resume_json);
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
                        }

                        let spent_time = 0;
                        let answers = que.question_type === "FIB" ? ['', '', '', ''] : ['0', '0', '0', '0'];
                        let state = "not_visited";
                        
                        let resume_que = resume_que_json.find(item => item.question_id === que.id);
                        if(resume_que) {
                            switch(resume_que.state){
                                case "not-visited":
                                    resume_que.state = "not_visited";
                                    break;
                                case "not-answered":
                                    resume_que.state = "not_answered";
                                    break;
                            }

                            spent_time = parseInt(resume_que.spent_time);
                            answers = resume_que.given_answer;
                            state = resume_que.state;
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
                //console.log("Total Question lenght"+ questions.length);
                setFinalJson(user_answers);
                setTestSections(sections);
                setTestQuestions(questions);
                setRemainSeconds(total_sec - resume_time_taken);
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
    }, [testQuestions, finalJson])

    useEffect(function () {
        // const unsubscribe = navigation.addListener('focus', () => {
            setTestSeries([]);
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


    }, [navigation, params]);

    function pallete_highlighers(type, value, index) {
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
                style: { height: 30, width: 34, alignItems: "center", justifyContent: "center", margin: 5 },
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
                                <SafeAreaView style={[TestSeriesStyle.pallete_container, { backgroundColor: Colors.WHITE }]}>
      
                                {/* Header */}
                                <View style={TestSeriesStyle.pallete_header}>
                                    <Image
                                    style={{ width: 48, height: 48, borderRadius: 24 }}
                                    resizeMode="contain"
                                    source={profileImage === '' ? imagePaths.LOGO : {uri: profileImage}}
                                    />
                                    <Text
                                    style={{
                                        color: Colors.WHITE,
                                        fontSize: 18,
                                        fontWeight: "600",
                                        marginLeft: 12,
                                    }}
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                    >
                                    {cusName}
                                    </Text>
                                </View>

                                {/* Legend Section */}
                                <View style={{ padding: 16 }}>
                                    <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 10, color: Colors.DARK }}>
                                        Question Legend
                                    </Text>
                                    <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
                                    {drawerLegend.map((item, idx) => (
                                        <View
                                        key={idx}
                                        style={{
                                            width: idx == 4 ? "95%" : (idx % 2 === 0 ? "40%" : "60%"),
                                            flexDirection: "row",
                                            alignItems: "center",
                                        }}
                                        >
                                        {pallete_highlighers(item.key, item.count, "0")}
                                        <Text style={{ marginLeft: 8, fontSize: 14, color: Colors.DARK }}>
                                            {item.label}
                                        </Text>
                                        </View>
                                    ))}
                                    </View>
                                </View>

                                {/* Choose Question Header */}
                                <View style={{ backgroundColor: Colors.THEME, paddingVertical: 10, paddingHorizontal: 16 }}>
                                    <Text style={{ color: Colors.WHITE, fontWeight: "600", fontSize: 16 }}>
                                    Choose Question
                                    </Text>
                                </View>

                                {/* Question Palette */}
                                <ScrollView contentContainerStyle={{ padding: 12 }}>
                                    <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                                    {finalJson.map((item, index) => (
                                        <View key={index} style={{ width: "14.28%", padding: 4 }}>
                                        {pallete_highlighers(item.state, item.index + 1, item.index)}
                                        </View>
                                    ))}
                                    </View>
                                </ScrollView>

                                {/* Close Button */}
                                {isOpen && (
                                    <TouchableOpacity
                                    onPress={() => setIsOpen(false)}
                                    style={styles.navCloseBtn}
                                    >
                                    <Text style={{ color: Colors.WHITE, fontSize: 18 }}>{'>'}</Text>
                                    </TouchableOpacity>
                                )}

                                {/* Submit Button */}
                                <TouchableOpacity
                                    style={styles.navSubmitBtn}
                                    onPress={()=> submitTest()}
                                >
                                    <Text style={{ color: Colors.WHITE, fontWeight: "700", fontSize: 16 }}>
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
                        <View style={{ backgroundColor: Colors.THEME }}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{  }}>
                                {testSections.length && currentQuestions && testSections.map((section, idx) => (
                                    <TouchableOpacity 
                                    key={idx} 
                                    onPress={()=> chooseSection(section.key)}
                                    style={{ padding: 10, marginHorizontal: 5, borderBottomColor: currentQuestions.section_id === section.key ? Colors.WHITE : Colors.THEME, borderBottomWidth: 3, borderRadius: 5 }}>
                                        <Text style={{ color: Colors.WHITE }}>{section.title}</Text>
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

                                                            } else {
                                                                chooseOption(i);
                                                            }
                                                        } }
                                                        activeOpacity={currentQuestions.question_type === "FIB" ? 1 : 0.7}
                                                        style={{
                                                            ...TestSeriesStyle.optionsCard,
                                                            borderColor: selected ? "#0274BA" : "#222222",
                                                            width: '100%',          // full width
                                                            flexDirection: 'row',   // icon + text side by side
                                                            padding: 8,
                                                            ...(currentQuestions.question_type !== "FIB" && {
                                                                flexWrap: "wrap",
                                                                alignItems: "flex-start",
                                                            })
                                                        }}
                                                    >
                                                        <View style={{ paddingRight: 8 }}>
                                                            <Image source={imagePaths[`TEST_OPTION_${String.fromCharCode(64 + opt)}`]} />
                                                        </View>
                                                        <View style={{ flex: 1 }}>
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
                                                                    style={{
                                                                        borderWidth: 1,
                                                                        borderColor: "#ccc",
                                                                        borderRadius: 6,
                                                                        paddingHorizontal: 10,
                                                                        paddingVertical: 6,
                                                                        fontSize: 16,
                                                                        color: "#222",
                                                                    }}
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
                                                        <TouchableOpacity onPress={()=>clearResponse()} style={{ borderColor: "#DA4A54", borderWidth: 1, borderRadius: 10, marginTop: 6, width: "35%", alignItems: "center" }}>
                                                            <Text style={{ paddingVertical: 5, color: "#DA4A54" }}>{"Clear Response"}</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </ScrollView>
                                <View style={{ flexDirection:"row",justifyContent:"space-between", height:50,padding:10,backgroundColor:Colors.WHITE }}>
                                    {
                                        currentQuestionsIndex > 0 &&
                                        <View>
                                            <TouchableOpacity onPress={() => prevQuestion()} style={{ borderWidth: 1, borderColor: Colors.THEME, borderRadius: 5 }}>
                                                <Text style={{ paddingHorizontal: 5, paddingVertical: 5, backgroundColor: Colors.THEME, color: Colors.WHITE }}>{"Prev"}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    }
                                    <View>
                                        <TouchableOpacity onPress={()=> markForReviewAndNext()} style={{ borderWidth: 1, borderColor: "#0000006b", borderRadius: 5 }}>
                                            <Text style={{ paddingHorizontal: 5, paddingVertical: 5 }}>{"Mark for Review & Next"}</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View>
                                        {
                                            (currentQuestionsIndex + 1) < testQuestions.length &&
                                            <TouchableOpacity onPress={() => nextQuestion()} style={{ borderWidth: 1, borderColor: Colors.THEME, borderRadius: 5 }}>
                                                <Text style={{ paddingHorizontal: 5, paddingVertical: 5, backgroundColor: Colors.THEME, color: Colors.WHITE }}>{"Save & Next"}</Text>
                                            </TouchableOpacity>
                                        }
                                        {
                                            (currentQuestionsIndex + 1) >= testQuestions.length &&
                                            <TouchableOpacity onPress={() => submitTest()} style={{ borderWidth: 1, borderColor: Colors.THEME, borderRadius: 5 }}>
                                                <Text style={{ paddingHorizontal: 5, paddingVertical: 5, backgroundColor: Colors.THEME, color: Colors.WHITE }}>{"Submit"}</Text>
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
    }
});