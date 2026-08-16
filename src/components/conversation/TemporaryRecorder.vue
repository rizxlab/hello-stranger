<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useTemporaryRecorder } from '@/composables/useTemporaryRecorder'
import { useSpeechTranscription } from '@/composables/useSpeechTranscription'

const emit = defineEmits<{
  transcribed: [text: string]
}>()

const recorder = useTemporaryRecorder()
const transcription = useSpeechTranscription()
const recorderRoot = ref<HTMLElement | null>(null)
const audioElement = ref<HTMLAudioElement | null>(null)
const playbackError = ref('')
const interactionMessage = ref('')
const isRecorderExpanded = ref(false)
const isPressing = ref(false)
const isHolding = ref(false)
const isPlaying = ref(false)
let pointerId: number | null = null
let interactionGeneration = 0
let holdStartedAt = 0
let transcriptionPending = false
let lastCommittedTranscript = ''
let commitTimer: ReturnType<typeof setTimeout> | null = null
let holdActivationTimer: ReturnType<typeof setTimeout> | null = null

const isRecorded = computed(() => recorder.state.value === 'recorded')
const showDuration = computed(
  () => recorder.state.value === 'recording' || isRecorded.value
)
const recordButtonLabel = computed(() => {
  if (recorder.state.value === 'requesting') return '继续按住，正在请求麦克风权限'
  if (recorder.state.value === 'recording') return '正在录音，松开结束'
  if (recorder.state.value === 'error') return '按住重新尝试录音'
  return '按住录音'
})
const expandedButtonCopy = computed(() => {
  if (recorder.state.value === 'requesting') return '正在请求权限…'
  if (recorder.state.value === 'recording') return `录音中 · ${recorder.elapsedLabel.value}`
  if (isPressing.value) return '继续按住…'
  if (recorder.state.value === 'error') return '长按重试'
  return '长按录音'
})

watch(recorder.audioUrl, async (url) => {
  playbackError.value = ''
  isPlaying.value = false
  if (!url) return
  await nextTick()
  audioElement.value?.load()
})

function clearCommitTimer(): void {
  if (!commitTimer) return
  clearTimeout(commitTimer)
  commitTimer = null
}

function clearHoldActivationTimer(): void {
  if (!holdActivationTimer) return
  clearTimeout(holdActivationTimer)
  holdActivationTimer = null
}

function commitTranscription(): void {
  if (!transcriptionPending) return
  if (
    transcription.state.value !== 'completed' &&
    transcription.state.value !== 'error'
  ) {
    return
  }

  const transcript = transcription.finalTranscript.value.trim()
  if (transcript && transcript !== lastCommittedTranscript) {
    lastCommittedTranscript = transcript
    emit('transcribed', transcript)
  }
  transcriptionPending = false
  clearCommitTimer()
}

watch(
  [transcription.state, transcription.finalTranscript],
  () => commitTranscription()
)

async function beginHold(): Promise<void> {
  if (
    isHolding.value ||
    isRecorded.value ||
    recorder.state.value === 'requesting' ||
    recorder.state.value === 'recording'
  ) {
    return
  }

  isHolding.value = true
  holdStartedAt = performance.now()
  interactionMessage.value = ''
  transcriptionPending = false
  lastCommittedTranscript = ''
  clearCommitTimer()
  const currentGeneration = ++interactionGeneration

  const started = await recorder.start({
    shouldContinue: () =>
      isHolding.value && currentGeneration === interactionGeneration,
    onRecordingStarted: (stream) => {
      transcription.start(stream.getAudioTracks()[0])
    }
  })

  if (!started && currentGeneration === interactionGeneration && !isHolding.value) {
    interactionMessage.value = '麦克风已准备好，请再次按住图标。'
  }
}

function scheduleHold(): void {
  if (isPressing.value || isHolding.value || isRecorded.value) return
  isPressing.value = true
  clearHoldActivationTimer()
  holdActivationTimer = setTimeout(() => {
    holdActivationTimer = null
    if (isPressing.value) void beginHold()
  }, 320)
}

function finishHold(): void {
  clearHoldActivationTimer()
  isPressing.value = false
  if (!isHolding.value) return
  isHolding.value = false
  const heldMilliseconds = performance.now() - holdStartedAt

  if (recorder.state.value === 'requesting') {
    interactionGeneration += 1
    recorder.cancelPendingStart()
    transcription.abort()
    interactionMessage.value = '权限确认后，请再次按住图标。'
    return
  }

  if (recorder.state.value !== 'recording') return
  recorder.stop()
  transcriptionPending = true
  transcription.stop()
  if (heldMilliseconds < 350) {
    interactionMessage.value = '按住时间太短，请按住图标并说完整句子。'
  }

  commitTranscription()
  commitTimer = setTimeout(() => {
    transcription.abort()
    transcriptionPending = false
    clearCommitTimer()
  }, 5000)
}

