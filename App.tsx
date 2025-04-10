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

  // Show loading animation before rendering the main app
  useEffect(() => {
    const init = async () => {
      // Simulate loading async resources (fonts, auth, etc.)
      setTimeout(() => setIsReady(true), 3000);
    };

    init();
  }, []);

  if (!isReady) return null;

  // Main app once loading is complete
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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#2E8B57',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingGif: {
    width: 200,
    height: 200,
  },
});
