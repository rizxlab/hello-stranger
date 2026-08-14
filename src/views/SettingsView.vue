<script setup lang="ts">
import { useRouter } from 'vue-router'
import VersionTrigger from '@/components/settings/VersionTrigger.vue'
import { appConfig } from '@/config/app'
import { developerAccess } from '@/systems/DeveloperAccessSystem'

const router = useRouter()

function openDeveloperTools(): void {
  developerAccess.unlock()
  void router.push({ name: 'developer' })
}
</script>

<template>
  <section class="page settings-page">
    <header class="settings-header">
      <RouterLink :to="{ name: 'profile' }" aria-label="返回我的页面">←</RouterLink>
      <div>
        <p class="eyebrow">Settings</p>
        <h1>设置</h1>
      </div>
    </header>

    <article class="surface-card settings-placeholder">
      <span aria-hidden="true">◌</span>
      <div>
        <h2>更多选项会放在这里</h2>
        <p class="muted">声音、语言与辅助功能将在需要时作为独立模块加入。</p>
      </div>
    </article>

    <footer>
      <VersionTrigger :version="appConfig.version" @unlock="openDeveloperTools" />
    </footer>
  </section>
</template>

<style scoped>
.settings-page {
  grid-template-rows: auto auto 1fr auto;
  min-height: calc(100vh - 8rem);
}

.settings-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.settings-header > a {
  display: grid;
  place-items: center;
  width: 2.6rem;
  aspect-ratio: 1;
  color: #173f3a;
  border: 1px solid rgb(23 63 58 / 16%);
  border-radius: 50%;
  text-decoration: none;
}

.settings-placeholder {
  grid-template-columns: auto 1fr;
  align-items: center;
}

.settings-placeholder > span {
  color: #d86f45;
  font-size: 2rem;
}

.settings-placeholder h2 {
  margin-bottom: 0.35rem;
  font-size: 1rem;
}

footer {
  display: flex;
  justify-content: center;
  padding: 1rem 0;
}
</style>
