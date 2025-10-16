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

import Colors from '../../../Constants/Colors'; // Assuming Colors provides essential colors
import TestSeriesStyle from '../../../Assets/Style/TestSeriesStyle';
import imagePaths from '../../../Constants/imagePaths';
import TestServices from '../../../Services/apis/TestServices';
import CustomHelper from '../../../Constants/CustomHelper';
import HeaderComp from '../../../Components/HeaderComp';

// --- UI Constants for Consistency ---
const UI_COLORS = {
    // These colors are used for metrics that denote status
    CORRECT: Colors.CORRECT || '#4CAF50',
    INCORRECT: Colors.INCORRECT || '#F44336',
    SKIPPED: Colors.SKIPPED || '#FFC107',
    TOTAL_SCORE: Colors.PRIMARY || '#007AFF', // Using a primary color for the main score
    ACCURACY: Colors.ACCURACY || '#2ecc71',
    ATTEMPTED: Colors.ATTEMPTED || '#1a2779',
    HEADER_BG: Colors.BG || '#f4f6fb',
    CARD_BG: Colors.WHITE || '#fff',
    TEXT_DARK: Colors.BLACK || '#222',
};

// --- Reusable Component for a Single Metric Row ---
const MetricRow = ({ title, value, color, isPercentage }) => {
    // Determine the color for the value, prioritizing explicit color if provided
    const valueColor = color ? color : UI_COLORS.TEXT_DARK;
    const formattedValue = isPercentage ? `${value}%` : value;

    return (
        <View style={styles.metricRow}>
            <Text style={styles.metricTitle}>{title}</Text>
            <Text style={[styles.metricValue, { color: valueColor }]}>{formattedValue}</Text>
        </View>
    );
};


