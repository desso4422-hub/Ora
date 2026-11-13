/// <reference types="node" />
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addDays, isValidKey, startOfWeek, toKey, weekday, weekKeys } from '../src/dates';
import {
  bestStreak, cellState, currentStreak, dayCounts, dayScore, dayStatus, daysSinceStart,
  globalRate, isOverdue, isScheduled, rate30,
} from '../src/stats';
import { parseBackup, validateBackup } from '../src/backup';
import type { Habit, Logs } from '../src/types';

// 2026-11-13 est un vendredi.
const TODAY = '2026-11-13';
const WEEKDAYS = [1, 2, 3, 4, 5];
const ALL = [0, 1, 2, 3, 4, 5, 6];

const habit = (p: Partial<Habit> = {}): Habit => ({
  id: 'h1', name: 'Lecture', emoji: '📚', days: ALL, reminder: null,
  createdAt: '2026-10-01', order: 0, ...p,
});
const logsFor = (id: string, keys: string[]): Logs => ({ [id]: Object.fromEntries(keys.map((k) => [k, true as const])) });

test('dates : clés locales et semaine', () => {
  assert.equal(weekday(TODAY), 5);
  assert.equal(toKey(new Date(2026, 0, 5, 23, 59)), '2026-01-05');
  assert.equal(addDays('2026-03-01', -1), '2026-02-28');
  assert.equal(addDays('2026-03-28', 2), '2026-03-30'); // changement d'heure
  assert.equal(startOfWeek(TODAY), '2026-11-09');
  assert.deepEqual(weekKeys('2026-11-15'), ['2026-11-09', '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14', '2026-11-15']);
  assert.ok(isValidKey('2024-02-29'));
  assert.ok(!isValidKey('2026-02-30'));
  assert.ok(!isValidKey('2026-1-05'));
});

test('jour prévu / non prévu', () => {
  const h = habit({ days: WEEKDAYS, createdAt: '2026-11-10' });
  assert.ok(isScheduled(h, TODAY)); // vendredi
  assert.ok(!isScheduled(h, '2026-11-14')); // samedi
  assert.ok(!isScheduled(h, '2026-11-09')); // lundi, avant la création
  assert.ok(isScheduled(h, '2026-11-10')); // jour de création
});

test('score du jour', () => {
  const a = habit({ id: 'a' });
  const b = habit({ id: 'b' });
  const c = habit({ id: 'c' });
  const d = habit({ id: 'd', days: [1] }); // lundi seulement : pas prévue vendredi
  const logs: Logs = { ...logsFor('a', [TODAY]), ...logsFor('b', [TODAY]) };
  assert.deepEqual(dayScore([a, b, c, d], logs, TODAY), { done: 2, scheduled: 3, pct: 67 });
  assert.deepEqual(dayScore([d], logs, TODAY), { done: 0, scheduled: 0, pct: 0 });
  assert.deepEqual(dayScore([], {}, TODAY), { done: 0, scheduled: 0, pct: 0 });
});

test('série en cours : le week-end ne casse pas la série', () => {
  const h = habit({ days: WEEKDAYS });
  // ven 13, jeu 12, mer 11, mar 10, lun 9, (sam 8, dim 7 non prévus), ven 6
  const logs = logsFor('h1', ['2026-11-13', '2026-11-12', '2026-11-11', '2026-11-10', '2026-11-09', '2026-11-06']);
  assert.equal(currentStreak(h, logs, TODAY), 6);
  // depuis lundi 16 (non fait, aujourd'hui), on retrouve la série à travers le week-end
  assert.equal(currentStreak(h, logs, '2026-11-16'), 6);
});

test("série en cours : aujourd'hui non fait ne casse pas la série", () => {
  const h = habit();
  const logs = logsFor('h1', ['2026-11-12', '2026-11-11', '2026-11-10']);
  assert.equal(currentStreak(h, logs, TODAY), 3);
});

test('série en cours : un jour raté casse la série', () => {
  const h = habit();
  const logs = logsFor('h1', ['2026-11-13', '2026-11-12', '2026-11-10', '2026-11-09']);
  assert.equal(currentStreak(h, logs, TODAY), 2);
  assert.equal(currentStreak(h, {}, TODAY), 0);
});

test('série : ne remonte pas avant la création', () => {
  const h = habit({ createdAt: '2026-11-12' });
  const logs = logsFor('h1', ['2026-11-13', '2026-11-12', '2026-11-11', '2026-11-10']);
  assert.equal(currentStreak(h, logs, TODAY), 2);
});

test('record', () => {
  const h = habit({ createdAt: '2026-11-01' });
  const logs = logsFor('h1', [
    '2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04', // 4
    '2026-11-06', '2026-11-07', // 2
    '2026-11-11', '2026-11-12', // 2 (série en cours, aujourd'hui non fait)
  ]);
  assert.equal(bestStreak(h, logs, TODAY), 4);
  assert.equal(currentStreak(h, logs, TODAY), 2);
  const wk = habit({ createdAt: '2026-11-01', days: WEEKDAYS });
  const wkLogs = logsFor('h1', ['2026-11-05', '2026-11-06', '2026-11-09', '2026-11-10', '2026-11-11']);
  assert.equal(bestStreak(wk, wkLogs, TODAY), 5); // le week-end ne casse pas
});

