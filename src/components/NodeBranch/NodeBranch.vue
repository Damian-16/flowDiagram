<template>
  <div class="node-branch">
    <Handle
      type="target"
      position="top"
      :style="{ top: '0px', opacity: 1 }"
    />
    <div class="content">
      <q-icon name="call_split" size="20px" color="orange" />
      <div class="label">{{ data.label }}</div>
    </div>
    <Handle
      type="source"
      position="left"
      id="left"
      :style="{ left: '-8px', top: '50%', transform: 'translateY(-50%)' }"
    />
    <Handle
      type="source"
      position="right"
      id="right"
      :style="{ right: '-8px', top: '50%', transform: 'translateY(-50%)' }"
    />
  </div>
</template>

<script setup>
import { Handle } from '@vue-flow/core'
import { QIcon } from 'quasar'

defineProps({
  data: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.node-branch {
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