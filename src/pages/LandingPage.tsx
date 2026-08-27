import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactElement,
} from 'react';
import { Link } from 'react-router-dom';
import '../styles/redesign.css';

type Language = 'ko' | 'en';
type SubmissionState = 'idle' | 'sending' | 'sent' | 'error';
type SectionId =
  | 'top'
  | 'solutions'
  | 'work'
  | 'process'
  | 'experts'
  | 'request'
  | 'contact'
  | 'location';

type InquiryFormData = {
  name: string;
  company: string;
  email: string;
  phone: string;
  inquiryType: string;
  budget: string;
  message: string;
};

const CONTACT_API_URL = import.meta.env.VITE_CONTACT_API_URL as
  | string
  | undefined;
const HERO_ROTATION_MS = 8000;
const heroVisuals = [
  {
    video:
      'https://videos.pexels.com/video-files/3202364/3202364-hd_1920_1080_25fps.mp4',
    poster: '/assets/images/company/baemin-square-night.jpg',
  },
  {
    video:
      'https://videos.pexels.com/video-files/3209211/3209211-hd_1920_1080_25fps.mp4',
    poster: '/assets/images/company/hoban-ai-workspace.jpg',
  },
  {
    video:
      'https://videos.pexels.com/video-files/3202047/3202047-hd_1920_1080_25fps.mp4',
    poster: '/assets/images/company/engineering-at-work.jpg',
  },
] as const;
const MAP_ADDRESS = '경기도 성남시 금토로80번길 40 B동 배민스퀘어 301호';
const MAP_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(MAP_ADDRESS)}&z=16&output=embed&hl=ko`;
const MAP_LINK_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MAP_ADDRESS)}`;
const serviceVisuals = [
  '/assets/images/company/hoban-ai-workspace.jpg',
  '/assets/images/company/server-mainboard.jpg',
  '/assets/images/company/technology-protection-company.jpg',
] as const;
const serviceHoverVisuals = [
  '/assets/images/company/agent-harness-engineering.jpg',
  '/assets/images/company/engineering-at-work.jpg',
  '/assets/images/company/ai-transformation-conference.jpg',
] as const;
const caseVisuals = [
  '/assets/images/company/agent-harness-engineering.jpg',
  '/assets/images/company/hoban-ai-workspace.jpg',
  '/assets/images/company/technology-protection-company.jpg',
] as const;
const expertVisuals = [
  '/assets/images/company/ai-transformation-conference.jpg',
  '/assets/images/company/engineering-at-work.jpg',
  '/assets/images/company/office-design-wall.jpg',
] as const;
const globalNavigation = [
  ['HOME', '/'],
  ['ABOUT', '/about'],
  ['WORK', '/work'],
  ['CAREERS', '/careers'],
  ['CONTACT', '/contact'],
] as const;
const menuPreviewVisuals: Record<string, string> = {
  '/': '/assets/images/company/baemin-square-night.jpg',
  '/about': '/assets/images/company/office-lounge.jpg',
  '/work': '/assets/images/company/hoban-ai-workspace.jpg',
  '/careers': '/assets/images/company/open-workspace.jpg',
  '/contact': '/assets/images/company/baemin-square-campus.jpg',
};
const sectionIndicator: ReadonlyArray<{ id: SectionId; label: string }> = [
  { id: 'top', label: 'Intro' },
  { id: 'solutions', label: 'Evidence' },
  { id: 'work', label: 'Work' },
  { id: 'process', label: 'Process' },
  { id: 'experts', label: 'Network' },
  { id: 'request', label: 'Request' },
  { id: 'contact', label: 'Contact' },
  { id: 'location', label: 'Location' },
];

