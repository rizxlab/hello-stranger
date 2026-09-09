<script setup lang="ts">
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { getBackgroundResource } from '@/config/storyResources'
import {
  imagePreloadService,
  selectPreferredImageUrl
} from '@/services/ImagePreloadService'

const props = defineProps<{
  item: {
    id: string
    catalogNumber?: string
    title: string
    summary?: string
    eyebrow: string
    cover?: string
  }
  to: RouteLocationRaw
  compact?: boolean
}>()

const resource = computed(() =>
  props.item.cover ? getBackgroundResource(props.item.cover) : null
)

function preloadBackground(): void {
  if (!resource.value) return
  const url = selectPreferredImageUrl(
    resource.value.url,
    resource.value.portraitUrl
  )
  void imagePreloadService.load(url, { priority: 'low' }).catch(() => undefined)
}
</script>

<template>
  <RouterLink
    :to="to"
    class="collection-card"
    :class="{ 'collection-card--compact': compact, 'collection-card--fallback': !resource }"
    @pointerenter="preloadBackground"
    @focus="preloadBackground"
    @touchstart.passive="preloadBackground"
  >
    <img
      v-if="resource"
      :src="resource.url"
      :alt="item.title"
      loading="lazy"
      decoding="async"
    />
    <span class="collection-copy">
      <small>
        <b v-if="item.catalogNumber" class="catalog-number">{{ item.catalogNumber }}</b>
        {{ item.eyebrow }}
      </small>
      <strong>{{ item.title }}</strong>
      <span v-if="item.summary">{{ item.summary }}</span>
      <b>查看目录 →</b>
    </span>
  </RouterLink>
</template>

<style scoped>
.collection-card {
  position: relative;
  display: grid;
  min-height: 11rem;
  overflow: hidden;
  color: #fffaf2;
  border-radius: 1.2rem;
  box-shadow: 0 0.75rem 1.8rem rgb(23 63 58 / 13%);
  text-decoration: none;
}

.collection-card--fallback {
  background:
    radial-gradient(circle at 82% 18%, rgb(239 160 119 / 45%), transparent 34%),
    linear-gradient(145deg, #214f49, #102e2b 72%);
}

.collection-card::after {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgb(15 37 34 / 88%), rgb(15 37 34 / 22%));
  content: '';
}

.collection-card img {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.collection-copy {
  position: relative;
  z-index: 1;
  display: grid;
  align-content: center;
  gap: 0.35rem;
  width: min(76%, 24rem);
  padding: 1.2rem;
}

.collection-copy small {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #f0a181;
  font-size: 0.62rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.catalog-number {
  display: inline-grid;
  min-width: 1.7rem;
  min-height: 1.35rem;
  padding: 0.16rem 0.38rem;
  color: #fffaf2;
  background: #d86f45;
  border-radius: 999px;
  font-size: 0.6rem;
  place-items: center;
}

.collection-copy strong {
  font-size: clamp(1.25rem, 5vw, 1.75rem);
}

.collection-copy > span {
  color: rgb(255 250 242 / 76%);
  font-size: 0.72rem;
  line-height: 1.5;
}

.collection-copy > b {
  margin-top: 0.35rem;
  font-size: 0.68rem;
}

.collection-card:focus-visible {
  outline: 0.2rem solid #d86f45;
  outline-offset: 0.12rem;
}

.collection-card--compact {
  min-height: 8.2rem;
  border-radius: 1rem;
}

.collection-card--compact::after {
  background: linear-gradient(105deg, rgb(15 37 34 / 90%), rgb(15 37 34 / 38%));
}

.collection-card--compact .collection-copy {
  align-content: end;
  gap: 0.22rem;
  width: 100%;
  padding: 0.72rem;
}

.collection-card--compact .collection-copy small {
  font-size: 0.52rem;
  letter-spacing: 0.04em;
}

.collection-card--compact .collection-copy strong {
  display: -webkit-box;
  overflow: hidden;
  font-size: clamp(0.88rem, 3.8vw, 1.18rem);
  line-height: 1.15;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.collection-card--compact .collection-copy > span {
  display: none;
}

.collection-card--compact .collection-copy > b {
  margin-top: 0.1rem;
  font-size: 0.56rem;
}

@media (prefers-reduced-motion: no-preference) {
  .collection-card {
    transition: transform 160ms ease;
  }

  .collection-card:hover {
    transform: translateY(-2px);
  }
}
</style>
