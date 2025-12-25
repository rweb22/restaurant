import api from './api';
import { Platform } from 'react-native';

const uploadService = {
  // Upload image and create picture record
  uploadPicture: async (file, entityType, entityId, altText = '', isPrimary = false) => {
    const formData = new FormData();

    // Handle web vs native differently
    if (Platform.OS === 'web') {
      // For web, fetch the image and convert to blob
      const response = await fetch(file.uri);
      const blob = await response.blob();
      formData.append('image', blob, file.fileName || 'upload.jpg');
    } else {
      // For native (iOS/Android)
      formData.append('image', {
        uri: file.uri,
        type: file.mimeType || 'image/jpeg',
        name: file.fileName || 'upload.jpg',
      });
    }

    formData.append('entityType', entityType);
    formData.append('entityId', entityId.toString());
    formData.append('altText', altText);
    formData.append('isPrimary', isPrimary.toString());

    const response = await api.post('/upload/picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload image only (returns file metadata)
  uploadImage: async (file) => {
    const formData = new FormData();

    // Handle web vs native differently
    if (Platform.OS === 'web') {
      // For web, fetch the image and convert to blob
      const response = await fetch(file.uri);
      const blob = await response.blob();
      formData.append('image', blob, file.fileName || 'upload.jpg');
    } else {
      // For native (iOS/Android)
      formData.append('image', {
        uri: file.uri,
        type: file.mimeType || 'image/jpeg',
        name: file.fileName || 'upload.jpg',
      });
    }

    const response = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get pictures for entity
  getPictures: async (entityType, entityId) => {
    const response = await api.get('/pictures', {
      params: { entityType, entityId },
    });
    return response.data;
  },

  // Delete picture
  deletePicture: async (pictureId) => {
    const response = await api.delete(`/pictures/${pictureId}`);
    return response.data;
  },

  // Set picture as primary
  setPrimaryPicture: async (pictureId) => {
    const response = await api.patch(`/pictures/${pictureId}/primary`);
    return response.data;
  },
};

export default uploadService;

