#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const ACTION = 'create-template-docs';

const DEFAULT_DOCS = [
  {
    title: '内容工厂｜选题评估模板',
    folderTokenKey: '01_选题池/待评估',
    content: '# 选题评估模板\n\n## 选题一句话\n\n## 用户痛点\n\n## 创始人真实经验\n\n## 预期平台与形式\n\n## 证据与素材\n\n## 结论\n- [ ] 立项\n- [ ] 暂缓\n'
  },
  {
    title: '内容工厂｜深度访谈模板',
    folderTokenKey: '02_素材库/创始人访谈',
    content: '# 深度访谈模板\n\n## 访谈目标\n\n## 背景问题\n\n## 关键经历\n\n## 判断与方法\n\n## 案例细节\n\n## 金句摘录\n\n## 可转化选题\n'
  },
  {
    title: '内容工厂｜长文章写作模板',
    folderTokenKey: '03_稿件生产中/文章草稿',
    content: '# 长文章写作模板\n\n## 标题候选\n\n## 开场冲突\n\n## 核心观点\n\n## 论证结构\n\n## 案例与细节\n\n## 行动建议\n\n## 结尾\n'
  },
  {
    title: '内容工厂｜长视频口播稿模板',
    folderTokenKey: '03_稿件生产中/口播脚本',
    content: '# 长视频口播稿模板\n\n## 3 秒钩子\n\n## 问题放大\n\n## 核心判断\n\n## 3 个论点\n\n## 案例\n\n## 收束与行动号召\n'
  },
  {
    title: '内容工厂｜发布复盘模板',
    folderTokenKey: '05_数据复盘/周复盘',
    content: '# 发布复盘模板\n\n## 本期发布内容\n\n## 数据表现\n\n## 有效动作\n\n## 失效假设\n\n## 下周迭代\n'
  }
];

function usage() {
  return [
    'Usage:',
    '  node scripts/create-template-docs.mjs --payload examples/create-template-docs.payload.example.json',
    '  node scripts/create-template-docs.mjs --payload payload.json --execute',
    '',
    'Payload fields:',
    '  rootToken / workspaceToken: 内容工厂根目录 token（folderTokenMap 缺省时作为落点）',
    '  folderTokenMap: 可选，目录路径到 folder token 的映射',
    '  docs: 可选，文档数组 { title, folderTokenKey?, folderToken?, content? }',
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
  if ((rootToken !== undefined && typeof rootToken !== 'string') || (rootToken === undefined && !payload.folderTokenMap)) errors.push('rootToken/workspaceToken or folderTokenMap is required');
  if (payload.folderTokenMap !== undefined && (typeof payload.folderTokenMap !== 'object' || Array.isArray(payload.folderTokenMap))) errors.push('folderTokenMap must be an object');
  if (payload.docs !== undefined && !Array.isArray(payload.docs)) errors.push('docs must be an array when provided');
  if (payload.dryRunNotes !== undefined && !Array.isArray(payload.dryRunNotes)) errors.push('dryRunNotes must be an array');
  return errors;
}

function normalizeDocs(payload) {
  return (payload.docs || DEFAULT_DOCS).map((doc) => {
    if (!doc || typeof doc !== 'object') throw new Error('Each doc must be an object');
    if (typeof doc.title !== 'string' || doc.title.trim() === '') throw new Error('Each doc requires a non-empty title');
    return {
      title: doc.title.trim(),
      folderTokenKey: doc.folderTokenKey || '',
      folderToken: doc.folderToken || '',
      content: doc.content || `# ${doc.title.trim()}\n\n`
    };
  });
}

function targetFolderToken(doc, payload) {
  if (doc.folderToken) return doc.folderToken;
  if (doc.folderTokenKey && payload.folderTokenMap?.[doc.folderTokenKey]) return payload.folderTokenMap[doc.folderTokenKey];
  return payload.rootToken || payload.workspaceToken || '';
}

function createDocArgs(doc, folderToken) {
  const args = ['docs', '+create', '--as', 'user', '--api-version', 'v2', '--title', doc.title, '--format', 'markdown', '--content', doc.content];
  if (folderToken) args.push('--parent-token', folderToken);
  return args;
}

function runCommand(args) { return spawnSync('lark-cli', args, { encoding: 'utf8' }); }
function parseJson(stdout) { try { return JSON.parse(stdout || '{}'); } catch { return null; } }
function tokenFromResult(parsed) { return parsed?.token || parsed?.document_id || parsed?.docx_token || parsed?.data?.token || parsed?.data?.document_id || parsed?.data?.docx_token || ''; }

async function main() {
  let args;
  try { args = parseArgs(process.argv.slice(2)); } catch (error) { fail(error.message, { usage: usage() }, 2); }
  if (args.help) { process.stdout.write(`${usage()}\n`); return; }
  let payload;
  try { payload = loadPayload(args.payloadPath); } catch (error) { fail(error.message, { usage: usage() }, 2); }
  const errors = validatePayload(payload);
  if (errors.length) fail('Invalid payload', { errors, usage: usage() }, 2);

  let docs;
  try { docs = normalizeDocs(payload); } catch (error) { fail(error.message, { usage: usage() }, 2); }
  const planned = docs.map((doc) => ({ title: doc.title, folderTokenKey: doc.folderTokenKey, folderToken: targetFolderToken(doc, payload), contentLength: doc.content.length }));

  if (!args.execute) {
    output({
      ok: true,
      dryRun: true,
      action: ACTION,
      summary: { docsPlanned: planned.length },
      planned,
      commands: docs.map((doc) => ({ command: 'lark-cli', args: createDocArgs(doc, targetFolderToken(doc, payload)), purpose: `创建模板文档：${doc.title}` })),
      warnings: ['Dry-run only. Re-run with --execute after user confirmation.', ...(payload.dryRunNotes || [])]
    });
    return;
  }

  const created = [];
  for (const doc of docs) {
    const folderToken = targetFolderToken(doc, payload);
    const result = runCommand(createDocArgs(doc, folderToken));
    if (result.status !== 0) fail('lark-doc create failed', { title: doc.title, stderr: result.stderr, stdout: result.stdout, created });
    created.push({ title: doc.title, folderToken, token: tokenFromResult(parseJson(result.stdout)), raw: parseJson(result.stdout) });
  }
  output({ ok: true, dryRun: false, action: ACTION, created, summary: { created: created.length } });
}

main().catch((error) => fail(error.message));
