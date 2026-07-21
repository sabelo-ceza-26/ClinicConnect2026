// src/navigation/AppNavigator.tsx
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import StaffLoginScreen from '../screens/auth/StaffLoginScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import RegisterStep1Screen from '../screens/auth/RegisterStep1Screen';
import RegisterStep2Screen from '../screens/auth/RegisterStep2Screen';

// Patient Screens
import PatientHomeScreen from '../screens/patient/PatientHomeScreen';
import NearbyClinicsScreen from '../screens/patient/NearbyClinicsScreen';
import MedicalRecordScreen from '../screens/medical/MedicalRecordScreen';
import PatientProfileScreen from '../screens/patient/PatientProfileScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import EmergencyScreen from '../screens/emergency/EmergencyScreen';
import HealthTipsScreen from '../screens/patient/HealthTipsScreen';
import AlertsScreen from '../screens/patient/AlertsScreen';
import BookAppointmentScreen from '../screens/appointments/BookAppointmentScreen';
import AppointmentDetailScreen from '../screens/appointments/AppointmentDetailScreen';
import ClinicDetailsScreen from '../screens/patient/ClinicDetailScreen';

// Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import StaffListScreen from '../screens/admin/StaffListScreen';
import StaffDetailsScreen from '../screens/admin/StaffDetailsScreen';
import AddStaffScreen from '../screens/admin/AddStaffScreen';
import ClinicManagementScreen from '../screens/admin/ClinicManagementScreen';
import ClinicDetailsScreenAdmin from '../screens/admin/ClinicDetailsScreen';
import ServiceManagementScreen from '../screens/admin/ServicesManagementScreen';
import TimeSlotManagementScreen from '../screens/admin/TimeSlotManagementScreen';

import { RootStackParamList } from './types';
import { useAuth } from '../context/AuthContext';

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7C5C" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#F5F5F5' },
      }}
      initialRouteName={user ? 'PatientHome' : 'Login'}
    >
      {/* Auth Screens */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="StaffLogin" component={StaffLoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="RegisterStep1" component={RegisterStep1Screen} />
      <Stack.Screen name="RegisterStep2" component={RegisterStep2Screen} />

      {/* Patient Screens */}
      <Stack.Screen name="PatientHome" component={PatientHomeScreen} />
      <Stack.Screen name="PatientProfile" component={PatientProfileScreen} />
      <Stack.Screen name="MedicalRecord" component={MedicalRecordScreen} />
      <Stack.Screen name="NearbyClinics" component={NearbyClinicsScreen} />
      <Stack.Screen name="BookAppointment" component={BookAppointmentScreen} initialParams={{ clinicId: '' }} />
      <Stack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} initialParams={{ appointmentId: '' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Emergency" component={EmergencyScreen} />
      <Stack.Screen name="HealthTips" component={HealthTipsScreen} />
      <Stack.Screen name="Alerts" component={AlertsScreen} />
      <Stack.Screen name="ClinicDetails" component={ClinicDetailsScreen} initialParams={{ clinicId: '' }} />

      {/* Admin Screens */}
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="StaffList" component={StaffListScreen} />
      <Stack.Screen name="StaffDetails" component={StaffDetailsScreen} initialParams={{ staffId: '' }} />
      <Stack.Screen name="AddStaff" component={AddStaffScreen} />
      <Stack.Screen name="ClinicManagement" component={ClinicManagementScreen} />
      <Stack.Screen name="ClinicDetailsScreen" component={ClinicDetailsScreenAdmin} initialParams={{ clinicId: '' }} />
      <Stack.Screen name="ServiceManagement" component={ServiceManagementScreen} />
      <Stack.Screen name="TimeSlotManagement" component={TimeSlotManagementScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
});