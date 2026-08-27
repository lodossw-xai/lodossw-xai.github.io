interface Env {
  TURNSTILE_SECRET_KEY: string;
  GOOGLE_OAUTH_CLIENT_ID: string;
  GOOGLE_OAUTH_CLIENT_SECRET: string;
  GOOGLE_OAUTH_REFRESH_TOKEN: string;
  GMAIL_SENDER_ADDRESS: string;
  CONTACT_RECIPIENT: string;
  ALLOWED_ORIGINS: string;
  TURNSTILE_EXPECTED_HOSTNAMES: string;
  TURNSTILE_ACTION?: string;
  MIN_FORM_FILL_MS?: string;
  MAX_FORM_AGE_MS?: string;
}

export type InquiryPayload = {
  name: string;
  company: string;
  email: string;
  phone: string;
  inquiryType: string;
  budget: string;
  message: string;
  language: 'ko' | 'en';
  source: string;
  companyWebsite: string;
  turnstileToken: string;
  startedAt: number;
  consent: true;
};

type TurnstileResult = {
  success: boolean;
  hostname?: string;
  action?: string;
  'error-codes'?: string[];
};

type GoogleTokenResult = {
  access_token?: string;
};

const SITEVERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GMAIL_SEND_URL =
  'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';
const MAX_BODY_BYTES = 24_000;
const DEFAULT_MIN_FORM_FILL_MS = 3_000;
const DEFAULT_MAX_FORM_AGE_MS = 2 * 60 * 60 * 1_000;

class PublicError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string) {
    super(code);
    this.status = status;
    this.code = code;
  }
}

