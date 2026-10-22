import { describe, it, expect } from 'vitest';
import { verifySingleClaimStandalone } from '../services/evidenceRetriever.js';

describe('Claim Verification Pipeline Benchmark Cases', () => {
  it('correctly classifies Apollo 11 Mars claim as Contradicted', async () => {
    const claim = 'The Apollo 11 mission landed humans on Mars in 1969.';
    const result = await verifySingleClaimStandalone(claim);
    expect(result.verdict).toBe('Contradicted');
    expect(result.confidence).toBeGreaterThanOrEqual(80);
    expect(result.conflictingDetails).toBeDefined();
    expect(result.conflictingDetails).toContain('Mars');
    expect(result.evidence).toBeDefined();
  }, 10000);

  it('correctly classifies India independence claim as Supported', async () => {
    const claim = 'India became independent on 15 August 1947.';
    const result = await verifySingleClaimStandalone(claim);
    expect(result.verdict).toBe('Supported');
    expect(result.confidence).toBeGreaterThanOrEqual(80);
    expect(result.explanation).toContain('15 August 1947');
    expect(result.evidence).toBeDefined();
  }, 10000);

  it('correctly classifies Earth largest planet claim as Contradicted', async () => {
    const claim = 'The Earth is the largest planet in the Solar System.';
    const result = await verifySingleClaimStandalone(claim);
    expect(result.verdict).toBe('Contradicted');
    expect(result.confidence).toBeGreaterThanOrEqual(80);
    expect(result.conflictingDetails).toContain('Jupiter');
  }, 10000);

  it('correctly classifies Moon star claim as Contradicted', async () => {
    const claim = 'The Moon is a star that produces its own light.';
    const result = await verifySingleClaimStandalone(claim);
    expect(result.verdict).toBe('Contradicted');
    expect(result.confidence).toBeGreaterThanOrEqual(80);
    expect(result.conflictingDetails).toContain('satellite');
  }, 10000);

  it('correctly classifies fictitious BlueNova claim as Insufficient Evidence', async () => {
    const claim = 'A company named BlueNova Technologies will launch a new smartphone on 18 December 2026.';
    const result = await verifySingleClaimStandalone(claim);
    expect(result.verdict).toBe('Insufficient Evidence');
    expect(result.explanation).toBeDefined();
  }, 10000);
});
