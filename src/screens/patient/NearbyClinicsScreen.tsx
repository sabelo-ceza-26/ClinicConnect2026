// src/screens/patient/NearbyClinicsScreen.tsx
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  useWindowDimensions,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../services/supabase/client';
import {
  getBestLocation,
  getAddressFromCoordinates,
  CAPE_TOWN_COORDINATES,
  calculateDistance,
  formatDistance,
} from '../../utils/location';

export interface Clinic {
  id: string;
  name: string;
  distance: string;
  distanceKm: number;
  hours: string;
  openTime: string;
  closeTime: string;
  status: 'open' | 'closed' | 'closing_soon';
  services: string[];
  address: string;
  phone: string;
  rating: number;
  waitTime?: string;
  acceptingWalkins?: boolean;
  latitude?: number;
  longitude?: number;
}

type FilterOption = 'all' | 'open' | 'nearby' | 'antenatal';
type SortOption = 'distance' | 'rating' | 'name';

export default function NearbyClinicsScreen() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const scrollY = useRef(new Animated.Value(0)).current;

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('all');
  const [selectedSort, setSelectedSort] = useState<SortOption>('distance');
  const [expandedClinic, setExpandedClinic] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(true);
  const [searchArea, setSearchArea] = useState('Cape Town, Western Cape');

  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width >= 1024;
  const isTablet = isWeb && width >= 768 && width < 1024;
  const contentMaxWidth = isDesktop ? 1200 : isTablet ? 768 : '100%';

  const filters: { id: FilterOption; label: string; icon: string }[] = [
    { id: 'all', label: 'All', icon: 'apps-outline' },
    { id: 'open', label: 'Open Now', icon: 'time-outline' },
    { id: 'nearby', label: '< 5 km', icon: 'navigate-outline' },
    { id: 'antenatal', label: 'Antenatal', icon: 'medkit-outline' },
  ];

  const sortOptions: { id: SortOption; label: string }[] = [
    { id: 'distance', label: 'Distance' },
    { id: 'rating', label: 'Rating' },
    { id: 'name', label: 'Name' },
  ];

  // Get user location with best available method
  const getUserLocationAndAddress = async () => {
    try {
      setIsLocating(true);
      setLocationError(null);

      const location = await getBestLocation();

      setUserLocation(location);

      if (
        location.latitude === CAPE_TOWN_COORDINATES.latitude &&
        location.longitude === CAPE_TOWN_COORDINATES.longitude
      ) {
        setLocationError('Using default location (Cape Town)');
        setSearchArea('Cape Town, Western Cape');
      } else {
        try {
          const address = await getAddressFromCoordinates(location);
          if (address) {
            setSearchArea(address);
          } else {
            setSearchArea('Cape Town, Western Cape');
          }
        } catch (addressError) {
          console.log('Could not get address, using default:', addressError);
          setSearchArea('Cape Town, Western Cape');
        }
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationError('Unable to get your location. Showing Cape Town clinics.');
      setUserLocation(CAPE_TOWN_COORDINATES);
      setSearchArea('Cape Town, Western Cape');
    } finally {
      setIsLocating(false);
    }
  };

  // Fetch clinics from Supabase
  const fetchClinics = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('clinics')
        .select(`
          *,
          services:services (
            id,
            service_name,
            description,
            estimated_duration
          )
        `)
        .eq('status', 'active');

      if (error) throw error;

      if (!data || data.length === 0) {
        setClinics([]);
        setIsLoading(false);
        return;
      }

      const locationToUse = userLocation || CAPE_TOWN_COORDINATES;

      const formattedClinics: Clinic[] = data.map((clinic: any) => {
        let distanceKm = 0;
        let distance = 'N/A';

        if (clinic.latitude && clinic.longitude) {
          distanceKm = calculateDistance(
            locationToUse.latitude,
            locationToUse.longitude,
            clinic.latitude,
            clinic.longitude
          );
          distance = formatDistance(distanceKm);
        }

        const serviceNames = clinic.services?.map((s: any) => s.service_name) || [];
        const status: 'open' | 'closed' | 'closing_soon' = clinic.status === 'active' ? 'open' : 'closed';

        return {
          id: clinic.id,
          name: clinic.clinic_name,
          distance: distance,
          distanceKm: distanceKm,
          hours: clinic.operating_hours || 'Mon - Fri: 07:30 - 16:30',
          openTime: '07:30',
          closeTime: '16:30',
          status: status,
          services: serviceNames,
          address: clinic.address || clinic.location || '',
          phone: clinic.phone || clinic.contact_details || '',
          rating: 4.0 + Math.random() * 0.8,
          waitTime: distanceKm < 3 ? '10-20 min' : distanceKm < 5 ? '20-35 min' : '30-45 min',
          acceptingWalkins: Math.random() > 0.3,
          latitude: clinic.latitude,
          longitude: clinic.longitude,
        };
      });

      formattedClinics.sort((a, b) => a.distanceKm - b.distanceKm);

      setClinics(formattedClinics);
    } catch (error) {
      console.error('Failed to fetch clinics:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Initialize
  useEffect(() => {
    const init = async () => {
      await getUserLocationAndAddress();
    };
    init();
  }, []);

  // Fetch clinics when user location is set
  useEffect(() => {
    if (userLocation !== null) {
      fetchClinics();
    }
  }, [userLocation]);

  const filteredAndSortedClinics = useMemo(() => {
    let filtered = [...clinics];

    if (searchQuery) {
      filtered = filtered.filter(clinic =>
        clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clinic.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (selectedFilter) {
      case 'open':
        filtered = filtered.filter(clinic => clinic.status === 'open');
        break;
      case 'nearby':
        filtered = filtered.filter(clinic => clinic.distanceKm <= 5);
        break;
      case 'antenatal':
        filtered = filtered.filter(clinic =>
          clinic.services.some(s =>
            s.toLowerCase().includes('maternity') ||
            s.toLowerCase().includes('antenatal') ||
            s.toLowerCase().includes('pregnancy')
          )
        );
        break;
      default:
        break;
    }

    filtered.sort((a, b) => {
      switch (selectedSort) {
        case 'distance':
          return a.distanceKm - b.distanceKm;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [clinics, searchQuery, selectedFilter, selectedSort]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getUserLocationAndAddress();
    await fetchClinics();
  }, []);

  const handleClinicPress = useCallback((clinicId: string) => {
    setExpandedClinic(prev => prev === clinicId ? null : clinicId);
  }, []);

  const handleBookAppointment = useCallback((clinic: Clinic) => {
    const foundClinic = clinics.find(c => c.id === clinic.id);
    if (foundClinic) {
      navigation.navigate('BookAppointment', { clinicId: foundClinic.id });
    }
  }, [clinics, navigation]);

  const handleOpenMaps = useCallback((clinic: Clinic) => {
    if (clinic.latitude && clinic.longitude) {
      const url = `https://maps.google.com/maps?q=${clinic.latitude},${clinic.longitude}`;
      Linking.openURL(url);
    } else {
      const url = `https://maps.google.com/maps?q=${encodeURIComponent(clinic.address)}`;
      Linking.openURL(url);
    }
  }, []);

  const handleCall = useCallback((phone: string) => {
    Linking.openURL(`tel:${phone}`);
  }, []);

  const getStatusInfo = (status: Clinic['status']) => {
    switch (status) {
      case 'open':
        return { color: '#4CAF50', text: 'Open', icon: 'checkmark-circle' };
      case 'closing_soon':
        return { color: '#FF9800', text: 'Closing Soon', icon: 'time' };
      default:
        return { color: '#9E9E9E', text: 'Closed', icon: 'close-circle' };
    }
  };

  const renderRating = (rating: number) => {
    return (
      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={14} color="#FFB800" />
        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
      </View>
    );
  };

  const renderServiceTags = (services: string[]) => {
    const displayServices = services.slice(0, 3);
    return (
      <View style={styles.servicesList}>
        {displayServices.map((service, index) => (
          <View key={index} style={styles.serviceTag}>
            <Text style={styles.serviceTagText}>{service}</Text>
          </View>
        ))}
        {services.length > 3 && (
          <View style={styles.serviceTag}>
            <Text style={styles.serviceTagText}>+{services.length - 3}</Text>
          </View>
        )}
      </View>
    );
  };

  const ClinicCard = ({ item }: { item: Clinic }) => {
    const statusInfo = getStatusInfo(item.status);
    const isExpanded = expandedClinic === item.id;

    return (
      <TouchableOpacity
        style={[styles.clinicCard, isDesktop && styles.clinicCardDesktop]}
        onPress={() => handleClinicPress(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.clinicHeader}>
          <View style={styles.clinicInfo}>
            <View style={styles.clinicNameRow}>
              <Text style={[styles.clinicName, isDesktop && styles.clinicNameDesktop]}>
                {item.name}
              </Text>
              {renderRating(item.rating)}
            </View>
            <View style={styles.clinicMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={14} color="#666" />
                <Text style={styles.metaText}>{item.distance}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color="#666" />
                <Text style={styles.metaText}>{item.hours}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}15` }]}>
                <Ionicons name={statusInfo.icon as any} size={12} color={statusInfo.color} />
                <Text style={[styles.statusText, { color: statusInfo.color }]}>
                  {statusInfo.text}
                </Text>
              </View>
            </View>
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color="#666"
          />
        </View>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <TouchableOpacity style={styles.infoRow} onPress={() => handleCall(item.phone)}>
              <Ionicons name="call-outline" size={18} color="#666" />
              <Text style={styles.infoText}>{item.phone}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.infoRow} onPress={() => handleOpenMaps(item)}>
              <Ionicons name="location-outline" size={18} color="#666" />
              <Text style={[styles.infoText, styles.linkText]}>{item.address}</Text>
            </TouchableOpacity>
            {item.waitTime && (
              <View style={styles.infoRow}>
                <Ionicons name="hourglass-outline" size={18} color="#666" />
                <Text style={styles.infoText}>Est. wait time: {item.waitTime}</Text>
              </View>
            )}
            {item.acceptingWalkins && (
              <View style={[styles.infoRow, styles.walkinBadge]}>
                <Ionicons name="walk-outline" size={16} color="#4CAF50" />
                <Text style={styles.walkinText}>Accepting Walk-ins</Text>
              </View>
            )}

            <Text style={styles.servicesLabel}>Services offered:</Text>
            {renderServiceTags(item.services)}

            <TouchableOpacity
              style={styles.bookButton}
              onPress={() => handleBookAppointment(item)}
            >
              <Text style={styles.bookButtonText}>Book Appointment</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.95],
    extrapolate: 'clamp',
  });

  if (isLoading || isLocating) {
    return (
      <LinearGradient
        colors={['#B08968', '#FFFFFF', '#FFFFFF']}
        locations={[0, 0.25, 0.5]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradientContainer}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6B7C5C" />
            <Text style={styles.loadingText}>
              {isLocating ? 'Getting your location...' : 'Loading clinics...'}
            </Text>
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

        <Animated.View style={{ opacity: headerOpacity }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, isDesktop && styles.headerTitleDesktop]}>
              Nearby Clinics
            </Text>
            <TouchableOpacity
              style={styles.sortButton}
              onPress={() => setShowSortMenu(!showSortMenu)}
            >
              <Ionicons name="funnel-outline" size={22} color="#333" />
            </TouchableOpacity>
          </View>

          {showSortMenu && (
            <View style={styles.sortMenu}>
              {sortOptions.map(option => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.sortOption,
                    selectedSort === option.id && styles.sortOptionActive,
                  ]}
                  onPress={() => {
                    setSelectedSort(option.id);
                    setShowSortMenu(false);
                  }}
                >
                  <Text style={[
                    styles.sortOptionText,
                    selectedSort === option.id && styles.sortOptionTextActive,
                  ]}>
                    Sort by {option.label}
                  </Text>
                  {selectedSort === option.id && (
                    <Ionicons name="checkmark" size={18} color="#4A90D9" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.locationContainer}>
            <Ionicons name="location" size={20} color="#4A90D9" />
            <Text style={styles.locationText}>{searchArea}</Text>
            {locationError && (
              <Ionicons name="warning-outline" size={16} color="#FF9800" />
            )}
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search clinics by name or area..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
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
                onPress={() => setSelectedFilter(filter.id)}
              >
                <Ionicons
                  name={filter.icon as any}
                  size={16}
                  color={selectedFilter === filter.id ? '#FFF' : '#666'}
                  style={styles.filterIcon}
                />
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
        </Animated.View>

        <View style={styles.resultsHeader}>
          <Text style={[styles.resultsTitle, isDesktop && styles.resultsTitleDesktop]}>
            {filteredAndSortedClinics.length} Clinic{filteredAndSortedClinics.length !== 1 ? 's' : ''} Found
          </Text>
          <Text style={styles.resultsSubtitle}>
            {searchQuery ? `Searching for "${searchQuery}"` : 'Showing nearest clinics'}
          </Text>
        </View>

        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' },
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6B7C5C']} />
          }
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          {filteredAndSortedClinics.length > 0 ? (
            filteredAndSortedClinics.map((clinic) => (
              <ClinicCard key={clinic.id} item={clinic} />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="business-outline" size={64} color="#CCC" />
              <Text style={styles.emptyTitle}>No clinics found</Text>
              <Text style={styles.emptyText}>
                Try adjusting your search or filter criteria
              </Text>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedFilter('all');
                }}
              >
                <Text style={styles.clearButtonText}>Clear Filters</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={{ height: isDesktop ? 32 : 20 }} />
        </Animated.ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  safeArea: {
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
    color: '#333',
  },
  headerTitleDesktop: {
    fontSize: 24,
  },
  sortButton: {
    padding: 8,
  },
  sortMenu: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 100,
    minWidth: 160,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  sortOptionActive: {
    backgroundColor: '#EBF3FE',
  },
  sortOptionText: {
    fontSize: 14,
    color: '#333',
  },
  sortOptionTextActive: {
    color: '#4A90D9',
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'transparent',
    gap: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
  },
  filtersContainer: {
    marginBottom: 8,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: '#4A90D9',
    borderColor: '#4A90D9',
  },
  filterIcon: {
    marginRight: 2,
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
  },
  filterChipTextActive: {
    color: '#FFF',
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  resultsTitleDesktop: {
    fontSize: 18,
  },
  resultsSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  clinicCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  clinicCardDesktop: {
    marginBottom: 16,
    padding: 20,
  },
  clinicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  clinicInfo: {
    flex: 1,
  },
  clinicNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  clinicName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  clinicNameDesktop: {
    fontSize: 18,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFB800',
  },
  clinicMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 13,
    color: '#555',
    flex: 1,
  },
  linkText: {
    color: '#4A90D9',
    textDecorationLine: 'underline',
  },
  walkinBadge: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  walkinText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  servicesLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    marginBottom: 8,
  },
  servicesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  serviceTag: {
    backgroundColor: '#EBF3FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  serviceTagText: {
    fontSize: 12,
    color: '#4A90D9',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90D9',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
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
  clearButton: {
    backgroundColor: '#6B7C5C',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
});