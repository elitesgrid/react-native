import * as React from 'react';
// import { View, Text } from 'react-native';
// import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { Login,Logout,Register,ForgotPassword,OtpVerification,C_Webview } from "../Screens/index";
import navigationStrings from '../Constants/navigationStrings';

const Stack = createStackNavigator();

export default function AuthStack() {
    return (
        <Stack.Navigator screenOptions={{headerShown:false}}>
            <Stack.Screen name={navigationStrings.LOGIN}  component={Login}/>
            <Stack.Screen name={navigationStrings.REGISTER} component={Register} />
            <Stack.Screen name={navigationStrings.LOGOUT} component={Logout} />
            <Stack.Screen name={navigationStrings.FORGOT_PASSWORD} component={ForgotPassword} />
            <Stack.Screen name={navigationStrings.OTP_VERIFICATION} component={OtpVerification} />
            <Stack.Screen name={navigationStrings.C_WEBVIEW} component={C_Webview} />
        </Stack.Navigator>
    )
}