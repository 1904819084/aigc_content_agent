import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(currentDirectory, '..');
const gitDirectory = path.join(projectRoot, '.git');

if (!existsSync(gitDirectory)) {
  console.log('skip husky install: .git not found');
  process.exit(0);
}

const result = spawnSync('npx', ['husky'], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

process.exit(result.status ?? 0);
