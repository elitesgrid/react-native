import { StyleSheet } from 'react-native';
import { moderateScale, scale, moderateVerticalScale } from 'react-native-size-matters';
import Colors from '../../Constants/Colors';

const TestSeriesStyle = StyleSheet.create({
  container: {
    flex: 1
  },
  ml_5: {
    marginLeft: 5
  },
  mr_5: {
    marginRight: 5
  },
  testListContainer: { paddingVertical: 10, paddingHorizontal: 10, borderColor: "#EEEEEE", backgroundColor: "white", borderWidth: 1, borderRadius: 10, marginVertical: 2.5, marginHorizontal: 2.5, width: "100%" },
  testListCart1: { flex: 1, flexDirection: "row" },
  testListCartTitle: { flex: 1, flexDirection: "column", marginLeft: 10 },
  testListTitle: { color: "#071630", fontSize: 16, fontWeight: "500" },
  testListMeta: { color: "#9096B4", fontSize: 12, fontFamily: "roboto", marginVertical: 3 },
  testListCart2: { flex: 1, flexDirection: "row", marginLeft: "17%" },
  testListButton: { borderRadius: 5, alignItems: "center", width: 'auto', height: 20, paddingHorizontal: 5, marginHorizontal: 2 },
  testAttemptMarksLabel: { backgroundColor: Colors.SUCCESS, marginHorizontal: 4, color: Colors.WHITE, width: "25%", textAlign: "center", borderRadius: 5, marginVertical: 3 },

  instHeading: { fontSize: 20, color: "#787878", marginLeft: "3%", marginTop: 4 },
  instHeadingGradient: { height: 38, justifyContent: "center", marginVertical: 3 },
  instHeadingGradientText: { color: "white", fontSize: 20, marginLeft: "3%" },
  instPointTick: { flex: 1, flexDirection: "row", marginHorizontal: "4%", marginVertical: 5,height:20 },
  instPointTickImage: { height: 20, width: 20 },
});

export default TestSeriesStyle;