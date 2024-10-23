import api from './axios';

export const filesApi = {
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await api.post('files/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 second timeout
      });
      
      if (!response || !response.data) {
        throw new Error('Invalid server response');
      }
      
      return response;
    } catch (error) {
      if (error.response?.status === 413) {
        throw new Error('File is too large for the server to process');
      } else if (error.response?.status === 415) {
        throw new Error('File type is not supported');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Invalid file format');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required');
      } else if (error.response?.status === 403) {
        throw new Error('Permission denied');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Upload timeout. Please try again');
      } else if (!navigator.onLine) {
        throw new Error('No internet connection');
      } else if (error.response) {
        throw new Error(`Server error: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        throw new Error('Network error. Please check your connection and try again');
      }
      
      throw error;
    }
  },

  getFiles: async () => {
    try {
      const response = await api.get('files/list/');
      if (!response || !response.data) {
        throw new Error('Invalid server response');
      }
      return response;
    } catch (error) {
      console.error('Get files error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw new Error('Failed to fetch files. Please try again.');
    }
  },

  deleteFile: async (fileId) => {
    try {
      const response = await api.delete(`files/delete/${fileId}/`);
      if (!response || !response.data) {
        throw new Error('Invalid server response');
      }
      return response;
    } catch (error) {
      console.error('Delete file error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw new Error('Failed to delete file. Please try again.');
    }
  },
};