<script setup lang="ts">
import HelloStrangerHero from '@/components/brand/HelloStrangerHero.vue'
</script>

<template>
  <HelloStrangerHero>
    <RouterLink :to="{ name: 'stories' }" class="primary-action">
      浏览剧情
    </RouterLink>
    <RouterLink :to="{ name: 'short-scenes' }" class="secondary-action">
      体验短情景
    </RouterLink>
  </HelloStrangerHero>
</template>
