
<template>
  <div class="flow-board">
 
    <FlowCanvas
        :nodes="nodes"
        :edges="edges"
        :node-types="nodeTypes"
        @node-click="onNodeClick"
      />

   <Sidebar
     v-model:sidebar-open="sidebarOpen"
     v-model:editing-label="editingLabel"
     v-model:branch-left-label="branchLeftLabel"
     v-model:branch-right-label="branchRightLabel"
     :editing-node="editingNode"
     @add-simple="addSimpleNode"
     @add-branch="addBranchNode"
     @add-goto="addGotoNode"
     @save-edit="saveEdit"
     @delete-node="deleteNode"
   />
  </div>
</template>


<script setup lang="ts">
import FlowCanvas from '../FlowCanvas/FlowCanvas.vue';
import Sidebar    from '../Sidebar/Sidebar.vue';
import { useFlowBoard } from './useFlowBoard';

const {
  nodes,
  edges,
  nodeTypes,
  onNodeClick,

  sidebarOpen,
  editingNode,
  editingLabel,
  branchLeftLabel,
  branchRightLabel,
  addSimpleNode,
  addBranchNode,
  addGotoNode,
  saveEdit,
  deleteNode,
  closeSidebar,
} = useFlowBoard();
</script>


<style scoped lang="scss">
.flow-board {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
.flow-bg {
  background-color: #f4f4f4;
  background-image: radial-gradient(#bbb 1px, transparent 1px);
  background-size: 20px 20px;
}

@keyframes dash {
  from { stroke-dashoffset: 24; }
  to   { stroke-dashoffset: 0; }
}

@keyframes flowDash {
  to { stroke-dashoffset: -20; }
}

:deep(.vue-flow__node[data-id="start"]) {
  background-color: #a5d6a7;
  color: #f4f4f4;
}
:deep(.vue-flow__node[type="end"]) {
  background-color: #bbb;
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
</style>
