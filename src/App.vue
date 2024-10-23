<script setup>
import { ref, provide } from 'vue'
import CsvUploader from './components/CsvUploader.vue'
import FileManager from './components/FileManager.vue'

const fileManagerRef = ref(null)
provide('fileManagerRef', fileManagerRef)
</script>

<template>
  <div id="app">
    <h1>CSV Data Upload and Management</h1>
    <CsvUploader />
    <FileManager ref="fileManagerRef" />
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
