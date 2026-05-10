export default function sketch(p) {
  const stars = [];
  const bubbles = [];
  const kelp = [];
  let runtime = { aspect: 'landscape', fullscreen: false };

  function mix(a, b, t) {
    return a + (b - a) * t;
  }

  function fetchRuntime() {
    const info = window.__HERMES_VJ_RUNTIME;
    if (info && typeof info === 'object') {
      runtime = {
        aspect: info.aspect || 'landscape',
        fullscreen: Boolean(info.fullscreen),
      };
    }
  }

  function cfg() {
    const base = Math.min(p.width, p.height);
    const portrait = runtime.aspect === 'portrait';
    const ultrawide = runtime.aspect === 'ultrawide';
    const square = runtime.aspect === 'square';
    return {
      base,
      portrait,
      ultrawide,
      square,
      moteCount: Math.floor((p.width * p.height) / (runtime.fullscreen ? 8500 : 10500)),
      bubbleCount: portrait ? 42 : ultrawide ? 64 : 52,
      kelpCount: portrait ? 7 : ultrawide ? 10 : 8,
      coreY: portrait ? 0.46 : 0.5,
      coreX: portrait ? 0.5 : ultrawide ? 0.48 : 0.5,
      headRadius: portrait ? 0.2 : ultrawide ? 0.16 : 0.18,
    };
  }

  function rebuild() {
    fetchRuntime();
    stars.length = 0;
    bubbles.length = 0;
    kelp.length = 0;
    const profile = cfg();

    for (let i = 0; i < profile.moteCount; i += 1) {
      stars.push({
        x: p.random(p.width),
        y: p.random(p.height),
        size: p.random(1, profile.base * 0.012),
        phase: p.random(p.TWO_PI),
        speed: p.random(0.4, 1.4),
        hue: p.random() > 0.55 ? p.random(178, 206) : p.random(270, 315),
        alpha: p.random(8, 34),
      });
    }

    for (let i = 0; i < profile.bubbleCount; i += 1) {
      bubbles.push({
        x: p.random(p.width),
        y: p.random(p.height + profile.base * 0.2),
        r: p.random(profile.base * 0.01, profile.base * 0.045),
        rise: p.random(0.18, 0.75),
        sway: p.random(0.3, 1.2),
        phase: p.random(p.TWO_PI),
      });
    }

    for (let i = 0; i < profile.kelpCount; i += 1) {
      kelp.push({
        x: p.width * (0.08 + (i / Math.max(1, profile.kelpCount - 1)) * 0.84),
        h: profile.base * p.random(0.34, 0.68),
        width: profile.base * p.random(0.016, 0.032),
        bend: p.random(0.4, 1.3),
        phase: p.random(p.TWO_PI),
        hue: p.random(142, 178),
      });
    }
  }

  function drawBackground() {
    for (let y = 0; y < p.height; y += 2) {
      const t = y / Math.max(1, p.height - 1);
      const hue = t < 0.45 ? mix(224, 248, t / 0.45) : mix(248, 178, (t - 0.45) / 0.55);
      const sat = t < 0.5 ? mix(62, 72, t / 0.5) : mix(72, 54, (t - 0.5) / 0.5);
      const bri = t < 0.52 ? mix(8, 18, t / 0.52) : mix(18, 11, (t - 0.52) / 0.48);
      p.stroke(hue, sat, bri, 100);
      p.line(0, y, p.width, y);
    }

    p.noStroke();
    for (let i = 0; i < 7; i += 1) {
      const x = p.width * (0.14 + (i / 6) * 0.72);
      const y = p.height * (0.18 + 0.08 * Math.sin(i * 1.1));
      p.fill(286 + i * 4, 58, 32, 7);
      p.ellipse(x, y, cfg().base * 0.56, cfg().base * 0.24);
    }
  }

  function drawMotes() {
    p.noStroke();
    for (const mote of stars) {
      const twinkle = 0.45 + 0.55 * Math.sin(p.frameCount * 0.02 * mote.speed + mote.phase);
      p.fill(mote.hue, 36 + twinkle * 28, 88 + twinkle * 12, mote.alpha * twinkle);
      p.circle(mote.x, mote.y, mote.size * (0.8 + twinkle));
    }
  }

  function drawKelp() {
    p.noFill();
    p.strokeCap(p.ROUND);
    for (const blade of kelp) {
      p.stroke(blade.hue, 54, 58, 22);
      p.strokeWeight(blade.width * 1.9);
      p.beginShape();
      for (let i = 0; i <= 18; i += 1) {
        const t = i / 18;
        const y = p.height - blade.h * t;
        const sway = Math.sin(p.frameCount * 0.015 + blade.phase + t * 3.6) * blade.width * 18 * blade.bend * (1 - t * 0.35);
        const x = blade.x + sway;
        p.vertex(x, y);
      }
      p.endShape();
    }
  }

  function drawTentacle(cx, cy, length, angleBase, hueA, hueB, flip, profile) {
    const segments = 42;
    p.noFill();
    p.strokeCap(p.ROUND);
    for (let layer = 0; layer < 2; layer += 1) {
      p.stroke(layer === 0 ? hueA : hueB, layer === 0 ? 62 : 44, 100, layer === 0 ? 16 : 34);
      p.strokeWeight(profile.base * (layer === 0 ? 0.026 : 0.015));
      p.beginShape();
      for (let i = 0; i <= segments; i += 1) {
        const t = i / segments;
        const drift = Math.sin(p.frameCount * 0.02 + t * 8 + angleBase * 2) * profile.base * 0.018;
        const curl = Math.sin(t * p.PI * 1.1 + p.frameCount * 0.014 + angleBase * 1.6) * profile.base * mix(0.02, 0.16, t);
        const reach = length * t;
        const angle = angleBase + flip * mix(-0.6, 0.42, t) + Math.sin(p.frameCount * 0.012 + t * 4 + angleBase) * 0.08;
        const x = cx + Math.cos(angle) * reach + curl * flip + drift;
        const y = cy + Math.sin(angle) * reach + Math.sin(t * p.PI) * profile.base * 0.08;
        p.vertex(x, y);
      }
      p.endShape();
    }
  }

  function drawOctopus() {
    const profile = cfg();
    const cx = p.width * profile.coreX;
    const cy = p.height * profile.coreY;
    const head = profile.base * profile.headRadius;

    for (let i = 0; i < 8; i += 1) {
      const side = i < 4 ? -1 : 1;
      const index = i % 4;
      const angle = side < 0 ? mix(p.PI * 0.9, p.PI * 1.42, index / 3) : mix(-0.38, 0.16, index / 3);
      const length = head * mix(1.6, 2.55, index / 3) * (profile.portrait ? 1.08 : 1);
      drawTentacle(cx + side * head * 0.22, cy + head * 0.46, length, angle, 190 + index * 4, 292 + index * 5, side, profile);
    }

    p.noStroke();
    for (let i = 8; i >= 1; i -= 1) {
      const pulse = 1 + 0.03 * Math.sin(p.frameCount * 0.02 + i * 0.5);
      p.fill(192 + i * 2, 64 - i * 2.2, 100, 3 + i * 1.2);
      p.ellipse(cx, cy + head * 0.1, head * (2.2 + i * 0.18) * pulse, head * (2.1 + i * 0.16) * pulse);
      p.fill(298 - i * 1.4, 48, 100, 2 + i * 0.9);
      p.ellipse(cx, cy, head * (1.7 + i * 0.14) * pulse, head * (1.55 + i * 0.14) * pulse);
    }

    p.fill(282, 54, 92, 92);
    p.ellipse(cx, cy, head * 1.62, head * 1.42);
    p.ellipse(cx, cy + head * 0.28, head * 1.24, head * 0.84);

    p.fill(184, 44, 100, 38);
    p.ellipse(cx - head * 0.18, cy - head * 0.16, head * 0.42, head * 0.26);
    p.ellipse(cx + head * 0.08, cy - head * 0.22, head * 0.34, head * 0.18);

    p.fill(0, 0, 100, 78);
    p.circle(cx - head * 0.22, cy - head * 0.02, head * 0.13);
    p.circle(cx + head * 0.22, cy - head * 0.02, head * 0.13);
    p.fill(192, 48, 100, 80);
    p.circle(cx - head * 0.2, cy - head * 0.035, head * 0.05);
    p.circle(cx + head * 0.24, cy - head * 0.04, head * 0.05);

    for (let ring = 0; ring < 3; ring += 1) {
      p.noFill();
      p.stroke(194 + ring * 8, 66, 100, 14 - ring * 3);
      p.strokeWeight(profile.base * (0.018 - ring * 0.003));
      p.arc(cx, cy + head * 0.5, head * (2.1 + ring * 0.26), head * (0.74 + ring * 0.1), 0.12, p.PI - 0.12);
    }
  }

  function drawBubbles() {
    p.noFill();
    for (const bubble of bubbles) {
      const sway = Math.sin(p.frameCount * 0.015 * bubble.sway + bubble.phase) * cfg().base * 0.018;
      const shimmer = 0.45 + 0.55 * Math.sin(p.frameCount * 0.03 + bubble.phase * 2);
      p.stroke(194, 28, 100, 10 + shimmer * 14);
      p.strokeWeight(1.2);
      p.circle(bubble.x + sway, bubble.y, bubble.r * (0.8 + shimmer * 0.4));
      p.noStroke();
      p.fill(198, 18, 100, 6 + shimmer * 8);
      p.circle(bubble.x + sway - bubble.r * 0.16, bubble.y - bubble.r * 0.16, bubble.r * 0.22);
      bubble.y -= bubble.rise;
      bubble.x += Math.sin(p.frameCount * 0.005 + bubble.phase) * 0.08;
      if (bubble.y < -bubble.r) {
        bubble.y = p.height + p.random(cfg().base * 0.02, cfg().base * 0.18);
        bubble.x = p.random(p.width);
      }
    }
  }

  function drawVignette() {
    const radius = Math.hypot(p.width, p.height) * 0.72;
    p.noFill();
    for (let i = 0; i < 18; i += 1) {
      const t = i / 17;
      p.stroke(0, 0, 0, 1.5 + t * 4.2);
      p.strokeWeight(radius * 0.018);
      p.ellipse(p.width * 0.5, p.height * 0.5, radius * (1 + t * 0.46), radius * (0.74 + t * 0.34));
    }
  }

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    rebuild();
  };

  p.draw = () => {
    drawBackground();
    drawMotes();
    drawKelp();
    drawOctopus();
    drawBubbles();
    drawVignette();
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    rebuild();
  };
}
