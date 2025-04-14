/* LoadingScreen.tsx */
import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';

const WelcomeScreen = ({ onFinish }: { onFinish?: () => void }) => {
  useEffect(() => {
    const timeout = setTimeout(() => {
      onFinish?.();
    }, 3000); // 3-second loading

    return () => clearTimeout(timeout);
  }, [onFinish]);

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

export default WelcomeScreen;