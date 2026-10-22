import { describe, it, expect } from 'vitest';
import { predictNews, getModelConfig } from '../ml/inference.js';
import { cleanText, extractTokens } from '../ml/preprocessor.js';

describe('ML Preprocessor & Inference Pipeline', () => {
  it('correctly cleans text and removes URLs and punctuation', () => {
    const raw = 'SHOCKING: Visit https://fake-news.xyz/cure right now!!!';
    const cleaned = cleanText(raw);
    expect(cleaned).not.toContain('https');
    expect(cleaned).not.toContain('!');
    expect(cleaned).toContain('shocking');
  });

  it('extracts unigrams and bigrams excluding stop words', () => {
    const tokens = extractTokens('The secret government underground facility leaked bioweapons');
    expect(tokens).toContain('secret');
    expect(tokens).toContain('government');
    expect(tokens).toContain('secret_government');
    expect(tokens).not.toContain('the');
  });

  it('loads the pre-trained model vocabulary and coefficients', () => {
    const config = getModelConfig();
    expect(config.vocabulary).toBeDefined();
    expect(Object.keys(config.vocabulary).length).toBeGreaterThan(50);
    expect(config.thresholds).toBeDefined();
  });

  it('classifies blatant fake news with high fake probability', () => {
    const fakeText = 'SHOCKING BOMBSHELL: Secret underground bioweapons poison water supply cures cancer in 48 hours!';
    const result = predictNews(fakeText);
    expect(result.probabilityFake).toBeGreaterThan(0.65);
    expect(result.prediction).toBe('Likely Fake');
    expect(result.topFakeTokens.length).toBeGreaterThan(0);
  });

  it('classifies authentic journalistic reports with low fake probability', () => {
    const realText = 'The Department of Labor reported that nonfarm payroll employment rose by 216,000 in December according to official statistics.';
    const result = predictNews(realText);
    expect(result.probabilityFake).toBeLessThan(0.35);
    expect(result.prediction).toBe('Likely Real');
    expect(result.topRealTokens.length).toBeGreaterThan(0);
  });
});
