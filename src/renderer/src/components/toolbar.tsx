import { FolderOpen, Save, SaveAll } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface ToolbarProps {
  onOpenFiles: () => void
  onSave: () => void
  onSaveAll: () => void
  canSave: boolean
  canSaveAll: boolean
  isSaving: boolean
}

export function Toolbar({ onOpenFiles, onSave, onSaveAll, canSave, canSaveAll, isSaving }: ToolbarProps) {
  return (
    <div className="flex h-10 shrink-0 items-center gap-1 border-b border-border bg-background px-2">
      <Button variant="ghost" size="sm" onClick={onOpenFiles}>
        <FolderOpen data-icon="inline-start" className="size-3.5" />
        Open
      </Button>
      <Separator orientation="vertical" className="mx-1 h-5" />
      <Button variant="ghost" size="sm" onClick={onSave} disabled={!canSave || isSaving}>
        <Save data-icon="inline-start" className="size-3.5" />
        Save
      </Button>
      <Button variant="ghost" size="sm" onClick={onSaveAll} disabled={!canSaveAll || isSaving}>
        <SaveAll data-icon="inline-start" className="size-3.5" />
        Save All
      </Button>
    </div>
  )
}
