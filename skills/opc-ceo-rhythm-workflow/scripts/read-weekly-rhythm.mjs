#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const ACTION = 'read-weekly-rhythm';
const DEFAULT_LARK_CLI = '/Applications/办公小浣熊.app/Contents/Resources/cli-bundle/node_modules/.bin/lark-cli';

function usage() {
  return `Usage:
  $BOX_AGENT_NODE skills/opc-ceo-rhythm-workflow/scripts/read-weekly-rhythm.mjs --payload <payload.json> [--execute]

Read weekly rhythm items, key actions and progress status from a Feishu Base table. Defaults to dry-run.
`;
}
function parseArgs(argv) { const args = { execute: false, payloadPath: null, help: false }; for (let i = 0; i < argv.length; i += 1) { const arg = argv[i]; if (arg === '--help' || arg === '-h') args.help = true; else if (arg === '--execute') args.execute = true; else if (arg === '--payload') { args.payloadPath = argv[i + 1]; i += 1; } else throw new Error(`Unknown argument: ${arg}`); } return args; }
function output(result, exitCode = 0) { process.stdout.write(`${JSON.stringify(result, null, 2)}\n`); process.exit(exitCode); }
function fail(message, details = {}, exitCode = 1) { output({ ok: false, dryRun: true, action: ACTION, error: { message, ...details } }, exitCode); }
function readJson(path) { if (!path) throw new Error('Missing --payload <payload.json>'); if (!existsSync(path)) throw new Error(`Payload file does not exist: ${path}`); try { return JSON.parse(readFileSync(path, 'utf8')); } catch (error) { throw new Error(`Invalid JSON payload: ${error.message}`); } }
function validatePayload(payload) { const errors = []; if (!payload || typeof payload !== 'object' || Array.isArray(payload)) errors.push('payload must be an object'); for (const key of ['baseToken', 'tableId']) if (typeof payload[key] !== 'string' || payload[key].trim() === '') errors.push(`${key} is required`); if (payload.viewId !== undefined && typeof payload.viewId !== 'string') errors.push('viewId must be a string'); if (payload.fieldIds !== undefined && (!Array.isArray(payload.fieldIds) || payload.fieldIds.some((item) => typeof item !== 'string'))) errors.push('fieldIds must be a string array'); if (payload.limit !== undefined && (!Number.isInteger(payload.limit) || payload.limit < 1 || payload.limit > 200)) errors.push('limit must be an integer from 1 to 200'); if (payload.weekLabel !== undefined && typeof payload.weekLabel !== 'string') errors.push('weekLabel must be a string'); return errors; }
function findLarkCli() { const envPath = process.env.LARK_CLI_PATH; if (envPath && existsSync(envPath)) return envPath; if (existsSync(DEFAULT_LARK_CLI)) return DEFAULT_LARK_CLI; return 'lark-cli'; }
function buildCommand(larkCli, payload) { const args = ['base', '+record-list', '--as', 'user', '--base-token', payload.baseToken.trim(), '--table-id', payload.tableId.trim(), '--limit', String(payload.limit || 50)]; if (payload.viewId && payload.viewId.trim()) args.push('--view-id', payload.viewId.trim()); for (const fieldId of payload.fieldIds || []) if (fieldId.trim()) args.push('--field-id', fieldId.trim()); return { command: larkCli, args }; }
function runCommand(command, args) { return spawnSync(command, args, { encoding: 'utf8' }); }
function parseRecords(stdout) { try { const parsed = stdout ? JSON.parse(stdout) : null; const records = Array.isArray(parsed?.items) ? parsed.items : Array.isArray(parsed?.records) ? parsed.records : Array.isArray(parsed?.data?.items) ? parsed.data.items : []; return { parsed, records }; } catch { return { parsed: null, records: [] }; } }
function summarize(records) { return records.map((record) => ({ recordId: record.record_id || record.id || null, fields: record.fields || record })); }
function extractUrls(text) { return [...String(text).matchAll(/https?:\/\/[^\s"'<>]+/g)].map((match) => match[0]); }
function main() { let args; try { args = parseArgs(process.argv.slice(2)); } catch (error) { fail(error.message, { usage: usage() }, 2); } if (args.help) { process.stdout.write(usage()); process.exit(0); } let payload; try { payload = readJson(args.payloadPath); } catch (error) { fail(error.message, {}, 2); } const validationErrors = validatePayload(payload); if (validationErrors.length > 0) fail('Payload validation failed', { validationErrors }, 2); const planned = buildCommand(findLarkCli(), payload); if (!args.execute) output({ ok: true, dryRun: true, action: ACTION, weekLabel: payload.weekLabel || null, plannedCommand: [planned.command, ...planned.args], expectedOutput: ['weekly rhythm records', 'key actions', 'status fields'], warnings: ['Dry-run only. Use a prepared filtered view for week/status conditions, then re-run with --execute.'], errors: [] }); const result = runCommand(planned.command, planned.args); const success = result.status === 0; const { records } = parseRecords(result.stdout); output({ ok: success, dryRun: false, action: ACTION, weekLabel: payload.weekLabel || null, command: [planned.command, ...planned.args], count: records.length, records: success ? summarize(records) : [], urls: extractUrls(`${result.stdout}\n${result.stderr}`), warnings: records.length === 0 && success ? ['No records returned. Check view/filter/field projection.'] : [], errors: success ? [] : [{ status: result.status, stderr: result.stderr.trim(), stdout: result.stdout.trim() }] }, success ? 0 : 1); }
main();
