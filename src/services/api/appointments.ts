import apiClient from './client';

export const appointmentsApi = {
  getAll: () => apiClient.get('/appointments'),
  getById: (id: string) => apiClient.get(`/appointments/${id}`),
  create: (data: any) => apiClient.post('/appointments', data),
  update: (id: string, data: any) => apiClient.put(`/appointments/${id}`, data),
  cancel: (id: string) => apiClient.patch(`/appointments/${id}/cancel`),
  complete: (id: string) => apiClient.patch(`/appointments/${id}/complete`),
  getPatientAppointments: (patientId: string) =>
    apiClient.get(`/appointments/patient/${patientId}`),
  getClinicAppointments: (clinicId: string) =>
    apiClient.get(`/appointments/clinic/${clinicId}`),
};