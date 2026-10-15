import assert from 'node:assert/strict';
import test from 'node:test';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { app } from '../src/app.js';
import { env } from '../src/config/env.js';

test('Express app configures trust proxy to 1 by default for Render topology', () => {
  assert.equal(env.TRUST_PROXY, 1);
  assert.equal(app.get('trust proxy'), 1);
});

test('trust proxy 1 correctly identifies client IP and ignores upstream spoofed IPs', async () => {
  const testApp = express();
  testApp.set('trust proxy', 1);
  testApp.get('/test-ip', (req, res) => {
    res.json({ ip: req.ip });
  });

  const server = testApp.listen(0);
  try {
    const address = server.address();
    const port = typeof address === 'object' && address ? address.port : 0;

    // Single proxy hop: Render appends client IP
    const singleHopRes = await fetch(`http://127.0.0.1:${port}/test-ip`, {
      headers: { 'x-forwarded-for': '203.0.113.50' },
    });
    const singleHopData = (await singleHopRes.json()) as { ip: string };
    assert.equal(singleHopData.ip, '203.0.113.50');

    // Spoofed header: client sent '198.51.100.99', Render appended real client '203.0.113.50'
    const spoofedRes = await fetch(`http://127.0.0.1:${port}/test-ip`, {
      headers: { 'x-forwarded-for': '198.51.100.99, 203.0.113.50' },
    });
    const spoofedData = (await spoofedRes.json()) as { ip: string };
    // With trust proxy: 1, Express trusts 1 hop and selects the rightmost client IP
    assert.equal(spoofedData.ip, '203.0.113.50');
  } finally {
    server.close();
  }
});

test('rate limiting behind proxy does not throw ERR_ERL_UNEXPECTED_X_FORWARDED_FOR', async () => {
  const testApp = express();
  testApp.set('trust proxy', 1);

  let caughtValidationError = false;
  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 2,
    skipSuccessfulRequests: true,
    handler: (_req, res) => res.status(429).json({ error: 'RATE_LIMITED' }),
  });

  testApp.use('/limited', limiter);
  testApp.post('/limited/login', (req, res) => {
    const { pass } = req.query;
    if (pass === 'correct') {
      res.status(200).json({ success: true });
    } else {
      res.status(401).json({ success: false });
    }
  });

  const server = testApp.listen(0);
  try {
    const address = server.address();
    const port = typeof address === 'object' && address ? address.port : 0;

    // Test that legitimate successful requests do not burn rate limit
    for (let i = 0; i < 5; i++) {
      const res = await fetch(`http://127.0.0.1:${port}/limited/login?pass=correct`, {
        method: 'POST',
        headers: { 'x-forwarded-for': '203.0.113.10' },
      });
      assert.equal(res.status, 200);
    }

    // Now send 2 failed requests from client 203.0.113.10 (max: 2)
    const fail1 = await fetch(`http://127.0.0.1:${port}/limited/login?pass=wrong`, {
      method: 'POST',
      headers: { 'x-forwarded-for': '203.0.113.10' },
    });
    assert.equal(fail1.status, 401);

    const fail2 = await fetch(`http://127.0.0.1:${port}/limited/login?pass=wrong`, {
      method: 'POST',
      headers: { 'x-forwarded-for': '203.0.113.10' },
    });
    assert.equal(fail2.status, 401);

    // 3rd failed request should be rate limited
    const fail3 = await fetch(`http://127.0.0.1:${port}/limited/login?pass=wrong`, {
      method: 'POST',
      headers: { 'x-forwarded-for': '203.0.113.10' },
    });
    assert.equal(fail3.status, 429);

    // Meanwhile, a different client IP (203.0.113.20) is unaffected and can still authenticate
    const otherClientRes = await fetch(`http://127.0.0.1:${port}/limited/login?pass=correct`, {
      method: 'POST',
      headers: { 'x-forwarded-for': '203.0.113.20' },
    });
    assert.equal(otherClientRes.status, 200);
  } finally {
    server.close();
  }
});
