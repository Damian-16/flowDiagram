<template>
  <div class="flow-board q-pa-md" style="height: 100vh; width: 100vw">
    <VueFlow
      v-model="elements"
      :default-viewport="{ zoom: 1, x: 0, y: 0 }"
      :nodes-draggable="false"
      :nodes-connectable="false"
      :elements-selectable="false"
      :zoom-on-scroll="true"
      :pan-on-drag="true"
      class="flow-bg"
      fit-view
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { VueFlow } from "@vue-flow/core";

const elements = ref([]); // tablero vacío por ahora
</script>

<style scoped lang="scss">
.flow-bg {
  background-color: $board-color;
  cursor: grab !important;
  background-image: radial-gradient(#bbb 1px, transparent 1px);
  background-size: 20px 20px;
  height: 100vh;
  width: 100vw;
  padding: 0px !important;
  margin: 0px !important
}
</style>
