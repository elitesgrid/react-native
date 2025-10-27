import React, { useState } from 'react';
import { Image } from 'react-native';
import imagePaths from '../Constants/imagePaths';

const MyImageComponent = ({
    url,
    fallbackImage = imagePaths.SPLASH,
    resizeMode="contain",
    style = { width: 200, height: 200 }
}) => {
    const [imageSource, setImageSource] = useState({ uri: url });
    // console.log(imageSource);
    return (
        <Image
            source={imageSource?.uri ? imageSource : fallbackImage}
            style={style}
            resizeMode={resizeMode}
            onError={() => setImageSource(null)}
        />
    );
};


export default MyImageComponent;