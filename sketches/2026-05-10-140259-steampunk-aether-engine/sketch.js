export default function sketch(p) {
  const gears = [];
  const steam = [];
  const sparks = [];
  const cogs = [];
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
    const square = runtime.aspect === 'square';
    const ultrawide = runtime.aspect === 'ultrawide';
    return {
      base,
      portrait,
      square,
      ultrawide,
      gearCount: portrait ? 7 : ultrawide ? 12 : 9,
      sparkCount: portrait ? 48 : ultrawide ? 80 : 62,
      steamCount: Math.floor((p.width * p.height) / (runtime.fullscreen ? 22000 : 26000)),
      horizon: portrait ? 0.7 : 0.76,
      coreY: portrait ? 0.42 : square ? 0.46 : 0.48,
      archScale: portrait ? 0.82 : ultrawide ? 1.12 : 1,
    };
  }

  function rebuild() {
    fetchRuntime();
    gears.length = 0;
    steam.length = 0;
    sparks.length = 0;
    cogs.length = 0;

    const profile = cfg();
    const cx = p.width * 0.5;
    const cy = p.height * profile.coreY;

    for (let i = 0; i < profile.gearCount; i += 1) {
      const ring = i % 3;
      const side = i % 2 === 0 ? -1 : 1;
      const orbit = mix(profile.base * 0.16, profile.base * 0.44, i / Math.max(1, profile.gearCount - 1));
      gears.push({
        x: cx + side * orbit * mix(0.35, 1, p.random()),
        y: cy + mix(-profile.base * 0.16, profile.base * 0.28, p.random()) + ring * profile.base * 0.04,
        radius: profile.base * mix(0.07, 0.18, p.random()),
        teeth: Math.floor(mix(10, 24, p.random())),
        speed: mix(0.002, 0.009, p.random()) * (side < 0 ? 1 : -1),
        hue: p.random() > 0.4 ? p.random(28, 42) : p.random(12, 22),
        sat: p.random(52, 86),
        bri: p.random(48, 86),
        alpha: p.random(38, 74),
      });
    }

    for (let i = 0; i < profile.gearCount + 4; i += 1) {
      cogs.push({
        radius: profile.base * mix(0.12, 0.42, i / Math.max(1, profile.gearCount + 3)),
        thickness: profile.base * mix(0.006, 0.022, p.random()),
        start: p.random(-0.3, 0.2),
        end: p.random(p.PI + 0.2, p.TWO_PI - 0.1),
        hue: i % 2 === 0 ? p.random(24, 38) : p.random(188, 204),
        alpha: p.random(10, 28),
        speed: p.random(0.001, 0.004) * (i % 2 === 0 ? 1 : -1),
      });
    }

    for (let i = 0; i < profile.steamCount; i += 1) {
      steam.push({
        x: p.random(p.width),
        y: p.random(p.height * profile.horizon, p.height + profile.base * 0.15),
        r: p.random(profile.base * 0.02, profile.base * 0.09),
        rise: p.random(0.25, 0.95),
        drift: p.random(-0.6, 0.6),
        phase: p.random(p.TWO_PI),
        hue: p.random() > 0.22 ? p.random(24, 38) : p.random(188, 202),
        sat: p.random(18, 52),
        bri: p.random(72, 100),
        alpha: p.random(4, 14),
      });
    }

    for (let i = 0; i < profile.sparkCount; i += 1) {
      sparks.push({
        x: cx + p.random(-profile.base * 0.22, profile.base * 0.22),
        y: cy + p.random(profile.base * 0.02, profile.base * 0.34),
        vx: p.random(-0.7, 0.7),
        vy: p.random(-1.8, -0.4),
        r: p.random(1.5, 5.2),
        hue: p.random() > 0.18 ? p.random(28, 42) : p.random(192, 204),
        alpha: p.random(18, 44),
      });
    }
  }

  function drawBackground() {
    for (let y = 0; y < p.height; y += 2) {
      const t = y / Math.max(1, p.height - 1);
      const hue = t < 0.4 ? mix(214, 246, t / 0.4) : mix(246, 28, (t - 0.4) / 0.6);
      const sat = t < 0.5 ? mix(36, 54, t / 0.5) : mix(54, 70, (t - 0.5) / 0.5);
      const bri = t < 0.6 ? mix(8, 18, t / 0.6) : mix(18, 12, (t - 0.6) / 0.4);
      p.stroke(hue, sat, bri, 100);
      p.line(0, y, p.width, y);
    }
  }

  function drawArchitecture() {
    const profile = cfg();
    const cx = p.width * 0.5;
    const horizon = p.height * profile.horizon;
    const archW = profile.base * 0.95 * profile.archScale;
    const archH = profile.base * 0.92;

    p.noStroke();
    p.fill(28, 46, 14, 95);
    p.rect(0, horizon, p.width, p.height - horizon);

    p.fill(32, 52, 22, 90);
    p.beginShape();
    p.vertex(cx - archW * 0.62, p.height);
    p.vertex(cx - archW * 0.45, horizon + archH * 0.08);
    p.bezierVertex(cx - archW * 0.35, horizon - archH * 0.36, cx - archW * 0.16, horizon - archH * 0.56, cx, horizon - archH * 0.58);
    p.bezierVertex(cx + archW * 0.16, horizon - archH * 0.56, cx + archW * 0.35, horizon - archH * 0.36, cx + archW * 0.45, horizon + archH * 0.08);
    p.vertex(cx + archW * 0.62, p.height);
    p.endShape(p.CLOSE);

    p.fill(24, 58, 32, 100);
    p.rect(cx - archW * 0.12, horizon - archH * 0.18, archW * 0.24, archH * 0.74, archW * 0.03);

    for (let i = -3; i <= 3; i += 1) {
      const x = cx + i * archW * 0.16;
      const h = archH * mix(0.18, 0.52, 1 - Math.abs(i) / 3);
      p.fill(28, 44, 22 + (3 - Math.abs(i)) * 4, 92);
      p.rect(x - archW * 0.03, horizon - h * 0.32, archW * 0.06, h, archW * 0.012);
    }
  }

  function drawCoreGlow() {
    const profile = cfg();
    const cx = p.width * 0.5;
    const cy = p.height * profile.coreY;
    const size = profile.base * 0.19;

    p.noStroke();
    for (let i = 10; i >= 1; i -= 1) {
      const pulse = 1 + 0.03 * Math.sin(p.frameCount * 0.018 + i * 0.4);
      p.fill(34, 70 - i * 2.2, 100, 4 + i * 1.5);
      p.ellipse(cx, cy, size * (1.2 + i * 0.22) * pulse, size * (1 + i * 0.22) * pulse);
      p.fill(194, 42, 100, i * 0.7);
      p.ellipse(cx, cy - size * 0.04, size * (0.74 + i * 0.15) * pulse, size * (0.64 + i * 0.15) * pulse);
    }
    p.fill(40, 24, 100, 88);
    p.circle(cx, cy, size * 0.82);
  }

  function drawCogs() {
    const profile = cfg();
    const cx = p.width * 0.5;
    const cy = p.height * profile.coreY;
    p.noFill();
    p.strokeCap(p.ROUND);

    for (const cog of cogs) {
      p.push();
      p.translate(cx, cy);
      p.rotate(p.frameCount * cog.speed);
      p.stroke(cog.hue, 64, 100, cog.alpha * 0.45);
      p.strokeWeight(cog.thickness * 2.2);
      p.arc(0, 0, cog.radius * 2.2, cog.radius * 2.2, cog.start, cog.end);
      p.stroke(cog.hue, 44, 82, cog.alpha);
      p.strokeWeight(cog.thickness);
      p.arc(0, 0, cog.radius * 2, cog.radius * 2, cog.start, cog.end);
      p.pop();
    }
  }

  function drawGear(gear) {
    p.push();
    p.translate(gear.x, gear.y);
    p.rotate(p.frameCount * gear.speed);
    p.noStroke();
    p.fill(gear.hue, gear.sat, gear.bri, gear.alpha * 0.42);
    p.circle(0, 0, gear.radius * 2.45);

    p.fill(gear.hue, gear.sat, gear.bri, gear.alpha);
    p.beginShape();
    for (let i = 0; i < gear.teeth * 2; i += 1) {
      const angle = (p.TWO_PI * i) / (gear.teeth * 2);
      const outer = i % 2 === 0 ? gear.radius * 1.02 : gear.radius * 1.24;
      p.vertex(Math.cos(angle) * outer, Math.sin(angle) * outer);
    }
    p.endShape(p.CLOSE);

    p.fill(24, 26, 22, 86);
    p.circle(0, 0, gear.radius * 1.12);
    p.fill(198, 28, 100, 22);
    p.circle(0, 0, gear.radius * 0.34);
    p.pop();
  }

  function drawGearNetwork() {
    for (const gear of gears) {
      drawGear(gear);
    }

    p.stroke(30, 32, 52, 18);
    p.strokeWeight(3);
    for (let i = 1; i < gears.length; i += 1) {
      const a = gears[i - 1];
      const b = gears[i];
      p.line(a.x, a.y, b.x, b.y);
    }
  }

  function drawSteam() {
    p.noStroke();
    for (const plume of steam) {
      const sway = Math.sin(p.frameCount * 0.01 + plume.phase) * 18;
      const shimmer = 0.55 + 0.45 * Math.sin(p.frameCount * 0.02 + plume.phase * 2);
      p.fill(plume.hue, plume.sat, plume.bri, plume.alpha * shimmer);
      p.ellipse(plume.x + sway, plume.y, plume.r * (1.3 + shimmer), plume.r * (0.9 + shimmer * 0.6));
      plume.y -= plume.rise;
      plume.x += plume.drift * 0.15;
      if (plume.y < -plume.r) {
        plume.y = p.height + p.random(0, cfg().base * 0.12);
        plume.x = p.random(p.width);
      }
    }
  }

  function drawSparks() {
    p.noStroke();
    const profile = cfg();
    const cx = p.width * 0.5;
    const cy = p.height * profile.coreY;

    for (const spark of sparks) {
      const flicker = 0.5 + 0.5 * Math.sin(p.frameCount * 0.08 + spark.x * 0.01);
      p.fill(spark.hue, 80, 100, spark.alpha * flicker);
      p.circle(spark.x, spark.y, spark.r * (0.8 + flicker));
      p.fill(spark.hue, 44, 100, spark.alpha * 0.22 * flicker);
      p.circle(spark.x, spark.y, spark.r * 2.6);

      spark.x += spark.vx + Math.sin(p.frameCount * 0.02 + spark.y * 0.01) * 0.1;
      spark.y += spark.vy;
      if (spark.y < cy - profile.base * 0.2 || spark.x < cx - profile.base * 0.45 || spark.x > cx + profile.base * 0.45) {
        spark.x = cx + p.random(-profile.base * 0.22, profile.base * 0.22);
        spark.y = cy + p.random(profile.base * 0.02, profile.base * 0.34);
      }
    }
  }

  function drawFloorReflections() {
    const horizon = p.height * cfg().horizon;
    p.noStroke();
    for (let i = 0; i < 18; i += 1) {
      const t = i / 17;
      const y = mix(horizon + 10, p.height, t);
      const width = mix(p.width * 0.08, p.width * 0.42, t);
      const x = p.width * 0.5 + Math.sin(p.frameCount * 0.03 + i) * p.width * 0.01;
      p.fill(i % 3 === 0 ? 194 : 34, 66, 100, 4 + (1 - t) * 12);
      p.rect(x - width * 0.5, y, width, cfg().base * 0.009, cfg().base * 0.003);
    }
  }

  function drawVignette() {
    const radius = Math.hypot(p.width, p.height) * 0.7;
    p.noFill();
    for (let i = 0; i < 18; i += 1) {
      const t = i / 17;
      p.stroke(0, 0, 0, 1.5 + t * 4);
      p.strokeWeight(radius * 0.018);
      p.ellipse(p.width * 0.5, p.height * 0.5, radius * (1 + t * 0.48), radius * (0.72 + t * 0.34));
    }
  }

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    rebuild();
  };

  p.draw = () => {
    drawBackground();
    drawArchitecture();
    drawCoreGlow();
    drawCogs();
    drawGearNetwork();
    drawFloorReflections();
    drawSteam();
    drawSparks();
    drawVignette();
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    rebuild();
  };
}
