<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useTemporaryRecorder } from '@/composables/useTemporaryRecorder'
import { useSpeechTranscription } from '@/composables/useSpeechTranscription'
import { HoldGestureController } from '@/utils/HoldGestureController'

const props = withDefaults(
  defineProps<{
    id: string
    modelValue: string
    maxLength?: number
  }>(),
  {
    maxLength: 500
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const recorder = useTemporaryRecorder()
const transcription = useSpeechTranscription()
const answerTextarea = ref<HTMLTextAreaElement | null>(null)
const audioElement = ref<HTMLAudioElement | null>(null)
const isOverlayVisible = ref(false)
const isPlaying = ref(false)
const isPressing = ref(false)
const interactionMessage = ref('')
const playbackError = ref('')
const lastInsertedTranscript = ref('')
let pointerId: number | null = null
let interactionGeneration = 0
let transcriptionPending = false
let commitTimer: ReturnType<typeof setTimeout> | null = null

const isRecorded = computed(() => recorder.state.value === 'recorded')
const overlayStatus = computed(() => {
  if (interactionMessage.value) return interactionMessage.value
  if (recorder.state.value === 'requesting') return '正在连接麦克风…'
  if (recorder.state.value === 'recording') return '正在录音，松开结束'
  if (recorder.state.value === 'error') return '暂时无法录音，松开返回'
  return '继续按住以开始录音'
})

const holdGesture = new HoldGestureController(320, () => {
  void beginRecording()
})

function resizeTextarea(): void {
  const textarea = answerTextarea.value
  if (!textarea) return

  textarea.style.height = 'auto'
  const maxHeight = Number.parseFloat(getComputedStyle(textarea).maxHeight)
  const nextHeight = Math.min(
    textarea.scrollHeight,
    Number.isFinite(maxHeight) ? maxHeight : textarea.scrollHeight
  )
  textarea.style.height = `${nextHeight}px`
  textarea.style.overflowY = textarea.scrollHeight > nextHeight ? 'auto' : 'hidden'
}

watch(
  () => props.modelValue,
  async () => {
    await nextTick()
    resizeTextarea()
  }
)

watch(recorder.audioUrl, async (url) => {
  playbackError.value = ''
  isPlaying.value = false
  if (!url) return
  await nextTick()
  audioElement.value?.load()
})

watch(
  [transcription.state, transcription.finalTranscript],
  () => commitTranscription()
)

onMounted(resizeTextarea)

onBeforeUnmount(() => {
  holdGesture.cancel()
  audioElement.value?.pause()
  clearCommitTimer()
})

function clearCommitTimer(): void {
  if (!commitTimer) return
  clearTimeout(commitTimer)
  commitTimer = null
}

function updateAnswer(value: string): void {
  lastInsertedTranscript.value = ''
  emit('update:modelValue', limitInput(value))
  resizeTextarea()
}

function limitInput(value: string): string {
  return Array.from(value).slice(0, props.maxLength).join('')
}

function insertTranscription(transcript: string): void {
  const currentAnswer = props.modelValue.trim()
  const previousTranscript = lastInsertedTranscript.value
  const answerWithoutPrevious =
    previousTranscript && currentAnswer.endsWith(previousTranscript)
      ? currentAnswer.slice(0, -previousTranscript.length).trimEnd()
      : currentAnswer
  const nextAnswer = limitInput(
    answerWithoutPrevious
      ? `${answerWithoutPrevious} ${transcript}`
      : transcript
  )

  lastInsertedTranscript.value = nextAnswer.endsWith(transcript)
    ? transcript
    : ''
  emit('update:modelValue', nextAnswer)
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
  if (transcript) insertTranscription(transcript)
  transcriptionPending = false
  clearCommitTimer()
}

async function beginRecording(): Promise<void> {
  isPressing.value = false
  isOverlayVisible.value = true
  interactionMessage.value = ''
  playbackError.value = ''
  transcriptionPending = false
  lastInsertedTranscript.value = ''
  clearCommitTimer()
  const currentGeneration = ++interactionGeneration

  if (!recorder.isSupported.value) {
    interactionMessage.value = '当前浏览器不支持录音。'
    return
  }

  const started = await recorder.start({
    shouldContinue: () =>
      isOverlayVisible.value && currentGeneration === interactionGeneration,
    onRecordingStarted: (stream) => {
      transcription.start(stream.getAudioTracks()[0])
    }
  })

  if (!started && currentGeneration === interactionGeneration && !isOverlayVisible.value) {
    interactionMessage.value = '麦克风已准备好，请再次长按输入框。'
  }
}

function finishRecording(): void {
  isOverlayVisible.value = false
  interactionGeneration += 1

  if (recorder.state.value === 'requesting') {
    recorder.cancelPendingStart()
    transcription.abort()
    interactionMessage.value = '权限确认后，请再次长按输入框。'
    return
  }

  if (recorder.state.value !== 'recording') return
  recorder.stop()
  transcriptionPending = true
  transcription.stop()
  commitTranscription()
  commitTimer = setTimeout(() => {
    transcription.abort()
    transcriptionPending = false
    clearCommitTimer()
  }, 5000)
}

function focusForTyping(): void {
  const textarea = answerTextarea.value
  if (!textarea) return
  textarea.focus({ preventScroll: true })
  const answerLength = textarea.value.length
  textarea.setSelectionRange(answerLength, answerLength)
}

function handlePointerDown(event: PointerEvent): void {
  if (event.button !== 0 || !event.isPrimary) return
  event.preventDefault()
  pointerId = event.pointerId
  isPressing.value = true
  ;(event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId)
  holdGesture.press()
}

function handlePointerEnd(event: PointerEvent): void {
  if (pointerId !== event.pointerId) return
  pointerId = null
  isPressing.value = false
  const result = holdGesture.release()
  if (result === 'tap') focusForTyping()
  if (result === 'hold') finishRecording()
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
</script>

<template>
  <div class="voice-answer-input">
    <div
      class="answer-field"
      :class="{
        'answer-field--pressing': isPressing,
        'answer-field--recorded': isRecorded
      }"
    >
      <textarea
        :id="id"
        ref="answerTextarea"
        :value="modelValue"
        rows="1"
        placeholder="轻点输入文字，长按录音……"
        @input="updateAnswer(($event.target as HTMLTextAreaElement).value)"
        @pointerdown="handlePointerDown"
        @pointerup="handlePointerEnd"
        @pointercancel="handlePointerEnd"
        @lostpointercapture="handlePointerEnd"
        @contextmenu.prevent
      ></textarea>

      <button
        v-if="isRecorded"
        class="playback-button"
        type="button"
        :aria-label="isPlaying ? '暂停录音' : '播放录音'"
        @pointerdown.stop
        @click="togglePlayback"
      >
        <svg v-if="!isPlaying" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 5.5v13l10-6.5z"></path>
        </svg>
        <svg v-else viewBox="0 0 24 24" aria-hidden="true">
          <rect x="7" y="5.5" width="3.5" height="13" rx="1"></rect>
          <rect x="13.5" y="5.5" width="3.5" height="13" rx="1"></rect>
        </svg>
        <span>{{ recorder.elapsedLabel.value }}</span>
      </button>

      <span v-else class="microphone-hint" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <rect x="9" y="3" width="6" height="11" rx="3"></rect>
          <path d="M6.5 11.5a5.5 5.5 0 0 0 11 0M12 17v4M9 21h6"></path>
        </svg>
      </span>
    </div>

    <p
      v-if="recorder.errorMessage.value || transcription.errorMessage.value || interactionMessage || playbackError || recorder.recordingWarning.value"
      class="voice-message"
      role="status"
    >
      {{ recorder.errorMessage.value || transcription.errorMessage.value || interactionMessage || playbackError || recorder.recordingWarning.value }}
    </p>

    <audio
      v-if="isRecorded"
      :key="recorder.audioUrl.value"
      ref="audioElement"
      :src="recorder.audioUrl.value"
      preload="metadata"
      @play="isPlaying = true"
      @pause="isPlaying = false"
      @ended="isPlaying = false"
      @error="playbackError = '这段录音无法播放，请重新录制。'"
    ></audio>

    <Teleport to="body">
      <div
        v-if="isOverlayVisible"
        class="recording-overlay"
        :style="{ '--input-level': recorder.inputLevel.value }"
        role="status"
        aria-live="assertive"
      >
        <div class="recording-visual" aria-hidden="true">
          <span class="recording-pulse recording-pulse--outer"></span>
          <span class="recording-pulse recording-pulse--inner"></span>
          <span class="recording-microphone">
            <svg viewBox="0 0 24 24">
              <rect x="9" y="3" width="6" height="11" rx="3"></rect>
              <path d="M6.5 11.5a5.5 5.5 0 0 0 11 0M12 17v4M9 21h6"></path>
            </svg>
          </span>
        </div>
        <strong>{{ overlayStatus }}</strong>
        <span class="overlay-duration">{{ recorder.elapsedLabel.value }}</span>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.voice-answer-input {
  display: grid;
  gap: 0.35rem;
}

.answer-field {
  position: relative;
}

.answer-field textarea {
  display: block;
  width: 100%;
  min-height: 2.65rem;
  max-height: 8rem;
  padding: 0.7rem 3.1rem 0.7rem 0.8rem;
  overflow-y: hidden;
  resize: none;
  color: #173f3a;
  background: rgb(255 253 248 / 72%);
  border: 1px solid rgb(23 63 58 / 18%);
  border-radius: 0.8rem;
  font: inherit;
  line-height: 1.5;
  touch-action: none;
  -webkit-touch-callout: none;
  transition: border-color 140ms ease, background 140ms ease, transform 140ms ease;
}

.answer-field--recorded textarea {
  padding-right: 6.6rem;
}

.answer-field--pressing textarea {
  background: rgb(239 226 214 / 88%);
  border-color: #d86f45;
  transform: scale(0.995);
}

.answer-field textarea::placeholder {
  color: rgb(69 103 98 / 64%);
}

.answer-field textarea:focus-visible {
  border-color: #d86f45;
  outline: 0.16rem solid rgb(216 111 69 / 24%);
}

.microphone-hint,
.playback-button {
  position: absolute;
  top: 50%;
  right: 0.55rem;
  transform: translateY(-50%);
}

.microphone-hint {
  display: grid;
  width: 1.8rem;
  height: 1.8rem;
  color: #6d817d;
  place-items: center;
  pointer-events: none;
}

.microphone-hint svg {
  width: 1.1rem;
  height: 1.1rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
}

.playback-button {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  min-height: 2rem;
  padding: 0 0.6rem;
  color: #fffaf2;
  background: #173f3a;
  border: 0;
  border-radius: 999px;
  font-size: 0.62rem;
  font-variant-numeric: tabular-nums;
  font-weight: 850;
}

.playback-button svg {
  width: 0.9rem;
  height: 0.9rem;
  fill: currentColor;
}

.voice-message {
  margin: 0;
  color: #a65436;
  font-size: 0.58rem;
  line-height: 1.45;
}

.voice-answer-input audio {
  display: none;
}

.recording-overlay {
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 1rem;
  padding: 2rem;
  color: #fffaf2;
  text-align: center;
  background:
    radial-gradient(circle at center, rgb(216 111 69 / 28%), transparent 32%),
    rgb(8 27 25 / 91%);
  backdrop-filter: blur(1.2rem) saturate(110%);
  pointer-events: none;
}

.recording-overlay strong {
  font-size: clamp(1.15rem, 5vw, 1.55rem);
}

.recording-visual {
  position: relative;
  display: grid;
  width: 9rem;
  height: 9rem;
  place-items: center;
}

.recording-pulse,
.recording-microphone {
  position: absolute;
  border-radius: 50%;
}

.recording-pulse {
  background: rgb(216 111 69 / 20%);
  transform: scale(calc(1 + var(--input-level) * 0.22));
  transition: transform 80ms linear;
}

.recording-pulse--outer {
  width: 9rem;
  height: 9rem;
  animation: breathe 1.6s ease-in-out infinite;
}

.recording-pulse--inner {
  width: 6.6rem;
  height: 6.6rem;
  background: rgb(216 111 69 / 38%);
}

.recording-microphone {
  display: grid;
  width: 4.4rem;
  height: 4.4rem;
  color: #fffaf2;
  background: #d86f45;
  box-shadow: 0 1.2rem 3rem rgb(0 0 0 / 28%);
  place-items: center;
}

.recording-microphone svg {
  width: 2rem;
  height: 2rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
}

.overlay-duration {
  color: rgb(255 250 242 / 76%);
  font-size: 0.9rem;
  font-variant-numeric: tabular-nums;
  font-weight: 800;
}

@keyframes breathe {
  0%,
  100% {
    opacity: 0.55;
  }
  50% {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .answer-field textarea,
  .recording-pulse {
    transition: none;
  }

  .recording-pulse--outer {
    animation: none;
  }
}
</style>
