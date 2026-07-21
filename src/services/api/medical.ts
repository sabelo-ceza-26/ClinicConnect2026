import { supabase } from '../supabase/client';

export interface MedicalRecord {
  id: string;
  patientId: string;
  allergies: string[];
  chronicMedication: string[];
  visitDate: string;
  diagnosisNotes: string;
  appointmentId: string;
  clinicName?: string;
  doctorName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMedicalRecordData {
  patientId: string;
  allergies?: string[];
  chronicMedication?: string[];
  visitDate: string;
  diagnosisNotes: string;
  appointmentId: string;
}

export const medicalApi = {
  
  getPatientRecords: async (patientId: string) => {
    const { data, error } = await supabase
      .from('medical_records')
      .select(`
        *,
        appointments:appointmentId (
          id,
          clinicId,
          clinics:clinicId (clinicName)
        )
      `)
      .eq('patientId', patientId)
      .order('visitDate', { ascending: false });

    if (error) throw error;

    
    return data?.map(record => ({
      ...record,
      clinicName: record.appointments?.clinics?.clinicName || 'Unknown Clinic',
    })) || [];
  },

  
  getRecordById: async (id: string) => {
    const { data, error } = await supabase
      .from('medical_records')
      .select(`
        *,
        appointments:appointmentId (
          id,
          clinicId,
          clinics:clinicId (clinicName)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return {
      ...data,
      clinicName: data?.appointments?.clinics?.clinicName || 'Unknown Clinic',
    };
  },

 
  createMedicalRecord: async (data: CreateMedicalRecordData) => {
    const { data: record, error } = await supabase
      .from('medical_records')
      .insert({
        patientId: data.patientId,
        allergies: data.allergies || [],
        chronicMedication: data.chronicMedication || [],
        visitDate: data.visitDate,
        diagnosisNotes: data.diagnosisNotes,
        appointmentId: data.appointmentId,
      })
      .select()
      .single();

    if (error) throw error;
    return record;
  },

  
  updateMedicalRecord: async (id: string, data: Partial<MedicalRecord>) => {
    const { data: record, error } = await supabase
      .from('medical_records')
      .update({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return record;
  },

  
  addAllergy: async (patientId: string, allergy: string) => {
    
    const { data: current, error: fetchError } = await supabase
      .from('medical_records')
      .select('id,allergies')
      .eq('patientId', patientId)
      .order('visitDate', { ascending: false })
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    const currentAllergies = current?.allergies || [];
    if (currentAllergies.includes(allergy)) {
      throw new Error('Allergy already exists');
    }

    const updatedAllergies = [...currentAllergies, allergy];

    
    if (current) {
      const { data, error } = await supabase
        .from('medical_records')
        .update({ allergies: updatedAllergies })
        .eq('patientId', patientId)
        .eq('id', current.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      
      const { data, error } = await supabase
        .from('medical_records')
        .insert({
          patientId,
          allergies: updatedAllergies,
          chronicMedication: [],
          visitDate: new Date().toISOString(),
          diagnosisNotes: 'Allergy added',
          appointmentId: '',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },

  
  removeAllergy: async (patientId: string, allergy: string) => {
    const { data: current, error: fetchError } = await supabase
      .from('medical_records')
      .select('id, allergies')
      .eq('patientId', patientId)
      .order('visitDate', { ascending: false })
      .limit(1)
      .single();

    if (fetchError) throw fetchError;

    const updatedAllergies = (current?.allergies || []).filter((a: string) => a !== allergy);

    const { data, error } = await supabase
      .from('medical_records')
      .update({ allergies: updatedAllergies })
      .eq('patientId', patientId)
      .eq('id', current.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  
  addMedication: async (patientId: string, medication: string) => {
    const { data: current, error: fetchError } = await supabase
      .from('medical_records')
      .select('id, chronicMedication')
      .eq('patientId', patientId)
      .order('visitDate', { ascending: false })
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    const currentMedications = current?.chronicMedication || [];
    if (currentMedications.includes(medication)) {
      throw new Error('Medication already exists');
    }

    const updatedMedications = [...currentMedications, medication];

    if (current) {
      const { data, error } = await supabase
        .from('medical_records')
        .update({ chronicMedication: updatedMedications })
        .eq('patientId', patientId)
        .eq('id', current.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('medical_records')
        .insert({
          patientId,
          allergies: [],
          chronicMedication: updatedMedications,
          visitDate: new Date().toISOString(),
          diagnosisNotes: 'Medication added',
          appointmentId: '',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },

  
  removeMedication: async (patientId: string, medication: string) => {
    const { data: current, error: fetchError } = await supabase
      .from('medical_records')
      .select('id, chronicMedication')
      .eq('patientId', patientId)
      .order('visitDate', { ascending: false })
      .limit(1)
      .single();

    if (fetchError) throw fetchError;

    const updatedMedications = (current?.chronicMedication || []).filter((m: string) => m !== medication);

    const { data, error } = await supabase
      .from('medical_records')
      .update({ chronicMedication: updatedMedications })
      .eq('patientId', patientId)
      .eq('id', current.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  
  getRecentRecords: async (patientId: string, limit: number = 5) => {
    const { data, error } = await supabase
      .from('medical_records')
      .select(`
        *,
        appointments:appointmentId (
          id,
          clinicId,
          clinics:clinicId (clinicName)
        )
      `)
      .eq('patientId', patientId)
      .order('visitDate', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data?.map(record => ({
      ...record,
      clinicName: record.appointments?.clinics?.clinicName || 'Unknown Clinic',
    })) || [];
  },
};

export default medicalApi;