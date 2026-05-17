import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const scanRoots = ['src', 'public', 'dist'];
const textExts = new Set(['.css', '.html', '.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.txt']);

const rules = [
  { name: 'local safe-data path', pattern: /Data[_-]?Safe/i },
  { name: 'email address', pattern: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i },
  { name: 'Chinese mobile number', pattern: /(?:\+?86[-\s]?)?1[3-9]\d{9}/ },
  { name: 'Chinese ID number', pattern: /\b[1-9]\d{5}(?:19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dXx]\b/ },
  { name: 'long booking-like number', pattern: /\b\d{12,}\b/ },
  { name: 'ticket or booking reference', pattern: /\b[A-Z]{2,6}-?\d{6,}\b/ },
  { name: 'passenger-name style token', pattern: /\b[A-Z]{2,}\/[A-Z]{2,}\b/ },
  { name: 'private reference label', pattern: /\b(?:PNR|订座号|票号|订单号|确认号|身份证|护照)\b/i },
];

const unsafePublicFileNamePattern = /(?:机票|票据|行程单|订单|确认号|ticket|boarding|pnr|passport|id-card|idcard|\.pdf$)/i;

const failures = [];

try {
  const tracked = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' })
    .split(/\r?\n/)
    .filter(Boolean);
  const unsafeTracked = tracked.filter((file) => /^Data[_-]?Safe\//i.test(file.replaceAll('\\', '/')));
  if (unsafeTracked.length > 0) {
    failures.push(`Tracked safe-data files:\n${unsafeTracked.map((file) => `  - ${file}`).join('\n')}`);
  }
} catch {
  failures.push('Unable to run git ls-files for safe-data tracking check.');
}

function walk(dir) {
  if (!existsSync(dir)) return [];
  const entries = readdirSync(dir);
  return entries.flatMap((entry) => {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) return walk(full);
    return [full];
  });
}

for (const scanRoot of scanRoots) {
  for (const file of walk(join(root, scanRoot))) {
    const relativePath = relative(root, file);
    if (unsafePublicFileNamePattern.test(relativePath)) {
      failures.push(`raw ticket-like public file name: ${relativePath}`);
    }

    const ext = file.slice(file.lastIndexOf('.')).toLowerCase();
    if (!textExts.has(ext)) continue;
    const text = readFileSync(file, 'utf8');
    for (const rule of rules) {
      if (rule.pattern.test(text)) {
        failures.push(`${rule.name}: ${relativePath}`);
      }
    }
  }
}

if (failures.length > 0) {
  console.error('Privacy check failed:');
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('Privacy check passed: no unsafe source paths, emails, private phone patterns, IDs, or booking-like references found in public files.');
