import { describe, expect, it } from 'vitest'
import {
  createRecordingBlob,
  prefersMp4Recording,
  recordingMimeCandidates,
  selectRecordingMimeType
} from './AudioRecordingService'

describe('AudioRecordingService', () => {
  it('prefers MP4 on iPhone and Safari', () => {
    expect(
      prefersMp4Recording({
        userAgent: 'Mozilla/5.0 (iPhone) AppleWebKit/605.1.15 CriOS/140',
        vendor: 'Apple Computer, Inc.',
        platform: 'iPhone'
      })
    ).toBe(true)
    expect(recordingMimeCandidates(true)[0]).toContain('audio/mp4')
  })

  it('prefers WebM on Chromium desktop', () => {
    const prefersMp4 = prefersMp4Recording({
      userAgent: 'Mozilla/5.0 AppleWebKit/537.36 Chrome/140 Safari/537.36',
      vendor: 'Google Inc.',
      platform: 'MacIntel'
    })

    expect(prefersMp4).toBe(false)
    expect(recordingMimeCandidates(prefersMp4)[0]).toBe(
      'audio/webm;codecs=opus'
    )
  })

  it('selects only a format that can be recorded and played', () => {
    const selected = selectRecordingMimeType(
      ['audio/webm;codecs=opus', 'audio/mp4'],
      {
        canRecord: () => true,
        canPlay: (mimeType) => mimeType === 'audio/mp4'
      }
    )

    expect(selected).toBe('audio/mp4')
  })

  it('rejects empty data and combines usable recording chunks', () => {
    expect(createRecordingBlob([new Blob([])], 'audio/mp4')).toBeNull()

    const blob = createRecordingBlob(
      [new Blob([new Uint8Array(180)]), new Blob([new Uint8Array(120)])],
      'audio/mp4'
    )

    expect(blob?.size).toBe(300)
    expect(blob?.type).toBe('audio/mp4')
  })
})
