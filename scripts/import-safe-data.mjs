import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import XLSX from 'xlsx';

const safeRoot = resolve('Data_Safe');
const workbookPath = resolve(safeRoot, '北欧冰岛行程总表.xlsx');
const publicSourceWorkbookPath = resolve(safeRoot, '网页公开真源.xlsx');
const planPath = resolve(safeRoot, 'plan.md');
const bookingSheetName = '票据公开摘要';
const placeSheetName = '节点公开资料';
const lodgingSheetName = '住宿公开摘要';
const preTripChecklistSheetName = '出发前清单公开';
const preTripTodoSheetName = '行前待办公开';
const preTripRuleSheetName = '行前规则公开';
const dailyCheckSheetName = '每日检查公开';
const generatedBookingsPath = resolve('src/data/generated/bookings.ts');
const generatedPlacesPath = resolve('src/data/generated/places.ts');
const generatedLodgingsPath = resolve('src/data/generated/lodgings.ts');
const generatedPreTripPath = resolve('src/data/generated/pretrip.ts');

const commonPrivacyRules = [
  { name: 'email address', pattern: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i },
  { name: 'Chinese mobile number', pattern: /(?:\+?86[-\s]?)?1[3-9]\d{9}/ },
  { name: 'Chinese ID number', pattern: /\b[1-9]\d{5}(?:19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dXx]\b/ },
  { name: 'long booking-like number', pattern: /\b\d{12,}\b/ },
  { name: 'ticket or booking reference', pattern: /\b[A-Z]{2,6}-?\d{6,}\b/ },
  { name: 'passenger-name style token', pattern: /\b[A-Z]{2,}\/[A-Z]{2,}\b/ },
  { name: 'PNR-like reference', pattern: /\b(?:PNR|订座号|票号|订单号|确认号|身份证|护照)\b/i },
];

const bookingPrivacyRules = [
  ...commonPrivacyRules,
  { name: 'raw ticket file name', pattern: /\.(?:pdf|png|jpe?g)\b/i },
];

if (!existsSync(safeRoot)) {
  console.error('Local safe-data directory was not found. Keep private source files there before importing.');
  process.exit(1);
}

const result = {
  safeRootPresent: true,
  planPresent: existsSync(planPath),
  workbookPresent: existsSync(workbookPath),
  publicSourceWorkbookPresent: existsSync(publicSourceWorkbookPath),
  planCharacterCount: 0,
  sheets: [],
  publicSourceSheets: [],
  generatedBookings: null,
  generatedPlaces: null,
  generatedLodgings: null,
  generatedPreTrip: null,
  nextSteps: [
    'Review changed private source files locally.',
    'Copy only public-safe itinerary facts into src/data/trip.ts.',
    'Update the Excel booking and node summary sheets, then regenerate public-safe data.',
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

  if (!workbook.SheetNames.includes(bookingSheetName)) {
    throw new Error(`Missing "${bookingSheetName}" sheet in local workbook.`);
  }

  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[bookingSheetName], { defval: '' });
  const bookings = rows.map((row) => normalizeBookingRow(row));
  validateBookings(bookings);
  writeGeneratedBookings(bookings);
  result.generatedBookings = {
    path: generatedBookingsPath.replaceAll('\\', '/'),
    count: bookings.length,
  };

  if (!workbook.SheetNames.includes(placeSheetName)) {
    throw new Error(`Missing "${placeSheetName}" sheet in local workbook.`);
  }

  const placeRows = XLSX.utils.sheet_to_json(workbook.Sheets[placeSheetName], { defval: '' });
  const places = placeRows.map((row) => normalizePlaceRow(row));
  validatePlaces(places);
  writeGeneratedPlaces(places);
  result.generatedPlaces = {
    path: generatedPlacesPath.replaceAll('\\', '/'),
    count: places.length,
  };

  if (!workbook.SheetNames.includes(lodgingSheetName)) {
    throw new Error(`Missing "${lodgingSheetName}" sheet in local workbook.`);
  }

  const lodgingRows = XLSX.utils.sheet_to_json(workbook.Sheets[lodgingSheetName], { defval: '' });
  const lodgings = lodgingRows.map((row) => normalizeLodgingRow(row));
  validateLodgings(lodgings);
  writeGeneratedLodgings(lodgings);
  result.generatedLodgings = {
    path: generatedLodgingsPath.replaceAll('\\', '/'),
    count: lodgings.length,
  };
}

