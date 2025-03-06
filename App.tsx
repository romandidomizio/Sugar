import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';

import { SugarTheme } from './src/theme/SugarTheme';
import { AppProvider } from './src/contexts/AppContext';
import MainNavigator from './src/navigation/MainNavigator';
import { CartProvider } from './src/contexts/CartContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={SugarTheme}>
        <AppProvider>
          <CartProvider>
            <MainNavigator />
            <StatusBar style="auto" />
          </CartProvider>
        </AppProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
