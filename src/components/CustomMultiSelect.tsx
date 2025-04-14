// src/components/CustomMultiSelect.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  ScrollView, 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  Dimensions, 
} from 'react-native';
import {
  Divider,
  Text,
  useTheme,
  Checkbox,
  Button, // Import Button for Confirm/Cancel
  Surface, // Use Surface for the overlay background/elevation
  Portal, // Use Portal to render the overlay above everything
  Icon, // Import Icon for dropdown arrow
} from 'react-native-paper';

interface Option {
  label: string;
  value: string;
}

interface CustomMultiSelectProps {
  label: string;
  options: Option[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  placeholder?: string;
  error?: boolean;
  style?: object; // Allow passing custom styles to the main container
}

const CustomMultiSelect: React.FC<CustomMultiSelectProps> = ({
  label,
  options,
  selectedValues,
  onSelectionChange,
  placeholder = 'Select options',
  error = false,
  style = {},
}) => {
  const theme = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);
  const [tempSelectedValues, setTempSelectedValues] = useState<string[]>([]);
  const [overlayPosition, setOverlayPosition] = useState({ top: 0, left: 0, width: 0 });
  // Correctly type the ref to reference the TouchableOpacity component directly
  const anchorRef = useRef<TouchableOpacity>(null);

  // Sync temp state when overlay opens
  useEffect(() => {
    if (menuVisible) {
      setTempSelectedValues([...selectedValues]);
    }
  }, [menuVisible, selectedValues]);

  const openMenu = () => {
    // Measure the anchor position to place the overlay correctly
    // Re-add explicit 'any' types to parameters to resolve lint errors
    anchorRef.current?.measure((fx: any, fy: any, width: any, height: any, px: any, py: any) => {
      const screenHeight = Dimensions.get('window').height;
      // Position below the anchor initially
      let topPosition = py + height + 5; // 5 pixels gap
      const estimatedOverlayHeight = 250 + 60; // Rough estimate: ScrollView max height + buttons/padding

      // Check if overlay would go off-screen below, try positioning above if so
      if (topPosition + estimatedOverlayHeight > screenHeight - 20) { // 20px buffer from bottom
        topPosition = py - estimatedOverlayHeight - 5; // Position above anchor
      }

      // Ensure it doesn't go off the top of the screen when positioned above
      if (topPosition < 20) { // 20px buffer from top
          topPosition = py + height + 5; // Default back to below if upward doesn't fit either
      }

      setOverlayPosition({ top: topPosition, left: px, width });
      setMenuVisible(true);
    });
  };

  const closeMenu = () => {
    setMenuVisible(false);
  };

