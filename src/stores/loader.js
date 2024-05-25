import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useLoaderStore = defineStore('loader', () => {
    const isActive = ref(false)

    const getIsActive = computed(() => {
        return isActive.value;
    });

    const setIsActive = (status) => {
        isActive.value = status
    }

    return { getIsActive, setIsActive }
})
