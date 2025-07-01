<template>
  <div class="node-branch"  :class="{ 'pulse-animation': data.pulsing }">

    <Handle
      type="target"
      position="top"
      :style="{ top: '0px', opacity: 1 }"
    />
    <div class="content">
      <q-icon  class="node-icon"
              style="--icon-bg: #ffcc8033"
              name="device_hub"
              color="orange"/>
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
  &:hover {
    background: #fff9e6;
    transform: scale(1.05);
  }
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
.node-icon {
  border-radius: 8px;
  padding: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--icon-color, #333);
  background-color: var(--icon-bg, transparent);
}
.pulse-animation {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(33, 150, 243, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0);
  }
}
</style>