if (result.publicSourceWorkbookPresent) {
  const publicWorkbook = XLSX.readFile(publicSourceWorkbookPath, { cellDates: true, bookFiles: false });
  result.publicSourceSheets = publicWorkbook.SheetNames.map((name) => {
    const range = XLSX.utils.decode_range(publicWorkbook.Sheets[name]['!ref'] ?? 'A1:A1');
    return {
      name,
      rows: range.e.r - range.s.r + 1,
      columns: range.e.c - range.s.c + 1,
    };
  });

  for (const sheetName of [preTripChecklistSheetName, preTripTodoSheetName, preTripRuleSheetName, dailyCheckSheetName]) {
    if (!publicWorkbook.SheetNames.includes(sheetName)) {
      throw new Error(`Missing "${sheetName}" sheet in public source workbook.`);
    }
  }

  const checklistRows = XLSX.utils.sheet_to_json(publicWorkbook.Sheets[preTripChecklistSheetName], { defval: '' });
  const todoRows = XLSX.utils.sheet_to_json(publicWorkbook.Sheets[preTripTodoSheetName], { defval: '' });
  const ruleRows = XLSX.utils.sheet_to_json(publicWorkbook.Sheets[preTripRuleSheetName], { defval: '' });
  const dailyCheckRows = XLSX.utils.sheet_to_json(publicWorkbook.Sheets[dailyCheckSheetName], { defval: '' });
  const preTrip = {
    checklist: checklistRows.map((row) => normalizePreTripChecklistRow(row)),
    todos: todoRows.map((row) => normalizePreTripTodoRow(row)),
    rules: ruleRows.map((row) => normalizePreTripRuleRow(row)),
    dailyChecks: dailyCheckRows.map((row) => normalizeDailyCheckRow(row)),
  };
  validatePreTrip(preTrip);
  writeGeneratedPreTrip(preTrip);
  result.generatedPreTrip = {
    path: generatedPreTripPath.replaceAll('\\', '/'),
    checklistCount: preTrip.checklist.length,
    todoCount: preTrip.todos.length,
    ruleCount: preTrip.rules.length,
    dailyCheckCount: preTrip.dailyChecks.length,
  };
}

console.log(JSON.stringify(result, null, 2));

function normalizeBookingRow(row) {
  const facts = splitList(row.facts_public);
  const links = String(row.official_url || '').trim()
    ? [{
      label: String(row.official_url_label || row.vendor || '官方链接').trim(),
      url: String(row.official_url).trim(),
      kind: inferLinkKind(row.kind),
    }]
    : undefined;

  return {
    id: required(row.id, 'id'),
    date: required(row.date, 'date'),
    attachTime: required(row.attach_time, 'attach_time'),
    kind: required(row.kind, 'kind'),
    title: required(row.title, 'title'),
    vendor: required(row.vendor, 'vendor'),
    location: required(row.location, 'location'),
    displayTime: required(row.display_time, 'display_time'),
    amount: optional(row.amount),
    status: required(row.status, 'status'),
    facts,
    reminder: optional(row.reminder_public),
    links,
    sortOrder: Number(row.sort_order || 0),
  };
}

function normalizePlaceRow(row) {
  return {
    id: required(row.id, 'id'),
    date: required(row.date, 'date'),
    attachTime: required(row.attach_time, 'attach_time'),
    place: required(row.place, 'place'),
    title: required(row.title, 'title'),
    description: optional(row.description_public),
    introUrl: optional(row.intro_url),
    imageSourceUrl: optional(row.image_source_url),
    localImage: optional(row.local_image),
    mapUrl: optional(row.map_url),
    parkingUrl: optional(row.parking_url),
    parkingNote: optional(row.parking_note),
    sortOrder: Number(row.sort_order || 0),
  };
}

