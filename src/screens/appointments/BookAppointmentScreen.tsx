// src/screens/appointments/BookAppointmentScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../services/supabase/client';
import { RootStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'BookAppointment'>;
type RouteProp = import('@react-navigation/native').RouteProp<RootStackParamList, 'BookAppointment'>;

export default function BookAppointmentScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const { theme } = useTheme();
  const { clinicId } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [clinic, setClinic] = useState<any>(null);
  const [clinics, setClinics] = useState<any[]>([]);
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(clinicId || null);

  useEffect(() => {
    if (clinicId) {
      fetchClinicDetails();
    } else {
      fetchAllClinics();
    }
  }, [clinicId]);

  const fetchClinicDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', clinicId)
        .single();

      if (error) throw error;
      setClinic(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching clinic:', error);
      Alert.alert('Error', 'Failed to load clinic details');
      setLoading(false);
    }
  };

  const fetchAllClinics = async () => {
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('status', 'active')
        .order('clinic_name');

      if (error) throw error;
      setClinics(data || []);
      if (data && data.length > 0) {
        setSelectedClinicId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching clinics:', error);
      Alert.alert('Error', 'Failed to load clinics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6B7C5C" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {clinic ? (
          <View style={styles.clinicCard}>
            <Text style={styles.clinicName}>{clinic.clinic_name}</Text>
            <Text style={styles.clinicAddress}>{clinic.address || clinic.location}</Text>
            <Text style={styles.clinicPhone}>{clinic.phone}</Text>
          </View>
        ) : (
          <View style={styles.selectClinic}>
            <Text style={styles.selectTitle}>Select a Clinic</Text>
            <Text style={styles.selectSubtitle}>
              Please select a clinic to book your appointment
            </Text>
            
            {clinics.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.clinicOption,
                  selectedClinicId === item.id && styles.clinicOptionSelected,
                ]}
                onPress={() => setSelectedClinicId(item.id)}
              >
                <Text style={[
                  styles.clinicOptionName,
                  selectedClinicId === item.id && styles.clinicOptionNameSelected,
                ]}>
                  {item.clinic_name}
                </Text>
                <Text style={styles.clinicOptionAddress}>{item.location}</Text>
              </TouchableOpacity>
            ))}
            
            {selectedClinicId && (
              <TouchableOpacity
                style={styles.continueButton}
                onPress={() => {
                  // Navigate to next step with selected clinic
                  Alert.alert('Selected', `Clinic: ${clinics.find(c => c.id === selectedClinicId)?.clinic_name}`);
                }}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  content: {
    padding: 16,
    flexGrow: 1,
  },
  clinicCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  clinicName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  clinicAddress: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  clinicPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  selectClinic: {
    flex: 1,
  },
  selectTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  selectSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  clinicOption: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  clinicOptionSelected: {
    borderColor: '#6B7C5C',
    backgroundColor: '#F0F4EC',
  },
  clinicOptionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  clinicOptionNameSelected: {
    color: '#6B7C5C',
  },
  clinicOptionAddress: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  continueButton: {
    backgroundColor: '#6B7C5C',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});