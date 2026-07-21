import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ============================================================
// BASE TYPES
// ============================================================

export interface User {
  id: string;
  auth_id: string | null;
  email: string;
  role: 'patient' | 'doctor' | 'nurse' | 'admin' | 'first_responder';
  status: 'active' | 'inactive' | 'suspended';
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  contact_number: string | null;
  id_number: string | null;
  gender: 'Male' | 'Female' | 'Other' | null;
  ethnicity: 'African' | 'Coloured' | 'Indian/Asian' | 'White' | 'Other' | null;
  date_of_birth: string | null;
  address: Address | null;
  next_of_kin_name: string | null;
  next_of_kin_relation: string | null;
  next_of_kin_contact: string | null;
  notification_preference: NotificationPreference;
  medical_aid_number: string | null;
  medical_aid_plan: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Clinic {
  id: string;
  clinic_name: string;
  location: string;
  address: string | null;
  phone: string | null;
  facility_type: 'Clinic' | 'CDC' | 'Satellite' | 'Mobile' | null;
  latitude: number | null;
  longitude: number | null;
  operating_hours: string | null;
  contact_details: string | null;
  website: string | null;
  email: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Staff {
  id: string;
  user_id: string | null;
  staff_reg_number: string;
  first_name: string;
  last_name: string;
  email: string;
  contact_number: string | null;
  role: 'Doctor' | 'Nurse' | 'Admin' | 'FirstResponder';
  clinic_id: string | null;
  specialization: string | null;
  license_number: string | null;
  department: string | null;
  response_unit: string | null;
  ambulance_number: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  clinic_id: string;
  service_name: string;
  description: string | null;
  estimated_duration: string | null;
  price: number | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface TimeSlot {
  id: string;
  clinic_id: string;
  service_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  max_patients: number;
  booked_count: number;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  clinic_id: string;
  time_slot_id: string | null;
  service_id: string | null;
  reason_for_visit: string | null;
  status: 'booked' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MedicalRecord {
  id: string;
  patient_id: string;
  appointment_id: string | null;
  visit_date: string;
  diagnosis_notes: string | null;
  allergies: string[];
  chronic_medication: string[];
  vitals: Vitals | null;
  treatment_plan: string | null;
  follow_up_date: string | null;
  doctor_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'appointment_reminder' | 'alert' | 'general' | 'emergency' | 'system';
  is_read: boolean;
  read_at: string | null;
  data: Record<string, any> | null;
  sent_at: string;
  created_at: string;
}

export interface EmergencyAlert {
  id: string;
  patient_id: string;
  responder_id: string | null;
  location: GeoLocation;
  timestamp: string;
  emergency_status: 'pending' | 'dispatched' | 'resolved' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string | null;
  notes: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface HealthTip {
  id: string;
  title: string;
  content: string;
  category: 'general' | 'nutrition' | 'exercise' | 'mental_health' | 'prevention' | 'chronic' | null;
  image_url: string | null;
  source: string | null;
  is_featured: boolean;
  views: number;
  likes: number;
  status: 'draft' | 'published' | 'archived';
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  changes: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// ============================================================
// NESTED TYPES
// ============================================================

export interface Address {
  streetNumber?: string;
  streetName?: string;
  city?: string;
  postalCode?: string;
  province?: string;
}

export interface NotificationPreference {
  sms: boolean;
  email: boolean;
  inApp: boolean;
}

export interface Vitals {
  blood_pressure?: string;
  heart_rate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

// ============================================================
// ENUMS
// ============================================================

export type UserRole = 'patient' | 'doctor' | 'nurse' | 'admin' | 'first_responder';
export type UserStatus = 'active' | 'inactive' | 'suspended';
export type Gender = 'Male' | 'Female' | 'Other';
export type Ethnicity = 'African' | 'Coloured' | 'Indian/Asian' | 'White' | 'Other';
export type FacilityType = 'Clinic' | 'CDC' | 'Satellite' | 'Mobile';
export type StaffRole = 'Doctor' | 'Nurse' | 'Admin' | 'FirstResponder';
export type AppointmentStatus = 'booked' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
export type EmergencyStatus = 'pending' | 'dispatched' | 'resolved' | 'cancelled';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type NotificationType = 'appointment_reminder' | 'alert' | 'general' | 'emergency' | 'system';
export type HealthTipCategory = 'general' | 'nutrition' | 'exercise' | 'mental_health' | 'prevention' | 'chronic';
export type HealthTipStatus = 'draft' | 'published' | 'archived';

// ============================================================
// TABLE TYPE REGISTRY
// ============================================================

export interface Tables {
  users: User;
  patients: Patient;
  clinics: Clinic;
  staff: Staff;
  services: Service;
  time_slots: TimeSlot;
  appointments: Appointment;
  medical_records: MedicalRecord;
  notifications: Notification;
  emergency_alerts: EmergencyAlert;
  health_tips: HealthTip;
  audit_log: AuditLog;
}

export type TableName = keyof Tables;
export type TableRow<T extends TableName> = Tables[T];
export type TableInsert<T extends TableName> = Omit<Tables[T], 'id' | 'created_at' | 'updated_at'>;
export type TableUpdate<T extends TableName> = Partial<TableInsert<T>>;

// ============================================================
// RELATIONSHIP TYPES (for joined queries)
// ============================================================

export interface ClinicWithServices extends Clinic {
  services: Service[];
}

export interface ClinicWithDetails extends Clinic {
  services: Service[];
  staff: Staff[];
  time_slots: TimeSlot[];
}

export interface PatientWithUser extends Patient {
  user: User;
}

export interface AppointmentWithDetails extends Appointment {
  patient: Patient;
  clinic: Clinic;
  time_slot: TimeSlot;
  service: Service;
}

export interface MedicalRecordWithPatient extends MedicalRecord {
  patient: Patient;
  appointment: Appointment;
}

export interface StaffWithClinic extends Staff {
  clinic: Clinic;
}

// ============================================================
// FILTER AND SEARCH TYPES
// ============================================================

export interface ClinicSearchFilters {
  query?: string;
  facility_type?: FacilityType | 'all';
  latitude?: number;
  longitude?: number;
  max_distance?: number; // in km
  status?: 'active' | 'inactive' | 'all';
}

export interface AppointmentFilters {
  patient_id?: string;
  clinic_id?: string;
  status?: AppointmentStatus | 'all';
  date_from?: string;
  date_to?: string;
}

export interface PatientSearchFilters {
  query?: string;
  status?: 'active' | 'inactive' | 'all';
}

// ============================================================
// EXPORT DEFAULT
// ============================================================

export default supabase;