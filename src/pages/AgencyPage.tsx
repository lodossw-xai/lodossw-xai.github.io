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
}

const navigation = [
  ['HOME', '/'],
  ['ABOUT', '/about'],
  ['WORK', '/work'],
  ['CAREERS', '/careers'],
  ['CONTACT', '/contact'],
] as const

const previewImages: Record<string, string> = {
  '/': '/assets/images/main/processing_01.png',
  '/about': '/assets/images/main/processing.png',
  '/work': '/assets/images/og-image.png',
  '/careers': '/assets/images/members/kim_jh.webp',
  '/contact': '/assets/images/partners/gbsa.png',
}

const projects: Project[] = [
  { title: 'Evidence Finder', category: 'RESEARCH', caption: '연구 근거 탐색 및 출처 연결', image: '/assets/images/main/processing.png', result: '리서치 시간 85% 단축', tone: 'blue', tall: true },
  { title: 'Tax Navigator', category: 'TAX', caption: '세무 규정·판례 질의 시스템', image: '/assets/images/og-image.png', result: '답변 근거 추적률 100%', tone: 'red' },
  { title: 'Policy Review', category: 'GOVERNANCE', caption: '규정 문서 비교 및 변경점 검토', image: '/assets/images/main/processing_01.png', result: '검토 처리량 3.2배', tone: 'black', tall: true },
  { title: 'ASSIST', category: 'RESEARCH', caption: '지식 검색 경험 설계', image: '/assets/images/partners/assist.webp', result: '통합 검색 경험 구축', tone: 'ivory', logo: true },
  { title: 'Audit Trail', category: 'GOVERNANCE', caption: 'AI 응답 이력과 승인 흐름', image: '/assets/images/advisors/ko_wooju.png', result: '전 과정 감사 가능', tone: 'navy' },
  { title: 'GBSA Lab', category: 'RESEARCH', caption: '기관형 지식 허브', image: '/assets/images/partners/gbsa.png', result: '산학 협력 기반 마련', tone: 'grey', logo: true },
  { title: 'Clause Compare', category: 'TAX', caption: '조항·고시 자동 비교', image: '/assets/images/main/processing.png', result: '개정 검토 자동화', tone: 'mint' },
  { title: 'Expert Network', category: 'GOVERNANCE', caption: '전문가 검토 연결 시스템', image: '/assets/images/advisors/park_wonil.jpg', result: '사람 중심 승인 설계', tone: 'sand', tall: true },
  { title: 'Research Brief', category: 'RESEARCH', caption: '논문·보고서 브리핑', image: '/assets/images/advisors/song_junwon.png', result: '출처 포함 요약', tone: 'violet' },
  { title: 'Compliance Desk', category: 'TAX', caption: '업무별 컴플라이언스 지원', image: '/assets/images/main/processing_01.png', result: '리스크 조기 확인', tone: 'orange' },
  { title: 'KOSA Partnership', category: 'GOVERNANCE', caption: '신뢰 가능한 AI 생태계', image: '/assets/images/partners/kosa.jpg', result: '산업 네트워크 확장', tone: 'white', logo: true },
  { title: 'Decision Room', category: 'RESEARCH', caption: '근거 중심 의사결정 보드', image: '/assets/images/advisors/jung_sunghoon.jpg', result: '판단 맥락 구조화', tone: 'green', tall: true },
]

const businessItems = [
  ['01', 'KNOWLEDGE\nDISCOVERY', '문서와 데이터, 외부 기준을 하나의 질문 경험으로 연결하고 원문에 닿는 답변을 설계합니다.'],
  ['02', 'DOCUMENT\nINTELLIGENCE', '계약·정책·세무 문서의 쟁점과 변경점을 비교하고 사람이 확인할 검토 지점을 제시합니다.'],
  ['03', 'TRUSTED AI\nOPERATIONS', '권한, 출처, 평가, 승인 이력을 묶어 조직이 안심하고 운영할 수 있는 구조를 만듭니다.'],
  ['04', 'AI STRATEGY\n& CONSULTING', '업무 진단부터 파일럿, 품질 기준과 확산 계획까지 실제 도입에 필요한 경로를 함께 설계합니다.'],
] as const

