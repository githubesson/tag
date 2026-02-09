export interface AudioMetadata {
  filePath: string
  fileName: string
  fileSize: number
  format: 'mp3' | 'wav' | 'm4a' | 'unknown'
  duration: number
  bitrate: number
  sampleRate: number
  channels: number

  title: string | undefined
  artist: string | undefined
  albumArtist: string | undefined
  album: string | undefined
  year: number | undefined
  track: number | undefined
  trackTotal: number | undefined
  disc: number | undefined
  discTotal: number | undefined
  genre: string | undefined
  comment: string | undefined
  composer: string | undefined
  lyrics: string | undefined

  albumArt: AlbumArt | undefined
}

export interface AlbumArt {
  mimeType: string
  data: string
}

export interface AudioTagWritePayload {
  filePath: string
  title?: string | null
  artist?: string | null
  albumArtist?: string | null
  album?: string | null
  year?: number | null
  track?: number | null
  trackTotal?: number | null
  disc?: number | null
  discTotal?: number | null
  genre?: string | null
  comment?: string | null
  composer?: string | null
  lyrics?: string | null
  albumArt?: { mimeType: string; data: string } | null
}

export interface WriteResult {
  success: boolean
  filePath: string
  error?: string
}

export const IPC_CHANNELS = {
  OPEN_FILE_DIALOG: 'dialog:openFiles',
  READ_TAGS: 'tags:read',
  WRITE_TAGS: 'tags:write',
  WRITE_TAGS_BATCH: 'tags:writeBatch',
  GET_ALBUM_ART_PATH: 'dialog:openAlbumArt',
  READ_FILE_AS_BASE64: 'fs:readFileBase64',
  SHOW_FILE_IN_FOLDER: 'shell:showInFolder',
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_CLOSE: 'window:close',
} as const
