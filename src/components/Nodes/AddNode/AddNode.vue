
<template>
  <div class="add-node-container">
    <Handle type="target" position="top" id="top" />
    <q-btn round dense flat icon="add" class="add-node-btn" />
    <Handle type="source" position="bottom" id="bottom" />
  </div>
</template>

<script setup>
import { Handle } from '@vue-flow/core'
</script>

<style scoped>
.add-node-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.add-node-btn { background-color: white; color: black }
</style>
