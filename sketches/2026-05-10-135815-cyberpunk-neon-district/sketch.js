export default function sketch(p) {
  const skyline = [];
  const windows = [];
  const rain = [];
  const drones = [];
  const fogBands = [];
  let runtime = { aspect: 'landscape', fullscreen: false };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

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

  function profile() {
    const base = Math.min(p.width, p.height);
    const portrait = runtime.aspect === 'portrait';
    const square = runtime.aspect === 'square';
    const ultrawide = runtime.aspect === 'ultrawide';

    return {
      base,
      portrait,
      square,
      ultrawide,
      towerCount: portrait ? 8 : ultrawide ? 16 : 12,
      rainCount: Math.floor((p.width * p.height) / (runtime.fullscreen ? 11000 : 13500)),
      droneCount: portrait ? 4 : ultrawide ? 8 : 6,
      fogCount: portrait ? 5 : 4,
      horizon: portrait ? 0.64 : square ? 0.68 : 0.72,
      avenueWidth: portrait ? 0.22 : ultrawide ? 0.16 : 0.19,
      moonSize: portrait ? 0.18 : ultrawide ? 0.13 : 0.15,
    };
  }

  function rebuild() {
    fetchRuntime();
    skyline.length = 0;
    windows.length = 0;
    rain.length = 0;
    drones.length = 0;
    fogBands.length = 0;

    const cfg = profile();
    const streetCenter = p.width * 0.5;
    const avenueHalf = p.width * cfg.avenueWidth;

    for (let i = 0; i < cfg.towerCount; i += 1) {
      const side = i % 2 === 0 ? -1 : 1;
      const lane = Math.floor(i / 2);
      const edgeBias = lane / Math.max(1, cfg.towerCount / 2 - 1);
      const width = p.width * p.random(0.055, side < 0 ? 0.11 : 0.1);
      const depth = p.random(0.2, 1);
      const xBase = side < 0
        ? mix(0, streetCenter - avenueHalf - width * 0.3, edgeBias)
        : mix(streetCenter + avenueHalf - width * 0.7, p.width - width, edgeBias);
      const x = xBase + p.random(-p.width * 0.025, p.width * 0.025);
      const h = cfg.base * mix(0.32, 0.96, depth);
      const y = p.height * cfg.horizon - h;
      const glowHue = side < 0 ? p.random(185, 205) : p.random(300, 330);
      skyline.push({
        x,
        y,
        w: width,
        h,
        depth,
        glowHue,
        accentHue: side < 0 ? p.random(285, 320) : p.random(170, 210),
        crown: p.random(0.08, 0.2),
        setback: p.random(0.04, 0.14),
      });
    }

    skyline.sort((a, b) => a.depth - b.depth);

    for (const tower of skyline) {
      const cols = Math.max(3, Math.floor(tower.w / 18));
      const rows = Math.max(8, Math.floor(tower.h / 22));
      for (let col = 0; col < cols; col += 1) {
        for (let row = 0; row < rows; row += 1) {
          if (p.random() > mix(0.92, 0.48, tower.depth)) continue;
          windows.push({
            x: tower.x + (col + 0.18) * (tower.w / cols),
            y: tower.y + (row + 0.24) * (tower.h / rows),
            w: tower.w / cols - 3,
            h: tower.h / rows - 4,
            hue: p.random() > 0.5 ? tower.glowHue : tower.accentHue,
            sat: p.random(45, 90),
            bri: p.random(70, 100),
            alpha: p.random(18, 50) * tower.depth,
          });
        }
      }
    }

    for (let i = 0; i < cfg.rainCount; i += 1) {
      rain.push({
        x: p.random(p.width),
        y: p.random(-p.height, p.height),
        z: p.random(0.3, 1),
        len: p.random(cfg.base * 0.018, cfg.base * 0.07),
        speed: p.random(8, 22),
        drift: p.random(-1.4, -0.35),
      });
    }

    for (let i = 0; i < cfg.droneCount; i += 1) {
      drones.push({
        lane: i / Math.max(1, cfg.droneCount - 1),
        y: p.height * mix(0.24, 0.62, p.random()),
        speed: p.random(0.0025, 0.009),
        phase: p.random(p.TWO_PI),
        hue: p.random() > 0.5 ? p.random(185, 205) : p.random(305, 328),
        size: cfg.base * p.random(0.018, 0.038),
      });
    }

    for (let i = 0; i < cfg.fogCount; i += 1) {
      fogBands.push({
        y: p.height * mix(0.16, 0.88, i / Math.max(1, cfg.fogCount - 1)),
        height: cfg.base * p.random(0.08, 0.18),
        hue: p.random() > 0.5 ? p.random(186, 202) : p.random(304, 324),
        drift: p.random(0.002, 0.008),
        alpha: p.random(4, 10),
      });
    }
  }

  function drawGradientBackground() {
    for (let y = 0; y < p.height; y += 2) {
      const t = y / Math.max(1, p.height - 1);
      const hue = t < 0.45 ? mix(236, 276, t / 0.45) : mix(276, 320, (t - 0.45) / 0.55);
      const sat = t < 0.55 ? mix(56, 74, t / 0.55) : mix(74, 42, (t - 0.55) / 0.45);
      const bri = t < 0.5 ? mix(8, 18, t / 0.5) : mix(18, 10, (t - 0.5) / 0.5);
      p.stroke(hue, sat, bri, 100);
      p.line(0, y, p.width, y);
    }
  }

  function drawMoonGlow() {
    const cfg = profile();
    const moonX = cfg.portrait ? p.width * 0.58 : p.width * 0.68;
    const moonY = cfg.portrait ? p.height * 0.18 : p.height * 0.22;
    const size = cfg.base * cfg.moonSize;

    p.noStroke();
    for (let i = 9; i >= 1; i -= 1) {
      p.fill(192 + i, 68 - i * 2.4, 100, 2.5 + i * 1.1);
      p.ellipse(moonX, moonY, size * (1.8 + i * 0.26), size * (1.8 + i * 0.26));
      p.fill(316 - i, 56, 100, 1.5 + i * 0.9);
      p.ellipse(moonX - size * 0.08, moonY + size * 0.05, size * (1.4 + i * 0.22), size * (1.4 + i * 0.22));
    }
    p.fill(198, 28, 100, 80);
    p.circle(moonX, moonY, size * 1.12);
  }

  function drawSkyline() {
    const cfg = profile();
    p.noStroke();

    for (const tower of skyline) {
      const haze = mix(12, 42, tower.depth);
      p.fill(235 + tower.depth * 24, 40 + tower.depth * 18, 10 + tower.depth * 10, 100);
      p.rect(tower.x, tower.y, tower.w, tower.h, tower.w * 0.03);

      p.fill(tower.glowHue, 70, 100, haze * 0.24);
      p.rect(tower.x - tower.w * 0.03, tower.y - tower.h * tower.crown, tower.w * 1.06, tower.h * (1 + tower.crown), tower.w * 0.05);

      p.fill(0, 0, 100, 5 + tower.depth * 8);
      p.rect(tower.x + tower.w * tower.setback, tower.y + tower.h * 0.04, tower.w * (0.16 + tower.setback), tower.h * 0.9);
    }

    for (const light of windows) {
      p.fill(light.hue, light.sat, light.bri, light.alpha);
      p.rect(light.x, light.y, light.w, light.h, 1.5);
    }

    const avenueTop = p.height * cfg.horizon;
    const avenueBase = p.height;
    const avenueHalf = p.width * cfg.avenueWidth;

    p.fill(236, 28, 12, 100);
    p.quad(
      p.width * 0.5 - avenueHalf * 0.4,
      avenueTop,
      p.width * 0.5 + avenueHalf * 0.4,
      avenueTop,
      p.width * 0.5 + avenueHalf * 1.65,
      avenueBase,
      p.width * 0.5 - avenueHalf * 1.65,
      avenueBase,
    );

    for (let i = 0; i < 11; i += 1) {
      const t = i / 10;
      const y = mix(avenueTop, avenueBase, t * t);
      const spread = mix(avenueHalf * 0.42, avenueHalf * 1.6, t);
      p.stroke(194 + t * 8, 88, 100, 18 - t * 8);
      p.line(p.width * 0.5 - spread, y, p.width * 0.5 + spread, y);
      p.stroke(314 - t * 6, 72, 100, 12 - t * 5);
      p.line(p.width * 0.5 - spread * 0.75, y + 4, p.width * 0.5 + spread * 0.75, y + 4);
    }
  }

  function drawLightRails() {
    const cfg = profile();
    const avenueTop = p.height * cfg.horizon;
    const avenueHalf = p.width * cfg.avenueWidth;
    const pulse = 0.5 + 0.5 * Math.sin(p.frameCount * 0.04);

    p.noFill();
    p.strokeWeight(cfg.base * 0.008);
    for (let side = -1; side <= 1; side += 2) {
      p.beginShape();
      for (let i = 0; i <= 18; i += 1) {
        const t = i / 18;
        const y = mix(avenueTop, p.height, t);
        const x = p.width * 0.5 + side * mix(avenueHalf * 0.5, avenueHalf * 1.72, Math.pow(t, 1.12));
        const drift = Math.sin(p.frameCount * 0.02 + t * 8 + side) * cfg.base * 0.01;
        p.stroke(side < 0 ? 192 : 316, 78, 100, 16 + pulse * 18 - t * 8);
        p.vertex(x + drift, y);
      }
      p.endShape();
    }
  }

  function drawDrones() {
    p.noStroke();
    for (const drone of drones) {
      const x = (drone.lane * p.width + p.width * 0.12 * Math.sin(p.frameCount * drone.speed * 14 + drone.phase)) % (p.width + 140) - 70;
      const flicker = 0.6 + 0.4 * Math.sin(p.frameCount * 0.18 + drone.phase * 2);
      p.fill(drone.hue, 80, 100, 12 * flicker);
      p.ellipse(x, drone.y, drone.size * 3.2, drone.size * 1.2);
      p.fill(drone.hue, 50, 100, 95);
      p.rect(x - drone.size * 0.5, drone.y - drone.size * 0.15, drone.size, drone.size * 0.3, drone.size * 0.15);
      p.fill(0, 0, 100, 70);
      p.circle(x - drone.size * 0.26, drone.y, drone.size * 0.14);
      p.circle(x + drone.size * 0.26, drone.y, drone.size * 0.14);
      p.stroke(drone.hue, 70, 100, 60 * flicker);
      p.line(x - drone.size * 2.4, drone.y, x - drone.size * 0.7, drone.y);
      p.line(x + drone.size * 0.7, drone.y, x + drone.size * 2.4, drone.y);
      p.noStroke();
    }
  }

  function drawFog() {
    p.noStroke();
    for (const band of fogBands) {
      const drift = Math.sin(p.frameCount * band.drift + band.y * 0.01) * p.width * 0.06;
      for (let i = 0; i < 5; i += 1) {
        const alpha = band.alpha - i * 1.2;
        if (alpha <= 0) continue;
        p.fill(band.hue, 42, 100, alpha);
        p.ellipse(p.width * (0.2 + i * 0.18) + drift, band.y + i * 12, p.width * 0.34, band.height * (1 + i * 0.16));
      }
    }
  }

  function drawRain() {
    for (const drop of rain) {
      const dx = drop.drift * drop.z;
      const dy = drop.speed * drop.z;
      p.stroke(194 + drop.z * 18, 50, 100, 12 + drop.z * 24);
      p.line(drop.x, drop.y, drop.x + dx * 2.4, drop.y + drop.len);
      drop.x += dx;
      drop.y += dy;
      if (drop.y > p.height + 20 || drop.x < -30) {
        drop.x = p.random(p.width + 50);
        drop.y = p.random(-p.height * 0.4, -20);
      }
    }
  }

  function drawReflections() {
    const cfg = profile();
    const avenueTop = p.height * cfg.horizon;

    p.noStroke();
    for (let i = 0; i < 22; i += 1) {
      const t = i / 21;
      const y = mix(avenueTop + 8, p.height, t);
      const width = mix(p.width * 0.06, p.width * 0.42, Math.pow(t, 1.5));
      const x = p.width * 0.5 + Math.sin(i * 1.7 + p.frameCount * 0.03) * p.width * 0.012;
      p.fill(i % 2 === 0 ? 192 : 316, 78, 100, 5 + (1 - t) * 14);
      p.rect(x - width * 0.5, y, width, cfg.base * 0.008, cfg.base * 0.003);
    }
  }

  function drawVignette() {
    const radius = Math.hypot(p.width, p.height) * 0.72;
    p.noFill();
    for (let i = 0; i < 20; i += 1) {
      const t = i / 19;
      p.stroke(0, 0, 0, 1.5 + t * 4.2);
      p.strokeWeight(radius * 0.018);
      p.ellipse(p.width * 0.5, p.height * 0.5, radius * (1.02 + t * 0.44), radius * (0.76 + t * 0.34));
    }
  }

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.noiseDetail(3, 0.4);
    rebuild();
  };

  p.draw = () => {
    drawGradientBackground();
    drawMoonGlow();
    drawSkyline();
    drawLightRails();
    drawReflections();
    drawDrones();
    drawFog();
    drawRain();
    drawVignette();
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    rebuild();
  };
}
