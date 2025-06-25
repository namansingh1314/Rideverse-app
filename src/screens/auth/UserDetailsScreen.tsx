"use client";

import { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useSignUp } from "@clerk/clerk-expo";

interface Props {
  onDetailsSubmitted: () => void;
}

export default function UserDetailsScreen({ onDetailsSubmitted }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useSignUp();

  // Debug logging
  useEffect(() => {
    console.log("UserDetailsScreen - signUp object:", signUp);
    console.log("UserDetailsScreen - signUp status:", signUp?.status);
    console.log("UserDetailsScreen - signUp phoneNumber:", signUp?.phoneNumber);
    console.log("UserDetailsScreen - missing fields:", signUp?.missingFields);
    console.log("UserDetailsScreen - required fields:", signUp?.requiredFields);
  }, [signUp]);

  const handleSubmitDetails = async () => {
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (!signUp) {
      Alert.alert(
        "Error",
        "Sign up session not found. Please restart the process."
      );
      return;
    }

    setIsLoading(true);
    try {
      console.log("Submitting user details...");
      console.log("Current signUp status:", signUp.status);
      console.log("Current signUp missing fields:", signUp.missingFields);
      console.log("Current signUp required fields:", signUp.requiredFields);

      // Only use emailAddress and password - store everything else in unsafeMetadata
      const updateData = {
        emailAddress: email,
        password: password,
        // Store ALL user data in unsafeMetadata to avoid field validation errors
        unsafeMetadata: {
          firstName: firstName,
          lastName: lastName,
          fullName: `${firstName} ${lastName}`.trim(),
          address: address,
          userEmail: email, // Store email here too for easy access later
        },
      };

      console.log("Update data being sent to Clerk:", updateData);

      const updateResult = await signUp.update(updateData);

      console.log("SignUp update result:", updateResult);
      console.log("Updated signUp status:", updateResult.status);
      console.log("Updated missing fields:", updateResult.missingFields);

      // Check if email verification is needed
      if (updateResult.status === "missing_requirements") {
        if (updateResult.missingFields?.includes("email_address")) {
          console.log("Email verification required, preparing...");

          try {
            await signUp.prepareEmailAddressVerification();
            console.log("Email verification prepared successfully");
            onDetailsSubmitted(); // Navigate to email verification screen
          } catch (prepareError: any) {
            console.error("Error preparing email verification:", prepareError);
            Alert.alert(
              "Error",
              prepareError.message ||
                "Failed to send verification email. Please try again."
            );
          }
        } else {
          console.log(
            "Other requirements missing:",
            updateResult.missingFields
          );

          // Try to proceed with email verification anyway
          try {
            await signUp.prepareEmailAddressVerification();
            console.log("Email verification prepared despite missing fields");
            onDetailsSubmitted();
          } catch (prepareError: any) {
            console.error(
              "Failed to prepare email verification:",
              prepareError
            );
            Alert.alert(
              "Error",
              "Unable to proceed with verification. Please try again."
            );
          }
        }
      } else if (updateResult.status === "complete") {
        console.log("Sign up completed without email verification!");
        onDetailsSubmitted();
      } else {
        console.log("Unexpected status after update:", updateResult.status);

        // Try to proceed with email verification regardless of status
        try {
          await signUp.prepareEmailAddressVerification();
          console.log("Email verification prepared");
          onDetailsSubmitted();
        } catch (prepareError: any) {
          console.error("Failed to prepare email verification:", prepareError);
          Alert.alert("Error", "Unable to proceed. Please try again.");
        }
      }
    } catch (error: any) {
      console.error("Error in handleSubmitDetails:", error);

      // Parse Clerk error messages
      if (error.errors && Array.isArray(error.errors)) {
        const errorMessages = error.errors
          .map((err: any) => err.message)
          .join(", ");
        Alert.alert("Error", errorMessages);
      } else {
        Alert.alert(
          "Error",
          error.message || "Failed to submit details. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complete Your Profile</Text>
      <Text style={styles.subtitle}>
        Please provide your details to continue
      </Text>

      <TextInput
        style={styles.input}
        value={firstName}
        onChangeText={setFirstName}
        placeholder="First Name *"
        autoCapitalize="words"
      />

      <TextInput
        style={styles.input}
        value={lastName}
        onChangeText={setLastName}
        placeholder="Last Name *"
        autoCapitalize="words"
      />

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email Address *"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Password *"
        secureTextEntry={true}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        value={address}
        onChangeText={setAddress}
        placeholder="Address (Optional)"
        multiline={true}
        numberOfLines={3}
      />

      <Button
        title={isLoading ? "Submitting..." : "Continue"}
        onPress={handleSubmitDetails}
        disabled={
          isLoading ||
          !firstName.trim() ||
          !lastName.trim() ||
          !email.trim() ||
          !password.trim()
        }
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
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },
});
