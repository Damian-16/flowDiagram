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
      :pan-on-drag="false"
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
          {{  editingNode?.type === 'branch' ? "Paso Branch":editingNode?.type === 'simple-step' ? "Paso simple": "Agregar Paso" }}
        </q-toolbar-title>
        <q-btn flat round icon="close" @click="closeSidebar" />
      </q-toolbar>

      <q-list v-if="editingNode?.type === 'add'">
        <q-item clickable @click="addSimpleNode">
          <q-item-section avatar>
            <q-icon
              class="node-icon"
              style="--icon-bg: #90ee9033"
              name="description"
              color="green"
            />
          </q-item-section>
          <q-item-section>Paso simple</q-item-section>
        </q-item>
        <q-item clickable @click="addBranchNode">
          <q-item-section avatar>
            <q-icon
              class="node-icon"
              style="--icon-bg: #ffcc8033"
              name="device_hub"
              color="orange"
            />
          </q-item-section>
          <q-item-section>Paso rama</q-item-section>
        </q-item>
        <q-item clickable @click="addGotoNode">
          <q-item-section avatar>
            <q-icon
              name="route"
              style="--icon-bg: #b39ddb33"
              class="node-icon"
            />
          </q-item-section>
          <q-item-section>Paso ir a</q-item-section>
        </q-item>
      </q-list>

      <div v-if="editingNode && editingNode.type !== 'add'" class="q-pa-md">
        <template v-if="editingNode.type === 'branch'">
          <q-input
            v-model="editingLabel"
            label="Nombre de el paso branch"
            dense
            autofocus
            class="q-mb-sm"
            outlined
          />
          <q-input
            v-model="branchLeftLabel"
            label="Nombre rama izquierda"
            dense
            class="q-mb-sm"
            outlined
          />
          <q-input
            v-model="branchRightLabel"
            label="Nombre rama derecha"
            dense
            outlined
          />
        </template>
        <template v-else>
          <q-input
            v-model="editingLabel"
            label="Nombre del paso"
            dense
            autofocus
            outlined
          />
        </template>
        <div class="q-mt-md row justify-end">
          <q-btn
            color="negative"
            flat
            label="Eliminar"
            @click="deleteNode"
          />
          <q-btn flat label="Cancelar" @click="closeSidebar" class="q-mr-sm" />
          <q-btn color="primary" label="Confirmar" @click="saveEdit" />
          <div></div>
        </div>
      </div>
    </q-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { VueFlow, useVueFlow } from "@vue-flow/core";
import AddNode from "../AddNode/AddNode.vue";
import NodeSimpleStep from "../Nodes/NodeSimple/NodeSimpleStep.vue";
import NodeBranch from "../Nodes/NodeBranch/NodeBranch.vue";
import NodeBranchChild from "../Nodes/NodeBranch/NodeBranchChild.vue";
import NodeGoto from "../Nodes/NodeGoto/NodeGoto.vue";

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

// Constantes y estado inicial
const centerX = 550;
const { updateNodeInternals } = useVueFlow();
const lastEndPosition = ref(null);

const nodes = ref([
  {
    id: "start",
    type: "start",
    position: { x: centerX, y: 100 },
    data: { label: "Inicio" },
  },
  { id: "add-0", type: "add", position: { x: centerX + 58, y: 180 } },
  {
    id: "end",
    type: "end",
    position: { x: centerX, y: 260 },
    data: { label: "Fin" },
  },
]);

const edges = ref([]);

const nodeTypes = {
  add: AddNode,
  "simple-step": NodeSimpleStep,
  branch: NodeBranch,
  "branch-child": NodeBranchChild,
  goto: NodeGoto,
};

// Estado del modo goto
const gotoMode = reactive({
  active: false,
  sourceNodeId: null,
  availableTargets: [],
});

// Computed para nodos disponibles como objetivo
const availableTargetNodes = computed(() => {
  if (!gotoMode.active) return [];
  return nodes.value.filter(
    (node) =>
      ["simple-step", "branch"].includes(node.type) &&
      node.position.y < gotoMode.sourceY
  );
});

