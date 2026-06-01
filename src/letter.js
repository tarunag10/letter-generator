export const organisationTypes = {
  employer: {
    label: 'Employer',
    legalContext: 'Employers have duties under the Equality Act 2010 to make reasonable adjustments where disabled workers or applicants would otherwise be put at a substantial disadvantage.',
    examples: ['adjusted duties or hours', 'accessible recruitment steps', 'assistive technology', 'written instructions', 'remote or quiet-space options'],
    responseAsk: 'Please confirm the adjustment decision, the manager responsible, and whether an occupational health or Access to Work discussion is needed.'
  },
  university: {
    label: 'University or college',
    legalContext: 'Education providers should consider reasonable adjustments so disabled students are not disadvantaged in teaching, assessment, placements, admissions, or student services.',
    examples: ['exam adjustments', 'lecture materials in advance', 'recordings or captions', 'library support', 'step-free room allocation'],
    responseAsk: 'Please confirm the adjustments, any evidence you require, and the named disability or student support contact handling this request.'
  },
  nhs: {
    label: 'NHS or health service',
    legalContext: 'Health services and public bodies may need to make reasonable adjustments so disabled people can access appointments, communication, premises, and care fairly.',
    examples: ['accessible appointment format', 'longer appointment time', 'BSL or communication support', 'accessible letters', 'quiet waiting arrangements'],
    responseAsk: 'Please record the agreed adjustments on my file and confirm how staff will see and apply them for future appointments.'
  },
  council: {
    label: 'Council or public body',
    legalContext: 'Councils and public bodies must consider reasonable adjustments when providing services or exercising public functions.',
    examples: ['accessible communications', 'home visit or phone alternative', 'extra time to respond', 'advocate involvement', 'step-free venue'],
    responseAsk: 'Please confirm the service owner, the reasonable-adjustment record, and the complaint or review route if you refuse any part of this request.'
  },
  railway: {
    label: 'Railway or station operator',
    legalContext: 'Rail and station operators should make reasonable adjustments and provide accessible assistance so disabled passengers can travel with dignity and as independently as possible.',
    examples: ['turn-up-and-go support', 'ramp assistance', 'accessible disruption updates', 'staff briefing', 'priority seating or boarding help'],
    responseAsk: 'Please confirm the assistance plan, station responsibility, and what will happen if disruption affects the journey.'
  },
  bank: {
    label: 'Bank or financial service',
    legalContext: 'Banks and financial services should make reasonable adjustments to communication, authentication, branch access, complaints, and customer-support processes.',
    examples: ['accessible statements', 'third-party authority', 'extra time for forms', 'phone alternatives', 'secure written communication'],
    responseAsk: 'Please confirm the adjustment marker on my account, how staff will apply it, and how this affects deadlines or complaint handling.'
  },
  airline: {
    label: 'Airline or airport',
    legalContext: 'Disabled passengers and people with reduced mobility are entitled to airport and airline assistance, and providers should address accessibility failures promptly.',
    examples: ['special assistance booking', 'mobility aid handling', 'accessible seating discussion', 'assistance through security', 'clear disruption support'],
    responseAsk: 'Please confirm the assistance booking, handover points, mobility-aid arrangements, and escalation contact for the day of travel.'
  },
  'exam-provider': {
    label: 'Exam provider',
    legalContext: 'Exam bodies and test centres should consider reasonable adjustments so disabled candidates can demonstrate their ability without avoidable disadvantage.',
    examples: ['extra time', 'rest breaks', 'reader or scribe', 'separate room', 'accessible test format'],
    responseAsk: 'Please confirm the evidence deadline, adjustment decision date, test-centre instructions, and appeal or review route.'
  }
};

export const issueGuidance = {
  exams: 'Give the exam date, the assessment format, and any evidence already accepted by your school, university, or previous exam provider.',
  communication: 'Name the format you can reliably use, such as email, large print, Easy Read, BSL, relay, captioned calls, or a nominated contact.',
  travel: 'Include journey dates, station or airport details, booking references, mobility equipment, and what needs to happen if disruption occurs.',
  employment: 'Explain the task, recruitment step, workplace policy, or rota pattern that creates the barrier.',
  premises: 'Describe the physical barrier, location, date needed, and any interim adjustment that would keep access available.',
  banking: 'List the account, complaint, transaction, or security step affected, but avoid putting full account numbers in the letter preview.',
  healthcare: 'Include appointment dates, clinic names, communication needs, and whether the adjustment should be added permanently to your record.'
};

