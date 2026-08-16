import { computed, onBeforeUnmount, ref, shallowRef } from 'vue'
import {
  createRecordingBlob,
  prefersMp4Recording,
  recordingMimeCandidates,
  selectRecordingMimeType
} from '@/services/AudioRecordingService'

type RecorderState = 'idle' | 'requesting' | 'recording' | 'recorded' | 'error'

export interface TemporaryRecorderStartOptions {
  shouldContinue?: () => boolean
  onRecordingStarted?: (stream: MediaStream) => void
}

interface WebkitAudioWindow extends Window {
  webkitAudioContext?: typeof AudioContext
}

function canPlayAudio(mimeType: string): boolean {
  if (typeof document === 'undefined') return true
  return document.createElement('audio').canPlayType(mimeType) !== ''
}

function canRecordAudio(mimeType: string): boolean {
  if (typeof MediaRecorder.isTypeSupported !== 'function') {
    return mimeType.startsWith('audio/mp4')
  }
  return MediaRecorder.isTypeSupported(mimeType)
}

function createCompatibleRecorder(stream: MediaStream): MediaRecorder {
  const preferMp4 = prefersMp4Recording({
    userAgent: navigator.userAgent,
    vendor: navigator.vendor,
    platform: navigator.platform
  })
  const candidates = recordingMimeCandidates(preferMp4)
  const support = { canRecord: canRecordAudio, canPlay: canPlayAudio }
  const preferred = selectRecordingMimeType(candidates, support)
  const compatibleCandidates = candidates.filter(
    (type) => type !== preferred && support.canRecord(type) && support.canPlay(type)
  )

  for (const mimeType of preferred
    ? [preferred, ...compatibleCandidates]
    : compatibleCandidates) {
    try {
      return new MediaRecorder(stream, { mimeType })
    } catch {
      // Some mobile browsers report support but reject the constructor.
    }
  }

  return new MediaRecorder(stream)
}