// Reconstruye las edges
function rebuildEdges() {
  edges.value = [];

  nodes.value.forEach((node) => {
    if (node.type === "add") {
      // buscamos el goto justo debajo
      const gotoChild = nodes.value.find(
        (n) =>
          n.type === "goto" &&
          n.position.x === node.position.x &&
          Math.abs(n.position.y - node.position.y - 60) < 10
      );
      if (gotoChild) {
        edges.value.push({
          id: `e-${node.id}-${gotoChild.id}`,
          source: node.id,
          target: gotoChild.id,
          type: "straight",
          sourceHandle: "bottom",
          targetHandle: "top",
        });
      }
      return; // salimos para no caer en el genérico
    }
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
            Math.abs(n.position.x - leftNode.position.x) < 10
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
              n.position.x === leftNode.position.x
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
            Math.abs(n.position.x - rightNode.position.x) < 10
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
              n.position.x === rightNode.position.x
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
    } else if (node.type !== "end") {
      // Encontrar siguiente nodo en la misma columna
      const nextNode = nodes.value.find(
        (n) =>
          n.position.y > node.position.y && n.position.x === node.position.x
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
  // Si estamos en modo GoTo y clicamos UN PADRE
  if (gotoMode.active && availableTargetNodes.value.includes(node)) {
    // 1) Parar pulso en todos los nodos objetivo
    availableTargetNodes.value.forEach((targetNode) => {
      targetNode.data.pulsing = false;
      updateNodeInternals(targetNode.id);
    });

    // 2) Poner icono del nodo clickeado en el goto
    const gotoNode = nodes.value.find((n) => n.id === gotoMode.sourceNodeId);
    if (gotoNode) {
      // Asignar el ícono del nodo clickeado
      if (node.type === "simple-step") {
        gotoNode.data.icon = "description";
      } else if (node.type === "branch") {
        gotoNode.data.icon = "device_hub";
      }
      updateNodeInternals(gotoMode.sourceNodeId);

      // 3) Dibujar arista dashed animada goto→nodo clickeado
      edges.value.push({
        id: `e-${gotoMode.sourceNodeId}-${node.id}`,
        source: gotoMode.sourceNodeId,
        target: node.id,
        type: "straight",
        sourceHandle: "bottom",
        targetHandle: "top",
        style: {
          strokeWidth: 2,
          stroke: "#2196f3",
          strokeDasharray: "10 10",
          animation: "flowDash 0.5s linear infinite",
        },
      });
    }

    // 4) Limpiar modo GoTo
    gotoMode.active = false;
    gotoMode.sourceNodeId = null;
    gotoMode.sourceY = null;
    return;
  }
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
  const parentX = editingNode.value.position.x - 73; // 🔥 la X del "+" que abriste

  // 1) Bajamos todos los nodos que vienen después
  nodes.value
    .filter((n) => n.position.y > clickedY)
    .forEach((n) => (n.position.y += 120));

  // 2) Generamos IDs
  const simpleId = `simple-${Date.now()}`;
  const newAddId = `add-${Date.now()}`;

  // 3) Insertamos el paso y el siguiente "+"
  nodes.value.push(
    {
      id: simpleId,
      type: "simple-step",
      position: { x: parentX, y: clickedY + 60 },
      data: { label: "Paso simple" },
    },
    {
      id: newAddId,
      type: "add",
      position: { x: parentX + 73, y: clickedY + 120 },
    }
  );

  rebuildEdges();
  sidebarOpen.value = false;
}

// Agregar un nuevo nodo rama

function addBranchNode() {
  if (!editingNode.value) return;

  const clickedY = editingNode.value.position.y;
  nodes.value = nodes.value.filter((n) => n.type !== "end");
  // 1) ¿Hay ya alguna bifurcación en el canvas?
  const hasBranch = nodes.value.some((n) => n.type === "branch");

  // 2) parentX = centerX solo la primera vez, luego offset relativo al add clicado
  const parentX = !hasBranch ? centerX : editingNode.value.position.x - 60;

  // Generamos los ids
  const branchId = `branch-${Date.now()}`;
  const leftId = `simple-left-${Date.now()}`;
  const rightId = `simple-right-${Date.now()}`;
  const leftAddId = `add-left-${Date.now()}`;
  const rightAddId = `add-right-${Date.now()}`;
  const leftEndId = `end-left-${Date.now()}`;
  const rightEndId = `end-right-${Date.now()}`;

  // Movemos todo lo que venga después hacia abajo
  const nodesAfter = nodes.value.filter((n) => n.position.y > clickedY);
  nodesAfter.forEach((n) => (n.position.y += 320));

  // Insertamos
  nodes.value.push(
    {
      id: branchId,
      type: "branch",
      position: { x: parentX, y: clickedY + 60 },
      data: { label: "Paso rama" },
    },
    {
      id: leftId,
      type: "branch-child",
      position: { x: parentX - 150, y: clickedY + 160 },
      data: { label: "Nombre de rama" },
    },
    {
      id: rightId,
      type: "branch-child",
      position: { x: parentX + 150, y: clickedY + 160 },
      data: { label: "Nombre de rama" },
    },
    {
      id: leftAddId,
      type: "add",
      position: { x: parentX - 92, y: clickedY + 240 },
    },
    {
      id: rightAddId,
      type: "add",
      position: { x: parentX + 208, y: clickedY + 240 },
    },
    {
      id: leftEndId,
      type: "end",
      position: { x: parentX - 150, y: clickedY + 320 },
      data: { label: "Fin" },
    },
    {
      id: rightEndId,
      type: "end",
      position: { x: parentX + 150, y: clickedY + 320 },
      data: { label: "Fin" },
    }
  );

  rebuildEdges();
  sidebarOpen.value = false;
}

const gotoState = reactive({
  currentId: null,
  parentIds: [],
});

function addGotoNode() {
  if (!editingNode.value) return;

  const { x, y } = editingNode.value.position;
  const gotoId = `goto-${Date.now()}`;

  // Crear nodo goto
  nodes.value.push({
    id: gotoId,
    type: "goto",
    position: { x, y: y + 60 },
    data: { icon: null },
  });

  // Activar modo goto
  gotoMode.active = true;
  gotoMode.sourceNodeId = gotoId;
  gotoMode.sourceY = y + 60;

  // Activar pulsación en nodos objetivo disponibles
  availableTargetNodes.value.forEach((node) => {
    node.data.pulsing = true;
    updateNodeInternals(node.id);
  });

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

  const currentY = editingNode.value.position.y;
  const nodesToDelete = [];

  if (editingNode.value.type === "branch") {
    // Encontrar nodos hijos de la rama
    const leftNode = nodes.value.find(
      (n) =>
        Math.abs(n.position.y - currentY - 100) < 10 &&
        Math.abs(n.position.x - (editingNode.value.position.x - 150)) < 10
    );
    const rightNode = nodes.value.find(
      (n) =>
        Math.abs(n.position.y - currentY - 100) < 10 &&
        Math.abs(n.position.x - (editingNode.value.position.x + 150)) < 10
    );

    // Encontrar botones add y nodos fin
    if (leftNode) {
      nodesToDelete.push(leftNode.id);
      const leftAdd = nodes.value.find(
        (n) =>
          n.type === "add" &&
          Math.abs(n.position.y - leftNode.position.y - 80) < 10 &&
          Math.abs(n.position.x - (centerX - 92)) < 10
      );
      if (leftAdd) nodesToDelete.push(leftAdd.id);

      const leftEnd = nodes.value.find(
        (n) =>
          n.type === "end" &&
          Math.abs(n.position.y - leftNode.position.y - 160) < 10 &&
          Math.abs(n.position.x - (centerX - 150)) < 10
      );
      if (leftEnd) nodesToDelete.push(leftEnd.id);
    }

    if (rightNode) {
      nodesToDelete.push(rightNode.id);
      const rightAdd = nodes.value.find(
        (n) =>
          n.type === "add" &&
          Math.abs(n.position.y - rightNode.position.y - 80) < 10 &&
          Math.abs(n.position.x - (centerX + 208)) < 10
      );
      if (rightAdd) nodesToDelete.push(rightAdd.id);

      const rightEnd = nodes.value.find(
        (n) =>
          n.type === "end" &&
          Math.abs(n.position.y - rightNode.position.y - 160) < 10 &&
          Math.abs(n.position.x - (centerX + 150)) < 10
      );
      if (rightEnd) nodesToDelete.push(rightEnd.id);
    }
  }

  // Agregar el nodo actual a la lista de eliminación
  nodesToDelete.push(editingNode.value.id);

  // Eliminar todos los nodos marcados
  nodes.value = nodes.value.filter((n) => !nodesToDelete.includes(n.id));

  // Si es una rama, restaurar el nodo fin original en su posición anterior
  if (editingNode.value.type === "branch" && lastEndPosition.value) {
    // Ajustar la posición Y del nodo fin para que esté por debajo del último nodo
    const lastNode = nodes.value.reduce((max, node) => {
      return node.position.y > max.position.y ? node : max;
    }, nodes.value[0]);

    const newEndPosition = {
      x: centerX,
      y: lastNode.position.y + (lastNode.type === "add" ? 80 : 120),
    };

    nodes.value.push({
      id: "end",
      type: "end",
      position: newEndPosition,
      data: { label: "Fin" },
    });
    lastEndPosition.value = null;
  }

  // Ajustar posiciones de los nodos siguientes
  const nodesAfter = nodes.value.filter((n) => n.position.y > currentY);
  const yOffset = editingNode.value.type === "branch" ? 320 : 120;
  nodesAfter.forEach((node) => {
    node.position.y -= yOffset;
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

@keyframes dash {
  from {
    stroke-dashoffset: 24;
  }
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes flowDash {
  to {
    stroke-dashoffset: -20;
  }
}

:deep(.vue-flow__node[data-id="start"]) {
  background-color: #a5d6a7;
  color: #f4f4f4;
}
:deep(.vue-flow__node[type="end"]) {
  background-color: #bbb;
  // color:#f4f4f4;
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
