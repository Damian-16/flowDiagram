<template>
  <div class="flow-board">
    <VueFlow
      v-model="elements"
      :node-types="nodeTypes"
      :default-viewport="{ zoom: 1, x: 0, y: 0 }"
      :nodes-draggable="false"
      :nodes-connectable="false"
      :elements-selectable="false"
      :zoom-on-scroll="true"
      :pan-on-drag="true"
      class="flow-bg"
      fit-view
      @node-click="onNodeClick"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { VueFlow } from "@vue-flow/core";
import AddNode from "../AddNode/AddNode.vue";
import {
  QDrawer,
  QToolbar,
  QToolbarTitle,
  QList,
  QItem,
  QItemSection,
} from "quasar";

// Solo un nodo: "start" de tipo "start"
const elements = ref([
  {
    id: "start",
    type: "start",
    position: { x: 0, y: 0 },
    data: { label: "Inicio" },
  },
  {
    id: "add",
    type: "add",
    position: { x: 80, y:50 },
  },
  {
    id: "end",
    type: "end",
    position: { x: 70, y: 100 },
    data: { label: "Fin" },
  }
]);

// Podemos definir un componente custom para type "start" si hace falta,
// por ahora no se registra ninguno especial:
const nodeTypes = {
  // start: StartNodeComponent, // si más adelante creas un componente custom
  add: AddNode,
};

const sidebarOpen = ref(false);

function onNodeClick(event, node) {
  if (node.type === "add") {
    sidebarOpen.value = true;
  }
}
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
  cursor: grab;
  background-image: radial-gradient(#bbb 1px, transparent 1px);
  background-size: 20px 20px;
}

:deep(.vue-flow__node[data-id="start"]),
:deep(.vue-flow__node[data-id="end"]){
  justify-content: center;
  display: flex;
  padding: 8px;
  border-radius: 8px;
}

:deep(.vue-flow__node[data-id="start"]) {

  background-color: #90ee90;
  max-width: 200px;
}
:deep(.vue-flow__node[data-id="end"]){
background-color: #bbb;
max-width: 50px;
}
</style>
