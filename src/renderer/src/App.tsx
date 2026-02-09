import { useEffect, useCallback } from 'react'
import { Titlebar } from '@/components/titlebar'
import { Toolbar } from '@/components/toolbar'
import { FileList } from '@/components/file-list'
import { TagEditor } from '@/components/tag-editor'
import { FileDropZone } from '@/components/file-drop-zone'
import { useAudioFiles } from '@/hooks/use-audio-files'

export default function App() {
  const {
    files,
    selectedIndices,
    selectedFiles,
    isLoading,
    hasUnsavedChanges,
    openFiles,
    addFiles,
    selectFile,
    updateField,
    saveFile,
    saveSelected,
    saveAllFiles,
    removeFile,
  } = useAudioFiles()

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault()
        openFiles()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (e.shiftKey) {
          saveAllFiles()
        } else {
          saveSelected()
        }
      }
    },
    [openFiles, saveSelected, saveAllFiles]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    return window.electronAPI.onFilesOpen((paths) => {
      addFiles(paths)
    })
  }, [addFiles])

  const canSave = selectedFiles.some((f) => f.isDirty)

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <Titlebar />
      <Toolbar
        onOpenFiles={openFiles}
        onSave={saveSelected}
        onSaveAll={saveAllFiles}
        canSave={canSave}
        canSaveAll={hasUnsavedChanges}
        isSaving={isLoading}
      />
      <div className="flex min-h-0 flex-1">
        <FileDropZone
          onFilesDropped={addFiles}
          className="flex w-56 shrink-0 flex-col border-r border-border"
        >
          <FileList
            files={files}
            selectedIndices={selectedIndices}
            onSelect={selectFile}
            onSave={saveFile}
            onRemove={removeFile}
          />
        </FileDropZone>
        <div className="min-w-0 flex-1">
          <TagEditor selectedFiles={selectedFiles} onUpdateField={updateField} />
        </div>
      </div>
    </div>
  )
}
