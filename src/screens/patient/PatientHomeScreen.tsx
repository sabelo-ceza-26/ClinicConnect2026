// src/screens/patient/PatientHomeScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  useWindowDimensions,
  Platform,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase/client';

// Import types from central types file
import type { RootStackParamList } from '../../navigation/types';
import type { Appointment } from '../../types';

type NavigationProps = NavigationProp<RootStackParamList>;

// Local appointment interface (matches the one from types)
interface AppointmentDisplay {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  status: 'upcoming' | 'booked' | 'completed';
  clinicName?: string;
}

export default function PatientHomeScreen() {
  const navigation = useNavigation<NavigationProps>();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const [appointments, setAppointments] = useState<AppointmentDisplay[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [alertCount, setAlertCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('User');

  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width >= 1024;
  const isTablet = isWeb && width >= 768 && width < 1024;

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      if (!user?.id) {
        setUserName('User');
        return;
      }

      const { data, error } = await supabase
        .from('patients')
        .select('first_name, last_name')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // If no profile found, use email
        const emailName = user?.email?.split('@')[0] || 'User';
        setUserName(emailName);
        return;
      }

      if (data) {
        const firstName = data.first_name || '';
        const lastName = data.last_name || '';
        const name = `${firstName} ${lastName}`.trim();
        setUserName(name || user?.email?.split('@')[0] || 'User');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserName(user?.email?.split('@')[0] || 'User');
    }
  };

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // If no user, return early
      if (!user?.id) {
        setAppointments([]);
        setUnreadCount(0);
        setAlertCount(0);
        setIsLoading(false);
        return;
      }

      // Get patient ID
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (patientError) {
        console.log('No patient profile found');
        setAppointments([]);
        setUnreadCount(0);
        setAlertCount(0);
        setIsLoading(false);
        return;
      }

      if (patientData) {
        // Fetch appointments
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select(`
            id,
            reason_for_visit,
            status,
            created_at,
            clinic:clinics (
              clinic_name,
              location
            ),
            time_slot:time_slots (
              start_time,
              date
            )
          `)
          .eq('patient_id', patientData.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (appointmentsError) {
          console.error('Error fetching appointments:', appointmentsError);
          setAppointments([]);
        } else if (appointmentsData) {
          const formattedAppointments: AppointmentDisplay[] = appointmentsData.map((app: any) => ({
            id: app.id,
            title: app.reason_for_visit || 'General Consultation',
            date: app.time_slot?.date 
              ? new Date(app.time_slot.date).toLocaleDateString('en-ZA', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })
              : 'N/A',
            time: app.time_slot?.start_time || '12:00',
            location: app.clinic?.clinic_name || 'Clinic',
            status: app.status === 'completed'
              ? 'completed'
              : app.status === 'booked' || app.status === 'confirmed'
              ? 'booked'
              : 'upcoming',
            clinicName: app.clinic?.clinic_name,
          }));
          setAppointments(formattedAppointments);
        }
      }

      // Fetch unread notifications count
      const { count, error: notifError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (!notifError) {
        setUnreadCount(count || 0);
      }

      // Fetch alert count from emergency_alerts
      if (patientData?.id) {
        const { count: emergencyCount, error: alertError } = await supabase
          .from('emergency_alerts')
          .select('*', { count: 'exact', head: true })
          .eq('patient_id', patientData.id)
          .eq('emergency_status', 'pending');

        if (!alertError) {
          setAlertCount(emergencyCount || 0);
        }
      }

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Load user profile and data
  useEffect(() => {
    const loadData = async () => {
      await fetchUserProfile();
      await fetchDashboardData();
    };
    loadData();
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboardData();
  }, []);

  const handleEmergencyPress = () => navigation.navigate('Emergency');
  
  // Updated: Navigate to PatientProfile when avatar is clicked
  const handleAvatarPress = () => navigation.navigate('PatientProfile');

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'nearby':
        navigation.navigate('NearbyClinics');
        break;
      case 'book':
        navigation.navigate('BookAppointment', { clinicId: '' });
        break;
      case 'healthtips':
        navigation.navigate('HealthTips');
        break;
      case 'alerts':
        navigation.navigate('Alerts');
        break;
      case 'profile':
        navigation.navigate('PatientProfile');
        break;
      case 'records':
        navigation.navigate('MedicalRecord');
        break;
      default:
        console.warn(`Unknown action: ${action}`);
        break;
    }
  };

  const quickActions = [
    { id: 'nearby', label: 'Nearby Clinics', icon: 'business-outline', color: '#1a1a1a' },
    { id: 'book', label: 'Make a Booking', icon: 'add-circle-outline', color: '#1a1a1a' },
    { id: 'healthtips', label: 'Health Tips', icon: 'heart', color: '#c0392b' },
    { id: 'alerts', label: 'Alerts', icon: 'information-circle-outline', color: '#1a1a1a', badge: alertCount },
  ];

  const userInitials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  if (isLoading) {
    return (
      <LinearGradient
        colors={['#B08968', '#FFFFFF', '#FFFFFF']}
        locations={[0, 0.25, 0.5]}
        style={styles.gradientContainer}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6B7C5C" />
            <Text style={styles.loadingText}>Loading your dashboard...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#B08968', '#FFFFFF', '#FFFFFF']}
      locations={[0, 0.25, 0.5]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            isDesktop && styles.scrollContentDesktop,
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6B7C5C']} />
          }
        >
          <View
            style={[
              styles.contentContainer,
              { maxWidth: isDesktop ? 1200 : isTablet ? 768 : '100%' },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={[styles.greeting, isDesktop && styles.greetingDesktop]}>
                  Hello, {userName}
                </Text>
                <Text style={[styles.appName, isDesktop && styles.appNameDesktop]}>
                  ClinicConnect
                </Text>
              </View>
              {/* Updated: Navigate to PatientProfile on avatar press */}
              <TouchableOpacity style={styles.avatarCircle} onPress={handleAvatarPress}>
                <Text style={styles.avatarText}>{userInitials}</Text>
                {unreadCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Stats Row */}
            <View style={[styles.statsRow, isDesktop && styles.statsRowDesktop]}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Upcoming</Text>
                <Text style={styles.statValue}>
                  {appointments.filter(a => a.status === 'booked' || a.status === 'upcoming').length}
                </Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Unread messages</Text>
                <Text style={styles.statValue}>{unreadCount}</Text>
              </View>
            </View>

            {/* Upcoming Appointments */}
            <View style={styles.section}>
              <Text style={styles.sectionTitleUppercase}>UPCOMING APPOINTMENTS</Text>
              {appointments.length > 0 ? (
                appointments
                  .filter(a => a.status === 'booked' || a.status === 'upcoming')
                  .slice(0, 3)
                  .map((appt) => (
                    <TouchableOpacity
                      key={appt.id}
                      style={styles.appointmentCard}
                      onPress={() =>
                        navigation.navigate('AppointmentDetail', { appointmentId: appt.id })
                      }
                    >
                      <View style={styles.appointmentHeader}>
                        <Text style={styles.appointmentTitle}>{appt.title}</Text>
                        <View style={styles.bookedBadge}>
                          <Text style={styles.bookedBadgeText}>
                            {appt.status === 'booked' ? 'Booked' : 'Upcoming'}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.appointmentRow}>
                        <Ionicons name="calendar-outline" size={14} color="#888" />
                        <Text style={styles.appointmentDetail}>
                          {appt.date} · {appt.time}
                        </Text>
                      </View>
                      <View style={styles.appointmentRow}>
                        <Ionicons name="location-outline" size={14} color="#888" />
                        <Text style={styles.appointmentDetail}>
                          {appt.clinicName || appt.location}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))
              ) : (
                <View style={styles.emptyAppointments}>
                  <Ionicons name="calendar-outline" size={40} color="#CCC" />
                  <Text style={styles.emptyText}>No upcoming appointments</Text>
                  <TouchableOpacity
                    style={styles.bookNowButton}
                    onPress={() => navigation.navigate('BookAppointment', { clinicId: '' })}
                  >
                    <Text style={styles.bookNowText}>Book Now</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitleCenter}>Quick Actions</Text>
              <View
                style={[
                  styles.actionsGrid,
                  isDesktop && styles.actionsGridDesktop,
                  isTablet && styles.actionsGridTablet,
                ]}
              >
                {quickActions.map((action) => (
                  <TouchableOpacity
                    key={action.id}
                    style={[
                      styles.actionCard,
                      isDesktop && styles.actionCardDesktop,
                      isTablet && styles.actionCardTablet,
                    ]}
                    onPress={() => handleQuickAction(action.id)}
                  >
                    {action.badge != null && action.badge > 0 && (
                      <View style={styles.alertBadge}>
                        <Text style={styles.alertBadgeText}>{action.badge}</Text>
                      </View>
                    )}
                    <Text style={styles.actionLabel}>{action.label}</Text>
                    <View style={styles.actionIconWrapper}>
                      <Ionicons name={action.icon as any} size={36} color="#FFF" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Emergency Button */}
            <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyPress}>
              <Ionicons name="warning-outline" size={20} color="#fff" />
              <Text style={styles.emergencyText}>Emergency</Text>
            </TouchableOpacity>

            <View style={{ height: isDesktop ? 32 : 16 }} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const SAGE = '#6B7C5C';

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  scrollContentDesktop: {
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: 'transparent',
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  greetingDesktop: {
    fontSize: 28,
  },
  appName: {
    fontSize: 13,
    color: '#555',
    marginTop: 2,
  },
  appNameDesktop: {
    fontSize: 16,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#D5CBC4',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4a3a32',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#E53935',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
    marginBottom: 14,
  },
  statsRowDesktop: {
    gap: 20,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: SAGE,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#c8d6bc',
    fontWeight: '500',
    marginBottom: 6,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 14,
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitleUppercase: {
    fontSize: 11,
    fontWeight: '700',
    color: '#333',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  sectionTitleCenter: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyAppointments: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    paddingVertical: 32,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#aaa',
  },
  bookNowButton: {
    marginTop: 4,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: SAGE,
    borderRadius: 8,
  },
  bookNowText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  appointmentCard: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  appointmentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
  },
  bookedBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  bookedBadgeText: {
    fontSize: 11,
    color: '#2196F3',
    fontWeight: '600',
  },
  appointmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  appointmentDetail: {
    fontSize: 12,
    color: '#777',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionsGridDesktop: {
    gap: 16,
  },
  actionsGridTablet: {
    gap: 12,
  },
  actionCard: {
    width: '47%',
    backgroundColor: SAGE,
    borderRadius: 10,
    paddingTop: 10,
    paddingBottom: 14,
    paddingHorizontal: 12,
    alignItems: 'flex-start',
    position: 'relative',
    minHeight: 120,
  },
  actionCardDesktop: {
    width: '23%',
  },
  actionCardTablet: {
    width: '30%',
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#e8f0e0',
    marginBottom: 8,
  },
  actionIconWrapper: {
    alignSelf: 'center',
    marginTop: 4,
  },
  alertBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#E53935',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    zIndex: 1,
  },
  alertBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E53935',
    marginHorizontal: 60,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  emergencyText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});