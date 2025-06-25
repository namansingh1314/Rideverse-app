"use client";

import { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useSignIn } from "@clerk/clerk-expo";

interface Props {
  onOTPVerified: () => void;
}

export default function SignInOTPScreen({ onOTPVerified }: Props) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, setActive } = useSignIn();

  const handleVerifyCode = async () => {
    if (!code.trim()) {
      Alert.alert("Error", "Please enter the verification code");
      return;
    }

    setIsLoading(true);
    try {
      if (!signIn) {
        Alert.alert("Error", "Sign in session not found");
        return;
      }

      const result = await signIn.attemptFirstFactor({
        strategy: "email_code",
        code,
      });

      if (result?.status === "complete") {
        await setActive({ session: result.createdSessionId });
        onOTPVerified();
      } else {
        Alert.alert("Error", "Verification failed. Please try again.");
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);
      Alert.alert(
        "Error",
        error.message || "Verification failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Verification Code</Text>
      <Text style={styles.subtitle}>We sent a code to your email address</Text>

      <TextInput
        style={styles.codeInput}
        value={code}
        onChangeText={setCode}
        placeholder="Enter 6-digit code"
        keyboardType="number-pad"
        maxLength={6}
      />

      <Button
        title={isLoading ? "Verifying..." : "Verify Code"}
        onPress={handleVerifyCode}
        disabled={isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: "center",
    color: "#666",
  },
  codeInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 15,
    fontSize: 18,
    textAlign: "center",
    marginBottom: 30,
  },
});
