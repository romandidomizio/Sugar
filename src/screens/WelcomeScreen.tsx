import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Looking at gradients - npx expo install expo-linear-gradient
import { useNavigation } from '@react-navigation/native';
import { PaperButton } from '../components/paper';

const WelcomeScreen = () => {
  const navigation = useNavigation();

  return (
    <LinearGradient
      colors={['#F0FFF0', '#587651']} // Old color on fingma #587651 #90EE90 #CFF5CF #F0FFF0
      style={styles.container}
    >
      <View style={styles.content}>
        <Image source={require('../../assets/sugar.png')} style={styles.logo} />
        <Text style={styles.title}>Welcome!</Text>
        <Text style={styles.paragraph}>
          Discover a local food-sharing community where small-scale growers, hobbyists, and conscious consumers come together to reduce waste, support one another, and make fresh food more accessible. It’s like your neighborhood farmers' market—only online and always open.
        </Text>

        <View style={styles.buttonRow}>
          <PaperButton
            mode="contained"
            onPress={() => navigation.navigate('Login')}
            style={styles.loginButton}
          >
            Login
          </PaperButton>

          <PaperButton
            mode="contained"
            onPress={() => navigation.navigate('Register')}
            style={styles.registerButton}
          >
            Register
          </PaperButton>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#587651',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 231,
    height: 250,
    resizeMode: 'contain',
    marginBottom: 12,
  },
  title: {
    fontSize: 36,
    fontFamily: 'Hoefler-Regular',
    color: '#f3e1d6', // #d8a990  #f3e1d6  #eacdbd
  },
  paragraph: {
    fontSize: 16,
    fontFamily: 'Hoefler-Regular',
    color: '#f3e1d6',
    marginTop: 16,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  loginButton: {
    flex: 1,
  },
  registerButton: {
    flex: 1,
  },
});

export default WelcomeScreen;
