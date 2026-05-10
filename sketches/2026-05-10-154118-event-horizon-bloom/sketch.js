export default function sketch(p) {
  const stars = [];
  const dustBands = [];
  const lensArcs = [];
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
      starCount: Math.floor((p.width * p.height) / (runtime.fullscreen ? 5200 : 6400)),
      dustCount: portrait ? 5 : ultrawide ? 8 : 6,
      arcCount: square ? 5 : ultrawide ? 7 : 6,
      coreY: portrait ? 0.46 : 0.5,
      ringScale: portrait ? 0.33 : ultrawide ? 0.24 : 0.28,
      stretch: portrait ? 1.45 : ultrawide ? 1.9 : 1.65,
    };
  }

  function rebuild() {
    fetchRuntime();
    stars.length = 0;
    dustBands.length = 0;
    lensArcs.length = 0;
    const profile = cfg();

    for (let i = 0; i < profile.starCount; i += 1) {
      stars.push({
        x: p.random(p.width),
        y: p.random(p.height),
        size: p.random(0.8, profile.base * 0.009),
        depth: p.random(0.2, 1),
        twinkle: p.random(0.3, 1.8),
        phase: p.random(p.TWO_PI),
        hue: p.random() > 0.7 ? p.random(186, 224) : p.random(258, 314),
      });
    }

    for (let i = 0; i < profile.dustCount; i += 1) {
      dustBands.push({
        radius: profile.base * mix(0.16, 0.54, i / Math.max(1, profile.dustCount - 1)),
        thickness: profile.base * p.random(0.04, 0.11),
        tilt: p.random(-0.75, 0.75),
        speed: p.random(0.0012, 0.0045),
        hueA: p.random(198, 228),
        hueB: p.random(278, 326),
        alpha: p.random(12, 30),
      });
    }

    for (let i = 0; i < profile.arcCount; i += 1) {
      lensArcs.push({
        radius: profile.base * mix(0.22, 0.72, i / Math.max(1, profile.arcCount - 1)),
        start: p.random(-0.2, 0.3),
        end: p.random(p.PI + 0.2, p.TWO_PI - 0.2),
        thickness: profile.base * p.random(0.003, 0.012),
        hue: i % 2 === 0 ? p.random(196, 224) : p.random(286, 320),
        alpha: p.random(8, 22),
        speed: p.random(0.0008, 0.0028) * (i % 2 === 0 ? 1 : -1),
      });
    }
  }

  function drawBackground() {
    for (let y = 0; y < p.height; y += 2) {
      const t = y / Math.max(1, p.height - 1);
      const hue = t < 0.5 ? mix(228, 258, t / 0.5) : mix(258, 286, (t - 0.5) / 0.5);
      const sat = t < 0.55 ? mix(52, 74, t / 0.55) : mix(74, 48, (t - 0.55) / 0.45);
      const bri = t < 0.45 ? mix(4, 12, t / 0.45) : mix(12, 6, (t - 0.45) / 0.55);
      p.stroke(hue, sat, bri, 100);
      p.line(0, y, p.width, y);
    }

    p.noStroke();
    for (let i = 0; i < 6; i += 1) {
      const x = p.width * (0.12 + (i / 5) * 0.76);
      const y = p.height * (0.22 + 0.11 * Math.sin(i * 1.2));
      p.fill(292 + i * 4, 52, 34, 8);
      p.ellipse(x, y, cfg().base * 0.52, cfg().base * 0.22);
    }
  }

  function drawStars(cx, cy, ringRadius) {
    p.noStroke();
    for (const star of stars) {
      const dx = star.x - cx;
      const dy = star.y - cy;
      const distance = Math.hypot(dx, dy);
      const warpZone = distance < ringRadius * 2.8;
      const swirl = Math.atan2(dy, dx) + p.frameCount * 0.0008 * star.depth;
      const pull = warpZone ? mix(0.18, 0.86, 1 - distance / (ringRadius * 2.8)) : 0;
      const warpedR = warpZone ? distance * (1 - pull * 0.22) : distance;
      const x = warpZone ? cx + Math.cos(swirl) * warpedR : star.x;
      const y = warpZone ? cy + Math.sin(swirl) * warpedR : star.y;
      const twinkle = 0.5 + 0.5 * Math.sin(p.frameCount * 0.04 * star.twinkle + star.phase);
      p.fill(star.hue, 24 + star.depth * 40, 82 + twinkle * 18, 20 + star.depth * 52 * twinkle);
      p.circle(x, y, star.size * (0.7 + twinkle * 0.8));
      if (warpZone && distance > ringRadius * 0.95) {
        p.fill(star.hue, 32, 100, 5 + star.depth * 10);
        p.ellipse(x, y, star.size * 4.2, star.size * 1.2);
      }
    }
  }

  function drawDust(cx, cy, ringRadius) {
    p.noFill();
    p.strokeCap(p.ROUND);
    const profile = cfg();
    for (const band of dustBands) {
      p.push();
      p.translate(cx, cy);
      p.rotate(band.tilt + Math.sin(p.frameCount * band.speed * 18) * 0.08);
      for (let layer = 0; layer < 3; layer += 1) {
        const alpha = band.alpha - layer * 4;
        if (alpha <= 0) continue;
        p.stroke(layer === 1 ? band.hueB : band.hueA, 74 - layer * 12, 100, alpha);
        p.strokeWeight(band.thickness * (1.5 - layer * 0.24));
        p.arc(0, 0, band.radius * profile.stretch * 2.2, band.radius * 0.72, -0.12, p.PI + 0.24);
      }
      p.pop();
    }

    p.noStroke();
    for (let i = 0; i < 18; i += 1) {
      const angle = p.frameCount * 0.01 + i * 0.35;
      const orbit = ringRadius * mix(1.08, 1.82, (i % 6) / 5);
      const x = cx + Math.cos(angle) * orbit * profile.stretch * 0.58;
      const y = cy + Math.sin(angle) * orbit * 0.24;
      p.fill(i % 2 === 0 ? 200 : 300, 78, 100, 10 + (i % 4) * 4);
      p.circle(x, y, profile.base * 0.012);
    }
  }

  function drawLensing(cx, cy) {
    p.noFill();
    p.strokeCap(p.ROUND);
    for (const arc of lensArcs) {
      p.push();
      p.translate(cx, cy);
      p.rotate(p.frameCount * arc.speed);
      p.stroke(arc.hue, 56, 100, arc.alpha * 0.45);
      p.strokeWeight(arc.thickness * 2.2);
      p.arc(0, 0, arc.radius * 2.2, arc.radius * 2.2, arc.start, arc.end);
      p.stroke(arc.hue, 36, 100, arc.alpha);
      p.strokeWeight(arc.thickness);
      p.arc(0, 0, arc.radius * 2, arc.radius * 2, arc.start, arc.end);
      p.pop();
    }
  }

  function drawCore(cx, cy, ringRadius) {
    p.noStroke();
    for (let i = 9; i >= 1; i -= 1) {
      const pulse = 1 + 0.03 * Math.sin(p.frameCount * 0.02 + i * 0.5);
      p.fill(206 + i * 2, 52 - i * 2.5, 100, 2.8 + i * 1.2);
      p.ellipse(cx, cy, ringRadius * (3 + i * 0.26) * pulse, ringRadius * (1.38 + i * 0.1) * pulse);
      p.fill(298 - i, 46, 100, 2 + i * 0.8);
      p.ellipse(cx, cy - ringRadius * 0.05, ringRadius * (2.2 + i * 0.2) * pulse, ringRadius * (0.9 + i * 0.08) * pulse);
    }

    p.fill(0, 0, 0, 100);
    p.circle(cx, cy, ringRadius * 1.22);
    p.fill(220, 36, 12, 50);
    p.circle(cx, cy, ringRadius * 1.44);
  }

  function drawJets(cx, cy, ringRadius) {
    p.noStroke();
    for (let i = 0; i < 20; i += 1) {
      const t = i / 19;
      const pulse = 0.75 + 0.25 * Math.sin(p.frameCount * 0.03 + t * 6);
      p.fill(202 + t * 18, 78 - t * 24, 100, 6 + (1 - t) * 10 * pulse);
      p.ellipse(cx, cy - ringRadius * mix(0.5, 3.8, t), ringRadius * mix(0.18, 0.72, t), ringRadius * mix(0.36, 1.8, t));
      p.fill(292 + t * 12, 68 - t * 16, 100, 4 + (1 - t) * 8 * pulse);
      p.ellipse(cx, cy + ringRadius * mix(0.5, 3.4, t), ringRadius * mix(0.16, 0.64, t), ringRadius * mix(0.3, 1.5, t));
    }
  }

  function drawVignette() {
    const radius = Math.hypot(p.width, p.height) * 0.72;
    p.noFill();
    for (let i = 0; i < 18; i += 1) {
      const t = i / 17;
      p.stroke(0, 0, 0, 1.5 + t * 4.3);
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
    const cx = p.width * 0.5;
    const cy = p.height * profile.coreY;
    const ringRadius = profile.base * profile.ringScale;

    drawBackground();
    drawStars(cx, cy, ringRadius);
    drawLensing(cx, cy);
    drawJets(cx, cy, ringRadius);
    drawDust(cx, cy, ringRadius);
    drawCore(cx, cy, ringRadius);
    drawVignette();
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    rebuild();
  };
}
