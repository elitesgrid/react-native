//import liraries
import React, {  } from 'react';
import {
  getStatusBarHeight,
} from 'react-native-iphone-x-helper';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Platform
} from 'react-native';
import {Image} from 'react-native-elements';
import imagePaths from '../Constants/imagePaths';
import {useNavigation} from '@react-navigation/native';
import Colors from '../Constants/Colors';

// create a component
const HeaderComp = ({
  onPressBack,
  headerStyles = {},
  headerTitle = '',
  ...props
}) => {
  const navigation = useNavigation();
  const goBack = function () {
    navigation.goBack(null);
  };
  return (
    <SafeAreaView style={[styles.headerView, headerStyles]}>
      <StatusBar backgroundColor={Colors.THEME} barStyle="light-content" />
      <View style={styles.headerContainer}>
        {/* LEFT: Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={onPressBack ? onPressBack : () => goBack()}>
          <Image source={imagePaths.BACK} style={styles.image} />
        </TouchableOpacity>

        {/* CENTER: Title */}
        <Text style={styles.headerTitle}>{headerTitle}</Text>

        {/* RIGHT: User ID */}
        <Text style={styles.userId}>{global.USER_ID || 'A'}</Text>
      </View>
    </SafeAreaView>
  );
};

// define your styles
const styles = StyleSheet.create({
  headerView: {
    paddingTop: Platform.select({
      ios: 0,
      android: 20,
    }),
    height:
      Platform.select({
        ios: 80,
        android: 40,
      }) + getStatusBarHeight(),
    width: '100%',
    justifyContent: 'center',
    backgroundColor: Colors.THEME,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  image: {
    height: 20,
    width: 20,
    tintColor: Colors.WHITE,
  },
  headerTitle: {
    color: Colors.WHITE,
    fontSize: 18,
    fontWeight: '600',
    // textAlign: 'center',
    flex: 1,
  },
  userId: {
    color: Colors.WHITE,
    fontSize: 14,
    backgroundColor: Colors.IDLE,
    paddingHorizontal: 5,
    opacity: 0.5,
  },
});

//make this component available to the app
export default HeaderComp;
