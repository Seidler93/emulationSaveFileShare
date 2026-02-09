const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { scanRpcs3Library } = require("./rpcs3Scanner.cjs");
const { zipPath } = require("./zip.cjs");
const fs = require("fs");
const { installZipToRpcs3 } = require("./install.cjs");
const { autoUpdater } = require("electron-updater");

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 750,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const startUrl = process.env.ELECTRON_START_URL;
  if (startUrl) win.loadURL(startUrl);
  else win.loadFile(path.join(__dirname, "..", "dist", "index.html"));

  return win;
}


app.whenReady().then(() => {
  const mainWindow = createWindow();
  setupAutoUpdates(mainWindow);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      const w = createWindow();
      setupAutoUpdates(w);
    }
  });
});

function setupAutoUpdates(mainWindow) {
  autoUpdater.autoDownload = false;

  autoUpdater.on("update-available", (info) => {
    mainWindow.webContents.send("update:available", {
      version: info?.version,
      releaseName: info?.releaseName,
      releaseNotes: info?.releaseNotes
    });
  });

  autoUpdater.on("update-not-available", () => {
    mainWindow.webContents.send("update:notAvailable");
  });

  autoUpdater.on("download-progress", (p) => {
    mainWindow.webContents.send("update:progress", {
      percent: p.percent,
      transferred: p.transferred,
      total: p.total,
      bytesPerSecond: p.bytesPerSecond
    });
  });

  autoUpdater.on("update-downloaded", () => {
    mainWindow.webContents.send("update:downloaded");
  });

  autoUpdater.on("error", (err) => {
    mainWindow.webContents.send("update:error", String(err?.message || err));
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("pick-rpcs3-root", async () => {
  const res = await dialog.showOpenDialog({
    properties: ["openDirectory"]
  });
  if (res.canceled) return null;
  return res.filePaths[0];
});

ipcMain.handle("scan-library", async (_evt, rpcs3Root) => {
  return scanRpcs3Library(rpcs3Root);
});

ipcMain.handle("zip-path", async (_evt, absPath) => {
  // returns path to temp zip file
  return zipPath(absPath);
});

ipcMain.handle("read-file-bytes", async (_evt, absPath) => {
  return fs.readFileSync(absPath); // returns Buffer
});

ipcMain.handle("install-from-url", async (_evt, payload) => {
  // payload: { rpcs3Root, type, url }
  return installZipToRpcs3(payload);
});

// Add these IPC handlers somewhere after ipcMain is defined:
ipcMain.handle("update:check", async () => {
  // returns UpdateCheckResult (or null) but we mostly rely on events above
  return autoUpdater.checkForUpdates();
});

ipcMain.handle("update:download", async () => {
  return autoUpdater.downloadUpdate();
});

ipcMain.handle("update:install", async () => {
  autoUpdater.quitAndInstall();
});

ipcMain.handle("app:getVersion", () => {
  return app.getVersion();
});
