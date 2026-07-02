#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const ACTION = 'validate-content-factory-workspace';

const REQUIRED_FOLDERS = [
  '00_内容战略与方法论',
  '00_内容战略与方法论/选题原则',
  '00_内容战略与方法论/风格资产',
  '00_内容战略与方法论/复盘沉淀',
  '01_选题池',
  '01_选题池/待评估',
  '01_选题池/已立项',
  '01_选题池/暂缓',
  '02_素材库',
  '02_素材库/创始人访谈',
  '02_素材库/客户案例',
  '02_素材库/行业资料',
  '02_素材库/金句与片段',
  '03_稿件生产中',
  '03_稿件生产中/文章草稿',
  '03_稿件生产中/口播脚本',
  '03_稿件生产中/短内容切片',
  '03_稿件生产中/待审阅',
  '04_已发布归档',
  '04_已发布归档/公众号',
  '04_已发布归档/视频号',
  '04_已发布归档/知乎',
  '04_已发布归档/小红书',
  '04_已发布归档/其他平台',
  '05_数据复盘',
  '05_数据复盘/周复盘',
  '05_数据复盘/月复盘',
  '05_数据复盘/爆款拆解',
  '06_平台发布包',
  '06_平台发布包/待同步',
  '06_平台发布包/已同步',
  '06_平台发布包/封面与素材'
];
const REQUIRED_DOCS = ['内容工厂｜选题评估模板', '内容工厂｜深度访谈模板', '内容工厂｜长文章写作模板', '内容工厂｜长视频口播稿模板', '内容工厂｜发布复盘模板'];
const REQUIRED_BASES = ['内容工厂核心看板'];

