// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabase/client';
import { PatientProfile } from '../services/api/profile';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: PatientProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, patientData: any) => Promise<PatientProfile>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: any) => Promise<PatientProfile>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  // Fetch profile using the profile API
  const fetchProfile = async (userId: string) => {
    if (isFetching) {
      console.log('⏳ Already fetching profile, skipping...');
      return profile;
    }
    
    try {
      setIsFetching(true);
      console.log('🔍 Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching profile:', error);
        setProfile(null);
        return null;
      }
      
      if (data) {
        console.log('✅ Profile found:', data);
        setProfile(data as PatientProfile);
        return data as PatientProfile;
      } else {
        console.log('⚠️ No patient profile found for user:', userId);
        setProfile(null);
        return null;
      }
    } catch (error) {
      console.error('❌ Error in fetchProfile:', error);
      setProfile(null);
      return null;
    } finally {
      setIsFetching(false);
    }
  };

  // Refresh profile for current user
  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  // Update profile
  const updateProfile = async (data: any) => {
    try {
      if (!user?.id) throw new Error('No user authenticated');
      
      const { data: updated, error } = await supabase
        .from('patients')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating profile:', error);
        throw error;
      }

      console.log('✅ Profile updated:', updated);
      setProfile(updated as PatientProfile);
      return updated as PatientProfile;
    } catch (error) {
      console.error('❌ Error in updateProfile:', error);
      throw error;
    }
  };

  // Check session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔐 Initializing auth...');
        
        const { data: { session } } = await supabase.auth.getSession();
        console.log('📱 Session:', session ? 'Found' : 'None');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 User found, fetching profile...');
          await fetchProfile(session.user.id);
        } else {
          console.log('👤 No user session');
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          console.log('👤 User logged in, fetching profile...');
          await fetchProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          console.log('👤 User logged out');
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    console.log('🔑 Logging in...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    if (data.user) {
      console.log('✅ Login successful, fetching profile...');
      await fetchProfile(data.user.id);
    }
  };

  const register = async (email: string, password: string, patientData: any) => {
    console.log('📝 Registering user...');
    
    try {
      // 1. Sign up the user in auth.users
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        console.error('❌ Auth error:', authError);
        throw authError;
      }
      
      if (!authData.user) {
        console.error('❌ No user returned from signup');
        throw new Error('User creation failed');
      }

      console.log('✅ User created in auth.users:', authData.user.id);

      // 2. Create the patient profile
      const profileData = {
        user_id: authData.user.id,
        first_name: patientData.firstName || '',
        last_name: patientData.lastName || '',
        email: email,
        contact_number: patientData.contactNumber || '',
        id_number: patientData.idNumber || '',
        gender: patientData.gender || null,
        ethnicity: patientData.ethnicity || null,
        date_of_birth: patientData.dateOfBirth || null,
        address: {
          streetNumber: patientData.streetNumber || '',
          streetName: patientData.streetName || '',
          city: patientData.city || '',
          postalCode: patientData.postalCode || '',
          province: patientData.province || '',
        },
        next_of_kin_name: patientData.nextOfKinName || '',
        next_of_kin_relation: patientData.nextOfKinRelationship || '',
        next_of_kin_contact: patientData.nextOfKinContactNumber || '',
        notification_preference: {
          sms: patientData.sms || false,
          email: patientData.notifyEmail || false,
          inApp: patientData.inApp || false,
        },
        medical_aid_number: patientData.medicalAidNumber || null,
        medical_aid_plan: patientData.medicalAidPlan || null,
        status: 'active',
      };

      console.log('📦 Creating patient profile:', profileData);

      // 3. Insert the profile directly using supabase
      const { data: newProfile, error: profileError } = await supabase
        .from('patients')
        .insert(profileData)
        .select()
        .single();

      if (profileError) {
        console.error('❌ Error creating patient profile:', profileError);
        throw new Error('Failed to create patient profile: ' + profileError.message);
      }

      console.log('✅ Patient profile created successfully:', newProfile);
      
      // 4. Set the profile in state
      setProfile(newProfile as PatientProfile);
      
      return newProfile as PatientProfile;
      
    } catch (error) {
      console.error('❌ Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    console.log('🚪 Logging out...');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
    setUser(null);
    setSession(null);
  };

  const value = {
    user,
    session,
    profile,
    isLoading,
    login,
    register,
    logout,
    refreshProfile,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}