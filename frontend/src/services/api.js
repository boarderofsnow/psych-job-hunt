import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
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

// Scraper API
export const triggerScrape = async () => {
  const response = await api.post('/scrape');
  return response.data;
};

export const getScrapeStatus = async () => {
  const response = await api.get('/scrape/status');
  return response.data;
};

export default api;
