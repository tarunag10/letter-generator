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
