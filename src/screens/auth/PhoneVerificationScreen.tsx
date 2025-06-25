import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useSignUp } from "@clerk/clerk-expo";

interface Props {
  onPhoneVerified: () => void;
}

export default function PhoneVerificationScreenSimple({
  onPhoneVerified,
}: Props) {
  const [fullPhoneNumber, setFullPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useSignUp();

  const handleSendCode = async () => {
    if (!fullPhoneNumber.trim()) {
      Alert.alert("Error", "Please enter your phone number");
      return;
    }

    // Simple validation for + prefix
    const phoneToSend = fullPhoneNumber.startsWith("+")
      ? fullPhoneNumber
      : `+${fullPhoneNumber}`;

    setIsLoading(true);
    try {
      await signUp?.create({
        phoneNumber: phoneToSend,
      });

      await signUp?.preparePhoneNumberVerification();
      onPhoneVerified();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Your Phone Number</Text>

      <Text style={styles.instructions}>
        Enter your phone number with country code
        {"\n"}Examples: +919876543210, +14155551234
      </Text>

      <TextInput
        style={styles.phoneInput}
        value={fullPhoneNumber}
        onChangeText={setFullPhoneNumber}
        placeholder="+919876543210"
        keyboardType="phone-pad"
      />

      <Button
        title={isLoading ? "Sending..." : "Send Code"}
        onPress={handleSendCode}
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
    marginBottom: 30,
    textAlign: "center",
  },
  instructions: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
    color: "#666",
  },
  phoneInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 15,
    fontSize: 16,
    marginBottom: 30,
  },
});
