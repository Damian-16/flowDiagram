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
        <q-toolbar-title>
          {{ editingNode ? 'Editar Paso' : 'Agregar Nodo' }}
        </q-toolbar-title>
        <q-btn flat round icon="close" @click="closeSidebar" />
      </q-toolbar>

      <q-list v-if="!editingNode">
        <q-item clickable @click="addSimpleNode">
          <q-item-section avatar>
            <q-icon name="insert_drive_file" color="green" />
          </q-item-section>
          <q-item-section>Paso simple</q-item-section>
        </q-item>
      </q-list>

      <div v-else class="q-pa-md">
        <q-input
          v-model="editingLabel"
          label="Nombre del paso"
          dense
          autofocus
        />
        <div class="q-mt-md row justify-end">
          <q-btn flat label="Cancelar" @click="closeSidebar" />
          <q-btn color="primary" label="Guardar" @click="saveEdit" />
        </div>
      </div>
    </q-drawer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { VueFlow } from '@vue-flow/core'
import NodeSimpleStep from '../NodeSimple/NodeSimpleStep.vue'
import AddNode         from '../AddNode/AddNode.vue'
import {
  QDrawer, QToolbar, QToolbarTitle,
  QList, QItem, QItemSection,
  QBtn, QIcon, QInput
} from 'quasar'
import { useVueFlow } from '@vue-flow/core'
// Constantes y estado inicial
const centerX = 80
const { updateNodeInternals } = useVueFlow()

const nodes = ref([
  { id: 'start', type: 'start', position: { x: centerX, y: 0 }, data: { label: 'Inicio' } },
  { id: 'add-0', type: 'add', position: { x: 138, y: 80 } },
  { id: 'end',   type: 'end', position: { x: centerX, y: 160 }, data: { label: 'Fin' } },
])

const edges = ref([])

const nodeTypes = {
  add: AddNode,
  'simple-step': NodeSimpleStep,
}

// Reconstruye las edges
function rebuildEdges() {
  const ordered = [...nodes.value].sort((a,b)=> a.position.y - b.position.y)
  edges.value = ordered.slice(0, -1).map((src, i) => ({
    id: `e-${src.id}-${ordered[i+1].id}`,
    source: src.id,
    target: ordered[i+1].id,
    type: 'straight',
    sourceHandle: 'bottom',
    targetHandle: 'top'
  }))
}
rebuildEdges()

// Sidebar
const sidebarOpen   = ref(false)
const editingNode   = ref(null)      // nodo que estamos editando
const editingLabel  = ref('')        // etiqueta del input

function closeSidebar() {
  sidebarOpen.value = false
  editingNode.value = null
  editingLabel.value = ''
}

// Maneja clicks en nodos
function onNodeClick({ node }) {
  if (node.type === 'add') {
    // modo Agregar
    editingNode.value = null
    sidebarOpen.value = true
  }
  else if (node.type === 'simple-step') {
    // modo Editar
    editingNode.value = node
    editingLabel.value = node.data.label || ''
    sidebarOpen.value = true
  }
}

// Agregar un nuevo simple-step
function addSimpleNode() {
  const lastAdd = nodes.value.filter(n => n.type === 'add').pop()
  if (!lastAdd) return

  const y0 = lastAdd.position.y
  const simpleId = `simple-${Date.now()}`
  const newAddId = `add-${Date.now()}`

  // Mover 'Fin'
  const endNode = nodes.value.find(n => n.id === 'end')
  if (endNode) {
    endNode.position = { x: centerX, y: y0 + 180 }
  }

  // Insertar paso y siguiente '+'
  nodes.value.push(
    {
      id: simpleId,
      type: 'simple-step',
      position: { x: 65, y: y0 + 60 },
      data: { label: 'Paso simple' }
    },
    {
      id: newAddId,
      type: 'add',
      position: { x: 138, y: y0 + 120 }
    }
  )

  rebuildEdges()
  sidebarOpen.value = false
}

// Guardar edición de nombre
function saveEdit() {
  if (editingNode.value) {
    // 1) actualizo la etiqueta
    editingNode.value.data.label = editingLabel.value

    // 2) le digo a VueFlow que re‐internalice este nodo
    updateNodeInternals(editingNode.value.id)
  }
  closeSidebar()
}
</script>

<style scoped lang="scss">
.flow-board {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
}
.flow-bg {
  background-color: #f4f4f4;
  background-image: radial-gradient(#bbb 1px, transparent 1px);
  background-size: 20px 20px;
}
</style>
