//import liraries
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import HeaderComp from '../../Components/HeaderComp';
import Colors from '../../Constants/Colors';
import TestServices from '../../Services/apis/TestServices';
import LoadingComp from '../../Components/LoadingComp';
import CustomHelper from '../../Constants/CustomHelper';
import { TestToppersList } from './TestResulComp/TestToppersList';

export const TestRankers = (props) => {
  const { route, navigation } = props;
  const { params } = route;

  const [isLoading, setIsLoading] = useState(true);
  const [testRankers, setTestRankers] = useState([]);

  async function getTestRankers(params) {
    let payload = { test_id: params.id };
    try {
      const response = await TestServices.get_rankers(payload);
      setIsLoading(false);
      if (response.status === true && response.data?.toppers) {
        setTestRankers(response.data.toppers);
      } else {
        setTestRankers([]);
      }
    } catch (error) {
      setIsLoading(false);
      CustomHelper.showMessage(error.message);
    }
  }

  useEffect(() => {
    getTestRankers(params);
  }, [navigation, params]);

  if (isLoading) return <LoadingComp />;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.BACKGROUND }}>
      <HeaderComp headerTitle={params.title || 'Test Rankers'} />

      <TestToppersList testRankers={testRankers}></TestToppersList>
    </View>
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
