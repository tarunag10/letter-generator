import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildActionChecklist,
  buildExportMetadata,
  buildMailtoLink,
  buildResponsePlan,
  formatDateForDisplay,
  parseDraftState,
  serializeDraftState,
  generateReasonableAdjustmentLetter,
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
    recipient: 'Access Team',
    organisationType: 'nhs',
    issueType: 'healthcare',
    issue: 'appointment letters',
    ignored: '<script>nope</script>'
  });

  assert.equal(typeof draft, 'string');
  assert.deepEqual(parseDraftState(draft), {
    recipient: 'Access Team',
    organisationType: 'nhs',
    issueType: 'healthcare',
    issue: 'appointment letters'
  });
  assert.deepEqual(parseDraftState('not json'), {});
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
