export default function sketch(p) {
  const stars = [];
  const motes = [];
  const ripples = [];
  let runtime = { aspect: 'landscape', fullscreen: false };

  function mix(a, b, t) {
    return a + (b - a) * t;
  }

  function clamp01(v) {
    return Math.max(0, Math.min(1, v));
  }

  function readRuntime() {
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
      heroX: portrait ? 0.56 : ultrawide ? 0.66 : square ? 0.61 : 0.64,
      heroY: portrait ? 0.42 : 0.44,
      horizonY: portrait ? 0.72 : 0.74,
      gateScale: portrait ? 0.34 : ultrawide ? 0.28 : 0.31,
      starCount: Math.floor((p.width * p.height) / (runtime.fullscreen ? 12000 : 14500)),
      moteCount: portrait ? 22 : ultrawide ? 28 : 24,
      rippleCount: portrait ? 7 : 8,
      monolithCount: portrait ? 5 : ultrawide ? 8 : 6,
      emptyLeft: portrait ? 0.08 : 0.1,
    };
  }

  function rebuild() {
    readRuntime();
    stars.length = 0;
    motes.length = 0;
    ripples.length = 0;
    const profile = cfg();

    for (let i = 0; i < profile.starCount; i += 1) {
      const zoneBias = p.random() < 0.68 ? p.random(profile.emptyLeft, 0.56) : p.random(0.18, 0.96);
      stars.push({
        x: p.width * zoneBias,
        y: p.random(p.height * 0.05, p.height * 0.6),
        size: p.random(0.9, profile.base * 0.006),
        alpha: p.random(10, 44),
        speed: p.random(0.25, 1.1),
        phase: p.random(p.TWO_PI),
        hue: p.random() > 0.74 ? p.random(188, 200) : p.random(270, 292),
      });
    }

    for (let i = 0; i < profile.moteCount; i += 1) {
      motes.push({
        x: p.random(p.width * 0.4, p.width * 0.92),
        y: p.random(p.height * 0.18, p.height * 0.84),
        r: p.random(profile.base * 0.004, profile.base * 0.012),
        drift: p.random(0.35, 1.1),
        sway: p.random(0.002, 0.009),
        phase: p.random(p.TWO_PI),
        hue: p.random() > 0.52 ? p.random(186, 198) : p.random(282, 304),
        alpha: p.random(10, 28),
      });
    }

    for (let i = 0; i < profile.rippleCount; i += 1) {
      ripples.push({
        y: mix(0.03, 0.34, i / Math.max(1, profile.rippleCount - 1)),
        w: mix(0.18, 0.82, i / Math.max(1, profile.rippleCount - 1)),
        h: mix(0.018, 0.08, i / Math.max(1, profile.rippleCount - 1)),
        alpha: mix(14, 3, i / Math.max(1, profile.rippleCount - 1)),
        phase: p.random(p.TWO_PI),
      });
    }
  }

  function drawGradientBackground() {
    for (let y = 0; y < p.height; y += 2) {
      const t = y / Math.max(1, p.height - 1);
      const hue = t < 0.55 ? mix(236, 255, t / 0.55) : mix(255, 272, (t - 0.55) / 0.45);
      const sat = t < 0.48 ? mix(42, 56, t / 0.48) : mix(56, 28, (t - 0.48) / 0.52);
      const bri = t < 0.5 ? mix(3, 11, t / 0.5) : mix(11, 7, (t - 0.5) / 0.5);
      p.stroke(hue, sat, bri, 100);
      p.line(0, y, p.width, y);
    }

    p.noStroke();
    const profile = cfg();
    for (let i = 0; i < 5; i += 1) {
      const x = p.width * (0.14 + i * 0.11);
      const y = p.height * (0.18 + i * 0.06);
      p.fill(195 + i * 3, 28, 100, 2.2 + i * 0.6);
      p.ellipse(x, y, profile.base * 0.34, profile.base * 0.1);
    }
    for (let i = 0; i < 4; i += 1) {
      const x = p.width * (0.72 + i * 0.07);
      const y = p.height * (0.22 + i * 0.08);
      p.fill(288 + i * 3, 30, 100, 1.8 + i * 0.6);
      p.ellipse(x, y, profile.base * 0.22, profile.base * 0.07);
    }
  }

  function drawStars() {
    p.noStroke();
    for (const star of stars) {
      const twinkle = 0.35 + 0.65 * Math.sin(p.frameCount * 0.02 * star.speed + star.phase);
      p.fill(star.hue, 18 + twinkle * 22, 84 + twinkle * 16, star.alpha * twinkle);
      p.circle(star.x, star.y, star.size * (0.8 + twinkle * 0.8));
    }
  }

  function drawFarMonoliths() {
    const profile = cfg();
    const horizon = p.height * profile.horizonY;
    p.noStroke();
    for (let i = 0; i < profile.monolithCount; i += 1) {
      const t = i / Math.max(1, profile.monolithCount - 1);
      const x = p.width * mix(0.18, 0.92, t);
      const h = profile.base * mix(0.06, 0.22, (Math.sin(i * 1.7) + 1) * 0.5);
      const w = profile.base * mix(0.018, 0.05, (Math.cos(i * 1.3) + 1) * 0.5);
      const alpha = x < p.width * 0.5 ? 14 : 18;
      p.fill(244, 24, 10 + i, alpha);
      p.quad(x - w * 0.6, horizon, x - w * 0.34, horizon - h, x + w * 0.5, horizon - h * 1.04, x + w * 0.66, horizon);
      p.fill(194, 40, 78, alpha * 0.16);
      p.quad(x - w * 0.08, horizon - h * 0.92, x + w * 0.06, horizon - h * 0.96, x + w * 0.18, horizon - h * 0.08, x + w * 0.02, horizon - h * 0.05);
    }
  }

  function gatePoints(cx, cy, scale, tilt) {
    const w = scale;
    const h = scale * 1.28;
    return [
      { x: cx - w * 0.42, y: cy - h * 0.56 },
      { x: cx + w * 0.16, y: cy - h * 0.86 },
      { x: cx + w * 0.58, y: cy - h * 0.18 },
      { x: cx + w * 0.36, y: cy + h * 0.74 },
      { x: cx - w * 0.26, y: cy + h * 0.88 },
      { x: cx - w * 0.64, y: cy + h * 0.12 },
    ].map((pt) => ({ x: pt.x + tilt * (pt.y - cy), y: pt.y }));
  }

  function insetPoints(points, cx, cy, factor) {
    return points.map((pt) => ({
      x: mix(cx, pt.x, factor),
      y: mix(cy, pt.y, factor),
    }));
  }

  function drawPolygon(points) {
    p.beginShape();
    for (const pt of points) {
      p.vertex(pt.x, pt.y);
    }
    p.endShape(p.CLOSE);
  }

  function drawEdgeGlow(a, b, hue, alpha, weight) {
    p.stroke(hue, 60, 100, alpha * 0.32);
    p.strokeWeight(weight * 2.8);
    p.line(a.x, a.y, b.x, b.y);
    p.stroke(hue, 34, 100, alpha);
    p.strokeWeight(weight);
    p.line(a.x, a.y, b.x, b.y);
  }

  function drawPrismGate(cx, cy, gateSize) {
    const time = p.frameCount;
    const tilt = 0.12 + 0.015 * Math.sin(time * 0.01);
    const outer = gatePoints(cx, cy, gateSize, tilt);
    const mid = insetPoints(outer, cx, cy, 0.8);
    const inner = insetPoints(outer, cx, cy, 0.49);
    const slit = insetPoints(outer, cx - gateSize * 0.02, cy + gateSize * 0.04, 0.17);

    p.noStroke();
    for (let i = 8; i >= 1; i -= 1) {
      const pulse = 1 + 0.025 * Math.sin(time * 0.016 + i * 0.5);
      p.fill(286, 34, 100, 1.2 + i * 0.75);
      drawPolygon(insetPoints(outer, cx, cy, 1 + i * 0.045 * pulse));
    }

    p.fill(238, 24, 10, 92);
    drawPolygon(outer);
    p.fill(232, 22, 7, 96);
    drawPolygon(mid);

    p.fill(194, 70, 100, 3.8);
    drawPolygon(insetPoints(outer, cx + gateSize * 0.05, cy - gateSize * 0.08, 0.98));

    for (let i = 0; i < outer.length; i += 1) {
      const next = (i + 1) % outer.length;
      const weight = gateSize * (i % 2 === 0 ? 0.011 : 0.007);
      const hue = i < 3 ? 194 : 288;
      const alpha = i < 3 ? 26 : 20;
      drawEdgeGlow(outer[i], outer[next], hue, alpha, weight);
    }

    for (let i = 0; i < mid.length; i += 1) {
      const next = (i + 1) % mid.length;
      const weight = gateSize * 0.0045;
      drawEdgeGlow(mid[i], mid[next], i < 3 ? 196 : 286, 11, weight);
    }

    p.fill(0, 0, 2, 98);
    drawPolygon(inner);

    for (let i = 5; i >= 1; i -= 1) {
      const pulse = 1 + 0.06 * Math.sin(time * 0.03 + i);
      p.fill(194 + i * 2, 46, 100, 1.8 + i * 1.4);
      drawPolygon(insetPoints(slit, cx, cy, 1 + i * 0.12 * pulse));
      p.fill(286 + i * 2, 34, 100, 1 + i * 1.1);
      drawPolygon(insetPoints(slit, cx, cy, 1 + i * 0.07 * pulse));
    }

    p.fill(192, 40, 100, 48);
    drawPolygon(slit);

    const glintY = cy - gateSize * 0.62 + gateSize * 0.13 * Math.sin(time * 0.024);
    p.noStroke();
    p.fill(192, 36, 100, 26);
    p.ellipse(cx + gateSize * 0.12, glintY, gateSize * 0.22, gateSize * 0.05);
    p.fill(288, 34, 100, 20);
    p.ellipse(cx - gateSize * 0.22, cy + gateSize * 0.52, gateSize * 0.16, gateSize * 0.04);
  }

  function drawGateShadow(cx, horizon, gateSize) {
    p.noStroke();
    for (let i = 0; i < 7; i += 1) {
      const t = i / 6;
      p.fill(248, 20, 5, 7 - i * 0.8);
      p.ellipse(cx - gateSize * 0.08, horizon + gateSize * 0.09, gateSize * mix(0.68, 1.34, t), gateSize * mix(0.07, 0.22, t));
    }
  }

  function drawMotes() {
    p.noStroke();
    for (const mote of motes) {
      const t = 0.45 + 0.55 * Math.sin(p.frameCount * mote.sway * 40 + mote.phase);
      const x = mote.x + Math.sin(p.frameCount * 0.012 * mote.drift + mote.phase) * mote.r * 6;
      const y = mote.y + Math.cos(p.frameCount * 0.008 * mote.drift + mote.phase) * mote.r * 3;
      p.fill(mote.hue, 44, 100, mote.alpha * t);
      p.circle(x, y, mote.r * (0.8 + t));
      if (t > 0.8) {
        p.fill(mote.hue, 18, 100, mote.alpha * 0.18);
        p.ellipse(x, y, mote.r * 4.6, mote.r * 1.6);
      }
    }
  }

  function drawLake(cx, gateSize) {
    const profile = cfg();
    const horizon = p.height * profile.horizonY;

    p.noStroke();
    for (let y = horizon; y < p.height; y += 2) {
      const t = (y - horizon) / Math.max(1, p.height - horizon);
      p.fill(226 + t * 12, 34 - t * 8, 10 + t * 7, 14);
      p.rect(0, y, p.width, 3);
    }

    for (let i = 0; i < 4; i += 1) {
      const bandY = horizon + gateSize * (0.12 + i * 0.13);
      p.fill(194 + i * 4, 22, 100, 1.5 + i * 0.8);
      p.rect(0, bandY, p.width, gateSize * 0.018);
    }

    for (const ripple of ripples) {
      const y = horizon + gateSize * ripple.y + Math.sin(p.frameCount * 0.02 + ripple.phase) * gateSize * 0.01;
      p.noFill();
      p.stroke(194, 22, 100, ripple.alpha);
      p.strokeWeight(gateSize * 0.006);
      p.ellipse(cx - gateSize * 0.02, y, gateSize * ripple.w, gateSize * ripple.h);
    }
  }

  function drawReflection(cx, cy, gateSize) {
    const profile = cfg();
    const horizon = p.height * profile.horizonY;
    const time = p.frameCount;
    const reflectedCy = horizon + (horizon - cy) + gateSize * 0.12;
    const outer = gatePoints(cx - gateSize * 0.03, reflectedCy, gateSize * 0.9, -0.08);
    const mid = insetPoints(outer, cx, reflectedCy, 0.78);
    const slit = insetPoints(outer, cx, reflectedCy + gateSize * 0.05, 0.18);

    p.noStroke();
    for (let i = 5; i >= 1; i -= 1) {
      const pulse = 1 + 0.045 * Math.sin(time * 0.024 + i * 0.4);
      p.fill(194 + i * 2, 34, 100, 0.9 + i * 0.8);
      drawPolygon(insetPoints(outer, cx, reflectedCy, 1 + i * 0.07 * pulse));
    }

    p.fill(234, 20, 8, 34);
    drawPolygon(outer);
    p.fill(238, 20, 5, 46);
    drawPolygon(mid);
    p.fill(194, 54, 100, 12);
    drawPolygon(slit);

    for (let i = 0; i < 7; i += 1) {
      const t = i / 6;
      p.fill(286 - i * 2, 26, 100, 2.2 + (1 - t) * 1.8);
      p.ellipse(cx - gateSize * 0.06, horizon + gateSize * mix(0.14, 0.46, t), gateSize * mix(0.46, 0.12, t), gateSize * mix(0.08, 0.24, t));
    }
  }

  function drawForegroundMask() {
    const profile = cfg();
    p.noStroke();
    p.fill(240, 18, 4, 72);
    p.quad(0, p.height, 0, p.height * 0.84, p.width * 0.22, p.height * 0.8, p.width * 0.32, p.height);
    p.quad(p.width, p.height, p.width * 0.86, p.height * 0.83, p.width * 0.7, p.height * 0.78, p.width, p.height * 0.74);

    for (let i = 0; i < 5; i += 1) {
      const x = p.width * (0.08 + i * 0.2);
      const y = p.height * (0.84 + 0.018 * Math.sin(i * 1.2));
      p.fill(274 + i * 2, 18, 18, 8);
      p.ellipse(x, y, profile.base * 0.34, profile.base * 0.05);
    }
  }

  function drawVignette() {
    const radius = Math.hypot(p.width, p.height) * 0.74;
    p.noFill();
    for (let i = 0; i < 18; i += 1) {
      const t = i / 17;
      p.stroke(0, 0, 0, 1.8 + t * 4.5);
      p.strokeWeight(radius * 0.018);
      p.ellipse(p.width * 0.5, p.height * 0.5, radius * (1 + t * 0.46), radius * (0.7 + t * 0.34));
    }
  }

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    rebuild();
  };

  p.draw = () => {
    const profile = cfg();
    const gateSize = profile.base * profile.gateScale;
    const cx = p.width * profile.heroX;
    const cy = p.height * profile.heroY;
    const horizon = p.height * profile.horizonY;

    drawGradientBackground();
    drawStars();
    drawFarMonoliths();
    drawGateShadow(cx, horizon, gateSize);
    drawPrismGate(cx, cy, gateSize);
    drawMotes();
    drawLake(cx, gateSize);
    drawReflection(cx, cy, gateSize);
    drawForegroundMask();
    drawVignette();
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    rebuild();
  };
}
