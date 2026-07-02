#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const ACTION = 'upsert-cashflow-record';
const RESOURCE_TYPE = 'cashflow-record';
const PURPOSE = 'Create or update one OPC cashflow or payment collection record in a Feishu Base table.';
const DEFAULT_LARK_CLI = '/Applications/办公小浣熊.app/Contents/Resources/cli-bundle/node_modules/.bin/lark-cli';

function usage() {
  return `Usage:
  $BOX_AGENT_NODE skills/opc-feishu-update-review/scripts/${ACTION}.mjs --payload <payload.json> [--execute]

Purpose:
  ${PURPOSE}

Default:
  Dry-run only. Re-run with --execute after user confirmation.

Required payload fields:
  baseToken: string
  tableId: string
  fields: object

Optional payload fields:
  recordId: string (update existing record; omitted means create a new record)
  clientToken: string
  dryRunNotes: string[]
`;
}

function parseArgs(argv) {
  const args = { execute: false, payloadPath: null, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') args.help = true;
    else if (arg === '--execute') args.execute = true;
    else if (arg === '--payload') {
      args.payloadPath = argv[i + 1];
      i += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return args;
}

function output(result, exitCode = 0) {
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  process.exit(exitCode);
}

function fail(message, details = {}, exitCode = 1) {
  output({ ok: false, dryRun: true, action: ACTION, resourceType: RESOURCE_TYPE, error: { message, ...details } }, exitCode);
}

function readJson(path) {
  if (!path) throw new Error('Missing --payload <payload.json>');
  if (!existsSync(path)) throw new Error(`Payload file does not exist: ${path}`);
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    throw new Error(`Invalid JSON payload: ${error.message}`);
  }
}

function validatePayload(payload) {
  const errors = [];
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) errors.push('payload must be an object');
  for (const key of ['baseToken', 'tableId']) {
    if (typeof payload?.[key] !== 'string' || payload[key].trim() === '') errors.push(`${key} is required`);
  }
  if (!payload?.fields || typeof payload.fields !== 'object' || Array.isArray(payload.fields)) errors.push('fields object is required');
  else if (Object.keys(payload.fields).length === 0) errors.push('fields object must not be empty');
  if (payload?.recordId !== undefined && typeof payload.recordId !== 'string') errors.push('recordId must be a string');
  if (payload?.clientToken !== undefined && typeof payload.clientToken !== 'string') errors.push('clientToken must be a string');
  if (payload?.dryRunNotes !== undefined && !Array.isArray(payload.dryRunNotes)) errors.push('dryRunNotes must be an array');
  return errors;
}

function findLarkCli() {
  const envPath = process.env.LARK_CLI_PATH;
  if (envPath && existsSync(envPath)) return envPath;
  if (existsSync(DEFAULT_LARK_CLI)) return DEFAULT_LARK_CLI;
  return 'lark-cli';
}

function buildCommand(larkCli, payload) {
  const args = [
    'base', '+record-upsert',
    '--as', 'user',
    '--base-token', payload.baseToken.trim(),
    '--table-id', payload.tableId.trim(),
    '--json', JSON.stringify(payload.fields),
  ];
  if (payload.recordId && payload.recordId.trim()) args.push('--record-id', payload.recordId.trim());
  return { command: larkCli, args };
}

function redactCommandForDisplay(command, args) {
  const redacted = [];
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--json') {
      redacted.push('--json', '<fields-json>');
      i += 1;
    } else {
      redacted.push(args[i]);
    }
  }
  return [command, ...redacted];
}

function runCommand(command, args) {
  return spawnSync(command, args, { encoding: 'utf8' });
}

function extractUrls(text) {
  return [...String(text).matchAll(/https?:\/\/[^\s"'<>]+/g)].map((match) => match[0]);
}

function main() {
  let args;
  try { args = parseArgs(process.argv.slice(2)); } catch (error) { fail(error.message, { usage: usage() }, 2); }
  if (args.help) {
    process.stdout.write(usage());
    process.exit(0);
  }

  let payload;
  try { payload = readJson(args.payloadPath); } catch (error) { fail(error.message, {}, 2); }

  const validationErrors = validatePayload(payload);
  if (validationErrors.length > 0) fail('Payload validation failed', { validationErrors }, 2);

  const planned = buildCommand(findLarkCli(), payload);
  const mode = payload.recordId && payload.recordId.trim() ? 'update-existing-record' : 'create-new-record';
  if (!args.execute) {
    output({
      ok: true,
      dryRun: true,
      action: ACTION,
      resourceType: RESOURCE_TYPE,
      mode,
      plannedCommand: redactCommandForDisplay(planned.command, planned.args),
      created: mode === 'create-new-record' ? [{ type: 'base-record', resourceType: RESOURCE_TYPE, fields: Object.keys(payload.fields) }] : [],
      updated: mode === 'update-existing-record' ? [{ type: 'base-record', resourceType: RESOURCE_TYPE, fields: Object.keys(payload.fields) }] : [],
      urls: [],
      warnings: ['Dry-run only. Re-run with --execute after user confirmation.', ...(payload.dryRunNotes || [])],
      errors: [],
    });
  }

  const result = runCommand(planned.command, planned.args);
  const success = result.status === 0;
  let parsedStdout = null;
  try { parsedStdout = result.stdout ? JSON.parse(result.stdout) : null; } catch {}
  output({
    ok: success,
    dryRun: false,
    action: ACTION,
    resourceType: RESOURCE_TYPE,
    mode,
    command: redactCommandForDisplay(planned.command, planned.args),
    created: success && mode === 'create-new-record' ? [{ type: 'base-record', resourceType: RESOURCE_TYPE, result: parsedStdout || result.stdout.trim() }] : [],
    updated: success && mode === 'update-existing-record' ? [{ type: 'base-record', resourceType: RESOURCE_TYPE, result: parsedStdout || result.stdout.trim() }] : [],
    urls: extractUrls(`${result.stdout}\n${result.stderr}`),
    warnings: [],
    errors: success ? [] : [{ status: result.status, stderr: result.stderr.trim(), stdout: result.stdout.trim() }],
  }, success ? 0 : 1);
}

main();
