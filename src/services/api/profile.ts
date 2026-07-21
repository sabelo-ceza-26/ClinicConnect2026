// src/services/api/profile.ts
import { supabase } from '../supabase/client';

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

export interface PatientProfile {
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

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  contact_number?: string;
  id_number?: string;
  gender?: 'Male' | 'Female' | 'Other';
  ethnicity?: 'African' | 'Coloured' | 'Indian/Asian' | 'White' | 'Other';
  address?: Address;
  next_of_kin_name?: string;
  next_of_kin_relation?: string;
  next_of_kin_contact?: string;
  notification_preference?: NotificationPreference;
}

export interface CreateProfileData {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  contact_number?: string;
  id_number?: string;
  gender?: 'Male' | 'Female' | 'Other' | null;
  ethnicity?: 'African' | 'Coloured' | 'Indian/Asian' | 'White' | 'Other' | null;
  date_of_birth?: string | null;
  address?: Address;
  next_of_kin_name?: string;
  next_of_kin_relation?: string;
  next_of_kin_contact?: string;
  notification_preference?: NotificationPreference;
  medical_aid_number?: string | null;
  medical_aid_plan?: string | null;
  status?: 'active' | 'inactive';
}

export const profileApi = {
  // Get current user's profile
  getProfile: async (): Promise<PatientProfile | null> => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Error getting user:', userError);
        throw userError;
      }

      if (!userData.user) {
        console.log('No user authenticated');
        return null;
      }

      console.log('Fetching profile for user:', userData.user.id);

      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', userData.user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }

      if (data) {
        console.log('Profile found:', data);
        return data as PatientProfile;
      } else {
        console.log('No profile found for user:', userData.user.id);
        return null;
      }
    } catch (error) {
      console.error('Error in getProfile:', error);
      return null;
    }
  },

  // Get profile by user ID
  getProfileByUserId: async (userId: string): Promise<PatientProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile by user ID:', error);
        throw error;
      }

      return data as PatientProfile || null;
    } catch (error) {
      console.error('Error in getProfileByUserId:', error);
      return null;
    }
  },

  // Get profile by ID
  getProfileById: async (profileId: string): Promise<PatientProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', profileId)
        .single();

      if (error) {
        console.error('Error fetching profile by ID:', error);
        throw error;
      }

      return data as PatientProfile;
    } catch (error) {
      console.error('Error in getProfileById:', error);
      return null;
    }
  },

  // Create a new profile
  createProfile: async (data: CreateProfileData): Promise<PatientProfile> => {
    try {
      const { data: profile, error } = await supabase
        .from('patients')
        .insert({
          user_id: data.user_id,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          contact_number: data.contact_number || null,
          id_number: data.id_number || null,
          gender: data.gender || null,
          ethnicity: data.ethnicity || null,
          date_of_birth: data.date_of_birth || null,
          address: data.address || null,
          next_of_kin_name: data.next_of_kin_name || null,
          next_of_kin_relation: data.next_of_kin_relation || null,
          next_of_kin_contact: data.next_of_kin_contact || null,
          notification_preference: data.notification_preference || { sms: false, email: false, inApp: false },
          medical_aid_number: data.medical_aid_number || null,
          medical_aid_plan: data.medical_aid_plan || null,
          status: data.status || 'active',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        throw error;
      }

      console.log('Profile created:', profile);
      return profile as PatientProfile;
    } catch (error) {
      console.error('Error in createProfile:', error);
      throw error;
    }
  },

  // Update profile
  updateProfile: async (data: UpdateProfileData): Promise<PatientProfile> => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Error getting user:', userError);
        throw userError;
      }

      if (!userData.user) {
        throw new Error('No user authenticated');
      }

      const { data: profile, error } = await supabase
        .from('patients')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userData.user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      console.log('Profile updated:', profile);
      return profile as PatientProfile;
    } catch (error) {
      console.error('Error in updateProfile:', error);
      throw error;
    }
  },

  // Update notification preferences
  updateNotificationPreferences: async (preferences: NotificationPreference): Promise<PatientProfile> => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Error getting user:', userError);
        throw userError;
      }

      if (!userData.user) {
        throw new Error('No user authenticated');
      }

      const { data: profile, error } = await supabase
        .from('patients')
        .update({
          notification_preference: preferences,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userData.user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating notification preferences:', error);
        throw error;
      }

      return profile as PatientProfile;
    } catch (error) {
      console.error('Error in updateNotificationPreferences:', error);
      throw error;
    }
  },

  // Check if profile exists
  profileExists: async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error checking profile existence:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error in profileExists:', error);
      return false;
    }
  },

  // Get profile stats
  getProfileStats: async (): Promise<{
    appointments_count: number;
    unread_notifications: number;
    pending_emergencies: number;
  }> => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Error getting user:', userError);
        throw userError;
      }

      if (!userData.user) {
        throw new Error('No user authenticated');
      }

      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', userData.user.id)
        .single();

      if (patientError) {
        console.error('Error getting patient ID:', patientError);
        return { appointments_count: 0, unread_notifications: 0, pending_emergencies: 0 };
      }

      const { count: appointmentsCount, error: appError } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('patient_id', patient.id)
        .in('status', ['booked', 'confirmed']);

      const { count: unreadCount, error: notifError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userData.user.id)
        .eq('is_read', false);

      const { count: emergencyCount, error: emergError } = await supabase
        .from('emergency_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('patient_id', patient.id)
        .eq('emergency_status', 'pending');

      return {
        appointments_count: appointmentsCount || 0,
        unread_notifications: unreadCount || 0,
        pending_emergencies: emergencyCount || 0,
      };
    } catch (error) {
      console.error('Error in getProfileStats:', error);
      return { appointments_count: 0, unread_notifications: 0, pending_emergencies: 0 };
    }
  },
};

export default profileApi;