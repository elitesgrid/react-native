import {StyleSheet} from 'react-native';
import Colors from '../../Constants/Colors';

const TestSeriesStyle = StyleSheet.create({
  container: {
    flex: 1,
  },
  ml_5: {
    marginLeft: 5,
  },
  mr_5: {
    marginRight: 5,
  },
  testListContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderColor: '#EEEEEE',
    backgroundColor: 'white',
    borderWidth: 1,
    borderRadius: 10,
    marginVertical: 2.5,
    marginHorizontal: 2.5,
    width: '100%',
  },
  testListCart1: {flex: 1, flexDirection: 'row'},
  testListCartTitle: {flex: 1, flexDirection: 'column', marginLeft: 10},
  testListTitle: {color: '#071630', fontSize: 16, fontWeight: '500'},
  testListMeta: {
    color: '#9096B4',
    fontSize: 12,
    fontFamily: 'roboto',
    marginVertical: 3,
  },
  testListCart2: {flex: 1, flexDirection: 'row'},
  testListButton: {
    borderRadius: 5,
    alignItems: 'center',
    width: 'auto',
    height: 20,
    paddingHorizontal: 5,
    marginHorizontal: 2,
  },
  testAttemptMarksLabel: {
    backgroundColor: Colors.SUCCESS,
    marginHorizontal: 4,
    color: Colors.WHITE,
    width: '25%',
    textAlign: 'center',
    borderRadius: 5,
    marginVertical: 3,
  },

  instHeading: {fontSize: 20, color: '#787878', marginLeft: '3%', marginTop: 4},
  instHeadingGradient: {
    height: 38,
    justifyContent: 'center',
    marginVertical: 3,
  },
  instHeadingGradientText: {color: 'white', fontSize: 20, marginLeft: '3%'},
  instPointTick: {
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: '4%',
    marginVertical: 5,
    height: 20,
  },
  instPointTickImage: {height: 20, width: 20},

  //Attempt Now
  testSectionsCard: {borderBottomColor: Colors.WHITE, borderBottomWidth: 3},
  testSectionsCardText: {
    fontSize: 16,
    color: Colors.WHITE,
    marginHorizontal: 8,
    marginVertical: 5,
  },
  questionTypeCard: {marginHorizontal: 8, marginVertical: 6},
  questionTypeText: {color: '#000000'},
  questionNumberingCard: {
    backgroundColor: '#0274ba42',
    width: '18%',
    alignItems: 'center',
  },
  questionNumberingText: {fontSize: 10, color: '#0274BA', marginVertical: 3},
  questionCard: {flex: 1, marginHorizontal: 15, marginTop: 8},
  optionsCard: {
    // flex: 0.1,
    backgroundColor: Colors.WHITE,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#222222',
    borderRadius: 20,
    overflow: 'scroll',
    marginVertical: 3,
    alignItems: 'center'
  },

  //Pallete Design
  pallete_container: {
    width: '100%',
    backgroundColor: Colors.WHITE,
    height: '100%',
  },
  pallete_header: {
    flexDirection: "row", 
    alignItems: "center", 
    paddingTop: 30,
    paddingBottom: 12, 
    paddingHorizontal: 16, 
    backgroundColor: Colors.THEME 
  },
  pallete_symbol_card: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '45%'
  },
  pallete_symblo_card_image: {
    height: 30,
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
    marginHorizontal: 1
  },
});

export default TestSeriesStyle;
