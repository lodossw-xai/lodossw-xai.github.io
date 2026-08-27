import { useEffect, useRef, type ReactElement } from 'react';

type Particle = {
  x: number;
  y: number;
  angle: number;
  radius: number;
  orbitBand: number;
  arm: number;
  armOffset: number;
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

function smoother(value: number): number {
  const progress = clamp(value);
  return progress * progress * progress * (progress * (progress * 6 - 15) + 10);
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
    let pointerInside = false;
    let hoverSpinTriggeredForFormation = false;
    let hoverSpinStartedAt = Number.NEGATIVE_INFINITY;

    const HOVER_SPIN_DURATION = 1800;
    const HOVER_SPIN_TURNS = 5;

    const makeParticles = (): void => {
      const count = reducedMotion
        ? Math.min(1100, Math.max(750, Math.round((width * height) / 1450)))
        : width < 760
          ? Math.min(1900, Math.max(1250, Math.round((width * height) / 610)))
          : Math.min(4300, Math.max(3000, Math.round((width * height) / 510)));
      const baseRadius = Math.min(width, height) * (width < 760 ? 0.43 : 0.44);

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
          arm: Math.floor(Math.random() * 6),
          armOffset: (Math.random() - 0.5) * 0.58,
          depth: Math.pow(Math.random(), 1.6),
          size: 0.55 + Math.random() * 2.05,
          speed: 0.16 + Math.random() * 0.46,
          seed: Math.random() * Math.PI * 2,
          brightness: 0.9 + Math.random() * 0.65,
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
      if (
        !reducedMotion &&
        pointerInside &&
        scrollProgress >= 0.5 &&
        !hoverSpinTriggeredForFormation
      ) {
        hoverSpinStartedAt = performance.now();
        hoverSpinTriggeredForFormation = true;
      }
      const copyIn = reducedMotion
        ? 1
        : smoother((scrollProgress - 0.5) / 0.13);
      const copyOut = reducedMotion
        ? 0
        : smoother((scrollProgress - 0.76) / 0.08);
      const copyProgress = copyIn * (1 - copyOut);
      section.style.setProperty(
        '--rp-stellar-copy-opacity',
        String(copyProgress)
      );
      section.style.setProperty(
        '--rp-stellar-copy-blur',
        `${String((1 - copyIn) * 16 + copyOut * 8)}px`
      );
      section.style.setProperty(
        '--rp-stellar-copy-scale',
        String(0.94 + copyIn * 0.06 - copyOut * 0.035)
      );
    };

    const draw = (time = 0): void => {
      drawingContext.clearRect(0, 0, width, height);
      const gather = smoother((scrollProgress - 0.035) / 0.48);
      const settle = smoother((scrollProgress - 0.46) / 0.17);
      const complete = smoother((scrollProgress - 0.58) / 0.1);
      const whirlIn = smoother((scrollProgress - 0.06) / 0.2);
      const whirlOut = smoother((scrollProgress - 0.47) / 0.22);
      const whirl = whirlIn * (1 - whirlOut);
      const axialTurn = reducedMotion
        ? 0
        : smoother((scrollProgress - 0.85) / 0.145);
      const hoverSpinProgress = reducedMotion
        ? 1
        : clamp((time - hoverSpinStartedAt) / HOVER_SPIN_DURATION);
      const hoverSpin =
        hoverSpinStartedAt === Number.NEGATIVE_INFINITY
          ? 0
          : smoother(hoverSpinProgress) * Math.PI * 2 * HOVER_SPIN_TURNS;
      const axialAngle = axialTurn * Math.PI * 2 * 3 + hoverSpin;
      const axialProjection = Math.cos(axialAngle);
      const centerX = width * 0.5 + pointerX * 10;
      const centerY = height * 0.5 + pointerY * 7;
      const baseRadius = Math.min(width, height) * (width < 760 ? 0.43 : 0.44);
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
        drawingContext.rotate(time * 0.000027);
        drawingContext.globalCompositeOperation = 'lighter';
        for (let arm = 0; arm < 6; arm += 1) {
          drawingContext.beginPath();
          for (let point = 0; point <= 120; point += 1) {
            const ratio = point / 120;
            const radius = baseRadius * (0.1 + ratio * 1.5);
            const angle =
              arm * (Math.PI / 3) +
              ratio * Math.PI * 3.7 -
              gather * 1.8 -
              time * 0.000043;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (point === 0) {
              drawingContext.moveTo(x, y);
            } else {
              drawingContext.lineTo(x, y);
            }
          }
          drawingContext.strokeStyle = `rgba(218,239,249,${String((0.35 + whirl * 0.65) * gather * (1 - complete) * 0.09)})`;
          drawingContext.lineWidth = 0.9;
          drawingContext.stroke();
        }
        drawingContext.restore();
      }

      drawingContext.save();
      drawingContext.globalCompositeOperation = 'lighter';

      particles.forEach((particle, index) => {
        const drift = 1 - gather;
        const flowPrimary = time * 0.00012 * particle.speed;
        const flowSecondary = time * 0.000045 * (1 + particle.depth);
        const scatterX =
          particle.x +
          (Math.sin(flowPrimary + particle.seed) *
            (6 + particle.depth * 12) +
            Math.sin(flowSecondary + particle.seed * 3.1) *
              (3 + particle.depth * 6)) *
            drift;
        const scatterY =
          particle.y +
          (Math.cos(flowPrimary * 0.83 + particle.seed * 1.7) *
            (5 + particle.depth * 10) +
            Math.sin(flowSecondary * 1.37 + particle.seed * 2.4) *
              (2 + particle.depth * 7)) *
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
        const vortexTurns = Math.PI * 2 * (2.8 + particle.depth * 6.2);
        const rotation =
          time * 0.000075 * (0.62 + particle.speed) * (1 - axialTurn * 0.2);
        const formationAngle =
          startAngle + shortestAngle * gather + vortexTurns * gather + rotation;
        const spiralAngle =
          particle.arm * (Math.PI / 3) +
          (particle.radius / baseRadius) * Math.PI * 3.8 +
          particle.armOffset -
          time * 0.000078;
        const spiralDelta = Math.atan2(
          Math.sin(spiralAngle - formationAngle),
          Math.cos(spiralAngle - formationAngle)
        );
        const angle = formationAngle + spiralDelta * whirl * 0.9;
        const looseOrbitRadius = particle.radius;
        const finalOrbitRadius =
          baseRadius * (1 + particle.orbitBand) +
          Math.sin(particle.seed * 2.3) * 0.85;
        const targetRadius =
          looseOrbitRadius * (1 - settle) + finalOrbitRadius * settle;
        const spiralPulse =
          Math.sin(particle.seed + gather * Math.PI * 7) *
          baseRadius *
          (0.058 + whirl * 0.045) *
          gather *
          (1 - settle);
        const orbitRadius =
          startRadius * (1 - gather) + targetRadius * gather + spiralPulse;
        const orbitX =
          centerX + Math.cos(angle) * orbitRadius * axialProjection;
        const orbitY = centerY + Math.sin(angle) * orbitRadius;
        const x = scatterX * (1 - gather) + orbitX * gather;
        const y = scatterY * (1 - gather) + orbitY * gather;
        const axialDepth = Math.sin(angle) * Math.sin(axialAngle);
        const twinkle =
          0.82 + Math.sin(time * 0.0011 * particle.speed + particle.seed) * 0.18;
        const alpha = clamp(
          (0.48 + particle.depth * 0.58 + complete * 0.1) *
            particle.brightness *
            twinkle *
            (1 - axialTurn * 0.22 + axialDepth * 0.22),
          0.3,
          1
        );

        if (!reducedMotion && index % 2 === 0 && gather > 0.04) {
          const trailAngle =
            angle -
            (0.034 + whirl * 0.055) * (0.68 + particle.speed) * gather;
          drawingContext.beginPath();
          drawingContext.moveTo(
            centerX +
              Math.cos(trailAngle) * orbitRadius * axialProjection,
            centerY + Math.sin(trailAngle) * orbitRadius
          );
          drawingContext.lineTo(x, y);
          drawingContext.strokeStyle = `rgba(229,244,250,${String(alpha * (0.32 + gather * 0.25))})`;
          drawingContext.lineWidth = Math.max(0.45, particle.size * 0.54);
          drawingContext.stroke();
        }

        if (index % 6 === 0) {
          drawingContext.beginPath();
          drawingContext.fillStyle = particle.cool
            ? `rgba(196,229,247,${String(alpha * 0.3)})`
            : `rgba(255,253,239,${String(alpha * 0.34)})`;
          drawingContext.arc(
            x,
            y,
            particle.size * (2.7 + particle.depth * 1.3),
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

        if (index % 61 === 0) {
          const flare = particle.size * (3.5 + particle.depth * 2.5);
          drawingContext.beginPath();
          drawingContext.moveTo(x - flare, y);
          drawingContext.lineTo(x + flare, y);
          drawingContext.moveTo(x, y - flare);
          drawingContext.lineTo(x, y + flare);
          drawingContext.strokeStyle = `rgba(245,251,255,${String(alpha * 0.58)})`;
          drawingContext.lineWidth = 0.65;
          drawingContext.stroke();
        }
      });
      drawingContext.restore();

      const orbitOpacity = smoother((scrollProgress - 0.44) / 0.4);
      if (orbitOpacity > 0) {
        drawingContext.save();
        drawingContext.translate(centerX, centerY);
        drawingContext.rotate(time * 0.000045);
        drawingContext.scale(axialProjection, 1);
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
            time * 0.014 * (index % 2 === 0 ? -1 : 1);
          drawingContext.arc(0, 0, baseRadius * scale, 0, Math.PI * 2);
          drawingContext.strokeStyle = `rgba(231,245,251,${String(orbitOpacity * (0.16 + index * 0.045))})`;
          drawingContext.lineWidth = index === 1 ? 1.75 : 1;
          drawingContext.stroke();
          drawingContext.restore();
        });
        drawingContext.restore();

        const coreOpacity = orbitOpacity * (1 - axialTurn);
        const core = drawingContext.createRadialGradient(
          centerX,
          centerY,
          0,
          centerX,
          centerY,
          baseRadius * 0.88
        );
        core.addColorStop(0, `rgba(0,0,0,${String(coreOpacity * 0.86)})`);
        core.addColorStop(0.72, `rgba(8,9,8,${String(coreOpacity * 0.58)})`);
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
    const onPointerEnter = (event: PointerEvent): void => {
      if (event.pointerType !== 'mouse') {
        return;
      }
      pointerInside = true;
      if (!reducedMotion && scrollProgress >= 0.5) {
        hoverSpinStartedAt = performance.now();
        hoverSpinTriggeredForFormation = true;
      }
    };
    const onPointerLeave = (event: PointerEvent): void => {
      if (event.pointerType === 'mouse') {
        pointerInside = false;
        hoverSpinTriggeredForFormation = false;
      }
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
    section.addEventListener('pointerenter', onPointerEnter, { passive: true });
    section.addEventListener('pointerleave', onPointerLeave, { passive: true });
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
      section.removeEventListener('pointerenter', onPointerEnter);
      section.removeEventListener('pointerleave', onPointerLeave);
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
