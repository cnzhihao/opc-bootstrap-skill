#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const ACTION = 'archive-review-doc';
const DEFAULT_LARK_CLI = '/Applications/办公小浣熊.app/Contents/Resources/cli-bundle/node_modules/.bin/lark-cli';

function usage() {
  return `Usage:
  $BOX_AGENT_NODE skills/opc-feishu-update-review/scripts/archive-review-doc.mjs --payload <payload.json> [--execute]

Purpose:
  Create or prepare a Feishu/Lark Docx archive for OPC weekly/monthly review content.

Default:
  Dry-run only. The script validates payload and prints the planned lark-cli command.

Required payload fields:
  title: string
  contentMarkdown: string

Optional payload fields:
  parentToken: string
  parentFolderToken: string (legacy alias for parentToken)
  archiveType: weekly-review | monthly-review | custom
  period: string
  dryRunNotes: string[]
`;
}

function parseArgs(argv) {
  const args = { execute: false, payloadPath: null, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') args.help = true;
    else if (arg === '--execute') args.execute = true;
    else if (arg === '--payload') {
      args.payloadPath = argv[i + 1];
      i += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return args;
}

function output(result, exitCode = 0) {
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  process.exit(exitCode);
}

function fail(message, details = {}, exitCode = 1) {
  output({
    ok: false,
    dryRun: true,
    action: ACTION,
    error: { message, ...details },
  }, exitCode);
}

function readJson(path) {
  if (!path) throw new Error('Missing --payload <payload.json>');
  if (!existsSync(path)) throw new Error(`Payload file does not exist: ${path}`);
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    throw new Error(`Invalid JSON payload: ${error.message}`);
  }
}

function validatePayload(payload) {
  const errors = [];
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) errors.push('payload must be an object');
  if (typeof payload.title !== 'string' || payload.title.trim() === '') errors.push('title is required');
  if (typeof payload.contentMarkdown !== 'string' || payload.contentMarkdown.trim() === '') errors.push('contentMarkdown is required');
  if (payload.parentToken !== undefined && typeof payload.parentToken !== 'string') errors.push('parentToken must be a string');
  if (payload.parentFolderToken !== undefined && typeof payload.parentFolderToken !== 'string') errors.push('parentFolderToken must be a string');
  if (payload.archiveType !== undefined && typeof payload.archiveType !== 'string') errors.push('archiveType must be a string');
  if (payload.period !== undefined && typeof payload.period !== 'string') errors.push('period must be a string');
  if (payload.dryRunNotes !== undefined && !Array.isArray(payload.dryRunNotes)) errors.push('dryRunNotes must be an array');
  return errors;
}

function findLarkCli() {
  const envPath = process.env.LARK_CLI_PATH;
  if (envPath && existsSync(envPath)) return envPath;
  if (existsSync(DEFAULT_LARK_CLI)) return DEFAULT_LARK_CLI;
  return 'lark-cli';
}

function buildDocxXml(payload) {
  const title = escapeXml(payload.title.trim());
  const lines = payload.contentMarkdown.split(/\r?\n/);
  const body = lines.map(markdownLineToXml).join('\n');
  return `<title>${title}</title>\n${body}\n`;
}

function markdownLineToXml(line) {
  const raw = line.trimEnd();
  if (raw === '') return '  <p></p>';
  if (raw.startsWith('### ')) return `  <h3>${escapeXml(raw.slice(4))}</h3>`;
  if (raw.startsWith('## ')) return `  <h2>${escapeXml(raw.slice(3))}</h2>`;
  if (raw.startsWith('# ')) return `  <h1>${escapeXml(raw.slice(2))}</h1>`;
  if (raw.startsWith('- ')) return `  <ul><li>${escapeXml(raw.slice(2))}</li></ul>`;
  if (/^\d+\.\s+/.test(raw)) return `  <ol><li>${escapeXml(raw.replace(/^\d+\.\s+/, ''))}</li></ol>`;
  return `  <p>${escapeXml(raw)}</p>`;
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function resolveParentToken(payload) {
  return (payload.parentToken || payload.parentFolderToken || '').trim();
}

function buildCommand(larkCli, payload, contentXml) {
  const args = ['docs', '+create', '--api-version', 'v2', '--as', 'user', '--content', contentXml];
  const parentToken = resolveParentToken(payload);
  if (parentToken) {
    args.push('--parent-token', parentToken);
  }
  return { command: larkCli, args };
}

function redactCommandForDisplay(command, args) {
  const redacted = [];
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--content') {
      redacted.push('--content', '<docx-xml-content>');
      i += 1;
    } else {
      redacted.push(args[i]);
    }
  }
  return [command, ...redacted];
}

function runCommand(command, args) {
  return spawnSync(command, args, { encoding: 'utf8' });
}

function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (error) {
    fail(error.message, { usage: usage() }, 2);
  }
  if (args.help) {
    process.stdout.write(usage());
    process.exit(0);
  }

  let payload;
  try {
    payload = readJson(args.payloadPath);
  } catch (error) {
    fail(error.message, {}, 2);
  }

  const validationErrors = validatePayload(payload);
  if (validationErrors.length > 0) {
    fail('Payload validation failed', { validationErrors }, 2);
  }

  const larkCli = findLarkCli();
  const contentXml = buildDocxXml(payload);
  const planned = buildCommand(larkCli, payload, contentXml);

  if (!args.execute) {
    output({
      ok: true,
      dryRun: true,
      action: ACTION,
      archiveType: payload.archiveType || 'custom',
      period: payload.period || null,
      title: payload.title.trim(),
      plannedCommand: redactCommandForDisplay(planned.command, planned.args),
      created: [],
      updated: [],
      urls: [],
      warnings: [
        'Dry-run only. Re-run with --execute after user confirmation to create the Feishu document.',
        ...(payload.dryRunNotes || []),
      ],
      errors: [],
    });
  }

  const result = runCommand(planned.command, planned.args);
  const success = result.status === 0;
  let parsedStdout = null;
  try {
    parsedStdout = result.stdout ? JSON.parse(result.stdout) : null;
  } catch {
    parsedStdout = null;
  }

  output({
    ok: success,
    dryRun: false,
    action: ACTION,
    archiveType: payload.archiveType || 'custom',
    period: payload.period || null,
    title: payload.title.trim(),
    command: redactCommandForDisplay(planned.command, planned.args),
    created: success ? [{ type: 'docx', result: parsedStdout || result.stdout.trim() }] : [],
    updated: [],
    urls: extractUrls(`${result.stdout}\n${result.stderr}`),
    warnings: [],
    errors: success ? [] : [{ status: result.status, stderr: result.stderr.trim(), stdout: result.stdout.trim() }],
  }, success ? 0 : 1);
}

function extractUrls(text) {
  return [...String(text).matchAll(/https?:\/\/[^\s"'<>]+/g)].map((match) => match[0]);
}

main();
