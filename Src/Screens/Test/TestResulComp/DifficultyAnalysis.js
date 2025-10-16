//import liraries
import React, { useEffect, useState, useRef } from 'react';
import { View,
    Text,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    SafeAreaView,
    StyleSheet,
} from 'react-native';

import Colors from '../../../Constants/Colors';

// --- UI Constants for Consistency ---
const UI_COLORS = {
    // Attempt to use user's Colors, fallback to standard brights
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

// create a component
export const DifficultyAnalysis = ({ navigation, resultData }) => {
    const [easyData, setEasyData] = useState({});
    const [mediumData, setMediumData] = useState({});
    const [hardData, setHardData] = useState({});

    // QuestionButton remains mostly the same, but uses new styles
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

        // Logic for question number 22 (retained from original code)
        if (number === 22) {
            return (
                <TouchableOpacity style={[styles.questionCircle, { backgroundColor }]}>
                    <Text style={styles.questionNumberText}>{number}</Text>
                </TouchableOpacity>
            );
        }

        const handlePress = () => {
             // navigation.navigate('QuestionDetail', { questionNumber: number, type });
             console.log(`Question ${number} (${type}) pressed.`);
        };

        return (
            <TouchableOpacity style={[styles.questionCircle, { backgroundColor }]} onPress={handlePress}>
                <Text style={styles.questionNumberText}>{number}</Text>
            </TouchableOpacity>
        );
    };

    const SectionQuestions = ({ title, data }) => (
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{title}</Text>
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

    const DifficultyPanel = ({ title, data, style }) => {
        const hasData = Object.keys(data).length > 0;
        if (!hasData) return null; // Prevent rendering empty panels

        let headerColor;
        switch(title) {
            case 'Easy': headerColor = UI_COLORS.EASY; break;
            case 'Medium': headerColor = UI_COLORS.MEDIUM; break;
            case 'Hard': headerColor = UI_COLORS.HARD; break;
            default: headerColor = UI_COLORS.TEXT_DARK;
        }

        return (
            <View style={[styles.difficultyPanel, style]}>
                <Text style={[styles.difficultyHeader, { color: headerColor }]}>{title}</Text>
                {Object.entries(data).map(([sectionTitle, sectionData]) => (
                    <SectionQuestions key={sectionTitle} title={sectionTitle} data={sectionData} />
                ))}
            </View>
        );
    };

    useEffect(() => {
        if (!resultData?.my_progress?.questions?.length) return;

        const sectionsMap = resultData.my_progress.sections.reduce((acc, element) => {
            acc[element.id] = element.subject;
            return acc;
        }, {});

        const initialStructure = () => ({
            correct: [],
            incorrect: [],
            skipped: [],
        });

        let easy = {};
        let medium = {};
        let hard = {};
        resultData.my_progress.questions.forEach(element => {
            const sectionName = sectionsMap[element.section_id];
            const difficultyLevel = element.que_level; 
            const cj = element.custom_json;

            let targetData;
            switch(difficultyLevel) {
                case "0": targetData = easy; break;
                case "1": targetData = medium; break;
                case "2": targetData = hard; break;
                default: return; // Skip questions with invalid difficulty levels
            }

            if (!targetData[sectionName]) {
                targetData[sectionName] = initialStructure();
            }

            const isCorrect = cj.is_correct.toString() === "1";
            const isAnswered = cj.state === "answered";

            if (isAnswered) {
                if (isCorrect) {
                    targetData[sectionName].correct.push(element.sno);
                } else {
                    targetData[sectionName].incorrect.push(element.sno);
                }
            } else {
                targetData[sectionName].skipped.push(element.sno);
            }
        });

        setEasyData(easy);
        setMediumData(medium);
        setHardData(hard);
    }, [resultData]);

    // --- Render ---
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                
                {/* --- Indicator/Legend Section --- */}
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

                {/* --- Difficulty Panels (Easy, Medium, Hard) --- */}
                <View style={styles.panelsContainer}>
                    <DifficultyPanel title="Easy" data={easyData} />
                    <DifficultyPanel title="Medium" data={mediumData} />
                    <DifficultyPanel title="Hard" data={hardData} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};


// --- Stylesheet ---
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
    
    // --- Indicator Styles ---
    indicatorContainer: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    indicatorHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: UI_COLORS.TEXT_DARK,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        paddingBottom: 5,
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
    
    // --- Difficulty Panel Styles ---
    panelsContainer: {},
    difficultyPanel: {
        marginBottom: 20,
        borderRadius: 12,
        padding: 15,
        backgroundColor: '#FFFFFF',
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    difficultyHeader: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
        borderBottomWidth: 3, // Thicker underline for better separation
        paddingBottom: 8,
        borderBottomColor: '#F0F0F0', // Light gray divider
    },
    
    sectionContainer: {
        marginBottom: 15,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: UI_COLORS.TEXT_DARK,
        marginBottom: 10,
        paddingLeft: 5,
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