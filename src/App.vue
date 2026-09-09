<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppNavigation from '@/components/AppNavigation.vue'
import GlobalNotePanel from '@/components/notes/GlobalNotePanel.vue'
import { GLOBAL_NOTE_MAX_LENGTH } from '@/services/GlobalNoteStorageService'
import { useGlobalNoteStore } from '@/stores/globalNote'

const route = useRoute()
const globalNote = useGlobalNoteStore()
const showNavigation = computed(() => route.meta.hideNavigation !== true)
const isImmersive = computed(() => route.meta.immersive === true)
</script>

<template>
  <div
    class="app-shell"
    :class="{
      'app-shell--immersive': isImmersive
    }"
  >
    <main class="app-content">
      <RouterView />
    </main>
    <GlobalNotePanel
      :model-value="globalNote.content"
      :max-length="GLOBAL_NOTE_MAX_LENGTH"
      @update:model-value="globalNote.setContent"
    />
    <AppNavigation v-if="showNavigation" />
  </div>
</template>

<style scoped>
.app-shell--immersive {
  width: 100%;
  max-width: none;
  padding: 0;
}

.app-shell--immersive .app-content {
  min-height: 100dvh;
}
</style>