  // Toggles selection in temporary state, DOES NOT close the overlay
  const handleCheckboxToggle = (value: string) => {
    setTempSelectedValues((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  // Confirms selection and closes the overlay
  const handleConfirm = () => {
    onSelectionChange(tempSelectedValues); // Update parent state
    closeMenu();
  };

  // Cancels selection (resets temp state) and closes the overlay
  const handleCancel = () => {
    // Reset temp state to original state before closing
    setTempSelectedValues([...selectedValues]);
    closeMenu();
  };

  // Generates the display text for the trigger button
  const getDisplayText = () => {
    if (selectedValues.length === 0) {
      // Use the main label as the placeholder text when nothing is selected
      return label;
    }
    const selectedLabels = options
      .filter((option) => selectedValues.includes(option.value))
      .map((option) => option.label);

    const maxDisplayLength = 3; // Example: show first 3 selected items
    if (selectedLabels.length > maxDisplayLength) {
      return `${selectedLabels.slice(0, maxDisplayLength).join(', ')}, ... (+${selectedLabels.length - maxDisplayLength})`;
    }
    return selectedLabels.join(', ');
  };

  const styles = StyleSheet.create({
    container: {
      marginBottom: 8,
    },
    triggerContainer: { // The touchable area that looks like an input
      borderWidth: 1,
      borderColor: error ? theme.colors.error : theme.colors.outline,
      borderRadius: theme.roundness,
      paddingHorizontal: 14,
      paddingVertical: 8,
      minHeight: 50, // Consistent height
      flexDirection: 'row', // Align text and icon horizontally
      alignItems: 'center', // Center items vertically
      justifyContent: 'space-between', // Push text and icon apart
      backgroundColor: theme.colors.background, // Match theme background
    },
    triggerText: { // Text showing selected items
      color: theme.colors.onSurface,
      fontSize: 16,
      flex: 1, // Allow text to take available space
      marginRight: 8, // Space between text and icon
    },
    placeholderText: { // Text shown when nothing is selected
      color: theme.colors.onSurfaceVariant,
      fontSize: 16,
      flex: 1, // Allow text to take available space
      marginRight: 8, // Space between text and icon
    },
    // Styles for the custom overlay dropdown View
    overlayContainer: { // Wrapper for positioning the dropdown absolutely
        position: 'absolute',
        zIndex: 1000, // High zIndex to render above other elements
    },
    overlaySurface: { // The actual dropdown box using Paper's Surface
        backgroundColor: theme.colors.elevation.level2, // Use elevation color for background
        borderRadius: theme.roundness,
        elevation: 4, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    overlayInnerWrapper: { // New wrapper for content inside Surface
        borderRadius: theme.roundness, // Apply border radius here
        overflow: 'hidden', // Apply overflow clipping here
    },
    overlayScrollView: { // Scrollable area for options
       maxHeight: 250, // Prevent overly tall dropdowns
    },
    checkboxItem: { // Styling for each option item
       backgroundColor: 'transparent', // Let Surface provide background
       paddingHorizontal: 8,
    },
    overlayActions: { // Container for Confirm/Cancel buttons
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 8,
        paddingVertical: 8,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: theme.colors.outlineVariant,
        backgroundColor: theme.colors.elevation.level2, // Match surface background
    },
    actionButton: { // Style for Confirm/Cancel buttons
        marginLeft: 8, // Space between buttons
    },
    backdrop: { // Full screen transparent backdrop to catch outside clicks
        ...StyleSheet.absoluteFillObject, // Cover entire screen
        zIndex: 999, // Position it just below the overlay content
        // backgroundColor: 'rgba(0,0,0,0.1)', // Optional: Dim background slightly
    }
  });

  return (
    <View style={[styles.container, style]}>
      {/* --- Anchor Trigger --- */}
      <TouchableOpacity
        ref={anchorRef} // Ref to measure position for the overlay
        style={styles.triggerContainer}
        onPress={openMenu} // Open the overlay on press
        activeOpacity={0.7}
      >
        {/* Display Text (Selected items or Placeholder/Label) */}
        <Text style={selectedValues.length > 0 ? styles.triggerText : styles.placeholderText} numberOfLines={1}>
          {getDisplayText()}
        </Text>
        {/* Dropdown Arrow Icon */}
        <Icon source="menu-down" size={24} color={theme.colors.onSurfaceVariant} />
      </TouchableOpacity>

      {/* --- Custom Dropdown Overlay (Rendered via Portal) --- */}
      {menuVisible && (
         <Portal>
             {/* Backdrop to handle clicks outside the overlay */}
             <TouchableOpacity
                style={styles.backdrop}
                activeOpacity={1}
                onPress={handleCancel} // Close and cancel changes if backdrop is pressed
             />
             {/* Positioned Container for the overlay content */}
            <View style={[styles.overlayContainer, { top: overlayPosition.top, left: overlayPosition.left, width: overlayPosition.width }]}>
                {/* Surface provides background and elevation */}
                <Surface style={styles.overlaySurface} elevation={4}>
                    {/* Inner wrapper for content clipping */}
                    <View style={styles.overlayInnerWrapper}>
                        {/* Scrollable list of Checkbox Items */}
                        <ScrollView style={styles.overlayScrollView}>
                            {options.map((option) => (
                                <Checkbox.Item
                                key={option.value}
                                label={option.label}
                                status={tempSelectedValues.includes(option.value) ? 'checked' : 'unchecked'}
                                onPress={() => handleCheckboxToggle(option.value)} // Only toggles state
                                style={styles.checkboxItem}
                                labelStyle={{ color: theme.colors.onSurface }}
                                mode="android" // Or "ios", affects ripple/highlight
                                />
                            ))}
                        </ScrollView>
                        <Divider />
                        {/* Action Buttons */}
                        <View style={styles.overlayActions}>
                            <Button
                                mode="text"
                                onPress={handleCancel}
                                style={styles.actionButton}
                                compact
                            >
                                Cancel
                            </Button>
                            <Button
                                mode="text"
                                onPress={handleConfirm}
                                style={styles.actionButton}
                                compact
                            >
                                Confirm
                            </Button>
                        </View>
                    </View>
                </Surface>
            </View>
        </Portal>
      )}
    </View>
  );
};

export default CustomMultiSelect;