const awards = [
  ['2025', 'XAI Korea 서비스 고도화', 'Evidence-first AI', '/assets/images/main/processing.png'],
  ['2024', '경기스타트업랩 협력', 'Innovation network', '/assets/images/partners/gbsa.png'],
  ['2024', '설명 가능한 지식 탐색', 'Product launch', '/assets/images/og-image.png'],
  ['2023', 'AI·도메인 전문가 네트워크', 'Advisory group', '/assets/images/advisors/ko_wooju.png'],
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
  ['/assets/images/main/processing_01.png', '생각을 빠르게 시각화하는 프로젝트 룸'],
  ['/assets/images/main/processing.png', '근거와 데이터를 함께 검토하는 리서치 데스크'],
  ['/assets/images/og-image.png', '도메인과 기술이 만나는 협업 세션'],
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
      <Link className="rp-brand" to="/" aria-label="XAI Korea home"><span className="rp-brand__mark" aria-hidden="true"><img src="/assets/images/logo/xaikorea-corporate.png" alt="" /></span><span>XAI</span><b>KOREA</b></Link>
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
    <div className="rp-footer__image" aria-hidden="true"><img src="/assets/images/main/processing.png" alt="" loading="lazy" /></div>
    <div className="rp-footer__grid">
      <div className="rp-footer__company"><img src="/assets/images/logo/xaikorea-corporate.png" alt="XAI Korea 로고" /><div><span>Company</span><strong>XAI Korea</strong></div></div>
      <div className="rp-footer__address"><span>Address</span><strong>{address}</strong></div>
      <div><span>Project Request</span><a href="mailto:contact@xaikorea.ai.kr">contact@xaikorea.ai.kr</a></div>
      <div><span>Tel</span><a href="tel:+821032535409">+82 10 3253 5409</a></div>
      <div className="rp-footer__actions"><Link to="/contact">프로젝트 문의 <b>↗</b></Link><a href="mailto:contact@xaikorea.ai.kr?subject=XAI%20Korea%20회사소개%20요청">회사소개 요청 <b>□</b></a></div>
    </div>
    <div className="rp-footer__bottom"><p>© 2026 XAI Korea</p><div><Link to="/privacy">PRIVACY</Link><Link to="/terms">TERMS</Link></div></div>
  </footer>
}

function AboutPage(): ReactElement {
  const [awardPreview, setAwardPreview] = useState<string>(awards[0][3])
  return <>
    <section className="rp-hero rp-hero--about">
      <img src="/assets/images/main/processing_01.png" alt="" />
      <div className="rp-hero__veil" />
      <div className="rp-hero__copy"><p>ABOUT XAI KOREA</p><h1>CREATIVE THINKING.<br />PROVABLE TECHNOLOGY.</h1><span>도메인 지식과 AI 기술을 연결해, 설명할 수 있는 의사결정 경험을 만듭니다.</span></div>
      <a href="#business" className="rp-scroll-cue">SCROLL <i /></a>
    </section>
    <section id="business" className="rp-section rp-business rp-reveal">
      <div className="rp-section-title"><span>01</span><h2>BUSINESS</h2></div>
      <div className="rp-business__grid">{businessItems.map(([number, title, description]) => <article key={number}><span>{number}</span><h3>{title.split('\n').map((line) => <span key={line}>{line}</span>)}</h3><p>{description}</p></article>)}</div>
    </section>
    <section className="rp-section rp-awards rp-reveal">
      <div className="rp-section-title"><span>02</span><h2>MILESTONES</h2></div>
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
      <div className="rp-project-grid">{visibleProjects.map((project) => <button className={`rp-project rp-project--${project.tone} ${project.tall ?? false ? 'is-tall' : ''} ${project.logo ?? false ? 'is-logo' : ''}`} type="button" key={project.title} onClick={() => { setSelected(project) }}>
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
        <div className="rp-project-modal__visual"><img src={selected.image} alt="" /></div>
        <div className="rp-project-modal__copy"><span>{selected.category} · XAI KOREA</span><h2>{selected.title}</h2><p>{selected.caption}</p><dl><div><dt>OUTCOME</dt><dd>{selected.result}</dd></div><div><dt>SCOPE</dt><dd>Strategy · UX · AI Engineering</dd></div></dl><Link to="/contact">프로젝트 상담하기 ↗</Link></div>
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
      <img src="/assets/images/main/processing_01.png" alt="" />
      <div className="rp-hero__veil" />
      <div className="rp-hero__copy"><p>CAREERS AT XAI KOREA</p><h1>BUILD YOUR CAREER<br />WITH US.</h1><span>오늘보다 더 나은 질문을 던지고, 신뢰할 수 있는 AI의 기준을 함께 만듭니다.</span></div>
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
      <div><p>CONTACT XAI KOREA</p><h1>A PARTNER FOR<br />BETTER DECISIONS.</h1><span>설명 가능한 AI가 필요한 프로젝트라면 편하게 이야기를 들려주세요.</span></div>
      <dl>
        <div><dt>Address.</dt><dd>{address}</dd></div>
        <div><dt>Tel.</dt><dd><a href="tel:+821032535409">+82 10 3253 5409</a></dd></div>
        <div><dt>Mail.</dt><dd><a href="mailto:contact@xaikorea.ai.kr">contact@xaikorea.ai.kr</a></dd></div>
        <div><dt>Project.</dt><dd><a href="mailto:contact@xaikorea.ai.kr?subject=XAI%20Korea%20프로젝트%20문의">프로젝트 문의 보내기 ↗</a></dd></div>
      </dl>
    </section>
    <section className="rp-contact-map rp-reveal">
      <iframe title="XAI Korea 판교 오피스 위치" src={mapEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      <div className="rp-map-pin" aria-hidden="true"><span>XAI<br />KOREA</span></div>
      <a href={mapLinkUrl} target="_blank" rel="noreferrer">GOOGLE MAPS에서 크게 보기 ↗</a>
    </section>
    <section className="rp-contact-next"><p>NEXT STEP</p><h2>프로젝트의 현재 단계와<br />해결하고 싶은 문제를 알려주세요.</h2><Link to="/#contact">문의 양식 작성하기 <span>↗</span></Link></section>
  </>
}

export default function AgencyPage({ page }: AgencyPageProps): ReactElement {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = `XAI Korea | ${page.toUpperCase()}`
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
