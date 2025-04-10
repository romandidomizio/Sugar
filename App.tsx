import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { View, Image, StyleSheet } from 'react-native';

import { SugarTheme } from './src/theme/SugarTheme';
import { AppProvider } from './src/contexts/AppContext';
import { CartProvider } from './src/contexts/CartContext';
import MainNavigator from './src/navigation/MainNavigator';

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      setTimeout(() => setIsReady(true), 3000);
    };

    init();
  }, []);

  if (!isReady) return null;

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
