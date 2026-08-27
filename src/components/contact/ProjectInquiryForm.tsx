import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactElement,
} from 'react';
import {
  Turnstile,
  type TurnstileInstance,
} from '@marsidev/react-turnstile';
import { Link } from 'react-router-dom';

export type InquiryFormCopy = {
  name: string;
  company: string;
  email: string;
  phone: string;
  type: string;
  budget: string;
  message: string;
  namePlaceholder: string;
  companyPlaceholder: string;
  emailPlaceholder: string;
  phonePlaceholder: string;
  messagePlaceholder: string;
  selectDefault: string;
  types: readonly string[];
  budgets: readonly string[];
  send: string;
  sending: string;
  sent: string;
  apiSent: string;
  error: string;
};

type InquiryFormData = {
  name: string;
  company: string;
  email: string;
  phone: string;
  inquiryType: string;
  budget: string;
  message: string;
  companyWebsite: string;
};

type SubmissionState = 'idle' | 'sending' | 'sent' | 'error';

type ProjectInquiryFormProps = {
  copy: InquiryFormCopy;
  language?: 'ko' | 'en';
  variant?: 'landing' | 'contact';
  id?: string;
  selectedInquiryType?: string;
  source?: string;
};

const CONTACT_API_URL = import.meta.env.VITE_CONTACT_API_URL as
  | string
  | undefined;
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as
  | string
  | undefined;
const TURNSTILE_TEST_SITE_KEY = '1x00000000000000000000AA';

const initialFormData: InquiryFormData = {
  name: '',
  company: '',
  email: '',
  phone: '',
  inquiryType: '',
  budget: '',
  message: '',
  companyWebsite: '',
};

function isSuccessfulResponse(
  value: unknown
): value is { success: true; inquiryId?: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    value.success === true
  );
}

