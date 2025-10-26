import {StyleSheet} from 'react-native';
import {
  moderateScale,
  scale,
  moderateVerticalScale,
} from 'react-native-size-matters';
import Colors from '../../Constants/Colors';

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  containerChild: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'white',
  },
  logo_bg_parent: {
    alignItems: 'center',
  },
  logo_bg: {
    width: moderateVerticalScale(220),
    resizeMode: 'contain',
  },
  title_master: {
    marginHorizontal: moderateScale(30),
    marginTop: moderateScale(30),
  },
  title: {
    fontWeight: '400',
    fontSize: scale(20),
    color: '#120D26',
    textAlign: 'center',
    marginTop: 20
  },
  form: {
    marginTop: moderateVerticalScale(20),
    marginLeft: moderateVerticalScale(20),
    width: '90%',
  },
  inputSection: {
    flexDirection: 'row',
    paddingHorizontal: moderateVerticalScale(20),
    marginBottom: moderateVerticalScale(20),
    borderColor: '#E4DFDF',
    borderWidth: 1,
    borderRadius: scale(50),
    height: 50,
    alignItems: 'center',
  },
  imageRightStyle: {
    resizeMode: 'stretch',
    position: 'absolute',
    right: 15,
  },
  form_input: {
    marginLeft: moderateScale(12),
    width: '80%',
    color: Colors.BLACK,
  },
  forgot_password: {
    alignSelf: 'flex-end',
    marginBottom: moderateVerticalScale(20),
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    height: moderateVerticalScale(44),
    backgroundColor: '#0065A4',
    borderRadius: 50,
    flexDirection: 'row'
  },
  button_label: {
    color: '#fff',
    fontSize: scale(15),
  },
  login_footer_text: {
    textAlign: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    color: '#808080',
    fontSize: scale(15),
    // position:"absolute",
    bottom: 50,
  },
  login_footer_link: {
    color: '#208AEC',
    fontSize: scale(15),
    fontWeight: 'bold',
  },
  bottomView: {
    justifyContent: 'center',
    marginTop: moderateVerticalScale(60),
    marginBottom: moderateVerticalScale(34),
  },
});

export default Styles;
