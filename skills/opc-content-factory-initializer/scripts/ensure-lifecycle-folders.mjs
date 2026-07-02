#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const ACTION = 'ensure-lifecycle-folders';

const DEFAULT_STRUCTURE = [
  { name: '00_内容战略与方法论', children: ['选题原则', '风格资产', '复盘沉淀'] },
  { name: '01_选题池', children: ['待评估', '已立项', '暂缓'] },
  { name: '02_素材库', children: ['创始人访谈', '客户案例', '行业资料', '金句与片段'] },
  { name: '03_稿件生产中', children: ['文章草稿', '口播脚本', '短内容切片', '待审阅'] },
  { name: '04_已发布归档', children: ['公众号', '视频号', '知乎', '小红书', '其他平台'] },
  { name: '05_数据复盘', children: ['周复盘', '月复盘', '爆款拆解'] },
  { name: '06_平台发布包', children: ['待同步', '已同步', '封面与素材'] }
];

function usage() {
  return [
    'Usage:',
    '  node scripts/ensure-lifecycle-folders.mjs --payload examples/ensure-lifecycle-folders.payload.example.json',
    '  node scripts/ensure-lifecycle-folders.mjs --payload payload.json --execute',
    '',
    'Payload fields:',
    '  rootToken / workspaceToken: 内容工厂根目录 token（必填）',
    '  structure: 可选，多级目录数组，形如 [{ name, children: ["子目录", { name, children: [] }] }]',
    '  dryRunNotes: 可选，dry-run 输出中的提醒'
  ].join('\n');
}