export default function ProjectInquiryForm({
  copy,
  language = 'ko',
  variant = 'contact',
  id = 'project-inquiry-form',
  selectedInquiryType = '',
  source = 'website-contact-form',
}: ProjectInquiryFormProps): ReactElement {
  const [submission, setSubmission] = useState<SubmissionState>('idle');
  const [formData, setFormData] = useState<InquiryFormData>(initialFormData);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [inquiryId, setInquiryId] = useState('');
  const startedAtRef = useRef<number | undefined>(undefined);
  const turnstileRef = useRef<TurnstileInstance | undefined>(undefined);
  const contactEndpoint =
    typeof CONTACT_API_URL === 'string' && CONTACT_API_URL.trim().length > 0
      ? CONTACT_API_URL
      : undefined;
  const turnstileSiteKey =
    typeof TURNSTILE_SITE_KEY === 'string' &&
    TURNSTILE_SITE_KEY.trim().length > 0
      ? TURNSTILE_SITE_KEY.trim()
      : import.meta.env.DEV
        ? TURNSTILE_TEST_SITE_KEY
        : undefined;
  const isConfigured =
    contactEndpoint !== undefined && turnstileSiteKey !== undefined;
  const prefix = variant === 'landing' ? 'ra' : 'rp';

  useEffect(() => {
    if (selectedInquiryType === '') {
      return;
    }
    setFormData((current) => ({
      ...current,
      inquiryType: selectedInquiryType,
    }));
  }, [selectedInquiryType]);

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ): void => {
    const field = event.target.name as keyof InquiryFormData;
    setFormData((current) => ({ ...current, [field]: event.target.value }));
    if (submission !== 'idle') {
      setSubmission('idle');
      setInquiryId('');
    }
  };

  const markFormStarted = (): void => {
    startedAtRef.current ??= Date.now();
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    if (!isConfigured || turnstileToken === '') {
      setSubmission('error');
      return;
    }
    setSubmission('sending');

    try {
      const response = await fetch(contactEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          language,
          source,
          turnstileToken,
          startedAt: startedAtRef.current ?? Date.now(),
          consent: true,
        }),
      });
      const data: unknown = await response.json().catch(() => null);
      if (!response.ok || !isSuccessfulResponse(data)) {
        throw new Error('Contact request failed');
      }
      setSubmission('sent');
      setInquiryId(data.inquiryId ?? '');
      setFormData(initialFormData);
      setTurnstileToken('');
      startedAtRef.current = undefined;
      turnstileRef.current?.reset();
    } catch {
      setSubmission('error');
      setTurnstileToken('');
      turnstileRef.current?.reset();
    }
  };

  return (
    <form
      id={id}
      className={`${prefix}-contact__form ${prefix}-inquiry-form`}
      onFocusCapture={markFormStarted}
      onSubmit={(event) => {
        void handleSubmit(event);
      }}
    >
      <div className={`${prefix}-form-honeypot`} aria-hidden="true">
        <label htmlFor={`${id}-company-website`}>
          Website
          <input
            id={`${id}-company-website`}
            name="companyWebsite"
            value={formData.companyWebsite}
            onChange={handleChange}
            tabIndex={-1}
            autoComplete="off"
          />
        </label>
      </div>
      <div className={`${prefix}-form-grid`}>
        <label>
          {copy.name}
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder={copy.namePlaceholder}
            autoComplete="name"
            maxLength={80}
            required
          />
        </label>
        <label>
          {copy.company}
          <input
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder={copy.companyPlaceholder}
            autoComplete="organization"
            maxLength={120}
          />
        </label>
        <label>
          {copy.email}
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={copy.emailPlaceholder}
            autoComplete="email"
            maxLength={254}
            required
          />
        </label>
        <label>
          {copy.phone}
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder={copy.phonePlaceholder}
            autoComplete="tel"
            maxLength={40}
          />
        </label>
        <label>
          {copy.type}
          <select
            name="inquiryType"
            value={formData.inquiryType}
            onChange={handleChange}
          >
            <option value="">{copy.selectDefault}</option>
            {copy.types.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          {copy.budget}
          <select name="budget" value={formData.budget} onChange={handleChange}>
            <option value="">{copy.selectDefault}</option>
            {copy.budgets.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>
      <label className={`${prefix}-form-message`}>
        {copy.message}
        <textarea
          name="message"
          rows={5}
          value={formData.message}
          onChange={handleChange}
          placeholder={copy.messagePlaceholder}
          minLength={10}
          maxLength={5000}
          required
        />
      </label>
      <label className={`${prefix}-form-consent`}>
        <input type="checkbox" required />
        <span>
          {language === 'ko'
            ? '문의 답변을 위한 개인정보 수집·이용에 동의합니다.'
            : 'I agree to the collection and use of personal data for this inquiry.'}{' '}
          <Link to="/privacy">
            {language === 'ko' ? '자세히 보기' : 'Learn more'}
          </Link>
        </span>
      </label>
      <div className={`${prefix}-form-security`}>
        {turnstileSiteKey !== undefined ? (
          <Turnstile
            ref={turnstileRef}
            siteKey={turnstileSiteKey}
            onSuccess={(token) => {
              setTurnstileToken(token);
              if (submission === 'error') {
                setSubmission('idle');
              }
            }}
            onExpire={() => {
              setTurnstileToken('');
            }}
            onError={() => {
              setTurnstileToken('');
              setSubmission('error');
            }}
            options={{
              action: 'contact_form',
              appearance: 'interaction-only',
              language,
              refreshExpired: 'auto',
              size: 'flexible',
              theme: 'light',
            }}
          />
        ) : (
          <p className={`${prefix}-form-config-notice`} role="status">
            {language === 'ko'
              ? '온라인 문의 보안 설정을 준비 중입니다.'
              : 'Secure online inquiries are being configured.'}
          </p>
        )}
      </div>
      <button
        className={`${prefix}-submit`}
        type="submit"
        disabled={
          submission === 'sending' || !isConfigured || turnstileToken === ''
        }
      >
        {submission === 'sending' ? copy.sending : copy.send}
        <span aria-hidden="true">↗</span>
      </button>
      {submission !== 'idle' && (
        <p
          className={`${prefix}-form-status ${prefix}-form-status--${submission}`}
          role="status"
        >
          {submission === 'error' ? (
            copy.error
          ) : (
            <>
              {copy.apiSent}
              {inquiryId !== '' && (
                <strong className={`${prefix}-form-inquiry-id`}>
                  {language === 'ko' ? '문의번호' : 'Reference'}: {inquiryId}
                </strong>
              )}
            </>
          )}
        </p>
      )}
      <p className={`${prefix}-form-fallback`}>
        {language === 'ko'
          ? '온라인 전송이 어려우면 이메일로 직접 문의해 주세요.'
          : 'If online submission is unavailable, contact us directly by email.'}{' '}
        <a href="mailto:contact@xaikorea.ai.kr">contact@xaikorea.ai.kr</a>
      </p>
    </form>
  );
}
