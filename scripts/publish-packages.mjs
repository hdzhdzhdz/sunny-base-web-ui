import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const repoRoot = path.resolve(import.meta.dirname, '..');
const packagesRoot = path.join(repoRoot, 'packages');
const packedDirName = '.packed';

function findPackageJsonFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...findPackageJsonFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name === 'package.json') {
      files.push(fullPath);
    }
  }

  return files;
}

function loadPublishablePackages() {
  return findPackageJsonFiles(packagesRoot)
    .map((packageJsonPath) => {
      const raw = fs.readFileSync(packageJsonPath, 'utf8');
      const pkg = JSON.parse(raw);
      return {
        name: pkg.name,
        version: pkg.version,
        private: Boolean(pkg.private),
        dir: path.dirname(packageJsonPath),
        relativeDir: path.relative(repoRoot, path.dirname(packageJsonPath)),
      };
    })
    .filter((pkg) => pkg.name && !pkg.private)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function parseSelection(inputValue, packages) {
  const normalized = inputValue.trim();
  if (!normalized) {
    return [];
  }

  if (normalized.toLowerCase() === 'all') {
    return packages;
  }

  const byName = new Map(packages.map((pkg) => [pkg.name, pkg]));
  const selected = [];
  const seen = new Set();

  for (const token of normalized.split(',').map((item) => item.trim()).filter(Boolean)) {
    let pkg;

    if (/^\d+$/.test(token)) {
      const index = Number(token) - 1;
      pkg = packages[index];
    } else {
      pkg = byName.get(token);
    }

    if (!pkg) {
      throw new Error(`Selection not found: ${token}`);
    }

    if (!seen.has(pkg.name)) {
      selected.push(pkg);
      seen.add(pkg.name);
    }
  }

  return selected;
}

function runCommand(command, args, options) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    ...options,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function clearPackedDir(packedDir) {
  fs.rmSync(packedDir, { recursive: true, force: true });
  fs.mkdirSync(packedDir, { recursive: true });
}

function getPackedTarball(packedDir) {
  const tarballs = fs
    .readdirSync(packedDir)
    .filter((file) => file.endsWith('.tgz'))
    .sort();

  if (tarballs.length !== 1) {
    throw new Error(`Expected exactly one tarball in ${packedDir}, found ${tarballs.length}`);
  }

  return tarballs[0];
}

function publishPackage(pkg) {
  const packedDir = path.join(pkg.dir, packedDirName);

  console.log(`\nPublishing ${pkg.name}@${pkg.version}`);
  console.log(`Directory: ${pkg.relativeDir}`);

  clearPackedDir(packedDir);

  console.log('Packing with pnpm...');
  runCommand('pnpm', ['pack', '--pack-destination', packedDirName], { cwd: pkg.dir });

  const tarballName = getPackedTarball(packedDir);
  const tarballPath = path.join(packedDirName, tarballName);

  console.log(`Publishing tarball: ${tarballPath}`);

  try {
    runCommand('npm', ['publish', tarballPath, '--access', 'public'], { cwd: pkg.dir });
  } finally {
    fs.rmSync(packedDir, { recursive: true, force: true });
  }
}

async function main() {
  const packages = loadPublishablePackages();

  if (packages.length === 0) {
    console.log('No publishable packages were found.');
    return;
  }

  console.log('Publishable packages:\n');
  packages.forEach((pkg, index) => {
    console.log(`${index + 1}. ${pkg.name}@${pkg.version}  (${pkg.relativeDir})`);
  });

  const rl = createInterface({ input, output });

  try {
    const selectionInput = await rl.question(
      '\nEnter package numbers or names separated by commas, or type all: '
    );
    const selected = parseSelection(selectionInput, packages);

    if (selected.length === 0) {
      console.log('No packages selected. Cancelled.');
      return;
    }

    console.log('\nPackages to publish:');
    selected.forEach((pkg) => {
      console.log(`- ${pkg.name}@${pkg.version}`);
    });

    const confirmation = await rl.question('\nType y to confirm publishing: ');
    if (confirmation.trim().toLowerCase() !== 'y') {
      console.log('Publishing cancelled.');
      return;
    }

    for (const pkg of selected) {
      publishPackage(pkg);
    }

    console.log('\nSelected packages have been published.');
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  console.error(`\nPublish script failed: ${error.message}`);
  process.exit(1);
});
