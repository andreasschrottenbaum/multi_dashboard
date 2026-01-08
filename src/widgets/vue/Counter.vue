<template>
  <div class="vue-counter">
    <div class="counter-display">{{ count }}</div>
    <div class="counter-buttons">
      <button class="counter-btn" @click="count--">−</button>
      <button class="counter-btn" @click="count++">+</button>
      <button class="counter-btn reset" @click="count = 0">Reset</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const count = ref<number>(0)
</script>

<style scoped>
.vue-counter {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
