// scripts/chatpack.mjs
import fs from "fs";
import path from "path";
import process from "process";
import fg from "fast-glob";
import inquirer from "inquirer";
import clipboardy from "clipboardy";

const ROOT = process.cwd();

// You can customize these
const DEFAULT_IGNORE = [
  "**/node_modules/**",
  "**/dist/**",
  "**/build/**",
  "**/out/**",
  "**/release/**",
  "**/.git/**",
  "**/.firebase/**",
  "**/tmp/**",
  "**/*.zip",
  "**/*.exe",
  "**/*.dmg",
  "**/*.AppImage",
  "**/*.log",
  "**/.DS_Store",
  "**/Thumbs.db",
  "**/.idea/**",
  "**/.vscode/**"
];

// NEVER include secrets
const ALWAYS_EXCLUDE = [
  "**/.env",
  "**/.env.*",
  "**/*serviceAccount*.json",
  "**/*firebase-admin*.json",
  "**/*private*.key",
  "**/*secret*",
];

// Reasonable allow-list (helps avoid binary/huge junk)
const ALLOWED_EXTS = new Set([
  ".js", ".jsx", ".ts", ".tsx",
  ".cjs", ".mjs",
  ".css", ".scss",
  ".json",
  ".md", ".txt",
  ".html",
  ".yml", ".yaml",
]);

function isProbablyTextFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ALLOWED_EXTS.has(ext);
}

function toPosix(p) {
  return p.split(path.sep).join("/");
}

function readFileSafe(absPath) {
  // Simple binary guard: if it contains a NUL byte early, skip
  const buf = fs.readFileSync(absPath);
  const sample = buf.subarray(0, Math.min(buf.length, 8000));
  if (sample.includes(0)) return null;
  return buf.toString("utf8");
}

function fenceFor(fileRel) {
  const ext = path.extname(fileRel).toLowerCase();
  if (ext === ".js" || ext === ".jsx") return "javascript";
  if (ext === ".ts" || ext === ".tsx") return "typescript";
  if (ext === ".json") return "json";
  if (ext === ".css" || ext === ".scss") return "css";
  if (ext === ".html") return "html";
  if (ext === ".yml" || ext === ".yaml") return "yaml";
  if (ext === ".md") return "markdown";
  return "";
}

async function main() {
  const files = await fg(["**/*"], {
    cwd: ROOT,
    dot: true,
    onlyFiles: true,
    ignore: [...DEFAULT_IGNORE, ...ALWAYS_EXCLUDE],
  });

  const textFiles = files
    .map(toPosix)
    .filter((f) => isProbablyTextFile(f));

  if (!textFiles.length) {
    console.error("No eligible text files found.");
    process.exit(1);
  }

  const { query } = await inquirer.prompt([
    {
      type: "input",
      name: "query",
      message:
        "Filter (optional). Example: 'electron' or 'rpcs3Scanner' or 'src/pages':",
      default: "",
    },
  ]);

  const filtered = query
    ? textFiles.filter((f) => f.toLowerCase().includes(query.toLowerCase()))
    : textFiles;

  const { selected } = await inquirer.prompt([
    {
      type: "checkbox",
      name: "selected",
      message:
        `Select files to include (${filtered.length} match${query ? " filter" : ""}). Space = toggle, Enter = confirm.`,
      pageSize: 20,
      choices: filtered,
      validate: (arr) => (arr.length ? true : "Select at least 1 file."),
    },
  ]);

  const { title } = await inquirer.prompt([
    {
      type: "input",
      name: "title",
      message: "Packet title (shown at top):",
      default: "SaveLocker – ChatGPT Packet",
    },
  ]);

  const { mode } = await inquirer.prompt([
    {
      type: "list",
      name: "mode",
      message: "Output:",
      choices: [
        { name: "Copy to clipboard", value: "clip" },
        { name: "Write to file (CHAT_PACKET.md)", value: "file" },
        { name: "Both (clipboard + file)", value: "both" },
      ],
      default: "both",
    },
  ]);

  // Build packet
  const now = new Date().toISOString();
  let out = `# ${title}\n\n`;
  out += `Generated: ${now}\n\n`;
  out += `## Included files (${selected.length})\n`;
  for (const f of selected) out += `- ${f}\n`;
  out += `\n---\n\n`;

  for (const fileRel of selected) {
    const abs = path.join(ROOT, fileRel);
    const content = readFileSafe(abs);

    if (content == null) {
      out += `## ${fileRel}\n\n`;
      out += `⚠️ Skipped (appears binary or not UTF-8 safe)\n\n---\n\n`;
      continue;
    }

    const lang = fenceFor(fileRel);
    out += `## ${fileRel}\n\n`;
    out += "```" + lang + "\n";
    out += content.replace(/\r\n/g, "\n");
    if (!out.endsWith("\n")) out += "\n";
    out += "```\n\n---\n\n";
  }

  const outPath = path.join(ROOT, "CHAT_PACKET.md");

  if (mode === "file" || mode === "both") {
    fs.writeFileSync(outPath, out, "utf8");
    console.log(`✅ Wrote ${selected.length} files to ${outPath}`);
  }

  if (mode === "clip" || mode === "both") {
    await clipboardy.write(out);
    console.log(`✅ Copied packet to clipboard (${out.length.toLocaleString()} chars)`);
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
