import { describe, it, expect, beforeEach } from 'vitest';
import { AnalysisRepo } from '../db/store.js';

describe('History Deletion & Persistence Operations', () => {
  const userIdA = 'usr_test_user_a';
  const userIdB = 'usr_test_user_b';

  beforeEach(async () => {
    await AnalysisRepo.clearAll(userIdA);
    await AnalysisRepo.clearAll(userIdB);
  });

  it('correctly creates and deletes an individual analysis record by id', async () => {
    const analysisA = await AnalysisRepo.create({
      userId: userIdA,
      userEmail: 'userA@test.com',
      inputHeadline: 'First Article Under Review',
      rawInputText: 'Sample test text content here.',
      extractedText: 'Sample test text content here.',
      inputType: 'text',
      prediction: 'Likely Real',
      modelConfidence: 88,
      overallRiskScore: 12,
      mlProbabilityFake: 0.12,
      featureContributions: [],
      linguisticIndicators: {} as any,
      sourceAssessment: {} as any,
      claims: [],
      riskScoreBreakdown: {} as any,
      verdictSummary: 'Verified factual article'
    });

    expect(analysisA._id).toBeDefined();

    const fetchedBefore = await AnalysisRepo.findById(analysisA._id);
    expect(fetchedBefore).not.toBeNull();
    expect(fetchedBefore?._id).toBe(analysisA._id);

    // Delete single record
    const deleted = await AnalysisRepo.deleteById(analysisA._id, userIdA);
    expect(deleted).toBe(true);

    const fetchedAfter = await AnalysisRepo.findById(analysisA._id);
    expect(fetchedAfter).toBeNull();
  });

  it('prevents an unauthorized user from deleting another user record', async () => {
    const analysisB = await AnalysisRepo.create({
      userId: userIdB,
      userEmail: 'userB@test.com',
      inputHeadline: 'Article Belonging to User B',
      rawInputText: 'Confidential article text.',
      extractedText: 'Confidential article text.',
      inputType: 'text',
      prediction: 'Suspicious / Needs Verification',
      modelConfidence: 65,
      overallRiskScore: 45,
      mlProbabilityFake: 0.45,
      featureContributions: [],
      linguisticIndicators: {} as any,
      sourceAssessment: {} as any,
      claims: [],
      riskScoreBreakdown: {} as any,
      verdictSummary: 'Needs review'
    });

    // User A tries to delete User B's record
    const deleted = await AnalysisRepo.deleteById(analysisB._id, userIdA);
    expect(deleted).toBe(false);

    // Record should still exist
    const stillExists = await AnalysisRepo.findById(analysisB._id);
    expect(stillExists).not.toBeNull();
  });

  it('clears all history records for a specific user without affecting other users', async () => {
    await AnalysisRepo.create({
      userId: userIdA,
      userEmail: 'userA@test.com',
      inputHeadline: 'User A Item 1',
      rawInputText: 'Text 1',
      extractedText: 'Text 1',
      inputType: 'text',
      prediction: 'Likely Real',
      modelConfidence: 80,
      overallRiskScore: 20,
      mlProbabilityFake: 0.2,
      featureContributions: [],
      linguisticIndicators: {} as any,
      sourceAssessment: {} as any,
      claims: [],
      riskScoreBreakdown: {} as any,
      verdictSummary: 'Summary 1'
    });

    await AnalysisRepo.create({
      userId: userIdA,
      userEmail: 'userA@test.com',
      inputHeadline: 'User A Item 2',
      rawInputText: 'Text 2',
      extractedText: 'Text 2',
      inputType: 'text',
      prediction: 'Likely Fake',
      modelConfidence: 90,
      overallRiskScore: 85,
      mlProbabilityFake: 0.85,
      featureContributions: [],
      linguisticIndicators: {} as any,
      sourceAssessment: {} as any,
      claims: [],
      riskScoreBreakdown: {} as any,
      verdictSummary: 'Summary 2'
    });

    await AnalysisRepo.create({
      userId: userIdB,
      userEmail: 'userB@test.com',
      inputHeadline: 'User B Item 1',
      rawInputText: 'Text B',
      extractedText: 'Text B',
      inputType: 'text',
      prediction: 'Likely Real',
      modelConfidence: 85,
      overallRiskScore: 15,
      mlProbabilityFake: 0.15,
      featureContributions: [],
      linguisticIndicators: {} as any,
      sourceAssessment: {} as any,
      claims: [],
      riskScoreBreakdown: {} as any,
      verdictSummary: 'Summary B'
    });

    const userABefore = await AnalysisRepo.findByUserId(userIdA);
    expect(userABefore.length).toBe(2);

    const userBBefore = await AnalysisRepo.findByUserId(userIdB);
    expect(userBBefore.length).toBe(1);

    // Clear all for user A
    const countCleared = await AnalysisRepo.clearAll(userIdA);
    expect(countCleared).toBe(2);

    const userAAfter = await AnalysisRepo.findByUserId(userIdA);
    expect(userAAfter.length).toBe(0);

    // User B's history is untouched
    const userBAfter = await AnalysisRepo.findByUserId(userIdB);
    expect(userBAfter.length).toBe(1);
  });
});
