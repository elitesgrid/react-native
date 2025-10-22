import React, { useState, useEffect } from 'react';
import {Image, SafeAreaView, StatusBar, Text, View} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Routes from './Src/Navigation/Routes';

const App = () => {
  return (
    <SafeAreaProvider style={{flex:1}}>
      <Routes />
    </SafeAreaProvider>
  );
};

export default App;