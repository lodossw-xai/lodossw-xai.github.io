import { useEffect, useRef, useState, type ReactElement } from 'react'
import { Link } from 'react-router-dom'
import '../styles/agency-pages.css'

type AgencyPageType = 'about' | 'work' | 'careers' | 'contact'
type ProjectCategory = 'ALL' | 'RESEARCH' | 'TAX' | 'GOVERNANCE'

type AgencyPageProps = {
  page: AgencyPageType
}

type Project = {
  title: string
  category: Exclude<ProjectCategory, 'ALL'>
  caption: string
  image: string
  result: string
  tone: string
  tall?: boolean
  logo?: boolean
  contain?: boolean
}

const navigation = [
  ['HOME', '/'],
  ['ABOUT', '/about'],
  ['WORK', '/work'],
  ['CAREERS', '/careers'],
  ['CONTACT', '/contact'],
] as const

const previewImages: Record<string, string> = {
  '/': '/assets/images/company/baemin-square-night.jpg',
  '/about': '/assets/images/company/office-lounge.jpg',
  '/work': '/assets/images/company/hoban-ai-workspace.jpg',
  '/careers': '/assets/images/company/open-workspace.jpg',
  '/contact': '/assets/images/company/baemin-square-campus.jpg',
}

const projects: Project[] = [
  { title: 'Evidence Finder', category: 'RESEARCH', caption: '연구 근거 탐색 및 출처 연결', image: '/assets/images/company/cloa-evidence-vault.jpg', result: '리서치 시간 85% 단축', tone: 'blue', tall: true, contain: true },
  { title: 'Tax Navigator', category: 'TAX', caption: '세무 규정·판례 질의 시스템', image: '/assets/images/company/codebase-intelligence-platform.jpg', result: '답변 근거 추적률 100%', tone: 'red', contain: true },
  { title: 'Policy Review', category: 'GOVERNANCE', caption: '규정 문서 비교 및 변경점 검토', image: '/assets/images/company/meeting-ai-security.jpg', result: '검토 처리량 3.2배', tone: 'black', tall: true, contain: true },
  { title: 'Agent Harness', category: 'RESEARCH', caption: '에이전트 하네스 엔지니어링 교육·실험', image: '/assets/images/company/agent-harness-engineering.jpg', result: 'AI 엔지니어링 체계화', tone: 'ivory' },
  { title: 'Hoban AI Voice', category: 'GOVERNANCE', caption: '회의 녹음·전사·화자 분리 기반 지식 워크스페이스', image: '/assets/images/company/hoban-ai-workspace.jpg', result: '안전한 온프레미스 연결', tone: 'navy' },
  { title: 'Edge AI Lab', category: 'RESEARCH', caption: 'Raspberry Pi 기반 엣지 AI 검증 환경', image: '/assets/images/company/raspberry-pi-edge.jpg', result: '현장형 프로토타입 구축', tone: 'grey' },
  { title: 'Secure Edge Gateway', category: 'GOVERNANCE', caption: '로컬 데이터 보호를 위한 저장·연산 인프라', image: '/assets/images/company/edge-storage-array.jpg', result: '데이터 통제 범위 강화', tone: 'mint' },
  { title: 'AI Governance Studio', category: 'GOVERNANCE', caption: 'AI 전환 전략과 신뢰 운영 기준 연구', image: '/assets/images/company/ai-transformation-conference.jpg', result: '산업 현장 인사이트 연결', tone: 'sand', tall: true },
  { title: 'Technology Protection', category: 'GOVERNANCE', caption: '기술보호 선도기업 운영 체계', image: '/assets/images/company/technology-protection-company.jpg', result: '기술·지식재산 보호 강화', tone: 'violet' },
  { title: 'On-Premise AI', category: 'RESEARCH', caption: '조직 내부에서 운영되는 AI 인프라 실증', image: '/assets/images/company/server-mainboard.jpg', result: '폐쇄망·로컬 환경 대응', tone: 'orange' },
  { title: 'Knowledge Engineering', category: 'RESEARCH', caption: '도메인 지식과 컴퓨팅 환경의 통합 검증', image: '/assets/images/company/engineering-at-work.jpg', result: '현장 중심 검증 루프', tone: 'white' },
  { title: 'Decision Room', category: 'TAX', caption: '근거 중심 의사결정과 협업을 위한 공간', image: '/assets/images/company/office-lounge.jpg', result: '판단 맥락 구조화', tone: 'green', tall: true },
]

