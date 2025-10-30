import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const TARGET_DIRECTORIES = ["services", "common-lib"];
const BUILD_PATTERN = /("build"\s*:\s*)"([^"]*services\/[^"]*)"/;
const FIXED_BUILD_COMMAND = 'tsc -p tsconfig.json';

async function findPackageJsonFiles() {
  const results = [];

  for (const dirName of TARGET_DIRECTORIES) {
    const start = path.join(repoRoot, dirName);
    try {
      const stat = await fs.stat(start);
      if (!stat.isDirectory()) continue;
    } catch {
      continue;
    }

    const stack = [start];
    while (stack.length > 0) {
      const current = stack.pop();
      if (!current) continue;

      let entries;
      try {
        entries = await fs.readdir(current, { withFileTypes: true });
      } catch {
        continue;
      }

      for (const entry of entries) {
        const fullPath = path.join(current, entry.name);
        if (entry.isDirectory()) {
          stack.push(fullPath);
        } else if (entry.isFile() && entry.name === "package.json") {
          results.push(fullPath);
        }
      }
    }
  }

  return results;
}

async function processPackageJson(filePath) {
  let content;
  try {
    content = await fs.readFile(filePath, "utf8");
  } catch {
    return false;
  }

  if (!BUILD_PATTERN.test(content)) {
    return false;
  }

  const updated = content.replace(BUILD_PATTERN, (_, prefix) => `${prefix}"${FIXED_BUILD_COMMAND}"`);

  if (updated === content) {
    return false;
  }

  await fs.writeFile(filePath, updated, "utf8");
  return true;
}

async function main() {
  const packageFiles = await findPackageJsonFiles();
  const updatedFiles = [];

  for (const filePath of packageFiles) {
    const changed = await processPackageJson(filePath);
    if (changed) {
      updatedFiles.push(path.relative(repoRoot, filePath));
    }
  }

  if (updatedFiles.length === 0) {
    console.log("No build scripts required fixing.");
  } else {
    console.log("Updated build scripts in:");
    for (const file of updatedFiles) {
      console.log(` - ${file}`);
    }
  }
}

main().catch((err) => {
  console.error("Failed to fix build scripts:", err);
  process.exitCode = 1;
});
