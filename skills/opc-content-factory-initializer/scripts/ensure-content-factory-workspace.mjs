#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const ACTION = 'ensure-content-factory-workspace';
const DEFAULT_LARK_CLI = '/Applications/办公小浣熊.app/Contents/Resources/cli-bundle/node_modules/.bin/lark-cli';

function usage() {
  return `Usage:
  $BOX_AGENT_NODE skills/opc-content-factory-initializer/scripts/ensure-content-factory-workspace.mjs --payload <payload.json> [--execute]

Purpose:
  Ensure the Feishu Drive folder for OPC content factory exists.

Default:
  Dry-run only. Re-run with --execute after user confirmation.

Required payload fields:
  folderName: string

Optional payload fields:
  parentToken: string
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
  output({ ok: false, dryRun: true, action: ACTION, error: { message, ...details } }, exitCode);
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
  if (typeof payload.folderName !== 'string' || payload.folderName.trim() === '') errors.push('folderName is required');
  if (payload.parentToken !== undefined && typeof payload.parentToken !== 'string') errors.push('parentToken must be a string');
  if (payload.dryRunNotes !== undefined && !Array.isArray(payload.dryRunNotes)) errors.push('dryRunNotes must be an array');
  return errors;
}

function findLarkCli() {
  const envPath = process.env.LARK_CLI_PATH;
  if (envPath && existsSync(envPath)) return envPath;
  if (existsSync(DEFAULT_LARK_CLI)) return DEFAULT_LARK_CLI;
  return 'lark-cli';
}

function buildSearchCommand(larkCli, payload) {
  return {
    command: larkCli,
    args: ['drive', '+search', '--as', 'user', '--query', payload.folderName.trim()],
  };
}

function buildCreateCommand(larkCli, payload) {
  const args = ['drive', '+create-folder', '--as', 'user', '--name', payload.folderName.trim()];
  if (payload.parentToken && payload.parentToken.trim()) args.push('--parent-token', payload.parentToken.trim());
  return { command: larkCli, args };
}

function runCommand(command, args) {
  return spawnSync(command, args, { encoding: 'utf8' });
}

function parseJsonMaybe(text) {
  try { return text ? JSON.parse(text) : null; } catch { return null; }
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

  const larkCli = findLarkCli();
  const search = buildSearchCommand(larkCli, payload);
  const create = buildCreateCommand(larkCli, payload);

  if (!args.execute) {
    output({
      ok: true,
      dryRun: true,
      action: ACTION,
      folderName: payload.folderName.trim(),
      plannedCommands: [[search.command, ...search.args], [create.command, ...create.args]],
      created: [{ type: 'folder', name: payload.folderName.trim(), ifMissing: true }],
      updated: [],
      urls: [],
      warnings: ['Dry-run only. Re-run with --execute after user confirmation.', ...(payload.dryRunNotes || [])],
      errors: [],
    });
  }

  const searchResult = runCommand(search.command, search.args);
  const searchOk = searchResult.status === 0;
  const searchParsed = parseJsonMaybe(searchResult.stdout);
  if (!searchOk) {
    output({
      ok: false,
      dryRun: false,
      action: ACTION,
      found: [],
      created: [],
      updated: [],
      urls: extractUrls(`${searchResult.stdout}\n${searchResult.stderr}`),
      warnings: [],
      errors: [{ status: searchResult.status, stderr: searchResult.stderr.trim(), stdout: searchResult.stdout.trim() }],
    }, 1);
  }

  const existing = findExistingFolder(searchParsed, payload.folderName.trim());
  if (existing) {
    output({
      ok: true,
      dryRun: false,
      action: ACTION,
      found: [{ type: 'folder', result: existing }],
      created: [],
      updated: [],
      urls: extractUrls(`${searchResult.stdout}\n${searchResult.stderr}`),
      warnings: [],
      errors: [],
    });
  }

  const createResult = runCommand(create.command, create.args);
  const createOk = createResult.status === 0;
  const createParsed = parseJsonMaybe(createResult.stdout);
  output({
    ok: createOk,
    dryRun: false,
    action: ACTION,
    search: { ok: searchOk, result: searchParsed || searchResult.stdout.trim(), stderr: searchResult.stderr.trim() },
    created: createOk ? [{ type: 'folder', result: createParsed || createResult.stdout.trim() }] : [],
    updated: [],
    urls: extractUrls(`${searchResult.stdout}\n${searchResult.stderr}\n${createResult.stdout}\n${createResult.stderr}`),
    warnings: [],
    errors: createOk ? [] : [{ status: createResult.status, stderr: createResult.stderr.trim(), stdout: createResult.stdout.trim() }],
  }, createOk ? 0 : 1);
}

function findExistingFolder(parsed, folderName) {
  const haystack = Array.isArray(parsed)
    ? parsed
    : parsed?.data?.results || parsed?.data?.items || parsed?.items || parsed?.records || [];
  if (!Array.isArray(haystack)) return null;

  return haystack.find((item) => {
    const meta = item.result_meta || {};
    const rawName = item.name || item.title || item.file_name || item?.fields?.name || item.title_highlighted || '';
    const name = stripHighlightTags(rawName).trim();
    const type = item.type || item.file_type || item.obj_type || meta.doc_types || item.entity_type;
    const isFolder = String(type || '').toUpperCase().includes('FOLDER');
    return name === folderName && isFolder;
  }) || null;
}

function stripHighlightTags(value) {
  return String(value).replace(/<\/?h>/g, '');
}

function extractUrls(text) {
  return [...String(text).matchAll(/https?:\/\/[^\s"'<>]+/g)].map((match) => match[0]);
}

main();
