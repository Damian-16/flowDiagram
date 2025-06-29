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
        <q-btn flat round icon="close" @click="sidebarOpen = false" />
      </q-toolbar>
      <q-list>
        <q-item clickable @click="addSimpleNode">
          <q-item-section avatar>
            <q-icon name="insert_drive_file" color="green" />
          </q-item-section>
          <q-item-section>Paso simple</q-item-section>
        </q-item>
      </q-list>
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
  QBtn, QIcon
} from 'quasar'

const centerX = 80

const nodes = ref([
  { id: 'start', type: 'start', position: { x: centerX, y:   0 }, data: { label: 'Inicio' } },
  { id: 'add-0', type: 'add',   position: { x: 138, y:  80 } },
  { id: 'end',   type: 'end',   position: { x: centerX, y: 160 }, data: { label: 'Fin' } },
])

const edges = ref([])

const nodeTypes = {
  add:        AddNode,
  'simple-step': NodeSimpleStep,
}

function rebuildEdges() {
  const ordered = [...nodes.value].sort((a,b)=> a.position.y - b.position.y)
  edges.value = ordered.slice(0, -1).map((src, i) => ({
    id:     `e-${src.id}-${ordered[i+1].id}`,
    source: src.id,
    target: ordered[i+1].id,
    type:   'straight',
    sourceHandle: 'bottom',
    targetHandle: 'top'
  }))
}

rebuildEdges()

const sidebarOpen = ref(false)

function onNodeClick({ node }) {
  if (node?.type === 'add') {
    sidebarOpen.value = true
  }
}

function addSimpleNode() {
  const lastAdd = nodes.value.filter(n=>n.type==='add').pop()
  if (!lastAdd) return

  const y0 = lastAdd.position.y
  const simpleId = `simple-${Date.now()}`
  const newAddId = `add-${Date.now()}`

  // elimina el último nodo "add"
  nodes.value = nodes.value.filter(n => n.id !== lastAdd.id)

  // desplaza "Fin" hacia abajo
  const endNode = nodes.value.find(n=>n.id==='end')
  if (endNode) endNode.position = { x: 80, y: y0 + 180 }

  // inserta "Paso simple" y un nuevo "add", centrados en X
  nodes.value.push(
    { id: simpleId,    type: 'simple-step', position: { x: 65, y: y0 +  60 }, data: {} },
    { id: newAddId,    type: 'add',         position: { x: 138, y: y0 + 120 }        }
  )

  rebuildEdges()
  sidebarOpen.value = false
}
</script>

<style scoped lang="scss">
.flow-board {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
}
.flow-bg {
  background-color: #f4f4f4;
  cursor: grab;
  background-image: radial-gradient(#bbb 1px, transparent 1px);
  background-size: 20px 20px;
}
</style>
