import React, { useState, useEffect } from 'react';
import {Image, SafeAreaView, StatusBar, Text, View} from 'react-native';

import Routes from './Src/Navigation/Routes';

const App = () => {
  return (
    <View style={{flex:1}}>
      <Routes />
    </View>
  );
};

export default App;