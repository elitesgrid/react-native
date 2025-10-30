//import liraries
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Colors from '../../../Constants/Colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const TestToppersList = ({testRankers}) => {
  const top3 = testRankers.slice(0, 3);
  const others = testRankers.slice(3);

  return (
    <ScrollView
    contentContainerStyle={{
        paddingHorizontal: 16,
        paddingBottom: 40,
        paddingTop: 20,
    }}
    >
    {/* --- Top 3 podium --- */}
    {top3.length > 0 && (
        <View style={styles.podiumContainer}>
        {/* Rank #2 - Left */}
        {top3[1] && (
            <View style={[styles.podiumBox, { height: 140, backgroundColor: '#C0C0C0' }]}>
            <Icon name="medal-outline" size={28} color="#fff" style={{ marginBottom: 4 }} />
            <Text style={styles.podiumRank}>#2</Text>
            <Text style={styles.podiumName}>{top3[1].name}</Text>
            <Text style={styles.podiumMarks}>{top3[1].marks} Marks</Text>
            </View>
        )}

        {/* Rank #1 - Center */}
        {top3[0] && (
            <View
            style={[
                styles.podiumBox,
                {
                height: 180,
                backgroundColor: Colors.THEME,
                borderWidth: 2,
                borderColor: '#fff',
                shadowColor: Colors.THEME,
                shadowOpacity: 0.6,
                shadowRadius: 10,
                elevation: 8,
                },
            ]}
            >
            <Icon name="crown" size={34} color="#FFD700" style={{ marginBottom: 6 }} />
            <Text style={[styles.podiumRank, { color: '#fff' }]}>#1</Text>
            <Text style={[styles.podiumName, { color: '#fff' }]}>{top3[0].name}</Text>
            <Text style={[styles.podiumMarks, { color: '#fff' }]}>{top3[0].marks} Marks</Text>
            </View>
        )}

        {/* Rank #3 - Right */}
        {top3[2] && (
            <View style={[styles.podiumBox, { height: 120, backgroundColor: '#CD7F32' }]}>
            <Icon name="trophy-outline" size={28} color="#fff" style={{ marginBottom: 4 }} />
            <Text style={styles.podiumRank}>#3</Text>
            <Text style={styles.podiumName}>{top3[2].name}</Text>
            <Text style={styles.podiumMarks}>{top3[2].marks} Marks</Text>
            </View>
        )}
        </View>
    )}

    {/* --- Others list --- */}
    {others.length > 0 ? (
        <View style={{ marginTop: 25 }}>
        {others.map((item, index) => (
            <View key={index} style={styles.listCard}>
            <View style={[styles.rankCircle, { backgroundColor: Colors.THEME }]}>
                <Text style={styles.rankText}>#{item.ranks}</Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.nameText}>{item.name}</Text>
                <Text style={styles.marksText}>{item.marks} Marks</Text>
            </View>
            </View>
        ))}
        </View>
    ) : (
        testRankers.length === 0 && (
        <View style={styles.noDataView}>
            <Text style={styles.noDataText}>No rankers available yet.</Text>
        </View>
        )
    )}
    </ScrollView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    marginBottom: 20,
    marginTop: 10,
  },
  podiumBox: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: 10,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  podiumRank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  podiumName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginTop: 4,
  },
  podiumMarks: {
    fontSize: 13,
    color: '#fff',
    marginBottom: 6,
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    padding: 15,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  rankCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  rankText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  nameText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.TEXT,
  },
  marksText: {
    fontSize: 13,
    color: Colors.GRAY_TEXT,
  },
  noDataView: {
    alignItems: 'center',
    marginTop: 50,
  },
  noDataText: {
    fontSize: 16,
    color: Colors.GRAY_TEXT,
  },
});
