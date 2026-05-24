module.exports = {
  preset: 'jest-expo',
  testMatch: [
    '<rootDir>/tests/**/*.test.ts',
    '<rootDir>/tests/**/*.test.tsx',
    '<rootDir>/src/**/*.test.ts',
    '<rootDir>/src/**/*.test.tsx'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native|expo(nent)?|@expo|@expo-google-fonts|expo-modules-core|expo-router|@react-navigation|react-native-reanimated|react-native-mmkv|react-native-gesture-handler|react-native-screens|react-native-safe-area-context))'
  ]
};
