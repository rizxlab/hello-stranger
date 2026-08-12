<script setup lang="ts">
import { navigationItems } from '@/config/navigation'
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
    >
      <span class="navigation-icon" aria-hidden="true">{{ item.icon }}</span>
      <span>{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>
