import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SegmentedButtons, Surface, Text } from 'react-native-paper';

export default function MessagesNotificationsTabs() {
  const [activeTab, setActiveTab] = useState('messages');

  return (
    <Surface style={styles.container} elevation={1}>
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
      
      <View style={styles.contentContainer}>
        {activeTab === 'messages' ? (
          <Text>Messages content goes here</Text>
        ) : (
          <Text>Notifications content goes here</Text>
        )}
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  contentContainer: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
});