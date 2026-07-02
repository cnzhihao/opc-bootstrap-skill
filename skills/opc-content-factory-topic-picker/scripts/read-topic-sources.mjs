#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

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

async function readJson(path) {
  if (!path) throw new Error('Missing --payload <file>');
  return JSON.parse(await readFile(path, 'utf8'));
}

function run(commandArgs, execute) {
  const command = process.env.LARK_CLI || 'lark-cli';
  const args = [...commandArgs, '--as', 'user'];
  if (!execute) return { dryRun: true, command, args };
  const result = spawnSync(command, args, { encoding: 'utf8' });
  return { dryRun: false, command, args, status: result.status, stdout: result.stdout?.trim(), stderr: result.stderr?.trim() };
}

function commandFor(source) {
  if (source.type === 'docx') {
    if (!source.token) throw new Error(`Docx source ${source.name || ''} requires token`);
    return ['docs', '+fetch', '--api-version', 'v2', '--token', source.token, '--format', source.format || 'markdown'];
  }
  if (source.type === 'base') {
    if (!source.appToken || !source.tableId) throw new Error(`Base source ${source.name || ''} requires appToken and tableId`);
    const args = ['base', 'record', 'list', '--app-token', source.appToken, '--table-id', source.tableId];
    if (source.viewId) args.push('--view-id', source.viewId);
    if (source.filter) args.push('--filter', source.filter);
    return args;
  }
  if (source.type === 'drive-folder') {
    if (!source.folderToken) throw new Error(`Drive folder source ${source.name || ''} requires folderToken`);
    return ['drive', 'file', 'list', '--parent-token', source.folderToken];
  }
  throw new Error(`Unsupported source type: ${source.type}`);
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log('Usage: read-topic-sources.mjs --payload <file> [--execute]');
    return;
  }
  const payload = await readJson(args.payload);
  if (!Array.isArray(payload.sources) || payload.sources.length === 0) throw new Error('payload.sources must be a non-empty array');
  const results = payload.sources.map((source, index) => ({
    source: source.name || `source-${index + 1}`,
    command: run(commandFor(source), args.execute),
    extractionHint: source.extractionHint || 'Extract user pain, strong opinions, customer cases, and reusable examples.'
  }));
  console.log(JSON.stringify({ ok: true, mode: args.execute ? 'execute' : 'dry-run', sourceCount: results.length, results }, null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error.message }, null, 2));
  process.exit(1);
});
