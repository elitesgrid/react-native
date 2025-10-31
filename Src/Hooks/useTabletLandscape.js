import { useEffect, useState } from 'react';
import { Dimensions, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

export default function useTabletLandscape() {
  const [isDeviceLandscape, setIsDeviceLandscape] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [isIpadTablet, setIsIpadTablet] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      const { width, height } = Dimensions.get('window');
      const isLandscape = width > height;

      // check if device is iPad or tablet
      const isTablet =
        Platform.isPad === true || DeviceInfo.isTablet?.() || false;

      setIsDeviceLandscape(isTablet && isLandscape);
      setIsLandscape(isLandscape);
      setIsIpadTablet(isTablet);
    };

    // initial check
    checkOrientation();

    // listen for orientation changes
    const subscription = Dimensions.addEventListener('change', checkOrientation);

    return () => subscription?.remove?.();
  }, []);

  return {
    isDeviceLandscape,
    isLandscape,
    isIpadTablet
  };
}
