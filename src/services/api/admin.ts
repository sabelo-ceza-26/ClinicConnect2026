import { supabase } from '../supabase/client';

export interface DashboardStats {
  totalStaff: number;
  totalClinics: number;
  totalServices: number;
  totalAppointments: number;
  activeEmergencies: number;
  pendingStaffRequests: number;
}

export interface DashboardActivity {
  id: string;
  type: 'staff_added' | 'clinic_updated' | 'appointment' | 'emergency';
  description: string;
  timestamp: string;
}

export const adminDashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    try {
      const [staffCount, clinicsCount, servicesCount, appointmentsCount] = await Promise.all([
        supabase.from('staff').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('clinics').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('services').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('appointments').select('*', { count: 'exact', head: true }),
      ]);

      // Check for errors
      if (staffCount.error) throw staffCount.error;
      if (clinicsCount.error) throw clinicsCount.error;
      if (servicesCount.error) throw servicesCount.error;
      if (appointmentsCount.error) throw appointmentsCount.error;

      return {
        totalStaff: staffCount.count || 0,
        totalClinics: clinicsCount.count || 0,
        totalServices: servicesCount.count || 0,
        totalAppointments: appointmentsCount.count || 0,
        activeEmergencies: 0, // Implement emergency count
        pendingStaffRequests: 0, // Implement pending requests
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return default values on error
      return {
        totalStaff: 0,
        totalClinics: 0,
        totalServices: 0,
        totalAppointments: 0,
        activeEmergencies: 0,
        pendingStaffRequests: 0,
      };
    }
  },

  getActivities: async (): Promise<DashboardActivity[]> => {
    try {
      // Get recent appointments as activities
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
          id,
          status,
          createdAt,
          patients:patientId (
            firstName,
            lastName
          )
        `)
        .order('createdAt', { ascending: false })
        .limit(5);

      if (error) throw error;

      // Handle the case where patients might be an array or null
      const activities: DashboardActivity[] = (appointments || [])
        .filter(app => app.patients) // Filter out appointments without patient data
        .map(app => {
          // patients might be an array or object depending on the query
          const patientData = Array.isArray(app.patients) ? app.patients[0] : app.patients;
          const patientName = patientData 
            ? `${patientData.firstName || ''} ${patientData.lastName || ''}`.trim() || 'Unknown Patient'
            : 'Unknown Patient';

          return {
            id: app.id,
            type: app.status === 'booked' ? 'appointment' : 'appointment',
            description: `Appointment ${app.status || 'created'} for ${patientName}`,
            timestamp: app.createdAt || new Date().toISOString(),
          };
        });

      return activities;
    } catch (error) {
      console.error('Error fetching activities:', error);
      // Return empty array on error
      return [];
    }
  },
};

export default adminDashboardApi;