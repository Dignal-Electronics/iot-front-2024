<template>
  <v-row>
    <v-col cols="12" align="center">
      <template v-if="'darkMode' == colorTheme">
        <img src="@/assets/logo_dark.png" width="400" class="mt-10" alt="Dignal">
      </template>
      <template v-else>
        <img src="@/assets/logo_light.png" width="400" class="mt-10" alt="Dignal">
      </template>
      <v-card class="elevation-12" max-width="600px">
        <v-card-title>Acceso</v-card-title>
        <v-form @submit.prevent="login">
          <v-card-text class="py-10 px-8">
            <v-text-field v-model="form.username" label="Usuario" variant="outlined"></v-text-field>
            <v-text-field v-model="form.password" label="Contraseña" type="password"></v-text-field>
          </v-card-text>
          <v-card-actions class="d-flex justify-center">
            <v-btn type="submit" :disabled="submit" class="px-4" variant="flat">Entrar</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import useUtils from '@/composables/useUtils'
import { useApiStore } from "@/stores/api"
import { useLoaderStore } from '@/stores/loader';

const loader = useLoaderStore();
const storeApi = useApiStore()
const submit = ref(false)
const colorTheme = ref('lightMode')
const form = ref({
  username: null,
  password: null
})
const { sendRequest, showSuccessMessage } = useUtils()

onMounted(() => {
  if (localStorage.theme && 'darkMode' === localStorage.theme) {
    colorTheme.value = 'darkMode'
  }
})


const login = async () => {
  loader.setIsActive(true);
  submit.value = true;
  const loginURL = `${storeApi.getApiUrl}login`;
  const loginParams = form.value;
  const loginRequest = await sendRequest(
    loginURL,
    loginParams,
    "POST"
  );

  if (loginRequest.success) {
    const { message, data } = loginRequest;
    showSuccessMessage(message);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setTimeout(() => {
      window.location = "/";
    }, 2000);
  } else {
    submit.value = false;
  }
  loader.setIsActive(false);
}
</script>
