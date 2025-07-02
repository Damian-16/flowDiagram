<template>
  <div class="goto-node">
    <Handle type="target" position="top" id="top" />


    <div v-if="data.pulsing" class="pulse-overlay" />

    
    <q-icon
      v-if="data.icon"
      :name="data.icon"
      size="24px"
      class="goto-icon"
/>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
import { Handle } from '@vue-flow/core';

const props = defineProps({
  id: String,
  data: {
    type: Object,
    default: () => ({ pulsing: false, icon: null })
  }
});
</script>

<style scoped>
.goto-node {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  border: 2px solid #2196f3;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pulse-overlay {
  position: absolute;
  top: -10%;
  left: -10%;
  width: 120%;
  height: 120%;
  border-radius: 50%;
  background: rgba(33, 150, 243, 0.3);
  animation: pulse 2s infinite;
  pointer-events: none;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50%     { transform: scale(1.2); }
}

.goto-icon {
  position: relative;
  z-index: 1;
}
</style>
