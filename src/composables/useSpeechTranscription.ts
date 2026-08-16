import { computed, onBeforeUnmount, ref } from 'vue'
import { speechToTextService, SpeechToTextService } from '@/services/speech/SpeechToTextService'
import type { SpeechRecognitionSession, SpeechTranscriptionState } from '@/services/speech/types'

function speechErrorText(code: string): string {
  if (code === 'not-allowed' || code === 'service-not-allowed') {
    return '没有获得语音识别权限，录音功能仍可正常使用。'
  }
  if (code === 'no-speech') return '没有识别到英文语音，你仍然可以试听录音。'
  if (code === 'audio-capture') return '语音识别没有收到麦克风声音。'
  if (code === 'network') return '语音识别网络暂时不可用，录音已保留。'
  if (code === 'language-not-supported') return '当前浏览器不支持英文语音识别。'
  return '语音识别暂时不可用，录音功能仍可正常使用。'
}

export function useSpeechTranscription(service: SpeechToTextService = speechToTextService) {
  const state = ref<SpeechTranscriptionState>('idle')
  const interimTranscript = ref('')
  const finalTranscript = ref('')
  const errorMessage = ref('')
  let session: SpeechRecognitionSession | null = null
  let generation = 0

  const isSupported = computed(
    () => service.capabilities.liveMicrophone && service.isSupported()
  )
  const visibleTranscript = computed(
    () => interimTranscript.value || finalTranscript.value
  )

  function abort(): void {
    generation += 1
    session?.abort()
    session = null
    state.value = 'idle'
    interimTranscript.value = ''
    finalTranscript.value = ''
    errorMessage.value = ''
  }

  function start(audioTrack?: MediaStreamTrack): void {
    abort()
    if (!isSupported.value) return

    const currentGeneration = generation
    let failed = false
    state.value = 'starting'

    try {
      session = service.startLive({
        language: 'en-US',
        audioTrack,
        onStart: () => {
          if (currentGeneration === generation) state.value = 'listening'
        },
        onResult: (update) => {
          if (currentGeneration !== generation) return
          interimTranscript.value = update.interimTranscript
          finalTranscript.value = update.finalTranscript
        },
        onError: (code) => {
          if (currentGeneration !== generation) return
          failed = true
          errorMessage.value = speechErrorText(code)
          state.value = 'error'
        },
        onEnd: () => {
          if (currentGeneration !== generation) return
          session = null
          interimTranscript.value = ''
          if (!failed) state.value = 'completed'
        }
      })
    } catch {
      errorMessage.value = speechErrorText('unavailable')
      state.value = 'error'
    }
  }

  function stop(): void {
    if (!session) return
    if (state.value === 'error') {
      session.abort()
      session = null
      return
    }
    state.value = 'stopping'
    session.stop()
  }

  onBeforeUnmount(abort)

  return {
    state,
    interimTranscript,
    finalTranscript,
    visibleTranscript,
    errorMessage,
    isSupported,
    start,
    stop,
    abort
  }
}
