<template>
  <v-dialog width="600" v-model="modalStatus" persistent z-index="1">
    <v-card min-height="200">
      <v-form @submit.prevent="save">
        <v-card-title>
          <span class="headline">Nuevo dispositivo</span>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="form.name" label="Nombre"></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="red" @click="closeModal(false)">Cerrar</v-btn>
          <v-btn type="submit" color="success">Guardar</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import useUtils from '@/composables/useUtils'
import { useApiStore } from '@/stores/api';

const props = defineProps({
  openModal: {
    type: Boolean,
    default: false,
  },
})
const emits = defineEmits(['close-modal']);

const { sendRequest, showSuccessMessage } = useUtils()
const storeApi = useApiStore()
const modalStatus = ref(false)
const form = ref({})

const save = async () => {
  const newDeviceRequest = await sendRequest(
    `${storeApi.getApiUrl}devices`,
    form.value,
    "POST"
  );

  if (newDeviceRequest.success) {
    showSuccessMessage(newDeviceRequest.message);
    closeModal(true);
  }
}

const closeModal = (reload = false) => {

  if (null === form.value.name || '' === form.value.vame) {
    alert('alfgo')
    return;
  }

  modalStatus.value = false;
  form.value = {}
  emits("close-modal", reload);
}

watch(() => props.openModal, (newValue, oldValue) => {
  modalStatus.value = newValue
})
</script>
