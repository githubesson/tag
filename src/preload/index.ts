import { contextBridge, ipcRenderer, webUtils } from 'electron'
import { IPC_CHANNELS } from '../shared/types'
import type { AudioMetadata, AudioTagWritePayload, WriteResult } from '../shared/types'

const electronAPI = {
  openFileDialog: (): Promise<string[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.OPEN_FILE_DIALOG),

  readTags: (filePaths: string[]): Promise<AudioMetadata[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.READ_TAGS, filePaths),

  writeTags: (payload: AudioTagWritePayload): Promise<WriteResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.WRITE_TAGS, payload),

  writeTagsBatch: (payloads: AudioTagWritePayload[]): Promise<WriteResult[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.WRITE_TAGS_BATCH, payloads),

  openAlbumArtDialog: (): Promise<string | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.GET_ALBUM_ART_PATH),

  readFileAsBase64: (filePath: string): Promise<string> =>
    ipcRenderer.invoke(IPC_CHANNELS.READ_FILE_AS_BASE64, filePath),

  showInFolder: (filePath: string): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.SHOW_FILE_IN_FOLDER, filePath),

  minimizeWindow: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MINIMIZE),

  maximizeWindow: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MAXIMIZE),

  closeWindow: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.WINDOW_CLOSE),

  getPathForFile: (file: File): string =>
    webUtils.getPathForFile(file),

  onFilesOpen: (callback: (paths: string[]) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, paths: string[]) => callback(paths)
    ipcRenderer.on('files:open', handler)
    return () => ipcRenderer.removeListener('files:open', handler)
  },
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

export type ElectronAPI = typeof electronAPI
