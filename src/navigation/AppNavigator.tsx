import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import RegisterStep1Screen from '../screens/auth/RegisterStep1Screen';
import RegisterStep2Screen from '../screens/auth/RegisterStep2Screen';
import MedicalRecordScreen from '../screens/medical/MedicalRecordScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return null; 
  }

  return (
  <Stack.Navigator screenOptions={{ headerShown: false }}>

    {isLoggedIn ? (
      <>
    <Stack.Screen name="RegisterStep1" component={RegisterStep1Screen} />
    <Stack.Screen name="RegisterStep2" component={RegisterStep2Screen} />
    <Stack.Screen name="MedicalRecord" component={MedicalRecordScreen} />
      </>
    ) : (
        <Stack.Screen name="Main" component={RegisterStep1Screen} />
      )}
  </Stack.Navigator>
);
}

