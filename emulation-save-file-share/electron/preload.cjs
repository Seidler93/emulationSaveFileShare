const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  pickRpcs3Root: () => ipcRenderer.invoke("pick-rpcs3-root"),
  scanLibrary: (rpcs3Root) => ipcRenderer.invoke("scan-library", rpcs3Root),
  readFileBytes: (absPath) => ipcRenderer.invoke("read-file-bytes", absPath),
  installFromUrl: (payload) => ipcRenderer.invoke("install-from-url", payload),
  zipPath: (absPath) => ipcRenderer.invoke("zip-path", absPath), 

  checkForUpdates: () => ipcRenderer.invoke("update:check"),
  downloadUpdate: () => ipcRenderer.invoke("update:download"),
  installUpdate: () => ipcRenderer.invoke("update:install"),
  getAppVersion: () => ipcRenderer.invoke("app:getVersion"),
  launchRpcs3Game: (payload) => ipcRenderer.invoke("rpcs3:launch", payload),
  launchGame: (payload) => ipcRenderer.invoke("launch-game", payload),

  onUpdateAvailable: (cb) => ipcRenderer.on("update:available", (_e, data) => cb(data)),
  onUpdateNotAvailable: (cb) => ipcRenderer.on("update:notAvailable", () => cb()),
  onUpdateProgress: (cb) => ipcRenderer.on("update:progress", (_e, p) => cb(p)),
  onUpdateDownloaded: (cb) => ipcRenderer.on("update:downloaded", () => cb()),
  onUpdateError: (cb) => ipcRenderer.on("update:error", (_e, msg) => cb(msg))
});

