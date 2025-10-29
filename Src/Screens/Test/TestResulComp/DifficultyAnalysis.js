import React, { useEffect, useState, useRef } from 'react';
import { View,
    Text,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StyleSheet,
} from 'react-native';

import Colors from '../../../Constants/Colors';

const UI_COLORS = {
    CORRECT: Colors.CORRECT || '#4CAF50',
    INCORRECT: Colors.INCORRECT || '#F44336',
    SKIPPED: Colors.SKIPPED || '#FFC107',
    EASY: Colors.EASY || '#2ecc71',
    MEDIUM: Colors.MEDIUM || '#f39c12',
    HARD: Colors.HARD || '#e74c3c',
    BACKGROUND: Colors.BG || '#f4f6fb',
    TEXT_DARK: Colors.TEXT || '#333333',
    CARD_BORDER: '#E0E0E0',
};

export const DifficultyAnalysis = ({ navigation, resultData }) => {
    const [sectionData, setSectionData] = useState({}); 
    const [easyData, setEasyData] = useState({});
    const [mediumData, setMediumData] = useState({});
    const [hardData, setHardData] = useState({}); 

    const QuestionButton = ({ number, type }) => {
        let backgroundColor;
        switch (type) {
            case 'correct':
                backgroundColor = UI_COLORS.CORRECT;
                break;
            case 'incorrect':
                backgroundColor = UI_COLORS.INCORRECT;
                break;
            case 'skipped':
                backgroundColor = UI_COLORS.SKIPPED;
                break;
            default:
                backgroundColor = '#BDBDBD'; 
        }

        if (number === 22) {
            return (
                <TouchableOpacity style={[styles.questionCircle, { backgroundColor }]}>
                    <Text style={styles.questionNumberText}>{number}</Text>
                </TouchableOpacity>
            );
        }

        const handlePress = () => {
             console.log(`Question ${number} (${type}) pressed.`);
        };

        return (
            <TouchableOpacity style={[styles.questionCircle, { backgroundColor }]} onPress={handlePress}>
                <Text style={styles.questionNumberText}>{number}</Text>
            </TouchableOpacity>
        );
    };

    const DifficultyButtons = ({ difficulty, data }) => {
        let headerColor;
        switch(difficulty) {
            case 'Easy': headerColor = UI_COLORS.EASY; break;
            case 'Medium': headerColor = UI_COLORS.MEDIUM; break;
            case 'Hard': headerColor = UI_COLORS.HARD; break;
            default: headerColor = UI_COLORS.TEXT_DARK;
        }

        const hasQuestions = data.correct.length > 0 || data.incorrect.length > 0 || data.skipped.length > 0;
        if (!hasQuestions) return null;

        return (
            <View style={styles.difficultySectionContainer}>
                <Text style={[styles.difficultyLevelTitle, { color: headerColor }]}>{difficulty}</Text>
                <View style={styles.questionsRow}>
                    {data.incorrect.map(num => (
                        <QuestionButton key={`inc-${num}`} number={num} type="incorrect" />
                    ))}
                    {data.correct.map(num => (
                        <QuestionButton key={`cor-${num}`} number={num} type="correct" />
                    ))}
                    {data.skipped.map(num => (
                        <QuestionButton key={`skip-${num}`} number={num} type="skipped" />
                    ))}
                </View>
            </View>
        );
    };

    const SectionPanel = ({ title, data }) => {
        const hasData = Object.keys(data).length > 0;
        if (!hasData) return null; 

        return (
            <View style={styles.sectionPanel}>
                <Text style={styles.sectionHeader}>{title}</Text>
                
                <DifficultyButtons difficulty="Easy" data={data.Easy} />
                <DifficultyButtons difficulty="Medium" data={data.Medium} />
                <DifficultyButtons difficulty="Hard" data={data.Hard} />
            </View>
        );
    };

    useEffect(() => {
        if (!resultData?.my_progress?.questions?.length) return;

        const sectionsMap = resultData.my_progress.sections.reduce((acc, element) => {
            acc[element.id] = element.subject;
            return acc;
        }, {});

        const initialStatusStructure = () => ({
            correct: [],
            incorrect: [],
            skipped: [],
        });

        let newSectionAnalysis = {};

        resultData.my_progress.questions.forEach(element => {
            if(!element.custom_json){
                element.custom_json = {
                    given_answer: [],
                    is_correct: 0, 
                    marks: 0, 
                    question_id: element.id, 
                    section_id: element.section_id, 
                    spent_time: 0, 
                    state: "not-answered"
                }
            }
            const sectionName = sectionsMap[element.section_id] || 'Unknown Section';
            const difficultyCode = element.que_level; 
            const cj = element.custom_json;

            let difficultyLevel;
            switch(difficultyCode) {
                case "0": difficultyLevel = "Easy"; break;
                case "1": difficultyLevel = "Medium"; break;
                case "2": difficultyLevel = "Hard"; break;
                default: return; 
            }
            
            if (!newSectionAnalysis[sectionName]) {
                newSectionAnalysis[sectionName] = {
                    'Easy': initialStatusStructure(),
                    'Medium': initialStatusStructure(),
                    'Hard': initialStatusStructure(),
                };
            }

            const isCorrect = cj.is_correct.toString() === "1";
            const isAnswered = cj.state === "answered";
            const targetDifficultyData = newSectionAnalysis[sectionName][difficultyLevel];

            if (isAnswered) {
                if (isCorrect) {
                    targetDifficultyData.correct.push(element.sno);
                } else {
                    targetDifficultyData.incorrect.push(element.sno);
                }
            } else {
                targetDifficultyData.skipped.push(element.sno);
            }
        });

        setSectionData(newSectionAnalysis);
        setEasyData({});
        setMediumData({});
        setHardData({});
    }, [resultData]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                
                <View style={styles.indicatorContainer}>
                    <Text style={styles.indicatorHeader}>Indicator</Text>
                    <View style={styles.legendRow}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendCircle, { backgroundColor: UI_COLORS.CORRECT }]} />
                            <Text style={styles.legendText}>Correct</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendCircle, { backgroundColor: UI_COLORS.INCORRECT }]} />
                            <Text style={styles.legendText}>Incorrect</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendCircle, { backgroundColor: UI_COLORS.SKIPPED }]} />
                            <Text style={styles.legendText}>Skipped</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.panelsContainer}>
                    {Object.entries(sectionData).map(([sectionTitle, data]) => (
                        <SectionPanel 
                            key={sectionTitle} 
                            title={sectionTitle} 
                            data={data} 
                        />
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};


const baseCard = {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
};

const baseHeader = {
    fontSize: 18,
    fontWeight: 'bold',
    color: UI_COLORS.TEXT_DARK,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 5,
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: UI_COLORS.BACKGROUND, 
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 15,
        paddingBottom: 20,
        paddingTop: 10,
    },
    
    indicatorContainer: {
        ...baseCard,
    },
    indicatorHeader: {
        ...baseHeader,
        fontSize: 19,
        borderBottomWidth: 2,
    },
    legendRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
        paddingRight: 15,
    },
    legendCircle: {
        width: 14,
        height: 14,
        borderRadius: 7,
        marginRight: 8,
    },
    legendText: {
        fontWeight: '500',
        fontSize: 13,
        color: UI_COLORS.TEXT_DARK, 
    },
    
    panelsContainer: {},

    sectionPanel: {
        ...baseCard,
    },
    sectionHeader: {
        ...baseHeader,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        borderBottomWidth: 3, 
        paddingBottom: 8,
        borderBottomColor: '#E0E0E0',
    },
    
    difficultySectionContainer: {
        marginBottom: 15,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
        paddingLeft: 5,
    },
    difficultyLevelTitle: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 10,
    },
    questionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    
    questionCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 5, 
    },
    questionNumberText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: 'bold',
    }
});