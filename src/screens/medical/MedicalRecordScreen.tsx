import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { medicalApi } from '../../services/api';

interface MedicalRecord {
  id: string;
  patientId: string;
  allergies: string[];
  chronicMedication: string[];
  visitDate: string;
  diagnosisNotes: string;
  appointmentId: string;
  clinicName?: string;
  doctorName?: string;
}

export default function MedicalRecordScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  const fetchMedicalRecords = async () => {
    try {
      setIsLoading(true);
      const data = await medicalApi.getPatientRecords(user?.id || '');
      setRecords(data);
      if (data && data.length > 0) {
        setSelectedRecord(data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch medical records:', error);
      Alert.alert('Error', 'Failed to load medical records');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMedicalRecords();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMedicalRecords();
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-ZA', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6B7C5C" />
          <Text style={styles.loadingText}>Loading medical records...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const record = selectedRecord || records[0] || null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6B7C5C']} />
        }
      >
        {/* Navigation Header */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2D3A2B" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Medical Record</Text>
          <Text style={styles.patientId}>
            Patient ID: {user?.id?.substring(0, 8) || 'N/A'}
          </Text>
        </View>

        {record ? (
          <>
            {/* Visit Summary Section */}
            <Text style={styles.sectionTitle}>VISIT SUMMARY</Text>
            <View style={styles.summaryCard}>
              <View style={styles.row}>
                <Text style={styles.label}>Appointment</Text>
                <Text style={styles.value}>
                  {record.diagnosisNotes?.substring(0, 30) || 'General Consultation'}
                  {'\n'}
                  {formatDate(record.visitDate)}
                  {record.visitDate && ` at ${formatTime(record.visitDate)}`}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Clinic</Text>
                <Text style={[styles.value, styles.linkText]}>
                  {record.clinicName || 'Adriaanse Clinic'}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Status</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>Completed</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <Text style={styles.notesLabel}>Diagnostic notes:</Text>
              <Text style={styles.notesText}>
                {record.diagnosisNotes || 'No diagnostic notes available for this visit.'}
              </Text>
            </View>

            {/* Allergies Section */}
            {record.allergies && record.allergies.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>ALLERGIES</Text>
                <View style={styles.pillContainer}>
                  {record.allergies.map((allergy, index) => (
                    <View key={index} style={styles.pill}>
                      <Text style={styles.pillText}>{allergy}</Text>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <View style={styles.emptySection}>
                <Text style={styles.emptySectionText}>No allergies recorded</Text>
              </View>
            )}

            {/* Medication Section */}
            {record.chronicMedication && record.chronicMedication.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>MEDICATION</Text>
                <View style={styles.pillContainer}>
                  {record.chronicMedication.map((med, index) => (
                    <View key={index} style={styles.pill}>
                      <Text style={styles.pillText}>{med}</Text>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <View style={styles.emptySection}>
                <Text style={styles.emptySectionText}>No medications recorded</Text>
              </View>
            )}

            {/* Last Visit Section */}
            <Text style={styles.sectionTitle}>LAST VISIT</Text>
            <Text style={styles.lastVisitDate}>
              {formatDate(record.visitDate) || 'No visits recorded'}
            </Text>

            {/* Action Button */}
            <TouchableOpacity style={styles.downloadButton}>
              <Ionicons name="download-outline" size={20} color="#FFFFFF" />
              <Text style={styles.downloadButtonText}>Download PDF</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="medical-outline" size={64} color="#CCC" />
            <Text style={styles.emptyTitle}>No Medical Records</Text>
            <Text style={styles.emptyText}>
              Your medical records will appear here after your first appointment.
            </Text>
            <TouchableOpacity
              style={styles.bookAppointmentButton}
              onPress={() => navigation.navigate('BookAppointment' as never)}
            >
              <Text style={styles.bookAppointmentText}>Book an Appointment</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F7F6',
  },
  container: {
    paddingHorizontal: 25,
    paddingBottom: 40,
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
  backButton: {
    marginTop: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginVertical: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#202020',
  },
  patientId: {
    fontSize: 14,
    color: '#707070',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2D3A2B',
    marginTop: 25,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#555555',
    flex: 1,
  },
  value: {
    fontSize: 13,
    color: '#2D3A2B',
    fontWeight: '600',
    flex: 1.5,
    textAlign: 'right',
  },
  linkText: {
    textDecorationLine: 'underline',
  },
  statusBadge: {
    backgroundColor: '#A8C6A3',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  statusText: {
    color: '#2D3A2B',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 15,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#444',
    marginBottom: 6,
  },
  notesText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pill: {
    backgroundColor: '#769471',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  pillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  lastVisitDate: {
    fontSize: 15,
    color: '#2D3A2B',
    fontWeight: '500',
  },
  downloadButton: {
    backgroundColor: '#3F4E65',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 45,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  bookAppointmentButton: {
    backgroundColor: '#6B7C5C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  bookAppointmentText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptySection: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  emptySectionText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});