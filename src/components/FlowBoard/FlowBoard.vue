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
      :width="460"
      :breakpoint="0"
      overlay
    >
      <q-toolbar>
        <q-toolbar-title>
          {{ editingNode ? "Editar Paso" : "Agregar Nodo" }}
        </q-toolbar-title>
        <q-btn flat round icon="close" @click="closeSidebar" />
      </q-toolbar>

      <q-list v-if="editingNode?.type === 'add'">
        <q-item clickable @click="addSimpleNode">
          <q-item-section avatar>
            <q-icon name="insert_drive_file" color="green" />
          </q-item-section>
          <q-item-section>Paso simple</q-item-section>
        </q-item>
        <q-item clickable @click="addBranchNode">
          <q-item-section avatar>
            <q-icon name="call_split" color="orange" />
          </q-item-section>
          <q-item-section>Bifurcación</q-item-section>
        </q-item>
      </q-list>

      <div v-if="editingNode && editingNode.type !== 'add'" class="q-pa-md">
        <template v-if="editingNode.type === 'branch'">
          <q-input
            v-model="editingLabel"
            label="Nombre de la bifurcación"
            dense
            autofocus
            class="q-mb-sm"
          />
          <q-input
            v-model="branchLeftLabel"
            label="Nombre rama izquierda"
            dense
            class="q-mb-sm"
          />
          <q-input
            v-model="branchRightLabel"
            label="Nombre rama derecha"
            dense
          />
        </template>
        <template v-else>
          <q-input
            v-model="editingLabel"
            label="Nombre del paso"
            dense
            autofocus
          />
        </template>
        <div class="q-mt-md row justify-between">
          <q-btn
            color="negative"
            icon="delete"
            label="Eliminar"
            @click="deleteNode"
          />
          <q-btn flat label="Cancelar" @click="closeSidebar" class="q-mr-sm" />
          <q-btn color="primary" label="Guardar" @click="saveEdit" />
          <div></div>
        </div>
      </div>
    </q-drawer>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { VueFlow } from "@vue-flow/core";
import NodeSimpleStep from "../NodeSimple/NodeSimpleStep.vue";
import NodeBranch from "../NodeBranch/NodeBranch.vue";
import NodeBranchChild from "../NodeBranch/NodeBranchChild.vue";
import AddNode from "../AddNode/AddNode.vue";
import {
  QDrawer,
  QToolbar,
  QToolbarTitle,
  QList,
  QItem,
  QItemSection,
  QBtn,
  QIcon,
  QInput,
} from "quasar";
import { useVueFlow } from "@vue-flow/core";
// Constantes y estado inicial
const centerX = 250;
const { updateNodeInternals } = useVueFlow();

const nodes = ref([
  {
    id: "start",
    type: "start",
    position: { x: centerX, y: 0 },
    data: { label: "Inicio" },
  },
  { id: "add-0", type: "add", position: { x: centerX + 58, y: 80 } },
  {
    id: "end",
    type: "end",
    position: { x: centerX, y: 160 },
    data: { label: "Fin" },
  },
]);

const edges = ref([]);

const nodeTypes = {
  add: AddNode,
  "simple-step": NodeSimpleStep,
  branch: NodeBranch,
  "branch-child": NodeBranchChild,
};