function normalizeLodgingRow(row) {
  return {
    id: required(row.id, 'id'),
    date: required(row.date, 'date'),
    attachTime: required(row.attach_time, 'attach_time'),
    name: required(row.name, 'name'),
    city: required(row.city, 'city'),
    checkIn: required(row.check_in, 'check_in'),
    checkOut: required(row.check_out, 'check_out'),
    nights: Number(row.nights || 0),
    checkInTime: optional(row.check_in_time),
    checkOutTime: optional(row.check_out_time),
    room: optional(row.room),
    area: optional(row.area),
    bed: optional(row.bed),
    facilities: splitList(row.facilities_public),
    address: optional(row.address),
    phone: optional(row.phone),
    platform: optional(row.platform),
    amount: optional(row.amount),
    cancelPolicy: optional(row.cancel_policy),
    note: optional(row.note_public),
    images: splitList(row.local_images),
    sortOrder: Number(row.sort_order || 0),
  };
}

function normalizePreTripChecklistRow(row) {
  return {
    id: required(row.id, 'id'),
    group: required(row.group, 'group'),
    label: required(row.label, 'label'),
    detail: optional(row.detail),
    priority: optional(row.priority),
    deadline: optional(row.deadline),
    status: optional(row.status),
    sortOrder: Number(row.sort_order || 0),
  };
}

function normalizePreTripTodoRow(row) {
  return {
    id: required(row.id, 'id'),
    title: required(row.title, 'title'),
    deadline: optional(row.deadline),
    status: optional(row.status),
    owner: optional(row.owner),
    note: optional(row.note_public),
    sourceUrl: optional(row.source_url),
    sortOrder: Number(row.sort_order || 0),
  };
}

function normalizePreTripRuleRow(row) {
  return {
    id: required(row.id, 'id'),
    category: required(row.category, 'category'),
    title: required(row.title, 'title'),
    rule: required(row.rule_public, 'rule_public'),
    action: optional(row.action_public),
    sourceUrl: optional(row.source_url),
    sortOrder: Number(row.sort_order || 0),
  };
}

function normalizeDailyCheckRow(row) {
  return {
    id: required(row.id, 'id'),
    group: required(row.group, 'group'),
    label: required(row.label, 'label'),
    detail: optional(row.detail),
    priority: optional(row.priority),
    deadline: optional(row.timing || row.deadline),
    status: optional(row.source),
    sortOrder: Number(row.sort_order || 0),
  };
}

function required(value, field) {
  const text = String(value ?? '').trim();
  if (!text) throw new Error(`Missing required booking field: ${field}`);
  return text;
}

function optional(value) {
  const text = publicText(value);
  return text || undefined;
}

function splitList(value) {
  return [...new Set(publicText(value)
    .split(/[；;]\s*/)
    .map((item) => item.trim())
    .filter(Boolean))];
}

function publicText(value) {
  return String(value ?? '')
    .replaceAll('身份证件', '证件')
    .replaceAll('身份证', '证件')
    .replaceAll('护照', '证件')
    .trim();
}

function inferLinkKind(kind) {
  if (kind === '交通' || kind === '租车') return '交通';
  return '官方';
}

function validateBookings(bookings) {
  const serialized = JSON.stringify(bookings);
  for (const rule of bookingPrivacyRules) {
    if (rule.pattern.test(serialized)) {
      throw new Error(`Privacy check failed while importing booking sheet: ${rule.name}`);
    }
  }

  const ids = new Set();
  for (const booking of bookings) {
    if (ids.has(booking.id)) throw new Error(`Duplicate booking id: ${booking.id}`);
    ids.add(booking.id);
  }
}

function validatePlaces(places) {
  const serialized = JSON.stringify(places);
  for (const rule of commonPrivacyRules) {
    if (rule.pattern.test(serialized)) {
      throw new Error(`Privacy check failed while importing node sheet: ${rule.name}`);
    }
  }

  const ids = new Set();
  for (const place of places) {
    if (ids.has(place.id)) throw new Error(`Duplicate node info id: ${place.id}`);
    ids.add(place.id);
  }
}