function handlePointerDown(event: PointerEvent): void {
  if (event.button !== 0 || !event.isPrimary) return
  event.preventDefault()
  pointerId = event.pointerId
  ;(event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId)
  scheduleHold()
}

function handlePointerEnd(event: PointerEvent): void {
  if (pointerId !== event.pointerId) return
  pointerId = null
  finishHold()
}

function handleKeyDown(event: KeyboardEvent): void {
  if ((event.key !== ' ' && event.key !== 'Enter') || event.repeat) return
  event.preventDefault()
  scheduleHold()
}

function handleKeyUp(event: KeyboardEvent): void {
  if (event.key !== ' ' && event.key !== 'Enter') return
  event.preventDefault()
  finishHold()
}

async function togglePlayback(): Promise<void> {
  const audio = audioElement.value
  if (!audio) return

  playbackError.value = ''
  if (audio.paused) {
    try {
      await audio.play()
    } catch {
      playbackError.value = '这段录音无法播放，请重新录制。'
      isPlaying.value = false
    }
  } else {
    audio.pause()
  }
}

function resetRecording(): void {
  audioElement.value?.pause()
  transcription.abort()
  recorder.reset()
  isPlaying.value = false
  interactionMessage.value = ''
  playbackError.value = ''
  transcriptionPending = false
  lastCommittedTranscript = ''
  clearCommitTimer()
}

function expandRecorder(): void {
  isRecorderExpanded.value = true
  interactionMessage.value = ''
}

function collapseRecorder(): void {
  if (
    recorder.state.value === 'requesting' ||
    recorder.state.value === 'recording' ||
    isRecorded.value
  ) {
    return
  }
  clearHoldActivationTimer()
  isPressing.value = false
  isRecorderExpanded.value = false
  interactionMessage.value = ''
}

function handleOutsidePointerDown(event: PointerEvent): void {
  if (!isRecorderExpanded.value || isRecorded.value) return
  const target = event.target
  if (target instanceof Node && !recorderRoot.value?.contains(target)) {
    collapseRecorder()
  }
}

onMounted(() => document.addEventListener('pointerdown', handleOutsidePointerDown))

onBeforeUnmount(() => {
  audioElement.value?.pause()
  clearCommitTimer()
  clearHoldActivationTimer()
  document.removeEventListener('pointerdown', handleOutsidePointerDown)
})
</script>

<template>
  <section ref="recorderRoot" class="temporary-recorder" aria-label="临时口语录音">
    <p v-if="!recorder.isSupported.value" class="recorder-message">
      当前浏览器不支持录音。
    </p>

    <template v-else>
      <div class="compact-recorder">
        <button
          v-if="!isRecorderExpanded && !isRecorded"
          class="voice-launcher-button"
          type="button"
          aria-label="展开语音输入"
          :aria-expanded="false"
          @click="expandRecorder"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 10v4M9 7v10M13 4v16M17 8v8M21 10v4"></path>
          </svg>
        </button>

        <button
          v-else-if="!isRecorded"
          class="record-icon-button"
          :class="{
            'record-icon-button--primed': isPressing,
            'record-icon-button--active': isHolding
          }"
          :aria-pressed="isHolding"
          :aria-label="recordButtonLabel"
          type="button"
          @pointerdown="handlePointerDown"
          @pointerup="handlePointerEnd"
          @pointercancel="handlePointerEnd"
          @lostpointercapture="handlePointerEnd"
          @keydown="handleKeyDown"
          @keyup="handleKeyUp"
          @contextmenu.prevent
          @click.prevent
        >
          <svg
            v-if="recorder.state.value !== 'recording'"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <rect x="9" y="3" width="6" height="11" rx="3"></rect>
            <path d="M6.5 11.5a5.5 5.5 0 0 0 11 0M12 17v4M9 21h6"></path>
          </svg>
          <svg v-else viewBox="0 0 24 24" aria-hidden="true">
            <rect class="stop-shape" x="7" y="7" width="10" height="10" rx="1.5"></rect>
          </svg>
          <span class="record-button-copy">{{ expandedButtonCopy }}</span>
        </button>

        <button
          v-else
          class="play-icon-button"
          :aria-label="isPlaying ? '暂停录音' : '播放录音'"
          type="button"
          @click="togglePlayback"
        >
          <svg v-if="!isPlaying" viewBox="0 0 24 24" aria-hidden="true">
            <path class="filled-icon" d="M8 5.5v13l10-6.5z"></path>
          </svg>
          <svg v-else viewBox="0 0 24 24" aria-hidden="true">
            <rect class="filled-icon" x="7" y="5.5" width="3.5" height="13" rx="1"></rect>
            <rect class="filled-icon" x="13.5" y="5.5" width="3.5" height="13" rx="1"></rect>
          </svg>
        </button>

        <span v-if="showDuration" class="recording-duration">
          {{ recorder.elapsedLabel.value }}
        </span>

        <button
          v-if="isRecorderExpanded && !isRecorded && !isHolding && recorder.state.value !== 'requesting'"
          class="collapse-icon-button"
          type="button"
          aria-label="收起语音输入"
          @click="collapseRecorder"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m7 7 10 10M17 7 7 17"></path>
          </svg>
        </button>

        <button
          v-if="isRecorded"
          class="reset-icon-button"
          type="button"
          aria-label="重新录音"
          @click="resetRecording"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 8v5h5"></path>
            <path d="M6.2 13a6.5 6.5 0 1 0 1.6-5"></path>
          </svg>
        </button>

        <audio
          v-if="isRecorded"
          :key="recorder.audioUrl.value"
          ref="audioElement"
          class="hidden-audio"
          :src="recorder.audioUrl.value"
          preload="metadata"
          @play="isPlaying = true"
          @pause="isPlaying = false"
          @ended="isPlaying = false"
          @error="playbackError = '这段录音无法播放，请重新录制。'"
        ></audio>
      </div>

      <p
        v-if="recorder.errorMessage.value"
        class="recorder-message recorder-message--warning"
        role="alert"
      >
        {{ recorder.errorMessage.value }}
      </p>
      <p
        v-else-if="transcription.errorMessage.value"
        class="recorder-message recorder-message--warning"
        role="status"
      >
        {{ transcription.errorMessage.value }}
      </p>
      <p
        v-else-if="interactionMessage || playbackError || recorder.recordingWarning.value"
        class="recorder-message recorder-message--warning"
        role="status"
      >
        {{ interactionMessage || playbackError || recorder.recordingWarning.value }}
      </p>
    </template>
  </section>
