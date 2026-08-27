import { useEffect, useRef, type ReactElement } from 'react';

type Particle = {
  x: number;
  y: number;
  angle: number;
  radius: number;
  orbitBand: number;
  depth: number;
  size: number;
  speed: number;
  seed: number;
  brightness: number;
  cool: boolean;
};

function clamp(value: number, minimum = 0, maximum = 1): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function smooth(value: number): number {
  const progress = clamp(value);
  return progress * progress * (3 - 2 * progress);
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
        ? Math.min(900, Math.max(600, Math.round((width * height) / 1800)))
        : width < 760
          ? Math.min(1350, Math.max(850, Math.round((width * height) / 820)))
          : Math.min(3200, Math.max(2100, Math.round((width * height) / 700)));
      const baseRadius = Math.min(width, height) * (width < 760 ? 0.31 : 0.36);

      particles = Array.from({ length: count }, () => {
        const shell = Math.pow(Math.random(), 2.2);
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          angle: Math.random() * Math.PI * 2,
          radius: baseRadius * (0.7 + shell * 0.48),
          orbitBand:
            (Math.floor(Math.random() * 3) - 1) * 0.016 +
            (Math.random() - 0.5) * 0.004,
          depth: Math.pow(Math.random(), 1.6),
          size: 0.45 + Math.random() * 1.75,
          speed: 0.16 + Math.random() * 0.46,
          seed: Math.random() * Math.PI * 2,
          brightness: 0.72 + Math.random() * 0.58,
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
      scrollProgress = reducedMotion ? 1 : clamp(-bounds.top / travel);
      const copyProgress = reducedMotion
        ? 1
        : smooth((scrollProgress - 0.66) / 0.25);
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
      const gather = smooth((scrollProgress - 0.12) / 0.65);
      const settle = smooth((scrollProgress - 0.7) / 0.22);
      const complete = smooth((scrollProgress - 0.84) / 0.12);
      const centerX = width * 0.5 + pointerX * 10;
      const centerY = height * 0.5 + pointerY * 7;
      const baseRadius = Math.min(width, height) * (width < 760 ? 0.31 : 0.36);
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
        `rgba(255,255,255,${String(0.035 + gather * 0.075)})`
      );
      glow.addColorStop(0.52, 'rgba(177,196,205,.035)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      drawingContext.fillStyle = glow;
      drawingContext.fillRect(0, 0, width, height);

      if (gather > 0.04 && complete < 0.98) {
        drawingContext.save();
        drawingContext.translate(centerX, centerY);
        drawingContext.rotate(time * 0.000035);
        drawingContext.globalCompositeOperation = 'lighter';
        for (let arm = 0; arm < 4; arm += 1) {
          drawingContext.beginPath();
          for (let point = 0; point <= 90; point += 1) {
            const ratio = point / 90;
            const radius = baseRadius * (0.18 + ratio * 1.35);
            const angle =
              arm * (Math.PI / 2) + ratio * Math.PI * 2.7 - gather * 1.4;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (point === 0) {
              drawingContext.moveTo(x, y);
            } else {
              drawingContext.lineTo(x, y);
            }
          }
          drawingContext.strokeStyle = `rgba(205,224,235,${String(gather * (1 - complete) * 0.055)})`;
          drawingContext.lineWidth = 0.7;
          drawingContext.stroke();
        }
        drawingContext.restore();
      }

      drawingContext.save();
      drawingContext.globalCompositeOperation = 'lighter';

      particles.forEach((particle, index) => {
        const drift = 1 - gather;
        const scatterX =
          particle.x +
          Math.sin(time * 0.00016 * particle.speed + particle.seed) *
            (4 + particle.depth * 11) *
            drift;
        const scatterY =
          particle.y +
          Math.cos(time * 0.00013 * particle.speed + particle.seed * 1.7) *
            (3 + particle.depth * 8) *
            drift;
        const startX = scatterX - centerX;
        const startY = scatterY - centerY;
        const startRadius = Math.max(1, Math.hypot(startX, startY));
        const startAngle = Math.atan2(startY, startX);
        const targetAngle = particle.angle;
        const shortestAngle = Math.atan2(
          Math.sin(targetAngle - startAngle),
          Math.cos(targetAngle - startAngle)
        );
        const vortexTurns = Math.PI * 2 * (1.8 + particle.depth * 3.8);
        const rotation = time * 0.000075 * (0.6 + particle.speed);
        const angle =
          startAngle + shortestAngle * gather + vortexTurns * gather + rotation;
        const looseOrbitRadius = particle.radius;
        const finalOrbitRadius =
          baseRadius * (1 + particle.orbitBand) +
          Math.sin(particle.seed * 2.3) * 0.85;
        const targetRadius =
          looseOrbitRadius * (1 - settle) + finalOrbitRadius * settle;
        const spiralPulse =
          Math.sin(particle.seed + gather * Math.PI * 7) *
          baseRadius *
          0.038 *
          gather *
          (1 - settle);
        const orbitRadius =
          startRadius * (1 - gather) + targetRadius * gather + spiralPulse;
        const orbitX = centerX + Math.cos(angle) * orbitRadius;
        const orbitY = centerY + Math.sin(angle) * orbitRadius;
        const x = scatterX * (1 - gather) + orbitX * gather;
        const y = scatterY * (1 - gather) + orbitY * gather;
        const twinkle =
          0.82 + Math.sin(time * 0.0011 * particle.speed + particle.seed) * 0.18;
        const alpha = clamp(
          (0.34 + particle.depth * 0.58 + complete * 0.08) *
            particle.brightness *
            twinkle,
          0.18,
          1
        );

        if (!reducedMotion && index % 3 === 0 && gather > 0.06) {
          const trailAngle = angle - 0.026 * (0.65 + particle.speed) * gather;
          drawingContext.beginPath();
          drawingContext.moveTo(
            centerX + Math.cos(trailAngle) * orbitRadius,
            centerY + Math.sin(trailAngle) * orbitRadius
          );
          drawingContext.lineTo(x, y);
          drawingContext.strokeStyle = `rgba(220,234,241,${String(alpha * (0.28 + gather * 0.22))})`;
          drawingContext.lineWidth = Math.max(0.4, particle.size * 0.5);
          drawingContext.stroke();
        }

        if (index % 9 === 0) {
          drawingContext.beginPath();
          drawingContext.fillStyle = particle.cool
            ? `rgba(183,217,235,${String(alpha * 0.2)})`
            : `rgba(255,252,237,${String(alpha * 0.22)})`;
          drawingContext.arc(
            x,
            y,
            particle.size * (2.2 + particle.depth),
            0,
            Math.PI * 2
          );
          drawingContext.fill();
        }

        drawingContext.beginPath();
        drawingContext.fillStyle = particle.cool
          ? `rgba(222,240,250,${String(alpha)})`
          : `rgba(255,253,244,${String(alpha)})`;
        drawingContext.arc(
          x,
          y,
          particle.size * (0.9 + particle.depth * 0.5),
          0,
          Math.PI * 2
        );
        drawingContext.fill();
      });
      drawingContext.restore();

      const orbitOpacity = smooth((scrollProgress - 0.48) / 0.42);
      if (orbitOpacity > 0) {
        drawingContext.save();
        drawingContext.translate(centerX, centerY);
        drawingContext.rotate(time * 0.00004);
        drawingContext.globalCompositeOperation = 'lighter';
        [0.82, 1, 1.19].forEach((scale, index) => {
          drawingContext.save();
          drawingContext.rotate(index % 2 === 0 ? gather * 0.65 : -gather * 0.82);
          drawingContext.beginPath();
          drawingContext.setLineDash([
            18 + index * 11,
            38 + index * 16,
            4,
            28 + index * 9,
          ]);
          drawingContext.lineDashOffset =
            time * 0.012 * (index % 2 === 0 ? -1 : 1);
          drawingContext.arc(0, 0, baseRadius * scale, 0, Math.PI * 2);
          drawingContext.strokeStyle = `rgba(224,239,246,${String(orbitOpacity * (0.11 + index * 0.035))})`;
          drawingContext.lineWidth = index === 1 ? 1.45 : 0.8;
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
