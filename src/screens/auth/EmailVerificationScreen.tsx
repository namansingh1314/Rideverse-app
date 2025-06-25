"use client";

import { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { supabase } from "../../config/supabase";

interface Props {
  onEmailVerified: () => void;
}

// Define proper types for user data with correct null handling
interface ProfileInsertData {
  clerk_id: string;
  first_name?: string | null | undefined;
  last_name?: string | null | undefined;
  full_name?: string | null | undefined;
  email?: string | null | undefined;
  phone_number?: string | null | undefined;
  address?: string | null | undefined;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export default function EmailVerificationScreen({ onEmailVerified }: Props) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { signUp, setActive } = useSignUp();

  const handleVerifyEmail = async () => {
    if (!code.trim()) {
      Alert.alert("Error", "Please enter the verification code");
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
      console.log("Starting email verification...");
      console.log("SignUp status before verification:", signUp.status);

      // Step 1: Verify the email code
      const verificationResult = await signUp.attemptEmailAddressVerification({
        code,
      });
      console.log("Email verification result:", verificationResult);

      // Step 2: Check if we need to complete the signup process
      if (verificationResult?.status === "missing_requirements") {
        console.log("Still missing requirements, attempting to create user...");

        try {
          // Fixed: Pass empty object as parameter for create method
          const completionResult = await signUp.create({});
          console.log("Signup completion result:", completionResult);

          if (completionResult?.status === "complete") {
            console.log("Signup completed successfully!");

            if (completionResult.createdSessionId) {
              await setActive({
                session: completionResult.createdSessionId,
              });
              console.log("Session activated successfully");
            }

            // Save to Supabase after successful Clerk authentication
            await saveUserToSupabase(completionResult);
            onEmailVerified();
            return;
          }
        } catch (createError: any) {
          console.error("Error during signup creation:", createError);
          Alert.alert(
            "Error",
            createError.message ||
              "Failed to complete signup. Please try again."
          );
          return;
        }
      }

      // Step 3: Handle direct completion
      if (verificationResult?.status === "complete") {
        console.log("Email verification completed directly!");

        if (verificationResult.createdSessionId) {
          await setActive({
            session: verificationResult.createdSessionId,
          });
          console.log("Session activated successfully");
        }

        await saveUserToSupabase(verificationResult);
        onEmailVerified();
        return;
      }

      console.log("Unexpected verification result:", verificationResult);
      Alert.alert("Error", "Unable to complete signup. Please try again.");
    } catch (error: any) {
      console.error("Email verification error:", error);
      Alert.alert(
        "Error",
        error.message || "Verification failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to clean undefined values from an object
  const cleanObject = <T extends Record<string, any>>(obj: T): Partial<T> => {
    const cleaned: Partial<T> = {};
    Object.entries(obj).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        cleaned[key as keyof T] = value;
      }
    });
    return cleaned;
  };

  // Helper function to safely extract string values
  const safeStringExtract = (value: any): string | null => {
    if (typeof value === "string" && value.trim() !== "") {
      return value.trim();
    }
    return null;
  };

  // Function to save user data to Supabase
  const saveUserToSupabase = async (result: any) => {
    const userData = signUp?.unsafeMetadata;
    const phoneNumber = signUp?.phoneNumber;
    const clerkUserId = result.createdUserId as string;
    const userEmail = signUp?.emailAddress;

    console.log("User data for Supabase:", {
      clerkUserId,
      phoneNumber,
      userEmail,
      userData,
    });

    if (!clerkUserId || !userEmail) {
      console.error("Missing required user data");
      Alert.alert(
        "Warning",
        "Account created but missing required data. You can still use the app."
      );
      return;
    }

    try {
      console.log("Saving user profile to Supabase...");

      // Extract user data from unsafeMetadata with proper type handling
      const firstName = safeStringExtract(userData?.firstName);
      const lastName = safeStringExtract(userData?.lastName);
      const fullName = safeStringExtract(userData?.fullName);
      const address = safeStringExtract(userData?.address);

      const profileData: ProfileInsertData = {
        clerk_id: clerkUserId,
        first_name: firstName,
        last_name: lastName,
        full_name: fullName,
        email: userEmail,
        phone_number: phoneNumber || null,
        address: address,
        email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const cleanedProfileData = cleanObject(profileData);
      console.log("Cleaned profile data:", cleanedProfileData);

      // Check if profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from("users")
        .select("clerk_id")
        .eq("clerk_id", clerkUserId)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        console.error("Error checking existing profile:", checkError);
      }

      if (existingProfile) {
        // Update existing profile
        console.log("Profile exists, updating...");
        const { error: updateError } = await supabase
          .from("users")
          .update({
            ...cleanedProfileData,
            updated_at: new Date().toISOString(),
          })
          .eq("clerk_id", clerkUserId);

        if (updateError) {
          console.error("Profile update error:", updateError);
          throw updateError;
        } else {
          console.log("Profile updated successfully");
        }
      } else {
        // Insert new profile
        console.log("Creating new profile...");
        const { data: profileResult, error: profileError } = await supabase
          .from("users")
          .insert([cleanedProfileData])
          .select();

        if (profileError) {
          console.error("Profile insert error:", profileError);
          throw profileError;
        } else {
          console.log("Profile successfully created:", profileResult);
        }
      }
    } catch (error: any) {
      console.error("Supabase operation failed:", error);

      // Don't block authentication flow, but show warning
      Alert.alert(
        "Warning",
        "Account created successfully, but profile data couldn't be saved. You can update your profile later in the app."
      );
    }
  };

  const handleResendCode = async () => {
    if (!signUp) {
      Alert.alert(
        "Error",
        "Sign up session not found. Please restart the process."
      );
      return;
    }

    setIsResending(true);
    try {
      console.log("Resending verification code...");
      await signUp.prepareEmailAddressVerification();
      Alert.alert("Success", "Verification code sent to your email");
    } catch (error: any) {
      console.error("Resend code error:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to resend code. Please try again."
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Email</Text>
      <Text style={styles.subtitle}>
        We sent a verification code to {signUp?.emailAddress}
      </Text>

      <TextInput
        style={styles.codeInput}
        value={code}
        onChangeText={setCode}
        placeholder="Enter verification code"
        keyboardType="number-pad"
        maxLength={6}
        autoFocus={true}
      />

      <Button
        title={isLoading ? "Verifying..." : "Verify Email"}
        onPress={handleVerifyEmail}
        disabled={isLoading || !code.trim()}
      />

      <View style={styles.resendContainer}>
        <Text>Didn't receive the code?</Text>
        <Button
          title={isResending ? "Sending..." : "Resend Code"}
          onPress={handleResendCode}
          disabled={isResending || isLoading}
        />
      </View>
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
  resendContainer: {
    marginTop: 20,
    alignItems: "center",
  },
});
