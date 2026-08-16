export interface BrowserIdentity {
  userAgent?: string
  vendor?: string
  platform?: string
}

export interface AudioFormatSupport {
  canRecord: (mimeType: string) => boolean
  canPlay: (mimeType: string) => boolean
}

const MP4_FORMATS = ['audio/mp4;codecs=mp4a.40.2', 'audio/mp4'] as const
const WEBM_FORMATS = ['audio/webm;codecs=opus', 'audio/webm'] as const

export const MIN_RECORDING_BYTES = 256

export function prefersMp4Recording(identity: BrowserIdentity): boolean {
  const userAgent = identity.userAgent ?? ''
  const vendor = identity.vendor ?? ''
  const platform = identity.platform ?? ''
  const isIOS = /iPad|iPhone|iPod/i.test(`${userAgent} ${platform}`)
  const isSafari =
    /Apple/i.test(vendor) &&
    /Safari/i.test(userAgent) &&
    !/Chrome|Chromium|CriOS|Edg|OPR|FxiOS/i.test(userAgent)

  return isIOS || isSafari
}

export function recordingMimeCandidates(preferMp4: boolean): readonly string[] {
  return preferMp4
    ? [...MP4_FORMATS, ...WEBM_FORMATS]
    : [...WEBM_FORMATS, ...MP4_FORMATS]
}

export function selectRecordingMimeType(
  candidates: readonly string[],
  support: AudioFormatSupport
): string | undefined {
  return candidates.find(
    (mimeType) => support.canRecord(mimeType) && support.canPlay(mimeType)
  )
}

export function createRecordingBlob(
  chunks: readonly Blob[],
  mimeType: string
): Blob | null {
  const usableChunks = chunks.filter((chunk) => chunk.size > 0)
  const totalBytes = usableChunks.reduce((sum, chunk) => sum + chunk.size, 0)

  if (totalBytes < MIN_RECORDING_BYTES) return null
  return new Blob(usableChunks, { type: mimeType })
}