export const currentGuidance = [
  {
    title: 'Equality Act reasonable adjustments',
    detail: 'GOV.UK guidance updated in May 2026 confirms the Equality Act 2010 protects people from discrimination, and the 2026 draft services code says providers should anticipate common access barriers rather than waiting for every person to ask from scratch.',
    source: 'GOV.UK Equality Act guidance',
    url: 'https://www.gov.uk/guidance/equality-act-2010-guidance'
  },
  {
    title: 'Accessible communication formats',
    detail: 'Government communication guidance highlights clear language and alternative formats such as Easy Read, large print, audio, Braille and other accessible formats where they are needed.',
    source: 'GOV.UK accessible communication formats',
    url: 'https://www.gov.uk/government/publications/inclusive-communication/accessible-communication-formats/'
  },
  {
    title: 'Subject access timing',
    detail: 'The ICO says subject access requests can be verbal or written and should be answered without undue delay and within one month unless a lawful extension applies.',
    source: 'ICO subject access guidance',
    url: 'https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/subject-access-requests/a-guide-to-subject-access/'
  }
];

const fallbackOrganisation = organisationTypes.university;
const commonChecklist = [
  'Save a copy of the letter and the date sent.',
  'Attach only evidence that is necessary and proportionate.',
  'Ask for written reasons if any adjustment is refused.',
  'Keep replies, reference numbers, screenshots, booking details, and call notes together.'
];

const organisationChecklist = {
  employer: ['Ask who owns the decision and whether occupational health or Access to Work should be involved.'],
  university: ['Ask disability support or student services to confirm how staff will be told before the deadline or assessment date.'],
  nhs: ['Ask for the adjustment to be added to your patient record so you do not have to repeat it at each appointment.'],
  council: ['Ask for the service owner, complaint stage, target response date, and any urgent interim arrangement.'],
  railway: ['Keep the itinerary, ticket, assistance booking, station names, and disruption evidence.'],
  bank: ['Ask the bank to mark the agreed adjustment on your account and confirm how deadlines or complaints are affected.'],
  airline: ['Keep booking references, assistance confirmations, boarding passes, mobility-aid evidence, and named escalation contacts.'],
  'exam-provider': ['Ask for the evidence deadline, decision date, test-centre instructions, and review or appeal route.']
};

const issueChecklist = {
  exams: ['Send the request early enough for exam-board or test-centre deadlines.'],
  communication: ['State the communication format you can reliably use and ask staff to record it.'],
  travel: ['Include journey dates, booking references, assistance handover points, and disruption arrangements.'],
  employment: ['Connect the adjustment to the task, rota, recruitment step, or policy creating the barrier.'],
  premises: ['Include the location, date access is needed, and any interim way to keep access available.'],
  banking: [
    'Remove full card numbers, passwords, PINs, security answers, and unnecessary medical detail before sending.',
    'Keep copies of statements, complaint references, transaction dates, and the bank response.'
  ],
  healthcare: ['Ask whether the adjustment is temporary or should be added permanently to your record.']
};

const responsePlanRules = {
  employer: {
    workingDays: 10,
    steps: ['Follow up with the named manager, HR contact, or recruiter if there is no written response by the target date.']
  },
  university: {
    workingDays: 10,
    steps: ['Follow up with disability support or student services and ask for any interim support while the decision is pending.']
  },
  nhs: {
    workingDays: 10,
    steps: ['Follow up through the clinic, practice manager, PALS, or patient-experience route if the adjustment is not recorded.']
  },
  council: {
    workingDays: 10,
    steps: ['Follow up through the service owner or complaints route and ask whether an interim arrangement can be put in place.']
  },
  railway: {
    workingDays: 5,
    steps: ['Follow up with the operator or assistance team before travel, keeping ticket and booking references together.']
  },
  bank: {
    workingDays: 10,
    steps: ['Follow up with the complaints or accessibility team and ask how any account marker affects deadlines.']
  },
  airline: {
    workingDays: 5,
    steps: ['Follow up with the airline or airport assistance team before travel and ask for written confirmation of handover points.']
  },
  'exam-provider': {
    workingDays: 7,
    steps: ['Follow up before the evidence deadline and ask for the decision date, test-centre instructions, and review route.']
  }
};

