import {
  getProtocolTypes as getSharedProtocolTypes,
  generateLetterOfClaim,
  getResponseDeadline,
  getComplianceChecklist,
  generateADROffer,
  serializeProtocols,
  parseProtocols,
} from '../../shared/protocols/index.mjs';

const requestTypes = {
  'pre-action-protocol': {
    label: 'Pre-Action Protocol',
    sourceId: 'cpr-practice-direction-pre-action',
    responseWindow: 'varies by protocol (30 to 120 days)'
  }
};

const safetyNotes = [
  'This is an informational drafting aid, not legal advice.',
  'Pre-action protocol letters are formal legal documents. Check deadlines and compliance carefully.',
  'Remove unnecessary personal details such as full home address before sending.',
  'Keep copies of everything you send and receive.',
  'Consider seeking legal advice for complex claims.'
];

const escalationItems = [
  'If the defendant does not respond within the protocol deadline, you may issue court proceedings.',
  'Check whether an ADR process is mandatory or recommended for your protocol type.',
  'Keep all correspondence, evidence, and compliance records together for potential court use.'
];

function clean(value, fallback) {
  const text = typeof value === 'string' ? value.trim() : '';
  return text || fallback;
}

const draftFields = [
  'protocolType',
  'claimantName',
  'defendantName',
  'defendantAddress',
  'summaryOfFacts',
  'lossAndDamage',
  'evidence',
  'adrProposal',
  'statementOfTruth',
  'name',
  'contact',
  'email'
];

export function getProtocolRequestTypes() {
  return requestTypes;
}

export function generateProtocolLetter(data = {}) {
  const protocolType = clean(data.protocolType, 'debt');
  const claimantName = clean(data.claimantName, 'Your name');
  const defendantName = clean(data.defendantName, 'Defendant name');
  const defendantAddress = clean(data.defendantAddress, 'Defendant address');
  const summaryOfFacts = clean(data.summaryOfFacts, 'Summary of the facts of the claim');
  const lossAndDamage = clean(data.lossAndDamage, 'Description of loss and damage');
  const evidence = clean(data.evidence, 'List of evidence supporting the claim');
  const adrProposal = clean(data.adrProposal, 'Proposal for alternative dispute resolution');
  const statementOfTruth = clean(data.statementOfTruth, 'I believe the facts stated in this letter are true.');
  const name = clean(data.name, 'Your name');
  const contact = clean(data.contact, 'Your contact details');

  const protocolTypes = getSharedProtocolTypes();
  const protocol = protocolTypes.find((p) => p.id === protocolType);
  const protocolName = protocol ? protocol.name : protocolType;

  const evidenceLines = evidence
    .split('\n')
    .map((e) => e.trim())
    .filter(Boolean)
    .map((e) => `  - ${e}`)
    .join('\n');

  return [
    `Letter of Claim under ${protocolName}`,
    '',
    `Claimant: ${claimantName}`,
    `Defendant: ${defendantName}`,
    `Defendant Address: ${defendantAddress}`,
    '',
    'Summary of Facts:',
    summaryOfFacts,
    '',
    'Loss and Damage:',
    lossAndDamage,
    '',
    'Evidence:',
    evidenceLines || '  - (list evidence here)',
    '',
    'ADR Proposal:',
    adrProposal,
    '',
    'Statement of Truth:',
    statementOfTruth,
    '',
    'Yours faithfully,',
    name,
    '',
    `Contact: ${contact}`
  ].join('\n');
}

export { getSharedProtocolTypes as getProtocolTypes };

export function getProtocolEvidenceRequirements(protocolType) {
  const checkList = getComplianceChecklist(protocolType);
  if (!checkList) {
    return [
      'Summary of facts supporting the claim.',
      'Evidence list with documents, photographs, or records.',
      'ADR proposal enclosed.',
      'Statement of truth signed.',
      'Compliance with the relevant pre-action protocol.'
    ];
  }
  return checkList;
}

export function getProtocolDeadlines(protocolType) {
  const responseDays = getResponseDeadline(protocolType);
  if (!responseDays) {
    return { responseDays: null, targetDateDisplay: 'Select a protocol type to see deadlines' };
  }
  return {
    responseDays,
    targetDateDisplay: `${responseDays} days for the defendant to respond`
  };
}

export function createProtocolHandoffPack(data = {}) {
  const letter = generateProtocolLetter(data);
  const protocolType = clean(data.protocolType, 'debt');
  const deadlines = getProtocolDeadlines(protocolType);
  const evidence = getProtocolEvidenceRequirements(protocolType);
  const protocolTypes = getSharedProtocolTypes();
  const protocol = protocolTypes.find((p) => p.id === protocolType);
  const protocolName = protocol ? protocol.name : protocolType;

  return {
    title: 'Pre-Action Protocol handoff pack',
    contextLabel: protocolName,
    targetDateDisplay: deadlines.targetDateDisplay,
    evidence,
    safety: safetyNotes,
    escalation: escalationItems,
    markdown: [
      '# Pre-Action Protocol handoff pack',
      '',
      'Generated locally in the browser. Nothing was sent to a server.',
      '',
      `Protocol: ${protocolName}`,
      `Target response: ${deadlines.targetDateDisplay}`,
      '',
      '## Letter',
      '```text',
      letter,
      '```',
      '',
      '## Compliance checklist',
      ...evidence.map((item) => `- [ ] ${item}`),
      '',
      '## Safety checks',
      ...safetyNotes.map((item) => `- [ ] ${item}`),
      '',
      '## Escalation notes',
      ...escalationItems.map((item) => `- [ ] ${item}`)
    ].join('\n')
  };
}

export function serializeProtocolDraft(draft = {}) {
  const serialized = {};
  for (const field of draftFields) {
    if (typeof draft[field] === 'string' && draft[field].trim()) {
      serialized[field] = draft[field].trim();
    }
  }
  return JSON.stringify(serialized);
}

export function parseProtocolDraft(value) {
  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const draft = {};
    for (const field of draftFields) {
      if (typeof parsed[field] === 'string' && parsed[field].trim()) {
        draft[field] = parsed[field].trim();
      }
    }
    return draft;
  } catch {
    return {};
  }
}

export {
  generateLetterOfClaim,
  getResponseDeadline,
  getComplianceChecklist,
  generateADROffer,
  serializeProtocols,
  parseProtocols
};
