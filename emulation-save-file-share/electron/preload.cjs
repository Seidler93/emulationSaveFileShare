const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  pickRpcs3Root: () => ipcRenderer.invoke("pick-rpcs3-root"),
  scanLibrary: (rpcs3Root) => ipcRenderer.invoke("scan-library", rpcs3Root),
  readFileBytes: (absPath) => ipcRenderer.invoke("read-file-bytes", absPath),
  installFromUrl: (payload) => ipcRenderer.invoke("install-from-url", payload),
  zipPath: (absPath) => ipcRenderer.invoke("zip-path", absPath)
});

