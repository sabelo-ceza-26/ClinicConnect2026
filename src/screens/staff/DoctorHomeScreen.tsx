import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';



type AppointmentStatus = 'escalated' | 'start' | 'booked' | 'cancelled' | 'done';

interface Appointment {
  id: string;
  patientName: string;
  time: string;
  reason: string;
  status: AppointmentStatus;
}

const DUMMY_APPOINTMENTS: Appointment[] = [
  {
    id: '1',
    patientName: 'Karabo Sithole',
    time: '08:30',
    reason: 'Elevated high blood pressure and mild dizziness',
    status: 'escalated',
  },
  {
    id: '2',
    patientName: 'Zavela Zigo',
    time: '09:30',
    reason: 'Flu symptoms',
    status: 'start',
  },
  {
    id: '3',
    patientName: 'Thimna Boss',
    time: '10:30',
    reason: 'General consultation',
    status: 'booked',
  },
  {
    id: '4',
    patientName: 'Andile Molina',
    time: '11:00',
    reason: 'Follow up',
    status: 'booked',
  },
  {
    id: '5',
    patientName: 'Ezina Doli',
    time: '11:30',
    reason: 'Follow up',
    status: 'cancelled',
  },
  {
    id: '6',
    patientName: 'Thabo Nkosi',
    time: '08:00',
    reason: 'Follow up',
    status: 'done',
  },
];

const STATS = [
  { label: 'Scheduled\nToday', value: 8 },
  { label: 'Seen', value: 3 },
  { label: 'Remaining', value: 5 },
  { label: 'Escalated\nto me', value: 1 },
];



const STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; bg: string; text: string; showButton?: boolean }
> = {
  escalated: { label: 'escalated', bg: '#E05A5A', text: '#fff' },
  start:     { label: 'Start',     bg: '#1E2D4E', text: '#fff', showButton: true },
  booked:    { label: 'Booked',    bg: '#5B7FC4', text: '#fff' },
  cancelled: { label: 'Cancelled', bg: '#C8A87A', text: '#fff' },
  done:      { label: 'Done',      bg: '#5BBB8A', text: '#fff' },
};

interface StatusBadgeProps {
  status: AppointmentStatus;
  onStartPress?: () => void;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, onStartPress }) => {
  const config = STATUS_CONFIG[status];

  if (status === 'escalated') {
    return (
      <View style={styles.badgeRow}>
        <View style={[styles.badge, { backgroundColor: config.bg }]}>
          <Text style={[styles.badgeText, { color: config.text }]}>{config.label}</Text>
        </View>
        <TouchableOpacity
          style={[styles.badge, { backgroundColor: '#1E2D4E', marginLeft: 6 }]}
          onPress={onStartPress}
        >
          <Text style={[styles.badgeText, { color: '#fff' }]}>Start</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.badge, { backgroundColor: config.bg }]}
      onPress={status === 'start' ? onStartPress : undefined}
      disabled={status !== 'start'}
    >
      <Text style={[styles.badgeText, { color: config.text }]}>{config.label}</Text>
    </TouchableOpacity>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

const DoctorHomeScreen: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>(DUMMY_APPOINTMENTS);
  const [activeNav, setActiveNav] = useState<'dashboard' | 'alert'>('dashboard');

  const handleStart = (id: string) => {
    // TODO: navigate to consultation screen or update status via API
    console.log('Starting appointment:', id);
  };

  const handleSignOut = () => {
    // TODO: hook into your auth context / navigation
    console.log('Sign out pressed');
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0F1B35" />

      <View style={styles.container}>
        {/* ── Sidebar ── */}
        <View style={styles.sidebar}>
          {/* Avatar + Name */}
          <View style={styles.avatarBlock}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>D</Text>
            </View>
            <View>
              <Text style={styles.doctorName}>Dr Radebe</Text>
              <Text style={styles.doctorRole}>Doctor</Text>
            </View>
          </View>

          {/* Nav Items */}
          <View style={styles.navItems}>
            <TouchableOpacity
              style={[styles.navItem, activeNav === 'dashboard' && styles.navItemActive]}
              onPress={() => setActiveNav('dashboard')}
            >
              <Text style={styles.navText}>Dashboard</Text>
            </TouchableOpacity>
            <View style={styles.divider} />

            <TouchableOpacity
              style={[styles.navItem, activeNav === 'alert' && styles.navItemActive]}
              onPress={() => setActiveNav('alert')}
            >
              <Text style={styles.navText}>Alert</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
          </View>

          {/* Sign Out */}
          <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* ── Main Content ── */}
        <ScrollView style={styles.main} showsVerticalScrollIndicator={false}>
          <Text style={styles.pageTitle}>Dashboard</Text>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            {STATS.map((stat) => (
              <View key={stat.label} style={styles.statCard}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
              </View>
            ))}
          </View>

          {/* Queue */}
          <View style={styles.queueCard}>
            <Text style={styles.queueTitle}>Queue</Text>

            {appointments.map((appt, index) => (
              <View key={appt.id}>
                <View style={styles.queueRow}>
                  <View style={styles.queueInfo}>
                    <Text style={styles.patientName}>{appt.patientName}</Text>
                    <Text style={styles.apptDetail}>
                      {appt.time} | {appt.reason}
                    </Text>
                  </View>
                  <StatusBadge
                    status={appt.status}
                    onStartPress={() => handleStart(appt.id)}
                  />
                </View>
                {index < appointments.length - 1 && <View style={styles.rowDivider} />}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};


const SIDEBAR_BG = '#0F1B35';
const MAIN_BG = '#F0EDE8';
const CARD_BG = '#1E2D4E';
const QUEUE_BG = '#D9D6D0';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: SIDEBAR_BG,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
  },

  // ── Sidebar ──
  sidebar: {
    width: 160,
    backgroundColor: SIDEBAR_BG,
    paddingTop: 24,
    paddingHorizontal: 16,
    justifyContent: 'flex-start',
  },
  avatarBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3A4F72',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  doctorName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  doctorRole: {
    color: '#8A9BB8',
    fontSize: 11,
  },
  navItems: {
    flex: 1,
  },
  navItem: {
    paddingVertical: 12,
  },
  navItemActive: {
    // you can add a left border or tint here if needed
  },
  navText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#2A3A58',
    marginVertical: 2,
  },
  signOutBtn: {
    paddingVertical: 16,
    marginBottom: 8,
  },
  signOutText: {
    color: '#8A9BB8',
    fontSize: 13,
  },

  // ── Main ──
  main: {
    flex: 1,
    backgroundColor: MAIN_BG,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 16,
  },

  // ── Stats ──
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 10,
    padding: 12,
    minHeight: 80,
    justifyContent: 'space-between',
  },
  statLabel: {
    color: '#A8B8D0',
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 15,
  },
  statValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
  },

  // ── Queue ──
  queueCard: {
    backgroundColor: QUEUE_BG,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
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
    paddingVertical: 10,
  },
  queueInfo: {
    flex: 1,
    paddingRight: 12,
  },
  patientName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 2,
  },
  apptDetail: {
    fontSize: 11,
    color: '#555',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#C4C1BB',
  },

  // ── Badge ──
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
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

export default DoctorHomeScreen;