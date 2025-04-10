import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, Text, Divider } from 'react-native-paper';
import { PaperButton } from '../components/paper';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.headerContainer}>
        <Text
          variant="headlineLarge"
          style={[styles.title, { color: theme.colors.primary }]}
        >
          Profile
        </Text>
      </View>

      <Divider />

      <View style={styles.contentContainer}>
        <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
          Profile Screen
        </Text>
        <Text variant="bodyLarge" style={styles.placeholderText}>
          profile coming soon!
        </Text>
        <PaperButton
          mode="contained"
          onPress={() => navigation.navigate('Login')}
          style={styles.logoutButton}
        >
          Logout
        </PaperButton>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    flex: 1,
    textAlign: 'left',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    textAlign: 'center',
    marginVertical: 16,
  },
  logoutButton: {
    // Add styles for the logout button here
  },
});

export default ProfileScreen;