import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
}
 from "react-native";

// ---------------------------------------------------------------------------
// LoginScreen Component
// This is the main login screen for the ClinicConnect patient app.
// It handles:
//   - Username & password input
//   - Sign In button (logs the form values for now — wire up your API here)
//   - Navigation to Forgot Password flow
//   - Navigation to Create Account
//   - Staff login link
//
// Props allow the parent (e.g. App.tsx or your navigator) to handle
// navigation and authentication logic.
// ---------------------------------------------------------------------------

interface LoginScreenProps {
  /** Called when the user taps "Sign In" with their credentials */
  onSignIn?: (username: string, password: string) => void;
  /** Called when the user taps "Forgot Password?" */
  onForgotPassword?: () => void;
  /** Called when the user taps "Create an account" */
  onCreateAccount?: () => void;
  /** Called when the user taps "Sign in with staff ID" */
  onStaffLogin?: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({
  onSignIn,
  onForgotPassword,
  onCreateAccount,
  onStaffLogin,
}) => {
  // Local state to track what the user types in each field
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  // Handle the Sign In button tap
  const handleSignIn = () => {
    if (onSignIn) {
      onSignIn(username, password);
    } else {
      // Placeholder — remove once you wire up real authentication
      console.log("Sign In tapped:", { username, password });
    }
  };

  return (
    // SafeAreaView ensures content stays within safe screen boundaries (notch, etc.)
    <SafeAreaView style={styles.safeArea}>

      {/* KeyboardAvoidingView pushes content up when the keyboard appears */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>

          {/* ── TOP HEADER: warm beige gradient-like background with branding ── */}
          {/* React Native doesn't support CSS gradients natively;
              install expo-linear-gradient if you want a true gradient.
              For now we use the lighter beige tone as the background. */}
          <View style={styles.header}>

            {/* "ClinicConnect" logo — two-tone text using two <Text> spans */}
            <Text style={styles.logoText}>
              <Text style={styles.logoClinic}>Clinic</Text>
              <Text style={styles.logoConnect}>Connect</Text>
            </Text>

            {/* Italic tagline below the logo */}
            <Text style={styles.tagline}>Connecting Patients With Healthcare</Text>

            {/* Small pill labels: BOOK • CARE • CONNECT */}
            <View style={styles.pillsRow}>
              <Text style={styles.pill}>BOOK</Text>
              <Text style={styles.pillDot}>✦</Text>
              <Text style={styles.pill}>CARE</Text>
              <Text style={styles.pillDot}>✦</Text>
              <Text style={styles.pill}>CONNECT</Text>
            </View>
          </View>

          {/* ── BODY: white card with the login form ── */}
          <View style={styles.body}>

            {/* USERNAME FIELD */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>USERNAME</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}  // updates state as user types
                autoCapitalize="none"       // prevent auto-capitalising username
                autoCorrect={false}
              />
            </View>

            {/* PASSWORD FIELD */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>PASSWORD</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}  // updates state as user types
                secureTextEntry={true}      // hides the password characters
                autoCapitalize="none"
                autoCorrect={false}
              />

              {/* "FORGOT PASSWORD?" link — right-aligned below the password field */}
              <TouchableOpacity
                onPress={onForgotPassword}
                style={styles.forgotWrapper}
              >
                <Text style={styles.forgotText}>FORGOT PASSWORD?</Text>
              </TouchableOpacity>
            </View>

            {/* SIGN IN BUTTON — dark navy, full width */}
            <TouchableOpacity style={styles.btnPrimary} onPress={handleSignIn}>
              <Text style={styles.btnPrimaryText}>Sign in</Text>
            </TouchableOpacity>

            {/* OR divider */}
            <Text style={styles.orDivider}>OR</Text>

            {/* CREATE AN ACCOUNT BUTTON — outlined style */}
            <TouchableOpacity style={styles.btnSecondary} onPress={onCreateAccount}>
              <Text style={styles.btnSecondaryText}>Create an account</Text>
            </TouchableOpacity>

            {/* Staff login line at the bottom */}
            <View style={styles.staffRow}>
              <Text style={styles.staffText}>Staff? </Text>
              <TouchableOpacity onPress={onStaffLogin}>
                <Text style={styles.staffLink}>Sign in with staff ID</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ---------------------------------------------------------------------------
// Styles
// React Native uses StyleSheet.create() instead of CSS.
// All sizes are in density-independent pixels (dp), not px.
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({

  // Makes the SafeAreaView fill the whole screen
  safeArea: {
    flex: 1,
    backgroundColor: "#e8d5b7", // matches the header beige so edges look clean
  },

  flex: {
    flex: 1,
  },

  // Centers the card vertically on the screen
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },

  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    width: 300,
    backgroundColor: "#d4b896", // warm beige (middle of the gradient range)
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
  },

  logoText: {
    fontSize: 26,
    fontWeight: "bold",
  },

  // "Clinic" part of the logo in dark navy
  logoClinic: {
    color: "#1e2a3a",
  },

  // "Connect" part of the logo in olive green
  logoConnect: {
    color: "#7a8c3a",
  },

  // Italic tagline
  tagline: {
    fontSize: 10,
    fontStyle: "italic",
    color: "#7a8c3a",
    marginTop: 4,
    marginBottom: 8,
    letterSpacing: 0.3,
  },

  // Row of pill labels
  pillsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  pill: {
    fontSize: 8,
    fontWeight: "700",
    color: "#1e2a3a",
    letterSpacing: 1,
  },

  pillDot: {
    fontSize: 7,
    color: "#1e2a3a",
    opacity: 0.5,
  },

  // ── Body ────────────────────────────────────────────────────────────────
  body: {
    width: 300,
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
  },

  // Wraps each label + input pair
  formGroup: {
    marginBottom: 16,
  },

  // Small all-caps label above each input
  label: {
    fontSize: 10,
    fontWeight: "600",
    color: "#555555",
    letterSpacing: 0.8,
    marginBottom: 5,
  },

  // Text input field
  input: {
    borderWidth: 1,
    borderColor: "#d0d0d0cb",
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontSize: 14,
    color: "#1e2a3a",
  },

  // Aligns the "Forgot Password?" link to the right
  forgotWrapper: {
    alignSelf: "flex-end",
    marginTop: 4,
  },

  forgotText: {
    fontSize: 9,
    fontWeight: "600",
    color: "#444444",
    letterSpacing: 0.6,
  },

  // Primary button — dark navy background
  btnPrimary: {
    width: "100%",
    backgroundColor: "#1e2a3a",
    borderRadius: 6,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 8,
  },

  btnPrimaryText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },

  // "OR" divider text
  orDivider: {
    textAlign: "center",
    fontSize: 12,
    color: "#999999",
    marginVertical: 10,
  },

  // Secondary button — outlined style
  btnSecondary: {
    width: "100%",
    borderWidth: 1.5,
    borderColor: "#1e2a3a",
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: "center",
  },

  btnSecondaryText: {
    color: "#1e2a3a",
    fontSize: 14,
    fontWeight: "600",
  },

  // Staff login row at the bottom
  staffRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },

  staffText: {
    fontSize: 11,
    color: "#444444",
  },

  staffLink: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1e2a3a",
    textDecorationLine: "underline",
  },
});

export default LoginScreen;