function usage() {
  return [
    'Usage:',
    '  node scripts/validate-content-factory-workspace.mjs --payload examples/validate-content-factory-workspace.payload.example.json',
    '  node scripts/validate-content-factory-workspace.mjs --payload payload.json --execute',
    '',
    'Payload fields:',
    '  rootToken / workspaceToken: 内容工厂根目录 token（必填）',
    '  requiredFolders / requiredDocs / requiredBases: 可选，覆盖默认验收清单',
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

function output(value) { process.stdout.write(`${JSON.stringify(value, null, 2)}\n`); }
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
  for (const key of ['requiredFolders', 'requiredDocs', 'requiredBases', 'dryRunNotes']) {
    if (payload[key] !== undefined && !Array.isArray(payload[key])) errors.push(`${key} must be an array when provided`);
  }
  return errors;
}

function runCommand(args) { return spawnSync('lark-cli', args, { encoding: 'utf8' }); }
function parseJson(stdout) { try { return JSON.parse(stdout || '{}'); } catch { return null; } }
function collectItems(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (Array.isArray(value.items)) return value.items;
  if (Array.isArray(value.files)) return value.files;
  if (Array.isArray(value.data?.items)) return value.data.items;
  if (Array.isArray(value.data?.files)) return value.data.files;
  return [];
}
function itemName(item) { return item.name || item.title || item.file_name || item.filename || ''; }
function itemToken(item) { return item.token || item.file_token || item.folder_token || item.obj_token || item.node_token || item.id || ''; }
function itemType(item) { return String(item.type || item.file_type || item.obj_type || item.mime_type || '').toLowerCase(); }
function isFolder(item) { const type = itemType(item); return type === 'folder' || type.includes('folder'); }
function isBase(item) { const type = itemType(item); return type.includes('bitable') || type.includes('base'); }
function isDoc(item) { const type = itemType(item); return type.includes('doc') || type.includes('docx') || type.includes('wiki'); }
function searchArgs(query, parentToken) { return ['drive', '+search', '--as', 'user', '--query', query, '--parent-token', parentToken]; }
function listArgs(parentToken) { return ['drive', '+list', '--as', 'user', '--parent-token', parentToken]; }

function findByName(items, name, predicate = () => true) { return items.find((item) => itemName(item) === name && predicate(item)); }

function dryRunCommands(rootToken, folders, docs, bases) {
  const commands = [];
  for (const path of folders) {
    const name = path.split('/').at(-1);
    commands.push({ command: 'lark-cli', args: searchArgs(name, '<parent-folder-token>'), purpose: `校验生命周期目录：${path}` });
  }
  for (const title of docs) commands.push({ command: 'lark-cli', args: searchArgs(title, rootToken), purpose: `校验模板文档：${title}` });
  for (const title of bases) commands.push({ command: 'lark-cli', args: searchArgs(title, rootToken), purpose: `校验核心看板：${title}` });
  return commands;
}

function groupFoldersByDepth(folders) {
  return [...folders].sort((a, b) => a.split('/').length - b.split('/').length || a.localeCompare(b, 'zh-Hans-CN'));
}

function parentPath(path) { const parts = path.split('/'); parts.pop(); return parts.join('/'); }
function leafName(path) { return path.split('/').at(-1); }

async function main() {
  let args;
  try { args = parseArgs(process.argv.slice(2)); } catch (error) { fail(error.message, { usage: usage() }, 2); }
  if (args.help) { process.stdout.write(`${usage()}\n`); return; }
  let payload;
  try { payload = loadPayload(args.payloadPath); } catch (error) { fail(error.message, { usage: usage() }, 2); }
  const errors = validatePayload(payload);
  if (errors.length) fail('Invalid payload', { errors, usage: usage() }, 2);

  const rootToken = (payload.rootToken || payload.workspaceToken).trim();
  const requiredFolders = payload.requiredFolders || REQUIRED_FOLDERS;
  const requiredDocs = payload.requiredDocs || REQUIRED_DOCS;
  const requiredBases = payload.requiredBases || REQUIRED_BASES;

  if (!args.execute) {
    output({
      ok: true,
      dryRun: true,
      action: ACTION,
      rootToken,
      checklist: { requiredFolders, requiredDocs, requiredBases },
      summary: { folders: requiredFolders.length, docs: requiredDocs.length, bases: requiredBases.length },
      commands: dryRunCommands(rootToken, requiredFolders, requiredDocs, requiredBases),
      warnings: ['Dry-run only. Re-run with --execute after user confirmation.', ...(payload.dryRunNotes || [])]
    });
    return;
  }

  const folderTokens = new Map([['', rootToken]]);
  const folderResults = [];
  for (const path of groupFoldersByDepth(requiredFolders)) {
    const parent = parentPath(path);
    const parentToken = folderTokens.get(parent);
    if (!parentToken) {
      folderResults.push({ path, ok: false, reason: `parent missing: ${parent}` });
      continue;
    }
    const result = runCommand(searchArgs(leafName(path), parentToken));
    if (result.status !== 0) fail('lark-drive folder validation search failed', { path, stderr: result.stderr, stdout: result.stdout, folderResults });
    const item = findByName(collectItems(parseJson(result.stdout)), leafName(path), isFolder);
    if (item) {
      const token = itemToken(item);
      folderTokens.set(path, token);
      folderResults.push({ path, ok: true, token });
    } else {
      folderResults.push({ path, ok: false, reason: 'missing' });
    }
  }

  const rootListing = runCommand(listArgs(rootToken));
  let rootItems = [];
  if (rootListing.status === 0) rootItems = collectItems(parseJson(rootListing.stdout));

  const docResults = [];
  for (const title of requiredDocs) {
    const local = findByName(rootItems, title, isDoc);
    if (local) { docResults.push({ title, ok: true, token: itemToken(local) }); continue; }
    const result = runCommand(searchArgs(title, rootToken));
    if (result.status !== 0) fail('lark-drive doc validation search failed', { title, stderr: result.stderr, stdout: result.stdout, docResults });
    const item = findByName(collectItems(parseJson(result.stdout)), title, isDoc);
    docResults.push(item ? { title, ok: true, token: itemToken(item) } : { title, ok: false, reason: 'missing' });
  }

  const baseResults = [];
  for (const title of requiredBases) {
    const local = findByName(rootItems, title, isBase);
    if (local) { baseResults.push({ title, ok: true, token: itemToken(local) }); continue; }
    const result = runCommand(searchArgs(title, rootToken));
    if (result.status !== 0) fail('lark-drive base validation search failed', { title, stderr: result.stderr, stdout: result.stdout, baseResults });
    const item = findByName(collectItems(parseJson(result.stdout)), title, isBase);
    baseResults.push(item ? { title, ok: true, token: itemToken(item) } : { title, ok: false, reason: 'missing' });
  }

  const missing = [
    ...folderResults.filter((item) => !item.ok).map((item) => ({ type: 'folder', ...item })),
    ...docResults.filter((item) => !item.ok).map((item) => ({ type: 'doc', ...item })),
    ...baseResults.filter((item) => !item.ok).map((item) => ({ type: 'base', ...item }))
  ];

  output({
    ok: missing.length === 0,
    dryRun: false,
    action: ACTION,
    rootToken,
    results: { folders: folderResults, docs: docResults, bases: baseResults },
    missing,
    summary: { foldersOk: folderResults.filter((item) => item.ok).length, docsOk: docResults.filter((item) => item.ok).length, basesOk: baseResults.filter((item) => item.ok).length, missing: missing.length }
  });
  if (missing.length) process.exitCode = 1;
}

main().catch((error) => fail(error.message));
