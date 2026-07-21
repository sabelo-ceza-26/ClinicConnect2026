// src/services/api/patient.ts
import { supabase } from '../supabase/client';

export interface PatientProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  contactNumber: string;
  idNumber: string;
  gender: string;
  ethnicity: string;
  address: {
    streetNumber: string;
    streetName: string;
    city: string;
    postalCode: string;
    province: string;
  };
  nextOfKinName: string;
  nextOfKinRelation: string;
  nextOfKinContact: string;
  notificationPreference: {
    sms: boolean;
    email: boolean;
    inApp: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  contactNumber?: string;
  idNumber?: string;
  gender?: string;
  ethnicity?: string;
  address?: {
    streetNumber: string;
    streetName: string;
    city: string;
    postalCode: string;
    province: string;
  };
  nextOfKinName?: string;
  nextOfKinRelation?: string;
  nextOfKinContact?: string;
}

export const patientApi = {
  // Get patient profile
  getProfile: async () => {
    // Get current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('userId', userData.user.id)
      .single();

    if (error) throw error;
    return data as PatientProfile;
  },

  // Get patient profile by ID
  getProfileById: async (patientId: string) => {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single();

    if (error) throw error;
    return data as PatientProfile;
  },

  // Update patient profile
  updateProfile: async (data: UpdateProfileData) => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    const { data: patient, error } = await supabase
      .from('patients')
      .update({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .eq('userId', userData.user.id)
      .select()
      .single();

    if (error) throw error;
    return patient as PatientProfile;
  },

  // Update notification preferences
  updateNotificationPreferences: async (preferences: { sms: boolean; email: boolean; inApp: boolean }) => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('patients')
      .update({
        notificationPreference: preferences,
        updatedAt: new Date().toISOString(),
      })
      .eq('userId', userData.user.id)
      .select()
      .single();

    if (error) throw error;
    return data as PatientProfile;
  },

  // Create a new patient profile (for registration)
  createProfile: async (data: Omit<PatientProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data: profile, error } = await supabase
      .from('patients')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return profile as PatientProfile;
  },

  // Get patient by user ID
  getPatientByUserId: async (userId: string) => {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('userId', userId)
      .single();

    if (error) throw error;
    return data as PatientProfile;
  },
};

export default patientApi;