const issueResponseSteps = {
  exams: ['Put exam dates, evidence deadline, and appeal or review dates in your calendar.'],
  communication: ['Check the organisation has recorded the communication format you can reliably use.'],
  travel: ['Check assistance, disruption arrangements, and escalation contacts before the journey date.'],
  employment: ['Keep recruitment, rota, policy, manager, and occupational-health notes together.'],
  premises: ['Ask for an interim access arrangement if the physical barrier cannot be removed quickly.'],
  banking: ['Avoid sending full card numbers, PINs, passwords, or security answers in follow-up messages.'],
  healthcare: ['Ask whether the adjustment is temporary or should stay on your patient record.']
};

const draftFields = [
  'recipient',
  'organisationType',
  'issueType',
  'issue',
  'needs',
  'impact',
  'deadline',
  'sentDate',
  'evidence',
  'name',
  'contact',
  'email'
];

function clean(value, fallback) {
  const text = typeof value === 'string' ? value.trim() : '';
  return text || fallback;
}

function sentenceList(items) {
  if (items.length < 2) return items[0] || '';
  return `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`;
}

function slug(value, fallback = 'letter') {
  const text = clean(value, fallback)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
  return text || fallback;
}

export function getOrganisationProfile(type) {
  return organisationTypes[type] || fallbackOrganisation;
}

export function buildActionChecklist(input = {}) {
  const organisationType = organisationTypes[input.organisationType] ? input.organisationType : 'university';
  const issueType = clean(input.issueType, '').toLowerCase();
  return [
    ...commonChecklist,
    ...(organisationChecklist[organisationType] || []),
    ...(issueChecklist[issueType] || [])
  ];
}

