#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const args = { apiVersion: 'v2', as: 'user', format: 'markdown', dryRun: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--doc' || arg === '--token' || arg === '--url') args.doc = argv[++i];
    else if (arg === '--out') args.out = argv[++i];
    else if (arg === '--format') args.format = argv[++i];
    else if (arg === '--api-version') args.apiVersion = argv[++i];
    else if (arg === '--as') args.as = argv[++i];
    else if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--payload') args.payload = argv[++i];
    else if (arg === '--execute') args.dryRun = false;
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
}

function usage() {
  console.log(`Usage: fetch-style-report.mjs --doc <doc_token_or_url> --out <local.md> [--format markdown] [--dry-run]\n\nFetch the current author style report from Lark Docx via lark-cli docs +fetch.\nRead-only by default; --dry-run prints the lark-cli command without executing.`);
}

function ensureDir(filePath) {
  const dir = path.dirname(path.resolve(filePath));
  fs.mkdirSync(dir, { recursive: true });
}

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  usage();
  process.exit(0);
}

if (args.payload) {
  const payload = JSON.parse(fs.readFileSync(args.payload, 'utf8'));
  args.doc = args.doc || payload.documentId || payload.docToken || payload.url;
  args.out = args.out || payload.output || payload.out || 'tmp/style-output.md';
  args.dryRun = true;
}

if (!args.doc || !args.out) {
  usage();
  process.exit(2);
}

const cli = process.env.LARK_CLI || 'lark-cli';
const cmd = ['docs', '+fetch', '--document-id', args.doc, '--format', args.format];
const result = { action: 'fetch-style-report', command: [cli, ...cmd], output: args.out, dryRun: args.dryRun };
if (args.dryRun) {
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

ensureDir(args.out);
const proc = spawnSync(cli, cmd, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
if (proc.error) throw proc.error;
if (proc.status !== 0) {
  process.stderr.write(proc.stderr || proc.stdout);
  process.exit(proc.status ?? 1);
}
fs.writeFileSync(args.out, proc.stdout, 'utf8');
console.log(JSON.stringify({ ...result, bytes: Buffer.byteLength(proc.stdout, 'utf8') }, null, 2));
