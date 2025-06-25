import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";

export default function DashboardScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.welcome}>Welcome, {user?.firstName || "User"}!</Text>
      <Text style={styles.info}>
        Phone: {user?.phoneNumbers[0]?.phoneNumber}
      </Text>
      <Text style={styles.info}>
        Email: {user?.emailAddresses[0]?.emailAddress}
      </Text>

      <View style={styles.buttonContainer}>
        <Button title="Book a Ride" onPress={() => {}} />
        <Button title="Ride History" onPress={() => {}} />
        <Button title="Profile" onPress={() => {}} />
        <Button title="Sign Out" onPress={handleSignOut} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    textAlign: "center",
  },
  welcome: {
    fontSize: 18,
    marginBottom: 10,
  },
  info: {
    fontSize: 14,
    marginBottom: 5,
    color: "#666",
  },
  buttonContainer: {
    marginTop: 40,
    gap: 15,
  },
});
