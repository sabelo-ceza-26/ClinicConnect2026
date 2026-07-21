import { supabase } from '../supabase/client';
import { 
  Clinic, 
  ClinicDetails, 
  CreateClinicData, 
  UpdateClinicData,
  ClinicWithDistance,
  ClinicSearchFilters,
  Coordinates,
  FacilityType
} from '../../types/clinic';


const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};


const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
};

export const clinicApi = {
  
  getAll: async () => {
    const { data, error } = await supabase
      .from('clinics')
      .select(`
        *,
        services:services(count),
        staff:staff(count)
      `)
      .eq('status', 'active')
      .order('clinicName');

    if (error) throw error;
    
    return data?.map(clinic => ({
      ...clinic,
      location: clinic.address || clinic.location || '',
      contactDetails: clinic.phone || clinic.contactDetails || '',
      serviceCount: clinic.services?.[0]?.count || 0,
      staffCount: clinic.staff?.[0]?.count || 0,
    })) || [];
  },

  
  getAllWithServices: async () => {
    const { data, error } = await supabase
      .from('clinics')
      .select(`
        *,
        services:services (
          id,
          serviceName,
          description,
          estimatedDuration
        )
      `)
      .eq('status', 'active')
      .order('clinicName');

    if (error) throw error;
    
    return data?.map(clinic => ({
      ...clinic,
      location: clinic.address || clinic.location || '',
      contactDetails: clinic.phone || clinic.contactDetails || '',
    })) || [];
  },

  
  getByFacilityType: async (facilityType: FacilityType) => {
    const { data, error } = await supabase
      .from('clinics')
      .select(`
        *,
        services:services (
          id,
          serviceName,
          description,
          estimatedDuration
        )
      `)
      .eq('status', 'active')
      .eq('facilityType', facilityType)
      .order('clinicName');

    if (error) throw error;
    return data || [];
  },

  
  getClinicsWithinRadius: async (
    coordinates: Coordinates, 
    radiusKm: number = 10
  ): Promise<(Clinic & { distanceKm: number; distance: string })[]> => {
    const { latitude, longitude } = coordinates;
    
    
    const { data, error } = await supabase
      .from('clinics')
      .select(`
        *,
        services:services (
          id,
          serviceName,
          description,
          estimatedDuration
        )
      `)
      .eq('status', 'active')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (error) throw error;

    
    const clinicsWithDistance = data?.map(clinic => {
      const distanceKm = calculateDistance(
        latitude,
        longitude,
        clinic.latitude,
        clinic.longitude
      );
      return {
        ...clinic,
        location: clinic.address || clinic.location || '',
        contactDetails: clinic.phone || clinic.contactDetails || '',
        distanceKm,
        distance: formatDistance(distanceKm),
      };
    });

    return clinicsWithDistance?.filter(clinic => clinic.distanceKm <= radiusKm) || [];
  },

  
  searchClinics: async (filters: ClinicSearchFilters) => {
    let query = supabase
      .from('clinics')
      .select(`
        *,
        services:services (
          id,
          serviceName,
          description,
          estimatedDuration
        )
      `)
      .eq('status', 'active')
      .order('clinicName');

    if (filters.query) {
      const searchTerm = `%${filters.query}%`;
      query = query.or(`clinicName.ilike.${searchTerm},address.ilike.${searchTerm},location.ilike.${searchTerm}`);
    }

    if (filters.facilityType && filters.facilityType !== 'all') {
      query = query.eq('facilityType', filters.facilityType);
    }

    const { data, error } = await query;
    if (error) throw error;

    let results = data || [];

   
    if (filters.latitude && filters.longitude) {
      results = results.map(clinic => {
        let distanceKm = Infinity;
        if (clinic.latitude && clinic.longitude) {
          distanceKm = calculateDistance(
            filters.latitude!,
            filters.longitude!,
            clinic.latitude,
            clinic.longitude
          );
        }
        return {
          ...clinic,
          location: clinic.address || clinic.location || '',
          contactDetails: clinic.phone || clinic.contactDetails || '',
          distanceKm,
          distance: distanceKm < Infinity ? formatDistance(distanceKm) : 'N/A',
        };
      });

      
      if (filters.maxDistance) {
        results = results.filter(clinic => clinic.distanceKm <= filters.maxDistance!);
      }

      
      results.sort((a, b) => (a.distanceKm || Infinity) - (b.distanceKm || Infinity));
    }

    return results;
  },

  
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('clinics')
      .select(`
        *,
        services:services (
          id,
          serviceName,
          description,
          estimatedDuration
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    
    return {
      ...data,
      location: data.address || data.location || '',
      contactDetails: data.phone || data.contactDetails || '',
    };
  },

  
  getDetails: async (id: string): Promise<ClinicDetails> => {
    const clinic = await clinicApi.getById(id);
    
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('*')
      .eq('clinicId', id)
      .eq('status', 'active')
      .order('firstName', { ascending: true });

    if (staffError) throw staffError;

    const { data: timeSlots, error: timeSlotsError } = await supabase
      .from('timeSlots')
      .select('*')
      .eq('clinicId', id)
      .order('date', { ascending: true })
      .order('startTime', { ascending: true });

    if (timeSlotsError) throw timeSlotsError;

    return {
      ...clinic,
      staff: staff || [],
      timeSlots: timeSlots || [],
    };
  },

  
  create: async (data: CreateClinicData) => {
    const { data: clinic, error } = await supabase
      .from('clinics')
      .insert({
        clinicName: data.clinicName,
        address: data.location || data.address || '',
        location: data.location || data.address || '',
        phone: data.contactDetails || data.phone || '',
        contactDetails: data.contactDetails || data.phone || '',
        facilityType: data.facilityType || 'Clinic',
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        operatingHours: data.operatingHours || '',
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;
    return clinic;
  },

  
  update: async (id: string, data: UpdateClinicData) => {
    const updateData: any = {};
    if (data.clinicName !== undefined) updateData.clinicName = data.clinicName;
    if (data.location !== undefined) {
      updateData.location = data.location;
      updateData.address = data.location;
    }
    if (data.contactDetails !== undefined) {
      updateData.contactDetails = data.contactDetails;
      updateData.phone = data.contactDetails;
    }
    if (data.operatingHours !== undefined) updateData.operatingHours = data.operatingHours;
    if (data.latitude !== undefined) updateData.latitude = data.latitude;
    if (data.longitude !== undefined) updateData.longitude = data.longitude;
    if (data.facilityType !== undefined) updateData.facilityType = data.facilityType;
    if (data.status !== undefined) updateData.status = data.status;
    updateData.updatedAt = new Date().toISOString();

    const { data: clinic, error } = await supabase
      .from('clinics')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return clinic;
  },

  
  delete: async (id: string) => {
    
    const { data: appointments, error: appointmentError } = await supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('clinicId', id)
      .neq('status', 'cancelled');

    if (appointmentError) throw appointmentError;

    if (appointments && appointments.length > 0) {
      throw new Error('Cannot delete clinic with existing appointments');
    }

    const { error } = await supabase
      .from('clinics')
      .update({ 
        status: 'inactive',
        updatedAt: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
    return { message: 'Clinic deleted successfully' };
  },

 
  getServices: async (id: string) => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('clinicId', id)
      .order('serviceName');

    if (error) throw error;
    return data || [];
  },

 
  getStaff: async (id: string) => {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('clinicId', id)
      .order('firstName', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  
  getTimeSlots: async (id: string, date?: string) => {
    let query = supabase
      .from('timeSlots')
      .select('*')
      .eq('clinicId', id)
      .order('date', { ascending: true })
      .order('startTime', { ascending: true });

    if (date) {
      query = query.eq('date', date);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  
  getFacilityTypes: async (): Promise<FacilityType[]> => {
    const { data, error } = await supabase
      .from('clinics')
      .select('facilityType')
      .eq('status', 'active')
      .not('facilityType', 'is', null);

    if (error) throw error;
    
    const types = new Set(data?.map(c => c.facilityType) || []);
    return Array.from(types) as FacilityType[];
  },

  
  getStats: async (id: string) => {
    const [appointments, staff, services] = await Promise.all([
      supabase
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .eq('clinicId', id)
        .eq('status', 'booked'),
      supabase
        .from('staff')
        .select('id', { count: 'exact', head: true })
        .eq('clinicId', id)
        .eq('status', 'active'),
      supabase
        .from('services')
        .select('id', { count: 'exact', head: true })
        .eq('clinicId', id)
        .eq('status', 'active'),
    ]);

    return {
      totalAppointments: appointments.count || 0,
      activeStaff: staff.count || 0,
      activeServices: services.count || 0,
    };
  },

  
  getNearbyClinics: async (
    coordinates: Coordinates,
    radiusKm: number = 10,
    limit: number = 20,
    offset: number = 0
  ) => {
    const allClinics = await clinicApi.getClinicsWithinRadius(coordinates, radiusKm);
    const paginated = allClinics.slice(offset, offset + limit);
    
    return {
      clinics: paginated,
      total: allClinics.length,
      hasMore: offset + limit < allClinics.length,
    };
  },
};

export default clinicApi;