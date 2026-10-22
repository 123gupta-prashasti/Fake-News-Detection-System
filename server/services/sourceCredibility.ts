export interface SourceCredibilityAssessment {
  domain: string | null;
  publisher: string | null;
  author: string | null;
  publishDate: string | null;
  citationsFound: number;
  hasByline: boolean;
  hasTimestamp: boolean;
  domainCategory: 'established_journalism' | 'academic_or_gov' | 'independent_or_blog' | 'unknown' | 'unspecified';
  credibilityScore: number; // 0 - 100
  factors: {
    factor: string;
    status: 'positive' | 'negative' | 'neutral' | 'unverified';
    impact: string;
  }[];
  verdict: 'High Credibility' | 'Moderate Credibility' | 'Unverified / Unknown' | 'Low Credibility';
  summary: string;
}

const ESTABLISHED_NEWS = new Set([
  'reuters.com', 'apnews.com', 'bbc.com', 'bbc.co.uk', 'nytimes.com',
  'washingtonpost.com', 'theguardian.com', 'wsj.com', 'bloomberg.com',
  'nature.com', 'sciencemag.org', 'economist.com', 'ft.com', 'npr.org',
  'pbs.org', 'afp.com', 'who.int', 'cdc.gov', 'nih.gov', 'nasa.gov',
  'esa.int', 'bls.gov', 'census.gov', 'federalreserve.gov'
]);

export function assessSourceCredibility(metadata: {
  url?: string | null;
  domain?: string | null;
  publisher?: string | null;
  author?: string | null;
  publishDate?: string | null;
  text?: string;
}): SourceCredibilityAssessment {
  const { url, publisher, author, publishDate, text = '' } = metadata;
  let domain = metadata.domain || null;

  if (url && !domain) {
    try {
      domain = new URL(url).hostname.replace(/^www\./, '');
    } catch {
      domain = null;
    }
  }

  const factors: SourceCredibilityAssessment['factors'] = [];
  let score = 50; // Baseline neutral score

  // 1. Domain & TLD assessment (without assuming HTTPS equals truth)
  let domainCategory: SourceCredibilityAssessment['domainCategory'] = 'unknown';

  if (!domain) {
    factors.push({
      factor: 'Source Origin / Domain',
      status: 'neutral',
      impact: 'No URL or domain provided (pasted text). Evaluation focuses on textual and stylistic signals rather than assuming malicious origin.'
    });
    domainCategory = 'unspecified';
  } else {
    const isGovOrEdu = domain.endsWith('.gov') || domain.endsWith('.edu') || domain.endsWith('.mil');
    const isEstablished = ESTABLISHED_NEWS.has(domain.toLowerCase());

    if (isGovOrEdu) {
      domainCategory = 'academic_or_gov';
      score += 25;
      factors.push({
        factor: 'Domain Governance',
        status: 'positive',
        impact: `Hosted on restricted educational/governmental registry (.${domain.split('.').pop()}). Subject to institutional vetting.`
      });
    } else if (isEstablished) {
      domainCategory = 'established_journalism';
      score += 25;
      factors.push({
        factor: 'Editorial Track Record',
        status: 'positive',
        impact: `Domain (${domain}) corresponds to an established news agency or institutional publisher with published editorial correction policies.`
      });
    } else {
      domainCategory = 'independent_or_blog';
      factors.push({
        factor: 'Publisher Registry',
        status: 'neutral',
        impact: `Domain (${domain}) is an open-registration publisher or blog platform. Requires independent corroboration; absence of legacy wire record is not proof of falsity.`
      });
    }
  }

  // 2. Author byline audit
  const hasByline = Boolean(author && author.trim().length > 2);
  if (hasByline) {
    score += 10;
    factors.push({
      factor: 'Author Attribution',
      status: 'positive',
      impact: `Named journalist/author identified ("${author}"). Demonstrates accountability.`
    });
  } else {
    factors.push({
      factor: 'Author Attribution',
      status: 'unverified',
      impact: 'Author metadata unavailable. Note: Unavailable bylines are common in wire reports and aggregated feeds, and should not be treated as affirmative deception.'
    });
  }

  // 3. Publication timestamp audit
  const hasTimestamp = Boolean(publishDate && publishDate.trim().length > 4);
  if (hasTimestamp) {
    score += 10;
    factors.push({
      factor: 'Publication Timestamp',
      status: 'positive',
      impact: `Article carries an explicit publication timestamp ("${publishDate}"). Enables temporal verification.`
    });
  } else {
    factors.push({
      factor: 'Publication Timestamp',
      status: 'unverified',
      impact: 'Timestamp metadata unavailable. Content cannot be immediately pinned to a specific news cycle.'
    });
  }

  // 4. Citation and Attribution analysis in text
  const citationMatches = text.match(/\b(according to|cited by|published in|spokesperson for|court documents|study by|press release)\b/gi) || [];
  const citationsFound = citationMatches.length;

  if (citationsFound >= 3) {
    score += 15;
    factors.push({
      factor: 'External Citations',
      status: 'positive',
      impact: `Found ${citationsFound} internal attribution markers (e.g. "according to", "study by"), indicating multi-sourced reporting.`
    });
  } else if (citationsFound === 0) {
    score -= 10;
    factors.push({
      factor: 'External Citations',
      status: 'negative',
      impact: 'No standard external journalistic attribution markers detected in the analyzed passage.'
    });
  } else {
    factors.push({
      factor: 'External Citations',
      status: 'neutral',
      impact: `Detected ${citationsFound} source attribution phrases.`
    });
  }

  // Clamp score
  const finalScore = Math.max(10, Math.min(95, score));

  let verdict: SourceCredibilityAssessment['verdict'];
  let summary = '';

  if (finalScore >= 75) {
    verdict = 'High Credibility';
    summary = 'Source demonstrates strong editorial transparency, named attributions, and recognized domain or institutional pedigree.';
  } else if (finalScore >= 50) {
    verdict = 'Moderate Credibility';
    summary = 'Source carries standard attribution with partial metadata; cross-verification of core claims recommended.';
  } else if (domainCategory === 'unspecified') {
    verdict = 'Unverified / Unknown';
    summary = 'Source metadata is unavailable (direct text analysis). Credibility relies primarily on factual and linguistic indicators.';
  } else {
    verdict = 'Low Credibility';
    summary = 'Limited attribution, absent author metadata, and no corroborating citations detected.';
  }

  return {
    domain,
    publisher: publisher || null,
    author: author || null,
    publishDate: publishDate || null,
    citationsFound,
    hasByline,
    hasTimestamp,
    domainCategory,
    credibilityScore: finalScore,
    factors,
    verdict,
    summary
  };
}
