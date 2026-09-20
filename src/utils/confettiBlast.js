// Pure Canvas Dual-Cannon Confetti Blast (Zero Dependencies, 60fps)
export function fireDualConfetti() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);

  const colors = ['#a855f7', '#ec4899', '#3b82f6', '#eab308', '#10b981', '#f97316', '#06b6d4', '#f43f5e'];
  const particles = [];

  // Left Cannon (shooting upward & rightward from left edge of modal)
  for (let i = 0; i < 70; i++) {
    const angle = (Math.random() * 0.4 - 0.2) * Math.PI - 0.35; // ~ -30 to -60 deg
    const speed = 9 + Math.random() * 11;
    particles.push({
      x: Math.max(20, window.innerWidth * 0.25),
      y: window.innerHeight * 0.5,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 7 + Math.random() * 7,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rSpeed: (Math.random() - 0.5) * 14,
      opacity: 1,
      decay: 0.012 + Math.random() * 0.008
    });
  }

  // Right Cannon (shooting upward & leftward from right edge of modal)
  for (let i = 0; i < 70; i++) {
    const angle = Math.PI - ((Math.random() * 0.4 - 0.2) * Math.PI - 0.35); // ~ 150 to 120 deg
    const speed = 9 + Math.random() * 11;
    particles.push({
      x: Math.min(window.innerWidth - 20, window.innerWidth * 0.75),
      y: window.innerHeight * 0.5,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 7 + Math.random() * 7,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rSpeed: (Math.random() - 0.5) * 14,
      opacity: 1,
      decay: 0.012 + Math.random() * 0.008
    });
  }

  const gravity = 0.26;
  const friction = 0.982;
  let animId;

  function render() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    let anyAlive = false;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (p.opacity > 0) {
        anyAlive = true;
        p.vx *= friction;
        p.vy = p.vy * friction + gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rSpeed;
        p.opacity -= p.decay;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
        ctx.restore();
      }
    }

    if (anyAlive) {
      animId = requestAnimationFrame(render);
    } else {
      cancelAnimationFrame(animId);
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    }
  }

  render();
}
