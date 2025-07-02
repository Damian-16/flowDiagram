<template>
  <q-drawer
    v-model:model-value="sidebarOpenLocal"
    side="right"
    :width="460"
    :breakpoint="0"
    overlay
  >
    <q-toolbar>
      <q-toolbar-title>{{ title }}</q-toolbar-title>
      <q-btn flat round icon="close" @click="emit('update:sidebarOpen', false)" />
    </q-toolbar>

    <q-list v-if="editingNode?.type === 'add'">
      <q-item clickable  @click="() => { console.log(' emite add-simple'); emit('add-simple') }">
        <q-item-section avatar>
          <q-icon class="node-icon" style="--icon-bg: #90ee9033" name="description" />
        </q-item-section>
        <q-item-section>Paso simple</q-item-section>
      </q-item>
      <q-item clickable @click="emit('add-branch')">
        <q-item-section avatar>
          <q-icon class="node-icon" style="--icon-bg: #ffcc8033" name="device_hub" />
        </q-item-section>
        <q-item-section>Paso rama</q-item-section>
      </q-item>
      <q-item clickable @click="emit('add-goto')">
        <q-item-section avatar>
          <q-icon class="node-icon" style="--icon-bg: #b39ddb33" name="route" />
        </q-item-section>
        <q-item-section>Paso ir a</q-item-section>
      </q-item>
    </q-list>

    <div v-else-if="editingNode && editingNode.type !== 'add'" class="q-pa-md">
      <template v-if="editingNode.type === 'branch'">
        <q-input
          v-model="editingLabelLocal"
          label="Nombre del paso branch"
          dense
          autofocus
          class="q-mb-sm"
          outlined
        />
        <q-input
          v-model="branchLeftLabelLocal"
          label="Nombre rama izquierda"
          dense
          class="q-mb-sm"
          outlined
        />
        <q-input
          v-model="branchRightLabelLocal"
          label="Nombre rama derecha"
          dense
          outlined
        />
      </template>
      <template v-else>
        <q-input
          v-model="editingLabelLocal"
          label="Nombre del paso"
          dense
          autofocus
          outlined
        />
      </template>
      <div class="q-mt-md row justify-end">
        <q-btn color="negative" flat label="Eliminar" @click="emit('delete-node')" />
        <q-btn flat label="Cancelar"  @click="emit('update:sidebarOpen', false)" class="q-mr-sm" />
        <q-btn color="primary" label="Confirmar"  @click="() => { emit('save-edit');  }"/>
      </div>
    </div>
  </q-drawer>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue';
import type { Node as FlowNode } from '@vue-flow/core';
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
} from 'quasar';

const props = defineProps<{
  sidebarOpen: boolean;
  editingNode: FlowNode | null;
  editingLabel: string;
  branchLeftLabel: string;
  branchRightLabel: string;
}>();

const emit = defineEmits<{
  (e: 'update:sidebarOpen', val: boolean): void;
  (e: 'update:editingLabel', val: string): void;
  (e: 'update:branchLeftLabel', val: string): void;
  (e: 'update:branchRightLabel', val: string): void;
  (e: 'add-simple'): void;
  (e: 'add-branch'): void;
  (e: 'add-goto'): void;
  (e: 'save-edit'): void;
  (e: 'delete-node'): void;
}>();


const sidebarOpenLocal = computed({
  get:  () => props.sidebarOpen,
  set: (v: boolean) => emit('update:sidebarOpen', v),
});
const editingLabelLocal = computed({
  get:  () => props.editingLabel,
  set: (v: string) => emit('update:editingLabel', v),
});
const branchLeftLabelLocal = computed({
  get:  () => props.branchLeftLabel,
  set: (v: string) => emit('update:branchLeftLabel', v),
});
const branchRightLabelLocal = computed({
  get:  () => props.branchRightLabel,
  set: (v: string) => emit('update:branchRightLabel', v),
});


const title = computed(() => {
  const t = props.editingNode?.type;
  if (t === 'branch')      return 'Paso Branch';
  if (t === 'simple-step') return 'Paso simple';
  return 'Agregar Paso';
});
</script>


<style scoped lang="scss">
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

<style scoped lang="scss">
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
