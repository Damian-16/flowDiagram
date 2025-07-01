<template>
  <div class="node-goto">
    <div class="node-goto__content">
      <q-icon
        :name="data.icon || ''"
        :color="
          data.icon === 'description'
            ? 'green'
            : data.icon === 'device_hub'
            ? 'orange'
            : 'blue'
        "
        size="sm"
      />
    </div>
    <div class="node-goto__handles">
      <Handle type="target" position="top" />
      <Handle type="source" position="bottom" />
    </div>
  </div>
</template>

<script setup>
import { Handle } from "@vue-flow/core";

defineProps({
  data: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped>
.node-goto {
  background: white;
  border: 2px dashed #2196f3;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  position: relative;
  animation: nodeDash 0.75s linear infinite;
}

@keyframes nodeDash {
  from {
    border-color: rgba(33, 150, 243, 1);
  }
  50% {
    border-color: rgba(33, 150, 243, 0.5);
  }
  to {
    border-color: rgba(33, 150, 243, 1);
  }
}

.node-goto__content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.node-goto__label {
  margin-left: 4px;
}

.node-goto__handles {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
}
</style>
