module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      // Required for reanimated to work properly, and must be the last plugin 
      "react-native-reanimated/plugin",
    ],
  };
};