function validateLodgings(lodgings) {
  const serialized = JSON.stringify(lodgings);
  for (const rule of commonPrivacyRules) {
    if (rule.pattern.test(serialized)) {
      throw new Error(`Privacy check failed while importing lodging sheet: ${rule.name}`);
    }
  }

  const ids = new Set();
  for (const lodging of lodgings) {
    if (ids.has(lodging.id)) throw new Error(`Duplicate lodging id: ${lodging.id}`);
    ids.add(lodging.id);
  }
}

function validatePreTrip(preTrip) {
  const serialized = JSON.stringify(preTrip);
  for (const rule of bookingPrivacyRules) {
    if (rule.pattern.test(serialized)) {
      throw new Error(`Privacy check failed while importing pre-trip sheets: ${rule.name}`);
    }
  }

  assertUniqueIds(preTrip.checklist, 'pre-trip checklist');
  assertUniqueIds(preTrip.todos, 'pre-trip todo');
  assertUniqueIds(preTrip.rules, 'pre-trip rule');
  assertUniqueIds(preTrip.dailyChecks, 'daily check');
}

function assertUniqueIds(items, label) {
  const ids = new Set();
  for (const item of items) {
    if (ids.has(item.id)) throw new Error(`Duplicate ${label} id: ${item.id}`);
    ids.add(item.id);
  }
}

function writeGeneratedBookings(bookings) {
  mkdirSync(resolve('src/data/generated'), { recursive: true });
  const sorted = [...bookings].sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));
  const source = [
    "import type { BookingSummary } from '../../types';",
    '',
    '// Generated by npm run import:data from the local redacted Excel booking sheet.',
    '// Do not edit by hand; update the private workbook instead.',
    `export const bookings: BookingSummary[] = ${JSON.stringify(sorted, null, 2)};`,
    '',
  ].join('\n');
  writeFileSync(generatedBookingsPath, source, 'utf8');
}

function writeGeneratedPlaces(places) {
  mkdirSync(resolve('src/data/generated'), { recursive: true });
  const sorted = [...places].sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));
  const source = [
    "import type { PlaceInfo } from '../../types';",
    '',
    '// Generated by npm run import:data from the local redacted Excel node sheet.',
    '// Do not edit by hand; update the private workbook instead.',
    `export const places: PlaceInfo[] = ${JSON.stringify(sorted, null, 2)};`,
    '',
  ].join('\n');
  writeFileSync(generatedPlacesPath, source, 'utf8');
}

function writeGeneratedLodgings(lodgings) {
  mkdirSync(resolve('src/data/generated'), { recursive: true });
  const sorted = [...lodgings].sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));
  const source = [
    "import type { LodgingSummary } from '../../types';",
    '',
    '// Generated by npm run import:data from the local redacted Excel lodging sheet.',
    '// Do not edit by hand; update the private workbook instead.',
    `export const lodgings: LodgingSummary[] = ${JSON.stringify(sorted, null, 2)};`,
    '',
  ].join('\n');
  writeFileSync(generatedLodgingsPath, source, 'utf8');
}

function writeGeneratedPreTrip(preTrip) {
  mkdirSync(resolve('src/data/generated'), { recursive: true });
  const checklist = [...preTrip.checklist].sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));
  const todos = [...preTrip.todos].sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));
  const rules = [...preTrip.rules].sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));
  const dailyChecks = [...preTrip.dailyChecks].sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));
  const source = [
    "import type { ChecklistItem, PreTripRule, PreTripTodo } from '../../types';",
    '',
    '// Generated by npm run import:data from the local public source workbook.',
    '// Do not edit by hand; update the private source workbook instead.',
    `export const preTripChecklist: ChecklistItem[] = ${JSON.stringify(checklist, null, 2)};`,
    '',
    `export const preTripTodos: PreTripTodo[] = ${JSON.stringify(todos, null, 2)};`,
    '',
    `export const preTripRules: PreTripRule[] = ${JSON.stringify(rules, null, 2)};`,
    '',
    `export const dailyChecks: ChecklistItem[] = ${JSON.stringify(dailyChecks, null, 2)};`,
    '',
  ].join('\n');
  writeFileSync(generatedPreTripPath, source, 'utf8');
}