// create a component
export const ScoreCard = ({ navigation, resultData }) => {
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    if (!resultData?.my_progress?.sections?.length) return;

    // The structure will hold the column titles and an array of objects for data points
    // New structure: Group data by SECTION (row) rather than by METRIC (column)
    const sections = resultData.my_progress.sections;
    const newStructure = sections.map((section) => ({
        subject: section.subject,
        score: section.score,
        correct: section.correct,
        incorrect: section.in_correct,
        skipped: section.skipped,
        accuracy: section.accuracy,
        attempted: section.percentile, // Using percentile for attempted_percent
    }));

    // For the overall ScoreCard structure, we just need the array of sections
    setFilteredData(newStructure);
  }, [resultData]);

  // If data isn't processed yet, return a loading view or null
  if (filteredData.length === 0) {
      return (
          <View style={styles.loadingContainer}>
              <Text style={{ color: UI_COLORS.TEXT_DARK }}>Loading Scorecard...</Text>
          </View>
      );
  }

  // Calculate the overall test totals for the final row
  const totalScore = filteredData.reduce((sum, item) => sum + Number(item.score || 0), 0);
  const totalCorrect = filteredData.reduce((sum, item) => sum + Number(item.correct || 0), 0);
  const totalIncorrect = filteredData.reduce((sum, item) => sum + Number(item.incorrect || 0), 0);
  const totalSkipped = filteredData.reduce((sum, item) => sum + Number(item.skipped || 0), 0);

  // The simplified data structure will be rendered in a single table-like view

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.mainTitle}>Sectional Score Analysis</Text>

        {/* --- Header Row (Titles) --- */}
        <View style={styles.headerRow}>
            <Text style={[styles.headerCell, styles.headerCellSubject]}>Section</Text>
            <Text style={styles.headerCell}>Score</Text>
            <Text style={styles.headerCell}>C</Text>
            <Text style={styles.headerCell}>I</Text>
            <Text style={styles.headerCell}>S</Text>
            <Text style={styles.headerCell}>Acc(%)</Text>
        </View>

        {/* --- Data Rows (Sections) --- */}
        {filteredData.map((section, index) => (
            <View key={index} style={styles.dataRow}>
                <Text style={[styles.dataCell, styles.dataCellSubject]}>{section.subject}</Text>
                
                {/* Score (Total) */}
                <Text style={[styles.dataCell, { fontWeight: '700', color: UI_COLORS.TOTAL_SCORE }]}>
                    {Number(section.score).toFixed(2)}
                </Text>

                {/* Correct */}
                <Text style={[styles.dataCell, { color: UI_COLORS.CORRECT }]}>{section.correct}</Text>

                {/* Incorrect */}
                <Text style={[styles.dataCell, { color: UI_COLORS.INCORRECT }]}>{section.incorrect}</Text>

                {/* Skipped */}
                <Text style={[styles.dataCell, { color: UI_COLORS.SKIPPED }]}>{section.skipped}</Text>
                
                {/* Accuracy */}
                <Text style={[styles.dataCell, { fontWeight: '600' }]}>{Number(section.accuracy).toFixed(1)}%</Text>
            </View>
        ))}

        {/* --- Total Summary Row --- */}
        <View style={[styles.dataRow, styles.totalSummaryRow]}>
            <Text style={[styles.dataCell, styles.dataCellSubject, { fontWeight: 'bold' }]}>Total</Text>
            
            <Text style={[styles.dataCell, { fontWeight: 'bold', color: UI_COLORS.TOTAL_SCORE }]}>
                {totalScore.toFixed(2)}
            </Text>

            <Text style={[styles.dataCell, { fontWeight: 'bold', color: UI_COLORS.CORRECT }]}>{totalCorrect}</Text>
            <Text style={[styles.dataCell, { fontWeight: 'bold', color: UI_COLORS.INCORRECT }]}>{totalIncorrect}</Text>
            <Text style={[styles.dataCell, { fontWeight: 'bold', color: UI_COLORS.SKIPPED }]}>{totalSkipped}</Text>
            
            {/* Overall Accuracy */}
            <Text style={[styles.dataCell, { fontWeight: 'bold' }]}>
                {((totalCorrect / (totalCorrect + totalIncorrect)) * 100 || 0).toFixed(1)}%
            </Text>
        </View>

        {/* --- Attempted Percentage Card (Separate summary block for better visual impact) --- */}
        {filteredData.some(s => s.attempted) && (
            <View style={styles.attemptedCardContainer}>
                <Text style={styles.attemptedCardTitle}>Attempted & Percentile</Text>
                
                {/* Header Row for Attempted Data */}
                <View style={[styles.headerRow, styles.attemptedHeader]}>
                    <Text style={[styles.headerCell, styles.headerCellSubject]}>Section</Text>
                    <Text style={styles.headerCell}>Attempted (%)</Text>
                </View>

                {/* Data Rows for Attempted Data */}
                {filteredData.map((section, index) => (
                    <View key={`att-${index}`} style={styles.dataRow}>
                        <Text style={[styles.dataCell, styles.dataCellSubject]}>{section.subject}</Text>
                        <Text style={[styles.dataCell, { flex: 1, textAlign: 'right', paddingRight: 10 }]}>
                            {Number(section.attempted).toFixed(1)}%
                        </Text>
                    </View>
                ))}
            </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: UI_COLORS.HEADER_BG,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 12,
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: UI_COLORS.HEADER_BG,
    },
    mainTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: UI_COLORS.TEXT_DARK,
        marginBottom: 15,
    },
    
    // --- Table/Grid Styles ---
    headerRow: {
        flexDirection: 'row',
        backgroundColor: UI_COLORS.ATTEMPTED, // Use a strong color for the header
        paddingVertical: 10,
        borderRadius: 8,
        marginBottom: 5,
    },
    headerCell: {
        flex: 1,
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
        textAlign: 'center',
    },
    headerCellSubject: {
        flex: 2, // Allocate more space for the subject name
        textAlign: 'left',
        paddingLeft: 10,
    },
    
    dataRow: {
        flexDirection: 'row',
        backgroundColor: UI_COLORS.CARD_BG,
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 4, // Reduce margin to make it look like a cohesive list/table
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
    },
    dataCell: {
        flex: 1,
        fontSize: 13,
        textAlign: 'center',
        color: UI_COLORS.TEXT_DARK,
    },
    dataCellSubject: {
        flex: 2,
        textAlign: 'left',
        paddingLeft: 10,
        fontWeight: '600',
        fontSize: 14,
    },
    totalSummaryRow: {
        marginTop: 10,
        backgroundColor: UI_COLORS.TEXT_DARK, // Dark background for the total row
        borderRadius: 10,
        borderWidth: 2,
        borderColor: UI_COLORS.TOTAL_SCORE, // Highlight border
    },
    // --- Attempted Percentage Card Styles (Secondary Data) ---
    attemptedCardContainer: {
        backgroundColor: UI_COLORS.CARD_BG,
        marginTop: 20,
        padding: 10,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    attemptedCardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: UI_COLORS.TEXT_DARK,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 5,
    },
    attemptedHeader: {
        backgroundColor: UI_COLORS.SECTION_HEADER || '#888',
    }
});