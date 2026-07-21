// src/screens/patient/HealthTipsScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HealthTipsScreen() {
  return (
    <View style={styles.container}>
      <Text>Health Tips Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});