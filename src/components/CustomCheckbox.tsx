import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useTheme } from 'react-native-paper';

/**
 * CustomCheckbox - A checkbox with a custom circular appearance.
 * @param label - The label to display next to the checkbox
 * @param status - Boolean indicating if the checkbox is checked (true) or not (false)
 * @param onPress - Callback function executed when the checkbox or label is pressed
 */
interface CustomCheckboxProps {
  label: string;
  status: boolean; // true for checked, false for unchecked
  onPress: () => void;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ label, status, onPress }) => {
  const theme = useTheme(); // Get theme for styling
  
  return (
    <TouchableOpacity onPress={onPress} style={styles.customCheckboxContainer}>
      {/* Outer circle acting as the border */}
      <View
        style={[
          styles.customCheckboxOuter,
          { borderColor: status ? theme.colors.primary : theme.colors.outline }, // Dynamic border color based on status
        ]}
      >
        {/* Inner circle, visible only when checked (status is true) */}
        {status && (
          <View
            style={[
              styles.customCheckboxInner,
              { backgroundColor: theme.colors.primary }, // Inner circle color from theme
            ]}
          />
        )}
      </View>
      {/* Label text next to the checkbox */}
      <Text style={[styles.customCheckboxLabel, { color: theme.colors.onSurface }]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  customCheckboxGroupContainer: {
    marginBottom: 4,
  },
  customCheckboxGroupLabel: {
    marginBottom: 8,
    fontSize: 16,
  },
  customCheckboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10, // Spacing below each checkbox item
    paddingVertical: 5, // Vertical padding for touch area
  },
  customCheckboxOuter: {
    width: 22, // Diameter of the outer circle
    height: 22,
    borderRadius: 11, // Half of width/height for a perfect circle
    borderWidth: 2, // Thickness of the border
    justifyContent: 'center', // Center the inner circle vertically
    alignItems: 'center', // Center the inner circle horizontally
    marginRight: 10, // Space between checkbox and label
    // borderColor is set dynamically in the component
  },
  customCheckboxInner: {
    width: 12, // Diameter of the inner circle
    height: 12,
    borderRadius: 6, // Half of width/height for a perfect circle
    // backgroundColor is set dynamically in the component
  },
  customCheckboxLabel: {
    fontSize: 16, // Font size for the label
  },
});

export default React.memo(CustomCheckbox);
