import { describe, expect, it, vi } from 'vitest'
import {
  BrowserSpeechRecognitionProvider,
  type SpeechRecognitionScope
} from './BrowserSpeechRecognitionProvider'

class FakeRecognition {
  static latest: FakeRecognition | null = null
  static rejectAudioTrack = false

  lang = ''
  continuous = true
  interimResults = false
  maxAlternatives = 0
  onstart: (() => void) | null = null
  onresult: ((event: never) => void) | null = null
  onerror: ((event: never) => void) | null = null
  onend: (() => void) | null = null
  start = vi.fn((audioTrack?: MediaStreamTrack) => {
    if (audioTrack && FakeRecognition.rejectAudioTrack) {
      throw new TypeError('audio track unsupported')
    }
    this.onstart?.()
  })
  stop = vi.fn(() => this.onend?.())
  abort = vi.fn(() => this.onend?.())

  constructor() {
    FakeRecognition.latest = this
  }

  emitResult(results: Array<{ transcript: string; isFinal: boolean }>): void {
    const resultList = results.map(({ transcript, isFinal }) =>
      Object.assign([{ transcript }], { isFinal })
    )
    this.onresult?.({ resultIndex: 0, results: resultList } as never)
  }
}

function scopeWith(
  key: 'SpeechRecognition' | 'webkitSpeechRecognition' = 'SpeechRecognition'
): SpeechRecognitionScope {
  return { [key]: FakeRecognition } as unknown as SpeechRecognitionScope
}

describe('BrowserSpeechRecognitionProvider', () => {
  it('detects the prefixed Safari implementation', () => {
    const provider = new BrowserSpeechRecognitionProvider(
      scopeWith('webkitSpeechRecognition')
    )

    expect(provider.isSupported()).toBe(true)
  })

  it('configures English recognition and returns only final text', () => {
    const provider = new BrowserSpeechRecognitionProvider(scopeWith())
    const onResult = vi.fn()
    const onEnd = vi.fn()
    const audioTrack = {} as MediaStreamTrack

    const session = provider.startLive({
      language: 'en-US',
      audioTrack,
      onResult,
      onError: vi.fn(),
      onEnd
    })
    const recognition = FakeRecognition.latest
    expect(recognition).not.toBeNull()
    if (!recognition) return

    expect(recognition.lang).toBe('en-US')
    expect(recognition.interimResults).toBe(false)
    expect(recognition.start).toHaveBeenCalledWith(audioTrack)

    recognition.emitResult([{ transcript: 'Do you have', isFinal: false }])
    expect(onResult).not.toHaveBeenCalled()
    recognition.emitResult([
      { transcript: 'Do you have any brothers or sisters?', isFinal: true }
    ])

    expect(onResult).toHaveBeenLastCalledWith({
      interimTranscript: '',
      finalTranscript: 'Do you have any brothers or sisters?'
    })

    session.stop()
    expect(recognition.stop).toHaveBeenCalledTimes(1)
    expect(onEnd).toHaveBeenCalledTimes(1)
  })

  it('falls back to microphone start when audio-track input is rejected', () => {
    FakeRecognition.rejectAudioTrack = true
    const provider = new BrowserSpeechRecognitionProvider(scopeWith())
    provider.startLive({
      language: 'en-US',
      audioTrack: {} as MediaStreamTrack,
      onResult: vi.fn(),
      onError: vi.fn(),
      onEnd: vi.fn()
    })
    const recognition = FakeRecognition.latest
    expect(recognition).not.toBeNull()
    if (!recognition) return

    expect(recognition.start).toHaveBeenCalledTimes(2)
    expect(recognition.start).toHaveBeenLastCalledWith()
    FakeRecognition.rejectAudioTrack = false
  })
})
