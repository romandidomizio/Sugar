import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import * as Font from 'expo-font';
import { Asset } from 'expo-asset'; //npx expo install expo-asset

import { SugarTheme } from './src/theme/SugarTheme';
import { AppProvider } from './src/contexts/AppContext';
import { CartProvider } from './src/contexts/CartContext';
import MainNavigator from './src/navigation/MainNavigator';

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        //pre-load fonts
        await Font.loadAsync({
          'Hoefler-Regular': require('./assets/Fonts/Hoefler-Regular.ttf'),
          'Hoefler-Bold': require('./assets/Fonts/Hoefler-Bold.otf'),
          'Hoefler-Italic': require('./assets/Fonts/Hoefler-Italic.ttf'),
        });

        //pre-load gif logo
        await Asset.loadAsync([require('./assets/sugar_logo.gif')]);
        await Asset.loadAsync([require('./assets/sugar.png')]);

        // Add additional setup here check auth?
      } catch (e) {
        console.warn('Asset loading failed', e);
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

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
