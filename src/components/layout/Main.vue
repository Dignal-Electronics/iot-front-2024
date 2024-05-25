<template>
  <v-navigation-drawer app v-model="drawer">
    <v-list>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>{{ user.name ?? 'User' }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <v-divider />
    <v-list>
      <v-list-item :to="{ name: 'devices' }" prepend-icon="mdi-devices" title="Dispositivos"></v-list-item>
      <v-list-item :to="{ name: 'users' }" prepend-icon="mdi-account" title="Usuarios"
        v-if="1 == user.id"></v-list-item>
    </v-list>
  </v-navigation-drawer>

  <v-app-bar :elevation="2">
    <template v-slot:prepend>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
    </template>

    <v-spacer></v-spacer>

    <template v-if="'darkMode' == colorMode">
      <img src="@/assets/logo_dark.png" width="200" alt="Logotipo">
    </template>
    <template v-else>
      <img src="@/assets/logo_light.png" width="200" alt="Logotipo">
    </template>

    <v-spacer></v-spacer>

    <template v-slot:append>
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn icon="mdi-dots-vertical" v-bind="props"></v-btn>
        </template>
        <v-list>
          <v-list-item value="logout">
            <v-list-item-title @click="logout()">Cerrar sesión</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>

    <v-switch v-model="colorMode" color="primary" :label="'darkMode' == colorMode" true-value="darkMode"
      true-icon="mdi-weather-night" false-value="lightMode" false-icon="mdi-weather-sunny" hide-detailsv
      @change="settingsStore.setColorMode(colorMode)"></v-switch>
  </v-app-bar>

  <v-main>
    <v-container>
      <router-view></router-view>
    </v-container>
  </v-main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useSettingsStore } from '@/stores/settings';

const drawer = ref(true)
const settingsStore = useSettingsStore();

onMounted(() => {
  if (undefined !== localStorage.theme) {
    colorMode.value = localStorage.theme
  }

  user.value = JSON.parse(localStorage.user)
})

const user = ref(null)
const colorMode = ref('lightMode')
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location = "/login";
}
</script>
