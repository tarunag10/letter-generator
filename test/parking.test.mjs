import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getParkingRequestTypes,
  generateParkingLetter,
  getParkingOrganisationTypes,
  getParkingEvidenceRequirements,
  getParkingDeadlines,
  createParkingHandoffPack,
  serializeParkingDraft,
  parseParkingDraft,
  getParkingOperators,
  getAppealDeadlines,
  generateAppealText,
  getGroundsOfAppeal,
  getTribunalRoute,
  checkNoticeValidity,
  serializeParking,
  parseParking,
} from '../src/parking.js';

describe('getParkingRequestTypes', () => {
  it('returns parking-appeal request type', () => {
    const types = getParkingRequestTypes();
    assert.ok(types['parking-appeal']);
    assert.equal(types['parking-appeal'].label, 'Parking appeal');
    assert.equal(types['parking-appeal'].sourceId, 'govuk-parking-penalty-notice');
  });

  it('has response window', () => {
    const types = getParkingRequestTypes();
    assert.ok(types['parking-appeal'].responseWindow);
  });
});

describe('generateParkingLetter', () => {
  it('returns letter with required fields', () => {
    const letter = generateParkingLetter({
      operatorType: 'council',
      pcnNumber: 'PCN123456',
      noticeDate: '2026-06-15',
      dateOfViolation: '2026-06-01',
      grounds: 'No signage',
      evidence: 'Photos attached',
      name: 'J. Smith',
      contact: 'email at j.smith@example.com'
    });
    assert.ok(letter.includes('PCN123456'));
    assert.ok(letter.includes('2026-06-01'));
    assert.ok(letter.includes('No signage'));
    assert.ok(letter.includes('Photos attached'));
    assert.ok(letter.includes('J. Smith'));
    assert.ok(letter.includes('Yours faithfully'));
  });

  it('uses defaults for missing fields', () => {
    const letter = generateParkingLetter({});
    assert.ok(letter.includes('Sir or Madam'));
    assert.ok(letter.includes('Your name'));
    assert.ok(letter.includes('28 days'));
  });

  it('includes additional grounds when provided', () => {
    const letter = generateParkingLetter({
      grounds: 'No signage',
      additionalGrounds: 'Procedural errors by the operator'
    });
    assert.ok(letter.includes('Additional grounds: Procedural errors by the operator'));
  });

  it('omits additional grounds section when empty', () => {
    const letter = generateParkingLetter({
      grounds: 'No signage',
      additionalGrounds: ''
    });
    assert.ok(!letter.includes('Additional grounds:'));
  });
});

describe('getParkingOrganisationTypes', () => {
  it('returns council and private types', () => {
    const types = getParkingOrganisationTypes();
    assert.ok(types.council);
    assert.ok(types.private);
    assert.equal(types.council.label, 'Local Council');
    assert.equal(types.private.label, 'Private parking operator');
  });

  it('council is tribunal eligible', () => {
    const types = getParkingOrganisationTypes();
    assert.equal(types.council.tribunalEligible, true);
    assert.equal(types.private.tribunalEligible, false);
  });
});

describe('getParkingEvidenceRequirements', () => {
  it('returns council-specific evidence', () => {
    const items = getParkingEvidenceRequirements('council');
    assert.ok(Array.isArray(items));
    assert.ok(items.length > 0);
    assert.ok(items.some((i) => i.includes('PCN')));
    assert.ok(items.some((i) => i.includes('council')));
  });

  it('returns private-specific evidence', () => {
    const items = getParkingEvidenceRequirements('private');
    assert.ok(Array.isArray(items));
    assert.ok(items.length > 0);
    assert.ok(items.some((i) => i.includes('Parking Charge Notice')));
  });

  it('falls back to private for unknown type', () => {
    const items = getParkingEvidenceRequirements('unknown');
    assert.ok(items.some((i) => i.includes('Parking Charge Notice')));
  });
});

describe('getParkingDeadlines', () => {
  it('council returns 28 day appeal deadline', () => {
    const result = getParkingDeadlines('council', '2026-06-01');
    assert.equal(result.formalAppealDays, 28);
    assert.equal(result.tribunalDays, 28);
    assert.equal(result.tribunalEligible, true);
    assert.equal(result.targetDate, '2026-06-29');
  });

  it('private returns 28 day appeal deadline with no tribunal', () => {
    const result = getParkingDeadlines('private', '2026-06-01');
    assert.equal(result.formalAppealDays, 28);
    assert.equal(result.tribunalDays, null);
    assert.equal(result.tribunalEligible, false);
  });

  it('returns default message when no notice date', () => {
    const result = getParkingDeadlines('council', '');
    assert.equal(result.formalAppealDays, null);
    assert.ok(result.targetDateDisplay.includes('Set a notice date'));
  });
});

