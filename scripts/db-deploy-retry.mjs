import { spawn } from "node:child_process";

const maxAttempts = 4;
const retryDelayMs = 5_000;
const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";

function runMigration() {
  return new Promise((resolve) => {
    const child = spawn(npxCommand, ["prisma", "migrate", "deploy"], {
      stdio: "inherit",
      env: process.env,
    });

    child.on("error", () => resolve(1));
    child.on("exit", (code) => resolve(code ?? 1));
  });
}

for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
  const exitCode = await runMigration();

  if (exitCode === 0) process.exit(0);
  if (attempt === maxAttempts) process.exit(exitCode);

  console.warn(
    `Database migration attempt ${attempt} failed; retrying in ${retryDelayMs / 1_000}s...`
  );
  await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
}
