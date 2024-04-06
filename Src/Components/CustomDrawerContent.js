import React from 'react';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { MyPortal } from '../Screens';
import { Image } from 'react-native-elements';
import navigationStrings from '../Constants/navigationStrings';
import imagePaths from '../Constants/imagePaths';
import Colors from '../Constants/Colors';
import { View, StyleSheet, TouchableOpacity,Text } from 'react-native';

import StorageManager from '../Services/StorageManager';
import RNRestart from 'react-native-restart';

function CustomDrawerContent(props) {
  const { navigation } = props;
  const onProfilePress = () => {
    alert("Move to profile");
  }


function Logout(){
    StorageManager.remove_session();
    alert("You are logged Out SUccessfylly");
    RNRestart.Restart();
    //navigation.navigate(navigationStrings.LOGIN);
}

  return (
    <DrawerContentScrollView style={{ backgroundColor: Colors.BACKGROUND }} {...props}>
      <View style={styles.container}>
        <TouchableOpacity onPress={onProfilePress} style={styles.profileContainer}>
          <Image source={imagePaths.PROFILE} style={styles.profileImage} />
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{"Mohit"}</Text>
            <Text style={styles.userEmail}>{"Ninja@gmail.com"}</Text>
          </View>
        </TouchableOpacity>
      </View>
      <DrawerItem labelStyle={{ color: "black" }} icon={() => <Image source={imagePaths.HOME} style={{ height: 20, width: 20 }}></Image>} label={"Test"} onPress={() => { navigation.navigate(navigationStrings.MY_PORTAL) }}></DrawerItem>
      <DrawerItem labelStyle={{ color: "black" }} icon={() => <Image source={imagePaths.HOME} style={{ height: 20, width: 20 }}></Image>} label={"Logout"} onPress={() => { Logout() }}></DrawerItem>
      {/* <DrawerItemList {...props} /> */}
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
    color: 'gray',
  },
});


export default CustomDrawerContent;