//import liraries
import React, { useEffect, useState, useMemo } from 'react';
import { View,
    Text,
    ScrollView,
    useWindowDimensions,
    Image,
    TouchableOpacity,
    SafeAreaView,
    StyleSheet,
    TextInput,
    ImageBackground,
    Modal,
    Dimensions,
    useColorScheme
} from 'react-native';
//import { WebView } from 'react-native-webview';
import MenuDrawer from 'react-native-side-drawer'

import HTML from 'react-native-render-html';

import TestHeaderComp from '../../Components/TestHeaderComp';
import Colors from '../../Constants/Colors';
import TestSeriesStyle from '../../Assets/Style/TestSeriesStyle';
import imagePaths from '../../Constants/imagePaths';
import StorageManager from '../../Services/StorageManager';
import LoadingComp from '../../Components/LoadingComp'; // Assuming this is defined/used
import navigationStrings from '../../Constants/navigationStrings';
import TestServices from '../../Services/apis/TestServices';

const { width } = Dimensions.get('window');

// create a component
export const ViewSolution = (props) => {
    const { route, navigation } = props;
    const { width: windowWidth } = useWindowDimensions();
    const { params } = route;

    const [isOpen, setIsOpen] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [bookmarkModalVisibility,setBookmarkModalVisibility] = useState(false);
    const [cusName, setCusName] = useState('');
    const [profileImage, setProfileImage] = useState('');
    const [testSections, setTestSections] = useState([]);
    const [testQuestions, setTestQuestions] = useState([]);
    const [currentQuestions, setCurrentQuestions] = useState({});
    const [currentQuestionsIndex, setCurrentQuestionsIndex] = useState(0);
    const [visibleResponse, setVisibleResponse] = useState(false);
    const [fibActiveAnswers, setFibActiveAnswers] = useState(['', '', '', '']);
    const colorScheme = useColorScheme();
    const isNightMode = colorScheme === 'dark';
    const [drawerLegend, setDrawerLegend] = useState([
        { label: "Answered", key: "answered", count: 0 },
        { label: "Not Answered", key: "not_answered", count: 0 },
        { label: "Not Visited", key: "not_visited", count: 0 },
        { label: "Marked for Review", key: "marked_for_review", count: 0 },
        { label: "Answered & Marked for Review", key: "answered_marked_for_review", count: 0 },
    ]);

    const htmlTagsStyles = useMemo(() => {
        if (isNightMode) {
            if (isNightMode) {
                const baseStyle = {
                    whiteSpace: 'normal',
                    color: Colors.DARK,
                };
                return {
                    body: baseStyle,
                    p: baseStyle,
                    span: baseStyle,
                    li: baseStyle
                };
            }
        }
        return {};
    }, [isNightMode]);

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

        setVisibleResponse(false);
        setCurrentQuestions(currentQuestion);
        setCurrentQuestionsIndex(index);
        
        if (isOpen) {
            togglePallete();
        }
    }

    function chooseSection(secId) {
        const index = testQuestions.findIndex(item => item.section_id === secId);
        load_question(index);
    }

    async function togglePallete(){
        setIsOpen(!isOpen);
    }

    const nextQuestion = async function (){
        load_question(currentQuestionsIndex + 1);
    }

    const prevQuestion = async function (){
        load_question(currentQuestionsIndex - 1);
    }

    const showHideResponse = async function() {
        setVisibleResponse(!visibleResponse);
    }

    async function getTestViewSolution(params) {
        //console.log("View Solution", JSON.stringify(params))
        let localStatesTotal = {
            answered: 0,
            not_answered: 0,
            not_visited: 0,
            marked_for_review: 0,
            answered_marked_for_review: 0
        }
        
        params.my_progress.questions.forEach(question => {
            let que_type;
            switch (question.question_type) {
                case "3":
                    que_type = "FIB";
                    break;
                case "0":
                    que_type = "SC";
                    break;
                default:
                    que_type = "MC";
                    break;
            }

            question.question_type = que_type;
            const state = question.custom_json.state;
            localStatesTotal[state] = (localStatesTotal[state] || 0) + 1;
        });
        
        const updatedDrawerLegend = drawerLegend.map(val => ({
            ...val,
            count: localStatesTotal[val.key] || 0,
        }));
        
        setDrawerLegend(updatedDrawerLegend); // Set state with the new array

        //console.log("params.my_progress.questions",params.my_progress.questions);
        setTestSections(params.my_progress.sections);
        setTestQuestions(params.my_progress.questions);
        setIsLoading(false);
    }

    const watchVideoSolution = function (video){
        navigation.navigate(navigationStrings.PLAYER, {
            watched_time: 0,
            id: 0,
            length: 0,
            video_type: 0,
            url: video,
            title: params.quiz.title
        });
    }

    const getAnswerLetter = () => {
        let return_ = "N/A";
        if(currentQuestions.question_type == "SC" || currentQuestions.question_type == "MC"){
            const index = currentQuestions.custom_json.given_answer.findIndex(item => item === "1");
            if (index === -1){
                
            } else {
                const letters = ["A", "B", "C", "D"];
                return_ = letters[index];
            }
        } else if(currentQuestions.question_type == "FIB"){
            return_ = currentQuestions.custom_json.given_answer[0] || '';
        }
        return return_;
    };

    const markForReview = function(type, bookmark_type){
        const newBookmarkStatus = type === "0" ? "1" : "0";//1-add,0-remove
        if(newBookmarkStatus === "0" || bookmarkModalVisibility === true) {
            setBookmarkModalVisibility(false);
            TestServices.remove_bookmarked_question({
                test_id: params.quiz.id,
                q_id: currentQuestions.id,
                type: newBookmarkStatus,
                bookmark_type: bookmark_type
            }).then(async data => {
                setIsLoading(false);
                if (data.status === true) {
                    const updatedCurrentQuestion = {
                        ...currentQuestions,
                        is_bookmarked: newBookmarkStatus
                    };
                    setCurrentQuestions(updatedCurrentQuestion);

                    const updatedTestQuestions = testQuestions.map(question => {
                        if (question.id === currentQuestions.id) {
                            return {
                                ...question,
                                is_bookmarked: newBookmarkStatus
                            };
                        }
                        return question;
                    });
                    setTestQuestions(updatedTestQuestions);
                }
                return true;
            }).catch(error => {
                console.log('Error!', error.message);
                return false;
            });
        } else {
            setBookmarkModalVisibility(true);
        }
    };

    useEffect(function(){
        load_question( currentQuestionsIndex ? currentQuestionsIndex : 0);
    }, [testQuestions]);

    useEffect(function () {
        async function fetchData() {
            await getSessionData();
            const response = await getTestViewSolution(params);
        }
        fetchData();
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
                                    {testQuestions.map((item, index) => (
                                        <View key={index} style={styles.questionPaletteItem}>
                                            {pallete_highlighers(item.custom_json.state, item.sno, parseInt(item.sno) - 1)}
                                        </View>
                                    ))}
                                    </View>
                                </ScrollView>

                                {isOpen && (
                                    <TouchableOpacity
                                    onPress={() => setIsOpen(false)}
                                    style={styles.navCloseBtn}
                                    >
                                    <Text style={styles.navCloseText}>{'>'}</Text>
                                    </TouchableOpacity>
                                )}
                                </SafeAreaView>
                            }
                            drawerPercentage={80}
                            animationTime={250}
                            position={'right'}
                        >
                        <TestHeaderComp headerTitle={params.quiz.title} headerTestTime={''} togglePallete={togglePallete} />
                        <View style={styles.sectionHeaderBar}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{  }}>
                                {testSections.length && currentQuestions && testSections.map((section, idx) => (
                                    <TouchableOpacity 
                                    key={idx} 
                                    onPress={()=> chooseSection(section.id)}
                                    style={[
                                        styles.sectionButton,
                                        { 
                                            borderBottomColor: currentQuestions.section_id === section.id ? Colors.WHITE : Colors.THEME,
                                        }
                                    ]}>
                                        <Text style={styles.sectionButtonText}>{section.subject}</Text>
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
                                                    <Text style={{color: Colors.TEXT_COLOR}}>{"Passage"}</Text>
                                                    <HTML 
                                                    contentWidth={windowWidth} 
                                                    source={{ html: currentQuestions.passage }}
                                                    tagsStyles={htmlTagsStyles} />
                                                </View>
                                            }
                                            <View key={"1"}>
                                                {currentQuestions.passage !== "" &&
                                                    <Text style={{color: Colors.TEXT_COLOR}}>{"Question"}</Text>
                                                }
                                                <HTML 
                                                contentWidth={windowWidth}
                                                source={{ html: currentQuestions.question }}
                                                tagsStyles={htmlTagsStyles} />
                                            </View>
                                            {[1, 2, 3, 4].map((opt, i) => {
                                                const optionText = currentQuestions[`option_${opt}`];
                                                if (!optionText) return null;
                                                const selected = currentQuestions.custom_json.given_answer == undefined || currentQuestions.custom_json.given_answer.length < 1 || currentQuestions.custom_json.given_answer[i] == "0" || !visibleResponse ? false : true;
                                                //console.log("selected",selected, visibleResponse, currentQuestions.custom_json);
                                                return (
                                                    <TouchableOpacity 
                                                        key={i} 
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
                                                            style={{height: 30, width: 30}}
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
                                                                    }}
                                                                    style={styles.fibInput}
                                                                    placeholderTextColor={Colors.IDLE}
                                                            />
                                                            }
                                                            {
                                                                currentQuestions.question_type !== "FIB" && <HTML 
                                                                    contentWidth={windowWidth - 60} // subtract padding + image width
                                                                    source={{ html: optionText }} 
                                                                    tagsStyles={htmlTagsStyles}
                                                                />
                                                            }
                                                        </View>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                            <View key={"6"} style={{ flex: 1 }}>
                                                <View style={{ flex: 1 }}>
                                                    <View style={{ alignItems: "flex-end" }}>
                                                        <TouchableOpacity onPress={()=>showHideResponse()} style={styles.showHideResponseButton}>
                                                            <Text style={styles.showHideResponseText}>{visibleResponse ? 'Hide Response' : "Show Response"}</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            </View>
                                            {
                                                visibleResponse && (
                                                    <View
                                                        style={{
                                                            backgroundColor: "#fff",
                                                            borderRadius: 12,
                                                            padding: 15,
                                                            marginTop: 5,
                                                            shadowColor: "#000",
                                                            shadowOpacity: 0.1,
                                                            shadowRadius: 6,
                                                            elevation: 4,
                                                        }}
                                                        >
                                                        <View style={{ marginBottom: 12 }}>
                                                            <Text style={{ fontSize: 16, fontWeight: "600", color: "#333" }}>Your Answer</Text>
                                                            <View
                                                            style={{
                                                                marginTop: 6,
                                                                backgroundColor: "#EAF8F7",
                                                                padding: 10,
                                                                borderRadius: 8,
                                                                alignSelf: "flex-start",
                                                            }}
                                                            >
                                                            <Text style={{ fontSize: 15, color: "#00796B", fontWeight: "500" }}>{getAnswerLetter()}</Text>
                                                            </View>
                                                        </View>

                                                        {
                                                            currentQuestions.video !== '0' && currentQuestions.video && <TouchableOpacity
                                                                onPress={()=> watchVideoSolution(currentQuestions.video)}
                                                                style={{
                                                                    backgroundColor: "#007BFF",
                                                                    paddingVertical: 8,
                                                                    paddingHorizontal: 12,
                                                                    borderRadius: 8,
                                                                    alignSelf: "flex-start",
                                                                    marginBottom: 15,
                                                                }}
                                                            >
                                                                <Text style={{ color: "#fff", fontWeight: "600" }}>🎥 Watch Video Solution</Text>
                                                            </TouchableOpacity>
                                                        }

                                                        {
                                                            currentQuestions.solution && 
                                                            <View>
                                                                <Text style={{ fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 8 }}>
                                                                Solution
                                                                </Text>
                                                                <View
                                                                style={{
                                                                    backgroundColor: "#F9F9F9",
                                                                    borderRadius: 10,
                                                                    padding: 10,
                                                                    borderWidth: 1,
                                                                    borderColor: "#EEE",
                                                                }}
                                                                >
                                                                <HTML 
                                                                contentWidth={windowWidth - 60} 
                                                                source={{ html: currentQuestions.solution }}
                                                                tagsStyles={htmlTagsStyles} />
                                                                </View>
                                                            </View>
                                                        }
                                                    </View>
                                                )
                                            }
                                        </View>
                                    </View>
                                </ScrollView>
                                <View style={styles.bottomControlBar}>
                                    {currentQuestionsIndex > 0 ? (
                                        <TouchableOpacity
                                        onPress={() => prevQuestion()}
                                        style={[styles.prevNextButton, {backgroundColor: Colors.WHITE}]}>
                                        <Text style={[styles.prevNextButtonText, {backgroundColor: 'transparent', color: Colors.THEME}]}>
                                            Prev
                                        </Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <View style={{width: 80}} />
                                    )}

                                    <TouchableOpacity
                                        onPress={() => markForReview(currentQuestions.is_bookmarked, "0")}
                                        style={styles.markReviewButton}>
                                        <Text style={styles.markReviewText}>{currentQuestions.is_bookmarked !== "0" ? 'Remove Bookmark' : 'Add To Bookmark'}</Text>
                                    </TouchableOpacity>

                                    {currentQuestionsIndex + 1 < testQuestions.length ? (
                                        <TouchableOpacity
                                        onPress={() => nextQuestion()}
                                        style={styles.prevNextButton}>
                                        <Text style={styles.prevNextButtonText}>Next</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <View style={{width: 80}} />
                                    )}
                                </View>
                            </>
                        }
                        <Modal
                            visible={bookmarkModalVisibility}
                            transparent
                            animationType="fade"
                            statusBarTranslucent
                            >
                            <View style={styles.overlay}>
                                <View style={styles.modalContent}>
                                    <Text style={styles.title}>Add Bookmark To:</Text>

                                    <View style={styles.radioGroup}>
                                        {global.BOOKMARK_FILTERS.map((item, index) => {
                                        const isActive = 1 === item.key;

                                        return (
                                            <TouchableOpacity
                                            key={index}
                                            onPress={() => markForReview("0", item.key)}
                                            style={styles.radioItem}
                                            >
                                            <View style={[styles.radioCircle, isActive && styles.radioCircleSelected]}>
                                                {isActive && <View style={styles.radioDot} />}
                                            </View>
                                            <Text style={[styles.radioText, isActive && { color: '#0274BA', fontWeight: '600' }]}>
                                                {item.value}
                                            </Text>
                                            </TouchableOpacity>
                                        );
                                        })}
                                    </View>
                                </View>
                            </View>
                        </Modal>
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
  
  drawerContentContainer: {
    backgroundColor: Colors.WHITE,
    flex: 1, 
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
    padding: 16 ,
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
    alignItems: "center", 
    justifyContent: "center", 
    margin: 5 
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
    showHideResponseButton: {
        borderColor: "#DA4A54", 
        borderWidth: 1, 
        borderRadius: 10, 
        marginTop: 6, 
        width: "35%", 
        alignItems: "center"
    },
    showHideResponseText: {
        paddingVertical: 5, 
        color: "#DA4A54"
    },


    bottomControlBar: { 
        flexDirection:"row",
        justifyContent:"space-between", 
        paddingTop: 6,
        paddingBottom: 20,
        backgroundColor:Colors.WHITE, 
        paddingHorizontal: 10, 
    },
    prevNextButton: {
        borderWidth: 1,
        borderColor: Colors.THEME,
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: Colors.THEME,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 3,
    },
    prevNextButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.WHITE,
        textAlign: 'center',
    },
    markReviewButton: {
        borderWidth: 1,
        borderColor: '#0000003a',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#F6F7FB',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    markReviewText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#333',
        textAlign: 'center',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        alignSelf: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#05030D',
        marginBottom: 20,
    },
    radioGroup: {
        flexDirection: 'column',
    },
    radioItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    radioCircle: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#B4B4B7',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    radioCircleSelected: {
        borderColor: '#0274BA',
    },
    radioDot: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: '#0274BA',
    },
    radioText: {
        fontSize: 14,
        color: '#05030D',
    },
});