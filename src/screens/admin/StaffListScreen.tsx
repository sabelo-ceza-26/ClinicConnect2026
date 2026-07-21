// src/screens/admin/StaffListScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../services/supabase/client';

interface StaffMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  contact_number: string;
  role: string;
  clinic_id: string;
  staff_reg_number: string;
  status: 'active' | 'inactive';
  clinicName?: string;
}

type FilterType = 'all' | 'Doctor' | 'Nurse' | 'Admin' | 'FirstResponder';

export default function StaffListScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');

  const filters: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'Doctor', label: 'Doctors' },
    { id: 'Nurse', label: 'Nurses' },
    { id: 'Admin', label: 'Admins' },
    { id: 'FirstResponder', label: 'Responders' },
  ];

  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('staff')
        .select(`
          *,
          clinic:clinic_id (clinic_name)
        `)
        .order('first_name', { ascending: true });

      if (error) throw error;
      
      const formattedData = data?.map(item => ({
        ...item,
        clinicName: item.clinic?.clinic_name || 'Unassigned',
      })) || [];
      
      setStaff(formattedData);
      applyFilters(formattedData, searchQuery, selectedFilter);
    } catch (error) {
      console.error('Failed to fetch staff:', error);
      Alert.alert('Error', 'Failed to load staff members');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStaff();
    }, [])
  );

  const applyFilters = (data: StaffMember[], query: string, filter: FilterType) => {
    let filtered = [...data];

    if (query) {
      filtered = filtered.filter(
        staff =>
          staff.first_name.toLowerCase().includes(query.toLowerCase()) ||
          staff.last_name.toLowerCase().includes(query.toLowerCase()) ||
          staff.email.toLowerCase().includes(query.toLowerCase()) ||
          staff.staff_reg_number.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (filter !== 'all') {
      filtered = filtered.filter(staff => staff.role === filter);
    }

    setFilteredStaff(filtered);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(staff, query, selectedFilter);
  };

  const handleFilter = (filter: FilterType) => {
    setSelectedFilter(filter);
    applyFilters(staff, searchQuery, filter);
  };

  const handleDeleteStaff = (staffId: string, staffName: string) => {
    Alert.alert(
      'Delete Staff Member',
      `Are you sure you want to delete ${staffName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('staff')
                .delete()
                .eq('id', staffId);
              
              if (error) throw error;
              await fetchStaff();
              Alert.alert('Success', 'Staff member deleted successfully');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete staff member');
            }
          },
        },
      ]
    );
  };

  const renderStaffCard = (staff: StaffMember) => {
    const roleColors: Record<string, string> = {
      Doctor: '#2196F3',
      Nurse: '#4CAF50',
      Admin: '#FF9800',
      FirstResponder: '#E53935',
    };

    const roleIcons: Record<string, string> = {
      Doctor: 'medical-outline',
      Nurse: 'medkit-outline',
      Admin: 'person-outline',
      FirstResponder: 'alert-circle-outline',
    };

    return (
      <TouchableOpacity
        key={staff.id}
        style={[styles.staffCard, { backgroundColor: theme.colors.surface }]}
        onPress={() => navigation.navigate('StaffDetails', { staffId: staff.id })}
      >
        <View style={styles.staffHeader}>
          <View style={styles.staffInfo}>
            <View style={styles.nameContainer}>
              <Text style={[styles.staffName, { color: theme.colors.text }]}>
                {staff.first_name} {staff.last_name}
              </Text>
              <View style={[styles.roleBadge, { backgroundColor: roleColors[staff.role] + '20' }]}>
                <Ionicons name={roleIcons[staff.role] as any} size={12} color={roleColors[staff.role]} />
                <Text style={[styles.roleText, { color: roleColors[staff.role] }]}>
                  {staff.role}
                </Text>
              </View>
            </View>
            <Text style={[styles.staffId, { color: theme.colors.textSecondary }]}>
              {staff.staff_reg_number}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleDeleteStaff(staff.id, `${staff.first_name} ${staff.last_name}`)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={20} color="#E53935" />
          </TouchableOpacity>
        </View>

        <View style={styles.staffDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="mail-outline" size={14} color="#666" />
            <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
              {staff.email}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={14} color="#666" />
            <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
              {staff.contact_number || 'N/A'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="business-outline" size={14} color="#666" />
            <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
              {staff.clinicName || 'Unassigned'}
            </Text>
          </View>
        </View>

        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: staff.status === 'active' ? '#4CAF50' : '#9E9E9E' }]} />
          <Text style={[styles.statusText, { color: staff.status === 'active' ? '#4CAF50' : '#9E9E9E' }]}>
            {staff.status === 'active' ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={['#B08968', '#FFFFFF', '#FFFFFF']}
        locations={[0, 0.15, 0.5]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Staff Management</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddStaff')}
          >
            <Ionicons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search staff..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#999"
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                selectedFilter === filter.id && styles.filterChipActive,
              ]}
              onPress={() => handleFilter(filter.id)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === filter.id && styles.filterChipTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6B7C5C" />
            <Text style={styles.loadingText}>Loading staff...</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={fetchStaff} colors={['#6B7C5C']} />
            }
            showsVerticalScrollIndicator={false}
          >
            {filteredStaff.length > 0 ? (
              filteredStaff.map(renderStaffCard)
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={64} color="#CCC" />
                <Text style={styles.emptyTitle}>No staff found</Text>
                <Text style={styles.emptyText}>
                  {searchQuery
                    ? `No results for "${searchQuery}"`
                    : 'No staff members registered yet'}
                </Text>
              </View>
            )}
            <View style={{ height: 20 }} />
          </ScrollView>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  gradient: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1a1a1a' },
  addButton: {
    backgroundColor: '#6B7C5C',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: '#333' },
  filtersContainer: { marginVertical: 8 },
  filtersContent: { paddingHorizontal: 16, gap: 8, paddingBottom: 8 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#6B7C5C',
    borderColor: '#6B7C5C',
  },
  filterChipText: { fontSize: 13, color: '#666' },
  filterChipTextActive: { color: '#FFF' },
  listContent: { padding: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#666' },
  staffCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  staffHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  staffInfo: { flex: 1 },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  staffName: { fontSize: 16, fontWeight: '600' },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  roleText: { fontSize: 11, fontWeight: '600' },
  staffId: { fontSize: 12, marginTop: 2 },
  deleteButton: { padding: 4 },
  staffDetails: { gap: 4 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailText: { fontSize: 13 },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '500' },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#999', textAlign: 'center', marginTop: 8 },
});