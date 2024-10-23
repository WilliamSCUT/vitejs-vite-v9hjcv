import { filesApi } from '../../api/files';

const state = {
  list: [],
  loading: false,
  error: null,
};

const mutations = {
  SET_FILES(state, files) {
    state.list = files;
  },
  SET_LOADING(state, loading) {
    state.loading = loading;
  },
  SET_ERROR(state, error) {
    state.error = error;
  },
};

const actions = {
  async fetchFiles({ commit }) {
    commit('SET_LOADING', true);
    try {
      const response = await filesApi.getFiles();
      commit('SET_FILES', response.data);
    } catch (error) {
      commit('SET_ERROR', error.message);
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async deleteFile({ commit, dispatch }, fileId) {
    commit('SET_LOADING', true);
    try {
      await filesApi.deleteFile(fileId);
      dispatch('fetchFiles');
    } catch (error) {
      commit('SET_ERROR', error.message);
    } finally {
      commit('SET_LOADING', false);
    }
  },
};

const getters = {
  getFiles: (state) => state.list,
  isLoading: (state) => state.loading,
  getError: (state) => state.error,
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};