import { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

/**
 * Animated neural-network background: drifting dots joined by lines, with pulses travelling along
 * them and a lime highlight around the cursor. Place inside a parent with `position: relative`.
 */
export function NeuralNetwork({
  className = '',
  maxNodes = 90,
  density = 16000,
  linkDistance = 150,
  speed = 0.35,
  mouseRadius = 160,
  lineColor = '96,165,250',
  dotColor = 'rgba(147,197,253,.85)',
  highlight = '228,248,106',
}: {
  className?: string;
  /** Upper limit on dots. */
  maxNodes?: number;
  /** Square pixels per dot; lower means more dots. */
  density?: number;
  /** Longest line drawn between two dots. */
  linkDistance?: number;
  speed?: number;
  mouseRadius?: number;
  /** "r,g,b" */
  lineColor?: string;
  dotColor?: string;
  /** "r,g,b" */
  highlight?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    const parent = canvas?.parentElement;
    if (!canvas || !ctx || !parent) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0;
    let h = 0;
    let nodes: Node[] = [];
    let pulses: { a: Node; b: Node; t: number }[] = [];
    let raf = 0;
    let mouse = { x: -999, y: -999 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      if (!r.width) return;
      w = r.width;
      h = r.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(maxNodes, (w * h) / density));
      nodes = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        r: Math.random() * 1.8 + 1,
      }));
      pulses = [];
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const n of nodes) {
        if (!reduce) {
          n.x += n.vx;
          n.y += n.vy;
        }
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }

      const edges: [Node, Node][] = [];
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < linkDistance) {
            edges.push([a, b]);
            const near = Math.hypot((a.x + b.x) / 2 - mouse.x, (a.y + b.y) / 2 - mouse.y) < mouseRadius;
            ctx.strokeStyle = near ? `rgba(${highlight},${(1 - d / linkDistance) * 0.6})` : `rgba(${lineColor},${(1 - d / linkDistance) * 0.35})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const n of nodes) {
        const near = Math.hypot(n.x - mouse.x, n.y - mouse.y) < mouseRadius;
        ctx.fillStyle = near ? `rgb(${highlight})` : dotColor;
        ctx.beginPath();
        ctx.arc(n.x, n.y, near ? n.r + 1.2 : n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Data pulses travelling along random links.
      if (!reduce && edges.length && Math.random() < 0.12) {
        const [a, b] = edges[(Math.random() * edges.length) | 0];
        pulses.push({ a, b, t: 0 });
      }
      pulses = pulses.filter((p) => (p.t += 0.025) < 1);
      for (const p of pulses) {
        const px = p.a.x + (p.b.x - p.a.x) * p.t;
        const py = p.a.y + (p.b.y - p.a.y) * p.t;
        const g = ctx.createRadialGradient(px, py, 0, px, py, 10);
        g.addColorStop(0, 'rgba(186,230,253,1)');
        g.addColorStop(1, 'rgba(56,189,248,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(px, py, 10, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onLeave = () => (mouse = { x: -999, y: -999 });

    resize();
    raf = requestAnimationFrame(draw);
    parent.addEventListener('mousemove', onMove);
    parent.addEventListener('mouseleave', onLeave);
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      parent.removeEventListener('mousemove', onMove);
      parent.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('resize', resize);
    };
  }, [maxNodes, density, linkDistance, speed, mouseRadius, lineColor, dotColor, highlight]);

  return <canvas ref={ref} className={className} aria-hidden />;
}
