export default function sketch(p) {
  const stars = [];
  const embers = [];
  const ripples = [];
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
      heroX: portrait ? 0.52 : ultrawide ? 0.62 : 0.6,
      heroY: portrait ? 0.4 : 0.47,
      lakeY: portrait ? 0.74 : 0.77,
      starCount: Math.floor((p.width * p.height) / (runtime.fullscreen ? 7000 : 8800)),
      emberCount: portrait ? 60 : ultrawide ? 90 : 72,
      rippleCount: portrait ? 6 : 8,
      gateScale: portrait ? 0.31 : ultrawide ? 0.24 : 0.27,
      petalStretch: portrait ? 1.36 : ultrawide ? 1.62 : 1.48,
      sideBloom: portrait ? 0.24 : 0.28,
    };
  }

  function rebuild() {
    fetchRuntime();
    stars.length = 0;
    embers.length = 0;
    ripples.length = 0;
    const profile = cfg();

    for (let i = 0; i < profile.starCount; i += 1) {
      stars.push({
        x: p.random(p.width),
        y: p.random(p.height * 0.72),
        size: p.random(0.8, profile.base * 0.008),
        depth: p.random(0.25, 1),
        phase: p.random(p.TWO_PI),
        speed: p.random(0.25, 1.4),
        hue: p.random() > 0.78 ? p.random(178, 202) : p.random(246, 292),
        alpha: p.random(14, 62),
      });
    }

    for (let i = 0; i < profile.emberCount; i += 1) {
      embers.push({
        x: p.random(p.width * 0.08, p.width * 0.92),
        y: p.random(p.height * 0.18, p.height * 0.9),
        r: p.random(profile.base * 0.004, profile.base * 0.02),
        drift: p.random(0.15, 0.65),
        sway: p.random(0.3, 1.1),
        phase: p.random(p.TWO_PI),
        depth: p.random(0.3, 1),
        hue: p.random() > 0.4 ? p.random(186, 206) : p.random(288, 328),
      });
    }

    for (let i = 0; i < profile.rippleCount; i += 1) {
      ripples.push({
        offset: mix(-0.12, 0.16, i / Math.max(1, profile.rippleCount - 1)),
        width: profile.base * mix(0.42, 1.28, i / Math.max(1, profile.rippleCount - 1)),
        height: profile.base * mix(0.035, 0.12, i / Math.max(1, profile.rippleCount - 1)),
        alpha: mix(16, 4, i / Math.max(1, profile.rippleCount - 1)),
        speed: p.random(0.01, 0.028),
      });
    }
  }

  function drawGradientBackground() {
    for (let y = 0; y < p.height; y += 2) {
      const t = y / Math.max(1, p.height - 1);
      const hue = t < 0.44 ? mix(234, 258, t / 0.44) : mix(258, 330, (t - 0.44) / 0.56);
      const sat = t < 0.52 ? mix(52, 66, t / 0.52) : mix(66, 44, (t - 0.52) / 0.48);
      const bri = t < 0.46 ? mix(4, 12, t / 0.46) : mix(12, 8, (t - 0.46) / 0.54);
      p.stroke(hue, sat, bri, 100);
      p.line(0, y, p.width, y);
    }

    p.noStroke();
    const profile = cfg();
    for (let i = 0; i < 6; i += 1) {
      const x = p.width * (0.08 + i * 0.18);
      const y = p.height * (0.18 + 0.05 * Math.sin(i * 0.9));
      p.fill(294 + i * 4, 46, 30, 7);
      p.ellipse(x, y, profile.base * 0.54, profile.base * 0.18);
    }

    for (let i = 0; i < 5; i += 1) {
      const x = p.width * (0.2 + i * 0.16);
      const y = p.height * 0.78;
      p.fill(24 + i * 5, 64, 20, 5);
      p.ellipse(x, y, profile.base * 0.7, profile.base * 0.12);
    }
  }

  function drawStars() {
    p.noStroke();
    for (const star of stars) {
      const twinkle = 0.42 + 0.58 * Math.sin(p.frameCount * 0.03 * star.speed + star.phase);
      p.fill(star.hue, 28 + star.depth * 34, 84 + twinkle * 16, star.alpha * twinkle);
      p.circle(star.x, star.y, star.size * (0.75 + twinkle));
      if (star.depth > 0.72 && twinkle > 0.82) {
        p.fill(star.hue, 20, 100, 10 + twinkle * 8);
        p.ellipse(star.x, star.y, star.size * 4.6, star.size * 1.2);
      }
    }
  }

  function drawMoonGlow(cx, cy, gateRadius) {
    p.noStroke();
    for (let i = 8; i >= 1; i -= 1) {
      const pulse = 1 + 0.025 * Math.sin(p.frameCount * 0.018 + i * 0.4);
      p.fill(194 + i * 2, 30 - i * 1.6, 100, 1.4 + i * 0.8);
      p.ellipse(cx - gateRadius * 0.04, cy - gateRadius * 0.5, gateRadius * (1.45 + i * 0.16) * pulse, gateRadius * (1.18 + i * 0.12) * pulse);
      p.fill(302 - i, 38, 100, 1 + i * 0.7);
      p.ellipse(cx - gateRadius * 0.02, cy - gateRadius * 0.48, gateRadius * (1.18 + i * 0.12) * pulse, gateRadius * (0.98 + i * 0.1) * pulse);
    }
    p.fill(0, 0, 100, 95);
    p.circle(cx - gateRadius * 0.02, cy - gateRadius * 0.5, gateRadius * 0.62);
    p.fill(194, 18, 100, 25);
    p.circle(cx - gateRadius * 0.1, cy - gateRadius * 0.56, gateRadius * 0.16);
  }

  function drawPetalArc(cx, cy, gateRadius, rotation, scale, hue, alpha, thickness, stretch, bloom) {
    p.push();
    p.translate(cx, cy);
    p.rotate(rotation);
    p.noFill();
    p.strokeCap(p.ROUND);

    p.stroke(hue, 46, 100, alpha * 0.28);
    p.strokeWeight(thickness * 2.3);
    p.arc(0, 0, gateRadius * scale * stretch, gateRadius * scale, -2.36, -0.78);
    p.arc(0, 0, gateRadius * scale * stretch, gateRadius * scale, 0.78, 2.36);

    p.stroke(hue, 28, 100, alpha);
    p.strokeWeight(thickness);
    p.arc(0, 0, gateRadius * scale * stretch, gateRadius * scale, -2.42, -0.72);
    p.arc(0, 0, gateRadius * scale * stretch, gateRadius * scale, 0.72, 2.42);

    p.noStroke();
    p.fill(hue, 52, 100, bloom * 0.75);
    p.ellipse(0, -gateRadius * scale * 0.32, gateRadius * scale * stretch * 0.48, gateRadius * scale * 0.24);
    p.pop();
  }

  function drawLotusGate(cx, cy, gateRadius) {
    const profile = cfg();
    const breathe = 1 + 0.025 * Math.sin(p.frameCount * 0.02);
    const stretch = profile.petalStretch;
    const rotations = [-1.22, -0.78, -0.28, 0.3, 0.82, 1.24];

    for (let i = 0; i < rotations.length; i += 1) {
      const rotation = rotations[i] + Math.sin(p.frameCount * 0.008 + i) * 0.04;
      const hue = i % 2 === 0 ? 286 + i * 4 : 192 + i * 3;
      const scale = breathe * mix(1.05, 1.72, i / (rotations.length - 1));
      drawPetalArc(cx, cy, gateRadius, rotation, scale, hue, 26 - i * 2.2, gateRadius * 0.038, stretch, 10 - i);
    }

    for (let i = 5; i >= 1; i -= 1) {
      const pulse = 1 + 0.04 * Math.sin(p.frameCount * 0.015 + i * 0.5);
      p.noStroke();
      p.fill(284 + i * 3, 48 - i * 1.6, 100, 2 + i * 1.1);
      p.ellipse(cx + gateRadius * 0.03, cy + gateRadius * 0.08, gateRadius * (1.9 + i * 0.14) * pulse, gateRadius * (0.64 + i * 0.05) * pulse);
    }

    p.noFill();
    for (let i = 0; i < 4; i += 1) {
      p.stroke(196 + i * 10, 58, 100, 11 - i * 2);
      p.strokeWeight(gateRadius * (0.03 - i * 0.005));
      p.arc(cx + gateRadius * 0.16, cy + gateRadius * 0.12, gateRadius * (2.4 + i * 0.16), gateRadius * (1.18 + i * 0.08), 0.24, p.PI - 0.14);
    }
  }

  function drawSideBlooms(cx, cy, gateRadius) {
    const profile = cfg();
    const side = gateRadius * profile.sideBloom;
    p.noStroke();
    for (let i = 0; i < 12; i += 1) {
      const angle = -0.42 + i * 0.17;
      const radius = gateRadius * mix(1.1, 2.2, i / 11);
      const x = cx - Math.cos(angle) * radius * 0.96;
      const y = cy + Math.sin(angle) * radius * 0.44;
      p.fill(186 + i, 60, 100, 2.6 + i * 0.3);
      p.ellipse(x, y, side * mix(0.4, 1.4, i / 11), side * mix(0.16, 0.62, i / 11));
    }

    for (let i = 0; i < 10; i += 1) {
      const angle = 0.18 + i * 0.18;
      const radius = gateRadius * mix(1, 2.1, i / 9);
      const x = cx + Math.cos(angle) * radius * 0.98;
      const y = cy + Math.sin(angle) * radius * 0.36;
      p.fill(302 + i * 2, 48, 100, 2.3 + i * 0.28);
      p.ellipse(x, y, side * mix(0.42, 1.28, i / 9), side * mix(0.16, 0.56, i / 9));
    }
  }

  function drawWaterAndReflection(cx, gateRadius) {
    const profile = cfg();
    const horizon = p.height * profile.lakeY;

    p.noStroke();
    for (let y = horizon; y < p.height; y += 2) {
      const t = (y - horizon) / Math.max(1, p.height - horizon);
      p.fill(222 + t * 24, 54 - t * 18, 14 + t * 8, 11);
      p.rect(0, y, p.width, 3);
    }

    for (const ripple of ripples) {
      const wobble = Math.sin(p.frameCount * ripple.speed + ripple.offset * 10) * gateRadius * 0.05;
      p.noFill();
      p.stroke(194, 22, 100, ripple.alpha);
      p.strokeWeight(gateRadius * 0.01);
      p.ellipse(cx + gateRadius * 0.08, horizon + gateRadius * (0.18 + ripple.offset) + wobble, ripple.width, ripple.height);
    }

    for (let i = 0; i < 12; i += 1) {
      const t = i / 11;
      const shimmer = 0.7 + 0.3 * Math.sin(p.frameCount * 0.018 + i * 0.7);
      p.noStroke();
      p.fill(196 + t * 14, 48 - t * 14, 100, 2 + (1 - t) * 5 * shimmer);
      p.ellipse(cx + gateRadius * 0.08, horizon + gateRadius * mix(0.08, 0.58, t), gateRadius * mix(0.52, 0.12, t), gateRadius * mix(0.12, 0.42, t));
      p.fill(302 - t * 10, 34, 100, 1 + (1 - t) * 4 * shimmer);
      p.ellipse(cx + gateRadius * 0.02, horizon + gateRadius * mix(0.04, 0.5, t), gateRadius * mix(0.72, 0.18, t), gateRadius * mix(0.06, 0.28, t));
    }
  }

  function drawEmbers() {
    p.noStroke();
    for (const ember of embers) {
      const twinkle = 0.45 + 0.55 * Math.sin(p.frameCount * 0.02 * ember.sway + ember.phase);
      const x = ember.x + Math.sin(p.frameCount * 0.007 + ember.phase) * ember.r * 2.4;
      const y = ember.y + Math.cos(p.frameCount * 0.011 * ember.drift + ember.phase) * ember.r * 1.8;
      p.fill(ember.hue, 48 + ember.depth * 20, 100, 5 + twinkle * 16 * ember.depth);
      p.circle(x, y, ember.r * (0.7 + twinkle * 0.9));
      if (ember.depth > 0.72) {
        p.fill(ember.hue, 24, 100, 2 + twinkle * 5);
        p.ellipse(x, y, ember.r * 3.4, ember.r * 1.2);
      }
    }
  }

  function drawForegroundMist() {
    const profile = cfg();
    p.noStroke();
    for (let i = 0; i < 5; i += 1) {
      const x = p.width * (0.14 + i * 0.18);
      const y = p.height * (0.84 + 0.02 * Math.sin(i));
      p.fill(280 + i * 6, 26, 24, 7);
      p.ellipse(x, y, profile.base * 0.46, profile.base * 0.08);
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
    const profile = cfg();
    const gateRadius = profile.base * profile.gateScale;
    const cx = p.width * profile.heroX;
    const cy = p.height * profile.heroY;

    drawGradientBackground();
    drawStars();
    drawMoonGlow(cx, cy, gateRadius);
    drawSideBlooms(cx, cy, gateRadius);
    drawLotusGate(cx, cy, gateRadius);
    drawEmbers();
    drawWaterAndReflection(cx, gateRadius);
    drawForegroundMist();
    drawVignette();
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    rebuild();
  };
}
