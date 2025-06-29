<template>
  <Handle type="target" position="top" />
  <q-btn round dense flat icon="add" class="add-node-btn" />
</template>

<script setup>
import { defineProps } from "vue";
import { QBtn } from "quasar";
import { Handle } from '@vue-flow/core'

defineProps({
  data: Object,
});
</script>

<style scoped lang="scss">
.add-node-btn {
  background-color: white;
  color: black;
}
</style>
