<!-- src/components/Nodes/SimpleNode.vue -->
<template>
  <div class="simple-node">
    <q-icon name="description" class="icon" />
    <span>{{ data.label || 'Paso simple' }}</span>
  </div>
</template>

<script setup>
defineProps({
  data: Object,
});
</script>

<style scoped>
.simple-node {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background-color: #e8f5e9;
  border-radius: 8px;
  font-weight: 500;
  gap: 8px;
  border: 1px solid #a5d6a7;
}
.icon {
  color: #4caf50;
}
</style>
