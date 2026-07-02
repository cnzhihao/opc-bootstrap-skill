#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const SCRIPT = 'read-aihot-materials.mjs';
const ACTION = '读取 AI HOT 素材记录';
const MODE = 'base-upsert';
const REQUIRED = ["baseToken", "tableId", "fields"];

function parseArgs(argv) {
  const args = { execute: false };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--payload') args.payload = argv[++i];
    else if (arg === '--execute') args.execute = true;
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
}

function usage() {
  return `Usage: $BOX_AGENT_NODE skills/<skill>/scripts/${SCRIPT} --payload <json-file> [--execute]
Default is dry-run. Use --execute only after user confirmation.`;
}

async function readPayload(file) {
  if (!file) throw new Error('--payload <json-file> is required');
  return JSON.parse(await readFile(file, 'utf8'));
}

function validate(payload) {
  const missing = REQUIRED.filter((key) => payload[key] === undefined || payload[key] === null || payload[key] === '');
  if (missing.length) throw new Error(`Missing required payload fields: ${missing.join(', ')}`);
}

function larkCli() { return process.env.LARK_CLI || 'lark-cli'; }

function docContent(payload) {
  const title = escapeXml(payload.title || payload.documentTitle || payload.name || ACTION);
  const body = escapeXml(payload.contentMarkdown || payload.content || payload.summary || '');
  return `<title>${title}</title><h1>${title}</h1><p>${body}</p>`;
}

function escapeXml(value) {
  return String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&apos;');
}

function buildCommand(payload) {
  if (MODE === 'doc-create') {
    const args = ['docs', '+create', '--api-version', 'v2', '--as', 'user', '--content', docContent(payload)];
    if (payload.parentToken || payload.folderToken) args.push('--parent-token', payload.parentToken || payload.folderToken);
    return { command: larkCli(), args, redactedArgs: args.map((v,i)=> args[i-1] === '--content' ? '<docx-xml-content>' : v) };
  }
  if (MODE === 'doc-update') {
    const args = ['docs', '+update', '--api-version', 'v2', '--as', 'user', '--document-id', payload.documentId || payload.docToken || '<document_id>', '--content', docContent(payload)];
    return { command: larkCli(), args, redactedArgs: args.map((v,i)=> args[i-1] === '--content' ? '<docx-xml-content>' : v) };
  }
  if (MODE === 'doc-fetch') {
    const args = ['docs', '+fetch', '--api-version', 'v2', '--as', 'user', '--document-id', payload.documentId || payload.docToken || '<document_id>'];
    return { command: larkCli(), args, redactedArgs: args };
  }
  if (MODE === 'drive-folder') {
    const args = ['drive', '+create-folder', '--as', 'user', '--name', payload.folderName || payload.name || ACTION];
    if (payload.parentToken) args.push('--parent-token', payload.parentToken);
    return { command: larkCli(), args, redactedArgs: args };
  }
  if (MODE === 'base-upsert') {
    const fields = JSON.stringify(payload.fields || {});
    const args = ['base', '+record-upsert', '--as', 'user', '--base-token', payload.baseToken || '<base_token>', '--table-id', payload.tableId || '<table_id>', '--json', fields];
    if (payload.recordId) args.push('--record-id', payload.recordId);
    return { command: larkCli(), args, redactedArgs: args.map((v,i)=> args[i-1] === '--json' ? '<fields-json>' : v) };
  }
  throw new Error(`Unsupported mode: ${MODE}`);
}

function run(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || `Command failed with status ${result.status}`);
  return result.stdout || '';
}

function extractUrls(text) {
  return Array.from(new Set(String(text || '').match(/https?:\/\/[^\s"'<>]+/g) || []));
}

function ok(data) { console.log(JSON.stringify({ ok: true, ...data }, null, 2)); }
function fail(error) { console.log(JSON.stringify({ ok: false, action: ACTION, errors: [String(error.message || error)] }, null, 2)); process.exitCode = 1; }

async function main() {
  try {
    const args = parseArgs(process.argv);
    if (args.help) { console.log(usage()); return; }
    const payload = await readPayload(args.payload);
    validate(payload);
    const planned = buildCommand(payload);
    if (!args.execute) {
      ok({ dryRun: true, action: ACTION, plannedCommand: [planned.command, ...planned.redactedArgs], created: null, updated: null, existing: null, urls: [], warnings: payload.warnings || [], errors: [] });
      return;
    }
    const stdout = run(planned.command, planned.args);
    ok({ dryRun: false, action: ACTION, plannedCommand: [planned.command, ...planned.redactedArgs], stdout, created: MODE.includes('create') || MODE === 'drive-folder' ? true : null, updated: MODE.includes('update') || MODE === 'base-upsert' ? true : null, existing: null, urls: extractUrls(stdout), warnings: [], errors: [] });
  } catch (error) { fail(error); }
}

main();