const businessItems = [
  ['01', 'KNOWLEDGE\nDISCOVERY', '문서와 데이터, 외부 기준을 하나의 질문 경험으로 연결하고 원문에 닿는 답변을 설계합니다.'],
  ['02', 'DOCUMENT\nINTELLIGENCE', '계약·정책·세무 문서의 쟁점과 변경점을 비교하고 사람이 확인할 검토 지점을 제시합니다.'],
  ['03', 'TRUSTED AI\nOPERATIONS', '권한, 출처, 평가, 승인 이력을 묶어 조직이 안심하고 운영할 수 있는 구조를 만듭니다.'],
  ['04', 'AI STRATEGY\n& CONSULTING', '업무 진단부터 파일럿, 품질 기준과 확산 계획까지 실제 도입에 필요한 경로를 함께 설계합니다.'],
] as const

const awards = [
  ['2026.08', '온프레미스 AI 회의 인텔리전스 플랫폼 GUI·아이콘 디자인 화면집 v1.0', '저작권 등록 · 08.11', '/assets/images/company/office-design-wall.jpg'],
  ['2026.08', '온프레미스 AI 회의 인텔리전스 플랫폼 v1.0', '프로그램 저작권 · 08.03', '/assets/images/company/hoban-ai-workspace.jpg'],
  ['2026.02', '연구개발전담부서 인정', '인정서 발급 · 02.20', '/assets/images/company/engineering-at-work.jpg'],
  ['2026.02', '벤처기업 확인 · 혁신성장유형', '유효기간 · 2029.02.03까지', '/assets/images/company/baemin-square-campus.jpg'],
] as const

const recruitParts = [
  ['PLANNING', '고객의 핵심 가치를 정의하고 복잡한 업무를 명료한 제품 흐름으로 설계합니다.'],
  ['DESIGN', '정보의 우선순위와 사용자의 판단 과정을 시각적 경험으로 바꿉니다.'],
  ['AI ENGINEERING', '검색·생성·평가 기술을 검증 가능한 서비스 구조로 구현합니다.'],
  ['DOMAIN RESEARCH', '법·세무·정책·연구 자료를 분석하고 AI가 이해할 지식 체계로 정리합니다.'],
] as const

const hiringProcess = [
  ['STEP 1', '서류 검토'],
  ['STEP 2', '직무 인터뷰'],
  ['STEP 3', '협업 인터뷰'],
  ['STEP 4', '최종 합류'],
] as const

const welfare = [
  ['01', '유연한 업무 시간', '집중할 수 있는 리듬을 존중합니다.'],
  ['02', '리서치 지원', '업무에 필요한 도서와 자료를 지원합니다.'],
  ['03', '성장 예산', '교육·세미나·컨퍼런스 참여를 돕습니다.'],
  ['04', '장비 선택', '역할에 맞는 업무 환경을 함께 구성합니다.'],
  ['05', '건강한 휴식', '연차와 휴식을 눈치 보지 않고 사용합니다.'],
  ['06', '투명한 공유', '맥락과 목표를 열어 두고 함께 결정합니다.'],
  ['07', '전문가 네트워크', '도메인 전문가와 깊이 있게 교류합니다.'],
  ['08', '팀 리트릿', '일에서 벗어나 새로운 관점을 만납니다.'],
] as const

const workspaceSlides = [
  ['/assets/images/company/open-workspace.jpg', '판교 배민스퀘어의 집중 업무 공간'],
  ['/assets/images/company/office-lounge.jpg', '아이디어와 대화를 이어가는 오픈 라운지'],
  ['/assets/images/company/engineering-at-work.jpg', 'AI 인프라를 직접 검증하는 엔지니어링 현장'],
] as const

const address = '경기도 성남시 금토로80번길 40, B동 배민스퀘어 301호'
const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(address)}&z=16&output=embed&hl=ko`
const mapLinkUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`

