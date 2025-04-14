import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const LoadingScreen = () => {
  const navigation = useNavigation();
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (imageLoaded) {
      console.log('[LoadingScreen] logo loaded');
      const timeout = setTimeout(() => {
        console.log('[LoadingScreen] navigating to Welcome');
        navigation.navigate('Welcome');
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [imageLoaded]); // ✅ dependency on imageLoaded

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/sugar_logo.gif')}
        onLoadEnd={() => setImageLoaded(true)}
        style={styles.logo}
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
  logo: {
    width: 200,
    height: 200,
  },
});

export default LoadingScreen;
