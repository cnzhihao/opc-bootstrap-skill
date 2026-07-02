#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const ACTION = 'create-core-dashboard';

const DEFAULT_BASE = {
  name: '内容工厂核心看板',
  tables: [
    {
      name: '选题池',
      fields: [
        { name: '选题标题', type: 'text' },
        { name: '生命周期阶段', type: 'single_select', options: ['待评估', '已立项', '生产中', '待发布', '已发布', '复盘完成'] },
        { name: '内容形态', type: 'multi_select', options: ['公众号长文', '长视频', '短视频', '小红书', '知乎', '朋友圈'] },
        { name: '负责人', type: 'user' },
        { name: '优先级', type: 'single_select', options: ['P0', 'P1', 'P2'] },
        { name: '截止日期', type: 'date' },
        { name: '素材链接', type: 'url' }
      ],
      views: ['全部选题', '本周生产', '待复盘']
    },
    {
      name: '发布日历',
      fields: [
        { name: '内容标题', type: 'text' },
        { name: '平台', type: 'single_select', options: ['公众号', '视频号', '知乎', '小红书', '其他'] },
        { name: '计划发布时间', type: 'date' },
        { name: '发布状态', type: 'single_select', options: ['待排期', '待发布', '已发布', '已复盘'] },
        { name: '发布链接', type: 'url' },
        { name: '核心数据', type: 'text' }
      ],
      views: ['发布日历', '按平台']
    },
    {
      name: '内容复盘',
      fields: [
        { name: '复盘标题', type: 'text' },
        { name: '复盘周期', type: 'text' },
        { name: '表现结论', type: 'single_select', options: ['超预期', '符合预期', '低于预期'] },
        { name: '有效假设', type: 'text' },
        { name: '下次动作', type: 'text' }
      ],
      views: ['全部复盘']
    }
  ]
};

