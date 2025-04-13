/* WelcomeScreen.tsx */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, Text, Divider } from 'react-native-paper';
import { PaperButton } from '../components/paper';
import { useNavigation } from '@react-navigation/native';

const WelcomeScreen = () => {
  ...
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2E8B57',
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default WelcomeScreen;