// Reconstruye las edges
function rebuildEdges() {
  edges.value = [];

  nodes.value.forEach((node) => {
    if (node.type === "branch") {
      // Encontrar nodos hijos de la rama
      const leftNode = nodes.value.find(
        (n) =>
          Math.abs(n.position.y - node.position.y - 100) < 10 &&
          Math.abs(n.position.x - (node.position.x - 150)) < 10
      );
      const rightNode = nodes.value.find(
        (n) =>
          Math.abs(n.position.y - node.position.y - 100) < 10 &&
          Math.abs(n.position.x - (node.position.x + 150)) < 10
      );

      // Conectar rama con sus hijos
      if (leftNode) {
        edges.value.push({
          id: `e-${node.id}-${leftNode.id}`,
          source: node.id,
          target: leftNode.id,
          type: "smoothstep",
          sourceHandle: "left",
          targetHandle: "top",
        });

        // Encontrar el botón add para el nodo izquierdo
        const leftAdd = nodes.value.find(
          (n) =>
            n.type === "add" &&
            Math.abs(n.position.y - leftNode.position.y - 80) < 10 &&
            Math.abs(n.position.x - (centerX - 92)) < 10
        );

        if (leftAdd) {
          edges.value.push({
            id: `e-${leftNode.id}-${leftAdd.id}`,
            source: leftNode.id,
            target: leftAdd.id,
            type: "straight",
            sourceHandle: "bottom",
            targetHandle: "top",
          });

          // Encontrar y conectar con el nodo fin izquierdo
          const leftEnd = nodes.value.find(
            (n) =>
              n.type === "end" &&
              Math.abs(n.position.y - leftAdd.position.y - 80) < 10 &&
              Math.abs(n.position.x - (centerX - 150)) < 10
          );

          if (leftEnd) {
            edges.value.push({
              id: `e-${leftAdd.id}-${leftEnd.id}`,
              source: leftAdd.id,
              target: leftEnd.id,
              type: "straight",
              sourceHandle: "bottom",
              targetHandle: "top",
            });
          }
        }
      }

      if (rightNode) {
        edges.value.push({
          id: `e-${node.id}-${rightNode.id}`,
          source: node.id,
          target: rightNode.id,
          type: "smoothstep",
          sourceHandle: "right",
          targetHandle: "top",
        });

        // Encontrar el botón add para el nodo derecho
        const rightAdd = nodes.value.find(
          (n) =>
            n.type === "add" &&
            Math.abs(n.position.y - rightNode.position.y - 80) < 10 &&
            Math.abs(n.position.x - (centerX + 208)) < 10
        );

        if (rightAdd) {
          edges.value.push({
            id: `e-${rightNode.id}-${rightAdd.id}`,
            source: rightNode.id,
            target: rightAdd.id,
            type: "straight",
            sourceHandle: "bottom",
            targetHandle: "top",
          });

          // Encontrar y conectar con el nodo fin derecho
          const rightEnd = nodes.value.find(
            (n) =>
              n.type === "end" &&
              Math.abs(n.position.y - rightAdd.position.y - 80) < 10 &&
              Math.abs(n.position.x - (centerX + 150)) < 10
          );

          if (rightEnd) {
            edges.value.push({
              id: `e-${rightAdd.id}-${rightEnd.id}`,
              source: rightAdd.id,
              target: rightEnd.id,
              type: "straight",
              sourceHandle: "bottom",
              targetHandle: "top",
            });
          }
        }
      }
    } else if (node.type !== "end" && node.type !== "branch-child") {
      // Encontrar siguiente nodo en la misma columna
      const nextNode = nodes.value.find(
        (n) =>
          n.position.y > node.position.y &&
          Math.abs(n.position.x - node.position.x) < 10
      );

      if (nextNode) {
        edges.value.push({
          id: `e-${node.id}-${nextNode.id}`,
          source: node.id,
          target: nextNode.id,
          type: "straight",
          sourceHandle: "bottom",
          targetHandle: "top",
        });
      }
    }
  });
}
rebuildEdges();

// Sidebar
const sidebarOpen = ref(false);
const editingNode = ref(null); // nodo que estamos editando
const editingLabel = ref(""); // etiqueta del input
const branchLeftLabel = ref(""); // etiqueta rama izquierda
const branchRightLabel = ref(""); // etiqueta rama derecha

function closeSidebar() {
  sidebarOpen.value = false;
  editingNode.value = null;
  editingLabel.value = "";
  branchLeftLabel.value = "";
  branchRightLabel.value = "";
}

// Maneja clicks en nodos
function onNodeClick({ node }) {
  if (node.type === "add") {
    // modo Agregar
    editingNode.value = node;
    sidebarOpen.value = true;
  } else if (node.type === "simple-step") {
    // modo Editar
    editingNode.value = node;
    editingLabel.value = node.data.label || "";
    sidebarOpen.value = true;
  } else if (node.type === "branch") {
    // modo Editar rama
    editingNode.value = node;
    editingLabel.value = node.data.label || "";

    // Buscar nodos hijos (izquierda y derecha)
    const leftNode = nodes.value.find(
      (n) =>
        Math.abs(n.position.y - node.position.y - 100) < 10 &&
        Math.abs(n.position.x - (node.position.x - 150)) < 10
    );
    const rightNode = nodes.value.find(
      (n) =>
        Math.abs(n.position.y - node.position.y - 100) < 10 &&
        Math.abs(n.position.x - (node.position.x + 150)) < 10
    );

    branchLeftLabel.value = leftNode?.data.label || "";
    branchRightLabel.value = rightNode?.data.label || "";
    sidebarOpen.value = true;
  }
}

// Agregar un nuevo simple-step
function addSimpleNode() {
  if (!editingNode.value) return;

  const clickedY = editingNode.value.position.y;
  const simpleId = `simple-${Date.now()}`;
  const newAddId = `add-${Date.now()}`;

  // Encontrar todos los nodos después del punto de inserción
  const nodesAfter = nodes.value.filter((n) => n.position.y > clickedY);

  // Mover todos los nodos posteriores hacia abajo
  nodesAfter.forEach((node) => {
    node.position.y += 120;
  });

  // Insertar nuevo paso y botón add
  nodes.value.push(
    {
      id: simpleId,
      type: "simple-step",
      position: { x: centerX - 15, y: clickedY + 60 },
      data: { label: "Paso simple" },
    },
    {
      id: newAddId,
      type: "add",
      position: { x: centerX + 58, y: clickedY + 120 },
    }
  );

  rebuildEdges();
  sidebarOpen.value = false;
}

