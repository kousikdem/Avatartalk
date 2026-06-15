/**
 * Smoke test for the Vercel-side createRazorpayOrder retry wrapper.
 *
 * Loads /app/api/_lib/helpers.ts via ts-node-equivalent (we just
 * shell out to a tiny in-process esbuild) and exercises the retry
 * path with a fake `global.fetch` that returns 401 twice then 200.
 *
 * Run with: node /app/backend/tests/test_vercel_razorpay_retry.js
 *
 * (Run via the standalone script — not pytest — because this is
 * Node, not Python.)
 */
'use strict';

const path = require('path');
const Module = require('module');
const fs = require('fs');

// Stub the two heavy deps that aren't installed in the local repo.
// The retry logic doesn't need them at runtime.
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, ...rest) {
  if (request === '@vercel/node') {
    return path.join(__dirname, '__stub_vercel_node.js');
  }
  if (request === '@supabase/supabase-js') {
    return path.join(__dirname, '__stub_supabase.js');
  }
  return originalResolve.call(this, request, parent, ...rest);
};

fs.writeFileSync(
  path.join(__dirname, '__stub_vercel_node.js'),
  'module.exports = {};\n',
);
fs.writeFileSync(
  path.join(__dirname, '__stub_supabase.js'),
  'module.exports = { createClient: () => ({}) };\n',
);

// Transpile the .ts file to JS via esbuild (already a transitive dep
// of vite in /app/frontend/node_modules).
const esbuildPath = path.resolve(
  __dirname,
  '../../frontend/node_modules/esbuild',
);
const esbuild = require(esbuildPath);

const helpersSrc = fs.readFileSync(
  path.resolve(__dirname, '../../api/_lib/helpers.ts'),
  'utf8',
);
const out = esbuild.transformSync(helpersSrc, {
  loader: 'ts',
  format: 'cjs',
  target: 'node20',
});

const helpersJsPath = path.join(__dirname, '__helpers.compiled.cjs');
fs.writeFileSync(helpersJsPath, out.code);

// Set env required by the helper.
process.env.RAZORPAY_KEY_ID = 'rzp_test_dummy';
process.env.RAZORPAY_KEY_SECRET = 'dummy_secret';

const { createRazorpayOrder, verifyRazorpaySignature, verifyRazorpayWebhookSignature, createRazorpayPaymentLink } = require(helpersJsPath);

// Tiny assertion helper.
let passed = 0;
let failed = 0;
async function assert(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (e) {
    console.error(`  ✗ ${name}\n    ${e.message}`);
    failed++;
  }
}

function mockFetch(responses) {
  let i = 0;
  global.fetch = async () => {
    const r = responses[i++] || responses[responses.length - 1];
    return {
      ok: r.status >= 200 && r.status < 300,
      status: r.status,
      json: async () => r.body,
    };
  };
}

