import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

interface Props {
  onComplete: () => void;
}

export default function OnboardingTwo({ onComplete }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Safe & Reliable</Text>
      <Text style={styles.description}>
        All our drivers are verified and our rides are tracked
      </Text>
      <Button title="Get Started" onPress={onComplete} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
  },
});
