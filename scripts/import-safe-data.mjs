import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import XLSX from 'xlsx';

const safeRoot = resolve('Data_Safe');
const generatedRoot = resolve('src/data/generated');
const generatedBookingsPath = resolve(generatedRoot, 'bookings.ts');
const generatedPlacesPath = resolve(generatedRoot, 'places.ts');
const generatedLodgingsPath = resolve(generatedRoot, 'lodgings.ts');
const generatedPreTripPath = resolve(generatedRoot, 'pretrip.ts');
const tripDataPath = resolve('src/data/trip.ts');

const publicSourceWorkbookName = '网页公开真源.xlsx';
const humanWorkbookName = '北欧冰岛行程总表.xlsx';
const planName = 'plan.md';

const sheets = {
  days: '每日行程公开',
  timeline: '每日时间线公开',
  reminders: '每日提醒公开',
  links: '每日外链公开',
  bookings: '票据公开摘要',
  places: '节点公开资料',
  lodgings: '住宿公开摘要',
  checklist: '出发前清单公开',
  todos: '行前待办公开',
  rules: '行前规则公开',
  dailyChecks: '每日检查公开',
};

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

const publicSourceWorkbookPath = resolveSafeFile(publicSourceWorkbookName);
const humanWorkbookPath = resolveSafeFile(humanWorkbookName, false);
const planPath = resolveSafeFile(planName, false);

if (!publicSourceWorkbookPath) {
  console.error(`Missing ${publicSourceWorkbookName}. Public website data must be generated from the redacted source workbook.`);
  process.exit(1);
}

const publicWorkbook = XLSX.readFile(publicSourceWorkbookPath, { cellDates: true, bookFiles: false });
const result = {
  safeRootPresent: true,
  planPresent: Boolean(planPath),
  workbookPresent: Boolean(humanWorkbookPath),
  publicSourceWorkbookPresent: true,
  planCharacterCount: planPath ? readFileSync(planPath, 'utf8').length : 0,
  publicSourceSheets: describeSheets(publicWorkbook),
  generatedTripDays: null,
  generatedBookings: null,
  generatedPlaces: null,
  generatedLodgings: null,
  generatedPreTrip: null,
  nextSteps: [
    'Review changed private source files locally.',
    'Run npm run verify before publishing.',
    'Publish only the generated public-safe app, never Data_Safe.',
  ],
};

for (const sheetName of Object.values(sheets)) {
  if (!publicWorkbook.SheetNames.includes(sheetName)) {
    throw new Error(`Missing "${sheetName}" sheet in public source workbook.`);
  }
}

const tripDays = buildTripDays(publicWorkbook);
validatePublicPayload(tripDays, commonPrivacyRules, 'trip day sheets');
writeTripDays(tripDays);
result.generatedTripDays = { path: tripDataPath.replaceAll('\\', '/'), count: tripDays.length };

const bookings = rows(publicWorkbook, sheets.bookings).map(normalizeBookingRow);
validateBookings(bookings);
writeGeneratedBookings(bookings);
result.generatedBookings = { path: generatedBookingsPath.replaceAll('\\', '/'), count: bookings.length };

const places = rows(publicWorkbook, sheets.places).map(normalizePlaceRow);
validatePlaces(places);
writeGeneratedPlaces(places);
result.generatedPlaces = { path: generatedPlacesPath.replaceAll('\\', '/'), count: places.length };

const lodgings = rows(publicWorkbook, sheets.lodgings).map(normalizeLodgingRow);
validateLodgings(lodgings);
writeGeneratedLodgings(lodgings);
result.generatedLodgings = { path: generatedLodgingsPath.replaceAll('\\', '/'), count: lodgings.length };

