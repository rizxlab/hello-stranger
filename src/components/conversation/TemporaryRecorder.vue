<script setup lang="ts">
import { useTemporaryRecorder } from '@/composables/useTemporaryRecorder'

const recorder = useTemporaryRecorder()
</script>

<template>
  <section class="temporary-recorder" aria-label="临时口语录音">
    <div class="recorder-copy">
      <strong>先说一遍</strong>
      <span>临时录音，离开当前题目后自动清除</span>
    </div>

    <p v-if="!recorder.isSupported.value" class="recorder-message">
      当前浏览器不支持录音，你仍然可以填写回答或查看选项。
    </p>

    <template v-else>
      <div class="recorder-actions">
        <button
          v-if="recorder.state.value === 'idle' || recorder.state.value === 'error'"
          class="record-button"
          type="button"
          @click="recorder.start"
        >
          <span class="record-dot" aria-hidden="true"></span>
          开始录音
        </button>

        <button
          v-else-if="recorder.state.value === 'requesting'"
          class="record-button"
          type="button"
          disabled
        >
          正在请求麦克风…
        </button>

        <button
          v-else-if="recorder.state.value === 'recording'"
          class="stop-button"
          type="button"
          @click="recorder.stop"
        >
          <span class="stop-icon" aria-hidden="true"></span>
          停止 · {{ recorder.elapsedLabel.value }}
        </button>

        <template v-else-if="recorder.state.value === 'recorded'">
          <audio :src="recorder.audioUrl.value" controls preload="metadata">
            你的浏览器不支持播放录音。
          </audio>
          <button class="secondary-button" type="button" @click="recorder.start">
            重新录制
          </button>
          <button class="delete-button" type="button" @click="recorder.reset">
            删除
          </button>
        </template>
      </div>

      <p v-if="recorder.errorMessage.value" class="recorder-message" role="alert">
        {{ recorder.errorMessage.value }}
      </p>
    </template>
  </section>
</template>

<style scoped>
.temporary-recorder {
  display: grid;
  gap: 0.6rem;
  padding: 0.75rem;
  background: rgb(23 63 58 / 6%);
  border: 1px solid rgb(23 63 58 / 10%);
  border-radius: 0.85rem;
}

.recorder-copy {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.25rem 0.55rem;
}

.recorder-copy strong {
  font-size: 0.75rem;
}

.recorder-copy span,
.recorder-message {
  color: #6d817d;
  font-size: 0.58rem;
  line-height: 1.45;
}

.recorder-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.recorder-actions button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.42rem;
  min-height: 2.25rem;
  padding: 0.52rem 0.78rem;
  border-radius: 999px;
  font-size: 0.66rem;
  font-weight: 850;
  cursor: pointer;
}

.record-button,
.stop-button {
  color: #fffaf2;
  background: #173f3a;
  border: 0;
}

.record-button:disabled {
  cursor: wait;
  opacity: 0.7;
}

.record-dot {
  width: 0.55rem;
  aspect-ratio: 1;
  background: #ee7a4c;
  border-radius: 50%;
}

.stop-icon {
  width: 0.55rem;
  aspect-ratio: 1;
  background: #fffaf2;
  border-radius: 0.12rem;
}

.secondary-button,
.delete-button {
  color: #173f3a;
  background: rgb(255 253 248 / 72%);
  border: 1px solid rgb(23 63 58 / 16%);
}

.delete-button {
  color: #a3482b;
}

audio {
  flex: 1 1 12rem;
  min-width: 10rem;
  height: 2.35rem;
  accent-color: #d86f45;
}

.recorder-actions button:focus-visible,
audio:focus-visible {
  outline: 0.16rem solid #d86f45;
  outline-offset: 0.12rem;
}

@media (max-width: 28rem) {
  audio {
    flex-basis: 100%;
    width: 100%;
  }
}
</style>
