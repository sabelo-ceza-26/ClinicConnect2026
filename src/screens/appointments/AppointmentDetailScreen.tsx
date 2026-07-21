// src/screens/appointments/AppointmentDetailScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AppointmentDetailScreen() {
  return (
    <View style={styles.container}>
      <Text>Appointment Detail Screen</Text>
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