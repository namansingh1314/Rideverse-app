import React from 'react';
import { ClerkProvider } from '@clerk/clerk-expo';
import Constants from 'expo-constants';
import AppNavigator from './src/navigation/AppNavigator';

const clerkPublishableKey = Constants.expoConfig?.extra?.clerkPublishableKey;

export default function App() {
  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <AppNavigator />
    </ClerkProvider>
  );
}
