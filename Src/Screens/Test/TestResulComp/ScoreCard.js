//import liraries
import React, { useEffect, useState, useRef } from 'react';
import { View,
    Text,
    ScrollView,
    SafeAreaView,
    StyleSheet,
} from 'react-native';

import Colors from '../../../Constants/Colors'; 

const UI_COLORS = {    
    CORRECT: Colors.CORRECT || '#4CAF50',
    INCORRECT: Colors.INCORRECT || '#F44336',
    SKIPPED: Colors.SKIPPED || '#FFC107',
    TOTAL_SCORE: Colors.PRIMARY || '#007AFF', 
    ACCURACY: Colors.ACCURACY || '#2ecc71',
    ATTEMPTED: Colors.ATTEMPTED || '#1a2779',
    HEADER_BG: Colors.BG || '#f4f6fb',
    CARD_BG: Colors.WHITE || '#fff',
    TEXT_DARK: Colors.BLACK || '#222',
};

export const ScoreCard = ({ navigation, resultData }) => {
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    if (!resultData?.my_progress?.sections?.length) return;

    const sections = resultData.my_progress.sections;
    const newStructure = sections.map((section) => ({
        subject: section.subject,
        score: section.score,
        correct: section.correct,
        incorrect: section.in_correct,
        skipped: section.skipped,
        accuracy: section.accuracy,
        attempted: section.percentile, 
    }));
    setFilteredData(newStructure);
  }, [resultData]);
  
  if (filteredData.length === 0) {
      return (
          <View style={styles.loadingContainer}>
              <Text style={{ color: UI_COLORS.TEXT_DARK }}>Loading Scorecard...</Text>
          </View>
      );
  }
  
  const totalScore = filteredData.reduce((sum, item) => sum + Number(item.score || 0), 0);
  const totalCorrect = filteredData.reduce((sum, item) => sum + Number(item.correct || 0), 0);
  const totalIncorrect = filteredData.reduce((sum, item) => sum + Number(item.incorrect || 0), 0);
  const totalSkipped = filteredData.reduce((sum, item) => sum + Number(item.skipped || 0), 0);

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
                <Text style={[styles.dataCell, { fontWeight: '700', color: UI_COLORS.TOTAL_SCORE }]}>
                    {Number(section.score).toFixed(2)}
                </Text>
                <Text style={[styles.dataCell, { color: UI_COLORS.CORRECT }]}>{section.correct}</Text>
                <Text style={[styles.dataCell, { color: UI_COLORS.INCORRECT }]}>{section.incorrect}</Text>
                <Text style={[styles.dataCell, { color: UI_COLORS.SKIPPED }]}>{section.skipped}</Text>
                <Text style={[styles.dataCell, { fontWeight: '600' }]}>{Number(section.accuracy).toFixed(1)}%</Text>
            </View>
        ))}
        <View style={[styles.dataRow, styles.totalSummaryRow]}>
            <Text style={[styles.dataCell, styles.dataCellSubject, { fontWeight: 'bold' }]}>Total</Text>            
            <Text style={[styles.dataCell, { fontWeight: 'bold', color: UI_COLORS.TOTAL_SCORE }]}>
                {totalScore.toFixed(2)}
            </Text>
            <Text style={[styles.dataCell, { fontWeight: 'bold', color: UI_COLORS.CORRECT }]}>{totalCorrect}</Text>
            <Text style={[styles.dataCell, { fontWeight: 'bold', color: UI_COLORS.INCORRECT }]}>{totalIncorrect}</Text>
            <Text style={[styles.dataCell, { fontWeight: 'bold', color: UI_COLORS.SKIPPED }]}>{totalSkipped}</Text>
            <Text style={[styles.dataCell, { fontWeight: 'bold' }]}>
                {((totalCorrect / (totalCorrect + totalIncorrect)) * 100 || 0).toFixed(1)}%
            </Text>
        </View>

        {filteredData.some(s => s.attempted) && (
            <View style={styles.attemptedCardContainer}>
                <Text style={styles.attemptedCardTitle}>Attempted & Percentile</Text>
                <View style={[styles.headerRow, styles.attemptedHeader]}>
                    <Text style={[styles.headerCell, styles.headerCellSubject]}>Section</Text>
                    <Text style={styles.headerCell}>Percentile (%)</Text>
                </View>
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
    
    //
    headerRow: {
        flexDirection: 'row',
        backgroundColor: UI_COLORS.ATTEMPTED, 
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
        flex: 2, 
        textAlign: 'left',
        paddingLeft: 10,
    },
    
    dataRow: {
        flexDirection: 'row',
        backgroundColor: UI_COLORS.CARD_BG,
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 4, 
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
        backgroundColor: UI_COLORS.TEXT_DARK, 
        borderRadius: 10,
        borderWidth: 2,
        borderColor: UI_COLORS.TOTAL_SCORE, 
    },
    
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