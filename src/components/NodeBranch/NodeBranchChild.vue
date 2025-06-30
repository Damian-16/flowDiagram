<template>
  <div class="node-branch-child">
    <Handle
      type="target"
      position="top"
      :style="{ top: '0px', opacity: 1 }"
    />
    <div class="content">
      <div class="label">{{ data.label }}</div>
    </div>
    <Handle
      type="source"
      position="bottom"
      :style="{ bottom: '0px', opacity: 1 }"
    />
  </div>
</template>

<script setup>
import { Handle } from '@vue-flow/core'

defineProps({
  data: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.node-branch-child {
  padding: 10px 20px;
  border-radius: 5px;
  background: #fff;
  border: 2px solid #ff9800;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  min-width: 150px;
}

.content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.label {
  font-size: 14px;
  color: #666;
}
</style>