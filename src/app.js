import {
  buildActionChecklist,
  buildExportMetadata,
  buildMailtoLink,
  buildResponsePlan,
  generateReasonableAdjustmentLetter,
  getOrganisationProfile,
  issueGuidance,
  organisationTypes,
  parseDraftState,
  serializeDraftState
} from './letter.js';

const form = document.querySelector('form');
const preview = document.querySelector('#preview');
const status = document.querySelector('#status');
const organisationSelect = document.querySelector('#organisationType');
const issueSelect = document.querySelector('#issueType');
const guidance = document.querySelector('#selected-guidance');
const copyButton = document.querySelector('#copyLetter');
const downloadButton = document.querySelector('#downloadLetter');
const printButton = document.querySelector('#printLetter');
const emailLink = document.querySelector('#emailLetter');
const resetButton = document.querySelector('#resetDraft');
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
  const profile = getOrganisationProfile(data.organisationType);
  const responsePlan = buildResponsePlan(data);
  guidance.innerHTML = '';

  const heading = document.createElement('h2');
  heading.textContent = `${profile.label} guidance`;
  const legal = document.createElement('p');
  legal.textContent = profile.legalContext;
  const examples = document.createElement('p');
  examples.textContent = `Useful detail to include: ${profile.examples.join(', ')}.`;
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
  preview.textContent = generateReasonableAdjustmentLetter(data);
  emailLink.href = buildMailtoLink({
    to: data.email,
    subject: `Reasonable adjustment request: ${data.issue || 'request'}`,
    body: preview.textContent
  });
  updateGuidance(data);
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
populateSelect(issueSelect, Object.entries(issueGuidance), (_, value) => value[0].toUpperCase() + value.slice(1));
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

update();
