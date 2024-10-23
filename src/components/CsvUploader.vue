<!-- src/components/CsvUploader.vue -->

<template>
  <div class="csv-uploader">
    <el-upload
      :auto-upload="false"
      :show-file-list="false"
      :on-change="file => handleUpload(file.raw)"
      :disabled="uploading"
      drag
    >
      <el-icon><upload-filled /></el-icon>
      <div class="el-upload__text">
        <template v-if="!uploading">
          Drop file here or <em>click to upload</em>
        </template>
        <template v-else>
          Uploading...
        </template>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          Only CSV files with Time and Response columns are allowed, and file size should not exceed 2MB
        </div>
      </template>
    </el-upload>
  </div>
</template>

<script>
import { ref, inject } from 'vue';
import { useStore } from 'vuex';
import { ElMessage } from 'element-plus';
import { filesApi } from '../api/files';
import Papa from 'papaparse';

export default {
  name: 'CsvUploader',
  setup() {
    const store = useStore();
    const uploading = ref(false);
    const fileManagerRef = inject('fileManagerRef', null); // 注入 FileManager 的引用

    const validateCsvContent = (results) => {
      if (!results.data || results.data.length === 0) {
        throw new Error('CSV file is empty');
      }

      const headers = Object.keys(results.data[0]);
      if (!headers.includes('Time') || !headers.includes('Response')) {
        throw new Error('CSV must contain "Time" and "Response" columns');
      }

      return true;
    };

    const beforeUpload = (file) => {
      const isCSV = file.type === 'text/csv' || file.name.endsWith('.csv');
      if (!isCSV) {
        ElMessage.error('Only CSV files are allowed!');
        return false;
      }
      
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        ElMessage.error('File size cannot exceed 2MB!');
        return false;
      }
      
      return true;
    };

    const handleUpload = async (file) => {
      if (!beforeUpload(file)) return;

      uploading.value = true;
      try {
        // 验证 CSV 内容
        await new Promise((resolve, reject) => {
          Papa.parse(file, {
            header: true,
            complete: (results) => {
              try {
                if (validateCsvContent(results)) {
                  resolve();
                }
              } catch (error) {
                reject(error);
              }
            },
            error: (error) => reject(new Error(`CSV parsing failed: ${error.message}`))
          });
        });

        // 上传文件
        const response = await filesApi.uploadFile(file);
        
        if (response && response.data) {
          ElMessage.success('File uploaded successfully!');
          await store.dispatch('files/fetchFiles');
          
          // 如果 FileManager 组件提供了刷新方法，调用它
          if (fileManagerRef && typeof fileManagerRef.value?.refreshFiles === 'function') {
            fileManagerRef.value.refreshFiles();
          }
        } else {
          throw new Error('Invalid server response');
        }
      } catch (error) {
        console.error('Upload error:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          stack: error.stack
        });
        
        let errorMessage = 'Upload failed. ';
        if (error.response?.data?.message) {
          errorMessage += error.response.data.message;
        } else if (error.message) {
          errorMessage += error.message;
        } else {
          errorMessage += 'Please try again.';
        }
        
        ElMessage.error(errorMessage);
      } finally {
        uploading.value = false;
      }
    };

    return {
      uploading,
      handleUpload,
    };
  },
};
</script>

<style scoped>
.csv-uploader {
  margin-bottom: 20px;
  width: 100%;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.el-upload {
  width: 100%;
}

.el-upload-dragger {
  width: 100%;
}
</style>
