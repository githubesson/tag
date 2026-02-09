import { Minus, Square, X } from 'lucide-react'

export function Titlebar() {
  return (
    <div
      className="flex h-9 shrink-0 items-center justify-between border-b border-border bg-background select-none"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <div className="flex items-center gap-2 pl-3">
        <span className="text-xs font-semibold tracking-wide text-foreground">Tag</span>
      </div>
      <div
        className="flex h-full"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <button
          onClick={() => window.electronAPI.minimizeWindow()}
          className="flex h-full w-11 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Minus className="size-3.5" />
        </button>
        <button
          onClick={() => window.electronAPI.maximizeWindow()}
          className="flex h-full w-11 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Square className="size-3" />
        </button>
        <button
          onClick={() => window.electronAPI.closeWindow()}
          className="flex h-full w-11 items-center justify-center text-muted-foreground transition-colors hover:bg-destructive hover:text-white"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
