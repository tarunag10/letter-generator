import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getProtocolRequestTypes,
  generateProtocolLetter,
  getProtocolTypes,
  getProtocolEvidenceRequirements,
  getProtocolDeadlines,
  createProtocolHandoffPack,
  serializeProtocolDraft,
  parseProtocolDraft,
  generateLetterOfClaim,
  getResponseDeadline,
  getComplianceChecklist,
  generateADROffer,
  serializeProtocols,
  parseProtocols,
} from '../src/protocols.js';

describe('getProtocolRequestTypes', () => {
  it('returns pre-action-protocol request type', () => {
    const types = getProtocolRequestTypes();
    assert.ok(types['pre-action-protocol']);
    assert.equal(types['pre-action-protocol'].label, 'Pre-Action Protocol');
    assert.equal(types['pre-action-protocol'].sourceId, 'cpr-practice-direction-pre-action');
  });

  it('has response window', () => {
    const types = getProtocolRequestTypes();
    assert.ok(types['pre-action-protocol'].responseWindow);
  });
});

describe('generateProtocolLetter', () => {
  it('returns letter with required fields', () => {
    const letter = generateProtocolLetter({
      protocolType: 'debt',
      claimantName: 'A. Claimant',
      defendantName: 'B. Defendant',
      defendantAddress: '1 Test Road, London',
      summaryOfFacts: 'The defendant owed money under a contract.',
      lossAndDamage: 'Damages of £5,000.',
      evidence: 'Invoice and correspondence',
      adrProposal: 'Mediation',
      statementOfTruth: 'I believe the facts are true.',
      name: 'A. Claimant',
      contact: 'email at a.claimant@example.com'
    });
    assert.ok(letter.includes('Letter of Claim under'));
    assert.ok(letter.includes('A. Claimant'));
    assert.ok(letter.includes('B. Defendant'));
    assert.ok(letter.includes('1 Test Road, London'));
    assert.ok(letter.includes('defendant owed money'));
    assert.ok(letter.includes('£5,000'));
    assert.ok(letter.includes('Invoice and correspondence'));
    assert.ok(letter.includes('Mediation'));
    assert.ok(letter.includes('Yours faithfully'));
  });

  it('uses defaults for missing fields', () => {
    const letter = generateProtocolLetter({});
    assert.ok(letter.includes('Your name'));
    assert.ok(letter.includes('Defendant name'));
    assert.ok(letter.includes('Defendant address'));
    assert.ok(letter.includes('Summary of the facts'));
    assert.ok(letter.includes('Description of loss and damage'));
    assert.ok(letter.includes('List of evidence supporting the claim'));
  });

  it('handles multi-line evidence', () => {
    const letter = generateProtocolLetter({
      evidence: 'Invoice\nCorrespondence\nPhotographs'
    });
    assert.ok(letter.includes('- Invoice'));
    assert.ok(letter.includes('- Correspondence'));
    assert.ok(letter.includes('- Photographs'));
  });
});

describe('getProtocolTypes', () => {
  it('returns array of protocol types', () => {
    const types = getProtocolTypes();
    assert.ok(Array.isArray(types));
    assert.ok(types.length > 0);
  });

  it('includes housing-disrepair', () => {
    const types = getProtocolTypes();
    assert.ok(types.some((t) => t.id === 'housing-disrepair'));
  });

  it('includes debt', () => {
    const types = getProtocolTypes();
    assert.ok(types.some((t) => t.id === 'debt'));
  });

  it('includes personal-injury', () => {
    const types = getProtocolTypes();
    assert.ok(types.some((t) => t.id === 'personal-injury'));
  });

  it('includes professional-negligence', () => {
    const types = getProtocolTypes();
    assert.ok(types.some((t) => t.id === 'professional-negligence'));
  });
});

describe('getProtocolEvidenceRequirements', () => {
  it('returns checklist for debt', () => {
    const items = getProtocolEvidenceRequirements('debt');
    assert.ok(Array.isArray(items));
    assert.ok(items.length > 0);
    assert.ok(items.some((i) => i.includes('Check compliance')));
  });

  it('returns checklist for housing-disrepair', () => {
    const items = getProtocolEvidenceRequirements('housing-disrepair');
    assert.ok(Array.isArray(items));
    assert.ok(items.some((i) => i.includes('Housing Disrepair')));
  });

  it('returns default checklist for unknown type', () => {
    const items = getProtocolEvidenceRequirements('unknown');
    assert.ok(Array.isArray(items));
    assert.ok(items.length > 0);
    assert.ok(items.some((i) => i.includes('Summary of facts')));
  });
});

