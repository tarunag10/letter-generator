// ===== src/theme.js =====
const __m1__Users_tarunagarwal_Documents_1_App_Developement_Tarun_Open_Access_UK_letter_generator_src_theme_js = (() => {
// <app>/src/theme.js

function readStored() {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStored(value) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, value);
  } catch {
    /* private mode: theme still applies for this session */
  }
}

function apply(theme, toggle) {
  document.documentElement.setAttribute('data-theme', theme);
  if (toggle) {
    toggle.setAttribute('aria-pressed', String(theme === 'dark'));
    toggle.textContent = theme === 'dark' ? 'Light theme' : 'Dark theme';
  }
}

function initTheme(toggleSelector = '#theme-toggle') {
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  const toggle = document.querySelector(toggleSelector);
  let theme = resolveInitialTheme({ stored: readStored(), prefersDark });
  apply(theme, toggle);

  toggle?.addEventListener('click', () => {
    theme = nextTheme(theme);
    apply(theme, toggle);
    writeStored(theme);
  });
}

return { initTheme };
})();

// ===== ../shared/theme/index.mjs =====
const __m2__Users_tarunagarwal_Documents_1_App_Developement_Tarun_Open_Access_UK_shared_theme_index_mjs = (() => {
// shared/theme/index.mjs
const THEME_STORAGE_KEY = 'open-access-uk:theme';

const VALID = new Set(['light', 'dark']);

function resolveInitialTheme({ stored, prefersDark } = {}) {
  if (VALID.has(stored)) return stored;
  return prefersDark ? 'dark' : 'light';
}

function nextTheme(current) {
  return current === 'dark' ? 'light' : 'dark';
}

return { THEME_STORAGE_KEY, resolveInitialTheme, nextTheme };
})();

// ===== ../shared/calendar/ics.mjs =====
const __m3__Users_tarunagarwal_Documents_1_App_Developement_Tarun_Open_Access_UK_shared_calendar_ics_mjs = (() => {

function compactDate(dateString) {
  return dateString.replace(/-/g, '');
}

function nextDay(dateString) {
  const date = parseLocalDate(dateString);
  if (!date) return null;
  date.setDate(date.getDate() + 1);
  return toLocalDateString(date);
}

function escapeText(value = '') {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

// RFC 5545 line folding at 75 octets.
function foldIcsLine(line) {
  if (line.length <= 75) return line;
  const segments = [];
  let remaining = line;
  segments.push(remaining.slice(0, 75));
  remaining = remaining.slice(75);
  while (remaining.length) {
    segments.push(' ' + remaining.slice(0, 74));
    remaining = remaining.slice(74);
  }
  return segments.join('\r\n');
}

function createIcsEvent({ title, date, description = '', uid } = {}) {
  const start = parseLocalDate(date);
  if (!start) return '';
  const end = nextDay(date);
  const stamp = `${compactDate(date)}T000000Z`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Open Access UK//Local//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${escapeText(uid || `${compactDate(date)}-${escapeText(title)}`)}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${compactDate(date)}`,
    `DTEND;VALUE=DATE:${compactDate(end)}`,
    `SUMMARY:${escapeText(title)}`,
    description ? `DESCRIPTION:${escapeText(description)}` : '',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean);
  return lines.map(foldIcsLine).join('\r\n') + '\r\n';
}

return { foldIcsLine, createIcsEvent };
})();

