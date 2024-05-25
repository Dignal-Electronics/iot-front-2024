<template>
  <v-app>
    <router-view />

    <v-overlay v-model="loader.getIsActive" class="align-center justify-center">
      <v-progress-circular color="primary" indeterminate model-value="20" :size="100" :width="8"></v-progress-circular>
    </v-overlay>
  </v-app>
</template>

<script setup>
import { useLoaderStore } from '@/stores/loader';

const loader = useLoaderStore();
</script>
