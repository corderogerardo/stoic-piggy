module.exports = (api) => {
  api.cache(true);
  return {
    presets: [
      // jsxImportSource lets NativeWind's className transform run on RN components.
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    // Reanimated 4 ships its Babel plugin via react-native-worklets.
    // It must stay LAST in the plugins list.
    plugins: ['react-native-worklets/plugin'],
  };
};
