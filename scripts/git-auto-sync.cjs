const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { spawnSync } = require("node:child_process");

const ROOT = path.resolve(__dirname, "..");
const BRANCH = "main";
const REMOTE = "https://github.com/maniksohane/ebook-portfolio-manik.git";
const QUIET_MS = 15000;
const POLL_MS = 3000;
const RETRY_MS = 60000;

function git(root, args) {
  const result = spawnSync("git", args, {
    cwd: root,
    encoding: "utf8",
    windowsHide: true,
    timeout: 25000,
    maxBuffer: 16 * 1024 * 1024,
    env: { ...process.env, GIT_TERMINAL_PROMPT: "0", GCM_INTERACTIVE: "Never" },
  });
  // Never print provider responses or command output that could contain credentials.
  if (result.error || result.status !== 0) {
    throw new Error(`git ${args[0]} failed; check Git authentication/network or run that command manually.`);
  }
  return result.stdout;
}

function isPrivatePath(file) {
  const parts = file.replaceAll("\\", "/").toLowerCase().split("/");
  const name = parts.at(-1);
  return parts.some((part) => [".git", "node_modules", ".next", "tmp", "output", "coverage"].includes(part)) ||
    (name.startsWith(".env") && name !== ".env.example") ||
    /\.(pem|key|p12|pfx|pdf|epub|log)$/.test(name) ||
    /^(credentials|secrets)(\.|$)/.test(name) ||
    /^audit-.*\.txt$/.test(name) ||
    ["npm.cmd", "important-files.txt", "project-files.txt"].includes(name);
}

function isPlaceholder(value) {
  return !value || /^(?:YOUR_[A-Z0-9_]+|(?:rzp_(?:test|live)_|re_|sk_test_)?x{4,}|changeme|placeholder)$/i.test(value);
}

