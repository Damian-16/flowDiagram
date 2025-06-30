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
          {{ editingNode ? 'Editar Paso' : 'Agregar Nodo' }}
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
      </q-list>

      <div v-if="editingNode && editingNode.type !== 'add'" class="q-pa-md">
        <q-input
          v-model="editingLabel"
          label="Nombre del paso"
          dense
          autofocus
        />
        <div class="q-mt-md row justify-between">
              <q-btn color="negative" icon="delete" label="Eliminar" @click="deleteNode" />
            <q-btn flat label="Cancelar" @click="closeSidebar" class="q-mr-sm" />
            <q-btn color="primary" label="Guardar" @click="saveEdit" />
          <div>
        
          </div>
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
    editingNode.value = node
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
  if (!editingNode.value) return

  const clickedY = editingNode.value.position.y
  const simpleId = `simple-${Date.now()}`
  const newAddId = `add-${Date.now()}`

  // Encontrar todos los nodos después del punto de inserción
  const nodesAfter = nodes.value.filter(n => n.position.y > clickedY)

  // Mover todos los nodos posteriores hacia abajo
  nodesAfter.forEach(node => {
    node.position.y += 120
  })

  // Insertar nuevo paso y botón add
  nodes.value.push(
    {
      id: simpleId,
      type: 'simple-step',
      position: { x: 65, y: clickedY + 60 },
      data: { label: 'Paso simple' }
    },
    {
      id: newAddId,
      type: 'add',
      position: { x: 138, y: clickedY + 120 }
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

// Eliminar nodo
function deleteNode() {
  if (!editingNode.value || editingNode.value.type === 'start' || editingNode.value.type === 'end') return

  // Encontrar el nodo anterior y siguiente
  const currentY = editingNode.value.position.y
  const prevNode = nodes.value.find(n => 
    n.position.y < currentY && 
    Math.abs(n.position.x - editingNode.value.position.x) < 10
  )
  const nextNode = nodes.value.find(n => 
    n.position.y > currentY && 
    Math.abs(n.position.x - editingNode.value.position.x) < 10
  )

  // Eliminar el nodo actual
  nodes.value = nodes.value.filter(n => n.id !== editingNode.value.id)

  // Ajustar posiciones de los nodos siguientes
  const nodesAfter = nodes.value.filter(n => n.position.y > currentY)
  nodesAfter.forEach(node => {
    node.position.y -= 120
  })

  rebuildEdges()
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
