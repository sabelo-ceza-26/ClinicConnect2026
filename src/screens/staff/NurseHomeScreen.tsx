import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

type PatientStatus = 'waiting' | 'in-progress' | 'vitals-done' | 'escalated' | 'done';

interface Patient {
  id: string;
  name: string;
  time: string;
  reason: string;
  status: PatientStatus;
}

const DUMMY_PATIENTS: Patient[] = [
  { id: '1', name: 'Yusrah Adams', time: '08:30', reason: 'Routine blood pressure check', status: 'done' },
  { id: '2', name: 'Lesego Mokoena', time: '08:45', reason: 'Wound dressing follow-up', status: 'in-progress' },
  { id: '3', name: 'Dikeledi Phiri', time: '09:00', reason: 'Diabetes management', status: 'vitals-done' },
  { id: '4', name: 'Athini Nxumalo', time: '09:15', reason: 'Post-natal check-up', status: 'done' },
  { id: '5', name: 'Lunga Thomas', time: '10:00', reason: 'Chronic medication refill', status: 'escalated' },
  { id: '6', name: 'Faith Williams', time: '10:30', reason: 'Child vaccination', status: 'done' },
  { id: '7', name: 'Thandiwe Molefe', time: '11:00', reason: 'Eye infection treatment', status: 'done' },
  { id: '8', name: 'Sipho Dlamini', time: '11:30', reason: 'Chest X-ray results', status: 'in-progress' },
  { id: '9', name: 'Naledi Khumalo', time: '12:00', reason: 'Flu symptoms and fever', status: 'waiting' },
];

const STATS = [
  { label: 'In Queue', value: 4, icon: 'people' as const },
  { label: 'Vitals Done', value: 1, icon: 'checkmark-circle' as const },
  { label: 'Escalated', value: 1, icon: 'alert-circle' as const },
  { label: 'Completed', value: 1, icon: 'clipboard' as const },
];

const STATUS_CONFIG: Record<PatientStatus, { label: string; bg: string; text: string }> = {
  'waiting':     { label: 'Waiting',     bg: '#5B7FC4', text: '#fff' },
  'in-progress': { label: 'In Progress', bg: '#1E2D4E', text: '#fff' },
  'vitals-done': { label: 'Vitals Done', bg: '#5BBB8A', text: '#fff' },
  'escalated':   { label: 'Escalated',   bg: '#E05A5A', text: '#fff' },
  'done':        { label: 'Done',        bg: '#8A9BB8', text: '#fff' },
};

const HEADER_BG = '#0F1B35';
const MAIN_BG = '#F0EDE8';
const CARD_BG = '#1E2D4E';
const QUEUE_BG = '#D9D6D0';

const NurseHomeScreen: React.FC = () => {
  const [patients] = useState<Patient[]>(DUMMY_PATIENTS);
  const { logout } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (e) {
      console.log('Sign out error:', e);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={HEADER_BG} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={handleSignOut} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>N</Text>
          </View>
          <View>
            <Text style={styles.headerName}>Nurse Banderker</Text>
            <Text style={styles.headerRole}>Nurse</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.main}>
        <Text style={styles.pageTitle}>Dashboard</Text>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {STATS.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Ionicons name={stat.icon} size={20} color="#A8B8D0" />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Patient Queue */}
        <View style={styles.queueCard}>
          <Text style={styles.queueTitle}>Patient Queue</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {patients.map((patient, index) => (
              <View key={patient.id}>
                <View style={styles.queueRow}>
                  <View style={styles.queueInfo}>
                    <Text style={styles.patientName}>{patient.name}</Text>
                    <Text style={styles.apptDetail}>
                      {patient.time} | {patient.reason}
                    </Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: STATUS_CONFIG[patient.status].bg }]}>
                    <Text style={[styles.badgeText, { color: STATUS_CONFIG[patient.status].text }]}>
                      {STATUS_CONFIG[patient.status].label}
                    </Text>
                  </View>
                </View>
                {index < patients.length - 1 && <View style={styles.rowDivider} />}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: HEADER_BG,
  },

  // Header
  header: {
    backgroundColor: HEADER_BG,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3A4F72',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  headerName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerRole: {
    color: '#8A9BB8',
    fontSize: 12,
  },
  backBtn: {
    padding: 8,
    marginRight: 4,
  },

  // Main
  main: {
    flex: 1,
    backgroundColor: MAIN_BG,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 16,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 10,
    minHeight: 70,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    color: '#A8B8D0',
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Queue
  queueCard: {
    backgroundColor: QUEUE_BG,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    flex: 1,
  },
  queueTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 12,
  },
  queueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  queueInfo: {
    flex: 1,
    paddingRight: 12,
  },
  patientName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 2,
  },
  apptDetail: {
    fontSize: 12,
    color: '#555',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#C4C1BB',
  },

  // Badge
  badge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default NurseHomeScreen;
