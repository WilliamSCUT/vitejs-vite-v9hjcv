<template>
  <div class="chart-labeler">
    <canvas ref="chartCanvas"></canvas>
    <div class="controls">
      <el-button @click="startLabeling" v-if="!isLabeling">Start Labeling</el-button>
      <el-button @click="endLabeling" v-if="isLabeling">End Labeling</el-button>
      <el-button @click="saveLabels">Save Labels</el-button>
      <el-button @click="uploadLabels">Upload Labels</el-button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import Chart from 'chart.js/auto';
import zoomPlugin from 'chartjs-plugin-zoom';
import { useStore } from 'vuex';
import { ElMessage } from 'element-plus';
import { filesApi } from '../api/files';

Chart.register(zoomPlugin);

export default {
  name: 'ChartLabeler',
  props: {
    csvData: {
      type: Array,
      required: true
    },
    fileName: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const store = useStore();
    const chartCanvas = ref(null);
    let chart = null;
    const labels = ref([]);
    const isLabeling = ref(false);
    let startIndex = null;

    const initChart = () => {
      const ctx = chartCanvas.value.getContext('2d');
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: props.csvData.map(row => row.Time),
          datasets: [{
            label: 'Response',
            data: props.csvData.map(row => row.Response),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            zoom: {
              zoom: {
                wheel: {
                  enabled: true,
                },
                pinch: {
                  enabled: true
                },
                mode: 'xy',
              },
              pan: {
                enabled: true,
                mode: 'xy',
              },
            }
          },
          onClick: (e) => {
            if (isLabeling.value) {
              const elements = chart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true);
              if (elements.length) {
                const index = elements[0].index;
                addLabel(index);
              }
            }
          }
        }
      });
    };

    const addLabel = (index) => {
      if (startIndex === null) {
        startIndex = index;
      } else {
        const label = prompt('Enter label (0 or 1):');
        if (label === '0' || label === '1') {
          labels.value.push({ start: Math.min(startIndex, index), end: Math.max(startIndex, index), label: parseInt(label) });
          updateChartLabels();
          startIndex = null;
        }
      }
    };

    const updateChartLabels = () => {
      chart.data.datasets[1] = {
        label: 'Labels',
        data: props.csvData.map((_, i) => {
          const label = labels.value.find(l => i >= l.start && i <= l.end);
          return label ? label.label : null;
        }),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        pointRadius: 0,
        fill: true,
      };
      chart.update();
    };

    const startLabeling = () => {
      isLabeling.value = true;
    };

    const endLabeling = () => {
      isLabeling.value = false;
      startIndex = null;
    };

    const saveLabels = () => {
      const labelsCsv = labels.value.map(l => `${l.start},${l.end},${l.label}`).join('\n');
      const blob = new Blob([labelsCsv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${props.fileName.replace('.csv', '')}_label.csv`;
      a.click();
      URL.revokeObjectURL(url);
    };

    const uploadLabels = async () => {
      const labelsCsv = labels.value.map(l => `${l.start},${l.end},${l.label}`).join('\n');
      const blob = new Blob([labelsCsv], { type: 'text/csv' });
      const file = new File([blob], `${props.fileName.replace('.csv', '')}_label.csv`, { type: 'text/csv' });

      try {
        await filesApi.uploadLabelFile(file);
        ElMessage.success('Labels uploaded successfully');
        await store.dispatch('files/fetchFiles');
      } catch (error) {
        ElMessage.error('Failed to upload labels');
      }
    };

    onMounted(() => {
      initChart();
    });

    watch(() => props.csvData, () => {
      if (chart) {
        chart.destroy();
      }
      initChart();
    });

    return {
      chartCanvas,
      isLabeling,
      startLabeling,
      endLabeling,
      saveLabels,
      uploadLabels
    };
  }
};
</script>

<style scoped>
.chart-labeler {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}
.controls {
  margin-top: 20px;
}
</style>