export function useTemporaryRecorder() {
  const state = ref<RecorderState>('idle')
  const audioUrl = ref('')
  const recordingBlob = shallowRef<Blob | null>(null)
  const audioMimeType = ref('')
  const recordedBytes = ref(0)
  const elapsedSeconds = ref(0)
  const inputLevel = ref(0)
  const hasDetectedSound = ref(false)
  const recordingWarning = ref('')
  const errorMessage = ref('')

  let recorder: MediaRecorder | null = null
  let stream: MediaStream | null = null
  let timer: ReturnType<typeof setInterval> | null = null
  let chunks: Blob[] = []
  let generation = 0
  let audioContext: AudioContext | null = null
  let analyser: AnalyserNode | null = null
  let analyserData: Uint8Array<ArrayBuffer> | null = null
  let animationFrame: number | null = null
  let monitorAvailable = false

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

  function stopInputMonitor(): void {
    if (animationFrame !== null) cancelAnimationFrame(animationFrame)
    animationFrame = null
    analyser?.disconnect()
    analyser = null
    analyserData = null
    inputLevel.value = 0
    if (audioContext) void audioContext.close()
    audioContext = null
  }

  function monitorInput(activeStream: MediaStream): void {
    try {
      const AudioContextConstructor =
        window.AudioContext ?? (window as WebkitAudioWindow).webkitAudioContext
      if (!AudioContextConstructor) return

      audioContext = new AudioContextConstructor()
      analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      analyserData = new Uint8Array(analyser.fftSize)
      audioContext.createMediaStreamSource(activeStream).connect(analyser)
      monitorAvailable = true
      if (audioContext.state === 'suspended') void audioContext.resume()

      const sample = () => {
        if (!analyser || !analyserData) return
        analyser.getByteTimeDomainData(analyserData)
        const energy = analyserData.reduce((sum, sampleValue) => {
          const normalized = (sampleValue - 128) / 128
          return sum + normalized * normalized
        }, 0)
        const rms = Math.sqrt(energy / analyserData.length)
        inputLevel.value = Math.min(1, rms * 5)
        if (rms > 0.025) hasDetectedSound.value = true
        animationFrame = requestAnimationFrame(sample)
      }

      sample()
    } catch {
      monitorAvailable = false
      stopInputMonitor()
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
    if (recorder?.state === 'recording') recorder.stop()
    recorder = null
    stopInputMonitor()
    releaseStream()
    revokeAudioUrl()
    chunks = []
    elapsedSeconds.value = 0
    inputLevel.value = 0
    hasDetectedSound.value = false
    recordingWarning.value = ''
    errorMessage.value = ''
    audioMimeType.value = ''
    recordingBlob.value = null
    recordedBytes.value = 0
    monitorAvailable = false
    state.value = 'idle'
  }

  function errorText(error: unknown): string {
    if (error instanceof DOMException && error.name === 'NotAllowedError') {
      return '没有获得麦克风权限，请在浏览器设置中允许后重试。'
    }
    if (error instanceof DOMException && error.name === 'NotFoundError') {
      return '没有找到可用的麦克风。'
    }
    if (error instanceof DOMException && error.name === 'NotSupportedError') {
      return '当前浏览器无法创建可播放的录音格式。'
    }
    return '暂时无法录音，请检查麦克风后重试。'
  }

  async function start(options: TemporaryRecorderStartOptions = {}): Promise<boolean> {
    if (!isSupported.value || state.value === 'requesting' || state.value === 'recording') {
      return false
    }

    reset()
    state.value = 'requesting'
    const currentGeneration = generation

    try {
      const requestedStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })
      if (
        currentGeneration !== generation ||
        options.shouldContinue?.() === false
      ) {
        requestedStream.getTracks().forEach((track) => track.stop())
        if (currentGeneration === generation) state.value = 'idle'
        return false
      }
      stream = requestedStream

      const audioTracks = stream.getAudioTracks()
      if (!audioTracks.some((track) => track.enabled && track.readyState === 'live')) {
        throw new DOMException('No active audio track', 'NotFoundError')
      }

      const activeRecorder = createCompatibleRecorder(stream)
      const recordedMime = activeRecorder.mimeType || 'audio/mp4'
      let recorderFailed = false
      recorder = activeRecorder
      chunks = []
      monitorInput(stream)

      activeRecorder.addEventListener('dataavailable', (event) => {
        if (currentGeneration === generation && event.data.size > 0) {
          chunks.push(event.data)
        }
      })
      activeRecorder.addEventListener('error', () => {
        if (currentGeneration !== generation) return
        recorderFailed = true
        clearTimer()
        stopInputMonitor()
        releaseStream()
        errorMessage.value = '录音过程中发生错误，请重新录制。'
        state.value = 'error'
      })
      activeRecorder.addEventListener('stop', () => {
        if (currentGeneration !== generation || recorderFailed) return
        const hadInputMonitor = monitorAvailable
        clearTimer()
        stopInputMonitor()
        releaseStream()
        recorder = null

        const blob = createRecordingBlob(chunks, recordedMime)
        if (!blob) {
          errorMessage.value = '没有收到有效的录音数据，请确认麦克风后重试。'
          state.value = 'error'
          return
        }

        revokeAudioUrl()
        audioMimeType.value = blob.type
        recordedBytes.value = blob.size
        recordingBlob.value = blob
        audioUrl.value = URL.createObjectURL(blob)
        if (hadInputMonitor && !hasDetectedSound.value) {
          recordingWarning.value = '没有检测到明显声音，请先试听；如果无声请重新录制。'
        }
        state.value = 'recorded'
      })

      // Regular chunks are more reliable on mobile WebKit than one final chunk.
      activeRecorder.start(1000)
      state.value = 'recording'
      options.onRecordingStarted?.(stream)
      timer = setInterval(() => {
        elapsedSeconds.value += 1
      }, 1000)
      return true
    } catch (error) {
      if (currentGeneration !== generation) return false
      clearTimer()
      stopInputMonitor()
      releaseStream()
      errorMessage.value = errorText(error)
      state.value = 'error'
      return false
    }
  }

  function cancelPendingStart(): void {
    if (state.value !== 'requesting') return
    generation += 1
    state.value = 'idle'
  }

  function stop(): void {
    if (recorder?.state === 'recording') recorder.stop()
  }

  onBeforeUnmount(reset)

  return {
    state,
    audioUrl,
    recordingBlob,
    audioMimeType,
    recordedBytes,
    elapsedLabel,
    inputLevel,
    hasDetectedSound,
    recordingWarning,
    errorMessage,
    isSupported,
    start,
    stop,
    cancelPendingStart,
    reset
  }
}
