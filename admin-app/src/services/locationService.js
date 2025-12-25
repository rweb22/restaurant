import api from './api';

export const getAllLocations = async (params = {}) => {
  const response = await api.get('/locations', { params });
  return response.data.data.locations;
};

export const getLocationById = async (id) => {
  const response = await api.get(`/locations/${id}`);
  return response.data.data.location;
};

export const createLocation = async (locationData) => {
  const response = await api.post('/locations', locationData);
  return response.data.data.location;
};

export const updateLocation = async (id, locationData) => {
  const response = await api.put(`/locations/${id}`, locationData);
  return response.data.data.location;
};

export const deleteLocation = async (id) => {
  const response = await api.delete(`/locations/${id}`);
  return response.data;
};

