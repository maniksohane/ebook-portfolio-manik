const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { isPrivatePath, hasCredential, sync, snapshot } = require("./git-auto-sync.cjs");

function git(cwd, ...args) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8", windowsHide: true, timeout: 20000 });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

test("private files stay excluded; placeholder templates are allowed", () => {
  for (const file of ["server/.env", "client/.env.local", "client/.next/cache/a.js", "tmp/test.json", "ebook.pdf", "private.pem", "audit-email.txt"])
    assert.equal(isPrivatePath(file), true, file);
  for (const file of ["server/.env.example", "client/app/page.js", "scripts/git-auto-sync.cjs"])
    assert.equal(isPrivatePath(file), false, file);
  assert.equal(hasCredential("RAZORPAY_KEY_SECRET=YOUR_SECRET", "server/.env.example"), false);
  assert.equal(hasCredential("RAZORPAY_KEY_SECRET=" + "not-a-placeholder-value", "server/.env.example"), true);
  assert.equal(hasCredential("const token = '" + "gh" + "p_" + "a".repeat(36) + "';", "config.js"), true);
  assert.equal(hasCredential("const token = process.env.ACCESS_TOKEN;", "config.js"), false);
});

test("real Git integration: push saves, preserve manual staging, reject secrets, and pause for remote changes", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "ebook-git-sync-test-"));
  const remote = path.join(directory, "remote.git");
  const local = path.join(directory, "project");
  fs.mkdirSync(local);
  git(directory, "init", "--bare", "--initial-branch=main", remote);
  git(local, "init", "--initial-branch=main");
  git(local, "config", "user.name", "Sync Test");
  git(local, "config", "user.email", "sync@example.invalid");
  git(local, "config", "commit.gpgSign", "false");
  git(local, "config", "core.autocrlf", "false");
  fs.writeFileSync(path.join(local, ".gitignore"), ".env\n");
  fs.writeFileSync(path.join(local, "app.js"), "console.log('initial');\n");
  git(local, "add", ".");
  git(local, "commit", "-m", "initial");
  git(local, "remote", "add", "origin", remote);
  git(local, "push", "-u", "origin", "main");
  const run = () => sync(local, snapshot(local).fingerprint, { remote });

  fs.writeFileSync(path.join(local, ".env"), "PRIVATE=never-upload-this\n");
  fs.writeFileSync(path.join(local, "app.js"), "console.log('saved');\n");
  fs.writeFileSync(path.join(local, "file with spaces.txt"), "New documentation\n");
  assert.match(run(), /Committed and pushed/);
  assert.equal(git(local, "rev-parse", "HEAD"), git(directory, "--git-dir", remote, "rev-parse", "refs/heads/main"));
  assert.equal(git(local, "ls-files", ".env"), "");
  assert.match(git(local, "ls-files"), /file with spaces/);
  assert.equal(run(), "Up to date.");

  const before = git(local, "rev-parse", "HEAD");
  fs.writeFileSync(path.join(local, "credentials.json"), "{}\n");
  assert.throws(run, /private\/generated/);
  assert.equal(git(local, "rev-parse", "HEAD"), before);
  fs.unlinkSync(path.join(local, "credentials.json"));
  fs.writeFileSync(path.join(local, "settings.js"), "const key = '" + "gh" + "p_" + "b".repeat(36) + "';\n");
  assert.throws(run, /possible credential/);
  fs.unlinkSync(path.join(local, "settings.js"));

  fs.writeFileSync(path.join(local, "app.js"), "console.log('manual staging');\n");
  git(local, "add", "app.js");
  assert.throws(run, /staged manually/);
  assert.match(git(local, "diff", "--cached"), /manual staging/);
  // Complete the user's simulated manual commit; the watcher pushes it afterward.
  git(local, "commit", "-m", "manual edit");
  assert.match(run(), /^Pushed/);

  const other = path.join(directory, "other");
  git(directory, "clone", remote, other);
  git(other, "config", "user.name", "Sync Test");
  git(other, "config", "user.email", "sync@example.invalid");
  git(other, "config", "commit.gpgSign", "false");
  fs.writeFileSync(path.join(other, "remote.txt"), "Change made elsewhere\n");
  git(other, "add", ".");
  git(other, "commit", "-m", "remote edit");
  git(other, "push");
  fs.writeFileSync(path.join(local, "app.js"), "console.log('local edit remains safe');\n");
  assert.throws(run, /GitHub has newer commits/);
  assert.match(fs.readFileSync(path.join(local, "app.js"), "utf8"), /local edit remains safe/);
  assert.equal(git(directory, "--git-dir", remote, "log", "-1", "--format=%s"), "remote edit");
});
