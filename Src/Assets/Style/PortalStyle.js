import {StyleSheet} from 'react-native';
import {
  moderateScale,
  scale,
  moderateVerticalScale,
} from 'react-native-size-matters';
import Colors from '../../Constants/Colors';

const PortalStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  ml_5: {
    marginLeft: 5,
  },
  mr_5: {
    marginRight: 5,
  },
  SubjectTopicCard: {
    borderColor: '#EEEEEE',
    backgroundColor: 'white',
    borderWidth: 1,
    borderRadius: 10,
    marginVertical: 2.5,
    marginHorizontal: 2.5,
  },
  SubjectTopicContainer: {
    flex: 1,
    flexDirection: 'row',
    height: 80,
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  SubjectTopicImage: {height: 48, width: 48, marginHorizontal: 5},
  SubjectTopicInfoSection: {justifyContent: 'center', marginLeft: 10},
  SubjectTopicInfoTitle: {
    color: '#071630',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 6,
  },
  SubjectTopicInfoMeta: {color: '#9096B4', fontSize: 12, fontFamily: 'roboto'},
});

export default PortalStyles;
