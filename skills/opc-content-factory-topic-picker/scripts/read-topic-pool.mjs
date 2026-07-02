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

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log('Usage: read-topic-pool.mjs --payload <file> [--execute]');
    return;
  }
  const payload = await readJson(args.payload);
  if (!payload.base?.appToken || !payload.base?.tableId) throw new Error('base.appToken and base.tableId are required');
  const commandArgs = ['base', 'record', 'list', '--app-token', payload.base.appToken, '--table-id', payload.base.tableId];
  if (payload.base.viewId) commandArgs.push('--view-id', payload.base.viewId);
  if (payload.filter) commandArgs.push('--filter', payload.filter);
  if (payload.pageSize) commandArgs.push('--page-size', String(payload.pageSize));
  const command = run(commandArgs, args.execute);
  console.log(JSON.stringify({ ok: true, mode: args.execute ? 'execute' : 'dry-run', base: payload.base, filter: payload.filter || null, command }, null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error.message }, null, 2));
  process.exit(1);
});
