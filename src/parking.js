import {
  getParkingOperators,
  getAppealDeadlines,
  generateAppealText,
  getGroundsOfAppeal,
  getTribunalRoute,
  checkNoticeValidity,
  serializeParking,
  parseParking,
} from '../../shared/parking/index.mjs';

const requestTypes = {
  'parking-appeal': {
    label: 'Parking appeal',
    sourceId: 'govuk-parking-penalty-notice',
    responseWindow: '28 days for a formal appeal'
  }
};

const organisationTypes = {
  council: {
    label: 'Local Council',
    type: 'council',
    legalContext: 'Councils issue Penalty Charge Notices under statutory powers. You have the right to make a formal representation within 28 days, and an independent adjudicator through the Traffic Penalty Tribunal if the council rejects your appeal.',
    tribunalEligible: true
  },
  private: {
    label: 'Private parking operator',
    type: 'private',
    legalContext: 'Private operators issue Parking Charge Notices under contract law. You should appeal directly to the operator first. If rejected, the Parking on Private Land Appeals (POPLA) service may be available depending on the operator.',
    tribunalEligible: false
  }
};

const evidenceRequirements = {
  council: [
    'Copy of the Penalty Charge Notice with PCN number.',
    'Photographs of signage, road markings, and the location at the time of the alleged contravention.',
    'Any dashcam, bodycam, or witness evidence.',
    'Correspondence received from the council or Traffic Enforcement Centre.',
    'Proof of vehicle ownership or registered keeper details if relevant.'
  ],
  private: [
    'Copy of the Parking Charge Notice with reference number.',
    'Photographs of signage, entry conditions, and the parking area.',
    'Any dashcam, bodycam, or witness evidence.',
    'Correspondence received from the operator or POPLA.',
    'Evidence of the contract terms if you entered into an agreement.'
  ]
};

const safetyNotes = [
  'This is an informational drafting aid, not legal advice.',
  'Do not ignore the notice or let deadlines pass without responding.',
  'Remove unnecessary personal details such as full home address before sending any appeal.',
  'Keep copies of everything you send and receive.',
  'Check whether POPLA, IAS, or another approved alternative dispute resolution body handles your operator.'
];

const escalationItems = {
  council: [
    'If the formal appeal is rejected, you can appeal to the Traffic Penalty Tribunal.',
    'You usually have 28 days from the rejection notice to lodge a tribunal appeal.',
    'Keep the rejection notice, all evidence, and the PCN reference together.'
  ],
  private: [
    'If the operator rejects your appeal, check whether POPLA or an approved ADR body is available.',
    'If no ADR body is available, you may need to defend the claim in the small claims court.',
    'Do not ignore a court claim; respond within the stated deadline.'
  ]
};

function clean(value, fallback) {
  const text = typeof value === 'string' ? value.trim() : '';
  return text || fallback;
}

function sentenceList(items) {
  if (items.length < 2) return items[0] || '';
  return `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`;
}

function parseLocalDate(value) {
  if (typeof value !== 'string') return null;
  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null;
  }
  return date;
}

