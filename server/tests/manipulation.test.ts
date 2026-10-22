import { describe, it, expect } from 'vitest';
import { analyzeLinguisticManipulation } from '../services/manipulationAnalyzer.js';

describe('Linguistic Manipulation Analyzer', () => {
  it('detects high sensationalism, clickbait, and excessive capitalization', () => {
    const manipulative = 'SHOCKING BOMBSHELL: Doctors hate this one weird trick! Miracle cure will blow your mind 100% proven!!!';
    const result = analyzeLinguisticManipulation(manipulative);

    expect(result.compositeManipulationScore).toBeGreaterThan(50);
    expect(result.detectedClickbaitPhrases.length).toBeGreaterThan(0);
    expect(result.detectedSensationalWords).toContain('shocking');
    expect(result.exclamationCount).toBeGreaterThan(2);
    expect(result.disclaimer).toContain('linguistic manipulation indicator');
  });

  it('reports low manipulation score for calm journalistic text', () => {
    const calm = 'The central bank maintained benchmark interest rates following a 0.2 percent decrease in consumer inflation according to government records.';
    const result = analyzeLinguisticManipulation(calm);

    expect(result.compositeManipulationScore).toBeLessThan(25);
    expect(result.detectedClickbaitPhrases).toHaveLength(0);
    expect(result.exclamationCount).toBe(0);
  });
});
