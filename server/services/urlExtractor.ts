import dns from 'dns';
import { promisify } from 'util';
import http from 'http';
import https from 'https';
import { URL } from 'url';

const lookupAsync = promisify(dns.lookup);

export interface ExtractedArticle {
  url: string;
  title: string;
  author: string | null;
  publisher: string | null;
  publishDate: string | null;
  text: string;
  wordCount: number;
  domain: string;
}

/**
 * Checks if an IP is private, link-local, loopback, or reserved (SSRF protection).
 */
export function isPrivateOrReservedIP(ip: string): boolean {
  // IPv4 Loopback: 127.0.0.0/8
  if (ip.startsWith('127.')) return true;
  // 0.0.0.0
  if (ip === '0.0.0.0' || ip === '::' || ip === '::1') return true;
  // Private 10.0.0.0/8
  if (ip.startsWith('10.')) return true;
  // Private 172.16.0.0/12 (172.16.x.x - 172.31.x.x)
  const parts = ip.split('.').map(Number);
  if (parts.length === 4) {
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    // Private 192.168.0.0/16
    if (parts[0] === 192 && parts[1] === 168) return true;
    // Link-local / Cloud metadata: 169.254.0.0/16
    if (parts[0] === 169 && parts[1] === 254) return true;
    // Carrier-grade NAT: 100.64.0.0/10
    if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return true;
    // Broadcast: 255.255.255.255
    if (parts[0] === 255) return true;
  }
  // IPv6 link-local and unique local
  const lowerIp = ip.toLowerCase();
  if (lowerIp.startsWith('fe80:') || lowerIp.startsWith('fc00:') || lowerIp.startsWith('fd00:')) {
    return true;
  }
  return false;
}

/**
 * Validates a target URL against SSRF and unsafe schemes.
 */
export async function validateSafeUrl(urlString: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(urlString);
  } catch {
    throw new Error('Invalid URL format.');
  }

  // Enforce http / https only
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`Forbidden protocol '${parsed.protocol}'. Only HTTP and HTTPS are permitted.`);
  }

  const hostname = parsed.hostname.toLowerCase();

  // Disallow localhost and internal aliases
  if (hostname === 'localhost' || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    throw new Error('Access to local network hosts is strictly prohibited.');
  }

  // Resolve hostname to IP to prevent DNS rebinding
  try {
    const res = await lookupAsync(hostname);
    if (isPrivateOrReservedIP(res.address)) {
      throw new Error(`Target host resolved to restricted address (${res.address}). Access denied.`);
    }
  } catch (err: any) {
    if (err.message.includes('restricted address') || err.message.includes('Access denied')) {
      throw err;
    }
    throw new Error(`DNS lookup failed for hostname '${hostname}': ${err.message}`);
  }

  return parsed;
}

/**
 * Cleanly strips HTML tags, script, style, comments, and extracts article text.
 */
export function parseHtmlContent(html: string): {
  title: string;
  author: string | null;
  publisher: string | null;
  publishDate: string | null;
  text: string;
} {
  // Extract Title
  let title = '';
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    title = titleMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim();
  }

  // Extract Author
  let author: string | null = null;
  const authorMatch = html.match(/<meta\s+name=["']author["']\s+content=["']([^"']+)["']/i) ||
                      html.match(/<meta\s+property=["']article:author["']\s+content=["']([^"']+)["']/i);
  if (authorMatch) {
    author = authorMatch[1].trim();
  }

  // Extract Publisher / Site Name
  let publisher: string | null = null;
  const publisherMatch = html.match(/<meta\s+property=["']og:site_name["']\s+content=["']([^"']+)["']/i);
  if (publisherMatch) {
    publisher = publisherMatch[1].trim();
  }

  // Extract Published Date
  let publishDate: string | null = null;
  const dateMatch = html.match(/<meta\s+property=["']article:published_time["']\s+content=["']([^"']+)["']/i) ||
                    html.match(/<meta\s+name=["']pubdate["']\s+content=["']([^"']+)["']/i);
  if (dateMatch) {
    publishDate = dateMatch[1].trim();
  }

  // Remove scripts, styles, svg, header, footer, nav
  let clean = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');

  // Extract paragraphs or fallback to body content
  const paragraphMatches = clean.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
  let rawBody = '';

  if (paragraphMatches && paragraphMatches.length > 0) {
    rawBody = paragraphMatches
      .map(p => p.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
      .filter(p => p.length > 20)
      .join('\n\n');
  } else {
    rawBody = clean.replace(/<[^>]+>/g, ' ');
  }

  // Clean entities
  const text = rawBody
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return { title, author, publisher, publishDate, text };
}

/**
 * Fetch and extract text from a verified URL with SSRF protection, timeout, and redirect limit.
 */
export async function extractArticleFromUrl(urlString: string, redirectCount = 0): Promise<ExtractedArticle> {
  if (redirectCount > 3) {
    throw new Error('Too many redirects encountered while fetching article.');
  }

  const parsedUrl = await validateSafeUrl(urlString);

  return new Promise((resolve, reject) => {
    const isHttps = parsedUrl.protocol === 'https:';
    const client = isHttps ? https : http;

    const req = client.get(
      parsedUrl.toString(),
      {
        headers: {
          'User-Agent': 'NewsVerify-Academic-Research-Bot/1.0 (+https://newsverify.platform)',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        timeout: 8000,
      },
      async (res) => {
        // Handle Redirects safely
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          try {
            const redirectTarget = new URL(res.headers.location, parsedUrl.origin).toString();
            // Re-validate target URL
            const result = await extractArticleFromUrl(redirectTarget, redirectCount + 1);
            resolve(result);
            return;
          } catch (err) {
            reject(err);
            return;
          }
        }

        if (res.statusCode !== 200) {
          reject(new Error(`Failed to fetch article from remote server (HTTP status ${res.statusCode}).`));
          return;
        }

        const contentType = res.headers['content-type'] || '';
        if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
          reject(new Error(`Invalid content type '${contentType}'. Only HTML articles can be parsed.`));
          return;
        }

        let data = '';
        res.setEncoding('utf-8');
        res.on('data', (chunk) => {
          data += chunk;
          // Prevent downloading excessively huge payloads (> 5MB)
          if (data.length > 5 * 1024 * 1024) {
            res.destroy();
            reject(new Error('Article payload exceeds maximum allowed size (5MB).'));
          }
        });

        res.on('end', () => {
          try {
            const parsed = parseHtmlContent(data);
            const wordCount = parsed.text.split(/\s+/).filter(w => w.length > 0).length;

            if (wordCount < 10) {
              reject(new Error('Extracted article contains insufficient text content.'));
              return;
            }

            resolve({
              url: parsedUrl.toString(),
              domain: parsedUrl.hostname,
              title: parsed.title || parsedUrl.hostname,
              author: parsed.author,
              publisher: parsed.publisher || parsedUrl.hostname,
              publishDate: parsed.publishDate,
              text: parsed.text,
              wordCount
            });
          } catch (err: any) {
            reject(new Error(`HTML parsing error: ${err.message}`));
          }
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out after 8000ms while accessing remote host.'));
    });

    req.on('error', (err) => {
      reject(new Error(`Network error while fetching article: ${err.message}`));
    });
  });
}
