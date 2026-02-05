const os = require("os");
const path = require("path");
const fs = require("fs");
const archiver = require("archiver");
const fse = require("fs-extra");

function zipPath(absPath) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!fs.existsSync(absPath)) return reject(new Error("Path not found"));

      const tmpDir = path.join(os.tmpdir(), "rpcs3-save-manager");
      await fse.ensureDir(tmpDir);

      const base = path.basename(absPath);
      const outZip = path.join(tmpDir, `${base}.zip`);

      // overwrite if exists
      if (fs.existsSync(outZip)) fs.unlinkSync(outZip);

      const output = fs.createWriteStream(outZip);
      const archive = archiver("zip", { zlib: { level: 9 } });

      output.on("close", () => resolve(outZip));
      archive.on("error", err => reject(err));

      archive.pipe(output);

      const stat = fs.statSync(absPath);
      if (stat.isDirectory()) archive.directory(absPath, base);
      else archive.file(absPath, { name: base });

      await archive.finalize();
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = { zipPath };
