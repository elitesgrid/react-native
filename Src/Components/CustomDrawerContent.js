import React,{useEffect , useState} from 'react';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { MyPortal } from '../Screens';
import { Image } from 'react-native-elements';
import navigationStrings from '../Constants/navigationStrings';
import imagePaths from '../Constants/imagePaths';
import Colors from '../Constants/Colors';
import { View, StyleSheet, TouchableOpacity,Text } from 'react-native';

import StorageManager from '../Services/StorageManager';
import RNRestart from 'react-native-restart';
import envVariables from '../Constants/envVariables';

function CustomDrawerContent(props) {
  const { navigation } = props;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState("");


  async function getSessionData(){
    let session = await StorageManager.get_session();
    if(Object.keys(session).length > 0){
      setName(session.name);
      setEmail(session.email);
      setProfileImage(session.profile_image);
    }
  }

  useEffect(function () {
    async function fetchData() {
      // You can await here       
      const response = await getSessionData();
      console.log(response);
    }
    fetchData();
  }, []);

  function fixProfileImage(url){
    return  url === ""?imagePaths.H_PROFILE:{uri:url};
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
        <TouchableOpacity onPress={() => { navigation.navigate(navigationStrings.PROFILE) }} style={styles.profileContainer}>
          <Image source={imagePaths.PROFILE} style={styles.profileImage} />
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{name}</Text>
            <Text style={styles.userEmail}>{email}</Text>
          </View>
        </TouchableOpacity>
      </View>
      <DrawerItem 
        labelStyle={styles.drawerLabel} 
        icon={() => <Image source={fixProfileImage(profileImage)} style={styles.drawerIcon}></Image>}
        label={"My Profile"} 
        onPress={() => { navigation.navigate(navigationStrings.PROFILE) }}>
      </DrawerItem>
      {/* <DrawerItem 
        labelStyle={styles.drawerLabel} 
        icon={() => <Image source={imagePaths.BOOK_MARK} style={styles.drawerIcon}></Image>}
        label={"Bookmark"} 
        onPress={() => { navigation.navigate(navigationStrings.MY_PORTAL) }}>
      </DrawerItem> */}
      <DrawerItem 
        labelStyle={styles.drawerLabel} 
        icon={() => <Image source={imagePaths.SETTING} style={styles.drawerIcon}></Image>}
        label={"Change Password"} 
        onPress={() => { navigation.navigate(navigationStrings.CHANGE_PASSWORD) }}>
      </DrawerItem>
      {/* <DrawerItem 
        labelStyle={styles.drawerLabel} 
        icon={() => <Image source={imagePaths.HELP_CIRCLE} style={styles.drawerIcon}></Image>}
        label={"Helps"} 
        onPress={() => { navigation.navigate(navigationStrings.MY_PORTAL) }}>
      </DrawerItem> */}
      <DrawerItem 
        labelStyle={styles.drawerLabel} 
        icon={() => <Image source={imagePaths.CONTACT_US} style={styles.drawerIcon}></Image>}
        label={"Contact Us"} 
        onPress={() => { navigation.navigate(navigationStrings.CONTACT_US) }}>
      </DrawerItem>
      <DrawerItem 
        labelStyle={styles.drawerLabel} 
        icon={() => <Image source={imagePaths.DELETE} style={styles.drawerIcon}></Image>}
        label={"Delete Account"} 
        onPress={() => { navigation.navigate(navigationStrings.C_WEBVIEW,{title:"Delete Account",url:envVariables.DELETE_ACCOUNT_URL}) }}>
      </DrawerItem>
      <DrawerItem 
        labelStyle={styles.drawerLabel} 
        icon={() => <Image source={imagePaths.SIGN_OUT} style={styles.drawerIcon}></Image>}
        label={"Sign Out"} 
        onPress={() => {Logout()}}>
      </DrawerItem>
      <View style={{alignItems:"center"}}>
        <Text style={{fontSize:10,color:"gray",opacity:0.5}}>{"V-2222"}</Text>
      </View>
      {/* <DrawerItemList {...props} /> */}
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 8,
    borderBottomWidth:0.3,
    borderBottomColor:"gray"
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 25,
    marginRight: 10,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight:"500"
  },
  userEmail: {
    fontSize: 12,
    color: 'gray',
  },
  drawerLabel:{
    color: "#000000"
  },
  drawerIcon:{ height: 15, width: 15 }
});


export default CustomDrawerContent;