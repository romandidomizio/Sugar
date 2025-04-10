import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, Text, Divider, SegmentedButtons } from 'react-native-paper';

const MessagesScreen: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('messages');

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.headerContainer}>
        <Text
          variant="headlineLarge"
          style={[styles.title, { color: theme.colors.primary }]}
        >
          Messages
        </Text>
      </View>

      <Divider />
      
      {/* Tab Filter */}
      <View style={styles.tabContainer}>
        <SegmentedButtons
          value={activeTab}
          onValueChange={setActiveTab}
          buttons={[
            {
              value: 'messages',
              label: 'Messages',
            },
            {
              value: 'notifications',
              label: 'Notifications',
            },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      <View style={styles.contentContainer}>
        {activeTab === 'messages' ? (
          <>
            <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
              Messages
            </Text>
            <Text variant="bodyLarge" style={styles.placeholderText}>
              messages coming soon!
            </Text>
          </>
        ) : (
          <>
            <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
              Notifications
            </Text>
            <Text variant="bodyLarge" style={styles.placeholderText}>
              notifications coming soon!
            </Text>
          </>
        )}
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
  tabContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  segmentedButtons: {
    backgroundColor: 'transparent',
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

export default MessagesScreen;