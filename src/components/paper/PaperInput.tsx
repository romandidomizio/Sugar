import React from 'react';
import { TextInput, HelperText } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';

interface PaperInputProps extends React.ComponentProps<typeof TextInput> {
  label: string;
  error?: string;
}

const PaperInput: React.FC<PaperInputProps> = ({ 
  label, 
  error, 
  style, 
  ...props 
}) => {
  return (
    <View>
      <TextInput
        label={label}
        mode="outlined"
        style={[styles.input, style]}
        error={!!error}
        {...props}
      />
      {error && (
        <HelperText 
          type="error" 
          visible={!!error}
        >
          {error}
        </HelperText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    marginVertical: 8,
  },
});

export default PaperInput;
