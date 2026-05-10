export default function sketch(p) {
  const embers = [];
  const motes = [];
  const ribbons = [];
  let runtime = { aspect: 'landscape', fullscreen: false };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function lerpColorHSB(a, b, t) {
    return {
      h: p.lerp(a.h, b.h, t),
      s: p.lerp(a.s, b.s, t),
      b: p.lerp(a.b, b.b, t),
      a: p.lerp(a.a, b.a, t),
    };
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

  function compositionProfile() {
    const base = Math.min(p.width, p.height);
    const portrait = runtime.aspect === 'portrait';
    const square = runtime.aspect === 'square';
    const ultrawide = runtime.aspect === 'ultrawide';

    return {
      base,
      emberCount: portrait ? 26 : ultrawide ? 34 : 30,
      moteCount: Math.floor((p.width * p.height) / (ultrawide ? 9500 : 11000)) + (portrait ? 18 : 10),
      ribbonCount: square ? 4 : portrait ? 5 : 6,
      glowScale: portrait ? 0.31 : ultrawide ? 0.24 : 0.27,
      lift: portrait ? 0.56 : 0.52,
      spread: portrait ? 0.24 : ultrawide ? 0.34 : 0.28,
    };
  }

  function rebuild() {
    fetchRuntime();
    embers.length = 0;
    motes.length = 0;
    ribbons.length = 0;

    const profile = compositionProfile();
    const { base } = profile;

    for (let i = 0; i < profile.ribbonCount; i += 1) {
      ribbons.push({
        radius: base * (0.14 + i * 0.05),
        thickness: base * (0.012 + i * 0.0014),
        tilt: p.random(-0.75, 0.75),
        arcStart: p.random(-0.22, 0.12),
        arcEnd: p.random(p.PI + 0.28, p.TWO_PI - 0.12),
        speed: p.random(0.0012, 0.0034),
        wobble: p.random(base * 0.014, base * 0.03),
        glowHue: p.random(6, 20),
        accentHue: p.random(330, 356),
      });
    }

    for (let i = 0; i < profile.emberCount; i += 1) {
      embers.push({
        orbit: p.random(0.15, 1.0),
        angle: p.random(p.TWO_PI),
        distance: base * p.random(0.05, 0.34),
        size: base * p.random(0.015, 0.055),
        pulse: p.random(0.8, 1.8),
        drift: p.random(0.001, 0.005),
        hue: p.random(6, 26),
        sat: p.random(54, 88),
        bri: p.random(88, 100),
        alpha: p.random(22, 48),
      });
    }

    for (let i = 0; i < profile.moteCount; i += 1) {
      motes.push({
        x: p.random(p.width),
        y: p.random(p.height),
        size: p.random(1.5, 7),
        rise: p.random(0.18, 0.85),
        sway: p.random(0.2, 1.5),
        phase: p.random(p.TWO_PI),
        hue: p.random(10, 42),
        sat: p.random(20, 58),
        bri: p.random(75, 100),
        alpha: p.random(12, 42),
      });
    }
  }

  function drawBackground() {
    const top = { h: 338, s: 42, b: 10, a: 100 };
    const mid = { h: 6, s: 54, b: 16, a: 100 };
    const low = { h: 20, s: 72, b: 18, a: 100 };
    const floor = { h: 28, s: 58, b: 10, a: 100 };

    for (let y = 0; y < p.height; y += 2) {
      const t = y / Math.max(1, p.height - 1);
      const tone = t < 0.42
        ? lerpColorHSB(top, mid, t / 0.42)
        : t < 0.82
          ? lerpColorHSB(mid, low, (t - 0.42) / 0.4)
          : lerpColorHSB(low, floor, (t - 0.82) / 0.18);
      p.stroke(tone.h, tone.s, tone.b, tone.a);
      p.line(0, y, p.width, y);
    }

    p.noStroke();
    const profile = compositionProfile();
    for (let i = 0; i < 9; i += 1) {
      const x = p.width * (0.12 + (i / 8) * 0.76);
      const y = p.height * (0.22 + 0.08 * Math.sin(i * 0.9));
      p.fill(350 + i * 2, 38, 24, 8);
      p.ellipse(x, y, profile.base * 0.42, profile.base * 0.2);
    }

    for (let i = 0; i < 8; i += 1) {
      const x = p.width * (0.1 + (i / 7) * 0.8);
      const y = p.height * (0.72 + 0.03 * Math.cos(i * 1.3));
      p.fill(24, 74, 22, 7);
      p.ellipse(x, y, profile.base * 0.48, profile.base * 0.15);
    }
  }

  function drawCenterGlow() {
    const profile = compositionProfile();
    const cx = p.width * 0.5;
    const cy = p.height * profile.lift;
    const glow = profile.base * profile.glowScale;

    p.noStroke();
    for (let i = 10; i >= 1; i -= 1) {
      const pulse = 1 + 0.02 * Math.sin(p.frameCount * 0.013 + i * 0.4);
      p.fill(14 + i * 0.8, 64 - i * 1.8, 100, 5 + i * 1.7);
      p.ellipse(cx, cy, glow * (1.8 + i * 0.28) * pulse, glow * (1.15 + i * 0.18) * pulse);
    }

    p.fill(351, 48, 100, 18);
    p.ellipse(cx, cy - glow * 0.18, glow * 1.35, glow * 0.72);
  }

  function drawSilhouetteGlow() {
    const profile = compositionProfile();
    const cx = p.width * 0.5;
    const cy = p.height * profile.lift;
    const width = profile.base * (runtime.aspect === 'portrait' ? 0.56 : 0.8);
    const height = profile.base * (runtime.aspect === 'portrait' ? 0.9 : 0.62);

    p.noStroke();
    for (let i = 0; i < 7; i += 1) {
      const alpha = 11 - i;
      p.fill(346 + i * 2, 42, 24 + i * 3, alpha);
      p.ellipse(cx - width * 0.12, cy + height * 0.06, width * (0.72 + i * 0.08), height * (0.78 + i * 0.06));
      p.ellipse(cx + width * 0.12, cy + height * 0.03, width * (0.72 + i * 0.08), height * (0.78 + i * 0.06));
    }
  }

  function drawRibbons() {
    const profile = compositionProfile();
    const cx = p.width * 0.5;
    const cy = p.height * profile.lift;

    p.noFill();
    p.strokeCap(p.ROUND);
    for (const ribbon of ribbons) {
      p.push();
      p.translate(cx, cy);
      p.rotate(ribbon.tilt + Math.sin(p.frameCount * ribbon.speed * 24) * 0.12);

      p.stroke(ribbon.glowHue, 62, 100, 11);
      p.strokeWeight(ribbon.thickness * 1.7);
      p.arc(0, 0, ribbon.radius * 2.2, ribbon.radius * 1.32, ribbon.arcStart, ribbon.arcEnd);

      p.stroke(ribbon.accentHue, 46, 100, 38);
      p.strokeWeight(ribbon.thickness);
      p.beginShape();
      for (let a = ribbon.arcStart; a <= ribbon.arcEnd + 0.001; a += 0.08) {
        const swell = Math.sin(a * 3 + p.frameCount * ribbon.speed * 36) * ribbon.wobble;
        const bend = Math.cos(a * 2 - p.frameCount * ribbon.speed * 18) * ribbon.wobble * 0.55;
        const x = Math.cos(a) * (ribbon.radius + swell);
        const y = Math.sin(a) * (ribbon.radius * 0.62 + bend);
        p.vertex(x, y);
      }
      p.endShape();
      p.pop();
    }
  }

  function drawEmbers() {
    const profile = compositionProfile();
    const cx = p.width * 0.5;
    const cy = p.height * profile.lift;

    p.noStroke();
    for (const ember of embers) {
      const drift = p.frameCount * ember.drift;
      const x = cx + Math.cos(ember.angle + drift) * ember.distance * (1 + 0.3 * ember.orbit);
      const y = cy + Math.sin(ember.angle * 1.3 - drift) * ember.distance * 0.68;
      const pulse = 0.72 + 0.28 * Math.sin(p.frameCount * 0.02 * ember.pulse + ember.angle * 4);
      p.fill(ember.hue, ember.sat, ember.bri, ember.alpha * pulse);
      p.circle(x, y, ember.size * (0.7 + pulse));
      p.fill(ember.hue + 6, Math.max(0, ember.sat - 24), 100, ember.alpha * 0.24 * pulse);
      p.circle(x, y, ember.size * (1.7 + pulse));
    }
  }

  function drawMotes() {
    p.noStroke();
    for (const mote of motes) {
      const sway = Math.sin(p.frameCount * 0.012 * mote.sway + mote.phase) * 18;
      const shimmer = 0.55 + 0.45 * Math.sin(p.frameCount * 0.028 + mote.phase * 3);
      p.fill(mote.hue, mote.sat, mote.bri, mote.alpha * shimmer);
      p.circle(mote.x + sway, mote.y, mote.size * (0.8 + shimmer * 0.6));

      mote.y -= mote.rise;
      mote.x += Math.sin(p.frameCount * 0.006 + mote.phase) * 0.12;

      if (mote.y < -12) {
        mote.y = p.height + p.random(10, 140);
        mote.x = p.random(p.width);
      }
      if (mote.x < -30) mote.x += p.width + 60;
      if (mote.x > p.width + 30) mote.x -= p.width + 60;
    }
  }

  function drawHeatVeil() {
    p.noStroke();
    for (let i = 0; i < 5; i += 1) {
      const y = p.height * (0.3 + i * 0.12);
      const wave = Math.sin(p.frameCount * 0.009 + i * 1.1) * 24;
      p.fill(18 + i * 4, 48, 100, 4);
      p.beginShape();
      p.vertex(0, y - 40);
      for (let x = 0; x <= p.width + 20; x += 40) {
        const arc = Math.sin(x * 0.008 + p.frameCount * 0.014 + i) * 12;
        p.vertex(x, y + wave + arc);
      }
      p.vertex(p.width, y + 60);
      p.vertex(0, y + 60);
      p.endShape(p.CLOSE);
    }
  }

  function drawVignette() {
    const maxRadius = Math.hypot(p.width, p.height) * 0.64;
    p.noFill();
    for (let i = 0; i < 18; i += 1) {
      const t = i / 17;
      p.stroke(0, 0, 0, 1.5 + t * 3.8);
      p.strokeWeight(22);
      p.ellipse(p.width * 0.5, p.height * 0.5, maxRadius * (1.06 + t * 0.24), maxRadius * (0.7 + t * 0.16));
    }
  }

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.pixelDensity(1);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.noiseSeed(44117);
    p.randomSeed(44117);
    rebuild();
  };

  p.draw = () => {
    drawBackground();
    drawCenterGlow();
    drawSilhouetteGlow();
    drawRibbons();
    drawEmbers();
    drawMotes();
    drawHeatVeil();
    drawVignette();

    p.noStroke();
    p.fill(352, 34, 100, 3);
    p.rect(0, 0, p.width, p.height);
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    rebuild();
  };
}
