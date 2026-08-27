import { useEffect, useRef, type ReactElement } from 'react';

type ContactStellarHeroProps = {
  address: string;
  phone: string;
  email: string;
};

type Particle = {
  x: number;
  y: number;
  angle: number;
  radius: number;
  depth: number;
  size: number;
  speed: number;
  seed: number;
  cool: boolean;
};

function clamp(value: number, minimum = 0, maximum = 1): number {
  return Math.min(maximum, Math.max(minimum, value));
}

export default function ContactStellarHero({
  address,
  phone,
  email,
}: ContactStellarHeroProps): ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (section === null || canvas === null) {
      return;
    }
    const context = canvas.getContext('2d');
    if (context === null) {
      return;
    }
    const drawingContext: CanvasRenderingContext2D = context;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reducedMotion = motionQuery.matches;
    let width = 1;
    let height = 1;
    let dpr = 1;
    let particles: Particle[] = [];
    let frame = 0;
    let visible = true;
    let scrollProgress = 0;
    let pointerX = 0;
    let pointerY = 0;

    const makeParticles = (): void => {
      const count = reducedMotion
        ? Math.min(520, Math.max(300, Math.round((width * height) / 2600)))
        : width < 760
          ? Math.min(600, Math.max(360, Math.round((width * height) / 1400)))
          : Math.min(1180, Math.max(720, Math.round((width * height) / 1250)));
      const baseRadius = Math.min(width, height) * (width < 760 ? 0.31 : 0.36);

      particles = Array.from({ length: count }, () => {
        const shell = Math.pow(Math.random(), 2.2);
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          angle: Math.random() * Math.PI * 2,
          radius:
            baseRadius +
            (Math.random() - 0.5) * baseRadius * (0.1 + shell * 0.45),
          depth: Math.pow(Math.random(), 1.6),
          size: 0.3 + Math.random() * 1.45,
          speed: 0.18 + Math.random() * 0.5,
          seed: Math.random() * Math.PI * 2,
          cool: Math.random() > 0.78,
        };
      });
    };

    const resize = (): void => {
      const bounds = section.getBoundingClientRect();
      width = Math.max(1, Math.round(bounds.width));
      height = Math.max(
        1,
        Math.round(Math.min(window.innerHeight, bounds.height))
      );
      dpr = Math.min(window.devicePixelRatio || 1, width < 760 ? 1.25 : 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${String(width)}px`;
      canvas.style.height = `${String(height)}px`;
      drawingContext.setTransform(dpr, 0, 0, dpr, 0, 0);
      makeParticles();
    };

    const updateScroll = (): void => {
      const bounds = section.getBoundingClientRect();
      const travel = Math.max(section.offsetHeight - window.innerHeight, 1);
      scrollProgress = clamp(-bounds.top / travel);
    };

    const draw = (time = 0): void => {
      drawingContext.clearRect(0, 0, width, height);
      const formation = reducedMotion ? 0.78 : 0.45 + scrollProgress * 0.55;
      const centerX = width * (width < 760 ? 0.53 : 0.68) + pointerX * 8;
      const centerY = height * 0.49 + pointerY * 6;
      const glowRadius = Math.min(width, height) * 0.34;
      const glow = drawingContext.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        glowRadius
      );
      glow.addColorStop(0, 'rgba(201,216,122,.08)');
      glow.addColorStop(0.56, 'rgba(178,83,77,.035)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      drawingContext.fillStyle = glow;
      drawingContext.fillRect(0, 0, width, height);

      particles.forEach((particle) => {
        const rotation = time * 0.000045 * particle.speed;
        const angle = particle.angle + rotation;
        const wobble =
          Math.sin(time * 0.00045 + particle.seed) * particle.radius * 0.018;
        const ringX = centerX + Math.cos(angle) * (particle.radius + wobble);
        const ringY =
          centerY + Math.sin(angle) * (particle.radius + wobble) * 0.92;
        const ease = formation * formation * (3 - 2 * formation);
        const x = particle.x * (1 - ease) + ringX * ease;
        const y = particle.y * (1 - ease) + ringY * ease;
        const alpha = 0.12 + particle.depth * 0.62;

        drawingContext.beginPath();
        drawingContext.fillStyle = particle.cool
          ? `rgba(205,224,235,${String(alpha)})`
          : `rgba(246,244,233,${String(alpha)})`;
        drawingContext.arc(
          x,
          y,
          particle.size * (0.8 + particle.depth * 0.45),
          0,
          Math.PI * 2
        );
        drawingContext.fill();
      });

      if (!reducedMotion && visible) {
        frame = window.requestAnimationFrame(draw);
      }
    };

    const restart = (): void => {
      window.cancelAnimationFrame(frame);
      if (visible) {
        draw();
      }
    };

    const onPointerMove = (event: PointerEvent): void => {
      const bounds = section.getBoundingClientRect();
      pointerX =
        clamp((event.clientX - bounds.left) / bounds.width, 0, 1) - 0.5;
      pointerY =
        clamp((event.clientY - bounds.top) / Math.max(bounds.height, 1), 0, 1) -
        0.5;
    };
    const onMotionChange = (event: MediaQueryListEvent): void => {
      reducedMotion = event.matches;
      resize();
      restart();
    };

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? false;
        restart();
      },
      { rootMargin: '10% 0px' }
    );
    const resizeObserver = new ResizeObserver(() => {
      resize();
      updateScroll();
      restart();
    });

    visibilityObserver.observe(section);
    resizeObserver.observe(section);
    section.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', updateScroll, { passive: true });
    motionQuery.addEventListener('change', onMotionChange);
    resize();
    updateScroll();
    draw();

    return () => {
      window.cancelAnimationFrame(frame);
      visibilityObserver.disconnect();
      resizeObserver.disconnect();
      section.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', updateScroll);
      motionQuery.removeEventListener('change', onMotionChange);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="rp-stellar-hero"
      aria-labelledby="contact-title"
    >
      <div className="rp-stellar-hero__stage">
        <canvas ref={canvasRef} aria-hidden="true" />
        <div className="rp-stellar-hero__veil" aria-hidden="true" />
        <div className="rp-stellar-hero__content">
          <p>CONTACT XAIKOREA · PANGYO</p>
          <h1 id="contact-title">
            설명 가능한 AI로,
            <br />
            <em>더 신뢰할 수 있는 업무</em>를 설계합니다.
          </h1>
          <span>
            프로젝트의 문제와 기대하는 결과를 들려주세요.
            <br />
            적합한 적용 방식부터 함께 검토하겠습니다.
          </span>
          <div className="rp-stellar-hero__actions">
            <a href="#inquiry-types">
              문의 분야 선택하기 <b>↘</b>
            </a>
            <a href="#project-inquiry-form">
              바로 문의하기 <b>↘</b>
            </a>
          </div>
        </div>
        <dl className="rp-stellar-hero__quick">
          <div>
            <dt>OFFICE</dt>
            <dd>{address}</dd>
          </div>
          <div>
            <dt>PHONE</dt>
            <dd>
              <a href={`tel:${phone.replace(/\s/g, '')}`}>{phone}</a>
            </dd>
          </div>
          <div>
            <dt>EMAIL</dt>
            <dd>
              <a href={`mailto:${email}`}>{email}</a>
            </dd>
          </div>
        </dl>
        <a className="rp-stellar-hero__scroll" href="#inquiry-types">
          SCROLL TO START <i aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
