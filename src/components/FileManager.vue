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
          <el-button
            type="primary"
            size="small"
            @click="handleLabel(row)"
          >
            Label
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="View Chart">
        <template #default="{ row }">
          <el-button
            type="primary"
            size="small"
            @click="showChart(row)"
          >
            View Chart
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="chartDialogVisible" title="Chart and Labels" width="80%">
      <ChartLabeler :csv-data="currentCsvData" :file-name="currentFileName" v-if="chartDialogVisible" />
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import { ElMessageBox, ElMessage } from 'element-plus';
import ChartLabeler from './ChartLabeler.vue';
import Papa from 'papaparse';

export default {
  name: 'FileManager',
  components: {
    ChartLabeler
  },
  setup() {
    const store = useStore();
    const files = ref([]);
    const loading = ref(false);
    const chartDialogVisible = ref(false);
    const currentCsvData = ref([]);
    const currentFileName = ref('');

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

    const showChart = async (file) => {
      try {
        const response = await fetch(file.file);
        const csvText = await response.text();
        const result = Papa.parse(csvText, { header: true });
        currentCsvData.value = result.data;
        currentFileName.value = getFileName(file.file);
        chartDialogVisible.value = true;
      } catch (error) {
        ElMessage.error('Failed to load CSV data');
      }
    };

    const handleLabel = (file) => {
      currentCsvData.value = [];
      currentFileName.value = getFileName(file.file);
      showChart(file);
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
      chartDialogVisible,
      currentCsvData,
      currentFileName,
      showChart,
      handleLabel,
    };
  },
};
</script>

<style scoped>
.file-manager {
  margin-top: 20px;
}
</style>
