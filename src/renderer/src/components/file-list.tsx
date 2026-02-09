import { useState, useEffect, useRef, useCallback, type MouseEvent } from 'react'
import { Music, FileAudio, Save, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { AudioFileState } from '@/hooks/use-audio-files'

interface FileListProps {
  files: AudioFileState[]
  selectedIndices: number[]
  onSelect: (index: number, opts?: { ctrl?: boolean; shift?: boolean }) => void
  onSave: (index: number) => void
  onRemove: (index: number) => void
}

interface ContextMenu {
  x: number
  y: number
  index: number
}

function formatBadge(format: string) {
  switch (format) {
    case 'mp3': return 'MP3'
    case 'wav': return 'WAV'
    case 'm4a': return 'M4A'
    default: return format.toUpperCase()
  }
}

export function FileList({ files, selectedIndices, onSelect, onSave, onRemove }: FileListProps) {
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const selected = new Set(selectedIndices)

  const handleContextMenu = useCallback((e: MouseEvent, index: number) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, index })
  }, [])

  const closeMenu = useCallback(() => setContextMenu(null), [])

  useEffect(() => {
    if (!contextMenu) return
    const handleClick = (e: globalThis.MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu()
      }
    }
    window.addEventListener('mousedown', handleClick)
    return () => window.removeEventListener('mousedown', handleClick)
  }, [contextMenu, closeMenu])

  if (files.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
        <FileAudio className="size-8 text-muted-foreground/50" />
        <p className="text-xs text-muted-foreground">
          Open files or drag & drop audio files here
        </p>
      </div>
    )
  }

  return (
    <>
      <ScrollArea className="h-full">
        <div className="flex flex-col gap-px p-1">
          {files.map((file, index) => (
            <button
              key={file.original.filePath}
              onClick={(e) => onSelect(index, { ctrl: e.ctrlKey || e.metaKey, shift: e.shiftKey })}
              onContextMenu={(e) => handleContextMenu(e, index)}
              className={cn(
                'flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors',
                selected.has(index)
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Music className="size-3.5 shrink-0" />
              <span className="min-w-0 flex-1 truncate">{file.current.fileName}</span>
              {file.isDirty && (
                <span className="size-1.5 shrink-0 rounded-full bg-primary" />
              )}
              <Badge variant="secondary" className="shrink-0 text-[10px] px-1.5 h-4">
                {formatBadge(file.current.format)}
              </Badge>
            </button>
          ))}
        </div>
      </ScrollArea>

      {contextMenu && (
        <div
          ref={menuRef}
          className="fixed z-50 min-w-36 overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
            disabled={!files[contextMenu.index]?.isDirty}
            onClick={() => { onSave(contextMenu.index); closeMenu() }}
          >
            <Save className="size-3.5" />
            Save
          </button>
          <button
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-destructive/10 hover:text-destructive"
            onClick={() => { onRemove(contextMenu.index); closeMenu() }}
          >
            <X className="size-3.5" />
            Remove
          </button>
        </div>
      )}
    </>
  )
}
