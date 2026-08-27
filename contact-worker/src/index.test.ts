import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import worker, { buildEmail, type InquiryPayload } from './index.ts';

const origin = 'https://www.xaikorea.ai.kr';
const env = {
  TURNSTILE_SECRET_KEY: 'turnstile-secret',
  GOOGLE_OAUTH_CLIENT_ID: 'oauth-client-id.apps.googleusercontent.com',
  GOOGLE_OAUTH_CLIENT_SECRET: 'oauth-client-secret',
  GOOGLE_OAUTH_REFRESH_TOKEN: 'oauth-refresh-token',
  GMAIL_SENDER_ADDRESS: 'contact@xaikorea.ai.kr',
  CONTACT_RECIPIENT: 'contact@xaikorea.ai.kr',
  ALLOWED_ORIGINS: origin,
  TURNSTILE_EXPECTED_HOSTNAMES: 'www.xaikorea.ai.kr',
  TURNSTILE_ACTION: 'contact_form',
  MIN_FORM_FILL_MS: '3000',
  MAX_FORM_AGE_MS: '7200000',
};
const originalFetch = globalThis.fetch;

function decodeBase64Url(value: string): string {
  const normalized = value.replaceAll('-', '+').replaceAll('_', '/');
  const padding = '='.repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(`${normalized}${padding}`, 'base64').toString('utf8');
}

function validPayload(
  overrides: Partial<InquiryPayload> = {}
): InquiryPayload {
  return {
    name: '홍길동',
    company: '테스트 주식회사',
    email: 'hello@example.com',
    phone: '010-1234-5678',
    inquiryType: 'AI 업무 자동화',
    budget: '협의 필요',
    message: '현재 규정 검토 업무의 자동화를 문의드립니다.',
    language: 'ko',
    source: 'website-contact-form',
    companyWebsite: '',
    turnstileToken: 'valid-token',
    startedAt: Date.now() - 10_000,
    consent: true,
    ...overrides,
  };
}

function contactRequest(
  payload: InquiryPayload | Record<string, unknown> = validPayload(),
  requestOrigin = origin
): Request {
  return new Request('https://api.xaikorea.ai.kr/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: requestOrigin,
    },
    body: JSON.stringify(payload),
  });
}

afterEach(() => {
  globalThis.fetch = originalFetch;
});

void describe('contact worker', () => {
  void it('verifies Turnstile and sends the inquiry through Gmail API', async () => {
    const calls: Array<[RequestInfo | URL, RequestInit | undefined]> = [];
    const responses = [
      Response.json({
        success: true,
        hostname: 'www.xaikorea.ai.kr',
        action: 'contact_form',
        'error-codes': [],
      }),
      Response.json({ access_token: 'google-access-token' }, { status: 200 }),
      Response.json({ id: 'gmail_message_123' }, { status: 200 }),
    ];
    globalThis.fetch = (input, init) => {
      calls.push([input, init]);
      const response = responses.shift();
      assert.ok(response);
      return Promise.resolve(response);
    };

    const response = await worker.fetch(contactRequest(), env);
    const result = (await response.json()) as {
      success: boolean;
      inquiryId: string;
    };

    assert.equal(response.status, 200);
    assert.equal(result.success, true);
    assert.match(result.inquiryId, /^XAI-\d{8}-[A-F0-9]{6}$/);
    assert.equal(calls.length, 3);

    const tokenCall = calls[1];
    assert.ok(tokenCall);
    assert.equal(tokenCall[0], 'https://oauth2.googleapis.com/token');
    const tokenBody = tokenCall[1]?.body;
    if (!(tokenBody instanceof URLSearchParams)) {
      throw new TypeError('Expected Google token form body');
    }
    assert.equal(
      tokenBody.get('grant_type'),
      'refresh_token'
    );
    assert.equal(
      tokenBody.get('client_id'),
      'oauth-client-id.apps.googleusercontent.com'
    );
    assert.equal(tokenBody.get('client_secret'), 'oauth-client-secret');
    assert.equal(tokenBody.get('refresh_token'), 'oauth-refresh-token');

    const gmailCall = calls[2];
    assert.ok(gmailCall);
    assert.equal(
      gmailCall[0],
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/send'
    );
    assert.equal(
      (gmailCall[1]?.headers as Record<string, string>).Authorization,
      'Bearer google-access-token'
    );
    const gmailRawBody = gmailCall[1]?.body;
    if (typeof gmailRawBody !== 'string') {
      throw new TypeError('Expected a JSON string body for the Gmail request');
    }
    const gmailBody = JSON.parse(gmailRawBody) as {
      raw: string;
    };
    const rawMessage = decodeBase64Url(gmailBody.raw);
    assert.match(rawMessage, /Reply-To: hello@example\.com/);
    assert.match(rawMessage, /To: contact@xaikorea\.ai\.kr/);
    const plainTextPart = rawMessage.match(
      /Content-Type: text\/plain; charset="UTF-8"\r\nContent-Transfer-Encoding: base64\r\n\r\n([A-Za-z0-9+/=]+)\r\n/u
    );
    assert.ok(plainTextPart);
    const encodedPlainText = plainTextPart[1];
    assert.ok(encodedPlainText);
    const decodedPlainText = Buffer.from(encodedPlainText, 'base64').toString(
      'utf8'
    );
    assert.match(decodedPlainText, /현재 규정 검토 업무/);
  });

  void it('silently discards a honeypot submission without external calls', async () => {
    let callCount = 0;
    globalThis.fetch = () => {
      callCount += 1;
      return Promise.resolve(Response.json({}));
    };
    const response = await worker.fetch(
      contactRequest(validPayload({ companyWebsite: 'https://spam.example' })),
      env
    );
    const result = (await response.json()) as { success: boolean };

    assert.equal(response.status, 200);
    assert.equal(result.success, true);
    assert.equal(callCount, 0);
  });

  void it('rejects requests from an origin outside the allowlist', async () => {
    let callCount = 0;
    globalThis.fetch = () => {
      callCount += 1;
      return Promise.resolve(Response.json({}));
    };
    const response = await worker.fetch(
      contactRequest(validPayload(), 'https://attacker.example'),
      env
    );

    assert.equal(response.status, 403);
    assert.equal(response.headers.get('Access-Control-Allow-Origin'), null);
    assert.equal(callCount, 0);
  });

  void it('rejects a Turnstile response with a mismatched action', async () => {
    globalThis.fetch = () =>
      Promise.resolve(
        Response.json({
          success: true,
          hostname: 'www.xaikorea.ai.kr',
          action: 'login',
        })
      );

    const response = await worker.fetch(contactRequest(), env);
    const result = (await response.json()) as { code: string };

    assert.equal(response.status, 400);
    assert.equal(result.code, 'verification_failed');
  });

  void it('escapes user-controlled HTML in the email template', () => {
    const email = buildEmail(
      validPayload({
        name: '<script>alert(1)</script>',
        message: '<img src=x onerror=alert(1)>',
      }),
      'XAI-20260827-ABC123'
    );

    assert.doesNotMatch(email.html, /<script>/);
    assert.doesNotMatch(email.html, /<img/);
    assert.match(email.html, /&lt;script&gt;/);
  });
});
