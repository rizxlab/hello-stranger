<script setup lang="ts">
import { computed, ref } from 'vue'
import { useGlobalNoteStore } from '@/stores/globalNote'
import { usePlayerStore } from '@/stores/player'

const props = withDefaults(defineProps<{
  variant?: 'profile' | 'developer'
}>(), {
  variant: 'profile'
})

const player = usePlayerStore()
const globalNote = useGlobalNoteStore()
const isConfirming = ref(false)
const statusMessage = ref('')
const copy = computed(() => props.variant === 'developer'
  ? {
      title: '数据操作',
      description: '清空等级、英语能力、词汇、关系、当前剧情进度与全局笔记，不影响 PWA 缓存。',
      button: '清空玩家记录',
      confirmation: '此操作会立即重置本次会话，确定继续吗？',
      status: '本次会话的玩家记录已清空。'
    }
  : {
      title: '清空本地存档',
      description: '清空后会重置能力、词汇、剧情进度和保存在本机的笔记，不影响应用缓存。',
      button: '清空本地存档',
      confirmation: '清空后无法恢复当前玩家记录，确定继续吗？',
      status: '本地玩家记录已清空。'
    })

function requestReset(): void {
  statusMessage.value = ''
  isConfirming.value = true
}

function cancelReset(): void {
  isConfirming.value = false
}

function confirmReset(): void {
  player.resetPlayer()
  globalNote.clear()
  isConfirming.value = false
  statusMessage.value = copy.value.status
}
</script>

<template>
  <article class="reset-panel">
    <div>
      <p class="reset-panel__title">{{ copy.title }}</p>
      <p class="reset-panel__description">{{ copy.description }}</p>
    </div>

    <div v-if="!isConfirming" class="reset-panel__actions">
      <button class="reset-button" type="button" @click="requestReset">
        {{ copy.button }}
      </button>
    </div>

    <div
      v-else
      class="reset-panel__confirmation"
      role="group"
      aria-label="确认清空玩家记录"
    >
      <p>{{ copy.confirmation }}</p>
      <div class="reset-panel__actions">
        <button class="confirm-button" type="button" @click="confirmReset">
          确认清空
        </button>
        <button class="cancel-button" type="button" @click="cancelReset">
          取消
        </button>
      </div>
    </div>

    <p v-if="statusMessage" class="reset-panel__status" role="status">
      {{ statusMessage }}
    </p>
  </article>
</template>

<style scoped>
.reset-panel {
  display: grid;
  gap: 0.85rem;
  padding: 1rem;
  background: rgb(255 253 248 / 72%);
  border: 1px solid rgb(169 72 43 / 20%);
  border-radius: 1rem;
}

.reset-panel__title,
.reset-panel__description,
.reset-panel__confirmation p,
.reset-panel__status {
  margin: 0;
}

.reset-panel__title {
  color: #173f3a;
  font-size: 0.82rem;
  font-weight: 850;
}

.reset-panel__description,
.reset-panel__confirmation p,
.reset-panel__status {
  margin-top: 0.3rem;
  color: #6d817d;
  font-size: 0.68rem;
  line-height: 1.55;
}

.reset-panel__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.reset-panel button {
  min-height: 2.35rem;
  padding: 0.55rem 0.85rem;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 850;
  cursor: pointer;
}

.reset-button,
.confirm-button {
  color: #fffaf2;
  background: #a3482b;
  border: 1px solid #a3482b;
}

.cancel-button {
  color: #173f3a;
  background: transparent;
  border: 1px solid rgb(23 63 58 / 18%);
}

.reset-panel__status {
  color: #35665e;
  font-weight: 750;
}

.reset-panel button:focus-visible {
  outline: 0.16rem solid #d86f45;
  outline-offset: 0.12rem;
}
</style>
