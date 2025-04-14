import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useTheme, Text, Divider } from 'react-native-paper';
import SearchBar from '../components/SearchBar';

interface CommunityItem {
  id: string;
  title: string;
  description: string;
  postedBy: string;
}

const sampleCommunityItems: CommunityItem[] = [
  {
    id: '1',
    title: 'Neighborhood Clean-Up',
    description: 'Join us to clean up the park this weekend!',
    postedBy: 'Sierra'
  },
  {
    id: '2',
    title: 'Book Club Meetup',
    description: 'Monthly book discussion — this month: “The Alchemist.”',
    postedBy: 'David'
  },
  {
    id: '3',
    title: 'Tool Sharing',
    description: 'I have power tools to share if you need them!',
    postedBy: 'Ruby'
  }
];

const CommunityScreen: React.FC = () => {
  const theme = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const filteredItems = sampleCommunityItems.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.postedBy.toLowerCase().includes(query)
    );
  });

  const renderItem = ({ item }: { item: CommunityItem }) => (
    <View style={styles.card}>
      <Text variant="titleMedium">{item.title}</Text>
      <Text variant="bodyMedium">{item.description}</Text>
      <Text variant="labelSmall" style={styles.postedBy}>Posted by {item.postedBy}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        placeholder="Search community posts..."
      />
      <Divider />
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.contentContainer}
        ListEmptyComponent={
          <Text style={styles.placeholderText}>No posts found.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  card: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    elevation: 2,
  },
  placeholderText: {
    marginTop: 40,
    textAlign: 'center',
    color: 'gray',
  },
  postedBy: {
    marginTop: 8,
    color: 'gray',
  },
});

export default CommunityScreen;
