import api from './api';

const menuService = {
  // Categories
  getCategories: async (params = {}) => {
    const response = await api.get('/categories', { params });
    return response.data;
  },

  getCategoryById: async (categoryId) => {
    const response = await api.get(`/categories/${categoryId}`);
    return response.data;
  },

  createCategory: async (data) => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  updateCategory: async (categoryId, data) => {
    const response = await api.put(`/categories/${categoryId}`, data);
    return response.data;
  },

  deleteCategory: async (categoryId) => {
    const response = await api.delete(`/categories/${categoryId}`);
    return response.data;
  },

  // Items
  getItems: async (params = {}) => {
    const response = await api.get('/items', { params });
    return response.data;
  },

  getItemById: async (itemId) => {
    const response = await api.get(`/items/${itemId}`, {
      params: {
        includeSizes: true,
        includeAddOns: true,
      },
    });
    return response.data;
  },

  createItem: async (data) => {
    const response = await api.post('/items', data);
    return response.data;
  },

  updateItem: async (itemId, data) => {
    const response = await api.put(`/items/${itemId}`, data);
    return response.data;
  },

  deleteItem: async (itemId) => {
    const response = await api.delete(`/items/${itemId}`);
    return response.data;
  },

  // Item Sizes
  addSizeToItem: async (itemId, sizeData) => {
    const response = await api.post(`/items/${itemId}/sizes`, sizeData);
    return response.data;
  },

  updateItemSize: async (sizeId, data) => {
    const response = await api.put(`/item-sizes/${sizeId}`, data);
    return response.data;
  },

  deleteItemSize: async (sizeId) => {
    const response = await api.delete(`/item-sizes/${sizeId}`);
    return response.data;
  },

  // Add-ons
  getAddOns: async (params = {}) => {
    const response = await api.get('/add-ons', { params });
    return response.data;
  },

  getAddOnById: async (addOnId) => {
    const response = await api.get(`/add-ons/${addOnId}`);
    return response.data;
  },

  createAddOn: async (data) => {
    const response = await api.post('/add-ons', data);
    return response.data;
  },

  updateAddOn: async (addOnId, data) => {
    const response = await api.put(`/add-ons/${addOnId}`, data);
    return response.data;
  },

  deleteAddOn: async (addOnId) => {
    const response = await api.delete(`/add-ons/${addOnId}`);
    return response.data;
  },

  // Locations
  getLocations: async (params = {}) => {
    const response = await api.get('/locations', { params });
    return response.data;
  },

  getLocationById: async (locationId) => {
    const response = await api.get(`/locations/${locationId}`);
    return response.data;
  },

  createLocation: async (data) => {
    const response = await api.post('/locations', data);
    return response.data;
  },

  updateLocation: async (locationId, data) => {
    const response = await api.put(`/locations/${locationId}`, data);
    return response.data;
  },

  deleteLocation: async (locationId) => {
    const response = await api.delete(`/locations/${locationId}`);
    return response.data;
  },

  // Users
  getUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  updateUser: async (userId, data) => {
    const response = await api.put(`/users/${userId}`, data);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },

  // Offers
  getOffers: async (params = {}) => {
    const response = await api.get('/offers', { params });
    return response.data;
  },

  getOfferById: async (offerId) => {
    const response = await api.get(`/offers/${offerId}`);
    return response.data;
  },

  createOffer: async (data) => {
    const response = await api.post('/offers', data);
    return response.data;
  },

  updateOffer: async (offerId, data) => {
    const response = await api.put(`/offers/${offerId}`, data);
    return response.data;
  },

  deleteOffer: async (offerId) => {
    const response = await api.delete(`/offers/${offerId}`);
    return response.data;
  },
};

export default menuService;

