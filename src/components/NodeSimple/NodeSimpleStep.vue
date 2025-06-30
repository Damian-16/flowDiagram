<!-- src/components/Nodes/NodeSimpleStep.vue -->
<template>
  <div class="simple-step-node">
    <Handle type="target" position="top" id="top" />
    <q-icon name="insert_drive_file" class="step-icon" />
    <span class="step-label">{{ data.label }}</span>
    <Handle type="source" position="bottom" id="bottom" />
  </div>
</template>

<script setup>
import { Handle } from '@vue-flow/core'

const props = defineProps(['data'])
</script>

<style scoped>
.simple-step-node {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border: 2px solid #a0d468;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-width: 180px;
  gap: 10px;
  position: relative;
}
.step-icon { color: #a0d468; font-size: 24px }
.step-label { font-weight: 500; color: #333 }
</style>