// ===== ../shared/deadlines/index.mjs =====
const __m4__Users_tarunagarwal_Documents_1_App_Developement_Tarun_Open_Access_UK_shared_deadlines_index_mjs = (() => {
function parseLocalDate(value) {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function toLocalDateString(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-');
}

function isWorkingDay(date) {
  const day = date.getDay();
  return day !== 0 && day !== 6;
}

function addWorkingDays(value, days) {
  const date = parseLocalDate(value);
  if (!date) return null;
  let remaining = Number(days);
  const result = new Date(date);
  while (remaining > 0) {
    result.setDate(result.getDate() + 1);
    if (isWorkingDay(result)) remaining -= 1;
  }
  return toLocalDateString(result);
}

function calculateDeadline(startDate, rule) {
  const date = parseLocalDate(startDate);
  if (!date || !rule) return null;

  if (rule.days && rule.day_type === 'working') {
    return {
      ruleId: rule.id,
      targetDate: addWorkingDays(startDate, Number(rule.days)),
      explanation: rule.explanation
    };
  }

  const result = new Date(date);
  if (rule.days) result.setDate(result.getDate() + Number(rule.days));
  if (rule.weeks) result.setDate(result.getDate() + Number(rule.weeks) * 7);
  if (rule.months) result.setMonth(result.getMonth() + Number(rule.months));

  return {
    ruleId: rule.id,
    targetDate: toLocalDateString(result),
    explanation: rule.explanation
  };
}

return { parseLocalDate, toLocalDateString, addWorkingDays, calculateDeadline };
})();

// ===== ../shared/readability/index.mjs =====
const __m5__Users_tarunagarwal_Documents_1_App_Developement_Tarun_Open_Access_UK_shared_readability_index_mjs = (() => {
// Offline, rule-based plain-English checks. No network, no AI.

const JARGON = [
  'aforementioned',
  'herewith',
  'hereinafter',
  'notwithstanding',
  'aforesaid',
  'whereof',
  'pursuant',
  'henceforth',
  'thereto',
  'enclosed please find',
  'please find enclosed'
];

// "be"-verb followed by a past participle: regular -ed/-en, or a common irregular.
const IRREGULAR_PARTICIPLES =
  'made|done|sent|built|told|held|kept|left|paid|set|put|brought|bought|caught|taught|found|won|met';
const PASSIVE = new RegExp(
  `\\b(was|were|is|are|been|being|be)\\b\\s+(\\w+(ed|en)|${IRREGULAR_PARTICIPLES})\\b(\\s+by\\b)?`,
  'i'
);

function countSyllables(word) {
  const w = String(word)
    .toLowerCase()
    .replace(/[^a-z]/g, '');
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const groups = w
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
    .replace(/^y/, '')
    .match(/[aeiouy]{1,2}/g);
  return groups ? groups.length : 1;
}

function splitSentences(text) {
  return String(text)
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function words(text) {
  return (
    String(text)
      .trim()
      .match(/[A-Za-z']+/g) || []
  );
}

function analyseReadability(text = '') {
  const sentences = splitSentences(text);
  const allWords = words(text);
  const wordCount = allWords.length;
  const sentenceCount = sentences.length;
  const syllableCount = allWords.reduce((sum, w) => sum + countSyllables(w), 0);

  // Flesch–Kincaid grade level → approximate UK reading age (+5).
  let readingAge = 0;
  if (wordCount > 0 && sentenceCount > 0) {
    const grade = 0.39 * (wordCount / sentenceCount) + 11.8 * (syllableCount / wordCount) - 15.59;
    readingAge = Math.max(5, Math.round(grade + 5));
  }

  const flags = [];
  sentences.forEach((sentence, index) => {
    const wc = words(sentence).length;
    if (wc > 25) {
      flags.push({
        type: 'long-sentence',
        index,
        detail: `Sentence ${index + 1} has ${wc} words.`
      });
    }
    if (PASSIVE.test(sentence)) {
      flags.push({ type: 'passive', index, detail: `Sentence ${index + 1} may be passive.` });
    }
  });
  const lower = String(text).toLowerCase();
  for (const term of JARGON) {
    if (lower.includes(term)) {
      flags.push({ type: 'jargon', term, detail: `Consider plainer wording than "${term}".` });
    }
  }

  return { readingAge, wordCount, sentenceCount, syllableCount, flags };
}

return { countSyllables, analyseReadability };
})();

// ===== ../shared/evidence/index.mjs =====
const __m6__Users_tarunagarwal_Documents_1_App_Developement_Tarun_Open_Access_UK_shared_evidence_index_mjs = (() => {
const EVIDENCE_HANDOFF_KEY = 'open-access-uk:evidence-handoff';

function cleanItems(items) {
  if (!Array.isArray(items)) return [];
  return [...new Set(items.map((i) => String(i).trim()).filter(Boolean))];
}

function createEvidencePack({ source = '', items = [] } = {}) {
  return { source: String(source).trim(), items: cleanItems(items) };
}

function serializeEvidence(pack) {
  return JSON.stringify(createEvidencePack(pack));
}

function parseEvidence(value) {
  try {
    const parsed = JSON.parse(value || '{}');
    return createEvidencePack({ source: parsed.source, items: parsed.items });
  } catch {
    return { source: '', items: [] };
  }
}

return { EVIDENCE_HANDOFF_KEY, createEvidencePack, serializeEvidence, parseEvidence };
})();

// ===== src/letter.js =====
const __m7__Users_tarunagarwal_Documents_1_App_Developement_Tarun_Open_Access_UK_letter_generator_src_letter_js = (() => {
const organisationTypes = {
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

const issueGuidance = {
  exams: 'Give the exam date, the assessment format, and any evidence already accepted by your school, university, or previous exam provider.',
  communication: 'Name the format you can reliably use, such as email, large print, Easy Read, BSL, relay, captioned calls, or a nominated contact.',
  travel: 'Include journey dates, station or airport details, booking references, mobility equipment, and what needs to happen if disruption occurs.',
  employment: 'Explain the task, recruitment step, workplace policy, or rota pattern that creates the barrier.',
  premises: 'Describe the physical barrier, location, date needed, and any interim adjustment that would keep access available.',
  banking: 'List the account, complaint, transaction, or security step affected, but avoid putting full account numbers in the letter preview.',
  healthcare: 'Include appointment dates, clinic names, communication needs, and whether the adjustment should be added permanently to your record.'
};

const requestTypes = {
  'reasonable-adjustment': {
    label: 'Reasonable adjustment request',
    sourceId: 'govuk-equality-act-guidance',
    responseWindow: '10 working days for an initial response'
  },
  foi: {
    label: 'Freedom of Information request',
    sourceId: 'govuk-foi-request',
    responseWindow: '20 working days'
  },
  sar: {
    label: 'Subject access request',
    sourceId: 'ico-subject-access-request',
    responseWindow: 'one month'
  },
  'complaint-follow-up': {
    label: 'Complaint or request follow-up',
    sourceId: 'internal-follow-up',
    responseWindow: 'as soon as reasonably possible'
  }
};

const currentGuidance = [
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
  },
  {
    title: 'Freedom of Information timing',
    detail: 'GOV.UK explains that public authorities usually have 20 working days to respond to a Freedom of Information request.',
    source: 'GOV.UK FOI request guidance',
    url: 'https://www.gov.uk/make-a-freedom-of-information-request/how-to-make-an-foi-request'
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

const localEvidenceItems = {
  common: [
    'A copy of the sent request, the sent date, and the address or email used.',
    'Replies, reference numbers, screenshots, forms, booking details, and notes of phone calls.',
    'Only necessary supporting evidence, with private details removed where they are not needed.'
  ],
  employer: ['Job advert, rota, policy, manager emails, occupational-health notes, or Access to Work details.'],
  university: ['Disability support plan, exam timetable, placement details, course deadlines, and previous accepted evidence.'],
  nhs: ['Appointment letters, clinic name, patient-access notes, PALS reference, and agreed communication needs.'],
  council: ['Service reference, complaint stage, decision letters, officer names, photos, and dated contact notes.'],
  railway: ['Ticket, itinerary, booking reference, assistance booking, station names, disruption evidence, and actual arrival time.'],
  bank: ['Complaint references, transaction dates, statements, secure-message screenshots, and the bank response.'],
  airline: ['Booking reference, assistance confirmation, boarding pass, mobility-aid evidence, photos, and named contacts.'],
  'exam-provider': ['Exam date, evidence deadline, access-arrangement history, test-centre messages, and appeal or review dates.']
};

const localSafetyItems = {
  common: [
    'Check urgent deadlines, appeal windows, complaint stages, and any local policy before waiting.',
    'Keep medical, financial, and identity details proportionate to the adjustment being requested.'
  ],
  bank: ['Remove full card numbers, PINs, passwords, security answers, and unnecessary medical detail before sending.'],
  healthcare: ['Do not include full medical records unless they are necessary for the adjustment decision.'],
  exams: ['Check evidence deadlines and ask for an interim decision if the exam or assessment date is close.'],
  travel: ['Check the pack against the journey date and ask for written confirmation before travel.']
};

const localEscalationItems = {
  common: [
    'If there is no reply by the target date, send a short follow-up with the original request attached or quoted.',
    'Ask for written reasons, the complaint route, and the named team responsible for the next decision.'
  ],
  employer: ['If work is affected, ask HR or the manager for the grievance, appeal, or occupational-health route.'],
  university: ['Ask student services for the review, appeal, or complaints route if adjustments are refused or delayed.'],
  nhs: ['Use the clinic, practice manager, PALS, or patient-experience route if the adjustment is not recorded.'],
  council: ['Use the service complaints route and ask when the Local Government and Social Care Ombudsman route may become available.'],
  railway: ['Escalate through the operator complaint route and keep Delay Repay or accessibility-assistance evidence together.'],
  bank: ['Ask for the final-response route and when the Financial Ombudsman Service may be available.'],
  airline: ['Use the airline or airport complaint route and keep the CAA or approved ADR route in view where applicable.'],
  'exam-provider': ['Ask for the review or appeal route and the date by which the test centre will receive instructions.']
};

const draftFields = [
  'requestType',
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

function titleCase(value) {
  return clean(value, '')
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');
}

function sentenceCase(value) {
  const text = clean(value, '');
  return text ? text[0].toUpperCase() + text.slice(1) : '';
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function getOrganisationProfile(type) {
  return organisationTypes[type] || fallbackOrganisation;
}

function buildActionChecklist(input = {}) {
  const organisationType = organisationTypes[input.organisationType] ? input.organisationType : 'university';
  const issueType = clean(input.issueType, '').toLowerCase();
  return [
    ...commonChecklist,
    ...(organisationChecklist[organisationType] || []),
    ...(issueChecklist[issueType] || [])
  ];
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

function addWorkingDays(value, workingDays = 10) {
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

function buildResponsePlan(input = {}) {
  const requestType = clean(input.requestType, 'reasonable-adjustment');
  if (requestType === 'foi') {
    const target = addWorkingDays(input.sentDate, 20);
    return {
      windowLabel: '20 working days',
      sentDate: parseLocalDate(input.sentDate) ? toLocalDateString(parseLocalDate(input.sentDate)) : '',
      sentDateDisplay: parseLocalDate(input.sentDate)
        ? formatDateForDisplay(input.sentDate)
        : 'Set a sent date to calculate a target date',
      targetDate: target ? toLocalDateString(target) : '',
      targetDateDisplay: target ? formatDateForDisplay(target) : 'Set a sent date to calculate a target date',
      steps: [
        'Send the FOI request to a public authority in writing.',
        'Keep the request focused on recorded information rather than explanations or opinions.',
        'If there is no response by the target date, send a polite follow-up quoting the original request.',
        'If the response is refused or delayed, check the internal review and ICO complaint routes.'
      ],
      safetyNote:
        'This is an informational planning aid, not legal advice. FOI rules and exemptions can be technical; check the official route before escalating.'
    };
  }

  if (requestType === 'sar') {
    const sentDate = parseLocalDate(input.sentDate);
    const target = sentDate ? new Date(sentDate.getTime()) : null;
    if (target) target.setUTCMonth(target.getUTCMonth() + 1);
    return {
      windowLabel: 'one month',
      sentDate: sentDate ? toLocalDateString(sentDate) : '',
      sentDateDisplay: sentDate ? formatDateForDisplay(sentDate) : 'Set a sent date to calculate a target date',
      targetDate: target ? toLocalDateString(target) : '',
      targetDateDisplay: target ? formatDateForDisplay(target) : 'Set a sent date to calculate a target date',
      steps: [
        'Send the SAR to the organisation that controls the personal data.',
        'Describe the personal data or time period clearly enough to help the organisation find it.',
        'Keep any identity-check request and response deadline with your records.',
        'If there is no response by the target date, follow up and check the ICO complaint route.'
      ],
      safetyNote:
        'This is an informational planning aid, not legal advice. Avoid sending more identity documents than necessary.'
    };
  }

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

function buildRequestTypePlan(input = {}) {
  const requestType = requestTypes[input.requestType] ? input.requestType : 'reasonable-adjustment';
  const responsePlan = buildResponsePlan({ ...input, requestType });
  return {
    requestType,
    label: requestTypes[requestType].label,
    sourceId: requestTypes[requestType].sourceId,
    responseWindow: responsePlan.windowLabel,
    targetDateDisplay: responsePlan.targetDateDisplay,
    steps: responsePlan.steps,
    safetyNote: responsePlan.safetyNote
  };
}

function buildLocalActionPack(input = {}) {
  const organisationType = organisationTypes[input.organisationType] ? input.organisationType : 'university';
  const issueType = clean(input.issueType, '').toLowerCase();
  const profile = getOrganisationProfile(organisationType);
  const issueLabel = titleCase(issueType || 'request');
  const issue = clean(input.issue, 'reasonable adjustment request');
  const issueDisplay = sentenceCase(issue);
  const responsePlan = buildResponsePlan(input);
  const evidence = unique([
    ...localEvidenceItems.common,
    ...(localEvidenceItems[organisationType] || []),
    ...(issueType === 'banking' ? localEvidenceItems.bank : []),
    ...(issueType === 'travel' ? localEvidenceItems.railway : []),
    ...(issueType === 'exams' ? localEvidenceItems['exam-provider'] : [])
  ]);
  const safety = unique([
    ...localSafetyItems.common,
    ...(localSafetyItems[organisationType] || []),
    ...(localSafetyItems[issueType] || [])
  ]);
  const escalation = unique([
    ...localEscalationItems.common,
    ...(localEscalationItems[organisationType] || [])
  ]);

  return {
    title: 'Local action pack',
    contextLabel: `${profile.label} - ${issueLabel}`,
    targetDateDisplay: responsePlan.targetDateDisplay,
    evidence,
    safety,
    nextSteps: responsePlan.steps,
    escalation,
    markdown: [
      '# Local action pack',
      '',
      'Generated locally in the browser. Nothing was sent to a server.',
      '',
      `Context: ${profile.label} - ${issueLabel}`,
      `Issue: ${issueDisplay}`,
      `Target follow-up date: ${responsePlan.targetDateDisplay}`,
      '',
      '## Evidence to keep',
      ...evidence.map((item) => `- [ ] ${item}`),
      '',
      '## Safety checks',
      ...safety.map((item) => `- [ ] ${item}`),
      '',
      '## Next steps',
      ...responsePlan.steps.map((item) => `- [ ] ${item}`),
      '',
      '## Escalation notes',
      ...escalation.map((item) => `- [ ] ${item}`)
    ].join('\n')
  };
}

function buildLetterHandoffPack(input = {}) {
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

function buildExportMetadata(input = {}) {
  const requestType = requestTypes[input.requestType] ? input.requestType : 'reasonable-adjustment';
  if (requestType !== 'reasonable-adjustment') {
    const subject = slug(input.issue || input.needs || requestTypes[requestType].label, requestType);
    return {
      filename: `${requestType}-${subject}.txt`,
      mimeType: 'text/plain;charset=utf-8',
      title: requestTypes[requestType].label
    };
  }

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

function serializeDraftState(input = {}) {
  const draft = {};
  for (const field of draftFields) {
    if (typeof input[field] === 'string' && input[field].trim()) {
      draft[field] = input[field].trim();
    }
  }
  return JSON.stringify(draft);
}

function parseDraftState(serialized) {
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

function buildMailtoLink({ to = '', subject = 'Reasonable adjustment request', body = '' } = {}) {
  const address = encodeURIComponent(clean(to, ''));
  const params = [
    ['subject', clean(subject, 'Reasonable adjustment request')],
    ['body', clean(body, '')]
  ].map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&');
  return `mailto:${address}?${params}`;
}

function generateReasonableAdjustmentLetter(input = {}) {
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

function generateFOIRequest(input = {}) {
  const recipient = clean(input.recipient, 'Freedom of Information Officer');
  const authority = clean(input.organisationName || input.organisation || input.recipient, 'your organisation');
  const information = clean(
    input.issue,
    'recorded information about the public service, decision, policy, contract, or correspondence described below'
  );
  const scope = clean(input.needs, 'Please provide the recorded information in electronic form where possible.');
  const name = clean(input.name, 'Your name');
  const contact = clean(input.contact, 'Your contact details');

  return `Dear ${recipient},

Freedom of Information request

I am making this request under the Freedom of Information Act 2000.

Please provide the following recorded information held by ${authority}:
${information}

Scope and format:
${scope}

If any part of the request is unclear, please provide advice and assistance so I can refine it. If you withhold any information, please identify the exemption relied on and explain how it applies.

Please respond within the statutory time limit. I would prefer correspondence by ${contact}.

Yours faithfully,
${name}`;
}

function generateSARRequest(input = {}) {
  const recipient = clean(input.recipient, 'Data Protection Officer');
  const organisation = clean(input.organisationName || input.organisation || input.recipient, 'your organisation');
  const dataRequested = clean(
    input.issue,
    'the personal data you hold about me, including records, correspondence, notes, account information, and decisions relating to the matter described below'
  );
  const context = clean(input.evidence || input.needs, 'I can provide reasonable identity information if needed.');
  const name = clean(input.name, 'Your name');
  const contact = clean(input.contact, 'Your contact details');

  return `Dear ${recipient},

Subject access request

I am making a subject access request for personal data held by ${organisation}.

Please provide:
${dataRequested}

Context to help locate the data:
${context}

If you need identity verification, please ask only for information that is necessary and proportionate. If you need clarification, please explain what is needed as soon as possible.

Please respond without undue delay and within one month unless a lawful extension applies. I would prefer correspondence by ${contact}.

Yours faithfully,
${name}`;
}

function generateComplaintFollowUp(input = {}) {
  const recipient = clean(input.recipient, 'Complaints Team');
  const originalIssue = clean(input.issue, 'my previous request or complaint');
  const sentDate = formatDateForDisplay(input.sentDate);
  const reference = clean(input.evidence, 'No reference number was provided.');
  const desiredAction = clean(input.needs, 'Please provide a written update, a target response date, and the next escalation route.');
  const name = clean(input.name, 'Your name');
  const contact = clean(input.contact, 'Your contact details');

  return `Dear ${recipient},

Follow-up on previous request or complaint

I am following up on ${originalIssue}. I sent or raised this on ${sentDate}.

Reference or context:
${reference}

I have not yet received a clear response, or I need an update on the next step.

Please now:
1. Confirm the current status.
2. Provide the response or decision if it is ready.
3. Explain any delay and give a target response date.
4. Confirm the complaint, review, appeal, or escalation route if the matter remains unresolved.

Requested next action:
${desiredAction}

Please reply by ${contact}.

Yours faithfully,
${name}`;
}

function generateRequestLetter(input = {}) {
  const requestType = requestTypes[input.requestType] ? input.requestType : 'reasonable-adjustment';
  if (requestType === 'foi') return generateFOIRequest(input);
  if (requestType === 'sar') return generateSARRequest(input);
  if (requestType === 'complaint-follow-up') return generateComplaintFollowUp(input);
  return generateReasonableAdjustmentLetter(input);
}

return { organisationTypes, issueGuidance, requestTypes, currentGuidance, getOrganisationProfile, buildActionChecklist, parseLocalDate, toLocalDateString, formatDateForDisplay, addWorkingDays, buildResponsePlan, buildRequestTypePlan, buildLocalActionPack, buildLetterHandoffPack, buildExportMetadata, serializeDraftState, parseDraftState, buildMailtoLink, generateReasonableAdjustmentLetter, generateFOIRequest, generateSARRequest, generateComplaintFollowUp, generateRequestLetter };
})();

// ===== generated dependency bindings =====

const { initTheme: initTheme } = __m1__Users_tarunagarwal_Documents_1_App_Developement_Tarun_Open_Access_UK_letter_generator_src_theme_js;

const { THEME_STORAGE_KEY: THEME_STORAGE_KEY, resolveInitialTheme: resolveInitialTheme, nextTheme: nextTheme } = __m2__Users_tarunagarwal_Documents_1_App_Developement_Tarun_Open_Access_UK_shared_theme_index_mjs;

const { foldIcsLine: foldIcsLine, createIcsEvent: createIcsEvent } = __m3__Users_tarunagarwal_Documents_1_App_Developement_Tarun_Open_Access_UK_shared_calendar_ics_mjs;

const { parseLocalDate: parseLocalDate, toLocalDateString: toLocalDateString, addWorkingDays: addWorkingDays, calculateDeadline: calculateDeadline } = __m4__Users_tarunagarwal_Documents_1_App_Developement_Tarun_Open_Access_UK_shared_deadlines_index_mjs;

const { countSyllables: countSyllables, analyseReadability: analyseReadability } = __m5__Users_tarunagarwal_Documents_1_App_Developement_Tarun_Open_Access_UK_shared_readability_index_mjs;

const { EVIDENCE_HANDOFF_KEY: EVIDENCE_HANDOFF_KEY, createEvidencePack: createEvidencePack, serializeEvidence: serializeEvidence, parseEvidence: parseEvidence } = __m6__Users_tarunagarwal_Documents_1_App_Developement_Tarun_Open_Access_UK_shared_evidence_index_mjs;

const { organisationTypes: organisationTypes, issueGuidance: issueGuidance, requestTypes: requestTypes, currentGuidance: currentGuidance, getOrganisationProfile: getOrganisationProfile, buildActionChecklist: buildActionChecklist, formatDateForDisplay: formatDateForDisplay, buildResponsePlan: buildResponsePlan, buildRequestTypePlan: buildRequestTypePlan, buildLocalActionPack: buildLocalActionPack, buildLetterHandoffPack: buildLetterHandoffPack, buildExportMetadata: buildExportMetadata, serializeDraftState: serializeDraftState, parseDraftState: parseDraftState, buildMailtoLink: buildMailtoLink, generateReasonableAdjustmentLetter: generateReasonableAdjustmentLetter, generateFOIRequest: generateFOIRequest, generateSARRequest: generateSARRequest, generateComplaintFollowUp: generateComplaintFollowUp, generateRequestLetter: generateRequestLetter } = __m7__Users_tarunagarwal_Documents_1_App_Developement_Tarun_Open_Access_UK_letter_generator_src_letter_js;

// ===== src/app.js =====
// ===== src/app.js =====

// ===== src/app.js =====

// ===== src/app.js =====






const form = document.querySelector('form');
const preview = document.querySelector('#preview');
const status = document.querySelector('#status');
const requestTypeSelect = document.querySelector('#requestType');
const organisationSelect = document.querySelector('#organisationType');
const issueSelect = document.querySelector('#issueType');
const guidance = document.querySelector('#selected-guidance');
const copyButton = document.querySelector('#copyLetter');
const downloadButton = document.querySelector('#downloadLetter');
const printButton = document.querySelector('#printLetter');
const emailLink = document.querySelector('#emailLetter');
const resetButton = document.querySelector('#resetDraft');
const localActionButton = document.querySelector('#copyLocalActionPack');
const handoffButton = document.querySelector('#copyHandoffPack');
const currentGuidanceMount = document.querySelector('#current-guidance');
const draftKey = 'open-access-uk:letter-generator:draft';

function populateSelect(select, entries, labelFor) {
  select.replaceChildren(
    ...entries.map(([value, data]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = labelFor(data, value);
      return option;
    })
  );
}

function values() {
  return Object.fromEntries(new FormData(form).entries());
}

function updateGuidance(data) {
  const requestPlan = buildRequestTypePlan(data);
  const profile = getOrganisationProfile(data.organisationType);
  const responsePlan = buildResponsePlan(data);
  guidance.innerHTML = '';

  const heading = document.createElement('h2');
  heading.textContent = `${requestPlan.label} guidance`;
  const legal = document.createElement('p');
  legal.textContent =
    data.requestType === 'reasonable-adjustment'
      ? profile.legalContext
      : `Response window: ${requestPlan.responseWindow}. Source record: ${requestPlan.sourceId}.`;
  const examples = document.createElement('p');
  examples.textContent =
    data.requestType === 'reasonable-adjustment'
      ? `Useful detail to include: ${profile.examples.join(', ')}.`
      : 'Keep the request focused, factual, and easy to identify. Avoid unnecessary sensitive detail.';
  const issue = document.createElement('p');
  issue.textContent = issueGuidance[data.issueType] || 'Choose an issue type to see drafting prompts.';
  const checklistHeading = document.createElement('h3');
  checklistHeading.textContent = 'Action checklist';
  const checklist = document.createElement('ul');
  for (const item of buildActionChecklist(data)) {
    const listItem = document.createElement('li');
    listItem.textContent = item;
    checklist.append(listItem);
  }
  const planHeading = document.createElement('h3');
  planHeading.textContent = 'Response plan';
  const window = document.createElement('p');
  window.textContent = `Recommended response window: ${responsePlan.windowLabel}. Target follow-up date: ${responsePlan.targetDateDisplay}.`;
  const planList = document.createElement('ol');
  for (const item of responsePlan.steps) {
    const listItem = document.createElement('li');
    listItem.textContent = item;
    planList.append(listItem);
  }
  const safety = document.createElement('p');
  safety.className = 'summary';
  safety.textContent = responsePlan.safetyNote;

  guidance.append(heading, legal, examples, issue, checklistHeading, checklist, planHeading, window, planList, safety);
}

function update() {
  const data = values();
  const requestType = requestTypes[data.requestType] ? data.requestType : 'reasonable-adjustment';
  preview.textContent = generateRequestLetter(data);
  emailLink.href = buildMailtoLink({
    to: data.email,
    subject: `${requestTypes[requestType].label}: ${data.issue || 'request'}`,
    body: preview.textContent
  });
  updateGuidance(data);
}

function renderCurrentGuidance() {
  if (!currentGuidanceMount) return;
  currentGuidanceMount.replaceChildren(
    ...currentGuidance.map((item) => {
      const card = document.createElement('article');
      card.className = 'card';
      const heading = document.createElement('h3');
      heading.textContent = item.title;
      const detail = document.createElement('p');
      detail.textContent = item.detail;
      const link = document.createElement('a');
      link.href = item.url;
      link.rel = 'noreferrer';
      link.textContent = item.source;
      card.append(heading, detail, link);
      return card;
    })
  );
}

function saveDraft() {
  localStorage.setItem(draftKey, serializeDraftState(values()));
  status.textContent = 'Draft autosaved locally in this browser.';
}

function restoreDraft() {
  const draft = parseDraftState(localStorage.getItem(draftKey));
  for (const [name, value] of Object.entries(draft)) {
    const field = form.elements.namedItem(name);
    if (field) field.value = value;
  }
}

function resetDraft() {
  localStorage.removeItem(draftKey);
  form.reset();
  organisationSelect.value = 'university';
  issueSelect.value = 'exams';
  update();
  status.textContent = 'Saved draft cleared from this browser.';
}

async function copyLetter() {
  try {
    await navigator.clipboard?.writeText(preview.textContent);
    status.textContent = 'Letter copied locally. Nothing was sent to a server.';
  } catch {
    status.textContent = 'Copy failed. You can still select and copy the preview manually.';
  }
}

async function copyHandoffPack() {
  try {
    await navigator.clipboard?.writeText(buildLetterHandoffPack(values()).markdown);
    status.textContent = 'Handoff pack copied locally. Nothing was sent to a server.';
  } catch {
    status.textContent = 'Copy failed. You can still copy the letter and checklist manually.';
  }
}

async function copyLocalActionPack() {
  try {
    await navigator.clipboard?.writeText(buildLocalActionPack(values()).markdown);
    status.textContent = 'Local action pack copied locally. Nothing was sent to a server.';
  } catch {
    status.textContent = 'Copy failed. You can still copy the response plan and checklist manually.';
  }
}

function downloadLetter() {
  const metadata = buildExportMetadata(values());
  const blob = new Blob([preview.textContent], { type: metadata.mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = metadata.filename;
  link.click();
  URL.revokeObjectURL(url);
  status.textContent = `Downloaded ${metadata.filename}. Nothing was sent to a server.`;
}

function printLetter() {
  window.print();
  status.textContent = 'Opened the browser print dialog. Nothing was sent to a server.';
}

populateSelect(organisationSelect, Object.entries(organisationTypes), (profile) => profile.label);
populateSelect(requestTypeSelect, Object.entries(requestTypes), (requestType) => requestType.label);
populateSelect(issueSelect, Object.entries(issueGuidance), (_, value) => value[0].toUpperCase() + value.slice(1));
requestTypeSelect.value = 'reasonable-adjustment';
organisationSelect.value = 'university';
issueSelect.value = 'exams';
restoreDraft();

form.addEventListener('input', () => {
  update();
  saveDraft();
});
form.addEventListener('submit', (event) => {
  event.preventDefault();
  copyLetter();
});
copyButton.addEventListener('click', copyLetter);
downloadButton.addEventListener('click', downloadLetter);
printButton.addEventListener('click', printLetter);
resetButton.addEventListener('click', resetDraft);
localActionButton.addEventListener('click', copyLocalActionPack);
handoffButton.addEventListener('click', copyHandoffPack);

renderCurrentGuidance();
update();

initTheme('#theme-toggle');

const addToCalendarBtn = document.querySelector('#addToCalendar');
const checkToneBtn = document.querySelector('#checkTone');
const sendEvidenceBtn = document.querySelector('#sendEvidence');
const deadlineTracker = document.querySelector('#deadline-tracker');
const toneReport = document.querySelector('#tone-report');

function resolveDeadlineDate() {
  const sent = document.querySelector('#sentDate')?.value;
  if (!sent) return null;
  return addWorkingDays(sent, 20);
}

function renderDeadline() {
  if (!deadlineTracker) return;
  const due = resolveDeadlineDate();
  deadlineTracker.textContent = due
    ? `Estimated response-by date: ${due} (about 20 working days from the sent date).`
    : 'Add a sent date to estimate the response-by deadline.';
}

addToCalendarBtn?.addEventListener('click', () => {
  const due = resolveDeadlineDate();
  if (!due) {
    status.textContent = 'Add a sent date first to create a calendar reminder.';
    return;
  }
  const ics = createIcsEvent({
    title: 'Public-service response due',
    date: due,
    description: 'Follow up if no response has arrived by this date.',
    uid: `oauk-letter-${due}`
  });
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'response-deadline.ics';
  link.click();
  URL.revokeObjectURL(url);
  status.textContent = 'Calendar reminder downloaded. Nothing was sent to a server.';
});

checkToneBtn?.addEventListener('click', () => {
  const result = analyseReadability(preview.textContent || '');
  if (!toneReport) return;
  if (!result.wordCount) {
    toneReport.textContent = 'Write a letter first, then check plain English.';
    return;
  }
  const flagText = result.flags.length
    ? result.flags.map((f) => f.detail).join(' ')
    : 'No plain-English issues found.';
  toneReport.textContent = `Estimated reading age ${result.readingAge}. ${result.flags.length} flag(s). ${flagText}`;
});

sendEvidenceBtn?.addEventListener('click', () => {
  const raw = document.querySelector('#evidence')?.value || '';
  const items = raw.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
  const pack = createEvidencePack({ source: 'letter-generator', items });
  try {
    window.localStorage.setItem(EVIDENCE_HANDOFF_KEY, serializeEvidence(pack));
    status.textContent = `Saved ${pack.items.length} evidence item(s) locally for the directory.`;
  } catch {
    status.textContent = 'Could not save evidence locally in this browser.';
  }
});

renderDeadline();
form.addEventListener('input', renderDeadline);

const navToggle = document.querySelector('.nav-toggle');
const primaryNav = document.querySelector('#primary-nav');
navToggle?.addEventListener('click', () => {
  const open = navToggle.getAttribute('aria-expanded') !== 'true';
  navToggle.setAttribute('aria-expanded', String(open));
  primaryNav?.classList.toggle('is-open', open);
});
