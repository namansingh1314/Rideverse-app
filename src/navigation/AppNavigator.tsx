"use client";

import { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuth } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Components
import LoadingScreen from "../components/LoadingScreen";

// Onboarding Screens
import OnboardingOne from "../screens/onboarding/OnboardingOne";
import OnboardingTwo from "../screens/onboarding/OnboardingTwo";

// Auth Screens
import AuthChoiceScreen from "../screens/auth/AuthChoiceScreen";
import PhoneVerificationScreen from "../screens/auth/PhoneVerificationScreen";
import OTPVerificationScreen from "../screens/auth/OTPVerificationScreen";
import UserDetailsScreen from "../screens/auth/UserDetailsScreen";
import EmailVerificationScreen from "../screens/auth/EmailVerificationScreen";
import SignInScreen from "../screens/auth/SignInScreen";
import SignInOTPScreen from "../screens/auth/SignInOTPScreen";

// Dashboard
import DashboardScreen from "../screens/dashboard/DashboardScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Onboarding Stack
function OnboardingStack() {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => setCurrentStep(1);
  const handleComplete = async () => {
    await AsyncStorage.setItem("hasCompletedOnboarding", "true");
    setCurrentStep(2);
  };

  if (currentStep === 0) {
    return <OnboardingOne onNext={handleNext} />;
  } else if (currentStep === 1) {
    return <OnboardingTwo onComplete={handleComplete} />;
  } else {
    return <AuthChoiceStack />;
  }
}

// Auth Choice Stack
function AuthChoiceStack() {
  const [authFlow, setAuthFlow] = useState<"choice" | "signup" | "signin">(
    "choice"
  );

  const handleSignUp = () => setAuthFlow("signup");
  const handleSignIn = () => setAuthFlow("signin");

  if (authFlow === "choice") {
    return <AuthChoiceScreen onSignUp={handleSignUp} onSignIn={handleSignIn} />;
  } else if (authFlow === "signup") {
    return <SignUpStack />;
  } else {
    return <SignInStack />;
  }
}

// Sign Up Stack
function SignUpStack() {
  const [signUpStep, setSignUpStep] = useState("phone");

  const handlePhoneVerified = () => setSignUpStep("otp");
  const handleOTPVerified = () => setSignUpStep("details");
  const handleDetailsSubmitted = () => setSignUpStep("email");
  const handleEmailVerified = () => {
    console.log("Email verified, should navigate to dashboard");
    setSignUpStep("complete");
  };

  switch (signUpStep) {
    case "phone":
      return <PhoneVerificationScreen onPhoneVerified={handlePhoneVerified} />;
    case "otp":
      return <OTPVerificationScreen onOTPVerified={handleOTPVerified} />;
    case "details":
      return <UserDetailsScreen onDetailsSubmitted={handleDetailsSubmitted} />;
    case "email":
      return <EmailVerificationScreen onEmailVerified={handleEmailVerified} />;
    default:
      return <DashboardTabs />;
  }
}

// Sign In Stack
function SignInStack() {
  const [signInStep, setSignInStep] = useState("email");

  const handleSignInSuccess = () => setSignInStep("otp");
  const handleOTPVerified = () => setSignInStep("complete");

  switch (signInStep) {
    case "email":
      return <SignInScreen onSignInSuccess={handleSignInSuccess} />;
    case "otp":
      return <SignInOTPScreen onOTPVerified={handleOTPVerified} />;
    default:
      return <DashboardTabs />;
  }
}

// Dashboard Tabs
function DashboardTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
    </Tab.Navigator>
  );
}

// Main App Navigator
export default function AppNavigator() {
  const { isLoaded, isSignedIn } = useAuth();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  // Add debug logging for auth state changes
  useEffect(() => {
    console.log("Auth state changed:", { isLoaded, isSignedIn });
  }, [isLoaded, isSignedIn]);

  const checkOnboardingStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem("hasCompletedOnboarding");
      setHasCompletedOnboarding(completed === "true");
    } catch (error) {
      setHasCompletedOnboarding(false);
    }
  };

  if (!isLoaded || hasCompletedOnboarding === null) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isSignedIn ? (
          !hasCompletedOnboarding ? (
            <Stack.Screen name="Onboarding" component={OnboardingStack} />
          ) : (
            <Stack.Screen name="Auth" component={AuthChoiceStack} />
          )
        ) : (
          <Stack.Screen name="Main" component={DashboardTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
