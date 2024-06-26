//import liraries
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

import HeaderComp from '../../Components/HeaderComp';

// create a component
export const C_Webview = (props) => {
    const { route, navigation } = props;
    var params = route.params;

    console.log(params);

    return (
        <View style={styles.container}>
            <HeaderComp headerTitle={params.title} />
            <View style={{ flex: 1 }}>
                <WebView
                    key={"web_view"}
                    originWhitelist={['*']}
                    source={{ uri: params.url }}
                    style={{
                        flex: 1
                    }}
                />
            </View>
        </View>
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
