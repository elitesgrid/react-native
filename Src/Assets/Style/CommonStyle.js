import {StatusBar, StyleSheet} from 'react-native';
import {
  ifIphoneX,
  getStatusBarHeight,
  getBottomSpace,
} from 'react-native-iphone-x-helper';
import {
  moderateScale,
  scale,
  moderateVerticalScale,
} from 'react-native-size-matters';
import Colors from '../../Constants/Colors';

const CommonStyles = StyleSheet.create({
  container: {
    paddingTop: moderateVerticalScale(150),
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'white',
  },
  ml_5: {
    marginLeft: 5,
  },
  mr_5: {
    marginRight: 5,
  },
  headerView: {
    height: 80 + getStatusBarHeight(),
    width: '100%',
    justifyContent: 'center',
    backgroundColor: Colors.THEME,
  },
  notificationImage: {
    height: 20,
    width: 20,
    marginRight: moderateScale(10),
  },
  hamburgerImage: {
    height: 20,
    width: 20,
    marginLeft: moderateScale(10),
  },
  HeaderContainer: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    color: 'white',
    fontSize: 18,
  },
  logo_bg_parent: {
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginBottom: 10,
    marginTop: 20,
  },
  sectionHeaderTitle: {
    fontWeight: '800',
    fontSize: 16,
    color: 'black',
  },
  courseListCard: {
    borderColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  courseListCardSize: {
    width: 246,
    height: 223,
  },
  CourseListInfo: {marginLeft: 5, marginVertical: 10},
  courseListCardImage: {width: 246, height: 105, resizeMode: 'stretch'},
  courseListCardTitleContainer: {height: 20, marginVertical: 8},
  Title: {color: Colors.TEXT_COLOR, fontSize: 16},
  Tag: {fontSize: 12},
  btnColor: {color: Colors.WHITE},
  flexRow: {display: 'flex', flexDirection: 'row'},
  flexRowItemCenter: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '40%',
  },
  CourseListIconStyle: {height: 12, width: 12, marginRight: 5},
  CourseListPriceSection: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  CourseListPrice: {color: '#05030D', fontSize: 16, fontWeight: '500'},
  CourseListStrikePrice: {
    color: '#071630',
    fontSize: 13,
    opacity: 0.5,
    textDecorationLine: 'line-through',
  },
  CourseListDetailButton: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: Colors.THEME,
  },

  videoListCardSize: {width: 246, height: 138},
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {width: 50, height: 50, opacity: 0.7},
  reviewListCard: {
    borderColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: 5,
    marginHorizontal: 5,
    marginTop: 30,
  },
  reviewListCardSize: {width: 246, height: 250, margin: 15},

  bottomTabImages: {height: 20, width: 20, marginTop: 3},
  bottomTabLabel: {marginBottom: 5, fontSize: 13},
});

export default CommonStyles;
