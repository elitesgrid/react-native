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
    Dimensions,
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
    setRemainSeconds, // 👈 allow changing from outside
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
    const [testFormatRemainTime,setTestFormatRemainTime] = useState("00:00:00");
    const [testSeries, setTestSeries] = useState({});
    const [testSections, setTestSections] = useState([]);
    const [testQuestions, setTestQuestions] = useState([]);
    const [currentQuestions, setCurrentQuestions] = useState({});
    const [currentQuestionsIndex, setCurrentQuestionsIndex] = useState(0);
    const [finalJson, setFinalJson] = useState([]);
    const {
        questionTime,
        remainSeconds,
        formattedRemainTime,
        resetQuestionTime,
        setRemainSeconds, // 👈 new
        stopTimer
    } = useExamTimer(0);

    useEffect(function(){
        if(remainSeconds > 0){
            setTestFormatRemainTime(formattedRemainTime);
        }
    }, [remainSeconds]);

    async function load_question(index) {
        console.log("sdfg",updatedFinalJson[index]);
        if(finalJson[currentQuestionsIndex] == undefined || finalJson[currentQuestionsIndex] == "" || finalJson[currentQuestionsIndex].que_id == undefined){
            finalJson[currentQuestionsIndex].answers = [];
            finalJson[currentQuestionsIndex].spent_time = questionTime;
            setFinalJson(finalJson);
        }
        questionTime = finalJson[index].spent_time;
        setCurrentQuestions(testQuestions[index]);
        setCurrentQuestionsIndex(index);
        resetQuestionTime(updatedFinalJson[index]?.spent_time ?? 0);

        isOpen ? togglePallete() : "";
    }

    function chooseOption(optionIndex){
        if(finalJson[currentQuestionsIndex].answers == undefined || finalJson[currentQuestionsIndex].answers.length < 1){
            finalJson[currentQuestionsIndex].answers = ["0","0","0","0"];
            
        }
        currentQuestions.answers == undefined || currentQuestions.question_type === '0' ? currentQuestions.answers = ["0","0","0","0"] : "";
        
        currentQuestions.answers[optionIndex] = "1";
        finalJson[currentQuestionsIndex].answers = currentQuestions.answers;
        setCurrentQuestions(currentQuestions);

        const countOfZero = finalJson[currentQuestionsIndex].answers.filter(item => item === "0").length;
        const countOfNonZero = finalJson[currentQuestionsIndex].answers.filter(item => item === "1").length;
        if(finalJson[currentQuestionsIndex].answers.length === countOfZero-1){
            finalJson[currentQuestionsIndex].state = "not_answered";
        }else if(countOfNonZero > 0){
            finalJson[currentQuestionsIndex].state = "answered";
        }

        setFinalJson(finalJson);
    }

    function clearResponse(){
        finalJson[currentQuestionsIndex].answers = ["0","0","0","0"];
        currentQuestions.answers = ["0","0","0","0"];
        finalJson[currentQuestionsIndex].state = "not-answered";
        setCurrentQuestions(currentQuestions);
        setFinalJson(finalJson);
    }

    function markForReviewAndNext(){
        const countOfNonZero = finalJson[currentQuestionsIndex].answers!= undefined ? finalJson[currentQuestionsIndex].answers.filter(item => item === "1").length: 0;
        if(countOfNonZero > 0){
            finalJson[currentQuestionsIndex].state = "review-marked";
        }else{
            finalJson[currentQuestionsIndex].state = "review";
        }
        currentQuestions.answers = finalJson[currentQuestionsIndex].answers;
        setCurrentQuestions(currentQuestions);
        setFinalJson(finalJson);
        nextQuestion();
    }

    async function togglePallete(){
        setIsOpen(!isOpen);
    }

    const nextQuestion = async function (){
        load_question(currentQuestionsIndex+1)
    }

    const submitTest = async function(){
        Alert.alert("Submit Test");
    }

    async function getTestDetail(params) {
        let payload = {
            test_id: params.id,
            type: 0
        }
        return await TestServices.get_test_detail(payload).then(async (data) => {
            setIsLoading(false);
            if (data.status === true) {
                data = data.data;
                setTestSeries(data);
                let sections = [];
                let questions = [];
                let user_answers = [];
                let index = 0;
                let total_sec = remainSeconds;
                data.questions.forEach(element => {
                    sections.push({ key: element.subject, title: element.subject });
                    questions.push(...element.questions);
                    total_sec += (parseInt(element.section_timing) * 60);

                    element.questions.forEach(que => {
                        user_answers.push({
                            que_id:que.id,
                            section_id:que.section_id,
                            index:index,
                            state:"not-visited",
                            spent_time:0
                        })
                        ++index;
                    })
                });
                console.log("Total Question lenght"+ questions.length);
                setFinalJson(user_answers);
                setTestSections(sections);
                setTestQuestions(questions);
                setRemainSeconds(total_sec);
                setTimeout(async function () {
                    await load_question(0);
                    setTimeout(async function () {
                        console.log(Object.keys(currentQuestions));
                    }, 300)
                }, 1000)
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
            setTestSeries([]);
            async function fetchData() {
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

    function pallete_highlighers(type,value,index){
        switch(type){
            case "answered":
                return (
                    <TouchableOpacity  onPress={()=>index!==""?load_question(index):""}>
                        <ImageBackground source={imagePaths.ANSWERED} style={TestSeriesStyle.pallete_symblo_card_image}>
                                <Text style={{color:Colors.WHITE}}>{value}</Text>
                        </ImageBackground>
                    </TouchableOpacity>
                )
                break;
            case "not_answered":
                return (
                    <TouchableOpacity  onPress={()=>index!==""?load_question(index):""}>
                        <ImageBackground source={imagePaths.NOT_ANSWERED} style={TestSeriesStyle.pallete_symblo_card_image}>
                                <Text style={{color:Colors.WHITE}}>{value}</Text>
                        </ImageBackground>
                    </TouchableOpacity>
                )
                break;
            case "not_visited":
                return (
                    <TouchableOpacity  onPress={()=>index!==""?load_question(index):""}>
                        <ImageBackground source={imagePaths.NOT_VISITED} style={TestSeriesStyle.pallete_symblo_card_image}>
                                <Text style={{color:Colors.BLACK}}>{value}</Text>
                        </ImageBackground>
                    </TouchableOpacity>
                )
                break;
            case "marked_for_review":
                return (
                    <TouchableOpacity  onPress={()=>index!==""?load_question(index):""}>
                        <ImageBackground source={imagePaths.MARK_FOR_REVIEW} style={TestSeriesStyle.pallete_symblo_card_image}>
                                <Text style={{color:Colors.WHITE}}>{value}</Text>
                        </ImageBackground>                                
                    </TouchableOpacity>
                )
                break;
            case "answered_marked_for_review":
                return (
                    <TouchableOpacity  onPress={()=>index!==""?load_question(index):""}>
                        <ImageBackground source={imagePaths.ANSWERED_MARK_FOR_REVIEW} style={{height:30,width:34,alignItems:"center",justifyContent:"center",margin:5}}>
                                <Text style={{color:Colors.WHITE}}>{value}</Text>
                        </ImageBackground>
                    </TouchableOpacity>
                )
                break;
        }
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
                                <SafeAreaView style={TestSeriesStyle.pallete_container}>
                                    <View style={TestSeriesStyle.pallete_header}>
                                        <View style={{flex:0.2}}>
                                            <Image style={{maxWidth:"100%",height:"100%"}} resizeMode='stretch' source={imagePaths.LOGO}></Image>
                                        </View>
                                        <View style={{flex:0.8,paddingLeft:10}}>
                                            <Text>{"Ninja Chaudhary"}</Text>
                                        </View>
                                    </View>
                                    <View style={{flex:0.30}}>
                                        <View style={{flex:1,flexDirection:"row"}}>
                                            <View style={TestSeriesStyle.pallete_symbol_card}>
                                                {pallete_highlighers("answered","0","")}
                                                <Text>{"Answered"}</Text>
                                            </View>
                                            <View style={TestSeriesStyle.pallete_symbol_card}>
                                                {pallete_highlighers("not_answered","0","")}
                                                <Text>{"Not Answered"}</Text>
                                            </View>
                                        </View>
                                        <View style={{flex:1,flexDirection:"row"}}>
                                            <View style={TestSeriesStyle.pallete_symbol_card}>
                                                {pallete_highlighers("not_visited","0","")}
                                                <Text>{"Not Visited"}</Text>
                                            </View>
                                            <View style={TestSeriesStyle.pallete_symbol_card}>
                                                {pallete_highlighers("marked_for_review","0","")}
                                                <Text>{"Marked For Review"}</Text>
                                            </View>
                                        </View>
                                        <View style={{flex:1,flexDirection:"row"}}>
                                            <View style={{...TestSeriesStyle.pallete_symbol_card,...{width:"90%"}}}>
                                                {pallete_highlighers("answered_marked_for_review","0","")}
                                                <Text>{"Answered & Marked For Review"}</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={{backgroundColor:Colors.THEME,padding:8}}>
                                        <Text style={{color:Colors.WHITE,fontWeight:"500"}}>{"Choose Question"}</Text>
                                    </View>
                                    <ScrollView>
                                        <View style={{flex:1,flexDirection:"row",maxWidth:"100%",flexWrap:"wrap"}}>
                                            {
                                                finalJson.map((item,rowIndex) =>{
                                                    return (
                                                        <View key={rowIndex} style={{width:"14%"}}>
                                                            {item.state === "not-visited" ? pallete_highlighers("not_visited",item.index +1,item.index) : ""}
                                                            {item.state === "review" ? pallete_highlighers("marked_for_review",item.index +1,item.index) : ""}
                                                            {item.state === "review-marked" ? pallete_highlighers("answered_marked_for_review",item.index +1,item.index) : ""}
                                                            {item.state === "not-answered" ? pallete_highlighers("not_answered",item.index +1,item.index) : ""}
                                                            {item.state === "answered" ? pallete_highlighers("answered",item.index +1,item.index) : ""}
                                                        </View>
                                                    )
                                                })
                                            }
                                        </View>
                                    </ScrollView>
                                    {
                                        isOpen && <TouchableOpacity 
                                            onPress={() => setIsOpen(false)}
                                            style={styles.navCloseBtn}
                                        >
                                            <Text style={{
                                                fontSize:18,
                                                color:Colors.WHITE
                                            }}>{">"}</Text>
                                        </TouchableOpacity>
                                    }
                                    <View style={{backgroundColor:Colors.THEME,padding:8,marginVertical:10,borderTopWidth:1,borderTopColor:Colors.IDLE,alignItems:"center"}}>
                                        <Text style={{color:Colors.WHITE,fontWeight:"600"}}>{"Submit"}</Text>
                                    </View>
                                </SafeAreaView>
                            }
                            drawerPercentage={80}
                            animationTime={250}
                            position={'right'}
                        >
                        <TestHeaderComp headerTitle={params.title} headerTestTime={testFormatRemainTime} togglePallete={togglePallete} />
                        <View style={{ backgroundColor: Colors.THEME }}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10 }}>
                                {testSections.map((section, idx) => (
                                    <TouchableOpacity key={idx} style={{ padding: 10, marginHorizontal: 5, backgroundColor: currentQuestions.section_id === section.key ? Colors.THEME : Colors.IDLE, borderRadius: 5 }}>
                                        <Text style={{ color: Colors.WHITE }}>{section.title}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                        {
                            currentQuestions && Object.keys(currentQuestions).length > 0 &&
                            <>
                                <ScrollView>
                                    <View style={{ flex: 1 }}>
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
                                                    <HTML contentWidth={windowWidth} source={{ html: currentQuestions.passage }} />
                                                </View>
                                            }
                                            <View key={"1"}>
                                                <HTML contentWidth={windowWidth} source={{ html: currentQuestions.question }} />
                                            </View>
                                            {[1, 2, 3, 4].map((opt, i) => {
                                                const optionText = currentQuestions[`option_${opt}`];
                                                if (!optionText) return null;
                                                const selected = finalJson[currentQuestionsIndex].answers == undefined || finalJson[currentQuestionsIndex].answers.length < 1 || finalJson[currentQuestionsIndex].answers[i] == "0" ? false : true;

                                                return (
                                                    <TouchableOpacity 
                                                        key={i} 
                                                        onPress={() => chooseOption(i)}
                                                        style={{
                                                            ...TestSeriesStyle.optionsCard,
                                                            borderColor: selected ? "#0274BA" : "#222222",
                                                            width: '100%',          // full width
                                                            flexDirection: 'row',   // icon + text side by side
                                                            flexWrap: 'wrap',       // wrap long text
                                                            alignItems: 'flex-start', 
                                                            padding: 8,
                                                        }}
                                                    >
                                                        <View style={{ paddingRight: 8 }}>
                                                            <Image source={imagePaths[`TEST_OPTION_${String.fromCharCode(64 + opt)}`]} />
                                                        </View>
                                                        <View style={{ flex: 1 }}>
                                                            <HTML 
                                                                contentWidth={windowWidth - 60} // subtract padding + image width
                                                                source={{ html: optionText }} 
                                                            />
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
                                    <View>
                                        <TouchableOpacity onPress={()=>markForReviewAndNext()} style={{ borderWidth: 1, borderColor: "#0000006b", borderRadius: 5 }}>
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
        borderTopLeftRadius: 5,
        borderBottomLeftRadius: 5,
    }
});