import { useTheme } from "vuetify";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useSettingsStore = defineStore('settings', () => {
    const theme = useTheme()
    const isDarkMode = ref(false)

    const getIsDarkMode = computed(() => isDarkMode.value);

    const setColorMode = (mode) => {
        localStorage.setItem('theme', mode);
        theme.global.name.value = mode
        isDarkMode.value = 'darkMode' === mode
    }

    return { getIsDarkMode, setColorMode }
})