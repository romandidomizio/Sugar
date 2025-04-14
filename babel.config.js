// /Users/romandidomizio/Sugar/babel.config.js
// Standard Babel configuration for React Native/Expo projects,
// including the plugin for react-native-dotenv.
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module:react-native-dotenv',
        {
          envName: 'APP_ENV',
          moduleName: '@env',
          path: '.env',
          blocklist: null,
          allowlist: null,
          safe: false,
          allowUndefined: true,
          verbose: false,
        },
      ],
      // Add other Babel plugins here if needed
      'react-native-reanimated/plugin', // Often needed in Expo projects
    ],
  };
};
