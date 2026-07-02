#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const DOC_KIND = 'content-weekly-report';
const DEFAULT_FORMAT = '{year}-{month}-W{weekNumber}｜内容工厂周报｜{title}';

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

function renderName(week, title, format = DEFAULT_FORMAT) {
  return format
    .replaceAll('{year}', String(week.year))
    .replaceAll('{month}', String(week.month).padStart(2, '0'))
    .replaceAll('{weekNumber}', String(week.weekNumber))
    .replaceAll('{weekCode}', week.weekCode || `W${week.weekNumber}`)
    .replaceAll('{title}', title || week.title || week.dateRange || '本周');
}

function run(commandArgs, execute) {
  const command = process.env.LARK_CLI || 'lark-cli';
  const args = [...commandArgs, '--as', 'user'];
  if (!execute) return { dryRun: true, command, args };
  const result = spawnSync(command, args, { encoding: 'utf8' });
  return { dryRun: false, command, args, status: result.status, stdout: result.stdout?.trim(), stderr: result.stderr?.trim() };
}

function required(payload) {
  const missing = [];
  if (!payload.week?.year) missing.push('week.year');
  if (!payload.week?.month) missing.push('week.month');
  if (!payload.week?.weekNumber) missing.push('week.weekNumber');
  if (!payload.archive?.monthFolderToken) missing.push('archive.monthFolderToken');
  if (!payload.document?.markdown) missing.push('document.markdown');
  if (missing.length) throw new Error(`Missing required fields: ${missing.join(', ')}`);
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log('Usage: archive-content-weekly-report.mjs --payload <file> [--execute]');
    return;
  }
  const payload = await readJson(args.payload);
  required(payload);
  const title = renderName(payload.week, payload.document.title, payload.archive.namingFormat);
  const commandArgs = ['docs', '+create', '--api-version', 'v2', '--parent-token', payload.archive.monthFolderToken, '--title', title, '--content', payload.document.markdown, '--format', 'markdown'];
  const result = run(commandArgs, args.execute);
  console.log(JSON.stringify({ ok: true, mode: args.execute ? 'execute' : 'dry-run', kind: DOC_KIND, title, monthFolderToken: payload.archive.monthFolderToken, command: result }, null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, kind: DOC_KIND, error: error.message }, null, 2));
  process.exit(1);
});
