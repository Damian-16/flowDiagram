
<template>
  <VueFlow
    :nodes="props.nodes"
    :edges="props.edges"
    :node-types="props.nodeTypes"
    :nodes-draggable="false"
    :nodes-connectable="false"
    :elements-selectable="false"
    :zoom-on-scroll="true"
    :pan-on-drag="false"
    class="flow-bg"
    fit-view
    @node-click="$emit('node-click', $event)"
  />
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { VueFlow } from '@vue-flow/core';
import type { Node as FlowNode, Edge as FlowEdge } from '@vue-flow/core';

const props = defineProps<{
  nodes: FlowNode[];
  edges: FlowEdge[];
  nodeTypes: Record<string, any>;
}>();

const emit = defineEmits<{
  (e: 'node-click', payload: { node: FlowNode }): void;
}>();
</script>

<style scoped lang="scss">
.flow-bg {
  background-color: #f4f4f4;
  background-image: radial-gradient(#bbb 1px, transparent 1px);
  background-size: 20px 20px;
  width: 100%;
  height: 100%;
}
</style>