function usage() {
  return [
    'Usage:',
    '  node scripts/create-core-dashboard.mjs --payload examples/create-core-dashboard.payload.example.json',
    '  node scripts/create-core-dashboard.mjs --payload payload.json --execute',
    '',
    'Payload fields:',
    '  folderToken / rootToken / workspaceToken: Base 创建目录 token',
    '  base: 可选，{ name, tables: [{ name, fields, views }] }',
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
  const folderToken = payload.folderToken || payload.rootToken || payload.workspaceToken;
  if (typeof folderToken !== 'string' || folderToken.trim() === '') errors.push('folderToken/rootToken/workspaceToken is required');
  if (payload.base !== undefined && (typeof payload.base !== 'object' || Array.isArray(payload.base))) errors.push('base must be an object when provided');
  if (payload.dryRunNotes !== undefined && !Array.isArray(payload.dryRunNotes)) errors.push('dryRunNotes must be an array');
  return errors;
}

function normalizeBase(payload) {
  const base = payload.base || DEFAULT_BASE;
  if (typeof base.name !== 'string' || base.name.trim() === '') throw new Error('base.name is required');
  if (!Array.isArray(base.tables) || base.tables.length === 0) throw new Error('base.tables must be a non-empty array');
  return {
    name: base.name.trim(),
    tables: base.tables.map((table) => {
      if (!table || typeof table !== 'object') throw new Error('Every table must be an object');
      if (typeof table.name !== 'string' || table.name.trim() === '') throw new Error('Every table requires a non-empty name');
      if (!Array.isArray(table.fields) || table.fields.length === 0) throw new Error(`Table ${table.name} requires fields`);
      return {
        name: table.name.trim(),
        fields: table.fields.map((field) => ({ ...field, name: String(field.name || '').trim(), type: field.type || 'text' })),
        views: Array.isArray(table.views) ? table.views : []
      };
    })
  };
}

function folderToken(payload) { return (payload.folderToken || payload.rootToken || payload.workspaceToken).trim(); }
function baseCreateArgs(base, token) { return ['base', '+base-create', '--as', 'user', '--name', base.name, '--parent-token', token]; }
function tableCreateArgs(appToken, table) { return ['base', '+table-create', '--as', 'user', '--app-token', appToken, '--name', table.name]; }
function fieldCreateArgs(appToken, tableId, field) {
  const args = ['base', '+field-create', '--as', 'user', '--app-token', appToken, '--table-id', tableId, '--name', field.name, '--type', field.type];
  if (field.options) args.push('--options', JSON.stringify(field.options));
  return args;
}
function viewCreateArgs(appToken, tableId, viewName) { return ['base', '+view-create', '--as', 'user', '--app-token', appToken, '--table-id', tableId, '--name', viewName]; }

function runCommand(args) { return spawnSync('lark-cli', args, { encoding: 'utf8' }); }
function parseJson(stdout) { try { return JSON.parse(stdout || '{}'); } catch { return null; } }
function findToken(obj, keys) {
  if (!obj || typeof obj !== 'object') return '';
  for (const key of keys) if (typeof obj[key] === 'string' && obj[key]) return obj[key];
  for (const value of Object.values(obj)) {
    const found = findToken(value, keys);
    if (found) return found;
  }
  return '';
}
function appTokenFromResult(parsed) { return findToken(parsed, ['app_token', 'appToken', 'base_token', 'token']); }
function tableIdFromResult(parsed) { return findToken(parsed, ['table_id', 'tableId', 'id']); }
function fieldIdFromResult(parsed) { return findToken(parsed, ['field_id', 'fieldId', 'id']); }
function viewIdFromResult(parsed) { return findToken(parsed, ['view_id', 'viewId', 'id']); }

function plannedCommands(base, token) {
  const commands = [{ command: 'lark-cli', args: baseCreateArgs(base, token), purpose: `创建多维表格：${base.name}` }];
  for (const table of base.tables) {
    commands.push({ command: 'lark-cli', args: tableCreateArgs('<app_token>', table), purpose: `创建表：${table.name}` });
    for (const field of table.fields) commands.push({ command: 'lark-cli', args: fieldCreateArgs('<app_token>', `<table_id:${table.name}>`, field), purpose: `创建字段：${table.name}.${field.name}` });
    for (const viewName of table.views) commands.push({ command: 'lark-cli', args: viewCreateArgs('<app_token>', `<table_id:${table.name}>`, viewName), purpose: `创建视图：${table.name}.${viewName}` });
  }
  return commands;
}

async function main() {
  let args;
  try { args = parseArgs(process.argv.slice(2)); } catch (error) { fail(error.message, { usage: usage() }, 2); }
  if (args.help) { process.stdout.write(`${usage()}\n`); return; }
  let payload;
  try { payload = loadPayload(args.payloadPath); } catch (error) { fail(error.message, { usage: usage() }, 2); }
  const errors = validatePayload(payload);
  if (errors.length) fail('Invalid payload', { errors, usage: usage() }, 2);
  let base;
  try { base = normalizeBase(payload); } catch (error) { fail(error.message, { usage: usage() }, 2); }
  const token = folderToken(payload);
  const summary = { tables: base.tables.length, fields: base.tables.reduce((sum, table) => sum + table.fields.length, 0), views: base.tables.reduce((sum, table) => sum + table.views.length, 0) };

  if (!args.execute) {
    output({
      ok: true,
      dryRun: true,
      action: ACTION,
      base: { name: base.name, folderToken: token },
      summary,
      planned: base.tables.map((table) => ({ name: table.name, fields: table.fields, views: table.views })),
      commands: plannedCommands(base, token),
      warnings: ['Dry-run only. Re-run with --execute after user confirmation.', ...(payload.dryRunNotes || [])]
    });
    return;
  }

  const created = { base: null, tables: [], fields: [], views: [] };
  const baseResult = runCommand(baseCreateArgs(base, token));
  if (baseResult.status !== 0) fail('lark-base base-create failed', { stderr: baseResult.stderr, stdout: baseResult.stdout, created });
  const baseParsed = parseJson(baseResult.stdout);
  const appToken = appTokenFromResult(baseParsed);
  created.base = { name: base.name, folderToken: token, appToken, raw: baseParsed };
  if (!appToken) fail('Cannot extract app token from base-create result', { stdout: baseResult.stdout, created });

  for (const table of base.tables) {
    const tableResult = runCommand(tableCreateArgs(appToken, table));
    if (tableResult.status !== 0) fail('lark-base table-create failed', { table: table.name, stderr: tableResult.stderr, stdout: tableResult.stdout, created });
    const tableParsed = parseJson(tableResult.stdout);
    const tableId = tableIdFromResult(tableParsed);
    created.tables.push({ name: table.name, tableId, raw: tableParsed });
    if (!tableId) fail('Cannot extract table id from table-create result', { table: table.name, stdout: tableResult.stdout, created });

    for (const field of table.fields) {
      const fieldResult = runCommand(fieldCreateArgs(appToken, tableId, field));
      if (fieldResult.status !== 0) fail('lark-base field-create failed', { table: table.name, field: field.name, stderr: fieldResult.stderr, stdout: fieldResult.stdout, created });
      created.fields.push({ table: table.name, name: field.name, fieldId: fieldIdFromResult(parseJson(fieldResult.stdout)) });
    }
    for (const viewName of table.views) {
      const viewResult = runCommand(viewCreateArgs(appToken, tableId, viewName));
      if (viewResult.status !== 0) fail('lark-base view-create failed', { table: table.name, view: viewName, stderr: viewResult.stderr, stdout: viewResult.stdout, created });
      created.views.push({ table: table.name, name: viewName, viewId: viewIdFromResult(parseJson(viewResult.stdout)) });
    }
  }

  output({ ok: true, dryRun: false, action: ACTION, created, summary: { ...summary, appToken } });
}

main().catch((error) => fail(error.message));
