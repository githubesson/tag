import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join, extname } from 'path'
import { readFileSync } from 'fs'
import { readTags, writeTags } from './services/tag-service'
import { IPC_CHANNELS } from '../shared/types'
import type { AudioTagWritePayload } from '../shared/types'

const AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.m4a'])

let mainWindow: BrowserWindow | null = null

function getAudioPathsFromArgs(argv: string[]): string[] {
  return argv.filter((arg) => AUDIO_EXTENSIONS.has(extname(arg).toLowerCase()))
}

function sendFilesToRenderer(paths: string[]): void {
  if (paths.length > 0 && mainWindow) {
    mainWindow.webContents.send('files:open', paths)
  }
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    icon: join(__dirname, '../../resources/icon.ico'),
    backgroundColor: '#0a0a0a',
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function registerIpcHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.OPEN_FILE_DIALOG, async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Audio Files', extensions: ['mp3', 'wav', 'm4a'] }
      ]
    })
    return result.canceled ? [] : result.filePaths
  })

  ipcMain.handle(IPC_CHANNELS.READ_TAGS, async (_event, filePaths: string[]) => {
    return Promise.all(filePaths.map(readTags))
  })

  ipcMain.handle(IPC_CHANNELS.WRITE_TAGS, async (_event, payload: AudioTagWritePayload) => {
    return writeTags(payload)
  })

  ipcMain.handle(IPC_CHANNELS.WRITE_TAGS_BATCH, async (_event, payloads: AudioTagWritePayload[]) => {
    return Promise.all(payloads.map(writeTags))
  })

  ipcMain.handle(IPC_CHANNELS.GET_ALBUM_ART_PATH, async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp'] }
      ]
    })
    return result.canceled ? null : result.filePaths[0]
  })

  ipcMain.handle(IPC_CHANNELS.READ_FILE_AS_BASE64, (_event, filePath: string) => {
    const buffer = readFileSync(filePath)
    return buffer.toString('base64')
  })

  ipcMain.handle(IPC_CHANNELS.SHOW_FILE_IN_FOLDER, (_event, filePath: string) => {
    shell.showItemInFolder(filePath)
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW_MINIMIZE, () => {
    mainWindow?.minimize()
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW_MAXIMIZE, () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow?.maximize()
    }
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW_CLOSE, () => {
    mainWindow?.close()
  })
}

const gotLock = app.requestSingleInstanceLock()

if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', (_event, argv) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
      sendFilesToRenderer(getAudioPathsFromArgs(argv))
    }
  })

  app.whenReady().then(() => {
    registerIpcHandlers()
    createWindow()

    mainWindow!.webContents.once('did-finish-load', () => {
      sendFilesToRenderer(getAudioPathsFromArgs(process.argv))
    })

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

    app.on('open-file', (_event, path) => {
      sendFilesToRenderer([path])
    })
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })
}
