<template>
  <div class="end-node">
    <Handle type="target" position="top" />
    <div class="label">Fin</div>
  </div>
</template>

<script setup>
import { Handle } from '@vue-flow/core'
</script>

<style scoped>
.end-node {
  background-color: #bbb;
  padding: 8px 16px;
  border-radius: 8px;
  text-align: center;
  font-weight: bold;
  position: relative;
  min-width: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
