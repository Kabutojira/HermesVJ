export default function sketch(p) {
  const motes = [];
  const ribbons = [];
  const captions = [];
  let runtime = { aspect: 'landscape', fullscreen: false };

  const words = ['SUBTITLE', 'DimaTorzok', 'continue', 'echo', 'shadow', 'frame', 'credit', 'horizon'];

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
    return {
      base,
      portrait,
      ultrawide,
      moteCount: Math.floor((p.width * p.height) / (runtime.fullscreen ? 9800 : 12000)),
      ribbonCount: portrait ? 5 : ultrawide ? 8 : 6,
      captionCount: portrait ? 9 : ultrawide ? 14 : 11,
      horizon: portrait ? 0.66 : 0.7,
      centerY: portrait ? 0.5 : 0.52,
    };
  }

  function rebuild() {
    fetchRuntime();
    motes.length = 0;
    ribbons.length = 0;
    captions.length = 0;
    const profile = cfg();

    for (let i = 0; i < profile.moteCount; i += 1) {
      motes.push({
        x: p.random(p.width),
        y: p.random(p.height),
        r: p.random(1, profile.base * 0.012),
        phase: p.random(p.TWO_PI),
        speed: p.random(0.3, 1.4),
        hue: p.random() > 0.45 ? p.random(208, 232) : p.random(254, 284),
        alpha: p.random(5, 24),
      });
    }

    for (let i = 0; i < profile.ribbonCount; i += 1) {
      ribbons.push({
        y: p.height * mix(0.22, 0.84, i / Math.max(1, profile.ribbonCount - 1)),
        amp: profile.base * p.random(0.03, 0.08),
        speed: p.random(0.008, 0.02),
        hue: i % 2 === 0 ? p.random(212, 232) : p.random(258, 284),
        alpha: p.random(6, 16),
      });
    }

    for (let i = 0; i < profile.captionCount; i += 1) {
      captions.push({
        word: words[i % words.length],
        x: p.random(p.width * 0.1, p.width * 0.9),
        y: p.random(p.height * 0.18, p.height * 0.82),
        size: profile.base * p.random(0.024, 0.06),
        drift: p.random(0.0015, 0.005),
        sway: p.random(0.3, 1.2),
        phase: p.random(p.TWO_PI),
        alpha: p.random(8, 20),
      });
    }
  }

  function drawBackground() {
    for (let y = 0; y < p.height; y += 2) {
      const t = y / Math.max(1, p.height - 1);
      const hue = t < 0.48 ? mix(226, 244, t / 0.48) : mix(244, 262, (t - 0.48) / 0.52);
      const sat = t < 0.55 ? mix(48, 62, t / 0.55) : mix(62, 38, (t - 0.55) / 0.45);
      const bri = t < 0.6 ? mix(4, 14, t / 0.6) : mix(14, 8, (t - 0.6) / 0.4);
      p.stroke(hue, sat, bri, 100);
      p.line(0, y, p.width, y);
    }

    p.noStroke();
    const profile = cfg();
    for (let i = 0; i < 5; i += 1) {
      const beamX = p.width * (0.18 + i * 0.16);
      p.fill(210 + i * 6, 26, 100, 3 + i);
      p.quad(
        beamX - profile.base * 0.08,
        0,
        beamX + profile.base * 0.08,
        0,
        beamX + profile.base * 0.2,
        p.height,
        beamX - profile.base * 0.2,
        p.height,
      );
    }
  }

  function drawMotes() {
    p.noStroke();
    for (const mote of motes) {
      const twinkle = 0.45 + 0.55 * Math.sin(p.frameCount * 0.02 * mote.speed + mote.phase);
      p.fill(mote.hue, 18 + twinkle * 20, 90 + twinkle * 10, mote.alpha * twinkle);
      p.circle(mote.x, mote.y, mote.r * (0.8 + twinkle));
    }
  }

  function drawRibbons() {
    p.noFill();
    p.strokeCap(p.ROUND);
    for (const ribbon of ribbons) {
      p.stroke(ribbon.hue, 42, 100, ribbon.alpha);
      p.strokeWeight(cfg().base * 0.012);
      p.beginShape();
      for (let x = -40; x <= p.width + 40; x += 26) {
        const wave = Math.sin(x * 0.008 + p.frameCount * ribbon.speed + ribbon.y * 0.02) * ribbon.amp;
        const drift = Math.cos(x * 0.004 - p.frameCount * ribbon.speed * 0.7) * ribbon.amp * 0.3;
        p.vertex(x, ribbon.y + wave + drift);
      }
      p.endShape();
    }
  }

  function drawCaptions() {
    p.textAlign(p.CENTER, p.CENTER);
    p.textStyle(p.BOLD);
    for (const caption of captions) {
      const shimmer = 0.45 + 0.55 * Math.sin(p.frameCount * caption.drift + caption.phase);
      const y = caption.y + Math.sin(p.frameCount * 0.014 * caption.sway + caption.phase) * cfg().base * 0.02;
      const x = caption.x + Math.cos(p.frameCount * 0.009 + caption.phase) * cfg().base * 0.014;
      p.textSize(caption.size);
      p.noStroke();
      p.fill(220, 20, 100, caption.alpha * 0.35 * shimmer);
      p.text(caption.word, x + 3, y + 3);
      p.fill(0, 0, 100, caption.alpha * 0.9 * shimmer);
      p.text(caption.word, x, y);
      p.fill(196, 42, 100, caption.alpha * 0.15 * shimmer);
      p.text(caption.word, x - 2, y - 2);
    }
  }

  function drawTitlePulse() {
    const profile = cfg();
    const cx = p.width * 0.5;
    const cy = p.height * profile.centerY;
    const coreW = profile.base * (profile.portrait ? 0.9 : 1.25);
    const coreH = profile.base * 0.24;
    p.noStroke();
    for (let i = 8; i >= 1; i -= 1) {
      const pulse = 1 + 0.04 * Math.sin(p.frameCount * 0.02 + i * 0.5);
      p.fill(258 + i * 2, 42 - i * 2, 100, 2 + i * 0.9);
      p.ellipse(cx, cy, coreW * (1 + i * 0.09) * pulse, coreH * (1 + i * 0.16) * pulse);
    }
    p.fill(0, 0, 0, 22);
    p.rectMode(p.CENTER);
    p.rect(cx, cy, coreW * 0.88, coreH * 0.72, coreH * 0.2);
    p.fill(0, 0, 100, 86);
    p.textAlign(p.CENTER, p.CENTER);
    p.textStyle(p.BOLD);
    p.textSize(profile.base * 0.052);
    p.text('TO BE CONTINUED', cx, cy - profile.base * 0.01);
    p.fill(200, 26, 100, 58);
    p.textSize(profile.base * 0.018);
    p.text('phantom credits drift', cx, cy + profile.base * 0.05);
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
    p.textFont('Georgia');
    rebuild();
  };

  p.draw = () => {
    drawBackground();
    drawMotes();
    drawRibbons();
    drawCaptions();
    drawTitlePulse();
    drawVignette();
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    rebuild();
  };
}
