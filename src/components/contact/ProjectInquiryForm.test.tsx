import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ProjectInquiryForm, { type InquiryFormCopy } from './ProjectInquiryForm';

vi.mock('@marsidev/react-turnstile', () => ({
  Turnstile: () => <div data-testid="turnstile" />,
}));

const copy: InquiryFormCopy = {
  name: '이름',
  company: '회사/기관명',
  email: '이메일',
  phone: '연락처',
  type: '관심 분야',
  budget: '예상 범위',
  message: '현재 해결하고 싶은 문제',
  namePlaceholder: '홍길동',
  companyPlaceholder: '회사 또는 기관명',
  emailPlaceholder: 'name@company.com',
  phonePlaceholder: '010-0000-0000',
  messagePlaceholder: '문의 내용을 알려 주세요.',
  selectDefault: '선택해 주세요',
  types: ['지식 탐색 시스템'],
  budgets: ['미정 / 논의 필요'],
  send: '문의 내용 보내기',
  sending: '전송 중',
  sent: '접수되었습니다.',
  apiSent: '접수 번호',
  error: '전송에 실패했습니다.',
};

describe('ProjectInquiryForm privacy consent', () => {
  it('shows the checked state when the consent control is selected', () => {
    render(<ProjectInquiryForm copy={copy} />);

    const consent = screen.getByRole('checkbox', {
      name: '문의 답변을 위한 개인정보 수집·이용에 동의합니다.',
    });
    fireEvent.click(consent);

    expect(consent).toBeChecked();
  });

  it('opens privacy details inline and can apply consent without navigation', () => {
    render(<ProjectInquiryForm copy={copy} />);

    fireEvent.click(screen.getByRole('button', { name: '자세히 보기' }));

    expect(
      screen.getByRole('dialog', { name: '문의 개인정보 수집·이용 안내' })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '확인하고 동의하기' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', {
        name: '문의 답변을 위한 개인정보 수집·이용에 동의합니다.',
      })
    ).toBeChecked();
  });

  it('preselects a requested inquiry type', () => {
    const profileCopy: InquiryFormCopy = {
      ...copy,
      types: [...copy.types, '회사소개서·자료 요청'],
    };

    render(
      <ProjectInquiryForm
        copy={profileCopy}
        selectedInquiryType="회사소개서·자료 요청"
      />
    );

    expect(screen.getByRole('combobox', { name: '관심 분야' })).toHaveValue(
      '회사소개서·자료 요청'
    );
  });
});
