import { computed, onBeforeUnmount, ref } from 'vue'

type RecorderState = 'idle' | 'requesting' | 'recording' | 'recorded' | 'error'

function preferredMimeType(): string | undefined {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4'
  ]

  return candidates.find((type) => MediaRecorder.isTypeSupported(type))
}

export function useTemporaryRecorder() {
  const state = ref<RecorderState>('idle')
  const audioUrl = ref('')
  const elapsedSeconds = ref(0)
  const errorMessage = ref('')

  let recorder: MediaRecorder | null = null
  let stream: MediaStream | null = null
  let timer: ReturnType<typeof setInterval> | null = null
  let chunks: Blob[] = []
  let generation = 0

  const isSupported = computed(
    () =>
      typeof navigator !== 'undefined' &&
      Boolean(navigator.mediaDevices?.getUserMedia) &&
      typeof MediaRecorder !== 'undefined'
  )

  const elapsedLabel = computed(() => {
    const minutes = Math.floor(elapsedSeconds.value / 60)
    const seconds = elapsedSeconds.value % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  })

  function clearTimer(): void {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  function releaseStream(): void {
    stream?.getTracks().forEach((track) => track.stop())
    stream = null
  }

  function revokeAudioUrl(): void {
    if (audioUrl.value) {
      URL.revokeObjectURL(audioUrl.value)
      audioUrl.value = ''
    }
  }

  function reset(): void {
    generation += 1
    clearTimer()
    if (recorder?.state === 'recording') {
      recorder.stop()
    }
    recorder = null
    releaseStream()
    revokeAudioUrl()
    chunks = []
    elapsedSeconds.value = 0
    errorMessage.value = ''
    state.value = 'idle'
  }

  function errorText(error: unknown): string {
    if (error instanceof DOMException && error.name === 'NotAllowedError') {
      return '没有获得麦克风权限，请在浏览器设置中允许后重试。'
    }
    if (error instanceof DOMException && error.name === 'NotFoundError') {
      return '没有找到可用的麦克风。'
    }
    return '暂时无法录音，请检查麦克风后重试。'
  }

  async function start(): Promise<void> {
    if (!isSupported.value || state.value === 'requesting' || state.value === 'recording') {
      return
    }

    reset()
    state.value = 'requesting'
    const currentGeneration = generation

    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      if (currentGeneration !== generation) {
        releaseStream()
        return
      }
      const mimeType = preferredMimeType()
      recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream)
      chunks = []

      recorder.addEventListener('dataavailable', (event) => {
        if (currentGeneration === generation && event.data.size > 0) {
          chunks.push(event.data)
        }
      })
      recorder.addEventListener('stop', () => {
        if (currentGeneration !== generation) return
        clearTimer()
        releaseStream()
        if (chunks.length > 0) {
          revokeAudioUrl()
          audioUrl.value = URL.createObjectURL(
            new Blob(chunks, { type: recorder?.mimeType || 'audio/webm' })
          )
          state.value = 'recorded'
        } else {
          state.value = 'idle'
        }
      })

      recorder.start()
      state.value = 'recording'
      timer = setInterval(() => {
        elapsedSeconds.value += 1
      }, 1000)
    } catch (error) {
      clearTimer()
      releaseStream()
      errorMessage.value = errorText(error)
      state.value = 'error'
    }
  }

  function stop(): void {
    if (recorder?.state === 'recording') recorder.stop()
  }

  onBeforeUnmount(reset)

  return {
    state,
    audioUrl,
    elapsedLabel,
    errorMessage,
    isSupported,
    start,
    stop,
    reset
  }
}
