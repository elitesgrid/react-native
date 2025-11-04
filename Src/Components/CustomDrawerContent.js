import React, {useEffect, useState} from 'react';
import {
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
} from 'react-native';
import navigationStrings from '../Constants/navigationStrings';
import Colors from '../Constants/Colors';
import StorageManager from '../Services/StorageManager';
import RNRestart from 'react-native-restart';
import envVariables from '../Constants/envVariables';
import { useConfirmDialog } from './ConfirmDialogContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DeviceInfo from 'react-native-device-info';
import AuthService from '../Services/apis/AuthService';

function CustomDrawerContent(props) {
  const {navigation} = props;
  const {showConfirmDialog} = useConfirmDialog();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState('');
  
  async function getSessionData() {
    let session = await StorageManager.get_session();
    if (Object.keys(session).length > 0) {
      setName(session.name);
      setEmail(session.email);
      setProfileImage(session.profile_image);
    }
  }

  const delete_account = function (){
    showConfirmDialog({
      title: DeviceInfo.getApplicationName(),
      message: 'Are you sure want to delete account?',
      onConfirm: async () => {
        await AuthService.de_activate_account({});
        // StorageManager.remove_session();
        RNRestart.Restart();
      },
    });
  }

  useEffect(() => {
    getSessionData();
  }, []);

  function fixProfileImage(url) {
    return url === '' ? <Icon 
    name="account-outline" 
    size={50} 
    color={Colors.THEME} style={styles.profileImage} /> : <Image
            source={{uri: url}}
            style={styles.profileImage}
          />;
  }

  function Logout() {
    showConfirmDialog({
      title: DeviceInfo.getApplicationName(),
      message: 'Are you sure want to logout?',
      onConfirm: () => {
        StorageManager.remove_session();
        RNRestart.Restart();
      },
    });
  }

  return (
    <DrawerContentScrollView
      style={{backgroundColor: Colors.BACKGROUND}}
      {...props}>
      {/* Profile Section */}
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate(navigationStrings.PROFILE);
          }}
          style={styles.profileContainer}>
          {fixProfileImage(profileImage)}
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{name || 'Guest User'}</Text>
            <Text style={styles.userEmail}>{email || 'No email'}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Drawer Items */}
      <View style={styles.menuSection}>
        <DrawerItem
          labelStyle={styles.drawerLabel}
          icon={() => (
            <Icon name="account-outline" size={22} color={Colors.THEME} style={{}} />
          )}
          label={'My Profile'}
          onPress={() => navigation.navigate(navigationStrings.PROFILE)}
        />
        <DrawerItem
          labelStyle={styles.drawerLabel}
          icon={() => (
            <Icon name="bookmark-outline" size={22} color={Colors.THEME} style={{}} />
          )}
          label={'Bookmark'}
          onPress={() => navigation.navigate(navigationStrings.BOOK_MARK)}
        />
        <DrawerItem
          labelStyle={styles.drawerLabel}
          icon={() => (
            <Icon name="cog-outline" size={22} color={Colors.THEME} style={{}} />
          )}
          label={'Change Password'}
          onPress={() =>
            navigation.navigate(navigationStrings.CHANGE_PASSWORD)
          }
        />
        <DrawerItem
          labelStyle={styles.drawerLabel}
          icon={() => (
            <Icon name="email-outline" size={22} color={Colors.THEME} style={{}} />
          )}
          label={'Contact Us'}
          onPress={() => navigation.navigate(navigationStrings.CONTACT_US)}
        />
        <DrawerItem
          labelStyle={styles.drawerLabel}
          icon={() => (
            <Icon name="trash-can-outline" size={22} color={Colors.THEME} style={{}} />
          )}
          label={'Delete Account'}
          onPress={() =>
            delete_account()
          }
        />
        <DrawerItem
          labelStyle={[styles.drawerLabel, {color: Colors.THEME}]}
          icon={() => (
            <Icon name="exit-to-app" size={22} color={Colors.THEME} style={{}} />
          )}
          label={'Sign Out'}
          onPress={Logout}
        />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.versionText}>{'V-' + envVariables.VERSION}</Text>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 0.3,
    borderBottomColor: '#ccc',
    backgroundColor: '#fff',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 55,
    height: 55,
    borderRadius: 28,
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.THEME,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  userEmail: {
    fontSize: 13,
    color: 'gray',
    marginTop: 2,
  },
  menuSection: {
    paddingVertical: 5,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  drawerLabel: {
    color: '#000',
    fontSize: 15,
    fontWeight: '500',
  },
  drawerIcon: {
    height: 20,
    width: 20,
    tintColor: Colors.THEME,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 10,
  },
  versionText: {
    fontSize: 11,
    color: 'gray',
    opacity: 0.7,
  },
});

export default CustomDrawerContent;
