import { BrowserSpeechRecognitionProvider } from '@/services/speech/providers/BrowserSpeechRecognitionProvider'
import type {
  LiveSpeechRecognitionOptions,
  RecordedAudioTranscriptionOptions,
  SpeechRecognitionSession,
  SpeechToTextCapabilities,
  SpeechToTextProvider
} from '@/services/speech/types'

export class SpeechToTextService {
  constructor(private readonly provider: SpeechToTextProvider) {}

  get providerId(): string {
    return this.provider.id
  }

  get capabilities(): SpeechToTextCapabilities {
    return this.provider.capabilities
  }

  isSupported(): boolean {
    return this.provider.isSupported()
  }

  startLive(options: LiveSpeechRecognitionOptions): SpeechRecognitionSession {
    if (!this.provider.capabilities.liveMicrophone || !this.provider.isSupported()) {
      throw new Error('speech-recognition-not-supported')
    }
    return this.provider.startLive(options)
  }

  async transcribeRecording(
    recording: Blob,
    options: RecordedAudioTranscriptionOptions
  ): Promise<string> {
    if (!this.provider.capabilities.recordedAudio || !this.provider.transcribeRecording) {
      throw new Error('recorded-audio-transcription-not-supported')
    }
    return this.provider.transcribeRecording(recording, options)
  }
}

export const speechToTextService = new SpeechToTextService(
  new BrowserSpeechRecognitionProvider()
)
