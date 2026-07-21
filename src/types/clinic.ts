// src/types/clinic.ts
export interface Clinic {
  id: string;
  clinicName: string;
  location: string; // Maps to address field
  operatingHours: string;
  contactDetails: string; // Maps to phone field
  status: 'active' | 'inactive';
  serviceCount?: number;
  staffCount?: number;
  createdAt?: string;
  updatedAt?: string;
  
  // Additional fields for real clinic data
  address?: string; // Full address
  phone?: string; // Phone number
  facilityType?: 'Clinic' | 'CDC' | 'Satellite' | 'Mobile';
  latitude?: number | null;
  longitude?: number | null;
  distanceKm?: number;
  distance?: string;
}

export interface ClinicDetails extends Clinic {
  services: ClinicService[];
  staff: ClinicStaff[];
  timeSlots: ClinicTimeSlot[];
}

export interface ClinicService {
  id: string;
  serviceName: string;
  description: string;
  estimatedDuration: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface ClinicStaff {
  id: string;
  staffRegNumber: string;
  firstName: string;
  lastName: string;
  role: string;
  contactNumber: string;
  email: string;
  status: 'active' | 'inactive';
}

export interface ClinicTimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  serviceId: string;
}

export interface CreateClinicData {
  clinicName: string;
  location: string;
  address?: string;
  phone?: string;
  facilityType?: 'Clinic' | 'CDC' | 'Satellite' | 'Mobile';
  latitude?: number | null;
  longitude?: number | null;
  operatingHours: string;
  contactDetails: string;
}

export interface UpdateClinicData extends Partial<CreateClinicData> {
  status?: 'active' | 'inactive';
}

// Geographic types for location-based features
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface ClinicWithDistance extends Clinic {
  distanceKm: number;
  distance: string;
}

export interface ClinicSearchFilters {
  query?: string;
  facilityType?: 'Clinic' | 'CDC' | 'Satellite' | 'Mobile' | 'all';
  maxDistance?: number; // in km
  latitude?: number;
  longitude?: number;
}

export type FacilityType = 'Clinic' | 'CDC' | 'Satellite' | 'Mobile';