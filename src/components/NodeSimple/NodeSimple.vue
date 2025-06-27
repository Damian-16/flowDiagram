
<template>
  <q-card class="node-card" :class="typeClass">
    <q-card-section>
      {{ data.label }}
    </q-card-section>
    <q-card-actions align="right">
      <q-btn flat label="Confirmar" />
      <q-btn flat label="Cancelar" />
      <q-btn flat label="Eliminar" color="negative" />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { defineProps, computed } from 'vue'
import { QCard, QCardSection, QCardActions, QBtn } from 'quasar'

const props = defineProps({
  data: { type: Object, required: true },
  type: { type: String, required: true }
})

const typeClass = computed(() => {
  switch (props.type) {
    case 'start': return 'node-start'
    case 'end':   return 'node-end'
    default:      return ''
  }
})
</script>

<style lang="scss" scoped>
.node-card {
  width: 180px;
  min-height: 80px;
  border-radius: 8px;
}


.node-start {
  background-color: #4caf50; 
  color: #ffffff;
}


.node-end {
  background-color: #9e9e9e; 
  color: #ffffff;
}
</style>
