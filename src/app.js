import { initTheme } from './theme.js';
import { createIcsEvent } from '../../shared/calendar/ics.mjs';
import { analyseReadability } from '../../shared/readability/index.mjs';
import {
  createEvidencePack,
  serializeEvidence,
  EVIDENCE_HANDOFF_KEY
} from '../../shared/evidence/index.mjs';
import { addWorkingDays } from '../../shared/deadlines/index.mjs';
import {
  buildActionChecklist,
  buildExportMetadata,
  buildLocalActionPack,
  buildLetterHandoffPack,
  buildMailtoLink,
  buildRequestTypePlan,
  buildResponsePlan,
  currentGuidance,
  generateRequestLetter,
  getOrganisationProfile,
  issueGuidance,
  organisationTypes,
  parseDraftState,
  requestTypes,
  serializeDraftState
} from './letter.js';

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
