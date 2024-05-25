<template>
  <v-row>
    <v-col cols="12">
      <v-card>
        <v-card-title>
          <h3>Usuarios</h3>
        </v-card-title>
        <v-card-text>
          <v-data-table :headers="headers" :items="users">
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
              <v-btn class="mr-1" color="orange" icon="mdi-square-edit-outline" density="comfortable"
                @click="edit(item)"></v-btn>

              <v-btn v-if="item.active && item.id != 1" class="mr-1" color="red" icon="mdi-close" density="comfortable"
                @click="changeStatus(item)"></v-btn>

              <v-btn v-if="!item.active && item.id != 1" class="mr-1" color="green" icon="mdi-check"
                density="comfortable" @click="changeStatus(item)"></v-btn>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <v-btn class="position-absolute bottom-0 right-0 mb-5 mr-5" size="x-large" color="primary" icon="mdi-plus"
    @click="openNewUserModal()"></v-btn>
  <New :openModal="newUserModal" @close-modal="closeNewUserModal($event)"></New>
  <Edit :openModal="editUserModal" @close-modal="closeEditUserModal($event)" :user="user"></Edit>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import useUtils from '@/composables/useUtils'
import { useApiStore } from '@/stores/api';
import New from '@/views/Users/New.vue';
import Edit from '@/views/Users/Edit.vue';
import { useLoaderStore } from '@/stores/loader';

const headers = ref([
  { title: 'ID', key: 'id' },
  { title: 'Nombre', key: 'name' },
  { title: 'Usuario', key: 'username' },
  { title: 'Fecha / Hora de creación', key: 'created_at' },
  { title: 'Estado', key: 'active' },
  { title: 'Opciones', key: 'options' },
])
const { sendRequest, showSuccessMessage } = useUtils()
const storeApi = useApiStore()
const users = ref([])
const user = ref({})
const newUserModal = ref(false)
const editUserModal = ref(false)
const loader = useLoaderStore();

onMounted(() => {
  getUsers()
})

const getUsers = async () => {
  loader.setIsActive(true);
  const usersRequest = await sendRequest(`${storeApi.getApiUrl}users`);

  if (usersRequest.success) {
    users.value = usersRequest.data;
  }

  setTimeout(() => {
    loader.setIsActive(false);
  }, 400);
}
const openNewUserModal = () => {
  newUserModal.value = true;
}
const closeNewUserModal = (reload) => {
  newUserModal.value = false;
  if (reload) {
    setTimeout(() => {
      getUsers();
    }, 100);
  }
}
const edit = (data) => {
  user.value = {}
  user.value = data;
  editUserModal.value = true;
}
const closeEditUserModal = (reload) => {
  editUserModal.value = false;
  if (reload) getUsers();
}
const changeStatus = async ({ id, active }) => {
  loader.setIsActive(true);
  const userStatusRequest = await sendRequest(
    `${storeApi.getApiUrl}users/${id}`,
    {
      active: !active,
    },
    "PUT"
  );
  if (userStatusRequest.success) {
    showSuccessMessage(userStatusRequest.message);
    setTimeout(getUsers);
  }

  setTimeout(() => {
    loader.setIsActive(false);
  }, 400);
}
</script>
