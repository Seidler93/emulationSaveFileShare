import fs from "fs";
import path from "path";

const packagePath = path.resolve("package.json");

const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));

const versionParts = pkg.version.split(".").map(Number);

// Increase PATCH version
versionParts[2] += 1;

const newVersion = versionParts.join(".");
pkg.version = newVersion;

fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + "\n");

console.log(`✅ Version bumped to ${newVersion}`);
