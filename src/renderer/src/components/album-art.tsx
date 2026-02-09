import { ImagePlus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { AlbumArt as AlbumArtType } from '../../../shared/types'

interface AlbumArtProps {
  albumArt: AlbumArtType | undefined
  isMixed?: boolean
  onUpdate: (art: AlbumArtType | undefined) => void
}

function getMimeType(path: string): string {
  const ext = path.slice(path.lastIndexOf('.')).toLowerCase()
  switch (ext) {
    case '.jpg': case '.jpeg': return 'image/jpeg'
    case '.png': return 'image/png'
    case '.webp': return 'image/webp'
    default: return 'application/octet-stream'
  }
}

export function AlbumArt({ albumArt, isMixed, onUpdate }: AlbumArtProps) {
  const handleChange = async () => {
    const filePath = await window.electronAPI.openAlbumArtDialog()
    if (!filePath) return

    const base64 = await window.electronAPI.readFileAsBase64(filePath)
    onUpdate({
      mimeType: getMimeType(filePath),
      data: base64,
    })
  }

  const handleRemove = () => {
    onUpdate(undefined)
  }

  return (
    <div className="flex shrink-0 flex-col gap-1.5">
      <div className="relative size-32 overflow-hidden rounded-lg border border-border bg-muted">
        {albumArt ? (
          <img
            src={`data:${albumArt.mimeType};base64,${albumArt.data}`}
            alt="Album art"
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-1">
            <ImagePlus className="size-8 text-muted-foreground/30" />
            {isMixed && <span className="text-[10px] italic text-muted-foreground/50">Mixed</span>}
          </div>
        )}
      </div>
      <div className="flex gap-1">
        <Button variant="outline" size="xs" className="flex-1" onClick={handleChange}>
          {albumArt ? 'Change' : 'Add'}
        </Button>
        {albumArt && (
          <Button variant="outline" size="icon-xs" onClick={handleRemove}>
            <Trash2 className="size-3" />
          </Button>
        )}
      </div>
    </div>
  )
}
