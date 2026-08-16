import type {
  LiveSpeechRecognitionOptions,
  SpeechRecognitionSession,
  SpeechToTextCapabilities,
  SpeechToTextProvider
} from '@/services/speech/types'

interface BrowserSpeechAlternative {
  transcript: string
}

interface BrowserSpeechResult {
  readonly isFinal: boolean
  readonly length: number
  readonly [index: number]: BrowserSpeechAlternative
}

interface BrowserSpeechResultList {
  readonly length: number
  readonly [index: number]: BrowserSpeechResult
}

interface BrowserSpeechResultEvent extends Event {
  readonly resultIndex: number
  readonly results: BrowserSpeechResultList
}

interface BrowserSpeechErrorEvent extends Event {
  readonly error: string
}

interface BrowserSpeechRecognition {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  onstart: (() => void) | null
  onresult: ((event: BrowserSpeechResultEvent) => void) | null
  onerror: ((event: BrowserSpeechErrorEvent) => void) | null
  onend: (() => void) | null
  start: (audioTrack?: MediaStreamTrack) => void
  stop: () => void
  abort: () => void
}

interface BrowserSpeechRecognitionConstructor {
  new (): BrowserSpeechRecognition
}

export interface SpeechRecognitionScope {
  SpeechRecognition?: BrowserSpeechRecognitionConstructor
  webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor
}

function defaultScope(): SpeechRecognitionScope | undefined {
  return typeof window === 'undefined'
    ? undefined
    : (window as Window & SpeechRecognitionScope)
}

export class BrowserSpeechRecognitionProvider implements SpeechToTextProvider {
  readonly id = 'browser-speech-recognition'
  readonly capabilities: SpeechToTextCapabilities = {
    liveMicrophone: true,
    recordedAudio: false
  }

  constructor(private readonly scope = defaultScope()) {}

  isSupported(): boolean {
    return Boolean(this.getConstructor())
  }

  startLive(options: LiveSpeechRecognitionOptions): SpeechRecognitionSession {
    const Recognition = this.getConstructor()
    if (!Recognition) throw new Error('speech-recognition-not-supported')

    const recognition = new Recognition()
    let finalTranscript = ''
    let ended = false

    recognition.lang = options.language
    recognition.continuous = false
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onstart = () => options.onStart?.()
    recognition.onresult = (event) => {
      let receivedFinalResult = false

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index]
        const transcript = result?.[0]?.transcript?.trim()
        if (!transcript || !result.isFinal) continue
        finalTranscript = [finalTranscript, transcript].filter(Boolean).join(' ')
        receivedFinalResult = true
      }

      if (!receivedFinalResult) return
      options.onResult({
        interimTranscript: '',
        finalTranscript: finalTranscript.trim()
      })
    }
    recognition.onerror = (event) => options.onError(event.error)
    recognition.onend = () => {
      if (ended) return
      ended = true
      options.onEnd()
    }

    try {
      if (options.audioTrack) recognition.start(options.audioTrack)
      else recognition.start()
    } catch (error) {
      if (!options.audioTrack) throw error
      // Older implementations only accept start() without a MediaStreamTrack.
      recognition.start()
    }

    return {
      stop: () => {
        if (!ended) recognition.stop()
      },
      abort: () => {
        if (!ended) recognition.abort()
      }
    }
  }

  private getConstructor(): BrowserSpeechRecognitionConstructor | undefined {
    return this.scope?.SpeechRecognition ?? this.scope?.webkitSpeechRecognition
  }
}
