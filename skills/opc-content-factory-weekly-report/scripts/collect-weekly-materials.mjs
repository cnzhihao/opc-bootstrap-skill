#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const HELP = `Usage: collect-weekly-materials.mjs --payload <file> [--execute]\n\nReads weekly content materials from Lark Base tables or doc sources. Default is dry-run.\n`;

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

function cliPath(name) {
  return process.env[name] || name.replace('LARK_CLI', 'lark-cli');
}

function runLark(args, execute) {
  const command = cliPath('LARK_CLI');
  const fullArgs = [...args, '--as', 'user'];
  if (!execute) return { dryRun: true, command, args: fullArgs };
  const result = spawnSync(command, fullArgs, { encoding: 'utf8' });
  return {
    dryRun: false,
    command,
    args: fullArgs,
    status: result.status,
    stdout: result.stdout?.trim(),
    stderr: result.stderr?.trim()
  };
}

function buildSourceCommand(source) {
  if (source.type === 'base') {
    if (!source.appToken || !source.tableId) throw new Error(`Base source ${source.name || ''} requires appToken and tableId`);
    const args = ['base', 'record', 'list', '--app-token', source.appToken, '--table-id', source.tableId];
    if (source.viewId) args.push('--view-id', source.viewId);
    if (source.filter) args.push('--filter', source.filter);
    if (source.pageSize) args.push('--page-size', String(source.pageSize));
    return args;
  }
  if (source.type === 'docx') {
    if (!source.token) throw new Error(`Docx source ${source.name || ''} requires token`);
    return ['docs', '+fetch', '--api-version', 'v2', '--token', source.token, '--format', source.format || 'markdown'];
  }
  throw new Error(`Unsupported source type: ${source.type}`);
}

function normalizeMaterialStub(source, index, period) {
  return {
    source: source.name || `source-${index + 1}`,
    type: source.type,
    period,
    commandPlanned: true,
    note: 'Dry-run does not fetch remote content. Re-run with --execute after user confirmation.'
  };
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(HELP);
    return;
  }
  const payload = await readJson(args.payload);
  const sources = payload.sources || [];
  if (!payload.week || !payload.week.monthFolderName || !payload.week.weekCode) throw new Error('payload.week.monthFolderName and payload.week.weekCode are required');
  if (!Array.isArray(sources) || sources.length === 0) throw new Error('payload.sources must be a non-empty array');

  const results = sources.map((source, index) => ({
    source: source.name || `source-${index + 1}`,
    command: runLark(buildSourceCommand(source), args.execute),
    material: args.execute ? null : normalizeMaterialStub(source, index, payload.week)
  }));

  console.log(JSON.stringify({
    ok: true,
    mode: args.execute ? 'execute' : 'dry-run',
    week: payload.week,
    sourceCount: sources.length,
    results
  }, null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error.message }, null, 2));
  process.exit(1);
});
