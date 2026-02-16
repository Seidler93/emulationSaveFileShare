import fs from "fs";
import path from "path";
import readline from "readline";
import { execSync } from "child_process";

const OWNER = "Seidler93";
const REPO = "emulationSaveFileShare";

const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
if (!token) {
  console.error("❌ Missing GH_TOKEN or GITHUB_TOKEN in env.");
  process.exit(1);
}

function run(cmd) {
  execSync(cmd, { stdio: "inherit" });
}

function readPkg() {
  const packagePath = path.resolve(process.cwd(), "package.json");
  return JSON.parse(fs.readFileSync(packagePath, "utf8"));
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("📝 Enter release notes (press enter for default): ", async (notesInput) => {
  try {
    // 1) Bump version
    run("node scripts/bump-version.js");

    const { version } = readPkg();
    const tag = `v${version}`;
    const notes = notesInput.trim() || "Update";

    // 2) Commit version bump cleanly
    run("git add package.json");
    run(`git commit -m "chore: release ${tag}"`);

    // 3) Tag it
    // (If tag already exists for some reason, fail loudly)
    run(`git tag ${tag}`);

    // 4) Push commit + tag
    run("git push");
    run("git push --tags");

    // 5) Build + publish
    run("npm run build");
    run("electron-builder --publish always");

    // 6) Update GitHub release title + body
    const apiBase = `https://api.github.com/repos/${OWNER}/${REPO}`;

    const releaseRes = await fetch(`${apiBase}/releases/tags/${tag}`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json"
      }
    });

    if (!releaseRes.ok) {
      const text = await releaseRes.text();
      throw new Error(`Failed to fetch release by tag ${tag}: ${releaseRes.status} ${releaseRes.statusText}\n${text}`);
    }

    const release = await releaseRes.json();

    const patchRes = await fetch(`${apiBase}/releases/${release.id}`, {
      method: "PATCH",
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: tag,   // title
        body: notes  // description
      })
    });

    if (!patchRes.ok) {
      const text = await patchRes.text();
      throw new Error(`Failed to update release ${release.id}: ${patchRes.status} ${patchRes.statusText}\n${text}`);
    }

    console.log(`\n✅ Release ${tag} published successfully (title fixed, notes added).`);
    rl.close();
  } catch (err) {
    console.error("\n❌ Release failed:", err?.message || err);
    rl.close();
    process.exit(1);
  }
});
