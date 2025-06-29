<template>
  <div class="flow-board">
    <VueFlow
      v-model:nodes="nodes"
      v-model:edges="edges"
      :node-types="nodeTypes"
      :nodes-draggable="false"
      :nodes-connectable="false"
      :elements-selectable="false"
      :zoom-on-scroll="true"
      :pan-on-drag="true"
      class="flow-bg"
      fit-view
      @node-click="onNodeClick"
    />

    <q-drawer
      v-model="sidebarOpen"
      side="right"
       :width="300"
      :breakpoint="0"
      overlay
      
    >
      <q-toolbar>
        <q-toolbar-title>Agregar Nodo</q-toolbar-title>
      </q-toolbar>
      <q-list>
        <q-item>
          <q-item-section>
            Aquí va el contenido del sidebar.
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>
  </div>
  <q-drawer
      v-model="sidebarOpen"
      side="right"
       :width="300"
      :breakpoint="0"
      overlay
      
    >
      <q-toolbar>
        <q-toolbar-title>Agregar Nodo</q-toolbar-title>
      </q-toolbar>
      <q-list>
        <q-item>
          <q-item-section>
            Aquí va el contenido del sidebar.
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>
</template>

<script setup>
import { ref, watch } from "vue";
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

const nodes = ref([
  {
    id: "start",
    type: "start",
    position: { x: 0, y: 0 },
    data: { label: "Inicio" },
  },
  {
    id: "add",
    type: "add",
    position: { x: 80, y: 50 },
  },
  {
    id: "end",
    type: "end",
    position: { x: 70, y: 100 },
    data: { label: "Fin" },
  },
]);

const edges = ref([
  {
    id: "e-start-add",
    source: "start",
    target: "add",
    type: "default",
  },
  {
    id: "e-add-end",
    source: "add",
    target: "end",
    type: "default",
  },
]);

const nodeTypes = {
  add: AddNode,
};

const sidebarOpen = ref(false);

function onNodeClick({ node }) {
  if (node?.type === "add") {
    sidebarOpen.value = true;
  }
}

watch(sidebarOpen, (val) => {
  console.log("Sidebar ahora está", val ? "abierto" : "cerrado");
});
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
:deep(.vue-flow__node[data-id="end"]) {
  justify-content: center;
  display: flex;
  padding: 8px;
  border-radius: 8px;
}

:deep(.vue-flow__node[data-id="start"]) {
  background-color: #90ee90;
  max-width: 200px;
}
:deep(.vue-flow__node[data-id="end"]) {
  background-color: #bbb;
  max-width: 50px;
}
</style>
