#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const DEFAULT_FORMAT = '{date}｜选题卡｜{title}';

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

function titleFrom(payload) {
  const topic = payload.topic || {};
  const date = payload.date || new Date().toISOString().slice(0, 10);
  return (payload.archive?.namingFormat || DEFAULT_FORMAT)
    .replaceAll('{date}', date)
    .replaceAll('{title}', topic.title || '未命名选题')
    .replaceAll('{pillar}', topic.pillar || '内容工厂');
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log('Usage: create-topic-note.mjs --payload <file> [--execute]');
    return;
  }
  const payload = await readJson(args.payload);
  if (!payload.archive?.folderToken) throw new Error('archive.folderToken is required');
  if (!payload.topic?.title) throw new Error('topic.title is required');
  if (!payload.note?.markdown) throw new Error('note.markdown is required');
  const title = titleFrom(payload);
  const command = run(['docs', '+create', '--api-version', 'v2', '--parent-token', payload.archive.folderToken, '--title', title, '--content', payload.note.markdown, '--format', 'markdown'], args.execute);
  console.log(JSON.stringify({ ok: true, mode: args.execute ? 'execute' : 'dry-run', title, folderToken: payload.archive.folderToken, command }, null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error.message }, null, 2));
  process.exit(1);
});
