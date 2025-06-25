import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

interface Props {
  onNext: () => void;
}

export default function OnboardingOne({ onNext }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to RideBooking</Text>
      <Text style={styles.description}>
        Book rides easily and safely with our app
      </Text>
      <Button title="Next" onPress={onNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
  },
});