(async () => {
  console.log('createRazorpayOrder retry wrapper');

  await assert('happy path: 200 on first attempt', async () => {
    mockFetch([
      {
        status: 200,
        body: { id: 'order_OK1', amount: 1000, currency: 'INR', status: 'created' },
      },
    ]);
    const order = await createRazorpayOrder({
      amount: 1000,
      currency: 'INR',
      maxAttempts: 4,
    });
    if (order.id !== 'order_OK1') {
      throw new Error(`expected order_OK1, got ${order.id}`);
    }
  });

  await assert('retries on transient 401 then succeeds', async () => {
    mockFetch([
      {
        status: 401,
        body: { error: { description: 'Authentication failed' } },
      },
      {
        status: 401,
        body: { error: { description: 'Authentication failed' } },
      },
      {
        status: 200,
        body: { id: 'order_RETRY', amount: 1000, currency: 'INR', status: 'created' },
      },
    ]);
    const order = await createRazorpayOrder({
      amount: 1000,
      currency: 'INR',
      maxAttempts: 4,
    });
    if (order.id !== 'order_RETRY') {
      throw new Error(`expected order_RETRY, got ${order.id}`);
    }
  });

  await assert('does NOT retry on real validation 400', async () => {
    let calls = 0;
    global.fetch = async () => {
      calls++;
      return {
        ok: false,
        status: 400,
        json: async () => ({ error: { description: 'Amount must be at least 100' } }),
      };
    };
    try {
      await createRazorpayOrder({ amount: 1, currency: 'INR', maxAttempts: 4 });
      throw new Error('expected throw');
    } catch (e) {
      if (!/Amount must be at least 100/.test(e.message)) {
        throw new Error(`wrong error: ${e.message}`);
      }
      if (calls !== 1) {
        throw new Error(`expected 1 call, got ${calls}`);
      }
    }
  });

  await assert('gives up after maxAttempts on persistent 401', async () => {
    let calls = 0;
    global.fetch = async () => {
      calls++;
      return {
        ok: false,
        status: 401,
        json: async () => ({ error: { description: 'Authentication failed' } }),
      };
    };
    try {
      await createRazorpayOrder({ amount: 1000, currency: 'INR', maxAttempts: 3 });
      throw new Error('expected throw');
    } catch (e) {
      if (!/Authentication failed/.test(e.message)) {
        throw new Error(`wrong error: ${e.message}`);
      }
      if (calls !== 3) {
        throw new Error(`expected 3 calls, got ${calls}`);
      }
    }
  });

  await assert('retries on 5xx', async () => {
    mockFetch([
      { status: 503, body: { error: { description: 'temporarily unavailable' } } },
      {
        status: 200,
        body: { id: 'order_503', amount: 1000, currency: 'INR', status: 'created' },
      },
    ]);
    const order = await createRazorpayOrder({
      amount: 1000,
      currency: 'INR',
      maxAttempts: 4,
    });
    if (order.id !== 'order_503') {
      throw new Error(`expected order_503, got ${order.id}`);
    }
  });

  // ── HMAC verification parity with FastAPI ──
  // Compute the expected signature with Node's crypto, then verify
  // that the helper accepts it and rejects a tampered version.
  const crypto = require('crypto');
  const orderId = 'order_TESTORDER';
  const paymentId = 'pay_TESTPAYMENT';
  const validSig = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  await assert('verifyRazorpaySignature accepts a valid HMAC', async () => {
    if (!verifyRazorpaySignature(orderId, paymentId, validSig)) {
      throw new Error('valid signature was rejected');
    }
  });

  await assert('verifyRazorpaySignature rejects a tampered HMAC', async () => {
    const tampered = validSig.slice(0, -1) + (validSig.slice(-1) === '0' ? '1' : '0');
    if (verifyRazorpaySignature(orderId, paymentId, tampered)) {
      throw new Error('tampered signature was accepted');
    }
  });

  await assert('verifyRazorpaySignature rejects malformed hex', async () => {
    if (verifyRazorpaySignature(orderId, paymentId, 'not-hex')) {
      throw new Error('malformed signature was accepted');
    }
  });

  // ── Webhook signature parity ──
  process.env.RAZORPAY_WEBHOOK_SECRET = 'whsec_test_avatartalk_e2e';
  const rawBody = JSON.stringify({ event: 'payment.captured', payload: {} });
  const webhookSig = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  await assert('verifyRazorpayWebhookSignature accepts a valid HMAC', async () => {
    if (!verifyRazorpayWebhookSignature(rawBody, webhookSig)) {
      throw new Error('valid webhook signature was rejected');
    }
  });

  await assert('verifyRazorpayWebhookSignature rejects tampered body', async () => {
    if (verifyRazorpayWebhookSignature(rawBody + 'x', webhookSig)) {
      throw new Error('tampered body was accepted');
    }
  });

  await assert('verifyRazorpayWebhookSignature rejects when secret missing', async () => {
    const saved = process.env.RAZORPAY_WEBHOOK_SECRET;
    delete process.env.RAZORPAY_WEBHOOK_SECRET;
    try {
      if (verifyRazorpayWebhookSignature(rawBody, webhookSig)) {
        throw new Error('verification succeeded without secret');
      }
    } finally {
      process.env.RAZORPAY_WEBHOOK_SECRET = saved;
    }
  });

  // ── Payment link helper: retries on transient 401, validation surfaces immediately ──
  await assert('createRazorpayPaymentLink retries on transient 401 then succeeds', async () => {
    let attempts = 0;
    global.fetch = async () => {
      attempts++;
      if (attempts < 2) {
        return {
          ok: false,
          status: 401,
          json: async () => ({ error: { description: 'Authentication failed' } }),
        };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ id: 'plink_OK', short_url: 'https://rzp.io/i/test', status: 'created' }),
      };
    };
    const pl = await createRazorpayPaymentLink({ amount: 1000, currency: 'INR' });
    if (pl.id !== 'plink_OK') throw new Error(`got ${pl.id}`);
    if (attempts !== 2) throw new Error(`expected 2 attempts, got ${attempts}`);
  });

  await assert('createRazorpayPaymentLink does NOT retry on real 400', async () => {
    let attempts = 0;
    global.fetch = async () => {
      attempts++;
      return {
        ok: false,
        status: 400,
        json: async () => ({ error: { description: 'Amount must be at least 100' } }),
      };
    };
    try {
      await createRazorpayPaymentLink({ amount: 1, currency: 'INR' });
      throw new Error('expected throw');
    } catch (e) {
      if (!/Amount must be at least 100/.test(e.message)) {
        throw new Error(`wrong error: ${e.message}`);
      }
      if (attempts !== 1) throw new Error(`expected 1 attempt, got ${attempts}`);
    }
  });

  // Cleanup
  try { fs.unlinkSync(helpersJsPath); } catch {}
  try { fs.unlinkSync(path.join(__dirname, '__stub_vercel_node.js')); } catch {}
  try { fs.unlinkSync(path.join(__dirname, '__stub_supabase.js')); } catch {}

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
