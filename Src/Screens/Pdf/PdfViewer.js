import React, { useEffect, useState } from 'react';
import { View, Dimensions, StyleSheet, ScrollView } from 'react-native';
import Pdf from 'react-native-pdf';

import HeaderComp from '../../Components/HeaderComp';
import CustomHelper from '../../Constants/CustomHelper';

// create a component
export const PdfViewer = (props) => {
    const { route, navigation } = props;
    const item = route.params;

    return (
        <View style={styles.container}>
            <HeaderComp headerTitle={item.title} />
                <Pdf
                    source={{ uri: item.url }}
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
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
});