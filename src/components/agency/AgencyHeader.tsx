import { useEffect, useRef, useState, type ReactElement } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/agency-pages.css';

const navigation = [
  ['HOME', '/'],
  ['ABOUT', '/about'],
  ['WORK', '/work'],
  ['CAREERS', '/careers'],
  ['CONTACT', '/contact'],
] as const;

const previewImages: Record<string, string> = {
  '/': '/assets/images/company/baemin-square-night.jpg',
  '/about': '/assets/images/company/office-lounge.jpg',
  '/work': '/assets/images/company/hoban-ai-workspace.jpg',
  '/careers': '/assets/images/company/open-workspace.jpg',
  '/contact': '/assets/images/company/baemin-square-campus.jpg',
};

function AgencyHeader(): ReactElement {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [preview, setPreview] = useState(
    previewImages[location.pathname] ?? previewImages['/']
  );
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = (): void => {
      const maximum = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      );
      document.documentElement.style.setProperty(
        '--rp-progress',
        String(window.scrollY / maximum)
      );
      setScrolled(window.scrollY > 56);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => {
      window.removeEventListener('scroll', update);
    };
  }, []);

  useEffect(() => {
    setOpen(false);
    setPreview(previewImages[location.pathname] ?? previewImages['/']);
  }, [location.pathname]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && open) {
        setOpen(false);
        buttonRef.current?.focus();
      }
      if (event.key === 'Tab' && open) {
        const items = panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled])'
        );
        if (items === undefined || items.length === 0) {
          return;
        }
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };

    if (open) {
      document.body.style.overflow = 'hidden';
      window.requestAnimationFrame(() =>
        panelRef.current?.querySelector<HTMLElement>('.rp-menu__nav a')?.focus()
      );
    }
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <>
      <div className="rp-progress" aria-hidden="true">
        <span />
      </div>
      <header
        className={`rp-header ${scrolled ? 'is-scrolled' : ''} ${open ? 'is-open' : ''}`}
      >
        <Link className="rp-brand" to="/" aria-label="XAIKOREA 홈">
          <span className="rp-brand__mark" aria-hidden="true">
            <img src="/assets/images/logo/logo-dark.png" alt="" />
          </span>
          <span className="rp-brand__word">XAIKOREA</span>
        </Link>
        <button
          ref={buttonRef}
          className="rp-menu-button"
          type="button"
          aria-expanded={open}
          aria-controls="agency-menu"
          aria-label={open ? '메뉴 닫기' : '메뉴 열기'}
          onClick={() => {
            setOpen((value) => !value);
          }}
        >
          <i />
          <i />
        </button>
      </header>
      <div
        ref={panelRef}
        id="agency-menu"
        className={`rp-menu ${open ? 'is-open' : ''}`}
        aria-hidden={!open}
      >
        <div className="rp-menu__preview" aria-hidden="true">
          <img key={preview} src={preview} alt="" />
        </div>
        <div className="rp-menu__meta">
          <p>
            EXPLAINABLE INTELLIGENCE
            <br />
            FOR WORK YOU CAN TRUST.
          </p>
          <div>
            <span>PROJECT REQUEST</span>
            <Link to="/contact#contact-inquiry">프로젝트 문의하기</Link>
          </div>
          <div>
            <span>OFFICE</span>
            <p>PANGYO · KOREA</p>
          </div>
        </div>
        <nav className="rp-menu__nav" aria-label="전체 메뉴">
          {navigation.map(([label, path], index) => (
            <Link
              key={path}
              className={path === location.pathname ? 'is-current' : ''}
              to={path}
              onPointerEnter={() => {
                setPreview(previewImages[path] ?? previewImages['/']);
              }}
              onFocus={() => {
                setPreview(previewImages[path] ?? previewImages['/']);
              }}
              onClick={() => {
                setOpen(false);
              }}
            >
              <span>0{index + 1}</span>
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}

export default AgencyHeader;
