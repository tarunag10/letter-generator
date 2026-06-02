import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildActionChecklist,
  buildExportMetadata,
  buildLocalActionPack,
  buildLetterHandoffPack,
  buildMailtoLink,
  buildRequestTypePlan,
  buildResponsePlan,
  currentGuidance,
  formatDateForDisplay,
  generateFOIRequest,
  generateRequestLetter,
  parseDraftState,
  serializeDraftState,
  generateComplaintFollowUp,
  generateReasonableAdjustmentLetter,
  generateSARRequest,
  organisationTypes
} from '../src/letter.js';

test('generates a reasonable adjustment letter with legal framing and requested support', () => {
  const text = generateReasonableAdjustmentLetter({
    recipient: 'Admissions Team',
    organisationType: 'university',
    issue: 'exam arrangements',
    name: 'A. Student',
    needs: 'extra time, rest breaks, and written instructions',
    contact: 'a.student@example.com'
  });
  assert.match(text, /Dear Admissions Team/);
  assert.match(text, /Equality Act 2010/);
  assert.match(text, /extra time, rest breaks, and written instructions/);
  assert.match(text, /A\. Student/);
});

test('covers the expected organisation types', () => {
  for (const type of ['employer', 'university', 'nhs', 'council', 'railway', 'bank', 'airline', 'exam-provider']) {
    assert.ok(organisationTypes[type], `missing ${type}`);
  }
});

test('adds issue-specific prompts and refusal questions', () => {
  const text = generateReasonableAdjustmentLetter({
    recipient: 'Customer Care',
    organisationType: 'airline',
    issueType: 'travel',
    issue: 'assistance for flight AB123',
    needs: 'assistance through security and careful handling of my wheelchair',
    impact: 'I cannot safely board without booked assistance.',
    deadline: '5 working days',
    name: 'T. Passenger',
    contact: 'email'
  });

  assert.match(text, /airport and airline assistance/);
  assert.match(text, /booking references/);
  assert.match(text, /If you do not agree/);
  assert.match(text, /5 working days/);
});

test('builds export metadata with a safe filename', () => {
  const metadata = buildExportMetadata({
    organisationType: 'exam-provider',
    issueType: 'exams',
    issue: 'GCSE English / access arrangements',
    name: 'A. Candidate'
  });

  assert.equal(metadata.mimeType, 'text/plain;charset=utf-8');
  assert.equal(metadata.filename, 'reasonable-adjustment-exam-provider-exams-gcse-english-access-arrangements.txt');
  assert.match(metadata.title, /Exam provider/);
});

test('builds an action checklist from organisation type and issue', () => {
  const checklist = buildActionChecklist({ organisationType: 'bank', issueType: 'banking' });

  assert.ok(checklist.includes('Remove full card numbers, passwords, PINs, security answers, and unnecessary medical detail before sending.'));
  assert.ok(checklist.includes('Ask the bank to mark the agreed adjustment on your account and confirm how deadlines or complaints are affected.'));
  assert.ok(checklist.includes('Keep copies of statements, complaint references, transaction dates, and the bank response.'));
  assert.ok(checklist.length >= 5);
});

test('serializes and restores local draft state safely', () => {
  const draft = serializeDraftState({
    requestType: 'foi',
    recipient: 'Access Team',
    organisationType: 'nhs',
    issueType: 'healthcare',
    issue: 'appointment letters',
    ignored: '<script>nope</script>'
  });

  assert.equal(typeof draft, 'string');
  assert.deepEqual(parseDraftState(draft), {
    requestType: 'foi',
    recipient: 'Access Team',
    organisationType: 'nhs',
    issueType: 'healthcare',
    issue: 'appointment letters'
  });
  assert.deepEqual(parseDraftState('not json'), {});
});

test('generates FOI requests with statutory timing guidance', () => {
  const text = generateFOIRequest({
    recipient: 'FOI Team',
    organisationName: 'Example Council',
    issue: 'Copies of housing repair policy documents from 2024 to 2026',
    needs: 'Please provide the documents by email.',
    name: 'A. Resident',
    contact: 'email'
  });

  assert.match(text, /Freedom of Information Act 2000/);
  assert.match(text, /Example Council/);
  assert.match(text, /housing repair policy/);
  assert.match(text, /statutory time limit/);
});

test('generates SAR requests with one month response wording', () => {
  const text = generateSARRequest({
    recipient: 'Data Protection Officer',
    organisationName: 'Example Bank',
    issue: 'personal data about complaint reference ABC123',
    evidence: 'Account ending 1234 and complaint reference ABC123.',
    name: 'T. Customer',
    contact: 'secure message'
  });

  assert.match(text, /Subject access request/);
  assert.match(text, /Example Bank/);
  assert.match(text, /identity verification/);
  assert.match(text, /within one month/);
});

