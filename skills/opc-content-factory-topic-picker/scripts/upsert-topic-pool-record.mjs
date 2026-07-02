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

function buildFields(payload) {
  const topic = payload.topic || {};
  if (!topic.title) throw new Error('topic.title is required');
  return {
    '选题标题': topic.title,
    '内容支柱': topic.pillar || '',
    '核心受众': topic.audience || '',
    '痛点/冲突': topic.tension || '',
    '状态': topic.status || '候选',
    '评分': topic.score ?? null,
    '证据来源': (topic.sources || []).join('\n'),
    '选题卡链接': topic.noteUrl || '',
    '下一步': topic.nextStep || ''
  };
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log('Usage: upsert-topic-pool-record.mjs --payload <file> [--execute]');
    return;
  }
  const payload = await readJson(args.payload);
  if (!payload.base?.appToken || !payload.base?.tableId) throw new Error('base.appToken and base.tableId are required');
  const fields = buildFields(payload);
  const fieldsJson = JSON.stringify(fields);
  const commandArgs = payload.recordId
    ? ['base', 'record', 'update', '--app-token', payload.base.appToken, '--table-id', payload.base.tableId, '--record-id', payload.recordId, '--fields', fieldsJson]
    : ['base', 'record', 'create', '--app-token', payload.base.appToken, '--table-id', payload.base.tableId, '--fields', fieldsJson];
  const command = run(commandArgs, args.execute);
  console.log(JSON.stringify({ ok: true, mode: args.execute ? 'execute' : 'dry-run', operation: payload.recordId ? 'update' : 'create', fields, command }, null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error.message }, null, 2));
  process.exit(1);
});
