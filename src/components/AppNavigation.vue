<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { navigationItems } from '@/config/navigation'

const route = useRoute()
const activeNavigation = computed(() =>
  typeof route.meta.navigation === 'string'
    ? route.meta.navigation
    : route.name
)
</script>

<template>
  <nav
    class="app-navigation"
    aria-label="主要导航"
    :style="{
      gridTemplateColumns: `repeat(${navigationItems.length}, minmax(0, 1fr))`
    }"
  >
    <RouterLink
      v-for="item in navigationItems"
      :key="item.routeName"
      :to="{ name: item.routeName }"
      class="navigation-link"
      :class="{
        'navigation-link--active': activeNavigation === item.routeName
      }"
    >
      <span class="navigation-icon" aria-hidden="true">{{ item.icon }}</span>
      <span>{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>
