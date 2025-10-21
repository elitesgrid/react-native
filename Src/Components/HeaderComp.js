import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Image } from 'react-native-elements';
import imagePaths from '../Constants/imagePaths';
import { useNavigation } from '@react-navigation/native';
import Colors from '../Constants/Colors';
import { getStatusBarHeight } from 'react-native-iphone-x-helper';

const HeaderComp = ({
  onPressBack,
  headerStyles = {},
  headerTitle = '',
}) => {
  const navigation = useNavigation();

  const goBack = () => {
    navigation.goBack(null);
  };

  return (
    <SafeAreaView style={[styles.safeArea, headerStyles]}>
      <StatusBar
        backgroundColor={Colors.THEME}
        barStyle="light-content"
      />
      <View style={styles.headerContainer}>
        {/* LEFT: Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={onPressBack ? onPressBack : goBack}
        >
          <Image source={imagePaths.BACK} style={styles.image} />
        </TouchableOpacity>

        {/* CENTER: Title */}
        <Text numberOfLines={1} style={styles.headerTitle}>
          {headerTitle}
        </Text>

        {/* RIGHT: User ID */}
        <Text style={styles.userId}>{global.USER_ID || 'A'}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Colors.THEME,
    paddingTop: Platform.select({
      ios: getStatusBarHeight(),         // Handles iOS notch and non-notch
      android: getStatusBarHeight(true), // Handles Android notch & status bar
    }),
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
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
    flex: 1,
    // textAlign: 'center',
  },
  userId: {
    color: Colors.WHITE,
    fontSize: 14,
    backgroundColor: Colors.IDLE,
    paddingHorizontal: 5,
    opacity: 0.5,
  },
});

export default HeaderComp;
