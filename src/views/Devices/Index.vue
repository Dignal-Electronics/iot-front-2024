<template>
  <v-row>
    <v-col cols="12">
      <v-card>
        <v-card-title>
          <h3>Dispositivos</h3>
        </v-card-title>
        <v-card-text>
          <v-data-table :headers="headers" :items="devices">
            <template v-slot:item.active="{ item }">
              <v-chip class="ma-2" color="success" v-if="item.active">
                <v-icon icon="mdi-check" start></v-icon>
                Activo
              </v-chip>
              <v-chip class="ma-2" color="pink" v-else>
                <v-icon icon="mdi-close" start></v-icon>
                Inactivo
              </v-chip>
            </template>

            <template v-slot:item.options="{ item }">
              <v-btn class="mr-1" icon="mdi-square-edit-outline" color="orange" density="comfortable"
                @click="edit(item)"></v-btn>
              <v-btn v-if="item.active" class="mr-1" icon="mdi-close" color="red" density="comfortable"
                @click="changeStatus(item)"></v-btn>
              <v-btn v-else color="green" class="mr-1" icon="mdi-check" density="comfortable"
                @click="changeStatus(item)"></v-btn>
              <v-btn v-if="item.active" class="mr-1" icon="mdi-monitor-eye"
                density="comfortable" color="blue" @click="showDashboardDialog(item.key)"></v-btn>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
  <v-btn class="position-absolute bottom-0 right-0 mb-5 mr-5" size="x-large" color="primary" icon="mdi-plus"
    @click="openNewDeviceModal()"></v-btn>
  <New :openModal="newDeviceModal" @close-modal="closeNewDeviceModal"></New>
  <Edit :openModal="editDeviceModal" @close-modal="closeEditDeviceModal" :device="device" />

  <v-dialog v-model="dashboardDialog" width="600">
    <v-card title="Selecciona un dashboard">
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-select
              v-model="dashboardSelected"
              :items="[
                { title: 'PIC-IoT', value: 'pic-iot'},
                { title: 'ESP32 BME280', value: 'esp23'},
                { title: 'Vista 3', value: 'v3'},
                { title: 'Vista 4', value: 'v4'},
                { title: 'Vista 5', value: 'v5'},
                { title: 'Vista 6', value: 'v6'},
              ]"
            ></v-select>
          </v-col>
          <v-col cols="12" class="text-center">
            <v-btn
              :to="`/dispositivos/${key}/${dashboardSelected}`"
              target="_blank"
              :disabled="dashboardSelected === null"
              @click="dashboardDialog = false"
            >Abrir</v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import useUtils from '@/composables/useUtils'
import { useApiStore } from '@/stores/api';
import New from '@/views/Devices/New.vue';
import Edit from '@/views/Devices/Edit.vue';
import { useLoaderStore } from '@/stores/loader';

const dashboardDialog = ref(false);
const dashboardSelected = ref(null);
const key = ref(null);
const showDashboardDialog = (deviceKey) => {
  key.value = deviceKey;
  dashboardDialog.value = true;
}

const headers = ref([
  { title: 'ID', key: 'id' },
  { title: 'Nombre', key: 'name' },
  { title: 'Fecha / Hora de creación', key: 'created_at' },
  { title: 'Estado', key: 'active' },
  { title: 'Opciones', key: 'options' },
])
const devices = ref([])
const device = ref({})
const newDeviceModal = ref(false)
const editDeviceModal = ref(false)
const { sendRequest, showSuccessMessage } = useUtils()
const storeApi = useApiStore()
const loader = useLoaderStore();

onMounted(() => {
  getDevices()
})

const getDevices = async () => {
  loader.setIsActive(true);
  const devicesRequest = await sendRequest(`${storeApi.getApiUrl}devices`);

  if (devicesRequest.success) {
    devices.value = devicesRequest.data;
  }

  setTimeout(() => {
    loader.setIsActive(false);
  }, 400);
}

const openNewDeviceModal = () => {
  newDeviceModal.value = true;
}

const closeNewDeviceModal = (reload) => {
  if (reload) getDevices();

  newDeviceModal.value = false;
  setTimeout(() => {
    loader.setIsActive(false);
  }, 400);
}

const edit = (data) => {
  device.value = data;
  editDeviceModal.value = true;
}

const closeEditDeviceModal = (reload) => {
  if (reload) getDevices();
  editDeviceModal.value = false;
}

const changeStatus = async ({ id, active }) => {
  loader.setIsActive(true);
  const deviceStatusURL = `${storeApi.getApiUrl}devices/${id}`;
  const deviceStatusRequest = await sendRequest(
    deviceStatusURL,
    { active: !active },
    "PUT"
  );

  if (deviceStatusRequest.success) {
    showSuccessMessage(deviceStatusRequest.message);
    setTimeout(getDevices);
  }
  setTimeout(() => {
    loader.setIsActive(false);
  }, 400);
}
</script>
