import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

interface Props {
  onSignUp: () => void;
  onSignIn: () => void;
}

export default function AuthChoiceScreen({ onSignUp, onSignIn }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to RideBooking</Text>
      <Text style={styles.subtitle}>Choose an option to continue</Text>

      <View style={styles.buttonContainer}>
        <Button title="Sign Up" onPress={onSignUp} />
        <Button title="Sign In" onPress={onSignIn} />
      </View>
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
    fontSize: 28,
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    textAlign: "center",
    color: "#666",
  },
  buttonContainer: {
    width: "100%",
    gap: 20,
  },
});
