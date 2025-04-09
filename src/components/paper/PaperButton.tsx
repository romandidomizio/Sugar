import React, { useState } from 'react';
import { 
  Button, 
  ButtonProps, 
  useTheme, 
  Text 
} from 'react-native-paper';
import { 
  StyleSheet, 
  ViewStyle, 
  TextStyle, 
  GestureResponderEvent,
  Animated 
} from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger';
type ButtonSize = 'default' | 'small' | 'large';
type ButtonWidth = 'auto' | 'full';
type ButtonAlignment = 'flex-start' | 'center' | 'flex-end';

interface SugarButtonProps extends Omit<ButtonProps, 'mode'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  width?: ButtonWidth;
  alignment?: ButtonAlignment;
  compact?: boolean;
}

const PaperButton: React.FC<SugarButtonProps> = ({
  variant = 'primary',
  size = 'default',
  width = 'auto',
  alignment = 'flex-start',
  compact = false,
  style,
  children,
  onPress,
  disabled,
  ...props
}) => {
  const theme = useTheme();
  const [pressAnimation] = useState(new Animated.Value(1));

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: theme.roundness,
      width: width === 'full' ? '100%' : 'auto',
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.primary,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.secondary,
          borderWidth: 1,
          borderColor: theme.colors.primaryDark,
        };
      case 'tertiary':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.primary,
        };
      case 'danger':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.error,
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseFontStyle: TextStyle = {
      fontWeight: 'bold',
    };

    switch (size) {
      case 'small':
        return {
          ...baseFontStyle,
          fontSize: 12,
        };
      case 'large':
        return {
          ...baseFontStyle,
          fontSize: 16,
        };
      default:
        return baseFontStyle;
    }
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'primary':
        return theme.colors.surface;
      case 'secondary':
        return theme.colors.primaryDark;
      case 'tertiary':
        return theme.colors.primary;
      case 'danger':
        return theme.colors.surface;
      default:
        return theme.colors.text;
    }
  };

  const getPressedStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return { 
          backgroundColor: theme.colors.primaryLight 
        };
      case 'secondary':
        return { 
          backgroundColor: theme.colors.secondaryLight,
          opacity: 0.8 
        };
      case 'tertiary':
        return { 
          backgroundColor: `${theme.colors.primaryLight}10`, // 20% opacity
          borderColor: theme.colors.primary 
        };
      case 'danger':
        return { 
          backgroundColor: theme.colors.error, 
          opacity: 0.7 
        };
      default:
        return {};
    }
  };

  const handlePressIn = () => {
    Animated.spring(pressAnimation, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnimation, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = (event: GestureResponderEvent) => {
    if (!disabled && onPress) {
      onPress(event);
    }
  };

  return (
    <Animated.View 
      style={[
        { transform: [{ scale: pressAnimation }] },
        styles.buttonContainer,
        width === 'full' && styles.fullWidth,
        { alignSelf: alignment }
      ]}
    >
      <Button
        mode="contained"
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        compact={compact}
        style={[
          styles.button, 
          getButtonStyle(), 
          disabled && styles.disabledButton,
          style
        ]}
        labelStyle={[
          styles.label, 
          getTextStyle(),
          { color: getTextColor() },
          disabled && styles.disabledLabel
        ]}
        {...props}
      >
        {children}
      </Button>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    alignSelf: 'center', 
  },
  fullWidth: {
    alignSelf: 'stretch',
    width: '100%',
  },
  button: {
    marginVertical: 8,
    elevation: 2,
  },
  label: {
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledLabel: {
    color: 'gray',
  },
});

export default PaperButton;
