const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { scanRpcs3Library } = require("./rpcs3Scanner.cjs");
const { zipPath } = require("./zip.cjs");
const fs = require("fs");

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
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

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