//import liraries
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  UIManager,
  StyleSheet,
} from 'react-native';
import Colors from '../../../Constants/Colors';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

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

const calculate_percentile = (my_rank, total_attempt) => {
  let beyond_me = parseFloat(total_attempt) - parseFloat(my_rank) > 0 ? parseFloat(total_attempt) - parseFloat(my_rank) : 1;
  return (beyond_me / parseFloat(total_attempt)) * 100;
}

export const ScoreCard = ({ resultData }) => {
  const [sections, setSections] = useState([]);
  const [totalScore, setTotalScore] = useState(0);
  const [totalAttempted, setTotalAttempted] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [hidePercentile, setHidePercentile] = useState(true);
  const [toppersList, setToppersList] = useState([]);

  useEffect(() => {
    // console.log("======",Object.keys(resultData?.my_progress));
    //console.log("======",resultData?.my_progress?.sec_ranks, "user rank: ", resultData?.my_progress?.user_rank);
    if (!resultData?.my_progress?.sections?.length) return;
    //console.log(resultData?.my_progress?.sections);
    const formatted = resultData.my_progress.sections.map((s, ind) => ({
      subject: s.subject,
      score: s.score,
      correct: s.correct,
      incorrect: s.in_correct,
      skipped: s.skipped,
      accuracy: s.accuracy,
      attempted: s.correct + s.in_correct,
      attempt_rate: s.attempt_rate,
      percentile: calculate_percentile(resultData?.my_progress?.sec_ranks[ind], resultData?.my_progress?.total_rank)
    }));
    setSections(formatted);

    setTotalScore(formatted.reduce((a, s) => a + (parseFloat(s.score) || 0), 0));
    const totalCorrect = formatted.reduce((a, s) => a + (parseFloat(s.correct) || 0), 0);
    const totalIncorrect = formatted.reduce((a, s) => a + (parseFloat(s.incorrect) || 0), 0);
    const totalAccurancy = formatted.reduce((a, s) => a + (parseFloat(s.accuracy) || 0), 0);
    setTotalAttempted(totalCorrect + totalIncorrect);
    //console.log("totalAccurancy",totalAccurancy);
    setAccuracy(((totalAccurancy / (formatted.length * 100)) * 100).toFixed(2));

    setHidePercentile(resultData.quiz.hide_percentile === "0" ? true : false);
    console.log("resultData.toppers",resultData.my_progress.toppers);
  }, [resultData]);

  if (!sections.length) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Scorecard...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* --- Summary --- */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Overall Summary</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Score:</Text>
            <Text style={[styles.infoValue, { color: UI_COLORS.TOTAL_SCORE }]}>
              {totalScore.toFixed(2)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Attempted Questions:</Text>
            <Text style={[styles.infoValue, { color: UI_COLORS.ATTEMPTED }]}>{totalAttempted}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Accuracy:</Text>
            <Text style={[styles.infoValue, { color: UI_COLORS.ACCURACY }]}>{accuracy}%</Text>
          </View>
        </View>

        {/* --- Collapsible Section Breakdown --- */}
        <Text style={styles.sectionHeading}>Section-wise Breakdown</Text>

        {sections.map((item, index) => {
          return (
            <View key={index} style={styles.sectionCard}>
              <TouchableOpacity
                onPress={() => toggleExpand(index)}
                activeOpacity={0.8}
                style={styles.sectionHeader}
              >
                <Text style={styles.sectionTitle}>{item.subject}</Text>
              </TouchableOpacity>

                <View style={styles.sectionDetails}>
                    <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Score:</Text>
                    <Text style={[styles.infoValue, { color: UI_COLORS.TOTAL_SCORE }]}>
                        {Number(item.score).toFixed(2)}
                    </Text>
                    </View>

                    <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Correct Answers:</Text>
                    <Text style={[styles.infoValue, { color: UI_COLORS.CORRECT }]}>{item.correct}</Text>
                    </View>

                    <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Incorrect Answers:</Text>
                    <Text style={[styles.infoValue, { color: UI_COLORS.INCORRECT }]}>
                        {item.incorrect}
                    </Text>
                    </View>

                    <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Skipped Questions:</Text>
                    <Text style={[styles.infoValue, { color: UI_COLORS.SKIPPED }]}>{item.skipped}</Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Attempted Questions:</Text>
                      <Text style={[styles.infoValue, { color: UI_COLORS.ATTEMPTED }]}>{item.attempted}</Text>
                    </View>

                    <View style={[styles.infoRow, styles.borderTop]}>
                      <Text style={styles.infoLabel}>% Accuracy:</Text>
                      <Text style={[styles.infoValue, { color: UI_COLORS.ACCURACY }]}>
                          {Number(item.accuracy).toFixed(2)}%
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>% Attempted:</Text>
                      <Text style={[styles.infoValue, { color: UI_COLORS.ATTEMPTED }]}>{item.attempt_rate.toFixed(2)}%</Text>
                    </View>
                    {
                      hidePercentile && <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>% Percentile:</Text>
                        <Text style={[styles.infoValue, { color: UI_COLORS.INCORRECT }]}>{item.percentile.toFixed(2)}%</Text>
                      </View>
                    }
                </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: UI_COLORS.HEADER_BG },
  scrollContent: { padding: 16, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: UI_COLORS.TEXT_DARK },

  summaryCard: {
    backgroundColor: UI_COLORS.CARD_BG,
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  summaryTitle: { fontSize: 16, fontWeight: 'bold', color: UI_COLORS.TEXT_DARK, marginBottom: 8 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  infoLabel: { fontSize: 14, color: '#555', flex: 1.3 },
  infoValue: { fontSize: 14, fontWeight: '600', color: UI_COLORS.TEXT_DARK, flex: 0.7, textAlign: 'right' },

  sectionHeading: {
    fontSize: 17,
    fontWeight: 'bold',
    color: UI_COLORS.TEXT_DARK,
    marginBottom: 8,
  },
  sectionCard: {
    backgroundColor: UI_COLORS.CARD_BG,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#f7f8fc',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: UI_COLORS.TEXT_DARK,
  },
  sectionDetails: {
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  borderTop: { borderTopWidth: 1, borderColor: '#eee', marginTop: 6, paddingTop: 6 },
});
