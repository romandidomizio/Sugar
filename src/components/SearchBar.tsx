import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, setSearchQuery, placeholder }) => {
  return (
    <View style={styles.container}>
      <TextInput
        mode="outlined"
        placeholder={placeholder || 'Search...'}
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.input}
        left={<TextInput.Icon icon="magnify" />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
  },
  input: {
    backgroundColor: 'white',
  },
});

export default SearchBar;
