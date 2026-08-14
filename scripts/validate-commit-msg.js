#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const ALLOWED_TYPES = ['feat', 'fix', 'refactor', 'perf', 'docs', 'test'];

const ALLOWED_TYPES_DESC = {
  feat: 'new functionality',
  fix: 'bug fixes',
  refactor: 'code restructuring without changing behavior',
  perf: 'performance improvements',
  docs: 'documentation changes',
  test: 'tests',
};

const EXAMPLES = [
  'IV-2(refactor): remove user roles and administrative navigation',
  'IV-15(feat): add create idea form',
];

export function validateCommitMessage(message) {
  // Strip git comments and get the first non-empty line
  const lines = message
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'));

  if (lines.length === 0) {
    return {
      valid: false,
      reason: 'Commit message is empty.',
      header: '',
    };
  }

  const header = lines[0];

  // Allow standard git merge / revert commits
  if (/^Merge (branch|tag|pull request|remote-tracking branch)/i.test(header)) {
    return { valid: true, header };
  }
  if (/^Revert\s+/i.test(header)) {
    return { valid: true, header };
  }

  // Format: <ticket-id>(<type>): <description>
  const strictPattern = /^([A-Za-z0-9_-]+)\((feat|fix|refactor|perf|docs|test)\):\s+(.+)$/;
  const match = header.match(strictPattern);

  if (match) {
    const [, ticketId, type, description] = match;
    if (description.trim().length === 0) {
      return {
        valid: false,
        reason: 'Missing description after colon.',
        header,
      };
    }
    return { valid: true, ticketId, type, description, header };
  }

  // Diagnose specific validation failure reason
  const reasons = [];

  // Check for missing ticket ID like: feat: ... or (feat): ... or feat(scope): ...
  const missingTicketMatch = header.match(/^(\(?([a-zA-Z]+)\)?)(?:\(([^)]+)\))?:\s*(.*)$/);
  const generalStructureMatch = header.match(/^([^(\s:]+)?(?:\(([^)]*)\))?:\s*(.*)$/);

  // Check if type is in parens
  const typeInParensMatch = header.match(/^([^(\s:]+)\(([^)]*)\):\s*(.*)$/);

  if (typeInParensMatch) {
    const [, extractedTicket, extractedType, extractedDesc] = typeInParensMatch;
    if (!ALLOWED_TYPES.includes(extractedType)) {
      reasons.push(`Unsupported commit type "${extractedType}". Allowed types are: ${ALLOWED_TYPES.join(', ')}.`);
    }
    if (!extractedDesc || extractedDesc.trim().length === 0) {
      reasons.push('Missing description. A non-empty description is required.');
    }
  } else {
    // Check if missing ticket ID or parens
    if (/^[a-zA-Z]+:\s*.+/.test(header) || /^\([a-zA-Z]+\):\s*.+/.test(header)) {
      reasons.push('Missing <ticket-id>. Commits must start with a ticket ID (e.g. IV-15).');
    } else if (!header.includes('(') || !header.includes(')')) {
      reasons.push('Missing type in parentheses. Format must be <ticket-id>(<type>): <description>.');
    } else if (!header.includes(':')) {
      reasons.push('Missing colon separator ": " after (<type>).');
    } else {
      reasons.push('Message does not match required format: <ticket-id>(<type>): <description>');
    }
  }

  return {
    valid: false,
    reason: reasons.join('\n  - '),
    header,
  };
}

function printErrorMessage(result) {
  console.error('INVALID COMMIT MESSAGE FORMAT');
  console.error('\nYour commit message:');
  console.error(`  "${result.header}"\n`);
  if (result.reason) {
    console.error('Reason:');
    console.error(`  - ${result.reason}\n`);
  }
  console.error('Expected format:');
  console.error('  <ticket-id>(<type>): <description>\n');
  console.error('Allowed types:');
  for (const [type, desc] of Object.entries(ALLOWED_TYPES_DESC)) {
    console.error(`  - ${type.padEnd(10)}: ${desc}`);
  }
  console.error('\nExamples:');
  for (const example of EXAMPLES) {
    console.error(`  ${example}`);
  }
  console.error('\n' + '='.repeat(70) + '\n');
}

// Run as CLI script when called with commit message file
function main() {
  const commitMsgFile = process.argv[2];

  if (!commitMsgFile) {
    console.error('Error: No commit message file path provided.');
    process.exit(1);
  }

  let message = '';
  try {
    message = fs.readFileSync(path.resolve(process.cwd(), commitMsgFile), 'utf8');
  } catch (err) {
    console.error(`Error reading commit message file at ${commitMsgFile}:`, err.message);
    process.exit(1);
  }

  const result = validateCommitMessage(message);

  if (!result.valid) {
    printErrorMessage(result);
    process.exit(1);
  }

  process.exit(0);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  main();
}
