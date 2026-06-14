export default function sketch(p) {
  const stars = [];
  const bokeh = [];
  const petals = [];
  const breezeBands = [];
  const grass = [];
  let runtime = { aspect: 'landscape', fullscreen: false };

  function mix(a, b, t) {
    return a + (b - a) * t;
  }

  function clamp01(v) {
    return Math.max(0, Math.min(1, v));
  }

  function smooth(t) {
    return t * t * (3 - 2 * t);
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
      heroX: portrait ? 0.58 : ultrawide ? 0.62 : square ? 0.6 : 0.57,
      heroY: portrait ? 0.64 : square ? 0.68 : 0.67,
      stemHeight: portrait ? 0.42 : ultrawide ? 0.46 : 0.45,
      skyGlowX: portrait ? 0.72 : ultrawide ? 0.78 : 0.74,
      skyGlowY: portrait ? 0.24 : 0.22,
      clusterScale: portrait ? 1.22 : ultrawide ? 1.02 : 1.12,
      starCount: Math.floor((p.width * p.height) / (runtime.fullscreen ? 17000 : 21000)),
      bokehCount: portrait ? 12 : ultrawide ? 16 : 14,
      petalCount: portrait ? 34 : ultrawide ? 40 : 36,
      bandCount: portrait ? 4 : ultrawide ? 6 : 5,
      grassCount: portrait ? 40 : ultrawide ? 54 : 46,
      breezeLean: portrait ? -0.48 : ultrawide ? -0.38 : -0.43,
      horizonY: portrait ? 0.78 : 0.8,
    };
  }

  function rebuild() {
    readRuntime();
    stars.length = 0;
    bokeh.length = 0;
    petals.length = 0;
    breezeBands.length = 0;
    grass.length = 0;
    const profile = cfg();

    for (let i = 0; i < profile.starCount; i += 1) {
      stars.push({
        x: p.random(p.width),
        y: p.random(p.height * 0.58),
        size: p.random(1, profile.base * 0.007),
        depth: p.random(0.2, 1),
        phase: p.random(p.TWO_PI),
        speed: p.random(0.25, 1.15),
        hue: p.random() > 0.84 ? p.random(158, 182) : p.random(258, 286),
        alpha: p.random(10, 36),
      });
    }

    for (let i = 0; i < profile.bokehCount; i += 1) {
      const layer = p.random();
      bokeh.push({
        x: p.random(p.width * 0.04, p.width * 0.96),
        y: p.random(p.height * 0.18, p.height * 0.82),
        w: mix(profile.base * 0.08, profile.base * 0.34, layer),
        h: mix(profile.base * 0.018, profile.base * 0.08, layer),
        hue: p.random() > 0.25 ? p.random(268, 292) : p.random(162, 184),
        alpha: mix(4, 14, layer),
        drift: p.random(0.002, 0.012),
        phase: p.random(p.TWO_PI),
      });
    }

    for (let i = 0; i < profile.petalCount; i += 1) {
      petals.push({
        x: p.random(p.width * 0.16, p.width * 0.92),
        y: p.random(p.height * 0.2, p.height * 0.88),
        scale: p.random(profile.base * 0.008, profile.base * 0.03),
        drift: p.random(0.35, 1.2),
        sway: p.random(0.2, 0.8),
        phase: p.random(p.TWO_PI),
        spin: p.random(-0.018, 0.018),
        hue: p.random() > 0.2 ? p.random(270, 300) : p.random(162, 184),
        alpha: p.random(10, 26),
      });
    }

    for (let i = 0; i < profile.bandCount; i += 1) {
      breezeBands.push({
        y: p.height * mix(0.18, 0.82, i / Math.max(1, profile.bandCount - 1)),
        amp: mix(profile.base * 0.015, profile.base * 0.06, i / Math.max(1, profile.bandCount - 1)),
        thickness: mix(profile.base * 0.004, profile.base * 0.018, i / Math.max(1, profile.bandCount - 1)),
        alpha: mix(5, 12, 1 - i / Math.max(1, profile.bandCount - 1)),
        hue: i % 3 === 0 ? 170 : 282,
        speed: mix(0.004, 0.013, i / Math.max(1, profile.bandCount - 1)),
        phase: p.random(p.TWO_PI),
      });
    }

    for (let i = 0; i < profile.grassCount; i += 1) {
      const leftField = i < profile.grassCount * 0.72;
      let zone = leftField ? p.random(0.02, 0.66) : p.random(0.7, 1);
      if (Math.abs(zone - profile.heroX) < 0.07) {
        zone += zone < profile.heroX ? -0.08 : 0.08;
      }
      zone = clamp01(zone);
      grass.push({
        x: p.width * zone,
        baseY: p.height * mix(profile.horizonY - 0.03, 1.02, p.random()),
        height: p.random(profile.base * 0.08, profile.base * 0.3),
        sway: p.random(0.006, 0.018),
        phase: p.random(p.TWO_PI),
        thickness: p.random(profile.base * 0.0015, profile.base * 0.0045),
        hue: p.random() > 0.12 ? p.random(112, 136) : p.random(150, 170),
        alpha: p.random(18, 52),
        blur: p.random(),
      });
    }
  }

  function petalShape(size) {
    p.beginShape();
    p.vertex(0, -size * 0.5);
    p.bezierVertex(size * 0.55, -size * 0.15, size * 0.38, size * 0.55, 0, size * 0.72);
    p.bezierVertex(-size * 0.38, size * 0.55, -size * 0.55, -size * 0.15, 0, -size * 0.5);
    p.endShape(p.CLOSE);
  }

  function drawBackground(profile) {
    for (let y = 0; y < p.height; y += 2) {
      const t = y / Math.max(1, p.height - 1);
      const hue = t < 0.48 ? mix(232, 254, t / 0.48) : mix(254, 286, (t - 0.48) / 0.52);
      const sat = t < 0.52 ? mix(46, 62, t / 0.52) : mix(62, 48, (t - 0.52) / 0.48);
      const bri = t < 0.4 ? mix(4, 12, t / 0.4) : mix(12, 16, (t - 0.4) / 0.6);
      p.stroke(hue, sat, bri, 100);
      p.line(0, y, p.width, y);
    }

    p.noStroke();
    for (let i = 0; i < 8; i += 1) {
      const t = i / 7;
      p.fill(272 + t * 12, 32, 100, 1.8 + (1 - t) * 2.4);
      p.ellipse(
        p.width * profile.skyGlowX,
        p.height * profile.skyGlowY,
        profile.base * mix(0.72, 0.2, t),
        profile.base * mix(0.56, 0.16, t)
      );
      p.fill(170, 20, 100, 0.8 + (1 - t) * 1.2);
      p.ellipse(
        p.width * (profile.skyGlowX - 0.04),
        p.height * (profile.skyGlowY + 0.02),
        profile.base * mix(0.26, 0.1, t),
        profile.base * mix(0.2, 0.06, t)
      );
    }

    for (const blur of bokeh) {
      const drift = Math.sin(p.frameCount * blur.drift + blur.phase) * profile.base * 0.014;
      p.fill(blur.hue, blur.hue < 200 ? 18 : 22, 100, blur.alpha * 0.82);
      p.ellipse(blur.x + drift, blur.y, blur.w, blur.h);
    }
  }

  function drawStars() {
    p.noStroke();
    for (const star of stars) {
      const twinkle = 0.4 + 0.6 * Math.sin(p.frameCount * 0.02 * star.speed + star.phase);
      p.fill(star.hue, star.hue < 200 ? 24 : 28, 92 + twinkle * 8, star.alpha * twinkle);
      p.circle(star.x, star.y, star.size * (0.7 + twinkle));
      if (star.depth > 0.74 && twinkle > 0.72) {
        p.fill(star.hue, 12, 100, 4 + twinkle * 6);
        p.ellipse(star.x, star.y, star.size * 4.2, star.size * 1.1);
      }
    }
  }

  function drawBreeze(profile) {
    p.noFill();
    p.strokeCap(p.ROUND);
    for (const band of breezeBands) {
      p.stroke(band.hue, band.hue < 200 ? 34 : 30, 100, band.alpha);
      p.strokeWeight(band.thickness);
      p.beginShape();
      for (let step = 0; step <= 28; step += 1) {
        const t = step / 28;
        const x = p.width * t;
        const wave = Math.sin(t * 8.2 + p.frameCount * band.speed + band.phase) * band.amp;
        const gust = Math.sin(t * 3.6 - p.frameCount * band.speed * 1.7 + band.phase) * band.amp * 0.45;
        const y = band.y + wave + gust - t * profile.base * 0.05;
        p.curveVertex(x, y);
      }
      p.endShape();
    }
  }

  function drawGrass(profile) {
    p.noFill();
    p.strokeCap(p.ROUND);
    for (const blade of grass) {
      const sway = Math.sin(p.frameCount * blade.sway + blade.phase) * profile.base * 0.035;
      const tipX = blade.x + sway + profile.base * profile.breezeLean * (blade.height / profile.base) * 0.8;
      const tipY = blade.baseY - blade.height;
      const midX = blade.x + sway * 0.4;
      const midY = blade.baseY - blade.height * 0.42;
      p.stroke(blade.hue, blade.hue < 145 ? 36 : 28, 52 + blade.blur * 18, blade.alpha * (0.5 + blade.blur * 0.8));
      p.strokeWeight(blade.thickness * (1 + blade.blur * 1.1));
      p.bezier(blade.x, blade.baseY, blade.x + sway * 0.2, blade.baseY - blade.height * 0.18, midX, midY, tipX, tipY);
    }

    p.noStroke();
    for (let i = 0; i < 5; i += 1) {
      const t = i / 4;
      p.fill(286, 36, 18 + t * 8, 10);
      p.rect(0, p.height * mix(profile.horizonY - 0.02, 1, t), p.width, profile.base * 0.08);
    }
  }

  function drawStem(cx, cy, profile) {
    const baseY = p.height * 0.96;
    const stemLen = profile.base * profile.stemHeight;
    const lean = profile.base * profile.breezeLean;

    p.noFill();
    for (let i = 5; i >= 1; i -= 1) {
      p.stroke(168, 34, 90, 2 + i * 1.2);
      p.strokeWeight(profile.base * (0.014 + i * 0.003));
      p.bezier(
        cx - profile.base * 0.02,
        baseY,
        cx - profile.base * 0.05,
        cy + stemLen * 0.25,
        cx + lean * 0.6,
        cy + stemLen * 0.02,
        cx + lean,
        cy
      );
    }

    p.stroke(128, 34, 42, 88);
    p.strokeWeight(profile.base * 0.012);
    p.bezier(
      cx - profile.base * 0.02,
      baseY,
      cx - profile.base * 0.05,
      cy + stemLen * 0.25,
      cx + lean * 0.6,
      cy + stemLen * 0.02,
      cx + lean,
      cy
    );

    for (let i = 0; i < 4; i += 1) {
      const t = i / 3;
      const anchorX = mix(cx - profile.base * 0.01, cx + lean * 0.76, 0.18 + t * 0.52);
      const anchorY = mix(baseY - stemLen * 0.12, cy + stemLen * 0.12, 0.2 + t * 0.45);
      const leafDir = i % 2 === 0 ? -1 : 1;
      p.noFill();
      p.stroke(136 + i * 4, 30, 52, 58);
      p.strokeWeight(profile.base * 0.006);
      p.bezier(
        anchorX,
        anchorY,
        anchorX + profile.base * 0.04 * leafDir,
        anchorY - profile.base * 0.01,
        anchorX + profile.base * 0.08 * leafDir,
        anchorY - profile.base * 0.05,
        anchorX + profile.base * 0.07 * leafDir,
        anchorY - profile.base * 0.08
      );
    }

    return { x: cx + lean, y: cy };
  }

  function drawLavenderCluster(anchorX, anchorY, profile) {
    const spikeLength = profile.base * 0.27 * profile.clusterScale;
    const spikeDir = -1.06 + Math.sin(p.frameCount * 0.012) * 0.03;
    const spikeTipX = anchorX + Math.cos(spikeDir) * spikeLength;
    const spikeTipY = anchorY + Math.sin(spikeDir) * spikeLength;

    p.noFill();
    for (let i = 4; i >= 1; i -= 1) {
      p.stroke(176, 24, 100, 2 + i * 1.1);
      p.strokeWeight(profile.base * (0.007 + i * 0.002));
      p.bezier(
        anchorX,
        anchorY,
        anchorX - profile.base * 0.04,
        anchorY - profile.base * 0.02,
        mix(anchorX, spikeTipX, 0.7),
        mix(anchorY, spikeTipY, 0.74),
        spikeTipX,
        spikeTipY
      );
    }

    p.stroke(272, 28, 56, 80);
    p.strokeWeight(profile.base * 0.006);
    p.bezier(
      anchorX,
      anchorY,
      anchorX - profile.base * 0.04,
      anchorY - profile.base * 0.02,
      mix(anchorX, spikeTipX, 0.7),
      mix(anchorY, spikeTipY, 0.74),
      spikeTipX,
      spikeTipY
    );

    for (let i = 0; i < 15; i += 1) {
      const t = i / 14;
      const coreX = mix(anchorX, spikeTipX, 0.12 + t * 0.88);
      const coreY = mix(anchorY, spikeTipY, 0.08 + t * 0.92);
      const sway = Math.sin(p.frameCount * 0.018 + i * 0.55) * profile.base * 0.004;
      const bloom = (1 - Math.abs(t - 0.45) * 1.5) * profile.base * 0.02 * profile.clusterScale;
      const pairCount = t < 0.2 ? 2 : 3;
      for (let side = 0; side < pairCount; side += 1) {
        const dir = side === 0 ? -1 : side === 1 ? 1 : 0;
        const px = coreX + dir * bloom * (0.9 + 0.2 * Math.sin(i + side));
        const py = coreY + side * profile.base * 0.002 + sway;
        p.push();
        p.translate(px, py);
        p.rotate(dir * (0.5 + t * 0.5) - 1.15 + sway * 12);
        p.noStroke();
        p.fill(278 + t * 18, 58, 100, 16 + (1 - t) * 8);
        petalShape(profile.base * mix(0.022, 0.01, t));
        p.fill(170, 24, 100, 3 + (1 - t) * 3);
        p.ellipse(0, 0, profile.base * 0.02, profile.base * 0.008);
        p.pop();
      }
    }

    for (let i = 0; i < 7; i += 1) {
      const t = i / 6;
      p.noStroke();
      p.fill(284 + t * 8, 42, 100, 2 + (1 - t) * 2.4);
      p.ellipse(
        mix(anchorX, spikeTipX, 0.52),
        mix(anchorY, spikeTipY, 0.5),
        profile.base * mix(0.28, 0.1, t),
        profile.base * mix(0.12, 0.05, t)
      );
    }

    return { x: spikeTipX, y: spikeTipY };
  }

  function drawHeroGlow(anchor, profile) {
    for (let i = 7; i >= 1; i -= 1) {
      const pulse = 1 + 0.02 * Math.sin(p.frameCount * 0.018 + i * 0.4);
      p.noStroke();
      p.fill(286 + i * 2, 36, 100, 1.8 + i * 0.9);
      p.ellipse(anchor.x - profile.base * 0.05, anchor.y - profile.base * 0.02, profile.base * (0.42 + i * 0.04) * pulse, profile.base * (0.16 + i * 0.02) * pulse);
      p.fill(170, 18, 100, 0.6 + i * 0.45);
      p.ellipse(anchor.x - profile.base * 0.02, anchor.y - profile.base * 0.015, profile.base * (0.12 + i * 0.018) * pulse, profile.base * (0.07 + i * 0.01) * pulse);
    }
  }

  function drawMoonAccent(anchor, profile) {
    const moonX = anchor.x + profile.base * 0.11;
    const moonY = anchor.y - profile.base * 0.14;
    for (let i = 6; i >= 1; i -= 1) {
      const pulse = 1 + 0.015 * Math.sin(p.frameCount * 0.01 + i * 0.4);
      p.noStroke();
      p.fill(170, 12, 100, 1 + i * 0.75);
      p.ellipse(moonX, moonY, profile.base * (0.22 + i * 0.022) * pulse, profile.base * (0.16 + i * 0.018) * pulse);
      p.fill(286, 18, 100, 0.8 + i * 0.5);
      p.ellipse(moonX - profile.base * 0.014, moonY + profile.base * 0.002, profile.base * (0.18 + i * 0.016) * pulse, profile.base * (0.13 + i * 0.014) * pulse);
    }
    p.fill(0, 0, 100, 95);
    p.circle(moonX, moonY, profile.base * 0.14);
    p.fill(266, 22, 40, 26);
    p.circle(moonX + profile.base * 0.04, moonY - profile.base * 0.004, profile.base * 0.14);
  }

  function drawPetals(profile) {
    for (const petal of petals) {
      const driftX = p.frameCount * 0.18 * petal.drift;
      const x = ((petal.x + driftX) % (p.width + profile.base * 0.08)) - profile.base * 0.04;
      const y = petal.y + Math.sin(p.frameCount * 0.018 * petal.sway + petal.phase) * profile.base * 0.03 + Math.cos(p.frameCount * 0.004 * petal.drift + petal.phase) * profile.base * 0.01;
      const fadeIn = clamp01((x + profile.base * 0.03) / (p.width * 0.12));
      const fadeOut = clamp01((p.width - x) / (p.width * 0.18));
      const alpha = petal.alpha * Math.min(fadeIn, fadeOut);
      p.push();
      p.translate(x, y);
      p.rotate(Math.sin(p.frameCount * petal.spin + petal.phase) * 0.8 - 0.7);
      p.noStroke();
      p.fill(petal.hue, petal.hue < 200 ? 24 : 42, 100, alpha * 0.7);
      petalShape(petal.scale);
      p.fill(0, 0, 100, alpha * 0.08);
      p.ellipse(0, petal.scale * 0.08, petal.scale * 0.4, petal.scale * 0.2);
      p.pop();
    }
  }

  function drawForegroundWash(profile) {
    p.noStroke();
    for (let i = 0; i < 7; i += 1) {
      const t = i / 6;
      p.fill(278 + t * 6, 26, 16 + t * 6, 8);
      p.ellipse(
        p.width * mix(0.16, 0.92, t),
        p.height * mix(0.9, 0.98, t),
        profile.base * mix(0.46, 0.74, t),
        profile.base * mix(0.08, 0.14, t)
      );
    }
  }

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.noiseDetail(2, 0.55);
    rebuild();
  };

  p.draw = () => {
    const profile = cfg();
    p.background(0, 0, 0, 100);
    drawBackground(profile);
    drawStars();
    drawBreeze(profile);
    drawGrass(profile);
    const stemAnchor = drawStem(p.width * profile.heroX, p.height * profile.heroY, profile);
    drawMoonAccent(stemAnchor, profile);
    drawHeroGlow(stemAnchor, profile);
    drawLavenderCluster(stemAnchor.x, stemAnchor.y, profile);
    drawPetals(profile);
    drawForegroundWash(profile);
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    rebuild();
  };
}
