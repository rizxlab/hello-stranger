import { describe, expect, it, vi } from 'vitest'
import { SpeechToTextService } from './SpeechToTextService'
import type { SpeechToTextProvider } from './types'

function provider(overrides: Partial<SpeechToTextProvider> = {}): SpeechToTextProvider {
  return {
    id: 'test-provider',
    capabilities: { liveMicrophone: true, recordedAudio: false },
    isSupported: () => true,
    startLive: () => ({ stop: vi.fn(), abort: vi.fn() }),
    ...overrides
  }
}

describe('SpeechToTextService', () => {
  it('keeps recorded-audio transcription behind a provider capability', async () => {
    const service = new SpeechToTextService(provider())

    await expect(
      service.transcribeRecording(new Blob(['audio']), { language: 'en-US' })
    ).rejects.toThrow('recorded-audio-transcription-not-supported')
  })

  it('can use a future provider without changing the service API', async () => {
    const transcribeRecording = vi.fn(async () => 'I have one sister.')
    const service = new SpeechToTextService(
      provider({
        capabilities: { liveMicrophone: false, recordedAudio: true },
        transcribeRecording
      })
    )
    const recording = new Blob(['audio'])

    await expect(
      service.transcribeRecording(recording, { language: 'en-US' })
    ).resolves.toBe('I have one sister.')
    expect(transcribeRecording).toHaveBeenCalledWith(recording, {
      language: 'en-US'
    })
  })
})
