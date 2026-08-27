import { useEffect, useRef, type ReactElement } from 'react';

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

export default function ContactStellarHero(): ReactElement {
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
        ? Math.min(700, Math.max(450, Math.round((width * height) / 2200)))
        : width < 760
          ? Math.min(950, Math.max(650, Math.round((width * height) / 1050)))
          : Math.min(2200, Math.max(1400, Math.round((width * height) / 950)));
      const baseRadius = Math.min(width, height) * (width < 760 ? 0.3 : 0.35);

      particles = Array.from({ length: count }, () => {
        const shell = Math.pow(Math.random(), 2.2);
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          angle: Math.random() * Math.PI * 2,
          radius: baseRadius * (0.72 + shell * 0.4),
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
      scrollProgress = reducedMotion ? 0.82 : clamp(-bounds.top / travel);
      const copyProgress = reducedMotion
        ? 1
        : clamp((scrollProgress - 0.28) / 0.54);
      section.style.setProperty(
        '--rp-stellar-copy-opacity',
        String(0.02 + copyProgress * 0.98)
      );
      section.style.setProperty(
        '--rp-stellar-copy-blur',
        `${String((1 - copyProgress) * 16)}px`
      );
      section.style.setProperty(
        '--rp-stellar-copy-scale',
        String(0.94 + copyProgress * 0.06)
      );
    };

    const draw = (time = 0): void => {
      drawingContext.clearRect(0, 0, width, height);
      const normalizedFormation = clamp((scrollProgress - 0.04) / 0.88);
      const formation =
        normalizedFormation *
        normalizedFormation *
        (3 - 2 * normalizedFormation);
      const centerX = width * 0.5 + pointerX * 10;
      const centerY = height * 0.5 + pointerY * 7;
      const baseRadius = Math.min(width, height) * (width < 760 ? 0.3 : 0.35);
      const glowRadius = baseRadius * 1.45;
      const glow = drawingContext.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        glowRadius
      );
      glow.addColorStop(
        0,
        `rgba(255,255,255,${String(0.025 + formation * 0.055)})`
      );
      glow.addColorStop(0.5, 'rgba(178,83,77,.03)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      drawingContext.fillStyle = glow;
      drawingContext.fillRect(0, 0, width, height);

      particles.forEach((particle, index) => {
        const startX = particle.x - centerX;
        const startY = particle.y - centerY;
        const startRadius = Math.max(1, Math.hypot(startX, startY));
        const startAngle = Math.atan2(startY, startX);
        const vortexTurns =
          Math.PI * 2 * (1.4 + particle.depth * 2.7 + particle.seed * 0.05);
        const rotation = time * 0.00012 * (0.35 + particle.speed);
        const angle = startAngle + rotation + formation * vortexTurns;
        const wobble =
          Math.sin(time * 0.0007 + particle.seed) *
          particle.radius *
          (0.01 + (1 - formation) * 0.018);
        const orbitRadius =
          startRadius * (1 - formation) + particle.radius * formation + wobble;
        const verticalScale = 1 - formation * 0.18;
        const x = centerX + Math.cos(angle) * orbitRadius;
        const y = centerY + Math.sin(angle) * orbitRadius * verticalScale;
        const alpha = 0.1 + particle.depth * 0.68 + formation * 0.08;

        if (!reducedMotion && index % 4 === 0 && formation > 0.08) {
          const trailAngle = angle - 0.02 * (0.6 + particle.speed) * formation;
          drawingContext.beginPath();
          drawingContext.moveTo(
            centerX + Math.cos(trailAngle) * orbitRadius,
            centerY + Math.sin(trailAngle) * orbitRadius * verticalScale
          );
          drawingContext.lineTo(x, y);
          drawingContext.strokeStyle = `rgba(255,255,255,${String(alpha * 0.42)})`;
          drawingContext.lineWidth = Math.max(0.35, particle.size * 0.45);
          drawingContext.stroke();
        }

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

      const orbitOpacity = clamp((formation - 0.18) / 0.65);
      if (orbitOpacity > 0) {
        drawingContext.save();
        drawingContext.translate(centerX, centerY);
        drawingContext.rotate(time * 0.000055);
        [0.78, 0.97, 1.17].forEach((scale, index) => {
          drawingContext.save();
          drawingContext.rotate(index % 2 === 0 ? formation * 0.7 : -formation);
          drawingContext.beginPath();
          drawingContext.setLineDash([
            18 + index * 11,
            38 + index * 16,
            4,
            28 + index * 9,
          ]);
          drawingContext.lineDashOffset =
            time * 0.018 * (index % 2 === 0 ? -1 : 1);
          drawingContext.ellipse(
            0,
            0,
            baseRadius * scale,
            baseRadius * scale * 0.82,
            0,
            0,
            Math.PI * 2
          );
          drawingContext.strokeStyle = `rgba(255,255,255,${String(orbitOpacity * (0.08 + index * 0.025))})`;
          drawingContext.lineWidth = index === 1 ? 1.2 : 0.7;
          drawingContext.stroke();
          drawingContext.restore();
        });
        drawingContext.restore();

        const core = drawingContext.createRadialGradient(
          centerX,
          centerY,
          0,
          centerX,
          centerY,
          baseRadius * 0.5
        );
        core.addColorStop(0, `rgba(0,0,0,${String(orbitOpacity * 0.76)})`);
        core.addColorStop(0.62, `rgba(8,9,8,${String(orbitOpacity * 0.42)})`);
        core.addColorStop(1, 'rgba(0,0,0,0)');
        drawingContext.fillStyle = core;
        drawingContext.fillRect(0, 0, width, height);
      }

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
      updateScroll();
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
          <h1 id="contact-title">
            근거가 모이면,
            <br />
            신뢰가 선명해집니다.
          </h1>
        </div>
      </div>
    </section>
  );
}