function splitCsv(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parsePositiveNumber(
  value: string | undefined,
  fallback: number
): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getAllowedOrigin(request: Request, env: Env): string | undefined {
  const origin = request.headers.get('Origin') ?? '';
  return splitCsv(env.ALLOWED_ORIGINS).includes(origin) ? origin : undefined;
}

function corsHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  origin?: string
): Response {
  return Response.json(body, {
    status,
    headers: {
      ...(origin === undefined ? {} : corsHeaders(origin)),
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

function readString(
  value: unknown,
  field: string,
  min: number,
  max: number
): string {
  if (typeof value !== 'string') {
    throw new PublicError(400, `invalid_${field}`);
  }
  const normalized = value.trim();
  if (normalized.length < min || normalized.length > max) {
    throw new PublicError(400, `invalid_${field}`);
  }
  return normalized;
}

function readOptionalString(
  value: unknown,
  field: string,
  max: number
): string {
  if (value === undefined || value === null || value === '') {
    return '';
  }
  return readString(value, field, 0, max);
}

function parsePayload(value: unknown): InquiryPayload {
  if (typeof value !== 'object' || value === null) {
    throw new PublicError(400, 'invalid_request');
  }

  const body = value as Record<string, unknown>;
  const email = readString(body.email, 'email', 3, 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new PublicError(400, 'invalid_email');
  }

  const language = body.language === 'en' ? 'en' : 'ko';
  if (body.consent !== true) {
    throw new PublicError(400, 'consent_required');
  }
  if (typeof body.startedAt !== 'number' || !Number.isFinite(body.startedAt)) {
    throw new PublicError(400, 'invalid_started_at');
  }

  return {
    name: readString(body.name, 'name', 1, 80),
    company: readOptionalString(body.company, 'company', 120),
    email,
    phone: readOptionalString(body.phone, 'phone', 40),
    inquiryType: readOptionalString(body.inquiryType, 'inquiry_type', 80),
    budget: readOptionalString(body.budget, 'budget', 80),
    message: readString(body.message, 'message', 10, 5_000),
    language,
    source: readOptionalString(body.source, 'source', 200),
    companyWebsite: readOptionalString(
      body.companyWebsite,
      'company_website',
      300
    ),
    turnstileToken: readString(
      body.turnstileToken,
      'turnstile_token',
      1,
      2_048
    ),
    startedAt: body.startedAt,
    consent: true,
  };
}

function htmlEscape(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function createInquiryId(now = new Date()): string {
  const date = now.toISOString().slice(0, 10).replaceAll('-', '');
  const suffix = crypto.randomUUID().replaceAll('-', '').slice(0, 6).toUpperCase();
  return `XAI-${date}-${suffix}`;
}

async function verifyTurnstile(
  payload: InquiryPayload,
  request: Request,
  env: Env
): Promise<void> {
  if (!env.TURNSTILE_SECRET_KEY) {
    throw new PublicError(503, 'verification_unavailable');
  }

  const verificationBody = new FormData();
  verificationBody.set('secret', env.TURNSTILE_SECRET_KEY);
  verificationBody.set('response', payload.turnstileToken);
  verificationBody.set('idempotency_key', crypto.randomUUID());
  const remoteIp = request.headers.get('CF-Connecting-IP');
  if (remoteIp) {
    verificationBody.set('remoteip', remoteIp);
  }

  let response: Response;
  try {
    response = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      body: verificationBody,
      signal: AbortSignal.timeout(8_000),
    });
  } catch (error) {
    // eslint-disable-next-line no-console -- Keep a redacted diagnostic for transient Siteverify failures.
    console.error(
      'turnstile_siteverify_fetch_failed',
      error instanceof Error ? error.message : String(error)
    );
    throw new PublicError(503, 'verification_unavailable');
  }

  const result = (await response.json().catch(() => null)) as
    | TurnstileResult
    | null;
  if (!response.ok || result?.success !== true) {
    throw new PublicError(400, 'verification_failed');
  }

  const expectedAction = env.TURNSTILE_ACTION?.trim();
  if (expectedAction && result.action !== expectedAction) {
    throw new PublicError(400, 'verification_failed');
  }

  const expectedHostnames = splitCsv(env.TURNSTILE_EXPECTED_HOSTNAMES);
  if (
    expectedHostnames.length > 0 &&
    (result.hostname === undefined || !expectedHostnames.includes(result.hostname))
  ) {
    throw new PublicError(400, 'verification_failed');
  }
}

function emailField(label: string, value: string): string {
  const displayValue = value === '' ? '—' : htmlEscape(value);
  return `<tr><th style="padding:10px 14px;text-align:left;vertical-align:top;border-bottom:1px solid #e8e5df;color:#666;font-size:13px;width:140px">${label}</th><td style="padding:10px 14px;border-bottom:1px solid #e8e5df;color:#171717;font-size:14px">${displayValue}</td></tr>`;
}

function buildEmail(payload: InquiryPayload, inquiryId: string): {
  subject: string;
  html: string;
  text: string;
} {
  const receivedAt = new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'long',
    timeStyle: 'medium',
    timeZone: 'Asia/Seoul',
  }).format(new Date());
  const subjectArea = payload.inquiryType || '프로젝트 문의';
  const subject = `[${inquiryId}] ${subjectArea} · ${payload.name}`;
  const escapedMessage = htmlEscape(payload.message).replaceAll('\n', '<br />');

  const html = `<!doctype html><html lang="ko"><body style="margin:0;background:#f4f1eb;font-family:Arial,'Pretendard',sans-serif;color:#171717"><div style="max-width:680px;margin:0 auto;padding:32px 18px"><div style="background:#171717;color:#fff;padding:22px 24px"><strong style="font-size:20px">XAIKOREA 프로젝트 문의</strong><div style="margin-top:8px;color:#c9d87a;font-size:13px">${inquiryId}</div></div><table role="presentation" style="width:100%;border-collapse:collapse;background:#fff">${emailField('접수 시각', receivedAt)}${emailField('이름', payload.name)}${emailField('회사/기관', payload.company)}${emailField('이메일', payload.email)}${emailField('연락처', payload.phone)}${emailField('관심 분야', payload.inquiryType)}${emailField('예상 범위', payload.budget)}${emailField('접수 경로', payload.source)}</table><div style="background:#fff;padding:22px 24px;margin-top:1px"><div style="font-size:12px;color:#666;margin-bottom:10px">현재 해결하고 싶은 문제</div><div style="font-size:15px;line-height:1.75">${escapedMessage}</div></div><p style="margin:16px 4px 0;color:#777;font-size:11px;line-height:1.6">이 메일은 XAIKOREA 홈페이지 문의 양식을 통해 전송되었습니다. 회신하면 문의자가 입력한 이메일 주소로 전달됩니다.</p></div></body></html>`;

  const text = [
    'XAIKOREA 프로젝트 문의',
    `문의번호: ${inquiryId}`,
    `접수 시각: ${receivedAt}`,
    `이름: ${payload.name}`,
    `회사/기관: ${payload.company || '—'}`,
    `이메일: ${payload.email}`,
    `연락처: ${payload.phone || '—'}`,
    `관심 분야: ${payload.inquiryType || '—'}`,
    `예상 범위: ${payload.budget || '—'}`,
    `접수 경로: ${payload.source || '—'}`,
    '',
    payload.message,
  ].join('\n');

  return { subject, html, text };
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return btoa(binary);
}

function utf8ToBase64(value: string): string {
  return bytesToBase64(new TextEncoder().encode(value));
}

function toBase64Url(value: string): string {
  return utf8ToBase64(value)
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/u, '');
}

async function getGoogleAccessToken(env: Env): Promise<string> {
  if (
    !env.GOOGLE_OAUTH_CLIENT_ID ||
    !env.GOOGLE_OAUTH_CLIENT_SECRET ||
    !env.GOOGLE_OAUTH_REFRESH_TOKEN
  ) {
    throw new PublicError(503, 'mail_unavailable');
  }
  let response: Response;
  try {
    response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: env.GOOGLE_OAUTH_CLIENT_ID.trim(),
        client_secret: env.GOOGLE_OAUTH_CLIENT_SECRET.trim(),
        refresh_token: env.GOOGLE_OAUTH_REFRESH_TOKEN.trim(),
        grant_type: 'refresh_token',
      }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new PublicError(503, 'mail_unavailable');
  }
  const result = (await response.json().catch(() => null)) as
    | GoogleTokenResult
    | null;
  if (!response.ok || typeof result?.access_token !== 'string') {
    throw new PublicError(502, 'mail_failed');
  }
  return result.access_token;
}