test('taux sur 30 jours', () => {
  const h = habit({ createdAt: '2026-01-01' });
  const keys = Array.from({ length: 15 }, (_, i) => addDays(TODAY, -1 - i * 2)); // 15 jours faits sur 29
  // aujourd'hui non fait → exclu : 15 / 29
  assert.deepEqual(rate30(h, logsFor('h1', keys), TODAY), { done: 15, scheduled: 29, pct: 52 });
  // aujourd'hui fait → inclus : 16 / 30
  assert.deepEqual(rate30(h, logsFor('h1', [...keys, TODAY]), TODAY), { done: 16, scheduled: 30, pct: 53 });
  // créée il y a 3 jours, tout fait
  const recent = habit({ createdAt: addDays(TODAY, -2) });
  assert.equal(rate30(recent, logsFor('h1', [addDays(TODAY, -2), addDays(TODAY, -1)]), TODAY).pct, 100);
  // un log en dehors des 30 jours ne compte pas
  assert.equal(rate30(h, logsFor('h1', ['2026-09-01']), TODAY).done, 0);
});

test('taux global, jours depuis le début, jours complets / ratés', () => {
  const a = habit({ id: 'a', createdAt: '2026-11-11' });
  const b = habit({ id: 'b', createdAt: '2026-11-12' });
  const logs: Logs = { ...logsFor('a', ['2026-11-11', '2026-11-12', TODAY]), ...logsFor('b', [TODAY]) };
  assert.equal(daysSinceStart([a, b], TODAY), 3);
  assert.equal(daysSinceStart([], TODAY), 0);
  // a : 3/3 ; b : 12 raté, 13 fait → 1/2 ; total 4/5
  assert.deepEqual(globalRate([a, b], logs, TODAY), { done: 4, scheduled: 5, pct: 80 });
  assert.deepEqual(dayCounts([a, b], logs, TODAY), { complete: 2, missed: 1 });
  assert.equal(dayStatus([a, b], logs, '2026-11-12', TODAY), 'missed');
  assert.equal(dayStatus([a, b], logs, TODAY, TODAY), 'complete');
  assert.equal(dayStatus([a, b], logs, '2026-11-14', TODAY), 'none');
});

test('en retard et cases d\'historique', () => {
  const h = habit({ reminder: { hour: 10, minute: 0 } });
  const at = (hh: number, mm: number) => new Date(2026, 10, 13, hh, mm);
  assert.ok(!isOverdue(h, {}, TODAY, at(9, 59), TODAY));
  assert.ok(isOverdue(h, {}, TODAY, at(10, 0), TODAY));
  assert.ok(!isOverdue(h, logsFor('h1', [TODAY]), TODAY, at(11, 0), TODAY));
  assert.ok(!isOverdue(habit(), {}, TODAY, at(23, 0), TODAY)); // pas de rappel
  assert.equal(cellState(h, logsFor('h1', ['2026-11-12']), '2026-11-12', TODAY), 'done');
  assert.equal(cellState(h, {}, '2026-11-11', TODAY), 'missed');
  assert.equal(cellState(h, {}, TODAY, TODAY), 'off');
  assert.equal(cellState(h, {}, '2026-11-20', TODAY), 'off');
  assert.equal(cellState(h, {}, '2026-09-01', TODAY), 'off');
});

test('import : fichier valide', () => {
  const data = {
    version: 1,
    habits: [habit({ days: [5, 1], reminder: { hour: 7, minute: 30 } })],
    logs: logsFor('h1', ['2026-11-12']),
  };
  const r = parseBackup(JSON.stringify(data));
  assert.ok(r.ok);
  if (r.ok) {
    assert.deepEqual(r.data.habits[0].days, [1, 5]);
    assert.deepEqual(r.data.logs, { h1: { '2026-11-12': true } });
  }
  assert.ok(validateBackup({ version: 1, habits: [], logs: {} }).ok);
});

test('import : fichiers invalides', () => {
  const good = { version: 1, habits: [habit()], logs: {} };
  const bad: unknown[] = [
    null, [], 'texte',
    { ...good, version: 2 },
    { ...good, habits: 'x' },
    { ...good, logs: [] },
    { ...good, habits: [habit({ days: [7] })] },
    { ...good, habits: [habit({ days: [] })] },
    { ...good, habits: [habit({ days: [1, 1] })] },
    { ...good, habits: [habit({ name: '  ' })] },
    { ...good, habits: [habit({ createdAt: '2026-13-01' })] },
    { ...good, habits: [habit({ reminder: { hour: 24, minute: 0 } })] },
    { ...good, habits: [habit(), habit()] },
    { ...good, logs: { inconnu: { '2026-11-12': true } } },
    { ...good, logs: { h1: { '2026-11-12': false } } },
    { ...good, logs: { h1: { 'hier': true } } },
  ];
  for (const b of bad) {
    const r = validateBackup(b);
    assert.ok(!r.ok, `devrait être refusé : ${JSON.stringify(b)}`);
    if (!r.ok) assert.ok(r.error.length > 0);
  }
  const notJson = parseBackup('{ pas du json');
  assert.ok(!notJson.ok);
});
