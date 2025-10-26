import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  SectionList, // Key for section grouping
  TouchableOpacity,
} from 'react-native';

// Constants and Colors (as defined before)
const Colors = {
  CORRECT: '#4CAF50',
  INCORRECT: '#F44336',
  SKIPPED: '#FFC107',
  HARD: '#e74c3c',
  MEDIUM: '#f39c12',
  EASY: '#2ecc71',
  TIME_PRIMARY: '#1e90ff',
  BACKGROUND: '#f0f4f7',
  TEXT_DARK: '#333333',
  BORDER_LIGHT: '#E0E0E0',
  SECTION_HEADER: '#007AFF', // Blue for main section headers
  SECTION_BACKGROUND: '#FFFFFF',
  TEXT_LIGHT: "#292c2aff"
};

// --- Single Item Component for the SectionList ---
const TimeListItem = ({ item }) => {
  // Logic to determine time efficiency
  const yourTime = parseFloat(item.timeSpentByMe);
  const topperTime = parseFloat(item.timeSpentByToppers);
  const timeDifference = yourTime - topperTime;
  const isSlower = yourTime > topperTime && yourTime > 0;
  const isSkipped = item.status !== 'Answered';

  // Choose color based on efficiency
  const deltaColor = isSkipped
    ? Colors.SKIPPED
    : isSlower
    ? Colors.INCORRECT // Red for slow time
    : Colors.CORRECT; // Green for fast time

  const deltaText = isSkipped
    ? 'Skipped'
    : isSlower
    ? `+${timeDifference.toFixed(2)} Min (Slow)`
    : `${timeDifference.toFixed(2)} Min (Fast)`;

  const statusColor = item.status === 'Answered' ? Colors.EASY : Colors.SKIPPED;
  const diffColor =
    item.difficulty === 'Hard'
      ? Colors.HARD
      : item.difficulty === 'Medium'
      ? Colors.MEDIUM
      : Colors.EASY;

  const handlePress = () => {
    // Action to view question detail
    console.log(`Viewing details for Question ${item.questionNo} in ${item.section}`);
  };

  return (
    <TouchableOpacity style={styles.listItem} onPress={handlePress}>
      
      {/* 1. Question Number (Left) */}
      <View style={styles.itemSectionNo}>
        <Text style={styles.questionNoText}>{item.questionNo}</Text>
      </View>
      
      {/* 2. Metrics & Comparison (Center/Main) */}
      <View style={styles.itemSectionMetrics}>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Difficulty:</Text>
          <Text style={[styles.metricValue, { color: diffColor }]}>
            {item.difficulty}
          </Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Status:</Text>
          <Text style={[styles.metricValue, { color: statusColor }]}>
            {item.status}
          </Text>
        </View>
        
        {/* Comparison Line (The most critical part) */}
        <View style={styles.comparisonRow}>
          <Text style={styles.comparisonLabel}>Efficiency:</Text>
          <Text style={[styles.comparisonDelta, { color: deltaColor }]}>{deltaText}</Text>
        </View>
      </View>

      {/* 3. Time Details (Right) */}
      <View style={styles.itemSectionTime}>
        <Text style={styles.timeLabel}>Your Time</Text>
        <Text style={styles.timeValue}>{item.timeSpentByMe}</Text>
        <Text style={styles.timeLabel}>Topper Time</Text>
        <Text style={styles.timeValue}>{item.timeSpentByToppers}</Text>
      </View>
    </TouchableOpacity>
  );
};

// --- Section Header Component ---
const SectionHeader = ({ title, count }) => (
  <View style={styles.sectionHeaderContainer}>
    <Text style={styles.sectionHeaderText}>{title} ({count} Q)</Text>
  </View>
);

// --- Main Optimized Screen Component ---
export const TimeAnalysis = ({ resultData }) => {
    const [sectionsData, setSectionData] = useState([]);
 
    const formatSecondsToMMSS = (totalSeconds) => {
        const seconds = Math.max(0, Math.round(totalSeconds));

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        const paddedMinutes = String(minutes).padStart(2, '0');
        const paddedSeconds = String(remainingSeconds).padStart(2, '0');

        return `${paddedMinutes}:${paddedSeconds}`;
    };

    useEffect(() => {
        if (!resultData?.my_progress?.questions?.length) return;

        const sectionsMap = resultData.my_progress.sections.reduce((acc, element) => {
            acc[element.id] = element.subject;
            return acc;
        }, {});

        let d = {};
        resultData.my_progress.questions.forEach(element => {
            const sectionName = sectionsMap[element.section_id];
            const difficultyLevel = element.que_level; 
            const cj = element.custom_json;

            let targetData = "V Hard";
            switch(difficultyLevel) {
                case "0": 
                    targetData = "Easy";
                    break;
                case "1": 
                    targetData = "Medium"; 
                    break;
                case "2": 
                    targetData = "Hard"; 
                    break;
            }

            let state = "";
            switch(cj.state) {
                case "answered": 
                    state = "Answered";
                    break;
                case "not_visited": 
                    state = "Not Visited"; 
                    break;
                case "not_answered": 
                    state = "Not Answered"; 
                    break;
                case "answered_marked_for_review": 
                    state = "Bookmarked"; 
                    break;
                default: 
                    state = cj.state !== "" ? cj.state : "N/A"; 
                    break;
            }

            if (!d[sectionName]) {
                d[sectionName] = {
                    title: sectionName,
                    count: 0,
                    data: [],
                }
            }

            let data = {
                section: sectionName,
                questionNo: element.sno,
                myAnswer: element.answer,
                difficulty: targetData,
                timeSpentByMe: formatSecondsToMMSS(cj.spent_time),
                status: state,
                timeSpentByToppers: formatSecondsToMMSS(element.topper_time),
            }
            d[sectionName].data.push(data);
            ++d[sectionName].count;
        });
        d = Object.values(d);
        // console.log(d);
        setSectionData(d);
    }, [resultData]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <SectionList
        sections={sectionsData}
        keyExtractor={(item) => String(item.questionNo)}
        renderItem={({ item }) => <TimeListItem item={item} />}
        renderSectionHeader={({ section: { title, count } }) => <SectionHeader title={title} count={count} />}
        contentContainerStyle={styles.listContainer}
        // Essential optimization properties for SectionList
        initialNumToRender={10} 
        maxToRenderPerBatch={8}
        windowSize={21}
      />
    </SafeAreaView>
  );
};

// --- Stylesheet ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  listContainer: {
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  // --- Section Header Styles ---
  sectionHeaderContainer: {
    backgroundColor: Colors.SECTION_BACKGROUND,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginTop: 15,
    marginBottom: 5,
    borderRadius: 8,
    borderLeftWidth: 5,
    borderLeftColor: Colors.SECTION_HEADER,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.TEXT_DARK,
  },
  // --- List Item Styles (same as previous optimized version) ---
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.BORDER_LIGHT,
  },
  itemSectionNo: {
    width: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  questionNoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.TIME_PRIMARY,
  },
  itemSectionMetrics: {
    flex: 3.5,
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: Colors.BORDER_LIGHT,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.TEXT_LIGHT,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  comparisonRow: {
    marginTop: 5,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  comparisonLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.TEXT_DARK,
  },
  comparisonDelta: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  itemSectionTime: {
    flex: 1.5,
    paddingLeft: 10,
    alignItems: 'flex-end',
  },
  timeLabel: {
    fontSize: 10,
    color: Colors.TEXT_LIGHT,
  },
  timeValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.TEXT_DARK,
    marginBottom: 4,
  },
});