const copy = {
  ko: {
    languageLabel: '언어 선택',
    nav: [
      ['솔루션', '#solutions'],
      ['활용 사례', '#work'],
      ['진행 방식', '#process'],
      ['전문가', '#experts'],
      ['문의', '#contact'],
    ],
    menu: '메뉴 열기',
    closeMenu: '메뉴 닫기',
    skip: '본문으로 바로가기',
    heroSlides: [
      {
        kicker: 'EVIDENCE-FIRST AI',
        title: (
          <>
            AI가 답하면,
            <br />
            <em>근거</em>가 함께 와야 합니다.
          </>
        ),
        text: 'XAIKOREA는 규정·판례·내부 문서를 읽고, 출처가 추적되는 답변과 업무 흐름을 설계합니다.',
        popupKicker: '추천 활용 분야',
        popupTitle: '규정·판례·계약서 검토',
        popupText:
          '답변마다 확인 가능한 원문과 조항, 문서 위치를 함께 제공합니다.',
        popupTag: 'SOURCE LINKED',
        popupTagLabel: '원문·조항 연결',
        popupCta: '근거 설계 방식 보기',
        popupHref: '#solutions',
      },
      {
        kicker: 'ON-PREMISE INTELLIGENCE',
        title: (
          <>
            데이터는 조직 안에,
            <br />
            <em>인사이트</em>는 더 가까이.
          </>
        ),
        text: '조직의 회의·문서·업무 지식을 외부 유출 없이 연결하고, 권한 안에서 안전하게 활용할 수 있게 합니다.',
        popupKicker: '추천 활용 분야',
        popupTitle: '내부 문서 기반 지식 검색',
        popupText:
          '권한 안에서 회의록·업무 자료를 연결해 검토 가능한 조직 지식으로 전환합니다.',
        popupTag: 'ON-PREMISE',
        popupTagLabel: '권한 기반 지식 연결',
        popupCta: '구축 방식 보기',
        popupHref: '#process',
      },
      {
        kicker: 'AI FOR PROFESSIONAL WORK',
        title: (
          <>
            복잡한 판단을,
            <br />
            <em>설명 가능한</em> 다음 단계로.
          </>
        ),
        text: '법·세무·정책처럼 정확성이 중요한 업무를 원문 근거, 변경 이력, 사람의 검토 흐름과 함께 설계합니다.',
        popupKicker: '추천 활용 분야',
        popupTitle: '전문 업무 검토 지원',
        popupText:
          '법·세무·정책 변화의 영향 범위를 원문과 함께 비교하고 사람의 검토 지점을 남깁니다.',
        popupTag: 'HUMAN REVIEW',
        popupTagLabel: '검토·승인 지점 설계',
        popupCta: '활용 사례 보기',
        popupHref: '#work',
      },
    ],
    primaryCta: '프로젝트 문의하기',
    secondaryCta: '활용 사례 보기',
    evidenceEyebrow: 'WHY XAIKOREA',
    evidenceTitle: (
      <>
        답변이 아니라
        <br />
        <em>의사결정의 근거</em>를 만듭니다.
      </>
    ),
    evidenceText:
      '업무 현장에서는 빠른 응답만으로 충분하지 않습니다. 누가, 어떤 자료를 바탕으로, 언제 검토했는지까지 설명 가능한 흐름을 구축합니다.',
    evidencePoints: [
      [
        '원문에 연결되는 답변',
        '결론마다 문서·조항·판례 등 확인 가능한 출처를 연결합니다.',
      ],
      [
        '현장에 맞춘 지식 구조',
        '공개 정보와 조직 내부 문서를 권한 기준으로 함께 탐색합니다.',
      ],
      [
        '변화에 맞춘 지속 운영',
        '개정과 신규 데이터를 반영하며 결과 품질을 점검합니다.',
      ],
    ],
    casesEyebrow: 'SELECTED WORK',
    casesTitle: (
      <>
        복잡한 지식을
        <br />
        실행 가능한 다음 단계로.
      </>
    ),
    cases: [
      {
        label: 'Research',
        title: '연구 정보 탐색',
        text: '흩어진 논문과 보고서에서 질문에 맞는 근거를 신속히 찾아 맥락과 함께 제시합니다.',
        stat: '85%',
        statLabel: '리서치 시간 절감',
        tag: 'Academic intelligence',
      },
      {
        label: 'Review',
        title: '문서 검토 지원',
        text: '계약·규정·내부 문서를 비교하고, 검토자가 확인할 수 있는 쟁점과 출처를 정리합니다.',
        stat: '3.2×',
        statLabel: '검토 처리량 향상',
        tag: 'Document intelligence',
      },
      {
        label: 'Governance',
        title: 'AI 거버넌스',
        text: '설명·감사·권한 관리를 중심으로 신뢰할 수 있는 업무용 AI 운영 체계를 설계합니다.',
        stat: '100%',
        statLabel: '추적 가능한 응답',
        tag: 'Trusted AI operations',
      },
    ],
    servicesEyebrow: 'WHAT WE BUILD',
    servicesTitle: (
      <>
        업무의 맥락을 이해하는
        <br />
        AI 운영 체계.
      </>
    ),
    services: [
      [
        '01',
        '지식 탐색 시스템',
        '자연어 질문을 조직의 문서·데이터·외부 기준과 연결해 신뢰도 높은 답을 만듭니다.',
      ],
      [
        '02',
        '검토·판단 보조',
        '비교, 요약, 쟁점 추출을 넘어 사람이 확인해야 할 근거와 다음 행동을 제안합니다.',
      ],
      [
        '03',
        '신뢰 가능한 AI 운영',
        '권한, 출처, 평가, 개선 주기를 하나의 운영 경험으로 설계합니다.',
      ],
    ],
    partnerTitle: '함께 지식을 더 정확하게 만드는 파트너',
    processEyebrow: 'HOW WE WORK',
    processTitle: (
      <>
        빠르게 시작하고,
        <br />
        <em>검증하며 확장합니다.</em>
      </>
    ),
    process: [
      [
        '01',
        '업무를 진단합니다',
        '사용자, 질문, 자료, 리스크와 현재 업무 흐름을 함께 파악합니다.',
      ],
      [
        '02',
        '근거를 설계합니다',
        '출처 체계와 권한 기준을 정하고, 검증 가능한 답변 구조를 만듭니다.',
      ],
      [
        '03',
        '작게 검증합니다',
        '실제 질문과 자료로 답변 품질과 사용성을 빠르게 확인합니다.',
      ],
      [
        '04',
        '운영으로 확장합니다',
        '평가와 개선 주기를 갖춰 팀의 일상 업무에 자연스럽게 안착시킵니다.',
      ],
    ],
    principlesEyebrow: 'TRUST BY DESIGN',
    principlesTitle: (
      <>
        신뢰는 기능이 아니라
        <br />
        <em>운영 방식</em>에서 시작됩니다.
      </>
    ),
    principlesText:
      '도입 이후에도 설명 가능성과 업무 적합성을 지킬 수 있도록, 처음부터 다음 기준을 설계에 담습니다.',
    principles: [
      [
        '01',
        '사람의 확인 지점',
        '중요한 판단에는 사람이 검토하고 승인할 수 있는 흐름을 남깁니다.',
      ],
      [
        '02',
        '출처 우선의 답변',
        '답변의 핵심은 근거와 함께 확인할 수 있도록 구조화합니다.',
      ],
      [
        '03',
        '역할 기반 접근',
        '업무별 권한과 민감도에 맞춰 지식의 접근 범위를 설정합니다.',
      ],
      [
        '04',
        '측정 가능한 품질',
        '정확도·근거성·유용성을 실제 질문으로 지속 점검합니다.',
      ],
      [
        '05',
        '안전한 기본값',
        '개인·조직의 정보를 최소한으로 다루는 원칙을 우선합니다.',
      ],
      [
        '06',
        '변화에 맞춘 개선',
        '문서와 규정, 사용 방식의 변화에 맞춰 지식을 갱신합니다.',
      ],
    ],
    expertsEyebrow: 'PEOPLE & NETWORK',
    expertsTitle: '도메인과 기술 사이를 연결하는 팀',
    expertsText:
      'AI, 법·제도, 연구, 비즈니스 현장의 전문가들과 함께 문제의 언어를 제품의 경험으로 바꿉니다.',
    expertCards: [
      ['AI Strategy', '도입 전략과 데이터 구조'],
      ['Domain Expertise', '규정·연구·산업의 맥락'],
      ['Product Operations', '현장 안착과 지속 개선'],
    ],
    requestEyebrow: 'LET’S CONNECT',
    requestCards: [
      [
        'CAREERS',
        '문제를 함께 풀 동료를 찾습니다.',
        '팀과 일하는 방식 보기',
        '/careers',
      ],
      [
        'PROJECT REQUEST',
        '다음 업무의 기준을 함께 설계합니다.',
        '프로젝트 문의하기',
        '#contact',
      ],
    ],
    contactEyebrow: 'START A CONVERSATION',
    contactTitle: (
      <>
        다음 업무의 기준을
        <br />
        <em>함께 설계해 볼까요?</em>
      </>
    ),
    contactText:
      '아래 내용을 남겨 주세요. 검토 후 가장 적합한 방식으로 연락드리겠습니다.',
    contactInfo: {
      officeLabel: '본사 위치',
      officeAddress: '경기도 성남시 금토로80번길 40, B동 배민스퀘어 301호',
      phoneLabel: '고객센터',
      phone: '+82)10-3253-5409 · 평일 09:00–18:00',
      emailLabel: '이메일',
    },
    form: {
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
      messagePlaceholder:
        '현재 업무 흐름, 참고 자료, 기대하는 결과를 편하게 알려 주세요.',
      selectDefault: '선택해 주세요',
      types: ['지식 탐색 시스템', '문서 검토 지원', 'AI 거버넌스', '기타'],
      budgets: ['미정 / 논의 필요', 'PoC·파일럿', '정식 구축', '운영 고도화'],
      send: '문의 내용 보내기',
      sending: '전송 중...',
      sent: '문의 메일을 열었습니다. 내용을 확인한 뒤 전송해 주세요.',
      apiSent: '문의가 전달되었습니다. 빠르게 검토 후 연락드리겠습니다.',
      error:
        '전송에 실패했습니다. 잠시 후 다시 시도하거나 contact@xaikorea.ai.kr로 연락해 주세요.',
    },
    footer: '설명 가능한 AI로, 더 신뢰할 수 있는 업무를 만듭니다.',
    rights: '© 2025 XAIKOREA. All rights reserved.',
    privacy: '개인정보처리방침',
    terms: '이용약관',
  },
  en: {
    languageLabel: 'Language',
    nav: [
      ['Solutions', '#solutions'],
      ['Work', '#work'],
      ['Process', '#process'],
      ['Experts', '#experts'],
      ['Contact', '#contact'],
    ],
    menu: 'Open menu',
    closeMenu: 'Close menu',
    skip: 'Skip to content',
    heroSlides: [
      {
        kicker: 'EVIDENCE-FIRST AI',
        title: (
          <>
            When AI answers,
            <br />
            the <em>evidence</em> should arrive too.
          </>
        ),
        text: 'XAIKOREA designs traceable answers and work flows from regulations, cases, and your organization’s knowledge.',
        popupKicker: 'RECOMMENDED USE CASE',
        popupTitle: 'Policy, case, and contract review',
        popupText:
          'Each answer connects to checkable source text, clauses, and document locations.',
        popupTag: 'SOURCE LINKED',
        popupTagLabel: 'Original sources attached',
        popupCta: 'See evidence design',
        popupHref: '#solutions',
      },
      {
        kicker: 'ON-PREMISE INTELLIGENCE',
        title: (
          <>
            Keep data inside.
            <br />
            Bring <em>insight</em> closer.
          </>
        ),
        text: 'Connect meetings, documents, and operational knowledge without giving up organizational control or access boundaries.',
        popupKicker: 'RECOMMENDED USE CASE',
        popupTitle: 'Private knowledge discovery',
        popupText:
          'Connect meeting notes and work documents within access boundaries to create reviewable organizational knowledge.',
        popupTag: 'ON-PREMISE',
        popupTagLabel: 'Permission-aware knowledge',
        popupCta: 'See how we build',
        popupHref: '#process',
      },
      {
        kicker: 'AI FOR PROFESSIONAL WORK',
        title: (
          <>
            Complex judgment,
            <br />
            an <em>explainable</em> next step.
          </>
        ),
        text: 'For legal, tax, and policy work, we connect original sources, change history, and clear human review points.',
        popupKicker: 'RECOMMENDED USE CASE',
        popupTitle: 'Professional review support',
        popupText:
          'Compare changes across legal, tax, and policy materials while keeping clear human review points.',
        popupTag: 'HUMAN REVIEW',
        popupTagLabel: 'Review and approval built in',
        popupCta: 'See use cases',
        popupHref: '#work',
      },
    ],
    primaryCta: 'Start a project',
    secondaryCta: 'See our work',
    evidenceEyebrow: 'WHY XAIKOREA',
    evidenceTitle: (
      <>
        We create the basis for
        <br />
        <em>better decisions.</em>
      </>
    ),
    evidenceText:
      'Fast answers are not enough at work. We build flows that make sources, review history, and responsibility clear.',
    evidencePoints: [
      [
        'Answers linked to the original source',
        'Every conclusion connects to a document, clause, case, or other verifiable reference.',
      ],
      [
        'Knowledge structured for your work',
        'Public information and internal knowledge are searched together under clear permissions.',
      ],
      [
        'Operations that follow change',
        'New information and regulatory updates are reflected while answer quality is continuously reviewed.',
      ],
    ],
    casesEyebrow: 'SELECTED WORK',
    casesTitle: (
      <>
        Turn complex knowledge into
        <br />
        the next practical action.
      </>
    ),
    cases: [
      {
        label: 'Research',
        title: 'Research intelligence',
        text: 'Find relevant evidence across papers and reports, then present it in the context of the question.',
        stat: '85%',
        statLabel: 'less research time',
        tag: 'Academic intelligence',
      },
      {
        label: 'Review',
        title: 'Document review',
        text: 'Compare contracts, policies, and internal documents with issues and sources ready for human review.',
        stat: '3.2×',
        statLabel: 'more review throughput',
        tag: 'Document intelligence',
      },
      {
        label: 'Governance',
        title: 'AI governance',
        text: 'Design an operational system for trustworthy AI around explanation, auditability, and access control.',
        stat: '100%',
        statLabel: 'traceable responses',
        tag: 'Trusted AI operations',
      },
    ],
    servicesEyebrow: 'WHAT WE BUILD',
    servicesTitle: (
      <>
        An AI operating system
        <br />
        that understands work context.
      </>
    ),
    services: [
      [
        '01',
        'Knowledge discovery',
        'Connect natural-language questions with organizational documents, data, and external standards.',
      ],
      [
        '02',
        'Review and decision support',
        'Move beyond summaries: surface the evidence, issues, and next action a reviewer needs.',
      ],
      [
        '03',
        'Trustworthy AI operations',
        'Unify permissions, sources, evaluation, and improvement in one operating experience.',
      ],
    ],
    partnerTitle: 'Partners making knowledge more precise, together',
    processEyebrow: 'HOW WE WORK',
    processTitle: (
      <>
        Start quickly,
        <br />
        <em>validate, then scale.</em>
      </>
    ),
    process: [
      [
        '01',
        'Diagnose the work',
        'We map the users, questions, source materials, risks, and flow you already have.',
      ],
      [
        '02',
        'Design the evidence',
        'We define sources, permissions, and the structure of a verifiable answer.',
      ],
      [
        '03',
        'Validate in a small loop',
        'We test quality and usability with the questions and materials that matter.',
      ],
      [
        '04',
        'Scale into operations',
        'We establish evaluation and improvement practices for dependable everyday use.',
      ],
    ],
    principlesEyebrow: 'TRUST BY DESIGN',
    principlesTitle: (
      <>
        Trust begins not with a feature,
        <br />
        but with an <em>operating practice.</em>
      </>
    ),
    principlesText:
      'We build these principles into the work from the start, so explainability and fit are maintained after launch.',
    principles: [
      [
        '01',
        'Human review points',
        'Leave clear moments for people to review and approve important decisions.',
      ],
      [
        '02',
        'Evidence-first answers',
        'Structure each answer so its essential basis can be checked with the source.',
      ],
      [
        '03',
        'Role-based access',
        'Set the scope of knowledge access around the task, role, and sensitivity.',
      ],
      [
        '04',
        'Measurable quality',
        'Keep checking accuracy, evidence, and usefulness with real questions.',
      ],
      [
        '05',
        'Secure by default',
        'Start with the principle of handling personal and organizational data minimally.',
      ],
      [
        '06',
        'Improvement with change',
        'Refresh knowledge as documents, regulations, and work practices evolve.',
      ],
    ],
    expertsEyebrow: 'PEOPLE & NETWORK',
    expertsTitle: 'A team connecting domain knowledge and technology',
    expertsText:
      'We work with specialists in AI, policy, research, and business to turn the language of a problem into a product experience.',
    expertCards: [
      ['AI Strategy', 'Adoption strategy and data structure'],
      ['Domain Expertise', 'Policy, research, and industry context'],
      ['Product Operations', 'Adoption and continual improvement'],
    ],
    requestEyebrow: 'LET’S CONNECT',
    requestCards: [
      [
        'CAREERS',
        'Join the people solving consequential problems.',
        'Meet the team',
        '/careers',
      ],
      [
        'PROJECT REQUEST',
        'Design the next standard for your work with us.',
        'Start a project',
        '#contact',
      ],
    ],
    contactEyebrow: 'START A CONVERSATION',
    contactTitle: (
      <>
        Let’s design a stronger
        <br />
        <em>standard for work.</em>
      </>
    ),
    contactText:
      'Tell us a little about your challenge. We will review it and suggest the best way to begin.',
    contactInfo: {
      officeLabel: 'Head office',
      officeAddress:
        '301, Building B, Baemin Square, 40 Geumto-ro 80beon-gil, Seongnam-si, Gyeonggi-do, Republic of Korea',
      phoneLabel: 'Customer service',
      phone: '+82)10-3253-5409 · Weekdays 09:00–18:00',
      emailLabel: 'Email',
    },
    form: {
      name: 'Name',
      company: 'Company / organization',
      email: 'Email',
      phone: 'Phone',
      type: 'Area of interest',
      budget: 'Expected scope',
      message: 'What would you like to solve?',
      namePlaceholder: 'Your name',
      companyPlaceholder: 'Company or organization',
      emailPlaceholder: 'name@company.com',
      phonePlaceholder: '+82 10 0000 0000',
      messagePlaceholder:
        'Tell us about your current flow, source materials, and desired outcome.',
      selectDefault: 'Select an option',
      types: [
        'Knowledge discovery',
        'Document review',
        'AI governance',
        'Other',
      ],
      budgets: [
        'Undecided / let’s discuss',
        'PoC / pilot',
        'Full implementation',
        'Operational enhancement',
      ],
      send: 'Send inquiry',
      sending: 'Sending...',
      sent: 'Your email client is open. Please review the message and send it.',
      apiSent: 'Your inquiry has been sent. We will be in touch shortly.',
      error:
        'We could not send your inquiry. Please try again or email contact@xaikorea.ai.kr.',
    },
    footer: 'Explainable AI for work you can trust.',
    rights: '© 2025 XAIKOREA. All rights reserved.',
    privacy: 'Privacy policy',
    terms: 'Terms of use',
  },
} as const;

