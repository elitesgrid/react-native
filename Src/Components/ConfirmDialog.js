import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import Colors from '../Constants/Colors';
import imagePaths from '../Constants/imagePaths';

const ConfirmDialog = ({
  visible = false,
  title = 'Are you sure?',
  message = 'Do you want to continue?',
  confirmText = 'YES',
  cancelText = 'NO',
  onConfirm = () => {},
  onCancel = () => {},
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.dialogBox}>
          {/* Alert Icon */}
          <Image
            source={imagePaths.LOGO}
            style={styles.icon}
            resizeMode="contain"
          />

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={onCancel}
              activeOpacity={0.8}
              style={[styles.button, styles.cancelButton]}>
              <Text style={[styles.buttonText, styles.cancelText]}>
                {cancelText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              activeOpacity={0.8}
              style={[styles.button, styles.confirmButton]}>
              <Text style={[styles.buttonText, styles.confirmText]}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogBox: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 25,
    paddingHorizontal: 20,
    alignItems: 'center',
    elevation: 8,
  },
  icon: {
    width: 60,
    height: 60,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
    marginBottom: 6,
  },
  message: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 22,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  confirmButton: {
    borderColor: Colors.THEME || '#007AFF',
    backgroundColor: Colors.THEME || '#007AFF',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  cancelText: {
    color: '#444',
  },
  confirmText: {
    color: '#fff',
  },
});

export default ConfirmDialog;
