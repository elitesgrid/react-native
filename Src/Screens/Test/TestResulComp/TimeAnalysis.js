import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  SectionList,
  TouchableOpacity,
} from 'react-native';

// --- Color Constants ---
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
  SECTION_HEADER: '#007AFF',
  SECTION_BACKGROUND: '#FFFFFF',
  TEXT_LIGHT: '#292c2aff',
};

// --- Single Item Component ---
const TimeListItem = ({ item }) => {
  const statusColor = item.status === 'Answered' ? Colors.EASY : Colors.SKIPPED;
  const diffColor =
    item.difficulty === 'Hard'
      ? Colors.HARD
      : item.difficulty === 'Medium'
      ? Colors.MEDIUM
      : Colors.EASY;

  const handlePress = () => {
    console.log(`Viewing details for Question ${item.questionNo} in ${item.section}`);
  };

  return (
    <TouchableOpacity style={styles.listItem} onPress={handlePress}>
      {/* 1. Question Number (Left) */}
      <View style={styles.itemSectionNo}>
        <Text style={styles.questionNoText}>{item.questionNo}</Text>
      </View>

      {/* 2. Main Metrics (Center) */}
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

        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>My Answer:</Text>
          <Text style={styles.metricValue}>{item.myAnswer || '—'}</Text>
        </View>

        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Correct Answer:</Text>
          <Text style={[styles.metricValue, { color: Colors.CORRECT }]}>
            {item.correctAnswer || '—'}
          </Text>
        </View>

        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>% Right:</Text>
          <Text style={styles.metricValue}>{item.percentRight}%</Text>
        </View>
      </View>

      {/* 3. Time Details (Right) */}
      <View style={styles.itemSectionTime}>
        <Text style={styles.timeLabel}>Your Time</Text>
        <Text style={styles.timeValue}>{item.timeSpentByMe}</Text>
        <Text style={styles.timeLabel}>Topper Time</Text>
        <Text style={styles.timeValue}>{item.timeSpentByToppers}</Text>
        <Text style={styles.timeLabel}>Avg Time (Right)</Text>
        <Text style={styles.timeValue}>{item.avgTimeRight}</Text>
      </View>
    </TouchableOpacity>
  );
};

// --- Section Header Component ---
const SectionHeader = ({ title, count }) => (
  <View style={styles.sectionHeaderContainer}>
    <Text style={styles.sectionHeaderText}>
      {title} ({count} Q)
    </Text>
  </View>
);

// --- Main Component ---
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
    resultData.my_progress.questions.forEach((element) => {
      const sectionName = sectionsMap[element.section_id];
      const difficultyLevel = element.que_level;
      const cj = element.custom_json;

      let targetData = 'Very Hard';
      switch (difficultyLevel) {
        case '0':
          targetData = 'Easy';
          break;
        case '1':
          targetData = 'Medium';
          break;
        case '2':
          targetData = 'Hard';
          break;
      }

      let state = '';
      switch (cj.state) {
        case 'answered_marked_for_review':
          state = 'Bookmarked';
          break;
        case 'answered':
        case 'not_visited':
        case 'not_answered':
        case 'marked_for_review':
          state = cj.state
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          break;
        default:
          state = cj.state !== '' ? cj.state : 'N/A';
          break;
      }

      if (!d[sectionName]) {
        d[sectionName] = {
          title: sectionName,
          count: 0,
          data: [],
        };
      }

      let your_answer = "";

      if (parseInt(element.question_type) === 0) {
        if (
          element.custom_json &&
          element.custom_json.given_answer &&
          Array.isArray(element.custom_json.given_answer)
        ) {
          for (let i = 0; i <= 10; i++) {
            const given = element.custom_json.given_answer[i];
            if (
              typeof given !== "undefined" &&
              given !== null &&
              element.custom_json.given_answer.length > 0 &&
              (given === true || given === 1 || given === "1")
            ) {
              your_answer = i;
            }
          }
        }

        if (typeof your_answer === "number" && !isNaN(your_answer)) {
          your_answer = your_answer + 1;
        } else {
          your_answer = "Not Attempted";
        }

      } else if (parseInt(element.question_type) === 3) {
        if (
          element.custom_json &&
          element.custom_json.given_answer &&
          Array.isArray(element.custom_json.given_answer) &&
          element.custom_json.given_answer[0]
        ) {
          your_answer = element.custom_json.given_answer[0];
        }
      }
      if (!your_answer) your_answer = "Not Attempted";

      
      let avgTimeRight = "0"
      if (element.total_right_attempt) {
        // When total right attempts are available
        const avg = Math.round(element.right_ans_consumed_sec / element.total_right_attempt);
        avgTimeRight = formatSecondsToMMSS(avg);
      } else if (element.custom_json?.question_id) {
        // When question_id exists in custom_json
        const queId = element.custom_json.question_id;
        const key = `que${queId}`;

        if (
          my_progress?.toppers_spent_Avg_time &&
          my_progress.toppers_spent_Avg_time[key]
        ) {
          const val = Math.round(my_progress.toppers_spent_Avg_time[key] / 10 * 100) / 100;
          avgTimeRight = formatSecondsToMMSS(val);
        } else {
          avgTimeRight = "N/A";
        }
      } else {
        avgTimeRight = "N/A";
      }

      let percent_right = "--";
      if (element.total_right_attempt && element.total_attempt) {
        const percent = (element.total_right_attempt * 100) / element.total_attempt;
        percent_right = `${percent.toFixed(2)}`;
      }

      // console.log(element);
      const data = {
        section: sectionName,
        questionNo: element.sno,
        myAnswer: your_answer,
        correctAnswer: parseInt(element.question_type) === 0 ? element.answer : element.option_1,
        avgTimeRight: avgTimeRight,
        percentRight: percent_right,
        difficulty: targetData,
        timeSpentByMe: formatSecondsToMMSS(cj.spent_time),
        status: state,
        timeSpentByToppers: formatSecondsToMMSS(element.topper_time),
      };

      d[sectionName].data.push(data);
      ++d[sectionName].count;
    });

    setSectionData(Object.values(d));
  }, [resultData]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <SectionList
        sections={sectionsData}
        keyExtractor={(item) => String(item.questionNo)}
        renderItem={({ item }) => <TimeListItem item={item} />}
        renderSectionHeader={({ section: { title, count } }) => (
          <SectionHeader title={title} count={count} />
        )}
        contentContainerStyle={styles.listContainer}
        initialNumToRender={10}
        maxToRenderPerBatch={8}
        windowSize={21}
      />
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  listContainer: {
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
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
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 10,
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
    fontSize: 11,
    color: Colors.TEXT_LIGHT,
  },
  metricValue: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.TEXT_DARK,
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
    fontSize: 11,
    fontWeight: '600',
    color: Colors.TEXT_DARK,
    marginBottom: 4,
  },
});