function parseArgs(argv) {
  const parsed = { execute: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--payload') parsed.payloadPath = argv[++i];
    else if (arg === '--execute') parsed.execute = true;
    else if (arg === '--help' || arg === '-h') parsed.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return parsed;
}

function output(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function fail(message, details = {}, exitCode = 1) {
  output({ ok: false, dryRun: true, action: ACTION, error: { message, ...details } });
  process.exit(exitCode);
}

function loadPayload(payloadPath) {
  if (!payloadPath) throw new Error('--payload is required');
  return JSON.parse(readFileSync(payloadPath, 'utf8'));
}

function validatePayload(payload) {
  const errors = [];
  const rootToken = payload.rootToken || payload.workspaceToken;
  if (typeof rootToken !== 'string' || rootToken.trim() === '') errors.push('rootToken or workspaceToken is required');
  if (payload.structure !== undefined && !Array.isArray(payload.structure)) errors.push('structure must be an array when provided');
  if (payload.dryRunNotes !== undefined && !Array.isArray(payload.dryRunNotes)) errors.push('dryRunNotes must be an array');
  return errors;
}

function normalizeNode(node) {
  if (typeof node === 'string') return { name: node, children: [] };
  if (!node || typeof node !== 'object') throw new Error('Every structure item must be a string or object');
  if (typeof node.name !== 'string' || node.name.trim() === '') throw new Error('Every folder node must include a non-empty name');
  const children = node.children === undefined ? [] : node.children;
  if (!Array.isArray(children)) throw new Error(`children of ${node.name} must be an array`);
  return { name: node.name.trim(), children: children.map(normalizeNode) };
}

function normalizeStructure(payload) {
  return (payload.structure || DEFAULT_STRUCTURE).map(normalizeNode);
}

function flattenStructure(nodes, parentTokenRef = 'root', parentPath = '') {
  const rows = [];
  for (const node of nodes) {
    const path = parentPath ? `${parentPath}/${node.name}` : node.name;
    const tokenRef = `folder:${path}`;
    rows.push({ name: node.name, path, parentTokenRef, tokenRef });
    rows.push(...flattenStructure(node.children, tokenRef, path));
  }
  return rows;
}

function driveSearchArgs(name, parentToken) {
  const args = ['drive', '+search', '--as', 'user', '--query', name];
  if (parentToken) args.push('--parent-token', parentToken);
  return args;
}

function driveCreateFolderArgs(name, parentToken) {
  return ['drive', '+create-folder', '--as', 'user', '--name', name, '--parent-token', parentToken];
}

function runCommand(args) {
  return spawnSync('lark-cli', args, { encoding: 'utf8' });
}

function parseJson(stdout) {
  try { return JSON.parse(stdout || '{}'); } catch { return null; }
}

function collectItems(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (Array.isArray(value.items)) return value.items;
  if (Array.isArray(value.files)) return value.files;
  if (Array.isArray(value.data?.items)) return value.data.items;
  if (Array.isArray(value.data?.files)) return value.data.files;
  return [];
}

function itemName(item) {
  return item.name || item.title || item.file_name || item.filename || '';
}

function itemToken(item) {
  return item.token || item.file_token || item.folder_token || item.obj_token || item.node_token || item.id || '';
}

function isFolder(item) {
  const type = String(item.type || item.file_type || item.obj_type || item.mime_type || '').toLowerCase();
  return type === 'folder' || type.includes('folder');
}

function findExistingFolder(parsed, name) {
  return collectItems(parsed).find((item) => itemName(item) === name && isFolder(item));
}

function extractCreatedToken(parsed) {
  return itemToken(parsed?.data || parsed || collectItems(parsed)[0] || {});
}

async function main() {
  let args;
  try { args = parseArgs(process.argv.slice(2)); } catch (error) { fail(error.message, { usage: usage() }, 2); }
  if (args.help) { process.stdout.write(`${usage()}\n`); return; }

  let payload;
  try { payload = loadPayload(args.payloadPath); } catch (error) { fail(error.message, { usage: usage() }, 2); }
  const errors = validatePayload(payload);
  if (errors.length) fail('Invalid payload', { errors, usage: usage() }, 2);

  let structure;
  try { structure = normalizeStructure(payload); } catch (error) { fail(error.message, { usage: usage() }, 2); }

  const rootToken = (payload.rootToken || payload.workspaceToken).trim();
  const planned = flattenStructure(structure);

  if (!args.execute) {
    output({
      ok: true,
      dryRun: true,
      action: ACTION,
      rootToken,
      summary: { foldersPlanned: planned.length, maxDepth: Math.max(0, ...planned.map((item) => item.path.split('/').length)) },
      planned,
      commands: planned.flatMap((item) => [
        { command: 'lark-cli', args: driveSearchArgs(item.name, item.parentTokenRef === 'root' ? rootToken : `<${item.parentTokenRef}>`), purpose: `校验 ${item.path} 是否已存在` },
        { command: 'lark-cli', args: driveCreateFolderArgs(item.name, item.parentTokenRef === 'root' ? rootToken : `<${item.parentTokenRef}>`), purpose: `缺失时创建 ${item.path}` }
      ]),
      warnings: ['Dry-run only. Re-run with --execute after user confirmation.', ...(payload.dryRunNotes || [])]
    });
    return;
  }

  const tokenByRef = new Map([['root', rootToken]]);
  const created = [];
  const existing = [];

  for (const item of planned) {
    const parentToken = tokenByRef.get(item.parentTokenRef);
    if (!parentToken) fail('Parent token missing during execution', { item, created, existing });

    const search = runCommand(driveSearchArgs(item.name, parentToken));
    if (search.status !== 0) fail('lark-drive search failed', { item, stderr: search.stderr, stdout: search.stdout, created, existing });
    const found = findExistingFolder(parseJson(search.stdout), item.name);
    if (found) {
      const token = itemToken(found);
      tokenByRef.set(item.tokenRef, token);
      existing.push({ ...item, token });
      continue;
    }

    const create = runCommand(driveCreateFolderArgs(item.name, parentToken));
    if (create.status !== 0) fail('lark-drive create-folder failed', { item, stderr: create.stderr, stdout: create.stdout, created, existing });
    const token = extractCreatedToken(parseJson(create.stdout));
    tokenByRef.set(item.tokenRef, token);
    created.push({ ...item, token });
  }

  output({ ok: true, dryRun: false, action: ACTION, rootToken, created, existing, summary: { created: created.length, existing: existing.length } });
}

main().catch((error) => fail(error.message));