function hasCredential(text, file) {
  const patterns = [
    /\bgh[pousr]_[A-Za-z0-9]{25,}\b/,
    /\bgithub_pat_[A-Za-z0-9_]{30,}\b/,
    /\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{16,}\b/,
    /\bsb_secret_[A-Za-z0-9_-]{16,}/,
    /\bre_[A-Za-z0-9]{20,}\b/,
    /\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{24,}/,
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/,
  ];
  if (patterns.some((pattern) => pattern.test(text))) return true;
  if (file.endsWith(".env.example")) {
    return text.split(/\r?\n/).some((line) => {
      const match = line.match(/^\s*([A-Z_]*(?:KEY|SECRET|TOKEN|PASSWORD)[A-Z_]*)\s*=\s*(.*)$/);
      return match && !isPlaceholder(match[2].replace(/^["']|["']$/g, ""));
    });
  }
  // Catch literal secrets in source; environment-variable references are fine.
  const assignments = text.matchAll(/\b[\w]*(?:secret|password|api_?key|access_?token)[\w]*\s*[:=]\s*["']([^"'\r\n]{8,})["']/gi);
  return [...assignments].some((match) => !isPlaceholder(match[1]));
}

function checkFiles(root) {
  const files = git(root, ["ls-files", "--cached", "--others", "--exclude-standard", "-z"]).split("\0").filter(Boolean);
  for (const file of new Set(files)) {
    if (isPrivatePath(file)) throw new Error(`Sync paused: private/generated file is tracked or staged: ${file}`);
    const absolute = path.resolve(root, file);
    if (!absolute.startsWith(root + path.sep)) throw new Error("Sync paused: file is outside the project.");
    if (!fs.existsSync(absolute)) continue; // An intended deletion.
    const stat = fs.lstatSync(absolute);
    if (!stat.isFile()) throw new Error(`Sync paused: symbolic link or embedded repository: ${file}`);
    if (stat.size > 5 * 1024 * 1024) throw new Error(`Sync paused: file exceeds 5 MB: ${file}`);
    if (hasCredential(fs.readFileSync(absolute, "utf8"), file)) {
      throw new Error(`Sync paused: possible credential in ${file}. Move secrets to ignored .env files.`);
    }
  }
  // Inspect the staged version too, in case it differs from the working file.
  const staged = git(root, ["diff", "--cached", "--diff-filter=ACM", "--name-only", "-z"]).split("\0").filter(Boolean);
  for (const file of staged) {
    if (hasCredential(git(root, ["show", `:${file}`]), file)) throw new Error(`Sync paused: possible staged credential in ${file}.`);
  }
  return files.length;
}

function snapshot(root) {
  const raw = git(root, ["status", "--porcelain=v1", "-z", "--untracked-files=all", "--no-renames"]);
  const entries = raw.split("\0").filter(Boolean);
  const hash = crypto.createHash("sha256").update(raw);
  for (const entry of entries) {
    const file = path.join(root, entry.slice(3));
    if (fs.existsSync(file) && fs.lstatSync(file).isFile()) {
      const stat = fs.statSync(file);
      hash.update(`${stat.size}:${stat.mtimeMs}`);
    }
  }
  return { fingerprint: hash.digest("hex"), entries };
}

function checkRepository(root, { branch = BRANCH, remote = REMOTE } = {}) {
  if (git(root, ["branch", "--show-current"]).trim() !== branch) throw new Error(`Sync paused: switch back to ${branch} when ready.`);
  if (git(root, ["remote", "get-url", "origin"]).trim() !== remote ||
      git(root, ["remote", "get-url", "--push", "origin"]).trim() !== remote) {
    throw new Error("Sync paused: origin does not match the configured GitHub repository.");
  }
  for (const marker of ["MERGE_HEAD", "CHERRY_PICK_HEAD", "REVERT_HEAD", "rebase-merge", "rebase-apply", "index.lock"]) {
    if (fs.existsSync(path.resolve(root, git(root, ["rev-parse", "--git-path", marker]).trim()))) {
      throw new Error("Sync paused: another Git operation is in progress.");
    }
  }
}

function sync(root, expectedFingerprint, policy = {}) {
  const branch = policy.branch || BRANCH;
  checkRepository(root, policy);
  git(root, ["fetch", "--quiet", "origin", branch]);
  const [behind] = git(root, ["rev-list", "--left-right", "--count", `origin/${branch}...HEAD`]).trim().split(/\s+/).map(Number);
  if (behind) throw new Error("Sync paused: GitHub has newer commits. Stop sync and pull/reconcile them manually.");
  const current = snapshot(root);
  if (current.fingerprint !== expectedFingerprint) return "Files changed during the check; waiting for saves to settle.";
  if (current.entries.some((entry) => entry[0] !== " " && !entry.startsWith("??"))) {
    throw new Error("Sync paused: files are staged manually or conflicted. Finish your Git operation first.");
  }
  checkFiles(root);
  let committed = false;
  if (current.entries.length) {
    git(root, ["add", "--all", "--", "."]);
    checkFiles(root);
    if (git(root, ["diff", "--cached", "--name-only"]).trim()) {
      git(root, ["commit", "-m", `Auto-sync saved changes (${new Date().toISOString()})`]);
      committed = true;
    }
  }
  const ahead = Number(git(root, ["rev-list", "--count", `origin/${branch}..HEAD`]).trim());
  if (ahead) {
    git(root, ["push", "origin", `HEAD:refs/heads/${branch}`]);
    return `${committed ? "Committed and pushed" : "Pushed"} changes to origin/${branch}.`;
  }
  return "Up to date.";
}

async function watch() {
  const gitDir = path.resolve(ROOT, git(ROOT, ["rev-parse", "--git-dir"]).trim());
  const pidFile = path.join(gitDir, "auto-sync.pid");
  const stateFile = path.join(gitDir, "auto-sync-state.json");
  const stopFile = path.join(gitDir, "auto-sync.stop");
  if (fs.existsSync(pidFile)) {
    const previous = Number(fs.readFileSync(pidFile, "utf8"));
    let alive = false;
    if (previous > 0) { try { process.kill(previous, 0); alive = true; } catch {} }
    if (alive) throw new Error("An auto-sync watcher is already running.");
    fs.unlinkSync(pidFile);
  }
  fs.writeFileSync(pidFile, String(process.pid), { flag: "wx" });
  if (fs.existsSync(stopFile)) fs.unlinkSync(stopFile);
  process.on("exit", () => {
    if (fs.existsSync(pidFile) && Number(fs.readFileSync(pidFile, "utf8")) === process.pid) fs.unlinkSync(pidFile);
  });
  let lastMessage = "";
  function report(message) {
    const at = new Date().toISOString();
    fs.writeFileSync(stateFile, JSON.stringify({ pid: process.pid, at, message, branch: BRANCH }, null, 2));
    if (message !== lastMessage) console.log(`[${at}] ${message}`);
    lastMessage = message;
  }
  let fingerprint = "", changedAt = Date.now(), lastAttempt = 0;
  report(`Watching saved files; auto-push to ${BRANCH} after ${QUIET_MS / 1000} quiet seconds.`);
  while (true) {
    if (fs.existsSync(stopFile)) {
      fs.unlinkSync(stopFile);
      report("Auto-sync stopped.");
      return;
    }
    try {
      const current = snapshot(ROOT);
      if (current.fingerprint !== fingerprint) {
        fingerprint = current.fingerprint;
        changedAt = Date.now();
        lastAttempt = 0;
      }
      if (Date.now() - changedAt >= QUIET_MS && Date.now() - lastAttempt >= RETRY_MS) {
        lastAttempt = Date.now();
        report(sync(ROOT, fingerprint));
      }
    } catch (error) { lastAttempt = Date.now(); report(error.message); }
    await new Promise((resolve) => setTimeout(resolve, POLL_MS));
  }
}

if (require.main === module) {
  (async () => {
    if (process.argv.includes("--check")) {
      checkRepository(ROOT);
      console.log(`Safety check passed for ${checkFiles(ROOT)} project files. No files committed or pushed.`);
    } else if (process.argv.includes("--once")) {
      console.log(sync(ROOT, snapshot(ROOT).fingerprint));
    } else { await watch(); }
  })().catch((error) => { console.error(error.message); process.exitCode = 1; });
}

module.exports = { isPrivatePath, hasCredential, checkFiles, sync, snapshot };