function AgencyHeader({ current }: { current: AgencyPageType }): ReactElement {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [preview, setPreview] = useState(previewImages[`/${current}`] ?? previewImages['/'])
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const update = (): void => {
      const maximum = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
      document.documentElement.style.setProperty('--rp-progress', String(window.scrollY / maximum))
      setScrolled(window.scrollY > 56)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => {
      window.removeEventListener('scroll', update)
    }
  }, [])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && open) {
        setOpen(false)
        buttonRef.current?.focus()
      }
      if (event.key === 'Tab' && open) {
        const items = panelRef.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])')
        if (items === undefined || items.length === 0) {
          return
        }
        const first = items[0]
        const last = items[items.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }
    }
    if (open) {
      document.body.style.overflow = 'hidden'
      window.requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>('.rp-menu__nav a')?.focus())
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return <>
    <div className="rp-progress" aria-hidden="true"><span /></div>
    <header className={`rp-header ${scrolled ? 'is-scrolled' : ''} ${open ? 'is-open' : ''}`}>
      <Link className="rp-brand" to="/" aria-label="XAIKOREA home"><span className="rp-brand__mark" aria-hidden="true"><img src="/assets/images/logo/xaikorea-corporate.png" alt="" /></span><span className="rp-brand__word">XAIKOREA</span></Link>
      <button ref={buttonRef} className="rp-menu-button" type="button" aria-expanded={open} aria-controls="agency-menu" aria-label={open ? '메뉴 닫기' : '메뉴 열기'} onClick={() => { setOpen((value) => !value) }}><i /><i /></button>
    </header>
    <div ref={panelRef} id="agency-menu" className={`rp-menu ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      <div className="rp-menu__preview" aria-hidden="true"><img src={preview} alt="" /></div>
      <div className="rp-menu__meta">
        <p>EXPLAINABLE INTELLIGENCE<br />FOR WORK YOU CAN TRUST.</p>
        <div><span>PROJECT REQUEST</span><a href="mailto:contact@xaikorea.ai.kr">contact@xaikorea.ai.kr</a></div>
        <div><span>OFFICE</span><p>PANGYO · KOREA</p></div>
      </div>
      <nav className="rp-menu__nav" aria-label="전체 메뉴">
        {navigation.map(([label, path], index) => <Link key={path} className={path === `/${current}` ? 'is-current' : ''} to={path} onPointerEnter={() => { setPreview(previewImages[path] ?? previewImages['/']) }} onFocus={() => { setPreview(previewImages[path] ?? previewImages['/']) }} onClick={() => { setOpen(false) }}><span>0{index + 1}</span>{label}</Link>)}
      </nav>
    </div>
  </>
}

function AgencyFooter(): ReactElement {
  return <footer className="rp-footer">
    <div className="rp-footer__image" aria-hidden="true"><img src="/assets/images/company/baemin-square-night.jpg" alt="" loading="lazy" /></div>
    <div className="rp-footer__grid">
      <div className="rp-footer__company"><img src="/assets/images/logo/xaikorea-corporate.png" alt="XAIKOREA 로고" /><div><span>Company</span><strong>XAIKOREA</strong></div></div>
      <div className="rp-footer__address"><span>Address</span><strong>{address}</strong></div>
      <div><span>Project Request</span><a href="mailto:contact@xaikorea.ai.kr">contact@xaikorea.ai.kr</a></div>
      <div><span>Tel</span><a href="tel:+821032535409">+82 10 3253 5409</a></div>
      <div className="rp-footer__actions"><Link to="/contact">프로젝트 문의 <b>↗</b></Link><a href="mailto:contact@xaikorea.ai.kr?subject=XAI%20Korea%20회사소개%20요청">회사소개 요청 <b>□</b></a></div>
    </div>
    <div className="rp-footer__bottom"><p>© 2026 XAIKOREA</p><div><Link to="/privacy">PRIVACY</Link><Link to="/terms">TERMS</Link></div></div>
  </footer>
}

function AboutPage(): ReactElement {
  const [awardPreview, setAwardPreview] = useState<string>(awards[0][3])
  return <>
    <section className="rp-hero rp-hero--about">
      <img src="/assets/images/company/office-lounge.jpg" alt="" />
      <div className="rp-hero__veil" />
      <div className="rp-hero__copy"><p>ABOUT XAIKOREA</p><h1>CREATIVE THINKING.<br />PROVABLE TECHNOLOGY.</h1><span>도메인 지식과 AI 기술을 연결해, 설명할 수 있는 의사결정 경험을 만듭니다.</span></div>
      <a href="#business" className="rp-scroll-cue">SCROLL <i /></a>
    </section>
    <section id="business" className="rp-section rp-business rp-reveal">
      <div className="rp-section-title"><span>01</span><h2>BUSINESS</h2></div>
      <div className="rp-business__grid">{businessItems.map(([number, title, description]) => <article key={number}><span>{number}</span><h3>{title.split('\n').map((line) => <span key={line}>{line}</span>)}</h3><p>{description}</p></article>)}</div>
    </section>
    <section className="rp-section rp-awards rp-reveal">
      <div className="rp-section-title"><span>02</span><h2>MILESTONES</h2></div>
      <p className="rp-section-lead">공식 확인서와 한국저작권위원회 등록증을 기준으로 검증된 이력만 안내합니다.</p>
      <div className="rp-awards__layout">
        <div className="rp-awards__list">{awards.map(([year, title, result, image]) => <button key={title} type="button" onPointerEnter={() => { setAwardPreview(image) }} onFocus={() => { setAwardPreview(image) }}><span>{year}</span><strong>{title}</strong><em>{result}</em><b>↗</b></button>)}</div>
        <div className="rp-awards__preview"><img key={awardPreview} src={awardPreview} alt="선택한 이력 미리보기" /></div>
      </div>
    </section>
  </>
}

function WorkPage(): ReactElement {
  const [filter, setFilter] = useState<ProjectCategory>('ALL')
  const [selected, setSelected] = useState<Project | null>(null)
  const visibleProjects = filter === 'ALL' ? projects : projects.filter((project) => project.category === filter)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setSelected(null)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  return <>
    <section className="rp-work-intro">
      <p>SELECTED PROJECTS · 2023—2026</p>
      <h1>HOW WE<br />MAKE TRUST.</h1>
      <span>복잡한 지식과 기술을 누구나 확인하고 실행할 수 있는 경험으로 바꿉니다.</span>
    </section>
    <section className="rp-work-grid-section rp-reveal">
      <div className="rp-filter" role="toolbar" aria-label="프로젝트 필터">{(['ALL', 'RESEARCH', 'TAX', 'GOVERNANCE'] as ProjectCategory[]).map((item) => <button key={item} type="button" className={filter === item ? 'is-active' : ''} aria-pressed={filter === item} onClick={() => { setFilter(item) }}>{item}</button>)}</div>
      <div className="rp-project-grid" aria-live="polite">{visibleProjects.map((project) => <button className={`rp-project rp-project--${project.tone} ${project.tall ?? false ? 'is-tall' : ''} ${project.logo ?? false ? 'is-logo' : ''} ${project.contain ?? false ? 'is-contain' : ''}`} type="button" key={project.title} aria-label={`${project.title}: ${project.caption}`} onClick={() => { setSelected(project) }}>
        <img src={project.image} alt="" loading="lazy" decoding="async" />
        <span className="rp-project__shade" />
        <span className="rp-project__number">{String(projects.indexOf(project) + 1).padStart(2, '0')}</span>
        <span className="rp-project__copy"><em>{project.category}</em><strong>{project.title}</strong><small>{project.caption}</small></span>
        <span className="rp-project__open">VIEW ↗</span>
      </button>)}</div>
    </section>
    <div className={`rp-project-modal ${selected !== null ? 'is-open' : ''}`} role="dialog" aria-modal="true" aria-hidden={selected === null} aria-label="프로젝트 상세 미리보기">
      {selected !== null && <div className="rp-project-modal__panel">
        <button className="rp-project-modal__close" type="button" onClick={() => { setSelected(null) }} aria-label="프로젝트 상세 닫기">×</button>
        <div className={`rp-project-modal__visual ${selected.contain ?? false ? 'is-contain' : ''}`}><img src={selected.image} alt="" /></div>
        <div className="rp-project-modal__copy"><span>{selected.category} · XAIKOREA</span><h2>{selected.title}</h2><p>{selected.caption}</p><dl><div><dt>OUTCOME</dt><dd>{selected.result}</dd></div><div><dt>SCOPE</dt><dd>Strategy · UX · AI Engineering</dd></div></dl><Link to="/contact">프로젝트 상담하기 ↗</Link></div>
      </div>}
    </div>
  </>
}

function CareersPage(): ReactElement {
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }
    const timer = window.setInterval(() => {
      setSlide((value) => (value + 1) % workspaceSlides.length)
    }, 5200)
    return () => {
      window.clearInterval(timer)
    }
  }, [])

  const moveSlide = (direction: number): void => {
    setSlide((value) => (value + direction + workspaceSlides.length) % workspaceSlides.length)
  }

  return <>
    <section className="rp-hero rp-hero--careers">
      <img src="/assets/images/company/open-workspace.jpg" alt="" />
      <div className="rp-hero__veil" />
      <div className="rp-hero__copy"><p>CAREERS AT XAIKOREA</p><h1>BUILD YOUR CAREER<br />WITH US.</h1><span>오늘보다 더 나은 질문을 던지고, 신뢰할 수 있는 AI의 기준을 함께 만듭니다.</span></div>
      <a href="#recruit" className="rp-scroll-cue">JOIN THE TEAM <i /></a>
    </section>
    <section id="recruit" className="rp-section rp-recruit rp-reveal">
      <div className="rp-section-title"><span>01</span><h2>RECRUIT PART</h2></div>
      <div className="rp-recruit__grid">{recruitParts.map(([title, text]) => <article key={title}><h3>{title}</h3><p>{text}</p><a href="mailto:contact@xaikorea.ai.kr?subject=XAI%20Korea%20채용%20문의">OPEN APPLICATION ↗</a></article>)}</div>
    </section>
    <section className="rp-section rp-hiring rp-reveal">
      <div className="rp-section-title"><span>02</span><h2>PROCESS</h2></div>
      <ol>{hiringProcess.map(([step, title]) => <li key={step}><span>{step}</span><strong>{title}</strong></li>)}</ol>
    </section>
    <section className="rp-section rp-welfare rp-reveal">
      <div className="rp-section-title"><span>03</span><h2>WELFARE</h2></div>
      <p className="rp-section-lead">좋은 결과는 오래 몰입할 수 있는 환경에서 나온다고 믿습니다.</p>
      <div className="rp-welfare__grid">{welfare.map(([number, title, text]) => <article key={number}><span>{number}</span><i aria-hidden="true" /><h3>{title}</h3><p>{text}</p></article>)}</div>
    </section>
    <section className="rp-section rp-workspace rp-reveal">
      <div className="rp-workspace__copy"><div className="rp-section-title"><span>04</span><h2>WORKSPACE</h2></div><p>{workspaceSlides[slide]?.[1]}</p><div><button type="button" onClick={() => { moveSlide(-1) }} aria-label="이전 공간">←</button><button type="button" onClick={() => { moveSlide(1) }} aria-label="다음 공간">→</button></div></div>
      <div className="rp-workspace__visual"><img key={workspaceSlides[slide]?.[0]} src={workspaceSlides[slide]?.[0]} alt={workspaceSlides[slide]?.[1]} /><span>{String(slide + 1).padStart(2, '0')} / 03</span></div>
    </section>
    <section className="rp-career-cta"><p>YOUR STORY MATTERS.</p><h2>당신의 이야기를<br />들려주세요.</h2><a href="mailto:contact@xaikorea.ai.kr?subject=XAI%20Korea%20채용%20문의">OPEN APPLICATION <span>↗</span></a></section>
  </>
}

function ContactPage(): ReactElement {
  return <>
    <section className="rp-contact-hero">
      <div><p>CONTACT XAIKOREA</p><h1>A PARTNER FOR<br />BETTER DECISIONS.</h1><span>설명 가능한 AI가 필요한 프로젝트라면 편하게 이야기를 들려주세요.</span></div>
      <dl>
        <div><dt>Address.</dt><dd>{address}</dd></div>
        <div><dt>Tel.</dt><dd><a href="tel:+821032535409">+82 10 3253 5409</a></dd></div>
        <div><dt>Mail.</dt><dd><a href="mailto:contact@xaikorea.ai.kr">contact@xaikorea.ai.kr</a></dd></div>
        <div><dt>Project.</dt><dd><a href="mailto:contact@xaikorea.ai.kr?subject=XAI%20Korea%20프로젝트%20문의">프로젝트 문의 보내기 ↗</a></dd></div>
      </dl>
    </section>
    <section className="rp-contact-map rp-reveal">
      <iframe title="XAIKOREA 판교 오피스 위치" src={mapEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      <a href={mapLinkUrl} target="_blank" rel="noreferrer">GOOGLE MAPS에서 크게 보기 ↗</a>
    </section>
    <section className="rp-contact-next"><p>NEXT STEP</p><h2>프로젝트의 현재 단계와<br />해결하고 싶은 문제를 알려주세요.</h2><Link to="/#contact">문의 양식 작성하기 <span>↗</span></Link></section>
  </>
}

export default function AgencyPage({ page }: AgencyPageProps): ReactElement {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = `XAIKOREA | ${page.toUpperCase()}`
    const targets = document.querySelectorAll<HTMLElement>('.rp-reveal')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' })
    targets.forEach((target) => {
      observer.observe(target)
    })
    return () => {
      observer.disconnect()
    }
  }, [page])

  return <div className={`rp-site rp-site--${page}`}>
    <a className="rp-skip" href="#agency-main">본문 바로가기</a>
    <AgencyHeader current={page} />
    <span className="rp-side-label" aria-hidden="true">{page.toUpperCase()}</span>
    <main id="agency-main">
      {page === 'about' && <AboutPage />}
      {page === 'work' && <WorkPage />}
      {page === 'careers' && <CareersPage />}
      {page === 'contact' && <ContactPage />}
    </main>
    <AgencyFooter />
  </div>
}
