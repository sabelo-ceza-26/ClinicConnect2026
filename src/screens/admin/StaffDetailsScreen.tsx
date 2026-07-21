// src/screens/admin/StaffDetailsScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../services/supabase/client';

interface StaffMember {
  id: string;
  user_id: string;
  staff_reg_number: string;
  first_name: string;
  last_name: string;
  email: string;
  contact_number: string;
  role: string;
  clinic_id: string;
  specialization: string;
  license_number: string;
  department: string;
  response_unit: string;
  ambulance_number: string;
  status: 'active' | 'inactive';
}

export default function StaffDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();
  const { staffId } = route.params as { staffId: string };
  const [staff, setStaff] = useState<StaffMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStaffDetails = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('id', staffId)
        .single();

      if (error) throw error;
      setStaff(data);
    } catch (error) {
      console.error('Failed to fetch staff details:', error);
      Alert.alert('Error', 'Failed to load staff details');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStaffDetails();
  }, [staffId]);

  const handleCall = () => {
    if (staff?.contact_number) {
      Linking.openURL(`tel:${staff.contact_number}`);
    }
  };

  const handleEmail = () => {
    if (staff?.email) {
      Linking.openURL(`mailto:${staff.email}`);
    }
  };

  const handleToggleStatus = async () => {
    Alert.alert(
      staff?.status === 'active' ? 'Deactivate Staff' : 'Activate Staff',
      `Are you sure you want to ${staff?.status === 'active' ? 'deactivate' : 'activate'} ${staff?.first_name} ${staff?.last_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const newStatus = staff?.status === 'active' ? 'inactive' : 'active';
              const { error } = await supabase
                .from('staff')
                .update({ status: newStatus })
                .eq('id', staffId);
              
              if (error) throw error;
              await fetchStaffDetails();
              Alert.alert('Success', `Staff ${staff?.status === 'active' ? 'deactivated' : 'activated'} successfully`);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to update staff status');
            }
          },
        },
      ]
    );
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Doctor': return 'medical-outline';
      case 'Nurse': return 'medkit-outline';
      case 'Admin': return 'person-outline';
      case 'FirstResponder': return 'alert-circle-outline';
      default: return 'person-outline';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Doctor': return '#2196F3';
      case 'Nurse': return '#4CAF50';
      case 'Admin': return '#FF9800';
      case 'FirstResponder': return '#E53935';
      default: return '#666';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6B7C5C" />
          <Text style={styles.loadingText}>Loading staff details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!staff) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#E53935" />
          <Text style={styles.errorText}>Staff member not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={['#B08968', '#FFFFFF', '#FFFFFF']}
        locations={[0, 0.15, 0.5]}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchStaffDetails} colors={['#6B7C5C']} />
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Staff Details</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={[styles.profileCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.profileHeader}>
              <View style={[styles.avatarContainer, { backgroundColor: getRoleColor(staff.role) + '20' }]}>
                <Text style={[styles.avatarText, { color: getRoleColor(staff.role) }]}>
                  {staff.first_name[0]}{staff.last_name[0]}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={[styles.profileName, { color: theme.colors.text }]}>
                  {staff.first_name} {staff.last_name}
                </Text>
                <View style={styles.roleBadge}>
                  <Ionicons name={getRoleIcon(staff.role)} size={14} color={getRoleColor(staff.role)} />
                  <Text style={[styles.roleText, { color: getRoleColor(staff.role) }]}>
                    {staff.role}
                  </Text>
                </View>
                <Text style={[styles.staffIdText, { color: theme.colors.textSecondary }]}>
                  ID: {staff.staff_reg_number}
                </Text>
              </View>
            </View>

            <View style={[styles.statusContainer, { 
              backgroundColor: staff.status === 'active' ? '#4CAF50' : '#9E9E9E',
            }]}>
              <Text style={styles.statusText}>
                {staff.status === 'active' ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>

          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Contact Details
            </Text>
            <TouchableOpacity style={styles.contactItem} onPress={handleCall}>
              <Ionicons name="call-outline" size={20} color="#4CAF50" />
              <Text style={[styles.contactText, { color: theme.colors.text }]}>
                {staff.contact_number || 'Not provided'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactItem} onPress={handleEmail}>
              <Ionicons name="mail-outline" size={20} color="#2196F3" />
              <Text style={[styles.contactText, { color: theme.colors.text }]}>
                {staff.email}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Role Details
            </Text>
            {staff.role === 'Doctor' && (
              <>
                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                    Specialization
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                    {staff.specialization || 'Not specified'}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                    License Number
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                    {staff.license_number || 'Not specified'}
                  </Text>
                </View>
              </>
            )}
            {staff.role === 'Nurse' && (
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                  Department
                </Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {staff.department || 'Not specified'}
                </Text>
              </View>
            )}
            {staff.role === 'FirstResponder' && (
              <>
                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                    Response Unit
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                    {staff.response_unit || 'Not specified'}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                    Ambulance Number
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                    {staff.ambulance_number || 'Not specified'}
                  </Text>
                </View>
              </>
            )}
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, { 
                backgroundColor: staff.status === 'active' ? '#FF9800' : '#4CAF50' 
              }]}
              onPress={handleToggleStatus}
            >
              <Ionicons 
                name={staff.status === 'active' ? 'lock-closed-outline' : 'lock-open-outline'} 
                size={20} 
                color="#FFF" 
              />
              <Text style={styles.actionButtonText}>
                {staff.status === 'active' ? 'Deactivate Staff' : 'Activate Staff'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  gradient: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#666' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#666', marginTop: 12 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1a1a1a' },
  profileCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: { fontSize: 28, fontWeight: '700' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  roleText: { fontSize: 14, fontWeight: '600' },
  staffIdText: { fontSize: 12 },
  statusContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  contactItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 12 },
  contactText: { fontSize: 14 },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: { fontSize: 13 },
  detailValue: { fontSize: 13, fontWeight: '500' },
  actionsContainer: { marginTop: 8 },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});