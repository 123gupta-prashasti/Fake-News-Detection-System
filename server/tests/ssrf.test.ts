import { describe, it, expect } from 'vitest';
import { isPrivateOrReservedIP, validateSafeUrl } from '../services/urlExtractor.js';

describe('SSRF Protection Security Validator', () => {
  it('identifies loopback, private IPv4, and reserved address ranges', () => {
    expect(isPrivateOrReservedIP('127.0.0.1')).toBe(true);
    expect(isPrivateOrReservedIP('10.0.0.5')).toBe(true);
    expect(isPrivateOrReservedIP('192.168.1.1')).toBe(true);
    expect(isPrivateOrReservedIP('172.16.0.1')).toBe(true);
    expect(isPrivateOrReservedIP('172.31.255.255')).toBe(true);
    expect(isPrivateOrReservedIP('169.254.169.254')).toBe(true);
    expect(isPrivateOrReservedIP('::1')).toBe(true);

    // Public IPs should not be blocked
    expect(isPrivateOrReservedIP('8.8.8.8')).toBe(false);
    expect(isPrivateOrReservedIP('151.101.1.140')).toBe(false);
  });

  it('rejects forbidden schemes like file:// and ftp://', async () => {
    await expect(validateSafeUrl('file:///etc/passwd')).rejects.toThrow(/Forbidden protocol/);
    await expect(validateSafeUrl('ftp://example.com/test')).rejects.toThrow(/Forbidden protocol/);
  });

  it('rejects localhost hostnames', async () => {
    await expect(validateSafeUrl('http://localhost:8080/admin')).rejects.toThrow(/local network/);
  });
});
