/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|@rn-primitives|lucide-react-native|nativewind))',
    '/node_modules/react-native-reanimated/plugin/',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)', '**/?(*.)+(spec|test).(ts|tsx)'],
  clearMocks: true,
};
