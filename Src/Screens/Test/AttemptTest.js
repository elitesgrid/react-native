//import liraries
import React, { useEffect, useState, useRef } from 'react';
import { View,
    Text,
    ScrollView,
    Image,
    TouchableOpacity,
    SafeAreaView,
    Alert,
    StyleSheet,
    TextInput,
    ImageBackground,
    BackHandler
} from 'react-native';
//import { WebView } from 'react-native-webview';
import MenuDrawer from 'react-native-side-drawer'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../Constants/Colors';
import TestSeriesStyle from '../../Assets/Style/TestSeriesStyle';
import imagePaths from '../../Constants/imagePaths';
import TestServices from '../../Services/apis/TestServices';
import CustomHelper from '../../Constants/CustomHelper';
import StorageManager from '../../Services/StorageManager';
import LoadingComp from '../../Components/LoadingComp'; // Assuming this is defined/used
import navigationStrings from '../../Constants/navigationStrings';
import { useConfirmDialog } from '../../Components/ConfirmDialogContext';
import { StackActions } from '@react-navigation/native';
import HtmlRendererComp from '../../Components/HtmlRendererComp';
import useTabletLandscape from '../../Hooks/useTabletLandscape';
import HeaderComp from '../../Components/HeaderComp';
import DeviceInfo from 'react-native-device-info';

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
    const { params } = route;
    const insets = useSafeAreaInsets();
    const tabletLandscape = useTabletLandscape();
    const {showConfirmDialog} = useConfirmDialog();
    
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
    const [resumeSectionId, setResumeSectionId] = useState("0");
    const [sectionTimings, setSectionsTimings] = useState();
    const [drawerPercentage, setDrawerPercentage] = useState(80);

    const timerMounted = useRef(false);
    const isDev = useRef(false);
    
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

    const timerActions = async function() {
        //console.log("remainSeconds",remainSeconds);
        if(remainSeconds > 0){
            if(params.allow_move_section === "0"){
                if(sectionTimings && Object.keys(sectionTimings).length > 0){
                    let sec_timing = sectionTimings;
                    sec_timing[resumeSectionId] = remainSeconds;
                    setSectionsTimings(sec_timing);
                } else {
                    console.log("sectionTimings Set Check Failed", sectionTimings);
                }
            } 
            setTestFormatRemainTime(formattedRemainTime);
        } else if(params.allow_move_section === "0" && remainSeconds <= 0){
            let sections = sectionTimings ? Object.keys(sectionTimings) : [];

            const index = sections.length === 0 ? -1 : sections.indexOf(resumeSectionId);
            let nextSecId = sections.length === 0 ? resumeSectionId : (sections[index + 1] ?? sections[sections.length - 1]);
            if(nextSecId === resumeSectionId && remainSeconds <= 0) {
                submitTest('1', await collectJson('2'));
                console.log("Auto Submit", nextSecId, resumeSectionId, index, sections);
            } else {
                console.log("New Sec Time Setting Up",sectionTimings[nextSecId]);
                setRemainSeconds(sectionTimings[nextSecId]);
                //Partial Submit
                switchSection(nextSecId, true);
                let json = await collectJson('1', nextSecId);
                json.active_section = nextSecId;
                //console.log("Partial Submit",json, sectionTimings);
                submitTest("2", json);
            }
        } else if(params.allow_move_section === "1"){
            // submitTest('1', await collectJson('2'));
            console.log("Auto Submit.");
        }
    }

    useEffect(function(){
        if (!timerMounted.current) {
            if(remainSeconds > 0){
                timerMounted.current = true; // skip the first run
            }
            console.log("Timer Mounted");
            return;
        }
        timerActions()
    }, [remainSeconds]);

    useEffect(() => {
        // console.log("tabletLandscape",tabletLandscape);
        if(tabletLandscape.isDeviceLandscape){
            setDrawerPercentage(30);
        } else if(tabletLandscape.isIpadTablet && tabletLandscape.isScreenLandscape){
            setDrawerPercentage(40);
        } else {
            setDrawerPercentage(80);
        }
    }, [tabletLandscape]);

    async function getSessionData() {
        let session = await StorageManager.get_session();
        if (Object.keys(session).length > 0) {
            setCusName(session.name);
            setProfileImage(session.profile_image);
        }
    }

     async function load_question(index) {
        let currentQuestion = testQuestions[index];
        if(!currentQuestion){
            return;
        }

        const userSavedAnswers = finalJson[index]?.answers || [];
        //console.log("userSavedAnswers",userSavedAnswers, index);
        
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
            c_index: currentQuestion.c_index
        }

        setResumeSectionId(newCurrentQuestion.section_id.toString());
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

    function switchSection(secId, force = false) {
        if(params.allow_move_section === "0" && secId !== resumeSectionId && force === false){
            CustomHelper.showMessage("Section switching not allowed.");
            return false;
        }
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
            setFibActiveAnswers(newAnswers);
        }
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
            const countOfNonZero = (givenAnswers || ['0','0','0','0']).filter(item => item === "1").length;
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
        return newFinalJson;
    }

    const nextQuestion = async function (){
        let currentQuestion = testQuestions[currentQuestionsIndex + 1];
        await saveAnswer(false);
        if(params.allow_move_section === "0" && resumeSectionId.toString() !== currentQuestion.section_id){
            switchSection(resumeSectionId);
        } else {
            load_question(currentQuestionsIndex + 1);
        }
    }

    async function markForReviewAndNext(){
        await saveAnswer(true);
        load_question(currentQuestionsIndex + 1);
    }

    const prevQuestion = async function (){
        let currentQuestion = testQuestions[currentQuestionsIndex - 1];
        if(params.allow_move_section === "0" && resumeSectionId !== currentQuestion.section_id){
            CustomHelper.showMessage("Section switching not allowed");
            return false;
        }

        load_question(currentQuestionsIndex - 1);
    }

    const pallete_jump_question = function(index){
        let currentQuestion = testQuestions[currentQuestionsIndex];
        let toBeCurrentQuestion = testQuestions[index];
        if(params.allow_move_section === "0" && currentQuestion.section_id !== toBeCurrentQuestion.section_id){
            togglePallete();
            CustomHelper.showMessage("Section switching not allowed");
            return false;
        }
        load_question(index);
    }

    const collectJson = async function (state, resumeSec = 0) {
        return new Promise(async function(resolve, reject){
            try{
                let newFinalJson = await saveAnswer(false);
                let fj = newFinalJson.map(item => {
                    const { c_index, ...rest } = item;
                    return rest;
                });

                let rs = remainSeconds;
                if(params.allow_move_section === "0" && sectionTimings){
                    rs = sectionTimings[resumeSec ? resumeSec : resumeSectionId];
                }

                let ss = sectionTimings ? Object.keys(sectionTimings).join(',') : resumeSectionId;

                let return_ = {
                    json: JSON.stringify(fj),
                    time_taken: remainSeconds,
                    test_id: params.id,
                    section_sequence: ss,
                    state: state,
                    first_attempt: "1",
                    last_question: currentQuestionsIndex,
                    active_section: resumeSec ? resumeSec : resumeSectionId
                }
                resolve(return_);
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    }

    const submitTest = async function (backPress, payload){
        console.log("backPress",backPress);
        TestServices.submit_test_detail(payload).then(async (data) => {
            if(backPress === "2"){
                //console.log(data);
                return false;
            }
            data = data.data;
            if (data.id) {
                testSeries.report_id = data.id;
                delete testSeries.questions;
                delete testSeries.resume;
                //console.log(testSeries);
                // Assuming navigationStrings.TEST_VIEW_RESULT is available globally
                if(backPress === "1"){
                    const popAction = StackActions.pop(2);
                    navigation.dispatch(popAction);
                } else {
                    navigation.replace(navigationStrings.TEST_VIEW_RESULT, testSeries); 
                }
                console.log("Submit Test Success");
            }
            console.log("Submit Test", data);
        });
    }

    const confirmAndSubmitTest = async function(backPress = "") {
        let sections = sectionTimings ? Object.keys(sectionTimings) : [];
        if(params.allow_move_section === "0" && resumeSectionId !== sections[sections.length - 1] && backPress !== "1"){
            showConfirmDialog({
                title: DeviceInfo.getApplicationName(),
                message: 'Are you sure want to submit this section?',
                onConfirm: async () => {
                    const index = sections.length === 0 ? -1 : sections.indexOf(resumeSectionId);
                    let nextSecId = sections.length === 0 ? resumeSectionId : (sections[index + 1] ?? sections[sections.length - 1]);
                    if(nextSecId === resumeSectionId) {
                        submitTest('1', await collectJson('2'));
                        console.log("Auto Submit", nextSecId, resumeSectionId, index, sections);
                    } else {
                        console.log("New Sec Time Setting Up",sectionTimings[nextSecId]);
                        setRemainSeconds(sectionTimings[nextSecId]);
                        //Partial Submit
                        switchSection(nextSecId, true);
                        let json = await collectJson('1', nextSecId);
                        json.active_section = nextSecId;
                        //console.log("Force Partial Submit",json, sectionTimings);
                        submitTest("2", json);
                    }
                },
            });
        } else {
            let state = backPress;
            if(backPress === "2" && params.allow_move_section === "0" && resumeSectionId === sections[sections.length - 1]){
                state = "2";
                backPress = "1";
            }
            console.log("Backpress requested", backPress, state);
            showConfirmDialog({
                title: DeviceInfo.getApplicationName(),
                message: state == '1' ? 'Do you want to save your progress and exit the test?' : 'Are you sure want to submit test?',
                onConfirm: async () => {
                    submitTest(backPress, await collectJson(state));
                },
            });
        }
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
                let resume_section = 0;
                if(resume_json){
                     resume_que_json = JSON.parse(resume_json.custom_json);
                     resume_time_taken = parseInt(resume_json.time_taken);
                     resume_section = resume_json.active_section;
                     setResumeSectionId(resume_json.active_section.toString());
                     //console.log("Resume Section",resume_json.active_section, Object.keys(resume_json));
                }

                setTestSeries(data);

                let section_index_map = {};
                let sections = [];
                let questions = [];
                let user_answers = [];
                let index = 0;
                let sec_timings = {};
                data.questions.forEach(element => {
                    var reduce_seconds = 0;
                    if(resume_que_json){
                        resume_que_json.forEach((re_ele, re_ind)=> {
                            if(re_ele.section_id === element.id){
                                reduce_seconds += parseInt(re_ele.spent_time);
                            }
                        });
                    }
                    element.questions.forEach((que, ind) => {
                        if (!section_index_map[que.section_id]) {
                            section_index_map[que.section_id] = 0;
                        }
                        section_index_map[que.section_id]++;

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
                            if(state === "unanswered"){
                                state = "not_answered";
                            }

                            spent_time = parseInt(resume_que.spent_time);
                            answers = resume_que.given_answer;
                        }

                        user_answers.push({
                            que_id:que.id,
                            section_id:que.section_id,
                            index:index,
                            state: state,
                            spent_time: spent_time,
                            answers : answers,
                            c_index: section_index_map[que.section_id]
                        })
                        ++index;

                        element.questions[ind].c_index= section_index_map[que.section_id];
                    });

                    sec_timings[element.id] = (parseInt(element.section_timing) * 60) - reduce_seconds;
                    sections.push({ key: element.id, title: element.subject });
                    questions.push(...element.questions);
                });
                // console.log("sec_timings",sections);
                setFinalJson(user_answers);
                setTestSections(sections);
                setTestQuestions(questions);
                setSectionsTimings(sec_timings);
                // Ensure initial time is correct
                if(parseInt(resume_section) === 0){
                    resume_section = questions[0].section_id;
                }
                if(params.allow_move_section === "0"){
                    setRemainSeconds(sectionTimings && sectionTimings[resume_section] ? sectionTimings[resume_section] : sec_timings[resume_section]);
                } else{                
                    setRemainSeconds(remainSeconds ? remainSeconds : (resume_time_taken > 0 ? resume_time_taken : (parseInt(data.length) * 60) ));
                }
                setIsLoading(false);
            } else {
                setIsLoading(false);
            }
            return true;
        }).catch((error) => {
            CustomHelper.showMessage(error.message);
            return false;
        });
    }

    useEffect(function(){
        let localStatesTotal = {
            answered: 0,
            not_answered: 0,
            not_visited: 0,
            marked_for_review: 0,
            answered_marked_for_review: 0
        }
        
        finalJson.forEach(val =>{ 
            ++localStatesTotal[val.state];
        });
        
        const updatedDrawerLegend = drawerLegend.map(val => ({
            ...val,
            count: localStatesTotal[val.key] || 0,
        }));
        
        setDrawerLegend(updatedDrawerLegend); 
    }, [finalJson])

    useEffect(function(){
        if(finalJson.length > 0){
            if(resumeSectionId > 0) {
                switchSection(resumeSectionId, false);
            } else {
                load_question(0);
            }
        }
    }, [testQuestions]);

    useEffect(function () {
        setTestSeries({});
        async function fetchData() {
            await getSessionData();
            const response = await getTestDetail(params);
        }
        fetchData();

        if(!isDev){
            const backHandler = BackHandler.addEventListener(
                "hardwareBackPress",
                () => {
                    Alert.alert("Your progress will be lost, Please save it first.")
                    return true;
                }
            );

            return () => backHandler.remove(); // cleanup on unmount
        }

    }, [navigation, params]);

    const onTestBackPress = function(){
        confirmAndSubmitTest("1");
    }

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
        if (!selected) {
            //console.log("Returning Null", type, value, index);
            return null;
        }
        //console.log("Returning Null", type, value, index);

        return (
            <TouchableOpacity onPress={() => index !== "" && pallete_jump_question(index, value)}>
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
                                    <View style={TestSeriesStyle.pallete_header}>
                                        <Image
                                            style={styles.profileImage}
                                            resizeMode="contain"
                                            source={profileImage === '' ? imagePaths.LOGO : {uri: profileImage}}
                                        />
                                        <Text
                                            style={styles.drawerProfileText}
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
                                                        width: idx == 4 ? "98%" : (idx % 2 === 0 ? "40%" : "60%"), 
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
                                        {
                                            finalJson.filter(item => 
                                                resumeSectionId === item.section_id || params.allow_move_section === "1"
                                            ).map((item, index) => {
                                                return (
                                                    <View key={index} style={styles.questionPaletteItem}>
                                                        {pallete_highlighers(item.state, params.allow_move_section === "0" ? item.c_index : item.index + 1, item.index)}
                                                    </View>
                                                )
                                            })
                                        }
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
                                        onPress={()=> confirmAndSubmitTest("2")}
                                    >
                                        <Text style={styles.navSubmitText}>
                                            Submit Test
                                        </Text>
                                    </TouchableOpacity>
                                </SafeAreaView>
                            }
                            drawerPercentage={drawerPercentage}
                            animationTime={250}
                            position={'right'}
                        >
                        <HeaderComp 
                            headerTitle={params.title} 
                            onPressBack={onTestBackPress}
                            rightElement={<View style={{height:45}}>
                                <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
                                    {
                                        testFormatRemainTime && <View style={{ paddingHorizontal: 8, marginVertical: 8, marginHorizontal: 10, borderRadius: 20, backgroundColor: "#81BADD" }}>
                                            <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
                                                <Image style={{ width: 20, height: 20 }} source={imagePaths.TEST_TIMER_ICON} />
                                                <Text style={{ fontSize: 13, fontWeight: "400", color: Colors.BLACK, paddingLeft: 4 }}>{testFormatRemainTime}</Text>
                                            </View>
                                        </View>
                                    }
                                    <TouchableOpacity style={{ alignItems: "center", marginRight: 10 }} onPress={togglePallete}>
                                        <Image style={{ height: 20, width: 20 }} source={imagePaths.TEST_HAMBURGER} />
                                    </TouchableOpacity>
                                </View>
                            </View>}
                        />
                        <View style={styles.sectionHeaderBar}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{  }}>
                                {testSections.length && currentQuestions && testSections.map((section, idx) => (
                                    <TouchableOpacity 
                                        key={idx} 
                                        onPress={()=> switchSection(section.key, false)}
                                        style={[
                                            styles.sectionButton,
                                            { 
                                                borderBottomColor: resumeSectionId === section.key ? Colors.WHITE : Colors.THEME,
                                            }
                                        ]}
                                        >
                                        <Text style={styles.sectionButtonText}>{section.title}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                        {
                            currentQuestions && Object.keys(currentQuestions).length > 0 &&
                            <>
                                <ScrollView contentContainerStyle={{
                                    flexGrow: 1,
                                    justifyContent: 'flex-end'
                                }}>
                                    <View style={{ flex: 1, marginBottom: 10 }}>
                                        <View style={TestSeriesStyle.questionTypeCard}>
                                            <Text style={TestSeriesStyle.questionTypeText}>{
                                                "Type : " + currentQuestions.question_type 
                                                + " | Marks +" + currentQuestions.mark_per_que 
                                                + " -" + currentQuestions.neg_mark_per_que
                                            }</Text>
                                        </View>
                                        <View style={TestSeriesStyle.questionNumberingCard}>
                                            <Text style={TestSeriesStyle.questionNumberingText}>{"Question: " + (params.allow_move_section === "0" ? currentQuestions.c_index : (currentQuestionsIndex + 1))}</Text>
                                        </View>
                                        <View style={TestSeriesStyle.questionCard}>
                                            {currentQuestions.passage !== "" &&
                                                <View key={"passage"} style={{ flex: 1 }}>
                                                    <Text style={{color: Colors.TEXT}}>{"Passage"}</Text>
                                                    <HtmlRendererComp key1='passage' html={currentQuestions.passage}></HtmlRendererComp>
                                                </View>
                                            }
                                            <View key={"1"}>
                                                {currentQuestions.passage !== "" &&
                                                    <Text style={{color: Colors.TEXT}}>{"Question"}</Text>
                                                }
                                                <HtmlRendererComp key1='question' html={currentQuestions.question}></HtmlRendererComp>
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
                                                            <Image 
                                                                source={selected ? imagePaths.LETTERS[`${String.fromCharCode(64 + opt)}`] : imagePaths[`TEST_OPTION_${String.fromCharCode(64 + opt)}`]}
                                                                style={{height: 30,width: 30}}
                                                            />
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
                                                                    placeholderTextColor={Colors.IDLE}
                                                            />
                                                            }
                                                            {
                                                                currentQuestions.question_type !== "FIB" &&<HtmlRendererComp html={optionText}></HtmlRendererComp>
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
                                <View style={[styles.bottomControlBar,{paddingBottom: insets.bottom, height: 50 + insets.bottom}]}>
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
                                            <TouchableOpacity onPress={() => confirmAndSubmitTest("2")} style={styles.prevNextButton}>
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
    paddingVertical: 16,
    paddingHorizontal: 5
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
    fontSize: 13, 
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
    // alignItems: "center", 
    paddingLeft: 10,
    // justifyContent: "center", 
    paddingTop: 5,
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
        // alignItems: "flex-start",
    },
    optionContent: {
        flex: 1
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
        paddingHorizontal:10,
        paddingTop: 5,
        backgroundColor:Colors.WHITE 
    },
    prevNextButton: { 
        borderWidth: 1,
        borderColor: Colors.THEME,
        borderRadius: 8,
        paddingVertical: 2,
        paddingHorizontal: 10,
        backgroundColor: Colors.THEME,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 3,
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
        borderRadius: 5,
        backgroundColor: Colors.WHITE,
        paddingVertical: 2,
        paddingHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 3,
    },
    markReviewText: { 
        paddingHorizontal: 5, 
        paddingVertical: 5,
        color: Colors.TEXT
    }
});