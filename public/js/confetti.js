// confetti.js
// تأثير قصاصات احتفالية بسيط (بدون مكتبات خارجية)

export function launchConfetti(durationMs = 1500) {
  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;

  function resize() {
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
  }
  resize();
  window.addEventListener("resize", resize);

  const pieces = Array.from({ length: 140 }, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * canvas.height * 0.2,
    w: 6 + Math.random() * 10,
    h: 8 + Math.random() * 14,
    vx: (-1 + Math.random() * 2) * 1.2,
    vy: 2 + Math.random() * 4,
    rot: Math.random() * Math.PI,
    vr: (-1 + Math.random() * 2) * 0.07,
    a: 0.9
  }));

  const start = performance.now();

  function draw(now) {
    const elapsed = now - start;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of pieces) {
      p.x += p.vx * dpr;
      p.y += p.vy * dpr;
      p.rot += p.vr;

      // نخفف الشفافية مع الوقت
      p.a = Math.max(0, 0.95 - elapsed / durationMs);

      ctx.save();
      ctx.globalAlpha = p.a;

      // ألوان عشوائية خفيفة (بدون تحديد ثابت)
      ctx.fillStyle = `hsl(${Math.floor(Math.random() * 360)}, 85%, 60%)`;

      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }

    if (elapsed < durationMs) requestAnimationFrame(draw);
    else {
      window.removeEventListener("resize", resize);
      canvas.remove();
    }
  }

  requestAnimationFrame(draw);
}