function toLocalDateString(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date, days) {
  const result = new Date(date.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function addWorkingDays(value, workingDays) {
  const date = value instanceof Date ? new Date(value.getTime()) : parseLocalDate(value);
  if (!date) return null;
  const days = Math.max(0, Number.isFinite(workingDays) ? Math.floor(workingDays) : 0);
  let added = 0;
  while (added < days) {
    date.setUTCDate(date.getUTCDate() + 1);
    const day = date.getUTCDay();
    if (day !== 0 && day !== 6) added += 1;
  }
  return date;
}

function formatDateForDisplay(value) {
  const date = value instanceof Date ? value : parseLocalDate(value);
  if (!date) return 'No date set';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(date);
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

const draftFields = [
  'operatorId',
  'operatorType',
  'pcnNumber',
  'noticeDate',
  'dateOfViolation',
  'grounds',
  'additionalGrounds',
  'evidence',
  'name',
  'contact',
  'email',
  'recipient'
];

export function getParkingRequestTypes() {
  return requestTypes;
}

export function getParkingOrganisationTypes() {
  return organisationTypes;
}

export function getParkingEvidenceRequirements(operatorType) {
  return evidenceRequirements[operatorType] || evidenceRequirements.private;
}

export function getParkingDeadlines(operatorType, noticeDate) {
  const parsedDate = parseLocalDate(noticeDate);
  if (!parsedDate) {
    return { formalAppealDays: null, tribunalDays: null, targetDateDisplay: 'Set a notice date to calculate deadlines' };
  }

  if (operatorType === 'council') {
    const appealDeadline = addDays(parsedDate, 28);
    return {
      formalAppealDays: 28,
      tribunalDays: 28,
      targetDate: toLocalDateString(appealDeadline),
      targetDateDisplay: formatDateForDisplay(appealDeadline),
      tribunalEligible: true
    };
  }

  const appealDeadline = addDays(parsedDate, 28);
  return {
    formalAppealDays: 28,
    tribunalDays: null,
    targetDate: toLocalDateString(appealDeadline),
    targetDateDisplay: formatDateForDisplay(appealDeadline),
    tribunalEligible: false
  };
}

export function generateParkingLetter(data = {}) {
  const recipient = clean(data.recipient, 'Sir or Madam');
  const pcnNumber = clean(data.pcnNumber, 'your records');
  const noticeDate = clean(data.noticeDate, 'the date shown on the notice');
  const dateOfViolation = clean(data.dateOfViolation, 'the date shown on the notice');
  const grounds = clean(data.grounds, 'No signage or incorrect signage at the location');
  const additionalGrounds = clean(data.additionalGrounds, '');
  const evidence = clean(data.evidence, 'I can provide photographic and other evidence if required.');
  const name = clean(data.name, 'Your name');
  const contact = clean(data.contact, 'Your contact details');
  const operatorType = clean(data.operatorType, 'council');
  const profile = organisationTypes[operatorType] || organisationTypes.council;

  const groundsSection = additionalGrounds
    ? `${grounds}\n\nAdditional grounds: ${additionalGrounds}`
    : grounds;

  return `Dear ${recipient},

Parking appeal: Penalty Charge Notice ${pcnNumber}

I am writing to appeal the parking penalty notice referenced above. ${profile.legalContext}

Date of alleged contravention: ${dateOfViolation}
Date of notice: ${noticeDate}

Grounds of appeal:
${groundsSection}

${evidence}

Please confirm in writing:
1. Whether the penalty is cancelled following this appeal.
2. If not cancelled, the specific reasons and the next step I must take.
3. Whether an independent review or tribunal route is available.
4. The named contact or team handling this appeal.

Please respond within 28 days. I would prefer correspondence by ${contact}.

Yours faithfully,
${name}`;
}

export function createParkingHandoffPack(data = {}) {
  const letter = generateParkingLetter(data);
  const operatorType = clean(data.operatorType, 'council');
  const noticeDate = clean(data.noticeDate, '');
  const deadlines = getParkingDeadlines(operatorType, noticeDate);
  const evidence = getParkingEvidenceRequirements(operatorType);
  const escalation = escalationItems[operatorType] || escalationItems.private;
  const profile = organisationTypes[operatorType] || organisationTypes.council;

  return {
    title: 'Parking appeal handoff pack',
    contextLabel: profile.label,
    targetDateDisplay: deadlines.targetDateDisplay,
    evidence,
    safety: safetyNotes,
    escalation,
    markdown: [
      '# Parking appeal handoff pack',
      '',
      'Generated locally in the browser. Nothing was sent to a server.',
      '',
      `Operator type: ${profile.label}`,
      `Target follow-up date: ${deadlines.targetDateDisplay}`,
      '',
      '## Letter',
      '```text',
      letter,
      '```',
      '',
      '## Evidence to keep',
      ...evidence.map((item) => `- [ ] ${item}`),
      '',
      '## Safety checks',
      ...safetyNotes.map((item) => `- [ ] ${item}`),
      '',
      '## Escalation notes',
      ...escalation.map((item) => `- [ ] ${item}`)
    ].join('\n')
  };
}

export function serializeParkingDraft(draft = {}) {
  const serialized = {};
  for (const field of draftFields) {
    if (typeof draft[field] === 'string' && draft[field].trim()) {
      serialized[field] = draft[field].trim();
    }
  }
  return JSON.stringify(serialized);
}

export function parseParkingDraft(value) {
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
  getParkingOperators,
  getAppealDeadlines,
  generateAppealText,
  getGroundsOfAppeal,
  getTribunalRoute,
  checkNoticeValidity,
  serializeParking,
  parseParking
};