</template>

<style scoped>
.temporary-recorder {
  display: grid;
  gap: 0.35rem;
}

.compact-recorder {
  display: flex;
  align-items: center;
  gap: 0.48rem;
  min-height: 2.65rem;
}

.voice-launcher-button,
.record-icon-button,
.play-icon-button,
.reset-icon-button,
.collapse-icon-button {
  display: inline-grid;
  flex: 0 0 auto;
  place-items: center;
  padding: 0;
  border-radius: 50%;
  cursor: pointer;
}

.voice-launcher-button,
.play-icon-button {
  width: 2.65rem;
  height: 2.65rem;
  color: #fffaf2;
  background: #173f3a;
  border: 0;
}

.record-icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  min-width: 2.65rem;
  height: 2.65rem;
  padding: 0 0.82rem;
  color: #fffaf2;
  background: #173f3a;
  border: 0;
  border-radius: 999px;
  touch-action: none;
  user-select: none;
  -webkit-touch-callout: none;
  transition: background 120ms ease, transform 120ms ease;
}

.record-icon-button--primed {
  background: #24554f;
  transform: scale(0.98);
}

.record-icon-button--active {
  background: #b95431;
  transform: scale(0.96);
}

.reset-icon-button,
.collapse-icon-button {
  width: 2rem;
  height: 2rem;
  color: #6d817d;
  background: transparent;
  border: 1px solid rgb(23 63 58 / 16%);
}

.voice-launcher-button svg,
.record-icon-button svg,
.play-icon-button svg {
  width: 1.25rem;
  height: 1.25rem;
}

.reset-icon-button svg,
.collapse-icon-button svg {
  width: 1rem;
  height: 1rem;
}

.record-button-copy {
  font-size: 0.66rem;
  font-weight: 850;
  white-space: nowrap;
}

svg {
  overflow: visible;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.9;
}

.filled-icon,
.stop-shape {
  fill: currentColor;
  stroke: none;
}

.recording-duration {
  min-width: 3.2rem;
  color: #173f3a;
  font-size: 0.72rem;
  font-variant-numeric: tabular-nums;
  font-weight: 850;
}

.hidden-audio {
  display: none;
}

.recorder-message {
  margin: 0;
  color: #6d817d;
  font-size: 0.58rem;
  line-height: 1.45;
}

.recorder-message--warning {
  color: #a65436;
}

button:focus-visible {
  outline: 0.16rem solid #d86f45;
  outline-offset: 0.12rem;
}

@media (prefers-reduced-motion: reduce) {
  .record-icon-button {
    transition: none;
  }
}
</style>