const preTrip = {
  checklist: rows(publicWorkbook, sheets.checklist).map(normalizePreTripChecklistRow),
  todos: rows(publicWorkbook, sheets.todos).map(normalizePreTripTodoRow),
  rules: rows(publicWorkbook, sheets.rules).map(normalizePreTripRuleRow),
  dailyChecks: rows(publicWorkbook, sheets.dailyChecks).map(normalizeDailyCheckRow),
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

console.log(JSON.stringify(result, null, 2));

function resolveSafeFile(name, required = true) {
  const hit = readdirSync(safeRoot).find((file) => file === name);
  if (!hit) {
    if (required) throw new Error(`Missing local source file: ${name}`);
    return '';
  }
  return resolve(safeRoot, hit);
}

function describeSheets(workbook) {
  return workbook.SheetNames.map((name) => {
    const range = XLSX.utils.decode_range(workbook.Sheets[name]['!ref'] ?? 'A1:A1');
    return {
      name,
      rows: range.e.r - range.s.r + 1,
      columns: range.e.c - range.s.c + 1,
    };
  });
}

function rows(workbook, sheetName) {
  return XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });
}

function buildTripDays(workbook) {
  const dayRows = rows(workbook, sheets.days);
  const timelineRows = rows(workbook, sheets.timeline);
  const reminderRows = rows(workbook, sheets.reminders);
  const linkRows = rows(workbook, sheets.links);

  return dayRows
    .map((row) => {
      const date = required(row.date, 'date');
      return {
        date,
        area: required(row.area, 'area'),
        stay: required(row.stay, 'stay'),
        summary: required(row.summary, 'summary'),
        meal: required(row.meal, 'meal'),
        cost: optional(row.cost),
        drive: optional(row.drive),
        fuel: optional(row.fuel),
        route: required(row.route, 'route'),
        heroImage: optional(row.hero_image),
        galleryImages: splitList(row.gallery_images),
        riskTags: splitList(row.risk_tags),
        timeline: timelineRows
          .filter((item) => String(item.date).trim() === date)
          .sort(sortByOrder)
          .map(normalizeTimelineRow),
        reminders: reminderRows
          .filter((item) => String(item.date).trim() === date)
          .sort(sortByOrder)
          .map((item) => required(item.reminder_public, 'reminder_public')),
        links: linkRows
          .filter((item) => String(item.date).trim() === date)
          .sort(sortByOrder)
          .map(normalizeSourceLinkRow),
      };
    })
    .sort(sortByOrder);
}

function normalizeTimelineRow(row) {
  return cleanUndefined({
    time: required(row.time, 'time'),
    place: required(row.place, 'place'),
    title: required(row.title, 'title'),
    transport: optional(row.transport),
    note: optional(row.note_public),
    required: toBoolean(row.required) || undefined,
    optional: toBoolean(row.optional) || undefined,
  });
}

function normalizeSourceLinkRow(row) {
  return {
    label: required(row.label, 'label'),
    url: required(row.url, 'url'),
    kind: required(row.kind, 'kind'),
  };
}

function normalizeBookingRow(row) {
  const links = String(row.official_url || '').trim()
    ? [{
      label: String(row.official_url_label || row.vendor || '官方链接').trim(),
      url: String(row.official_url).trim(),
      kind: inferLinkKind(row.kind),
    }]
    : undefined;

  return cleanUndefined({
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
    facts: splitList(row.facts_public),
    reminder: optional(row.reminder_public),
    links,
    sortOrder: Number(row.sort_order || 0),
  });
}

function normalizePlaceRow(row) {
  return cleanUndefined({
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
  });
}

function normalizeLodgingRow(row) {
  return cleanUndefined({
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
  });
}

function normalizePreTripChecklistRow(row) {
  return cleanUndefined({
    id: required(row.id, 'id'),
    group: required(row.group, 'group'),
    label: required(row.label, 'label'),
    detail: optional(row.detail),
    priority: optional(row.priority),
    deadline: optional(row.deadline),
    status: optional(row.status),
    sortOrder: Number(row.sort_order || 0),
  });
}

function normalizePreTripTodoRow(row) {
  return cleanUndefined({
    id: required(row.id, 'id'),
    title: required(row.title, 'title'),
    deadline: optional(row.deadline),
    status: optional(row.status),
    owner: optional(row.owner),
    note: optional(row.note_public),
    sourceUrl: optional(row.source_url),
    sortOrder: Number(row.sort_order || 0),
  });
}

