export type SpeechTranscriptionState =
  | 'idle'
  | 'starting'
  | 'listening'
  | 'stopping'
  | 'completed'
  | 'error'

export interface SpeechTranscriptUpdate {
  interimTranscript: string
  finalTranscript: string
}

export interface SpeechToTextCapabilities {
  liveMicrophone: boolean
  recordedAudio: boolean
}

export interface LiveSpeechRecognitionOptions {
  language: string
  audioTrack?: MediaStreamTrack
  onStart?: () => void
  onResult: (update: SpeechTranscriptUpdate) => void
  onError: (code: string) => void
  onEnd: () => void
}

export interface SpeechRecognitionSession {
  stop: () => void
  abort: () => void
}

export interface RecordedAudioTranscriptionOptions {
  language: string
}

export interface SpeechToTextProvider {
  readonly id: string
  readonly capabilities: SpeechToTextCapabilities
  isSupported: () => boolean
  startLive: (
    options: LiveSpeechRecognitionOptions
  ) => SpeechRecognitionSession
  transcribeRecording?: (
    recording: Blob,
    options: RecordedAudioTranscriptionOptions
  ) => Promise<string>
}