describe('getProtocolDeadlines', () => {
  it('debt returns 30 days', () => {
    const result = getProtocolDeadlines('debt');
    assert.equal(result.responseDays, 30);
    assert.ok(result.targetDateDisplay.includes('30'));
  });

  it('housing-disrepair returns 90 days', () => {
    const result = getProtocolDeadlines('housing-disrepair');
    assert.equal(result.responseDays, 90);
  });

  it('personal-injury returns 120 days', () => {
    const result = getProtocolDeadlines('personal-injury');
    assert.equal(result.responseDays, 120);
  });

  it('professional-negligence returns 90 days', () => {
    const result = getProtocolDeadlines('professional-negligence');
    assert.equal(result.responseDays, 90);
  });

  it('returns null for unknown type', () => {
    const result = getProtocolDeadlines('unknown');
    assert.equal(result.responseDays, null);
    assert.ok(result.targetDateDisplay.includes('Select a protocol'));
  });
});

describe('createProtocolHandoffPack', () => {
  it('returns pack with required fields', () => {
    const pack = createProtocolHandoffPack({
      protocolType: 'debt',
      claimantName: 'A. Claimant',
      defendantName: 'B. Defendant',
      defendantAddress: '1 Test Road',
      summaryOfFacts: 'Debt owed under contract',
      lossAndDamage: '£5,000 damages',
      evidence: 'Invoice',
      adrProposal: 'Mediation'
    });
    assert.ok(pack.title);
    assert.ok(pack.contextLabel);
    assert.ok(pack.targetDateDisplay);
    assert.ok(Array.isArray(pack.evidence));
    assert.ok(Array.isArray(pack.safety));
    assert.ok(Array.isArray(pack.escalation));
    assert.ok(pack.markdown.includes('Pre-Action Protocol handoff pack'));
    assert.ok(pack.markdown.includes('Debt'));
  });

  it('escalation includes court proceedings', () => {
    const pack = createProtocolHandoffPack({ protocolType: 'debt' });
    assert.ok(pack.escalation.some((e) => e.includes('court proceedings')));
  });
});

describe('serializeProtocolDraft / parseProtocolDraft', () => {
  it('round-trips a draft with valid fields', () => {
    const draft = {
      protocolType: 'debt',
      claimantName: 'Test User',
      defendantName: 'Defendant'
    };
    const serialized = serializeProtocolDraft(draft);
    const parsed = parseProtocolDraft(serialized);
    assert.equal(parsed.protocolType, 'debt');
    assert.equal(parsed.claimantName, 'Test User');
    assert.equal(parsed.defendantName, 'Defendant');
  });

  it('strips unknown fields', () => {
    const draft = { protocolType: 'debt', unknownField: 'value' };
    const serialized = serializeProtocolDraft(draft);
    const parsed = parseProtocolDraft(serialized);
    assert.equal(parsed.protocolType, 'debt');
    assert.equal(parsed.unknownField, undefined);
  });

  it('returns empty object for invalid JSON', () => {
    const parsed = parseProtocolDraft('not valid json');
    assert.deepEqual(parsed, {});
  });

  it('returns empty object for null input', () => {
    const parsed = parseProtocolDraft(null);
    assert.deepEqual(parsed, {});
  });

  it('returns empty object for array input', () => {
    const parsed = parseProtocolDraft('[]');
    assert.deepEqual(parsed, {});
  });
});

describe('re-exported shared functions', () => {
  it('generateLetterOfClaim returns letter text', () => {
    const text = generateLetterOfClaim({
      claimantName: 'Test',
      defendantName: 'Defendant',
      defendantAddress: '1 Road',
      protocolType: 'debt',
      summaryOfFacts: 'Facts',
      lossAndDamage: 'Damages',
      evidenceList: ['Evidence'],
      adrProposal: 'ADR',
      statementOfTruth: 'Truth'
    });
    assert.ok(text.includes('Test'));
    assert.ok(text.includes('Defendant'));
  });

  it('getResponseDeadline returns days', () => {
    assert.equal(getResponseDeadline('debt'), 30);
    assert.equal(getResponseDeadline('unknown'), null);
  });

  it('getComplianceChecklist returns checklist', () => {
    const checklist = getComplianceChecklist('debt');
    assert.ok(Array.isArray(checklist));
    assert.ok(checklist.length > 0);
  });

  it('generateADROffer returns ADR text', () => {
    const text = generateADROffer({
      proposalType: 'mediation',
      protocolType: 'debt',
      contactDetails: 'test@example.com'
    });
    assert.ok(text.includes('mediation'));
    assert.ok(text.includes('test@example.com'));
  });

  it('serializeProtocols / parseProtocols round-trip', () => {
    const data = ['debt', 'housing-disrepair'];
    const serialized = serializeProtocols(data);
    const parsed = parseProtocols(serialized);
    assert.deepEqual(parsed, data);
  });

  it('parseProtocols returns empty for invalid input', () => {
    assert.deepEqual(parseProtocols(null), []);
    assert.deepEqual(parseProtocols('not json'), []);
  });
});
