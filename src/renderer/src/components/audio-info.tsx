import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { AudioMetadata } from '../../../shared/types'

interface AudioInfoProps {
  file: AudioMetadata
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function AudioInfo({ file }: AudioInfoProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
      <Badge variant="secondary" className="text-[10px] px-1.5 h-4">
        {file.format.toUpperCase()}
      </Badge>
      <Separator orientation="vertical" className="h-3" />
      {file.bitrate > 0 && (
        <>
          <span>{file.bitrate} kbps</span>
          <Separator orientation="vertical" className="h-3" />
        </>
      )}
      {file.sampleRate > 0 && (
        <>
          <span>{(file.sampleRate / 1000).toFixed(1)} kHz</span>
          <Separator orientation="vertical" className="h-3" />
        </>
      )}
      {file.channels > 0 && (
        <>
          <span>{file.channels === 1 ? 'Mono' : file.channels === 2 ? 'Stereo' : `${file.channels}ch`}</span>
          <Separator orientation="vertical" className="h-3" />
        </>
      )}
      {file.duration > 0 && <span>{formatDuration(file.duration)}</span>}
      <span className="ml-auto">{formatFileSize(file.fileSize)}</span>
    </div>
  )
}
