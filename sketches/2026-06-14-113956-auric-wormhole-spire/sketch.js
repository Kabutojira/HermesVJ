export default function sketch(p) {
  const stars = [];
  const dust = [];
  const sparks = [];
  const shards = [];
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
      heroX: portrait ? 0.64 : ultrawide ? 0.72 : square ? 0.67 : 0.69,
      heroY: portrait ? 0.38 : square ? 0.42 : 0.44,
      throatX: portrait ? 0.43 : ultrawide ? 0.5 : square ? 0.47 : 0.49,
      throatY: portrait ? 0.62 : square ? 0.58 : 0.58,
      radius: portrait ? 0.34 : ultrawide ? 0.3 : square ? 0.32 : 0.31,
      starCount: Math.floor((p.width * p.height) / (runtime.fullscreen ? 13500 : 16000)),
      dustCount: portrait ? 28 : ultrawide ? 34 : 30,
      sparkCount: portrait ? 18 : ultrawide ? 26 : 22,
      shardCount: portrait ? 12 : ultrawide ? 18 : 14,
      ribCount: portrait ? 16 : ultrawide ? 20 : 18,
      tilt: portrait ? -0.46 : ultrawide ? -0.3 : -0.34,
    };
  }

  function rebuild() {
    readRuntime();
    stars.length = 0;
    dust.length = 0;
    sparks.length = 0;
    shards.length = 0;
    const profile = cfg();

    for (let i = 0; i < profile.starCount; i += 1) {
      const laneBias = p.random() < 0.74 ? p.random(0.02, 0.72) : p.random();
      stars.push({
        x: p.width * laneBias,
        y: p.random(p.height),
        z: p.random(0.15, 1),
        size: p.random(0.8, profile.base * 0.006),
        phase: p.random(p.TWO_PI),
        speed: p.random(0.3, 1.4),
        hue: p.random() > 0.78 ? p.random(182, 200) : p.random(36, 48),
      });
    }

    for (let i = 0; i < profile.dustCount; i += 1) {
      dust.push({
        x: p.random(p.width * 0.06, p.width * 0.9),
        y: p.random(p.height * 0.08, p.height * 0.94),
        r: p.random(profile.base * 0.006, profile.base * 0.019),
        drift: p.random(0.5, 1.3),
        sway: p.random(0.003, 0.011),
        phase: p.random(p.TWO_PI),
        hue: p.random() > 0.84 ? p.random(184, 200) : p.random(34, 46),
        alpha: p.random(5, 14),
      });
    }

    for (let i = 0; i < profile.sparkCount; i += 1) {
      sparks.push({
        along: p.random(0.04, 1.05),
        offset: p.random(-0.22, 0.22),
        size: p.random(profile.base * 0.004, profile.base * 0.016),
        hue: p.random() > 0.82 ? p.random(186, 198) : p.random(34, 46),
        alpha: p.random(16, 34),
        speed: p.random(0.004, 0.016),
        phase: p.random(p.TWO_PI),
      });
    }

    for (let i = 0; i < profile.shardCount; i += 1) {
      const depth = p.random();
      shards.push({
        orbit: mix(profile.base * 0.24, profile.base * 0.72, depth),
        angle: p.random(-2.4, 1.6),
        w: mix(profile.base * 0.01, profile.base * 0.05, depth),
        h: mix(profile.base * 0.05, profile.base * 0.18, depth),
        tilt: p.random(-1.4, 1.2),
        speed: mix(0.003, 0.011, depth) * (p.random() > 0.5 ? 1 : -1),
        hue: p.random() > 0.7 ? p.random(184, 198) : p.random(34, 46),
        alpha: mix(10, 30, depth),
      });
    }
  }

  function warpPoint(cx, cy, rx, ry, angle, wobble, twist) {
    const wave = 1 + wobble * 0.15 * Math.sin(angle * 3 + twist) + wobble * 0.08 * Math.sin(angle * 6 - twist * 0.7);
    const x = Math.cos(angle) * rx * wave;
    const y = Math.sin(angle) * ry * (1 + wobble * 0.06 * Math.cos(angle * 4 + twist * 0.6));
    const skewX = x + y * 0.22;
    const skewY = y - x * 0.06;
    return { x: cx + skewX, y: cy + skewY };
  }

  function drawWarpShape(cx, cy, rx, ry, rotation, wobble, twist) {
    p.beginShape();
    for (let i = 0; i <= 90; i += 1) {
      const angle = (i / 90) * p.TWO_PI;
      const pt = warpPoint(0, 0, rx, ry, angle, wobble, twist);
      const x = pt.x * Math.cos(rotation) - pt.y * Math.sin(rotation);
      const y = pt.x * Math.sin(rotation) + pt.y * Math.cos(rotation);
      p.vertex(cx + x, cy + y);
    }
    p.endShape(p.CLOSE);
  }

  function drawBackground() {
    for (let y = 0; y < p.height; y += 2) {
      const t = y / Math.max(1, p.height - 1);
      const hue = t < 0.5 ? mix(224, 242, t / 0.5) : mix(242, 268, (t - 0.5) / 0.5);
      const sat = t < 0.58 ? mix(40, 62, t / 0.58) : mix(62, 26, (t - 0.58) / 0.42);
      const bri = t < 0.46 ? mix(3, 11, t / 0.46) : mix(11, 7, (t - 0.46) / 0.54);
      p.stroke(hue, sat, bri, 100);
      p.line(0, y, p.width, y);
    }

    p.noStroke();
    const profile = cfg();
    for (let i = 0; i < 6; i += 1) {
      const x = p.width * mix(0.12, 0.84, i / 5);
      const y = p.height * (0.16 + i * 0.08);
      p.fill(190 + i * 2, 22, 90, 2 + i * 0.6);
      p.ellipse(x, y, profile.base * 0.46, profile.base * 0.11);
    }

    for (let i = 0; i < 5; i += 1) {
      const x = p.width * (0.58 + i * 0.07);
      const y = p.height * (0.18 + i * 0.08);
      p.fill(38 + i, 48, 100, 1.8 + i * 0.7);
      p.ellipse(x, y, profile.base * 0.24, profile.base * 0.07);
    }
  }

  function drawFarPlanes() {
    p.noStroke();
    p.fill(242, 22, 7, 26);
    p.quad(0, p.height * 0.76, p.width * 0.16, p.height * 0.72, p.width * 0.3, p.height, 0, p.height);
    p.quad(p.width * 0.7, p.height * 0.72, p.width, p.height * 0.64, p.width, p.height, p.width * 0.82, p.height);

    for (let i = 0; i < 5; i += 1) {
      const x = p.width * (0.08 + i * 0.18);
      const y = p.height * (0.84 + 0.02 * Math.sin(i * 1.7));
      p.fill(250 + i * 3, 16, 12, 8);
      p.ellipse(x, y, cfg().base * 0.38, cfg().base * 0.05);
    }
  }

  function drawCurrent(throatX, throatY) {
    p.noFill();
    const base = cfg().base;
    for (let i = 0; i < 10; i += 1) {
      const t = i / 9;
      const x1 = p.width * mix(0.02, 0.38, t);
      const y1 = p.height * mix(0.18, 0.86, t);
      const x2 = mix(x1, throatX, 0.86);
      const y2 = mix(y1, throatY, 0.86);
      const cx1 = mix(x1, throatX, 0.22) + p.width * 0.08;
      const cy1 = mix(y1, throatY, 0.2) + p.height * (-0.08 + t * 0.05);
      const cx2 = mix(x1, throatX, 0.68) - p.width * 0.03;
      const cy2 = mix(y1, throatY, 0.74) + p.height * (0.05 - t * 0.08);
      p.stroke(198, 38, 96, 5 + (1 - t) * 6);
      p.strokeWeight(base * mix(0.0025, 0.013, 1 - t));
      p.bezier(x1, y1, cx1, cy1, cx2, cy2, x2, y2);
      p.stroke(40, 68, 100, 2 + (1 - t) * 3.5);
      p.strokeWeight(base * mix(0.001, 0.0042, 1 - t));
      p.bezier(x1, y1 + base * 0.014, cx1, cy1, cx2, cy2, x2, y2 + base * 0.01);
    }
  }

  function drawStars(throatX, throatY, radius) {
    p.noStroke();
    for (const star of stars) {
      const dx = throatX - star.x;
      const dy = throatY - star.y;
      const dist = Math.hypot(dx, dy);
      const pull = clamp01(1 - dist / (radius * 5.6));
      const drift = p.frameCount * 0.0027 * star.speed * (0.4 + star.z * 0.8);
      const x = star.x + dx * pull * 0.12 + Math.cos(star.phase + drift) * star.size * 0.7;
      const y = star.y + dy * pull * 0.12 + Math.sin(star.phase * 0.8 + drift) * star.size * 0.45;
      const twinkle = 0.35 + 0.65 * Math.sin(p.frameCount * 0.018 * star.speed + star.phase);
      const streak = pull > 0.16 ? mix(1.2, 8.8, pull * star.z) : 1;
      p.push();
      p.translate(x, y);
      p.rotate(Math.atan2(dy, dx));
      p.fill(star.hue, star.hue > 100 ? 26 + star.z * 28 : 60, 88 + twinkle * 12, 10 + star.z * 30 * twinkle);
      p.ellipse(0, 0, star.size * streak, star.size * (0.75 + (1 - pull) * 0.3));
      if (pull > 0.24) {
        p.fill(star.hue > 100 ? 194 : 42, 18, 100, 3 + pull * 8);
        p.ellipse(-star.size * streak * 0.75, 0, star.size * streak * 2.8, star.size * 0.8);
      }
      p.pop();
    }
  }

  function drawDust(throatX, throatY, radius) {
    p.noStroke();
    for (const mote of dust) {
      const dx = throatX - mote.x;
      const dy = throatY - mote.y;
      const dist = Math.hypot(dx, dy);
      const pull = clamp01(1 - dist / (radius * 4.1));
      const wobble = 0.4 + 0.6 * Math.sin(p.frameCount * mote.sway * 44 + mote.phase);
      const x = mote.x + Math.sin(p.frameCount * 0.014 * mote.drift + mote.phase) * mote.r * 5 + dx * pull * 0.08;
      const y = mote.y + Math.cos(p.frameCount * 0.01 * mote.drift + mote.phase) * mote.r * 2.6 + dy * pull * 0.08;
      p.fill(mote.hue, mote.hue > 100 ? 32 : 64, 100, mote.alpha * wobble);
      p.circle(x, y, mote.r * (0.8 + wobble * 0.85));
      if (pull > 0.26) {
        p.fill(42, 24, 100, pull * 5);
        p.ellipse(x, y, mote.r * (3 + pull * 6), mote.r * (0.9 + pull * 1.1));
      }
    }
  }

  function drawHaloField(heroX, heroY, radius, height, rotation) {
    p.noStroke();
    for (let i = 0; i < 6; i += 1) {
      const t = i / 5;
      p.fill(192 + i * 2, 28, 98, 1.2 + (1 - t) * 1.8);
      drawWarpShape(heroX - radius * 0.12, heroY - height * 0.06, radius * mix(1.5, 1.05, t), height * mix(1.34, 0.94, t), rotation, 0.84, p.frameCount * 0.015 + i * 0.35);
    }
    for (let i = 0; i < 5; i += 1) {
      const t = i / 4;
      p.fill(38 + i, 62, 100, 1 + (1 - t) * 2.6);
      drawWarpShape(heroX - radius * 0.08, heroY + height * 0.01, radius * mix(1.28, 0.9, t), height * mix(1.08, 0.82, t), rotation, 0.72, p.frameCount * 0.012 + i * 0.44);
    }
  }

  function drawAuricFrame(heroX, heroY, radius, height, rotation) {
    p.push();
    p.translate(heroX, heroY);
    p.rotate(rotation);
    p.noFill();
    for (let i = 0; i < 3; i += 1) {
      p.stroke(40, 76, 100, 10 - i * 2);
      p.strokeWeight(radius * (0.05 - i * 0.01));
      p.arc(0, 0, radius * (2.02 + i * 0.12), height * (1.62 + i * 0.1), 0.42, 2.7);
    }
    for (let i = 0; i < 10; i += 1) {
      const t = i / 9;
      const angle = mix(0.52, 2.58, t);
      const px = Math.cos(angle) * radius * 0.98;
      const py = Math.sin(angle) * height * 0.8;
      const nx = Math.cos(angle) * radius * 1.2;
      const ny = Math.sin(angle) * height * 1.02;
      p.stroke(i % 3 === 0 ? 194 : 42, i % 3 === 0 ? 34 : 80, 100, 16);
      p.strokeWeight(radius * (0.008 + 0.004 * (1 - t)));
      p.line(px, py, nx, ny);
    }
    p.pop();
  }

  function drawTunnel(heroX, heroY, throatX, throatY, radius, height, rotation) {
    const profile = cfg();
    for (let i = profile.ribCount; i >= 1; i -= 1) {
      const t = i / profile.ribCount;
      const depth = smooth(1 - t);
      const x = mix(heroX, throatX, depth * 0.98);
      const y = mix(heroY, throatY, depth * 0.98);
      const rx = mix(radius * 1.14, radius * 0.12, depth);
      const ry = mix(height * 1.06, height * 0.13, depth);
      const wobble = mix(0.9, 0.16, depth);
      const twist = p.frameCount * 0.02 + i * 0.3;

      p.noStroke();
      p.fill(228 + depth * 14, 18, mix(10, 2, depth), 78);
      drawWarpShape(x, y, rx * 1.05, ry * 1.08, rotation, wobble, twist);

      p.fill(36 + depth * 8, 24, mix(10, 2, depth), 52);
      drawWarpShape(x - radius * 0.015, y, rx * 0.94, ry * 0.94, rotation, wobble * 0.72, twist + 0.28);

      if (i < profile.ribCount - 1) {
        p.noFill();
        p.stroke(i % 3 === 0 ? 192 : 40, i % 3 === 0 ? 54 : 82, 100, mix(1, 14, 1 - depth));
        p.strokeWeight(radius * mix(0.0012, 0.01, 1 - depth));
        drawWarpShape(x, y, rx * 0.98, ry * 0.98, rotation, wobble, twist);
      }
    }

    for (let i = 0; i < 6; i += 1) {
      const glow = 1 + 0.026 * Math.sin(p.frameCount * 0.02 + i);
      p.noFill();
      p.stroke(i < 4 ? 40 : 190, i < 4 ? 78 : 42, 100, 12 + i * 3.2);
      p.strokeWeight(radius * (0.014 - i * 0.0018));
      drawWarpShape(heroX, heroY, radius * (1.12 + i * 0.03) * glow, height * (1.08 + i * 0.03) * glow, rotation, 0.86, p.frameCount * 0.022 + i * 0.45);
    }

    p.noStroke();
    p.fill(42, 74, 100, 20);
    drawWarpShape(heroX - radius * 0.045, heroY + height * 0.02, radius * 0.78, height * 0.72, rotation, 0.48, p.frameCount * 0.018);
    p.fill(0, 0, 0, 100);
    drawWarpShape(heroX, heroY, radius * 0.68, height * 0.65, rotation, 0.5, p.frameCount * 0.018);

    for (let i = 7; i >= 1; i -= 1) {
      const pulse = 1 + 0.05 * Math.sin(p.frameCount * 0.03 + i * 0.6);
      p.fill(42, 72, 100, 2 + i * 1.7);
      drawWarpShape(throatX, throatY, radius * mix(0.34, 0.08, i / 7) * pulse, height * mix(0.25, 0.05, i / 7) * pulse, rotation, 0.22, p.frameCount * 0.03 + i);
      p.fill(194, 42, 100, 1 + i * 1.1);
      drawWarpShape(throatX - radius * 0.03, throatY, radius * mix(0.16, 0.04, i / 7) * pulse, height * mix(0.11, 0.035, i / 7) * pulse, rotation, 0.18, p.frameCount * 0.024 + i * 0.6);
    }
  }

  function drawCrownSpires(heroX, heroY, radius, height, rotation) {
    const spires = [
      { t: -0.88, lift: -0.68, h: 1.05, hue: 40 },
      { t: -0.46, lift: -0.88, h: 1.3, hue: 42 },
      { t: 0.04, lift: -0.94, h: 1.55, hue: 194 },
      { t: 0.4, lift: -0.76, h: 1.08, hue: 38 },
    ];
    p.noStroke();
    for (const spire of spires) {
      const px = heroX + Math.cos(rotation) * radius * spire.t - Math.sin(rotation) * height * spire.lift * 0.18;
      const py = heroY + Math.sin(rotation) * radius * spire.t + Math.cos(rotation) * height * spire.lift * 0.18;
      const w = radius * 0.1;
      const h = height * spire.h;
      p.fill(228, 18, 8, 94);
      p.quad(px - w * 0.55, py + h * 0.2, px - w * 0.2, py - h, px + w * 0.18, py - h * 0.96, px + w * 0.58, py + h * 0.16);
      p.fill(spire.hue, spire.hue > 100 ? 36 : 70, 100, 16);
      p.quad(px - w * 0.08, py - h * 0.74, px + w * 0.02, py - h * 0.94, px + w * 0.14, py - h * 0.28, px, py - h * 0.18);
    }
  }

  function drawShards(heroX, heroY, rotation) {
    p.noStroke();
    for (let i = 0; i < shards.length; i += 1) {
      const shard = shards[i];
      const angle = shard.angle + p.frameCount * shard.speed;
      const orbitX = Math.cos(angle) * shard.orbit * 1.08;
      const orbitY = Math.sin(angle) * shard.orbit * 0.46;
      const x = heroX + orbitX * Math.cos(rotation) - orbitY * Math.sin(rotation);
      const y = heroY + orbitX * Math.sin(rotation) + orbitY * Math.cos(rotation);
      const trail = 0.45 + 0.55 * Math.sin(p.frameCount * 0.018 + i * 0.8);
      p.push();
      p.translate(x, y);
      p.rotate(rotation + shard.tilt + angle * 0.4);
      p.fill(shard.hue, shard.hue > 100 ? 32 : 76, 100, shard.alpha * trail * 0.75);
      p.quad(-shard.w * 0.6, 0, 0, -shard.h * 0.52, shard.w, 0, 0, shard.h * 0.36);
      p.fill(42, 18, 100, shard.alpha * 0.14);
      p.quad(-shard.w * 0.15, 0, 0, -shard.h * 0.2, shard.w * 0.42, 0, 0, shard.h * 0.14);
      p.pop();
    }
  }

  function drawSparkLane(throatX, throatY, midX, midY) {
    p.noStroke();
    for (const spark of sparks) {
      const drift = Math.sin(p.frameCount * spark.speed + spark.phase) * 0.06;
      const t = spark.along + drift;
      const x = mix(throatX, midX, t) + (midY - throatY) * spark.offset;
      const y = mix(throatY, midY, t) - (midX - throatX) * spark.offset * 0.28;
      const glow = 0.5 + 0.5 * Math.sin(p.frameCount * 0.022 + spark.phase);
      p.fill(spark.hue, spark.hue > 100 ? 44 : 76, 100, spark.alpha * glow);
      p.circle(x, y, spark.size * (0.7 + glow));
      p.fill(spark.hue, 20, 100, spark.alpha * 0.16);
      p.ellipse(x, y, spark.size * 4.8, spark.size * 1.3);
    }
  }

  function drawVeils(heroX, heroY, radius, height, rotation) {
    p.noFill();
    for (let i = 0; i < 6; i += 1) {
      const t = i / 5;
      const alpha = mix(14, 4, t);
      p.push();
      p.translate(heroX, heroY);
      p.rotate(rotation + mix(-0.32, 0.2, t));
      p.stroke(t < 0.58 ? 42 : 192, t < 0.58 ? 52 : 24, 100, alpha);
      p.strokeWeight(radius * mix(0.012, 0.003, t));
      p.arc(0, 0, radius * mix(2.02, 2.8, t), height * mix(1.2, 2.2, t), -2.36, 0.72);
      p.pop();
    }
  }

  function drawVignette() {
    const radius = Math.hypot(p.width, p.height) * 0.74;
    p.noFill();
    for (let i = 0; i < 18; i += 1) {
      const t = i / 17;
      p.stroke(0, 0, 0, 1.8 + t * 4.7);
      p.strokeWeight(radius * 0.018);
      p.ellipse(p.width * 0.5, p.height * 0.5, radius * (1 + t * 0.46), radius * (0.72 + t * 0.34));
    }
  }

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    rebuild();
  };

  p.draw = () => {
    const profile = cfg();
    const radius = profile.base * profile.radius;
    const height = radius * 0.78;
    const heroX = p.width * profile.heroX;
    const heroY = p.height * profile.heroY;
    const throatX = p.width * profile.throatX;
    const throatY = p.height * profile.throatY;
    const rotation = profile.tilt + 0.028 * Math.sin(p.frameCount * 0.01);
    const midX = mix(throatX, heroX, 0.58);
    const midY = mix(throatY, heroY, 0.58);

    drawBackground();
    drawCurrent(throatX, throatY);
    drawStars(throatX, throatY, radius);
    drawDust(throatX, throatY, radius);
    drawFarPlanes();
    drawSparkLane(throatX, throatY, midX, midY);
    drawHaloField(heroX, heroY, radius, height, rotation);
    drawAuricFrame(heroX, heroY, radius, height, rotation);
    drawTunnel(heroX, heroY, throatX, throatY, radius, height, rotation);
    drawCrownSpires(heroX, heroY, radius, height, rotation);
    drawVeils(heroX, heroY, radius, height, rotation);
    drawShards(heroX, heroY, rotation);
    drawVignette();
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    rebuild();
  };
}
