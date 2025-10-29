import React, { useRef, useState } from 'react';
import { View, Dimensions, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Pdf from 'react-native-pdf';

import HeaderComp from '../../Components/HeaderComp';
import CustomHelper from '../../Constants/CustomHelper';

// create a component
export const PdfViewer = (props) => {
    const { route, navigation } = props;
    const item = route.params;

     const pdfRef = useRef(null);

    const [scale, setScale] = useState(1.0);

    const handleZoomIn = () => {
        if (scale < 3.0) {
            const newScale = scale + 0.25;
            setScale(newScale);
            pdfRef.current?.setNativeProps({ scale: newScale });
        }
    };

    const handleZoomOut = () => {
        if (scale > 1.0) {
            const newScale = scale - 0.25;
            setScale(newScale);
            pdfRef.current?.setNativeProps({ scale: newScale });
        }
    };

    return (
        <View style={styles.container}>
            <HeaderComp headerTitle={item.title} />
            <Pdf
                ref={pdfRef}
                source={{ uri: item.url }}
                scale={scale}
                minScale={1.0}
                maxScale={3.0}
                enablePaging={false}
                onLoadComplete={(numberOfPages, filePath) => {
                    console.log(`Number of pages: ${numberOfPages}`);
                }}
                onPageChanged={(page, numberOfPages) => {
                    console.log(`Current page: ${page}`);
                }}
                onError={(error) => {
                    console.log(error);
                    CustomHelper.showMessage(error.message || 'Error while opening PDF.');
                }}
                trustAllCerts={false}
                style={styles.pdf}
            />
            <View style={styles.zoomContainer}>
                <TouchableOpacity onPress={handleZoomOut} style={styles.zoomButton}>
                    <Text style={styles.zoomText}>−</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleZoomIn} style={styles.zoomButton}>
                    <Text style={styles.zoomText}>+</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    pdf: {
        flex: 1,
        width: '100%',
        height: Dimensions.get('window').height,
    },
    zoomContainer: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        flexDirection: 'column',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 8,
        padding: 5,
    },
    zoomButton: {
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    zoomText: {
        color: 'white',
        fontSize: 26,
        fontWeight: 'bold',
    },
});