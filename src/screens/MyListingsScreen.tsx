import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, Text, Divider } from 'react-native-paper';

const MyListingsScreen: React.FC = () => {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.headerContainer}>
        <Text
          variant="headlineLarge"
          style={[styles.title, { color: theme.colors.primary }]}
        >
          MyListings
        </Text>
      </View>

      <Divider />

      <View style={styles.contentContainer}>
        <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
          My Listings Screen
        </Text>
        <Text variant="bodyLarge" style={styles.placeholderText}>
          listings coming soon!
        </Text>
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
});

export default MyListingsScreen;