test('generates complaint follow-up letters from the original sent date', () => {
  const text = generateComplaintFollowUp({
    recipient: 'Complaints Team',
    issue: 'my council complaint about missed repairs',
    sentDate: '2026-06-02',
    evidence: 'Reference REP-123',
    needs: 'Please provide the stage one response.',
    name: 'A. Tenant',
    contact: 'email'
  });

  assert.match(text, /Follow-up on previous request or complaint/);
  assert.match(text, /2 June 2026/);
  assert.match(text, /REP-123/);
  assert.match(text, /stage one response/);
});

test('routes request generation and response plans by request type', () => {
  const foi = generateRequestLetter({
    requestType: 'foi',
    issue: 'library service contracts'
  });
  const sarPlan = buildRequestTypePlan({
    requestType: 'sar',
    sentDate: '2026-06-02'
  });
  const metadata = buildExportMetadata({
    requestType: 'complaint-follow-up',
    issue: 'missed response'
  });

  assert.match(foi, /Freedom of Information request/);
  assert.equal(sarPlan.responseWindow, 'one month');
  assert.equal(sarPlan.targetDateDisplay, '2 July 2026');
  assert.equal(metadata.filename, 'complaint-follow-up-missed-response.txt');
});

test('builds a mailto link from generated letter content', () => {
  const letter = generateReasonableAdjustmentLetter({
    recipient: 'Support Team',
    organisationType: 'council',
    issue: 'accessible appointment',
    name: 'T. Resident'
  });
  const href = buildMailtoLink({
    to: 'support@example.gov.uk',
    subject: 'Reasonable adjustment request',
    body: letter
  });

  assert.match(href, /^mailto:support%40example\.gov\.uk\?/);
  assert.match(href, /subject=Reasonable%20adjustment%20request/);
  assert.match(href, /body=.*Equality%20Act%202010/);
});

test('builds a response plan from organisation, issue, and sent date', () => {
  const plan = buildResponsePlan({
    organisationType: 'exam-provider',
    issueType: 'exams',
    sentDate: '2026-06-01'
  });

  assert.equal(plan.windowLabel, '7 working days');
  assert.equal(plan.targetDate, '2026-06-10');
  assert.equal(plan.targetDateDisplay, '10 June 2026');
  assert.ok(plan.steps.some((step) => /evidence deadline/i.test(step)));
  assert.ok(plan.steps.some((step) => /written follow-up/i.test(step)));
  assert.match(plan.safetyNote, /informational planning aid/i);
});

test('uses date-safe helpers for invalid or weekend dates', () => {
  assert.equal(formatDateForDisplay('not-a-date'), 'No date set');
  assert.equal(
    buildResponsePlan({ organisationType: 'airline', issueType: 'travel', sentDate: '2026-06-06' }).targetDate,
    '2026-06-12'
  );
});

test('builds a copyable handoff pack with letter, plan, and checklist', () => {
  const pack = buildLetterHandoffPack({
    recipient: 'Access Team',
    organisationType: 'bank',
    issueType: 'banking',
    issue: 'statement format',
    sentDate: '2026-06-01',
    name: 'T. Customer'
  });

  assert.equal(pack.title, 'Reasonable adjustment handoff pack');
  assert.match(pack.markdown, /^# Reasonable adjustment handoff pack/m);
  assert.match(pack.markdown, /## Letter/);
  assert.match(pack.markdown, /Dear Access Team/);
  assert.match(pack.markdown, /Target follow-up date: 15 June 2026/);
  assert.match(pack.markdown, /Remove full card numbers/);
  assert.match(pack.markdown, /Current source notes/);
  assert.match(pack.markdown, /Nothing was sent to a server/);
});

test('builds a local action pack with practical evidence and safety steps', () => {
  const pack = buildLocalActionPack({
    organisationType: 'bank',
    issueType: 'banking',
    issue: 'accessible statement format',
    sentDate: '2026-06-01'
  });

  assert.equal(pack.title, 'Local action pack');
  assert.equal(pack.contextLabel, 'Bank or financial service - Banking');
  assert.equal(pack.targetDateDisplay, '15 June 2026');
  assert.ok(pack.evidence.some((item) => /complaint references/i.test(item)));
  assert.ok(pack.safety.some((item) => /PINs/i.test(item)));
  assert.ok(pack.nextSteps.some((item) => /written follow-up/i.test(item)));
  assert.ok(pack.escalation.some((item) => /Financial Ombudsman/i.test(item)));
  assert.match(pack.markdown, /^# Local action pack/m);
  assert.match(pack.markdown, /Accessible statement format/);
  assert.match(pack.markdown, /Nothing was sent to a server/);
});

test('exposes current source-backed public guidance', () => {
  assert.equal(currentGuidance.length, 4);
  assert.ok(currentGuidance.some((item) => item.title.includes('Equality Act')));
  assert.ok(currentGuidance.some((item) => item.detail.includes('one month')));
  assert.ok(currentGuidance.every((item) => item.url.startsWith('https://')));
});
