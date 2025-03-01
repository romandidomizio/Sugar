import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';

import { SugarTheme } from './src/theme/SugarTheme';
import { AppProvider } from './src/contexts/AppContext';
import MainNavigator from './src/navigation/MainNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={SugarTheme}>
        <AppProvider>
          <MainNavigator />
          <StatusBar style="auto" />
        </AppProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}