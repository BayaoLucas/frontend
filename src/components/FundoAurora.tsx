import { useEffect, useRef } from 'react';

export function FundoAurora() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Partículas de poeira estelar cintilantes
    const numStars = 65;
    const stars = Array.from({ length: numStars }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.6 + 0.4,
      alpha: Math.random(),
      speed: Math.random() * 0.015 + 0.005,
      direction: Math.random() > 0.5 ? 1 : -1,
      color:
        Math.random() > 0.6
          ? '#5eead4' // menta
          : Math.random() > 0.3
            ? '#c084fc' // violeta
            : '#ffffff'
    }));

    // Orbes flutuantes de plasma da aurora
    const orbs = [
      {
        x: width * 0.2,
        y: height * 0.25,
        radius: Math.max(width, height) * 0.38,
        colorInner: 'rgba(5, 230, 140, 0.22)',
        colorOuter: 'rgba(16, 185, 129, 0)',
        vx: 0.5,
        vy: 0.35,
        phase: 0
      },
      {
        x: width * 0.75,
        y: height * 0.3,
        radius: Math.max(width, height) * 0.42,
        colorInner: 'rgba(168, 85, 247, 0.24)',
        colorOuter: 'rgba(124, 58, 237, 0)',
        vx: -0.4,
        vy: 0.45,
        phase: Math.PI / 2
      },
      {
        x: width * 0.5,
        y: height * 0.7,
        radius: Math.max(width, height) * 0.4,
        colorInner: 'rgba(6, 182, 212, 0.18)',
        colorOuter: 'rgba(14, 165, 233, 0)',
        vx: 0.35,
        vy: -0.3,
        phase: Math.PI
      },
      {
        x: width * 0.85,
        y: height * 0.8,
        radius: Math.max(width, height) * 0.35,
        colorInner: 'rgba(217, 70, 239, 0.16)',
        colorOuter: 'rgba(192, 132, 252, 0)',
        vx: -0.3,
        vy: -0.4,
        phase: (Math.PI * 3) / 2
      }
    ];

    let t = 0;

    const render = () => {
      t += 0.008;
      ctx.clearRect(0, 0, width, height);

      // Fundo espacial ártico profundo
      const bgGrad = ctx.createRadialGradient(
        width * 0.5,
        0,
        width * 0.1,
        width * 0.5,
        height * 0.5,
        Math.max(width, height)
      );
      bgGrad.addColorStop(0, '#061325');
      bgGrad.addColorStop(0.5, '#030814');
      bgGrad.addColorStop(1, '#01040a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Renderizar orbes de luz viva com blend mode de plasma
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      orbs.forEach((orb) => {
        const ox = orb.x + Math.sin(t + orb.phase) * (width * 0.12);
        const oy = orb.y + Math.cos(t * 0.8 + orb.phase) * (height * 0.1);
        const currentRadius = orb.radius * (1 + Math.sin(t * 1.5 + orb.phase) * 0.12);

        const radGrad = ctx.createRadialGradient(ox, oy, 0, ox, oy, currentRadius);
        radGrad.addColorStop(0, orb.colorInner);
        radGrad.addColorStop(0.5, orb.colorInner.replace(/[\d\.]+\)$/, '0.08)'));
        radGrad.addColorStop(1, orb.colorOuter);

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(ox, oy, currentRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Ondas dinâmicas de Aurora Borealis cortando o topo da tela
      const waveLayers = [
        {
          color: 'rgba(5, 230, 140, 0.15)',
          freq: 0.002,
          speed: 1.2,
          amp: height * 0.14,
          baseY: height * 0.22
        },
        {
          color: 'rgba(168, 85, 247, 0.13)',
          freq: 0.0016,
          speed: 0.9,
          amp: height * 0.16,
          baseY: height * 0.28
        },
        {
          color: 'rgba(6, 182, 212, 0.12)',
          freq: 0.0024,
          speed: 1.5,
          amp: height * 0.12,
          baseY: height * 0.18
        }
      ];

      waveLayers.forEach((wave) => {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, wave.baseY);

        for (let x = 0; x <= width; x += 25) {
          const y =
            wave.baseY +
            Math.sin(x * wave.freq + t * wave.speed) * wave.amp +
            Math.cos(x * wave.freq * 0.5 + t * 0.7) * (wave.amp * 0.5);
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, 0);
        ctx.closePath();

        const waveGrad = ctx.createLinearGradient(0, 0, 0, wave.baseY + wave.amp);
        waveGrad.addColorStop(0, wave.color);
        waveGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = waveGrad;
        ctx.fill();
      });

      ctx.restore();

      // Partículas estelares piscando
      stars.forEach((star) => {
        star.alpha += star.speed * star.direction;
        if (star.alpha > 0.9) {
          star.alpha = 0.9;
          star.direction = -1;
        } else if (star.alpha < 0.15) {
          star.alpha = 0.15;
          star.direction = 1;
        }

        ctx.save();
        ctx.globalAlpha = star.alpha;
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.shadowBlur = 6;
        ctx.shadowColor = star.color;
        ctx.fill();
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden select-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full block" />
      {/* Camada sutil de granulação e iluminação atmosférica adicional */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#020611]/80 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}