function headerSafe(value: string): string {
  return value.replace(/[\r\n]+/gu, ' ').trim();
}

function buildGmailRawMessage(
  payload: InquiryPayload,
  inquiryId: string,
  sender: string,
  recipient: string
): string {
  const email = buildEmail(payload, inquiryId);
  const boundary = `xaikorea-${inquiryId.toLowerCase()}`;
  const subject = `=?UTF-8?B?${utf8ToBase64(headerSafe(email.subject))}?=`;
  const from = `=?UTF-8?B?${utf8ToBase64('XAIKOREA 문의')}?= <${headerSafe(sender)}>`;
  const message = [
    `From: ${from}`,
    `To: ${headerSafe(recipient)}`,
    `Reply-To: ${headerSafe(payload.email)}`,
    `Subject: ${subject}`,
    `Date: ${new Date().toUTCString()}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    utf8ToBase64(email.text),
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    utf8ToBase64(email.html),
    `--${boundary}--`,
    '',
  ].join('\r\n');
  return toBase64Url(message);
}

async function sendInquiryEmail(
  payload: InquiryPayload,
  inquiryId: string,
  env: Env
): Promise<string> {
  const sender = env.GMAIL_SENDER_ADDRESS.trim().toLowerCase();
  const recipient = env.CONTACT_RECIPIENT.trim().toLowerCase();
  if (
    !sender ||
    !recipient ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(sender) ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(recipient)
  ) {
    throw new PublicError(503, 'mail_unavailable');
  }
  const accessToken = await getGoogleAccessToken(env);
  const raw = buildGmailRawMessage(
    payload,
    inquiryId,
    sender,
    recipient
  );
  let response: Response;
  try {
    response = await fetch(GMAIL_SEND_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new PublicError(503, 'mail_unavailable');
  }
  const result = (await response.json().catch(() => null)) as
    | { id?: string }
    | null;
  if (!response.ok || typeof result?.id !== 'string') {
    throw new PublicError(502, 'mail_failed');
  }
  return result.id;
}

async function handleContact(request: Request, env: Env): Promise<Response> {
  const origin = getAllowedOrigin(request, env);
  if (origin === undefined) {
    return jsonResponse({ success: false, code: 'origin_not_allowed' }, 403);
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }
  if (request.method !== 'POST') {
    return jsonResponse({ success: false, code: 'method_not_allowed' }, 405, origin);
  }

  const contentLength = Number(request.headers.get('Content-Length') ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return jsonResponse({ success: false, code: 'request_too_large' }, 413, origin);
  }

  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      throw new PublicError(413, 'request_too_large');
    }
    const parsedBody = JSON.parse(rawBody) as unknown;
    const inquiryId = createInquiryId();
    if (
      typeof parsedBody === 'object' &&
      parsedBody !== null &&
      typeof (parsedBody as Record<string, unknown>).companyWebsite ===
        'string' &&
      ((parsedBody as Record<string, unknown>).companyWebsite as string).trim()
        .length > 0
    ) {
      return jsonResponse({ success: true, inquiryId }, 200, origin);
    }

    const payload = parsePayload(parsedBody);
    const elapsed = Date.now() - payload.startedAt;
    const minFillTime = parsePositiveNumber(
      env.MIN_FORM_FILL_MS,
      DEFAULT_MIN_FORM_FILL_MS
    );
    const maxFormAge = parsePositiveNumber(
      env.MAX_FORM_AGE_MS,
      DEFAULT_MAX_FORM_AGE_MS
    );

    // Deliberately return a normal response to automated form fillers without
    // revealing which anti-spam signal was triggered. No email is sent.
    if (
      elapsed < minFillTime ||
      elapsed > maxFormAge
    ) {
      return jsonResponse({ success: true, inquiryId }, 200, origin);
    }

    await verifyTurnstile(payload, request, env);
    await sendInquiryEmail(payload, inquiryId, env);
    return jsonResponse({ success: true, inquiryId }, 200, origin);
  } catch (error) {
    if (error instanceof PublicError) {
      return jsonResponse(
        { success: false, code: error.code },
        error.status,
        origin
      );
    }
    return jsonResponse({ success: false, code: 'invalid_request' }, 400, origin);
  }
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const pathname = new URL(request.url).pathname.replace(/\/$/, '');
    if (pathname !== '/contact') {
      return jsonResponse({ success: false, code: 'not_found' }, 404);
    }
    return handleContact(request, env);
  },
};

export default worker;
export {
  buildEmail,
  buildGmailRawMessage,
  createInquiryId,
  handleContact,
  parsePayload,
};