// Agregar un nuevo nodo rama
function addBranchNode() {
  if (!editingNode.value) return;

  const clickedY = editingNode.value.position.y;
  const branchId = `branch-${Date.now()}`;
  const leftId = `simple-left-${Date.now()}`;
  const rightId = `simple-right-${Date.now()}`;
  const leftAddId = `add-left-${Date.now()}`;
  const rightAddId = `add-right-${Date.now()}`;
  const leftEndId = `end-left-${Date.now()}`;
  const rightEndId = `end-right-${Date.now()}`;

  // Eliminar el nodo fin original
  const endNodeIndex = nodes.value.findIndex((n) => n.id === "end");
  if (endNodeIndex !== -1) {
    nodes.value.splice(endNodeIndex, 1);
  }

  // Encontrar todos los nodos después del punto de inserción
  const nodesAfter = nodes.value.filter((n) => n.position.y > clickedY);

  // Mover todos los nodos posteriores hacia abajo
  nodesAfter.forEach((node) => {
    node.position.y += 320;
  });

  // Insertar nodo rama, nodos hijos y botones add
  nodes.value.push(
    {
      id: branchId,
      type: "branch",
      position: { x: centerX, y: clickedY + 60 },
      data: { label: "Bifurcación" },
    },
    {
      id: leftId,
      type: "branch-child",
      position: { x: centerX - 150, y: clickedY + 160 },
      data: { label: "Nombre de rama" },
    },
    {
      id: rightId,
      type: "branch-child",
      position: { x: centerX + 150, y: clickedY + 160 },
      data: { label: "Nombre de rama" },
    },
    {
      id: leftAddId,
      type: "add",
      position: { x: centerX - 92, y: clickedY + 240 },
    },
    {
      id: rightAddId,
      type: "add",
      position: { x: centerX + 208, y: clickedY + 240 },
    },
    {
      id: leftEndId,
      type: "end",
      position: { x: centerX - 150, y: clickedY + 320 },
      data: { label: "Fin" },
    },
    {
      id: rightEndId,
      type: "end",
      position: { x: centerX + 150, y: clickedY + 320 },
      data: { label: "Fin" },
    }
  );

  rebuildEdges();
  sidebarOpen.value = false;
}

// Guardar edición de nombre
function saveEdit() {
  if (editingNode.value) {
    if (editingNode.value.type === "branch") {
      // Actualizar etiqueta del nodo rama
      editingNode.value.data.label = editingLabel.value;
      updateNodeInternals(editingNode.value.id);

      // Actualizar etiquetas de los nodos hijos
      const leftNode = nodes.value.find(
        (n) =>
          Math.abs(n.position.y - editingNode.value.position.y - 100) < 10 &&
          Math.abs(n.position.x - (editingNode.value.position.x - 150)) < 10
      );
      const rightNode = nodes.value.find(
        (n) =>
          Math.abs(n.position.y - editingNode.value.position.y - 100) < 10 &&
          Math.abs(n.position.x - (editingNode.value.position.x + 150)) < 10
      );

      if (leftNode) {
        leftNode.data.label = branchLeftLabel.value;
        updateNodeInternals(leftNode.id);
      }
      if (rightNode) {
        rightNode.data.label = branchRightLabel.value;
        updateNodeInternals(rightNode.id);
      }
    } else {
      // Actualizar etiqueta de nodo simple
      editingNode.value.data.label = editingLabel.value;
      updateNodeInternals(editingNode.value.id);
    }
  }
  closeSidebar();
}

// Eliminar nodo
function deleteNode() {
  if (
    !editingNode.value ||
    editingNode.value.type === "start" ||
    editingNode.value.type === "end"
  )
    return;

  // Encontrar el nodo anterior y siguiente
  const currentY = editingNode.value.position.y;
  const prevNode = nodes.value.find(
    (n) =>
      n.position.y < currentY &&
      Math.abs(n.position.x - editingNode.value.position.x) < 10
  );
  const nextNode = nodes.value.find(
    (n) =>
      n.position.y > currentY &&
      Math.abs(n.position.x - editingNode.value.position.x) < 10
  );

  // Eliminar el nodo actual
  nodes.value = nodes.value.filter((n) => n.id !== editingNode.value.id);

  // Ajustar posiciones de los nodos siguientes
  const nodesAfter = nodes.value.filter((n) => n.position.y > currentY);
  nodesAfter.forEach((node) => {
    node.position.y -= 120;
  });

  rebuildEdges();
  closeSidebar();
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
  background-image: radial-gradient(#bbb 1px, transparent 1px);
  background-size: 20px 20px;
}
</style>