function normalizePreTripRuleRow(row) {
  return cleanUndefined({
    id: required(row.id, 'id'),
    category: required(row.category, 'category'),
    title: required(row.title, 'title'),
    rule: required(row.rule_public, 'rule_public'),
    action: optional(row.action_public),
    sourceUrl: optional(row.source_url),
    sortOrder: Number(row.sort_order || 0),
  });
}

function normalizeDailyCheckRow(row) {
  return cleanUndefined({
    id: required(row.id, 'id'),
    group: required(row.group, 'group'),
    label: required(row.label, 'label'),
    detail: optional(row.detail),
    priority: optional(row.priority),
    deadline: optional(row.timing || row.deadline),
    status: optional(row.source),
    sortOrder: Number(row.sort_order || 0),
  });
}

function required(value, field) {
  const text = publicText(value);
  if (!text) throw new Error(`Missing required source field: ${field}`);
  return text;
}

function optional(value) {
  const text = publicText(value);
  return text || undefined;
}

function splitList(value) {
  return [...new Set(publicText(value)
    .split(/[；;\n]+/)
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

function toBoolean(value) {
  return ['true', 'yes', 'y', '1', '是', '必做'].includes(String(value ?? '').trim().toLowerCase());
}

function sortByOrder(a, b) {
  return Number(a.sort_order || 0) - Number(b.sort_order || 0) || String(a.id || '').localeCompare(String(b.id || ''));
}

function inferLinkKind(kind) {
  if (kind === '交通' || kind === '租车') return '交通';
  return '官方';
}

function cleanUndefined(value) {
  if (Array.isArray(value)) return value.map(cleanUndefined);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined));
}

function validateBookings(items) {
  validatePublicPayload(items, bookingPrivacyRules, 'booking sheet');
  assertUniqueIds(items, 'booking');
}

function validatePlaces(items) {
  validatePublicPayload(items, commonPrivacyRules, 'node sheet');
  assertUniqueIds(items, 'node info');
}

function validateLodgings(items) {
  validatePublicPayload(items, commonPrivacyRules, 'lodging sheet');
  assertUniqueIds(items, 'lodging');
}

function validatePreTrip(preTrip) {
  validatePublicPayload(preTrip, bookingPrivacyRules, 'pre-trip sheets');
  assertUniqueIds(preTrip.checklist, 'pre-trip checklist');
  assertUniqueIds(preTrip.todos, 'pre-trip todo');
  assertUniqueIds(preTrip.rules, 'pre-trip rule');
  assertUniqueIds(preTrip.dailyChecks, 'daily check');
}

function validatePublicPayload(payload, rules, label) {
  const serialized = JSON.stringify(payload);
  for (const rule of rules) {
    if (rule.pattern.test(serialized)) {
      throw new Error(`Privacy check failed while importing ${label}: ${rule.name}`);
    }
  }
}

function assertUniqueIds(items, label) {
  const ids = new Set();
  for (const item of items) {
    if (ids.has(item.id)) throw new Error(`Duplicate ${label} id: ${item.id}`);
    ids.add(item.id);
  }
}

function writeTripDays(days) {
  const sorted = [...days].sort((a, b) => daySortValue(a.date) - daySortValue(b.date));
  const source = [
    "import type { TripDay } from '../types';",
    '',
    '// Generated by npm run import:data from the local public source workbook.',
    '// Do not edit by hand; update the local public source workbook instead.',
    "export const totalCost = '59,270 RMB';",
    '',
    `export const tripDays: TripDay[] = ${JSON.stringify(sorted, null, 2)};`,
    '',
  ].join('\n');
  writeFileSync(tripDataPath, source, 'utf8');
}

function writeGeneratedBookings(items) {
  mkdirSync(generatedRoot, { recursive: true });
  const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));
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

function writeGeneratedPlaces(items) {
  mkdirSync(generatedRoot, { recursive: true });
  const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));
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

function writeGeneratedLodgings(items) {
  mkdirSync(generatedRoot, { recursive: true });
  const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));
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
  mkdirSync(generatedRoot, { recursive: true });
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

function daySortValue(date) {
  const [month, day] = String(date).split('/').map(Number);
  return month * 100 + day;
}
