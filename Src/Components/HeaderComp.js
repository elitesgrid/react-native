import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Image } from 'react-native-elements';
import imagePaths from '../Constants/imagePaths';
import { useNavigation } from '@react-navigation/native';
import Colors from '../Constants/Colors';
import CommonStyles from '../Assets/Style/CommonStyle';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Using existing icon set

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
    <SafeAreaView style={[CommonStyles.headerView, headerStyles]}>
      <StatusBar
        backgroundColor={Colors.THEME}
        barStyle="light-content"
      />
      <View style={CommonStyles.HeaderContainer}>
        {/* LEFT: Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={onPressBack ? onPressBack : goBack}
        >
          <Icon name="arrow-left" size={22} color="#fff" />
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
    paddingHorizontal: 8,
    paddingVertical: 2,
    opacity: 0.5,
    borderRadius: 10,
  },
});

export default HeaderComp;
