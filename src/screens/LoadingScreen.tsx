/* LoadingScreen.tsx: Smart loading screen */
import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const LoadingScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    console.log('[LoadingScreen] mounted');
    const timeout = setTimeout(() => {
      console.log('[LoadingScreen] navigating to Login');
      navigation.navigate('Login'); //change to "Welcome" after
    }, 3000);
  
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/sugar_logo.gif')}
        style={styles.gif}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2E8B57',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gif: {
    width: 200,
    height: 200,
  },
});

export default LoadingScreen;