<script setup lang="ts">
import HelloStrangerHero from '@/components/brand/HelloStrangerHero.vue'
</script>

<template>
  <HelloStrangerHero>
    <RouterLink :to="{ name: 'home' }" class="primary-action">
      进入游戏
    </RouterLink>
  </HelloStrangerHero>
</template>
