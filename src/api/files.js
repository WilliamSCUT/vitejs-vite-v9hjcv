// src/api/files.js

import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://williamscut.pythonanywhere.com/api/',
  headers: {
    'Content-Type': 'multipart/form-data',
  },
  withCredentials: true, // 确保携带凭证
});

export const filesApi = {
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await apiClient.post('files/upload/', formData);
      return response;
    } catch (error) {
      if (error.response && error.response.data) {
        return Promise.reject(error.response.data);
      } else {
        return Promise.reject({ message: 'Network or server error.' });
      }
    }
  },

  async getFiles() {
    try {
      const response = await apiClient.get('files/list/');
      return response;
    } catch (error) {
      if (error.response && error.response.data) {
        return Promise.reject(error.response.data);
      } else {
        return Promise.reject({ message: 'Network or server error.' });
      }
    }
  },

  async deleteFile(fileId) {
    try {
      const response = await apiClient.delete(`files/delete/${fileId}/`);
      // 204 No Content 返回没有数据，确保不尝试访问 response.data
      return response;
    } catch (error) {
      if (error.response && error.response.data) {
        return Promise.reject(error.response.data);
      } else {
        return Promise.reject({ message: 'Network or server error.' });
      }
    }
  },

  async uploadLabelFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await apiClient.post('files/upload-label/', formData);
      return response;
    } catch (error) {
      if (error.response && error.response.data) {
        return Promise.reject(error.response.data);
      } else {
        return Promise.reject({ message: 'Network or server error.' });
      }
    }
  },
};
