#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const REQUIRED_KINDS = ['content-weekly-report', 'article-draft', 'video-script'];

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

function expectedTitles(payload) {
  const week = payload.week || {};
  const prefix = `${week.year}-${String(week.month).padStart(2, '0')}-W${week.weekNumber}`;
  return REQUIRED_KINDS.map((kind) => {
    const label = kind === 'content-weekly-report' ? '内容工厂周报' : kind === 'article-draft' ? '内容工厂发布稿' : '长视频口播稿';
    return { kind, contains: `${prefix}｜${label}` };
  });
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log('Usage: validate-weekly-archive.mjs --payload <file> [--execute]');
    return;
  }
  const payload = await readJson(args.payload);
  if (!payload.archive?.monthFolderToken) throw new Error('archive.monthFolderToken is required');
  if (!payload.week?.year || !payload.week?.month || !payload.week?.weekNumber) throw new Error('week.year, week.month and week.weekNumber are required');

  const listed = payload.documents || [];
  const expectations = expectedTitles(payload);
  const localChecks = expectations.map((item) => {
    const matched = listed.find((doc) => doc.kind === item.kind || String(doc.title || '').includes(item.contains));
    return { ...item, foundInPayload: Boolean(matched), title: matched?.title || null, token: matched?.token || null };
  });
  const command = run(['drive', 'file', 'list', '--parent-token', payload.archive.monthFolderToken], args.execute);
  const ok = localChecks.every((check) => check.foundInPayload) || args.execute;

  console.log(JSON.stringify({
    ok,
    mode: args.execute ? 'execute' : 'dry-run',
    monthFolderToken: payload.archive.monthFolderToken,
    expectations,
    localChecks,
    remoteListCommand: command,
    note: args.execute ? 'Inspect stdout to confirm remote file titles.' : 'Dry-run validates provided document metadata and shows the remote list command.'
  }, null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error.message }, null, 2));
  process.exit(1);
});