export function parseLocalDate(value) {
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

export function toLocalDateString(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateForDisplay(value) {
  const date = value instanceof Date ? value : parseLocalDate(value);
  if (!date) return 'No date set';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(date);
}

export function addWorkingDays(value, workingDays = 10) {
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

export function buildResponsePlan(input = {}) {
  const organisationType = organisationTypes[input.organisationType] ? input.organisationType : 'university';
  const issueType = clean(input.issueType, '').toLowerCase();
  const rule = responsePlanRules[organisationType] || responsePlanRules.university;
  const sentDate = parseLocalDate(input.sentDate);
  const target = sentDate ? addWorkingDays(sentDate, rule.workingDays) : null;
  const steps = [
    `Send or save the request, then allow ${rule.workingDays} working days for an initial written response.`,
    ...(rule.steps || []),
    ...(issueResponseSteps[issueType] || []),
    'If there is no response by the target date, send a short written follow-up with the original request attached or quoted.',
    'Keep the response, dates, evidence, names, and reference numbers with your copy of the letter.'
  ];

  return {
    windowLabel: `${rule.workingDays} working days`,
    sentDate: sentDate ? toLocalDateString(sentDate) : '',
    sentDateDisplay: sentDate ? formatDateForDisplay(sentDate) : 'Set a sent date to calculate a target date',
    targetDate: target ? toLocalDateString(target) : '',
    targetDateDisplay: target ? formatDateForDisplay(target) : 'Set a sent date to calculate a target date',
    steps,
    safetyNote: 'This response plan is an informational planning aid, not legal advice. Check any formal deadline, appeal route, complaint policy, ticket term, exam rule, or urgent time limit before relying on it.'
  };
}

export function buildLetterHandoffPack(input = {}) {
  const letter = generateReasonableAdjustmentLetter(input);
  const responsePlan = buildResponsePlan(input);
  const checklist = buildActionChecklist(input);

  return {
    title: 'Reasonable adjustment handoff pack',
    markdown: [
      '# Reasonable adjustment handoff pack',
      '',
      'Generated locally in the browser. Nothing was sent to a server.',
      '',
      '## Letter',
      '```text',
      letter,
      '```',
      '',
      '## Response plan',
      `Response window: ${responsePlan.windowLabel}`,
      `Target follow-up date: ${responsePlan.targetDateDisplay}`,
      '',
      ...responsePlan.steps.map((step) => `- [ ] ${step}`),
      '',
      '## Action checklist',
      ...checklist.map((item) => `- [ ] ${item}`),
      '',
      '## Current source notes',
      ...currentGuidance.map((item) => `- ${item.title}: ${item.detail} Source: ${item.url}`),
      '',
      `Safety note: ${responsePlan.safetyNote}`
    ].join('\n')
  };
}

export function buildExportMetadata(input = {}) {
  const organisationType = organisationTypes[input.organisationType] ? input.organisationType : 'university';
  const issueType = issueGuidance[clean(input.issueType, '').toLowerCase()]
    ? clean(input.issueType, '').toLowerCase()
    : 'request';
  const issue = slug(input.issue, 'reasonable-adjustment');
  const profile = getOrganisationProfile(organisationType);

  return {
    filename: `reasonable-adjustment-${organisationType}-${issueType}-${issue}.txt`,
    mimeType: 'text/plain;charset=utf-8',
    title: `Reasonable adjustment request for ${profile.label}`
  };
}

export function serializeDraftState(input = {}) {
  const draft = {};
  for (const field of draftFields) {
    if (typeof input[field] === 'string' && input[field].trim()) {
      draft[field] = input[field].trim();
    }
  }
  return JSON.stringify(draft);
}

export function parseDraftState(serialized) {
  try {
    const parsed = JSON.parse(serialized);
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

export function buildMailtoLink({ to = '', subject = 'Reasonable adjustment request', body = '' } = {}) {
  const address = encodeURIComponent(clean(to, ''));
  const params = [
    ['subject', clean(subject, 'Reasonable adjustment request')],
    ['body', clean(body, '')]
  ].map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&');
  return `mailto:${address}?${params}`;
}

export function generateReasonableAdjustmentLetter(input = {}) {
  const recipient = clean(input.recipient, 'Sir or Madam');
  const profile = getOrganisationProfile(input.organisationType);
  const issue = clean(input.issue, 'access to your service');
  const needs = clean(input.needs, 'reasonable adjustments that allow me to use the service fairly');
  const impact = clean(input.impact, 'Without these adjustments I am likely to be placed at a substantial disadvantage.');
  const deadline = clean(input.deadline, '10 working days');
  const evidence = clean(input.evidence, 'I can provide relevant evidence if it is necessary and proportionate.');
  const name = clean(input.name, 'Your name');
  const contact = clean(input.contact, 'Your contact details');
  const issueKey = clean(input.issueType, '').toLowerCase();
  const issueNote = issueGuidance[issueKey] ? `\n\nFor context, this request relates to ${issueKey}. ${issueGuidance[issueKey]}` : '';

  return `Dear ${recipient},

Reasonable adjustment request: ${issue}

I am writing to request reasonable adjustments in connection with ${issue}. ${profile.legalContext} The Equality Act 2010 duty is practical: the focus should be on removing or reducing the barrier, not on making the process more difficult for the disabled person.

The barrier is:
${impact}

The adjustments I am requesting are:
${needs}

Examples that may be relevant for a ${profile.label.toLowerCase()} include ${sentenceList(profile.examples)}.${issueNote}

${evidence}

Please confirm in writing:
1. Whether you agree to each requested adjustment.
2. If you do not agree, the specific reason and any alternative adjustment you propose.
3. Who is responsible for putting the adjustments in place.
4. How staff or decision-makers will be told so I do not have to repeat this request.
5. Any deadline, evidence requirement, complaint route, appeal route, or named contact I should use.

${profile.responseAsk}

Please respond within ${deadline}. If the issue is urgent or linked to a dated appointment, exam, journey, interview, payment deadline, or hearing, please treat it as time-sensitive.

I would prefer correspondence by ${contact}.

Yours faithfully,
${name}`;
}
