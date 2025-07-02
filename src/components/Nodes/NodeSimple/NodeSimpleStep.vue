
<template>
  <div class="simple-step-node" :class="{ 'pulse-animation': data.pulsing }">
    <Handle type="target" position="top" id="top" />
    <q-icon
      class="node-icon"
      style="--icon-bg: #90ee9033"
      name="description"
      color="green"
    />
    <span class="step-label">{{ data.label }}</span>
    <Handle type="source" position="bottom" id="bottom" />
  </div>
</template>

<script setup>
import { Handle } from "@vue-flow/core";

const props = defineProps(["data", "id"]);
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
  &:hover {
    background: #f5fcf2;
    transform: scale(1.05);
  }
}
.step-icon {
  color: #a0d468;
  font-size: 24px;
}
.step-label {
  font-weight: 500;
  color: #333;
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
