#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';

const ACTION = 'summarize-ceo-dashboard';

function usage() {
  return `Usage:
  $BOX_AGENT_NODE skills/opc-ceo-rhythm-workflow/scripts/summarize-ceo-dashboard.mjs --payload <payload.json>

Summarize already-fetched CEO rhythm records into a local dashboard JSON. This script performs local analysis only.
`;
}
function parseArgs(argv) { const args = { payloadPath: null, help: false }; for (let i = 0; i < argv.length; i += 1) { const arg = argv[i]; if (arg === '--help' || arg === '-h') args.help = true; else if (arg === '--payload') { args.payloadPath = argv[i + 1]; i += 1; } else throw new Error(`Unknown argument: ${arg}`); } return args; }
function output(result, exitCode = 0) { process.stdout.write(`${JSON.stringify(result, null, 2)}\n`); process.exit(exitCode); }
function fail(message, details = {}, exitCode = 1) { output({ ok: false, action: ACTION, error: { message, ...details } }, exitCode); }
function readJson(path) { if (!path) throw new Error('Missing --payload <payload.json>'); if (!existsSync(path)) throw new Error(`Payload file does not exist: ${path}`); try { return JSON.parse(readFileSync(path, 'utf8')); } catch (error) { throw new Error(`Invalid JSON payload: ${error.message}`); } }
function asArray(value) { return Array.isArray(value) ? value : value ? [value] : []; }
function fieldOf(item, names) { const source = item?.fields && typeof item.fields === 'object' ? item.fields : item || {}; for (const name of names) { if (source[name] !== undefined && source[name] !== null && String(source[name]).trim() !== '') return source[name]; } return null; }
function normalizeStatus(value) { const text = String(value || '').trim().toLowerCase(); if (/done|完成|已完成|closed|resolved/.test(text)) return 'done'; if (/risk|blocked|阻塞|风险|延期/.test(text)) return 'risk'; if (/pause|暂停|不做/.test(text)) return 'paused'; if (/doing|progress|进行|推进/.test(text)) return 'doing'; return text ? 'open' : 'unknown'; }
function validatePayload(payload) { const errors = []; if (!payload || typeof payload !== 'object' || Array.isArray(payload)) errors.push('payload must be an object'); for (const key of ['mainCampaign', 'weeklyRhythm', 'openDecisions']) if (payload[key] !== undefined && !Array.isArray(payload[key]) && typeof payload[key] !== 'object') errors.push(`${key} must be an object or array`); return errors; }
function summarize(payload) {
  const main = asArray(payload.mainCampaign);
  const rhythm = asArray(payload.weeklyRhythm);
  const decisions = asArray(payload.openDecisions);
  const statusCounts = rhythm.reduce((acc, item) => { const status = normalizeStatus(fieldOf(item, ['状态', 'Status', 'status', '进展状态'])); acc[status] = (acc[status] || 0) + 1; return acc; }, {});
  const riskItems = rhythm.filter((item) => normalizeStatus(fieldOf(item, ['状态', 'Status', 'status', '进展状态'])) === 'risk').map((item) => ({ title: fieldOf(item, ['事项', '任务', '标题', 'Name', 'name']) || '未命名事项', owner: fieldOf(item, ['负责人', 'Owner', 'owner']) || null, blocker: fieldOf(item, ['阻塞', '风险', 'Blocker', 'blocker']) || null }));
  const openDecisionItems = decisions.map((item) => ({ title: fieldOf(item, ['决策', '标题', 'Name', 'name']) || '未命名决策', owner: fieldOf(item, ['负责人', 'Owner', 'owner']) || null, deadline: fieldOf(item, ['截止时间', 'Deadline', 'deadline']) || null, blocker: fieldOf(item, ['阻塞', '风险', 'Blocker', 'blocker']) || null }));
  return {
    weekLabel: payload.weekLabel || null,
    mainCampaign: main.map((item) => ({ title: fieldOf(item, ['本周主战役', '主战役', 'Name', 'name', '标题']) || null, leverageAction: fieldOf(item, ['杠杆动作', 'Leverage Action', 'leverageAction']) || null, breakthrough48h: fieldOf(item, ['48小时突破点', '48h突破点', 'breakthrough48h']) || null, status: fieldOf(item, ['状态', 'Status', 'status']) || null })),
    rhythmSummary: { total: rhythm.length, statusCounts, riskItems },
    decisionsSummary: { totalOpen: decisions.length, items: openDecisionItems },
    next48hFocus: payload.next48hFocus || fieldOf(main[0] || {}, ['48小时突破点', '48h突破点', 'breakthrough48h']) || null,
    generatedAt: new Date().toISOString()
  };
}
function main() { let args; try { args = parseArgs(process.argv.slice(2)); } catch (error) { fail(error.message, { usage: usage() }, 2); } if (args.help) { process.stdout.write(usage()); process.exit(0); } let payload; try { payload = readJson(args.payloadPath); } catch (error) { fail(error.message, {}, 2); } const validationErrors = validatePayload(payload); if (validationErrors.length > 0) fail('Payload validation failed', { validationErrors }, 2); output({ ok: true, action: ACTION, dashboard: summarize(payload), warnings: [], errors: [] }); }
main();
