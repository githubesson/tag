import { useRef, useCallback, type ReactNode, type DragEvent } from 'react'
import { cn } from '@/lib/utils'

interface FileDropZoneProps {
  onFilesDropped: (paths: string[]) => void
  children: ReactNode
  className?: string
}

const AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.m4a'])

export function FileDropZone({ onFilesDropped, children, className }: FileDropZoneProps) {
  const dragCounter = useRef(0)
  const overlayRef = useRef<HTMLDivElement>(null)

  const showOverlay = (show: boolean) => {
    if (overlayRef.current) {
      overlayRef.current.style.display = show ? 'flex' : 'none'
    }
  }

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current++
    if (dragCounter.current === 1) {
      showOverlay(true)
    }
  }, [])

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current === 0) {
      showOverlay(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dragCounter.current = 0
      showOverlay(false)

      const paths: string[] = []
      for (const file of Array.from(e.dataTransfer.files)) {
        const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
        if (AUDIO_EXTENSIONS.has(ext)) {
          const path = window.electronAPI.getPathForFile(file)
          if (path) paths.push(path)
        }
      }
      if (paths.length > 0) {
        onFilesDropped(paths)
      }
    },
    [onFilesDropped]
  )

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn('relative', className)}
    >
      {children}
      <div
        ref={overlayRef}
        style={{ display: 'none' }}
        className="absolute inset-0 z-10 items-center justify-center rounded-lg border-2 border-dashed border-primary/50 bg-primary/5"
      >
        <p className="text-sm font-medium text-primary">Drop audio files here</p>
      </div>
    </div>
  )
}
