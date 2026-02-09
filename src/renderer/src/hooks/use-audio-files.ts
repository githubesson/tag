import { useState, useCallback, useMemo } from 'react'
import type { AudioMetadata, AudioTagWritePayload, WriteResult } from '../../../shared/types'

export interface AudioFileState {
  original: AudioMetadata
  current: AudioMetadata
  isDirty: boolean
  isSaving: boolean
}

export function useAudioFiles() {
  const [files, setFiles] = useState<AudioFileState[]>([])
  const [selectedIndices, setSelectedIndices] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const selectedFiles = useMemo(
    () => selectedIndices.map((i) => files[i]).filter(Boolean),
    [files, selectedIndices]
  )

  const hasUnsavedChanges = useMemo(
    () => files.some((f) => f.isDirty),
    [files]
  )

  const addFiles = useCallback(async (paths: string[]) => {
    if (paths.length === 0) return
    setIsLoading(true)
    try {
      const metadata = await window.electronAPI.readTags(paths)
      setFiles((prev) => {
        const existingPaths = new Set(prev.map((f) => f.original.filePath))
        const newFiles = metadata
          .filter((m) => !existingPaths.has(m.filePath))
          .map((m): AudioFileState => ({
            original: m,
            current: { ...m },
            isDirty: false,
            isSaving: false,
          }))
        if (newFiles.length > 0) {
          setSelectedIndices([prev.length])
        }
        return [...prev, ...newFiles]
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const openFiles = useCallback(async () => {
    const paths = await window.electronAPI.openFileDialog()
    await addFiles(paths)
  }, [addFiles])

  const selectFile = useCallback((index: number, opts?: { ctrl?: boolean; shift?: boolean }) => {
    if (opts?.ctrl) {
      setSelectedIndices((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index].sort((a, b) => a - b)
      )
    } else if (opts?.shift) {
      setSelectedIndices((prev) => {
        const anchor = prev.length > 0 ? prev[0] : 0
        const from = Math.min(anchor, index)
        const to = Math.max(anchor, index)
        const range: number[] = []
        for (let i = from; i <= to; i++) range.push(i)
        return range
      })
    } else {
      setSelectedIndices([index])
    }
  }, [])

  const updateField = useCallback(
    <K extends keyof AudioMetadata>(field: K, value: AudioMetadata[K]) => {
      if (selectedIndices.length === 0) return
      const set = new Set(selectedIndices)
      setFiles((prev) =>
        prev.map((f, i) => {
          if (!set.has(i)) return f
          const updated = { ...f.current, [field]: value }
          return {
            ...f,
            current: updated,
            isDirty: JSON.stringify(updated) !== JSON.stringify(f.original),
          }
        })
      )
    },
    [selectedIndices]
  )

  const saveFile = useCallback(async (index: number): Promise<WriteResult> => {
    const file = files[index]
    if (!file) return { success: false, filePath: '', error: 'No file' }

    setFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, isSaving: true } : f))
    )

    const payload: AudioTagWritePayload = {
      filePath: file.current.filePath,
      title: file.current.title ?? null,
      artist: file.current.artist ?? null,
      albumArtist: file.current.albumArtist ?? null,
      album: file.current.album ?? null,
      year: file.current.year ?? null,
      track: file.current.track ?? null,
      trackTotal: file.current.trackTotal ?? null,
      disc: file.current.disc ?? null,
      discTotal: file.current.discTotal ?? null,
      genre: file.current.genre ?? null,
      comment: file.current.comment ?? null,
      composer: file.current.composer ?? null,
      lyrics: file.current.lyrics ?? null,
      albumArt: file.current.albumArt ?? null,
    }

    const result = await window.electronAPI.writeTags(payload)

    if (result.success) {
      const refreshed = await window.electronAPI.readTags([file.current.filePath])
      setFiles((prev) =>
        prev.map((f, i) =>
          i === index
            ? {
                original: refreshed[0],
                current: { ...refreshed[0] },
                isDirty: false,
                isSaving: false,
              }
            : f
        )
      )
    } else {
      setFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, isSaving: false } : f))
      )
    }

    return result
  }, [files])

  const saveSelected = useCallback(async (): Promise<WriteResult[]> => {
    const dirty = selectedIndices.filter((i) => files[i]?.isDirty)
    return Promise.all(dirty.map(saveFile))
  }, [selectedIndices, files, saveFile])

  const saveAllFiles = useCallback(async (): Promise<WriteResult[]> => {
    const dirtyIndices = files
      .map((f, i) => (f.isDirty ? i : -1))
      .filter((i) => i !== -1)
    return Promise.all(dirtyIndices.map(saveFile))
  }, [files, saveFile])

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setSelectedIndices((prev) =>
      prev
        .filter((i) => i !== index)
        .map((i) => (i > index ? i - 1 : i))
    )
  }, [])

  return {
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
  }
}
