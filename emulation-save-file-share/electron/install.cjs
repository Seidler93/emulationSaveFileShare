const fs = require("fs");
const path = require("path");
const os = require("os");
const https = require("https");
const AdmZip = require("adm-zip");
const fse = require("fs-extra");

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https
      .get(url, (res) => {
        // follow redirects
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          file.close();
          return resolve(downloadFile(res.headers.location, destPath));
        }

        if (res.statusCode !== 200) {
          file.close();
          return reject(new Error(`Download failed: HTTP ${res.statusCode}`));
        }

        res.pipe(file);
        file.on("finish", () => file.close(resolve));
      })
      .on("error", (err) => {
        try { fs.unlinkSync(destPath); } catch { }
        reject(err);
      });
  });
}

function backupToCentralFolder(rpcs3Root, targetPath) {
  if (!fs.existsSync(targetPath)) return null;

  const saveName = path.basename(targetPath);

  const ts = new Date()
    .toISOString()
    .replace(/[:.]/g, "-");

  const backupDir = path.join(
    rpcs3Root,
    "saveBackups",
    saveName,
    ts
  );

  fse.ensureDirSync(backupDir);

  // copy whole folder into backup location
  fse.copySync(targetPath, path.join(backupDir, saveName));

  return backupDir;
}

function backupIfExists(targetPath) {
  if (!fs.existsSync(targetPath)) return null;
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = `${targetPath}.bak_${ts}`;
  fs.renameSync(targetPath, backupPath);
  return backupPath;
}

/**
 * Installs a zip into RPCS3 based on type.
 * - save: extract into dev_hdd0/home/00000001/savedata/
 * - savestate: extract into savestates/
 */
async function installZipToRpcs3({ rpcs3Root, type, url }) {
  if (!rpcs3Root) throw new Error("RPCS3 root not set.");
  if (!fs.existsSync(rpcs3Root)) throw new Error("RPCS3 root folder not found.");

  const tmpDir = path.join(os.tmpdir(), "rpcs3-save-manager");
  await fse.ensureDir(tmpDir);

  const zipPath = path.join(tmpDir, `download_${Date.now()}.zip`);
  await downloadFile(url, zipPath);

  const zip = new AdmZip(zipPath);

  if (type === "save") {
    const saveRoot = path.join(rpcs3Root, "dev_hdd0", "home", "00000001", "savedata");
    await fse.ensureDir(saveRoot);

    // zip is created by us as: folderName.zip containing folderName/...
    // We detect the top-level folder in the zip to know what to overwrite/backup.
    const entries = zip.getEntries();
    const top = entries[0]?.entryName?.split("/")[0];
    if (!top) throw new Error("Zip appears empty.");

    const targetFolder = path.join(saveRoot, top);
    const backupPath = backupToCentralFolder(rpcs3Root, targetFolder);

    // remove old folder before extract (clean overwrite)
    if (fs.existsSync(targetFolder)) {
      fse.removeSync(targetFolder);
    }

    zip.extractAllTo(saveRoot, true);

    return {
      ok: true,
      installedTo: targetFolder,
      backupPath: backupPath || null
    };
  }

  if (type === "savestate") {
    const ssRoot = path.join(rpcs3Root, "savestates");
    await fse.ensureDir(ssRoot);

    // savestate zip is created by us as fileName.zip containing fileName
    // If the zip contains subfolders, extract them too.
    zip.extractAllTo(ssRoot, true);

    return {
      ok: true,
      installedTo: ssRoot,
      backupPath: null
    };
  }

  throw new Error(`Unknown type: ${type}`);
}

module.exports = { installZipToRpcs3 };
