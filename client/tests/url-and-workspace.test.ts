import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeApiBaseUrl, sanitizeRedirectPath } from '../src/utils/apiUrl.ts';

test('normalizeApiBaseUrl appends /api when omitted from backend URL', () => {
  assert.equal(
    normalizeApiBaseUrl('https://khaataledger-backend-v2.onrender.com'),
    'https://khaataledger-backend-v2.onrender.com/api',
  );
  assert.equal(
    normalizeApiBaseUrl('https://khaataledger-backend-v2.onrender.com/'),
    'https://khaataledger-backend-v2.onrender.com/api',
  );
});

test('normalizeApiBaseUrl preserves /api without duplicating when already provided', () => {
  assert.equal(
    normalizeApiBaseUrl('https://khaataledger-backend-v2.onrender.com/api'),
    'https://khaataledger-backend-v2.onrender.com/api',
  );
  assert.equal(
    normalizeApiBaseUrl('https://khaataledger-backend-v2.onrender.com/api/'),
    'https://khaataledger-backend-v2.onrender.com/api',
  );
});

test('normalizeApiBaseUrl uses fallback localhost URL when raw URL is empty or undefined', () => {
  assert.equal(normalizeApiBaseUrl(''), 'http://localhost:5000/api');
  assert.equal(normalizeApiBaseUrl(undefined), 'http://localhost:5000/api');
  assert.equal(normalizeApiBaseUrl('   '), 'http://localhost:5000/api');
});

test('request path normalization strips leading /api to prevent duplication', () => {
  const normalizeRequestPath = (url: string) => url.replace(/^\/?api\//, '/');

  assert.equal(normalizeRequestPath('/api/workspaces'), '/workspaces');
  assert.equal(normalizeRequestPath('api/workspaces'), '/workspaces');
  assert.equal(normalizeRequestPath('/workspaces'), '/workspaces');
  assert.equal(normalizeRequestPath('/auth/login/owner'), '/auth/login/owner');
  assert.equal(normalizeRequestPath('/api/auth/login/owner'), '/auth/login/owner');
});

test('safe redirect destination rejects external or protocol-relative URLs', () => {
  assert.equal(sanitizeRedirectPath('/workspaces'), '/workspaces');
  assert.equal(sanitizeRedirectPath('/workspaces/123/dashboard'), '/workspaces/123/dashboard');
  assert.equal(sanitizeRedirectPath('https://malicious.example.com'), '/workspaces');
  assert.equal(sanitizeRedirectPath('//malicious.example.com'), '/workspaces');
  assert.equal(sanitizeRedirectPath(null), '/workspaces');
  assert.equal(sanitizeRedirectPath(''), '/workspaces');
});