function isSuccessfulResponse(value: unknown): value is { success: true } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    (value as { success?: unknown }).success === true
  );
}

export default function LandingPage(): ReactElement {
  const [language, setLanguage] = useState<Language>('ko');
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeHero, setActiveHero] = useState(0);
  const [activeCase, setActiveCase] = useState(0);
  const [activeSection, setActiveSection] = useState<SectionId>('top');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCasePaused, setIsCasePaused] = useState(false);
  const [isVideoPaused, setIsVideoPaused] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isHeroRotationPaused, setIsHeroRotationPaused] = useState(false);
  const [isHeroPopupOpen, setIsHeroPopupOpen] = useState(true);
  const [videoPlaybackNonce, setVideoPlaybackNonce] = useState(0);
  const [menuPreview, setMenuPreview] = useState(
    menuPreviewVisuals['/about'] ?? serviceVisuals[0]
  );
  const [submission, setSubmission] = useState<SubmissionState>('idle');
  const [formData, setFormData] = useState<InquiryFormData>({
    name: '',
    company: '',
    email: '',
    phone: '',
    inquiryType: '',
    budget: '',
    message: '',
  });
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const videoUserPausedRef = useRef(false);
  const content = copy[language];
  const activeHeroCopy =
    content.heroSlides[activeHero] ?? content.heroSlides[0];
  const activeHeroVisual = heroVisuals[activeHero] ?? heroVisuals[0];
  const activeStudy = content.cases[activeCase] ?? content.cases[0];
  const contactEndpoint =
    typeof CONTACT_API_URL === 'string' && CONTACT_API_URL.trim().length > 0
      ? CONTACT_API_URL
      : undefined;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
      if (event.key === 'Tab' && menuOpen) {
        const focusable = menuPanelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])'
        );
        if (focusable === undefined || focusable.length === 0) {
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      window.requestAnimationFrame(() => {
        menuPanelRef.current?.querySelector<HTMLElement>('nav a')?.focus();
      });
    }
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    let animationFrame = 0;
    const updateScrollState = (): void => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        const maximumScroll = Math.max(
          document.documentElement.scrollHeight - window.innerHeight,
          1
        );
        const progress = Math.min(
          Math.max(window.scrollY / maximumScroll, 0),
          1
        );
        document.documentElement.style.setProperty(
          '--ra-scroll-progress',
          String(progress)
        );
        document.documentElement.style.setProperty(
          '--ra-hero-shift',
          `${String(Math.min(window.scrollY * 0.16, 120))}px`
        );
        setIsScrolled(window.scrollY > 72);
      });
    };

    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, []);

  useEffect(() => {
    const revealTargets = document.querySelectorAll<HTMLElement>(
      '.ra-section, .ra-partners, .ra-location'
    );
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-inview');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    revealTargets.forEach((target) => {
      target.classList.add('ra-will-reveal');
      revealObserver.observe(target);
    });

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries.find((entry) => entry.isIntersecting);
        if (
          visibleEntry?.target.id !== undefined &&
          visibleEntry.target.id !== ''
        ) {
          setActiveSection(visibleEntry.target.id as SectionId);
        }
      },
      { rootMargin: '-34% 0px -55% 0px', threshold: 0 }
    );

    sectionIndicator.forEach(({ id }) => {
      const section = document.getElementById(id);
      if (section !== null) {
        sectionObserver.observe(section);
      }
    });

    return () => {
      revealObserver.disconnect();
      sectionObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (
      isCasePaused ||
      menuOpen ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    const timer = window.setInterval(() => {
      setActiveCase((current) => (current + 1) % content.cases.length);
    }, 5600);
    return () => {
      window.clearInterval(timer);
    };
  }, [content.cases.length, isCasePaused, menuOpen]);

  useEffect(() => {
    if (
      isHeroRotationPaused ||
      menuOpen ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    const timer = window.setTimeout(() => {
      setIsVideoReady(false);
      setActiveHero((current) => (current + 1) % heroVisuals.length);
    }, HERO_ROTATION_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [activeHero, isHeroRotationPaused, menuOpen]);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotion.matches) {
      videoUserPausedRef.current = true;
      setIsHeroRotationPaused(true);
      heroVideoRef.current?.pause();
      setIsVideoPaused(true);
    }

    const handleVisibility = (): void => {
      const video = heroVideoRef.current;
      if (video === null) {
        return;
      }
      if (document.hidden) {
        video.pause();
      } else if (!videoUserPausedRef.current && !reducedMotion.matches) {
        void video.play().catch(() => {
          setIsVideoPaused(true);
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const closeMenu = (): void => {
    setMenuOpen(false);
  };

  const toggleVideo = (): void => {
    const video = heroVideoRef.current;
    if (video === null) {
      return;
    }
    if (isVideoPaused) {
      videoUserPausedRef.current = false;
      setIsVideoReady(false);
      setIsVideoPaused(false);
      setIsHeroRotationPaused(false);
      setVideoPlaybackNonce((current) => current + 1);
    } else {
      video.pause();
      videoUserPausedRef.current = true;
      setIsHeroRotationPaused(true);
      setIsVideoPaused(true);
    }
  };

  const showHeroSlide = (nextIndex: number): void => {
    const normalizedIndex =
      (nextIndex + heroVisuals.length) % heroVisuals.length;
    setIsVideoReady(false);
    setActiveHero(normalizedIndex);
  };

  const scrollToTop = (): void => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ): void => {
    const field = event.target.name as keyof InquiryFormData;
    setFormData((current) => ({ ...current, [field]: event.target.value }));
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
          body: JSON.stringify({
            ...formData,
            language,
            source: 'website-contact-form',
          }),
        });
        const data: unknown = await response.json().catch(() => null);
        if (!response.ok || !isSuccessfulResponse(data)) {
          throw new Error('Contact request failed');
        }
        setSubmission('sent');
        setFormData({
          name: '',
          company: '',
          email: '',
          phone: '',
          inquiryType: '',
          budget: '',
          message: '',
        });
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
    <div className="ra-site">
      <a className="ra-skip-link" href="#main-content">
        {content.skip}
      </a>
      <div className="ra-scroll-progress" aria-hidden="true">
        <span />
      </div>

      <header
        className={`ra-header ${menuOpen ? 'is-menu-open' : ''} ${isScrolled ? 'is-scrolled' : ''} ${activeSection === 'experts' ? 'is-over-dark' : ''}`}
      >
        <div className="ra-shell ra-header__inner">
          <Link className="ra-brand" to="/" aria-label="XAIKOREA home">
            <span className="ra-brand__mark" aria-hidden="true">
              <img src="/assets/images/logo/xaikorea-corporate.png" alt="" />
            </span>
            <span className="ra-brand__word">XAIKOREA</span>
          </Link>
          <nav className="ra-desktop-nav" aria-label="Main navigation">
            {globalNavigation.slice(1).map(([label, target]) => (
              <Link to={target} key={target}>
                {label}
              </Link>
            ))}
          </nav>
          <div className="ra-header__tools">
            <div className="ra-language" aria-label={content.languageLabel}>
              <button
                className={language === 'ko' ? 'is-active' : ''}
                onClick={() => {
                  setLanguage('ko');
                }}
                aria-pressed={language === 'ko'}
              >
                KO
              </button>
              <span>/</span>
              <button
                className={language === 'en' ? 'is-active' : ''}
                onClick={() => {
                  setLanguage('en');
                }}
                aria-pressed={language === 'en'}
              >
                EN
              </button>
            </div>
            <button
              ref={menuButtonRef}
              className={`ra-menu-button ${menuOpen ? 'is-open' : ''}`}
              type="button"
              aria-label={menuOpen ? content.closeMenu : content.menu}
              aria-controls="mobile-navigation"
              aria-expanded={menuOpen}
              onClick={() => {
                setMenuOpen((current) => !current);
              }}
            >
              <i />
              <i />
            </button>
          </div>
        </div>
      </header>

      <nav
        className={`ra-section-indicator ${isScrolled ? 'is-visible' : ''}`}
        aria-label={language === 'ko' ? '현재 섹션' : 'Current section'}
      >
        {sectionIndicator.map(({ id, label }, index) => (
          <a
            key={id}
            href={`#${id}`}
            className={activeSection === id ? 'is-active' : ''}
            aria-current={activeSection === id ? 'location' : undefined}
          >
            <span>0{index + 1}</span>
            <b>{label}</b>
          </a>
        ))}
      </nav>

      <div
        ref={menuPanelRef}
        id="mobile-navigation"
        className={`ra-mobile-menu ${menuOpen ? 'is-open' : ''}`}
        aria-hidden={!menuOpen}
      >
        <div className="ra-shell">
          <div className="ra-menu-layout">
            <div className="ra-menu-intro">
              <div className="ra-menu-preview" aria-hidden="true">
                <img src={menuPreview} alt="" />
              </div>
              <p>
                {language === 'ko'
                  ? '설명 가능한 AI로 더 신뢰할 수 있는 업무를 만듭니다.'
                  : 'Explainable intelligence for work you can trust.'}
              </p>
              <div>
                <span>PROJECT REQUEST</span>
                <a href="mailto:contact@xaikorea.ai.kr">
                  contact@xaikorea.ai.kr
                </a>
              </div>
              <div>
                <span>CONSULTATION</span>
                <a
                  href="#contact"
                  onClick={() => {
                    closeMenu();
                  }}
                >
                  {language === 'ko' ? '프로젝트 문의하기' : 'Start a project'}{' '}
                  ↗
                </a>
              </div>
            </div>
            <nav aria-label="Mobile navigation">
              {globalNavigation.map(([label, target], index) => (
                <Link
                  to={target}
                  className={target === '/' ? 'is-current' : ''}
                  onPointerEnter={() => {
                    setMenuPreview(
                      menuPreviewVisuals[target] ?? serviceVisuals[0]
                    );
                  }}
                  onFocus={() => {
                    setMenuPreview(
                      menuPreviewVisuals[target] ?? serviceVisuals[0]
                    );
                  }}
                  onClick={() => {
                    closeMenu();
                  }}
                  key={target}
                >
                  <span>0{index + 1}</span>
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <main id="main-content">
        <section
          id="top"
          className={`ra-hero ra-hero--${String(activeHero + 1)} ${isHeroRotationPaused ? 'is-rotation-paused' : ''}`}
          aria-labelledby="hero-title"
          data-section={language === 'ko' ? '소개' : 'ALL ABOUT'}
        >
          <span className="ra-vertical-label" aria-hidden="true">
            {language === 'ko' ? '소개' : 'ALL ABOUT'}
          </span>
          <img
            key={activeHeroVisual.poster}
            className="ra-hero__image"
            src={activeHeroVisual.poster}
            alt=""
            decoding="async"
          />
          <video
            key={`${activeHeroVisual.video}-${String(videoPlaybackNonce)}`}
            ref={heroVideoRef}
            className={`ra-hero__video ${isVideoReady ? 'is-ready' : ''}`}
            autoPlay={!isHeroRotationPaused}
            muted
            loop
            playsInline
            preload="metadata"
            poster={activeHeroVisual.poster}
            aria-hidden="true"
            tabIndex={-1}
            onCanPlay={() => {
              setIsVideoReady(true);
            }}
            onPlay={() => {
              setIsVideoPaused(false);
            }}
            onPause={() => {
              setIsVideoPaused(true);
            }}
          >
            <source src={activeHeroVisual.video} type="video/mp4" />
          </video>
          <div className="ra-hero__veil" />
          <div className="ra-shell ra-hero__content">
            <div
              key={`${language}-${String(activeHero)}`}
              className="ra-hero__copy"
            >
              <p className="ra-eyebrow ra-eyebrow--light">
                {activeHeroCopy.kicker}
              </p>
              <h1 id="hero-title">{activeHeroCopy.title}</h1>
              <div className="ra-hero__bottom">
                <p>{activeHeroCopy.text}</p>
                <div className="ra-actions">
                  <a className="ra-button ra-button--solid" href="#contact">
                    {content.primaryCta}
                    <span>↘</span>
                  </a>
                  <a className="ra-button ra-button--line" href="#work">
                    {content.secondaryCta}
                    <span>↘</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
          {isHeroPopupOpen ? (
            <aside
              key={`recommendation-${language}-${String(activeHero)}`}
              className="ra-hero-popup"
              aria-label={activeHeroCopy.popupTitle}
            >
              <button
                type="button"
                className="ra-hero-popup__close"
                onClick={() => {
                  setIsHeroPopupOpen(false);
                }}
                aria-label={
                  language === 'ko' ? '추천 팝업 닫기' : 'Close recommendation'
                }
              >
                ×
              </button>
              <p className="ra-hero-popup__eyebrow">
                {activeHeroCopy.popupKicker}
              </p>
              <h2>{activeHeroCopy.popupTitle}</h2>
              <p className="ra-hero-popup__text">{activeHeroCopy.popupText}</p>
              <div className="ra-hero-popup__tag">
                <strong>{activeHeroCopy.popupTag}</strong>
                <span>{activeHeroCopy.popupTagLabel}</span>
              </div>
              <a href={activeHeroCopy.popupHref}>
                {activeHeroCopy.popupCta}
                <span aria-hidden="true">↘</span>
              </a>
            </aside>
          ) : (
            <button
              type="button"
              className="ra-hero-popup-open"
              onClick={() => {
                setIsHeroPopupOpen(true);
              }}
              aria-label={
                language === 'ko'
                  ? '추천 활용 분야 다시 보기'
                  : 'Open recommendation'
              }
            >
              {language === 'ko' ? '추천 보기' : 'View recommendation'}
              <span aria-hidden="true">+</span>
            </button>
          )}
          <div
            className="ra-hero-nav"
            aria-label={
              language === 'ko' ? '메인 영상 선택' : 'Select hero story'
            }
          >
            <button
              type="button"
              className="ra-hero-nav__arrow"
              onClick={() => {
                showHeroSlide(activeHero - 1);
              }}
              aria-label={language === 'ko' ? '이전 영상' : 'Previous video'}
            >
              ←
            </button>
            <div className="ra-hero-nav__pages">
              {heroVisuals.map((visual, index) => (
                <button
                  key={visual.video}
                  type="button"
                  className={index === activeHero ? 'is-active' : ''}
                  aria-current={index === activeHero ? 'true' : undefined}
                  aria-label={`${language === 'ko' ? '영상' : 'Video'} ${String(index + 1)}`}
                  onClick={() => {
                    showHeroSlide(index);
                  }}
                >
                  <span>0{index + 1}</span>
                  <i />
                </button>
              ))}
            </div>
            <button
              type="button"
              className="ra-hero-nav__arrow"
              onClick={() => {
                showHeroSlide(activeHero + 1);
              }}
              aria-label={language === 'ko' ? '다음 영상' : 'Next video'}
            >
              →
            </button>
          </div>
          <a className="ra-scroll-cue" href="#solutions">
            <span>SCROLL</span>
            <i />
          </a>
          {isVideoReady && (
            <button
              className="ra-video-toggle"
              type="button"
              onClick={() => {
                toggleVideo();
              }}
              aria-label={
                language === 'ko'
                  ? `배경 영상 ${isVideoPaused ? '재생' : '일시정지'}`
                  : `${isVideoPaused ? 'Play' : 'Pause'} background video`
              }
            >
              <span className={isVideoPaused ? 'is-play' : 'is-pause'} />
              {isVideoPaused ? 'PLAY' : 'PAUSE'}
            </button>
          )}
        </section>

        <section
          id="solutions"
          className="ra-section ra-evidence"
          data-section="EVIDENCE"
        >
          <span className="ra-vertical-label" aria-hidden="true">
            EVIDENCE
          </span>
          <div className="ra-shell ra-evidence__grid">
            <div className="ra-section__heading">
              <p className="ra-eyebrow">{content.evidenceEyebrow}</p>
              <h2>{content.evidenceTitle}</h2>
              <p className="ra-lead">{content.evidenceText}</p>
            </div>
            <div className="ra-evidence__visual">
              <img
                src="/assets/images/main/processing.png"
                alt={
                  language === 'ko'
                    ? 'XAIKOREA의 근거 추적형 AI 분석 화면'
                    : 'XAIKOREA evidence-traceable AI analysis interface'
                }
                loading="lazy"
                decoding="async"
              />
              <span className="ra-evidence__label">
                EVIDENCE
                <br />
                LINKED
              </span>
            </div>
            <ol className="ra-evidence__list">
              {content.evidencePoints.map(([title, text], index) => (
                <li key={title}>
                  <span>0{index + 1}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          id="work"
          className="ra-section ra-work"
          aria-labelledby="work-title"
          data-section="CASE STUDIES"
        >
          <span
            className="ra-vertical-label ra-vertical-label--light"
            aria-hidden="true"
          >
            CASE STUDIES
          </span>
          <div className="ra-shell">
            <div className="ra-section__heading ra-section__heading--wide">
              <p className="ra-eyebrow">{content.casesEyebrow}</p>
              <h2 id="work-title">{content.casesTitle}</h2>
            </div>
            <div
              className="ra-case-switcher"
              role="tablist"
              aria-label={content.casesEyebrow}
              onPointerEnter={() => {
                setIsCasePaused(true);
              }}
              onPointerLeave={() => {
                setIsCasePaused(false);
              }}
              onFocus={() => {
                setIsCasePaused(true);
              }}
              onBlur={() => {
                setIsCasePaused(false);
              }}
            >
              {content.cases.map((study, index) => (
                <button
                  key={study.label}
                  type="button"
                  role="tab"
                  aria-selected={index === activeCase}
                  className={index === activeCase ? 'is-active' : ''}
                  onPointerEnter={() => {
                    setActiveCase(index);
                  }}
                  onFocus={() => {
                    setActiveCase(index);
                  }}
                  onClick={() => {
                    setActiveCase(index);
                  }}
                >
                  {study.label}
                  <span>0{index + 1}</span>
                </button>
              ))}
            </div>
            <div
              className={`ra-case ra-case--${String(activeCase)}`}
              role="tabpanel"
            >
              <div className="ra-case__art" aria-hidden="true">
                <img
                  className="ra-case__photo"
                  key={caseVisuals[activeCase]}
                  src={caseVisuals[activeCase] ?? caseVisuals[0]}
                  alt=""
                />
                <span className="ra-orb ra-orb--one" />
                <span className="ra-orb ra-orb--two" />
                <span className="ra-grid-lines" />
                <div className="ra-case__window">
                  <i />
                  <i />
                  <i />
                  <b>{activeStudy.tag}</b>
                  <strong>AI</strong>
                </div>
              </div>
              <div className="ra-case__copy">
                <p>{activeStudy.tag}</p>
                <h3>{activeStudy.title}</h3>
                <p>{activeStudy.text}</p>
                <div className="ra-case__stat">
                  <strong>{activeStudy.stat}</strong>
                  <span>{activeStudy.statLabel}</span>
                </div>
                <a href="#contact">
                  {content.primaryCta} <span>↘</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="ra-section ra-services" data-section="SERVICES">
          <span className="ra-vertical-label" aria-hidden="true">
            SERVICES
          </span>
          <div className="ra-shell">
            <div className="ra-section__heading ra-section__heading--wide">
              <p className="ra-eyebrow">{content.servicesEyebrow}</p>
              <h2>{content.servicesTitle}</h2>
            </div>
            <div className="ra-service-grid">
              {content.services.map(([number, title, text], index) => (
                <article className="ra-service" key={number}>
                  <div className="ra-service__visual">
                    <img
                      className="ra-service__image ra-service__image--base"
                      src={
                        serviceVisuals[index] ??
                        '/assets/images/main/processing.png'
                      }
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                    <img
                      className="ra-service__image ra-service__image--preview"
                      src={
                        serviceHoverVisuals[index] ??
                        '/assets/images/og-image.png'
                      }
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                    <span>{number}</span>
                  </div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <a
                    href="#contact"
                    aria-label={`${title} ${content.primaryCta}`}
                  >
                    ↘
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="ra-partners" aria-label={content.partnerTitle}>
          <div className="ra-shell">
            <p>{content.partnerTitle}</p>
            <div>
              <span>aSSIST</span>
              <span>GBSA</span>
              <span>송정세무회계</span>
              <span>피엔케이국제법률사무소</span>
              <span>호반건설</span>
              <span>우아한형제들</span>
              <span>NHN CLOUD</span>
            </div>
          </div>
        </section>

        <section
          id="process"
          className="ra-section ra-process"
          data-section="PROCESS"
        >
          <span className="ra-vertical-label" aria-hidden="true">
            PROCESS
          </span>
          <div className="ra-shell ra-process__layout">
            <div className="ra-section__heading">
              <p className="ra-eyebrow">{content.processEyebrow}</p>
              <h2>{content.processTitle}</h2>
            </div>
            <ol className="ra-process__steps">
              {content.process.map(([number, title, text]) => (
                <li key={number}>
                  <div className="ra-process__badge">
                    <span>STEP {number}</span>
                    <h3>{title}</h3>
                  </div>
                  <p>{text}</p>
                </li>
              ))}
            </ol>
            <div
              className="ra-process__gallery"
              aria-label={
                language === 'ko'
                  ? 'XAIKOREA의 실제 업무 현장'
                  : 'Inside XAIKOREA'
              }
            >
              <figure>
                <img
                  src="/assets/images/company/engineering-at-work.jpg"
                  alt={
                    language === 'ko'
                      ? '온프레미스 AI 장비를 점검하는 엔지니어'
                      : 'Engineer validating on-premise AI infrastructure'
                  }
                  loading="lazy"
                />
                <figcaption>ENGINEERING · ON-PREMISE AI</figcaption>
              </figure>
              <figure>
                <img
                  src="/assets/images/company/ai-transformation-conference.jpg"
                  alt={
                    language === 'ko'
                      ? '중소기업 AI 대전환 세미나 현장'
                      : 'AI transformation conference'
                  }
                  loading="lazy"
                />
                <figcaption>RESEARCH · AI TRANSFORMATION</figcaption>
              </figure>
              <figure>
                <img
                  src="/assets/images/company/baemin-square-campus.jpg"
                  alt={
                    language === 'ko'
                      ? 'XAIKOREA가 위치한 배민스퀘어'
                      : 'Baemin Square, home of XAIKOREA'
                  }
                  loading="lazy"
                />
                <figcaption>OFFICE · BAEMIN SQUARE</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="ra-section ra-principles" data-section="PRINCIPLES">
          <span className="ra-vertical-label" aria-hidden="true">
            PRINCIPLES
          </span>
          <div className="ra-shell">
            <div className="ra-principles__intro">
              <div>
                <p className="ra-eyebrow">{content.principlesEyebrow}</p>
                <h2>{content.principlesTitle}</h2>
              </div>
              <p>{content.principlesText}</p>
            </div>
            <ol className="ra-principles__grid">
              {content.principles.map(([number, title, text]) => (
                <li key={number}>
                  <span>{number}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          id="experts"
          className="ra-section ra-experts"
          data-section="NETWORK"
        >
          <span
            className="ra-vertical-label ra-vertical-label--light"
            aria-hidden="true"
          >
            NETWORK
          </span>
          <div className="ra-shell">
            <p className="ra-eyebrow ra-eyebrow--light">
              {content.expertsEyebrow}
            </p>
            <div className="ra-experts__intro">
              <h2>{content.expertsTitle}</h2>
              <p>{content.expertsText}</p>
            </div>
            <div className="ra-expert-grid">
              {content.expertCards.map(([title, text], index) => (
                <article key={title}>
                  <img
                    src={expertVisuals[index] ?? expertVisuals[0]}
                    alt=""
                    loading="lazy"
                  />
                  <div className="ra-expert-shade" />
                  <span>0{index + 1}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="request"
          className="ra-section ra-request"
          aria-labelledby="request-title"
          data-section="REQUEST"
        >
          <span className="ra-vertical-label" aria-hidden="true">
            REQUEST
          </span>
          <div className="ra-shell">
            <p className="ra-eyebrow">{content.requestEyebrow}</p>
            <h2 id="request-title">
              {language === 'ko'
                ? '다음 대화를 시작해 보세요.'
                : 'Start the next conversation.'}
            </h2>
            <div className="ra-request__grid">
              {content.requestCards.map(([label, title, cta, href], index) => (
                <article key={label}>
                  <span>
                    0{index + 1} · {label}
                  </span>
                  <h3>{title}</h3>
                  {href.startsWith('/') ? (
                    <Link to={href}>
                      {cta}
                      <i>↗</i>
                    </Link>
                  ) : (
                    <a href={href}>
                      {cta}
                      <i>↘</i>
                    </a>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="contact"
          className="ra-section ra-contact"
          aria-labelledby="contact-title"
          data-section="CONTACT"
        >
          <span className="ra-vertical-label" aria-hidden="true">
            REQUEST
          </span>
          <div className="ra-shell ra-contact__layout">
            <div className="ra-contact__intro">
              <p className="ra-eyebrow">{content.contactEyebrow}</p>
              <h2 id="contact-title">{content.contactTitle}</h2>
              <p>{content.contactText}</p>
              <a href="mailto:contact@xaikorea.ai.kr">
                contact@xaikorea.ai.kr <span>↗</span>
              </a>
              <dl className="ra-contact__facts">
                <div>
                  <dt>{content.contactInfo.officeLabel}</dt>
                  <dd>{content.contactInfo.officeAddress}</dd>
                </div>
                <div>
                  <dt>{content.contactInfo.phoneLabel}</dt>
                  <dd>{content.contactInfo.phone}</dd>
                </div>
                <div>
                  <dt>{content.contactInfo.emailLabel}</dt>
                  <dd>contact@xaikorea.ai.kr</dd>
                </div>
              </dl>
            </div>
            <form
              className="ra-contact__form"
              onSubmit={(event) => {
                void handleSubmit(event);
              }}
            >
              <div className="ra-form-grid">
                <label>
                  {content.form.name}
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={content.form.namePlaceholder}
                    autoComplete="name"
                    required
                  />
                </label>
                <label>
                  {content.form.company}
                  <input
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder={content.form.companyPlaceholder}
                    autoComplete="organization"
                  />
                </label>
                <label>
                  {content.form.email}
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={content.form.emailPlaceholder}
                    autoComplete="email"
                    required
                  />
                </label>
                <label>
                  {content.form.phone}
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={content.form.phonePlaceholder}
                    autoComplete="tel"
                  />
                </label>
                <label>
                  {content.form.type}
                  <select
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleChange}
                  >
                    <option value="">{content.form.selectDefault}</option>
                    {content.form.types.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <label>
                  {content.form.budget}
                  <select
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                  >
                    <option value="">{content.form.selectDefault}</option>
                    {content.form.budgets.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="ra-form-message">
                {content.form.message}
                <textarea
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={content.form.messagePlaceholder}
                  required
                />
              </label>
              <button
                className="ra-submit"
                type="submit"
                disabled={submission === 'sending'}
              >
                {submission === 'sending'
                  ? content.form.sending
                  : content.form.send}
                <span>↗</span>
              </button>
              {submission !== 'idle' && (
                <p
                  className={`ra-form-status ra-form-status--${submission}`}
                  role="status"
                >
                  {submission === 'error'
                    ? content.form.error
                    : contactEndpoint !== undefined
                      ? content.form.apiSent
                      : content.form.sent}
                </p>
              )}
            </form>
          </div>
        </section>

        <section
          id="location"
          className="ra-location"
          aria-labelledby="location-title"
        >
          <div className="ra-shell ra-location__heading">
            <div>
              <p className="ra-eyebrow">LOCATION</p>
              <h2 id="location-title">
                {language === 'ko'
                  ? '배민스퀘어에서 만나요.'
                  : 'Meet us at Baemin Square.'}
              </h2>
            </div>
            <div>
              <span>{content.contactInfo.officeLabel}</span>
              <p>{content.contactInfo.officeAddress}</p>
              <a href={MAP_LINK_URL} target="_blank" rel="noreferrer">
                {language === 'ko' ? '지도 앱에서 보기' : 'Open in Maps'} ↗
              </a>
            </div>
          </div>
          <div className="ra-map">
            <iframe
              title={
                language === 'ko'
                  ? 'XAIKOREA 본사 위치 지도'
                  : 'Map showing XAIKOREA head office'
              }
              src={MAP_EMBED_URL}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </section>
      </main>

      <button
        className={`ra-back-to-top ${isScrolled ? 'is-visible' : ''}`}
        type="button"
        onClick={() => {
          scrollToTop();
        }}
        aria-label={language === 'ko' ? '페이지 맨 위로 이동' : 'Back to top'}
      >
        ↑<span>TOP</span>
      </button>

      <footer className="ra-footer">
        <div className="ra-shell">
          <a className="ra-brand" href="#top">
            <span className="ra-brand__mark" aria-hidden="true">
              <img src="/assets/images/logo/xaikorea-corporate.png" alt="" />
            </span>
            <span className="ra-brand__word">XAIKOREA</span>
          </a>
          <p>{content.footer}</p>
          <div>
            <a href="/privacy">{content.privacy}</a>
            <a href="/terms">{content.terms}</a>
          </div>
          <small>{content.rights}</small>
        </div>
      </footer>
    </div>
  );
}
