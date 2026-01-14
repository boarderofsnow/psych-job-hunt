import axios from 'axios';
import { supabase } from './supabase';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
  }
  return config;
});

// Jobs API
export const getJobs = async (params = {}) => {
  const response = await api.get('/jobs', { params });
  return response.data;
};

export const getJob = async (id) => {
  const response = await api.get(`/jobs/${id}`);
  return response.data;
};

export const toggleFavorite = async (id) => {
  const response = await api.post(`/jobs/${id}/favorite`);
  return response.data;
};

export const updateStatus = async (id, status) => {
  const response = await api.put(`/jobs/${id}/status`, { status });
  return response.data;
};

export const updateNotes = async (id, notes) => {
  const response = await api.put(`/jobs/${id}/notes`, { notes });
  return response.data;
};

// Scraper API - longer timeout for scraping (5 minutes)
export const triggerScrape = async () => {
  const response = await api.post('/scrape', {}, { timeout: 300000 });
  return response.data;
};

export const getScrapeStatus = async () => {
  const response = await api.get('/scrape/status');
  return response.data;
};

// Preferences API
export const getPreferences = async () => {
  const response = await api.get('/preferences');
  return response.data;
};

export const updatePreferences = async (locations) => {
  const response = await api.put('/preferences', { locations });
  return response.data;
};

export const getAvailableLocations = async () => {
  const response = await api.get('/preferences/locations');
  return response.data;
};

export default api;