describe('createParkingHandoffPack', () => {
  it('returns pack with required fields', () => {
    const pack = createParkingHandoffPack({
      operatorType: 'council',
      pcnNumber: 'PCN123456',
      noticeDate: '2026-06-01',
      grounds: 'No signage'
    });
    assert.ok(pack.title);
    assert.ok(pack.contextLabel);
    assert.ok(pack.targetDateDisplay);
    assert.ok(Array.isArray(pack.evidence));
    assert.ok(Array.isArray(pack.safety));
    assert.ok(Array.isArray(pack.escalation));
    assert.ok(pack.markdown.includes('Parking appeal handoff pack'));
    assert.ok(pack.markdown.includes('PCN123456'));
  });

  it('escalation differs by operator type', () => {
    const councilPack = createParkingHandoffPack({ operatorType: 'council', noticeDate: '2026-06-01' });
    const privatePack = createParkingHandoffPack({ operatorType: 'private', noticeDate: '2026-06-01' });
    assert.ok(councilPack.escalation.some((e) => e.includes('Traffic Penalty Tribunal')));
    assert.ok(privatePack.escalation.some((e) => e.includes('POPLA')));
  });
});

describe('serializeParkingDraft / parseParkingDraft', () => {
  it('round-trips a draft with valid fields', () => {
    const draft = {
      operatorId: 'council',
      pcnNumber: 'PCN123456',
      name: 'Test User'
    };
    const serialized = serializeParkingDraft(draft);
    const parsed = parseParkingDraft(serialized);
    assert.equal(parsed.operatorId, 'council');
    assert.equal(parsed.pcnNumber, 'PCN123456');
    assert.equal(parsed.name, 'Test User');
  });

  it('strips unknown fields', () => {
    const draft = { operatorId: 'council', unknownField: 'value' };
    const serialized = serializeParkingDraft(draft);
    const parsed = parseParkingDraft(serialized);
    assert.equal(parsed.operatorId, 'council');
    assert.equal(parsed.unknownField, undefined);
  });

  it('returns empty object for invalid JSON', () => {
    const parsed = parseParkingDraft('not valid json');
    assert.deepEqual(parsed, {});
  });

  it('returns empty object for null input', () => {
    const parsed = parseParkingDraft(null);
    assert.deepEqual(parsed, {});
  });

  it('returns empty object for array input', () => {
    const parsed = parseParkingDraft('[]');
    assert.deepEqual(parsed, {});
  });
});

describe('re-exported shared functions', () => {
  it('getParkingOperators returns operators', () => {
    const operators = getParkingOperators();
    assert.ok(operators.length > 0);
    assert.ok(operators.some((o) => o.id === 'council'));
  });

  it('getAppealDeadlines returns deadlines for council', () => {
    const d = getAppealDeadlines('council');
    assert.equal(d.formalAppealDays, 28);
  });

  it('generateAppealText returns appeal text', () => {
    const text = generateAppealText({
      operatorType: 'council',
      penaltyNoticeNumber: 'PCN123456',
      dateOfViolation: '2026-01-15',
      grounds: 'No signage',
      evidence: 'Photos'
    });
    assert.ok(text.includes('PCN123456'));
  });

  it('getGroundsOfAppeal returns grounds array', () => {
    const grounds = getGroundsOfAppeal();
    assert.ok(grounds.length > 0);
    assert.ok(grounds.includes('No signage'));
  });

  it('getTribunalRoute returns boolean', () => {
    assert.equal(getTribunalRoute('council'), true);
    assert.equal(getTribunalRoute('parking-ey'), false);
  });

  it('checkNoticeValidity validates PCN', () => {
    const recent = new Date();
    recent.setDate(recent.getDate() - 10);
    const result = checkNoticeValidity({
      noticeDate: recent.toISOString().split('T')[0],
      pcnNumber: 'PCN123456'
    });
    assert.equal(result.valid, true);
  });

  it('serializeParking / parseParking round-trip', () => {
    const data = { test: 'value' };
    const serialized = serializeParking(data);
    const parsed = parseParking(serialized);
    assert.deepEqual(parsed, data);
  });
});
