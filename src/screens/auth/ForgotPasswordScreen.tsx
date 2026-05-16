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
} from "react-native";

// ---------------------------------------------------------------------------
// ForgotPasswordScreen Component — Step 1: Enter Email
//
// This is the first step of the forgot password flow.
// The user enters their registered email address and taps "Send OTP".
// An OTP (One Time Password) will then be sent to that email.
//
// Flow: Login → [THIS SCREEN] → OTP Entry → New Password
// ---------------------------------------------------------------------------

interface ForgotPasswordScreenProps {
  /** Called when the user taps "Send OTP" with their email address */
  onSendOtp?: (email: string) => void;
  /** Called when the user taps the back arrow to go back to Login */
  onBack?: () => void;
  /** Called when the user taps "Sign in" at the bottom */
  onSignIn?: () => void;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  onSendOtp,
  onBack,
  onSignIn,
}) => {
  // Local state to track what the user types in the email field
  const [email, setEmail] = useState<string>("");

  // Handle the "Send OTP" button tap
  const handleSendOtp = () => {
    if (onSendOtp) {
      onSendOtp(email);
    } else {
      // Placeholder — remove once you wire up your API call
      console.log("Send OTP tapped for email:", email);
    }
  };

  return (
    // SafeAreaView keeps content within safe screen boundaries (notch, home bar, etc.)
    <SafeAreaView style={styles.safeArea}>

      {/* KeyboardAvoidingView pushes content up when the keyboard appears */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>

          {/* ── CARD CONTAINER ── */}
          <View style={styles.card}>

            {/* ── TOP HEADER: warm beige background with back arrow ── */}
            <View style={styles.header}>

              {/* Back arrow button — takes the user back to the Login screen */}
              <TouchableOpacity onPress={onBack} style={styles.backButton}>
                <Text style={styles.backArrow}>←</Text>
                <Text style={styles.backText}>Reset password</Text>
              </TouchableOpacity>

              {/* Lock icon — represented with an emoji for simplicity.
                  You can swap this with an icon library like @expo/vector-icons */}
              <View style={styles.iconWrapper}>
                <Text style={styles.lockIcon}>🔒</Text>
              </View>
            </View>

            {/* ── BODY: white section with form ── */}
            <View style={styles.body}>

              {/* Main heading */}
              <Text style={styles.heading}>Forgot your password?</Text>

              {/* Subtitle instruction text */}
              <Text style={styles.subtitle}>
                Enter your registered email and we'll send you OTP
              </Text>

              {/* EMAIL ADDRESS FIELD */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Email address</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}       // updates state as user types
                  keyboardType="email-address"  // shows email-friendly keyboard
                  autoCapitalize="none"         // emails are lowercase
                  autoCorrect={false}
                  placeholder=""
                />
              </View>

              {/* SEND OTP BUTTON — dark navy, full width */}
              <TouchableOpacity style={styles.btnPrimary} onPress={handleSendOtp}>
                <Text style={styles.btnPrimaryText}>Send OTP</Text>
              </TouchableOpacity>

              {/* "Remembered it? Sign in" link at the bottom */}
              <View style={styles.signInRow}>
                <Text style={styles.signInText}>Remembered it? </Text>
                <TouchableOpacity onPress={onSignIn}>
                  <Text style={styles.signInLink}>Sign in</Text>
                </TouchableOpacity>
              </View>

            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: "#e8d5b7", // beige background behind the card
  },

  flex: {
    flex: 1,
  },

  // Centers the card vertically and horizontally
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },

  // The card that wraps both header and body
  card: {
    width: 300,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8, // shadow for Android
  },

  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    backgroundColor: "#ffffff", // warm beige
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    alignItems: "center",
  },

  // Back button row: arrow + "Reset password" label
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start", // pins it to the left
    marginBottom: 20,
  },

  backArrow: {
    fontSize: 18,
    color: "#1e2a3a",
    marginRight: 6,
  },

  backText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e2a3a",
  },

  // Circular background behind the lock icon
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  lockIcon: {
    fontSize: 28,
  },

  // ── Body ────────────────────────────────────────────────────────────────
  body: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    alignItems: "center", // centers heading and subtitle
  },

  heading: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e2a3a",
    marginBottom: 8,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 12,
    color: "#666666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 18,
  },

  // Wraps the label + input — full width
  formGroup: {
    width: "100%",
    marginBottom: 20,
  },

  label: {
    fontSize: 12,
    color: "#444444",
    marginBottom: 5,
  },

  input: {
    borderWidth: 1,
    borderColor: "#d0d0d0",
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontSize: 14,
    color: "#1e2a3a",
    width: "100%",
  },

  // Primary button — dark navy, full width
  btnPrimary: {
    width: "100%",
    backgroundColor: "#1e2a3a",
    borderRadius: 6,
    paddingVertical: 13,
    alignItems: "center",
    marginBottom: 20,
  },

  btnPrimaryText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },

  // "Remembered it? Sign in" row
  signInRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  signInText: {
    fontSize: 12,
    color: "#666666",
  },

  signInLink: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1e2a3a",
    textDecorationLine: "underline",
  },
});

export default ForgotPasswordScreen;