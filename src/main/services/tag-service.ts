import { File as TagFile, ByteVector, PictureType, Picture } from 'node-taglib-sharp'
import { stat } from 'fs/promises'
import { basename, extname } from 'path'
import type { AudioMetadata, AudioTagWritePayload, WriteResult, AlbumArt } from '../../shared/types'

function detectFormat(filePath: string): AudioMetadata['format'] {
  const ext = extname(filePath).toLowerCase()
  switch (ext) {
    case '.mp3': return 'mp3'
    case '.wav': return 'wav'
    case '.m4a': return 'm4a'
    default: return 'unknown'
  }
}

export async function readTags(filePath: string): Promise<AudioMetadata> {
  const fileStat = await stat(filePath)
  const tagFile = TagFile.createFromPath(filePath)

  try {
    const tag = tagFile.tag
    const props = tagFile.properties

    let albumArt: AlbumArt | undefined
    if (tag.pictures.length > 0) {
      const pic = tag.pictures[0]
      albumArt = {
        mimeType: pic.mimeType,
        data: Buffer.from(pic.data.toByteArray()).toString('base64'),
      }
    }

    return {
      filePath,
      fileName: basename(filePath),
      fileSize: fileStat.size,
      format: detectFormat(filePath),
      duration: props.durationMilliseconds / 1000,
      bitrate: props.audioBitrate,
      sampleRate: props.audioSampleRate,
      channels: props.audioChannels,
      title: tag.title || undefined,
      artist: tag.performers?.join('; ') || undefined,
      albumArtist: tag.albumArtists?.join('; ') || undefined,
      album: tag.album || undefined,
      year: tag.year || undefined,
      track: tag.track || undefined,
      trackTotal: tag.trackCount || undefined,
      disc: tag.disc || undefined,
      discTotal: tag.discCount || undefined,
      genre: tag.genres?.join('; ') || undefined,
      comment: tag.comment || undefined,
      composer: tag.composers?.join('; ') || undefined,
      lyrics: tag.lyrics || undefined,
      albumArt,
    }
  } finally {
    tagFile.dispose()
  }
}

export async function writeTags(payload: AudioTagWritePayload): Promise<WriteResult> {
  try {
    const tagFile = TagFile.createFromPath(payload.filePath)

    try {
      const tag = tagFile.tag

      if (payload.title !== undefined)
        tag.title = payload.title ?? ''
      if (payload.artist !== undefined)
        tag.performers = payload.artist ? payload.artist.split('; ') : []
      if (payload.albumArtist !== undefined)
        tag.albumArtists = payload.albumArtist ? payload.albumArtist.split('; ') : []
      if (payload.album !== undefined)
        tag.album = payload.album ?? ''
      if (payload.year !== undefined)
        tag.year = payload.year ?? 0
      if (payload.track !== undefined)
        tag.track = payload.track ?? 0
      if (payload.trackTotal !== undefined)
        tag.trackCount = payload.trackTotal ?? 0
      if (payload.disc !== undefined)
        tag.disc = payload.disc ?? 0
      if (payload.discTotal !== undefined)
        tag.discCount = payload.discTotal ?? 0
      if (payload.genre !== undefined)
        tag.genres = payload.genre ? payload.genre.split('; ') : []
      if (payload.comment !== undefined)
        tag.comment = payload.comment ?? ''
      if (payload.composer !== undefined)
        tag.composers = payload.composer ? payload.composer.split('; ') : []
      if (payload.lyrics !== undefined)
        tag.lyrics = payload.lyrics ?? ''

      if (payload.albumArt !== undefined) {
        if (payload.albumArt === null) {
          tag.pictures = []
        } else {
          const imgBuffer = Buffer.from(payload.albumArt.data, 'base64')
          const byteVector = ByteVector.fromByteArray(imgBuffer)
          const pic = Picture.fromFullData(
            byteVector,
            PictureType.FrontCover,
            payload.albumArt.mimeType,
            'Cover'
          )
          tag.pictures = [pic]
        }
      }

      tagFile.save()
      return { success: true, filePath: payload.filePath }
    } finally {
      tagFile.dispose()
    }
  } catch (error) {
    return {
      success: false,
      filePath: payload.filePath,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
