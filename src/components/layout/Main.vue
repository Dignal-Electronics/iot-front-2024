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
      <!-- primary, secondary, accent -->
      <!-- success: verde, error: rojo, warning: amarillo, info: azul -->
      <v-badge
        v-if="route.params.key"
        color="purple"
        :content="newNotifications"
        offset-y="10"
        offset-x="10"
      >
        <v-btn
          class="ms-5"
          icon="mdi-bell"
          @click="openNotificationDialog()"
        ></v-btn>
      </v-badge>

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
    <v-container fluid>
      <router-view></router-view>
    </v-container>
  </v-main>

  <v-dialog v-model="showNotificationsDialog" width="70%" v-if="route.params.key">
    <v-card title="Notificaciones" height="650" class="overflow-y-hidden">
      <v-card-text class="overflow-x-auto">
        <v-row>
          <v-col class="px-10">
            <v-alert
              v-for="(text, index) in openaiResponse"
              :key="index"
              border="start"
              color="cyan"
              icon="mdi-auto-fix"
              density="compact"
              variant="outlined"
              class="mb-4"
              prominent
            >
              <span
                :class="colorMode == 'darkMode' ? 'text-white' : 'text-grey-darken-3'"
                class="font-weight-medium"
              >Generado: {{ new Date(text.date).toLocaleTimeString() }} - {{ new Date(text.date).toLocaleDateString() }}</span>
              <p v-html="text.text"></p>
            </v-alert>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions>
        <v-row>
          <v-col class="text-center">
            <v-btn class="my-3" @click="showNotificationsDialog = false">Cerrar</v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-snackbar
    v-if="route.params.key"
    v-model="showSnackbar"
    color="success"
    :timeout="10000"
  >Nueva notificación de OpenAI</v-snackbar>
</template>

<script setup>
import { ref, onMounted, onBeforeMount } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import { useRoute } from 'vue-router';
import { io } from 'socket.io-client';
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

const drawer = ref(true);
const settingsStore = useSettingsStore();
const route = useRoute();

onMounted(() => {
  socket.connect();

  if (undefined !== localStorage.theme) {
    colorMode.value = localStorage.theme
  }

  user.value = JSON.parse(localStorage.user)

  if (route.params.key) {
    console.log('dispositivo - openai: ', route.params.key);
    
    socket.emit('openai', route.params.key);
  }

  socket.on('openaiResponse', ({date, text}) => {
    console.log(`openAI: ${text}`);
    
    newNotifications.value++;
    // newNotifications.value = newNotifications.value + 1;
    // newNotifications.value += 1;

    openaiResponse.value.unshift({date: date, text: marked.parse(text)});
    showSnackbar.value = true;
  });
});

const socket = io(`${import.meta.env.VITE_HOST}:${import.meta.env.VITE_WEBSOCKET_PORT}`, {
  autoConnect: false
});

const showNotificationsDialog = ref(false)
const openaiResponse = ref([]);
const openNotificationDialog = () => {
  showNotificationsDialog.value = true;
  newNotifications.value = 0;
    
  // En caso de desear que las peticiones se realicen cuando se abre el modal
  // se debe agregar en este punto el envio de datos al socket de openai
  // y comentar el if dentro del mounted 
  // socket.emit('openai', route.params.key);
}
const showSnackbar = ref(false);
const newNotifications = ref(0);

const user = ref(null)
const colorMode = ref('lightMode')
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location = "/login";
}
</script>
