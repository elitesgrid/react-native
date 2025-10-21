import { View, Text, ActivityIndicator, Image, StyleSheet, Dimensions } from 'react-native';
import imagePaths from '../Constants/imagePaths';
import Colors from '../Constants/Colors';
const { width, height } = Dimensions.get('window');

export default LoadingComp = ({ 
  message = "Loading..." 
}) => {
    return (
        <View style={styles.overlay}>
            <View style={styles.container}>
                <Image
                    source={imagePaths.LOGO} // adjust the path as needed
                    style={styles.logo}
                    resizeMode="contain"
                />
                <ActivityIndicator size="large" color={Colors.THEME} style={styles.spinner} />
                <Text style={styles.message}>{message}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
  overlay: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        width,
        height,
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1000,
    },
    container: {
      width: '70%',
      alignItems: 'center',
      padding: 30,
      top: -100,
      backgroundColor: Colors.WHITE,
      borderRadius: 16,
      shadowColor: Colors.BLACK,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 10,
    },
    logo: {
        width: 80,
        height: 80,
        marginBottom: 20,
    },
    spinner: {
        marginBottom: 20,
    },
    message: {
        fontSize: 16,
        color: Colors.TEXT_COLOR,
    },
});