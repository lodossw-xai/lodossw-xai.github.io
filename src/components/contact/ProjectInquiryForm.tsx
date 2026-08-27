import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactElement,
} from 'react';
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

const initialFormData: InquiryFormData = {
  name: '',
  company: '',
  email: '',
  phone: '',
  inquiryType: '',
  budget: '',
  message: '',
};

function isSuccessfulResponse(value: unknown): value is { success: true } {
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
  const contactEndpoint =
    typeof CONTACT_API_URL === 'string' && CONTACT_API_URL.trim().length > 0
      ? CONTACT_API_URL
      : undefined;
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
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    setSubmission('sending');

    if (contactEndpoint !== undefined) {
      try {
        const response = await fetch(contactEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, language, source }),
        });
        const data: unknown = await response.json().catch(() => null);
        if (!response.ok || !isSuccessfulResponse(data)) {
          throw new Error('Contact request failed');
        }
        setSubmission('sent');
        setFormData(initialFormData);
      } catch {
        setSubmission('error');
      }
      return;
    }

    const inquirySubject =
      formData.inquiryType !== ''
        ? formData.inquiryType
        : formData.company !== ''
          ? formData.company
          : 'Project inquiry';
    const subject = encodeURIComponent(`[XAIKOREA] ${inquirySubject}`);
    const body = encodeURIComponent(
      [
        `Name: ${formData.name}`,
        `Company: ${formData.company}`,
        `Email: ${formData.email}`,
        `Phone: ${formData.phone}`,
        `Area: ${formData.inquiryType}`,
        `Scope: ${formData.budget}`,
        '',
        formData.message,
      ].join('\n')
    );
    window.location.href = `mailto:contact@xaikorea.ai.kr?subject=${subject}&body=${body}`;
    setSubmission('sent');
  };

  return (
    <form
      id={id}
      className={`${prefix}-contact__form ${prefix}-inquiry-form`}
      onSubmit={(event) => {
        void handleSubmit(event);
      }}
    >
      <div className={`${prefix}-form-grid`}>
        <label>
          {copy.name}
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder={copy.namePlaceholder}
            autoComplete="name"
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
      <button
        className={`${prefix}-submit`}
        type="submit"
        disabled={submission === 'sending'}
      >
        {submission === 'sending' ? copy.sending : copy.send}
        <span aria-hidden="true">↗</span>
      </button>
      {submission !== 'idle' && (
        <p
          className={`${prefix}-form-status ${prefix}-form-status--${submission}`}
          role="status"
        >
          {submission === 'error'
            ? copy.error
            : contactEndpoint !== undefined
              ? copy.apiSent
              : copy.sent}
        </p>
      )}
    </form>
  );
}
