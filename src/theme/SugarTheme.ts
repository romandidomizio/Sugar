import { MD3LightTheme, MD3Theme, configureFonts } from 'react-native-paper';

// Expanded Green Color Palette
const greenPalette = {
  primary: '#2E8B57',       // Sea Green
  primaryLight: '#3CB371',  // Medium Sea Green
  primaryDark: '#228B22',   // Forest Green

  secondary: '#90EE90',      // Light Green
  secondaryLight: '#98FB98', // Pale Green
  secondaryDark: '#32CD32',  // Lime Green

  accent: '#90EE90',        // Light Green
  accentLight: '#98FB98',   // Pale Green

  background: '#F0FFF0',    // Honeydew
  surface: '#FFFFFF',

  error: '#D32F2F',
  text: '#000000',
  onBackground: '#000000',
  onSurface: '#000000',
};

const fontConfig = {
  fontFamily: 'Hoefler-Regular',
  fonts: {
    regular: {
      fontFamily: 'Hoefler-Regular',
      fontWeight: 'normal',
    },
    bold: {
      fontFamily: 'Hoefler-Bold',
      fontWeight: 'normal',
    },
    italic: {
      fontFamily: 'Hoefler-Italic',
      fontWeight: 'normal',
    },
  },
};

export const SugarTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...greenPalette,
  },
  fonts: configureFonts({ config: fontConfig, isV3: true }),
  roundness: 8,
  animation: {
    scale: 1.0,
  },
};
