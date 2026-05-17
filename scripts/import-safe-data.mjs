import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import XLSX from 'xlsx';

const safeRoot = resolve('Data_Safe');
const workbookPath = resolve(safeRoot, '北欧冰岛行程总表.xlsx');
const planPath = resolve(safeRoot, 'plan.md');

if (!existsSync(safeRoot)) {
  console.error('Local safe-data directory was not found. Keep private source files there before importing.');
  process.exit(1);
}

const result = {
  safeRootPresent: true,
  planPresent: existsSync(planPath),
  workbookPresent: existsSync(workbookPath),
  planCharacterCount: 0,
  sheets: [],
  nextSteps: [
    'Review changed private source files locally.',
    'Copy only public-safe itinerary facts into src/data/trip.ts.',
    'Copy only redacted ticket summaries into src/data/tickets.ts.',
    'Run npm run verify before publishing.',
  ],
};

if (result.planPresent) {
  result.planCharacterCount = readFileSync(planPath, 'utf8').length;
}

if (result.workbookPresent) {
  const workbook = XLSX.readFile(workbookPath, { cellDates: true, bookFiles: false });
  result.sheets = workbook.SheetNames.map((name) => {
    const range = XLSX.utils.decode_range(workbook.Sheets[name]['!ref'] ?? 'A1:A1');
    return {
      name,
      rows: range.e.r - range.s.r + 1,
      columns: range.e.c - range.s.c + 1,
    };
  });
}

console.log(JSON.stringify(result, null, 2));
