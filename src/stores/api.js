import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useApiStore = defineStore('api', () => {
    const apiUrl = ref(`http://localhost:${import.meta.env.VITE_API_PORT}/api/`)

    const getApiUrl = computed(() => {
        return apiUrl.value;
    })

    return { getApiUrl }
})
