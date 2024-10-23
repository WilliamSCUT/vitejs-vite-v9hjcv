<!-- src/components/FileManager.vue -->

<template>
  <div class="file-manager">
    <h2>Uploaded Files</h2>
    <el-table v-loading="loading" :data="files" style="width: 100%">
      <el-table-column label="File Name">
        <template #default="{ row }">
          <a :href="row.file" target="_blank">{{ getFileName(row.file) }}</a>
        </template>
      </el-table-column>
      <el-table-column label="Upload Time">
        <template #default="{ row }">
          {{ formatDate(row.uploaded_at) }}
        </template>
      </el-table-column>
      <el-table-column label="Size">
        <template #default="{ row }">
          {{ formatSize(row.size) }}
        </template>
      </el-table-column>
      <el-table-column label="Operations">
        <template #default="{ row }">
          <el-button
            type="danger"
            size="small"
            @click="handleDelete(row.id)"
          >
            Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import { ElMessageBox, ElMessage } from 'element-plus';

export default {
  name: 'FileManager',
  setup() {
    const store = useStore();
    const files = ref([]);
    const loading = ref(false);

    const fetchFiles = async () => {
      loading.value = true;
      try {
        await store.dispatch('files/fetchFiles');
        files.value = store.getters['files/getFiles'];
      } catch (error) {
        ElMessage.error('Failed to fetch files');
      } finally {
        loading.value = false;
      }
    };

    const handleDelete = async (fileId) => {
      try {
        await ElMessageBox.confirm(
          'Are you sure you want to delete this file?',
          'Warning',
          {
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
            type: 'warning',
          }
        );

        await store.dispatch('files/deleteFile', fileId);
        ElMessage.success('File deleted successfully');
        await fetchFiles(); // Refresh the file list after deletion
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error(error.message || 'Failed to delete file');
        }
      }
    };

    const getFileName = (filePath) => {
      // 提取文件名
      return filePath.split('/').pop();
    };

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleString();
    };

    const formatSize = (sizeInBytes) => {
      return (sizeInBytes / 1024).toFixed(2) + ' KB';
    };

    onMounted(() => {
      fetchFiles();
    });

    return {
      files,
      loading,
      handleDelete,
      getFileName,
      formatDate,
      formatSize,
    };
  },
};
</script>

<style scoped>
.file-manager {
  margin-top: 20px;
}
</style>
