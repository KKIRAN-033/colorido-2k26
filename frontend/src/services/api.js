import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'https://colorido-2k26-43sz.onrender.com/api');

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Add auth token to admin requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('colorido_admin_token');
  if (token && config.url?.includes('/admin')) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Public API ──────────────────────────────────────────

export const getEvents = (category) =>
  api.get('/events', { params: category ? { category } : {} }).then(r => r.data);

export const getEvent = (slug) =>
  api.get(`/events/${slug}`).then(r => r.data);

export const getSchedule = (params) =>
  api.get('/schedule', { params }).then(r => r.data);

export const getSchedules = getSchedule;

export const createRegistration = (data) =>
  api.post('/registrations', data).then(r => r.data);

export const getRegistration = (regId) =>
  api.get(`/registrations/${regId}`).then(r => r.data);

export const downloadRegistrationPdf = (regId) =>
  api.get(`/registrations/${regId}/pdf`, { responseType: 'blob' });

export const getAnnouncements = () =>
  api.get('/announcements').then(r => r.data);

export const getResults = (category) =>
  api.get('/results', { params: category ? { category } : {} }).then(r => r.data);

export const getGallery = (params) =>
  api.get('/gallery', { params }).then(r => r.data);

export const getSponsors = () =>
  api.get('/sponsors').then(r => r.data);

export const submitContact = (data) =>
  api.post('/contact', data).then(r => r.data);

// ── Admin API ───────────────────────────────────────────

export const adminLogin = (data) =>
  api.post('/admin/login', data).then(r => r.data);

export const adminGetDashboard = () =>
  api.get('/admin/dashboard').then(r => r.data);

// Events
export const adminCreateEvent = (data) =>
  api.post('/admin/events', data).then(r => r.data);

export const adminUpdateEvent = (id, data) =>
  api.put(`/admin/events/${id}`, data).then(r => r.data);

export const adminDeleteEvent = (id) =>
  api.delete(`/admin/events/${id}`).then(r => r.data);

// Registrations
export const adminGetRegistrations = (params) =>
  api.get('/admin/registrations', { params }).then(r => r.data);

export const adminGetRegistration = (id) =>
  api.get(`/admin/registrations/${id}`).then(r => r.data);

export const adminUpdateRegistration = (id, data) =>
  api.put(`/admin/registrations/${id}`, data).then(r => r.data);

export const adminExportRegistrations = (format, params) =>
  api.get('/admin/export/registrations', {
    params: { format, ...params },
    responseType: format === 'csv' ? 'text' : 'blob',
  });

export const adminExportSinglePdf = (id) =>
  api.get(`/admin/export/registration/${id}/pdf`, { responseType: 'blob' });

// Schedule
export const adminCreateSchedule = (data) =>
  api.post('/admin/schedule', data).then(r => r.data);

export const adminUpdateSchedule = (id, data) =>
  api.put(`/admin/schedule/${id}`, data).then(r => r.data);

export const adminDeleteSchedule = (id) =>
  api.delete(`/admin/schedule/${id}`).then(r => r.data);

// Announcements
export const adminGetAnnouncements = () =>
  api.get('/admin/announcements').then(r => r.data);

export const adminCreateAnnouncement = (data) =>
  api.post('/admin/announcements', data).then(r => r.data);

export const adminUpdateAnnouncement = (id, data) =>
  api.put(`/admin/announcements/${id}`, data).then(r => r.data);

export const adminDeleteAnnouncement = (id) =>
  api.delete(`/admin/announcements/${id}`).then(r => r.data);

// Results
export const adminGetResults = () =>
  api.get('/admin/results').then(r => r.data);

export const adminCreateResult = (data) =>
  api.post('/admin/results', data).then(r => r.data);

export const adminUpdateResult = (id, data) =>
  api.put(`/admin/results/${id}`, data).then(r => r.data);

export const adminDeleteResult = (id) =>
  api.delete(`/admin/results/${id}`).then(r => r.data);

// Gallery
export const adminGetGallery = () =>
  api.get('/admin/gallery').then(r => r.data);

export const adminCreateGallery = (formData) =>
  api.post('/admin/gallery', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);

export const adminDeleteGallery = (id) =>
  api.delete(`/admin/gallery/${id}`).then(r => r.data);

// Sponsors
export const adminGetSponsors = () =>
  api.get('/admin/sponsors').then(r => r.data);

export const adminCreateSponsor = (data) =>
  api.post('/admin/sponsors', data).then(r => r.data);

export const adminUpdateSponsor = (id, data) =>
  api.put(`/admin/sponsors/${id}`, data).then(r => r.data);

export const adminDeleteSponsor = (id) =>
  api.delete(`/admin/sponsors/${id}`).then(r => r.data);

// Messages
export const adminGetMessages = () =>
  api.get('/admin/messages').then(r => r.data);

export default api;
