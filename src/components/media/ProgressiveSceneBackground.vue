<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useBackgroundTransition } from '@/composables/useBackgroundTransition'
import {
  isPortraitViewport,
  selectPreferredImageUrl,
  type ResponsiveImageSource
} from '@/services/ImagePreloadService'

const props = withDefaults(
  defineProps<{
    source: ResponsiveImageSource
    preloadSources?: readonly ResponsiveImageSource[]
    alt: string
  }>(),
  {
    preloadSources: () => []
  }
)

const portrait = ref(isPortraitViewport())
const transition = useBackgroundTransition()
let orientationQuery: MediaQueryList | null = null

const targetUrl = computed(() =>
  selectPreferredImageUrl(
    props.source.url,
    props.source.portraitUrl,
    portrait.value
  )
)

const preloadUrls = computed(() =>
  props.preloadSources.map((source) =>
    selectPreferredImageUrl(source.url, source.portraitUrl, portrait.value)
  )
)

watch(
  () => [targetUrl.value, ...preloadUrls.value],
  () => {
    void transition.show(targetUrl.value, {
      preloadUrls: preloadUrls.value
    })
  },
  { immediate: true }
)

onMounted(() => {
  orientationQuery = window.matchMedia('(orientation: portrait)')
  orientationQuery.addEventListener('change', updateOrientation)
})

function updateOrientation(event: MediaQueryListEvent): void {
  portrait.value = event.matches
}

onBeforeUnmount(() => {
  orientationQuery?.removeEventListener('change', updateOrientation)
  transition.dispose()
})
</script>

<template>
  <span class="progressive-background" :class="{ 'progressive-background--failed': transition.loadFailed.value }">
    <img
      v-if="transition.previousUrl.value"
      class="background-layer background-layer--previous"
      :src="transition.previousUrl.value"
      alt=""
      aria-hidden="true"
      decoding="async"
    />
    <img
      v-if="transition.displayedUrl.value"
      :key="transition.displayedUrl.value"
      class="background-layer background-layer--current"
      :class="{ 'background-layer--entering': transition.isTransitioning.value }"
      :src="transition.displayedUrl.value"
      :alt="alt"
      loading="eager"
      decoding="async"
      fetchpriority="high"
    />
  </span>
</template>

<style scoped>
.progressive-background {
  position: absolute;
  inset: 0;
  display: block;
  overflow: hidden;
  background: #173f3a;
}

.background-layer {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.background-layer--current {
  z-index: 1;
}

.background-layer--entering {
  animation: background-enter 220ms ease-out both;
}

@keyframes background-enter {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .background-layer--entering {
    animation: none;
  }
}
</style>
