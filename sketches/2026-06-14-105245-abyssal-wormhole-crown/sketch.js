export default function sketch(p) {
  const stars = [];
  const dust = [];
  const shards = [];
  const embers = [];
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
      heroX: portrait ? 0.62 : ultrawide ? 0.7 : square ? 0.66 : 0.68,
      heroY: portrait ? 0.42 : square ? 0.46 : 0.47,
      vanishX: portrait ? 0.38 : ultrawide ? 0.46 : square ? 0.44 : 0.43,
      vanishY: portrait ? 0.58 : square ? 0.56 : 0.55,
      mouthScale: portrait ? 0.42 : ultrawide ? 0.34 : square ? 0.37 : 0.36,
      starCount: Math.floor((p.width * p.height) / (runtime.fullscreen ? 12000 : 14500)),
      dustCount: portrait ? 30 : ultrawide ? 36 : 32,
      emberCount: portrait ? 16 : ultrawide ? 22 : 18,
      shardCount: portrait ? 12 : ultrawide ? 16 : 14,
      ribCount: portrait ? 18 : ultrawide ? 22 : 20,
      laneTilt: portrait ? -0.32 : -0.24,
    };
  }

  function rebuild() {
    readRuntime();
    stars.length = 0;
    dust.length = 0;
    shards.length = 0;
    embers.length = 0;
    const profile = cfg();

    for (let i = 0; i < profile.starCount; i += 1) {
      const streamBias = p.random() < 0.72 ? p.random(0.02, 0.72) : p.random();
      stars.push({
        x: p.width * streamBias,
        y: p.random(p.height),
        z: p.random(0.2, 1),
        size: p.random(1, profile.base * 0.006),
        phase: p.random(p.TWO_PI),
        speed: p.random(0.25, 1.3),
        hue: p.random() > 0.84 ? p.random(28, 42) : p.random(188, 208),
      });
    }

    for (let i = 0; i < profile.dustCount; i += 1) {
      dust.push({
        x: p.random(p.width * 0.06, p.width * 0.9),
        y: p.random(p.height * 0.08, p.height * 0.92),
        r: p.random(profile.base * 0.005, profile.base * 0.018),
        drift: p.random(0.45, 1.2),
        sway: p.random(0.004, 0.012),
        phase: p.random(p.TWO_PI),
        hue: p.random() > 0.8 ? p.random(24, 38) : p.random(194, 214),
        alpha: p.random(6, 20),
      });
    }

    for (let i = 0; i < profile.shardCount; i += 1) {
      const depth = p.random();
      shards.push({
        orbit: mix(profile.base * 0.26, profile.base * 0.72, depth),
        angle: p.random(-1.9, 1.7),
        w: mix(profile.base * 0.012, profile.base * 0.05, depth),
        h: mix(profile.base * 0.03, profile.base * 0.13, depth),
        tilt: p.random(-1.4, 1.4),
        speed: mix(0.003, 0.011, depth) * (p.random() > 0.5 ? 1 : -1),
        hue: p.random() > 0.7 ? p.random(24, 40) : p.random(194, 214),
        alpha: mix(10, 34, depth),
      });
    }

    for (let i = 0; i < profile.emberCount; i += 1) {
      embers.push({
        offset: p.random(-0.22, 0.26),
        along: p.random(0.08, 1.08),
        size: p.random(profile.base * 0.005, profile.base * 0.017),
        hue: p.random(22, 42),
        alpha: p.random(10, 26),
        drift: p.random(0.003, 0.014),
        phase: p.random(p.TWO_PI),
      });
    }
  }

  function wormPoint(cx, cy, rx, ry, angle, wobble, twist) {
    const wave = 1 + wobble * 0.12 * Math.sin(angle * 2 + twist) + wobble * 0.08 * Math.sin(angle * 5 - twist * 0.7);
    const x = Math.cos(angle) * rx * wave;
    const y = Math.sin(angle) * ry * (1 + wobble * 0.07 * Math.cos(angle * 3 + twist * 0.8));
    const skewX = x + y * 0.18;
    const skewY = y + x * -0.04;
    return { x: cx + skewX, y: cy + skewY };
  }

  function drawWarpShape(cx, cy, rx, ry, rotation, wobble, twist) {
    p.beginShape();
    for (let i = 0; i <= 72; i += 1) {
      const angle = (i / 72) * p.TWO_PI;
      const pt = wormPoint(0, 0, rx, ry, angle, wobble, twist);
      const x = pt.x * Math.cos(rotation) - pt.y * Math.sin(rotation);
      const y = pt.x * Math.sin(rotation) + pt.y * Math.cos(rotation);
      p.vertex(cx + x, cy + y);
    }
    p.endShape(p.CLOSE);
  }

  function drawBackground() {
    for (let y = 0; y < p.height; y += 2) {
      const t = y / Math.max(1, p.height - 1);
      const hue = t < 0.52 ? mix(228, 246, t / 0.52) : mix(246, 280, (t - 0.52) / 0.48);
      const sat = t < 0.5 ? mix(56, 70, t / 0.5) : mix(70, 36, (t - 0.5) / 0.5);
      const bri = t < 0.58 ? mix(4, 15, t / 0.58) : mix(15, 8, (t - 0.58) / 0.42);
      p.stroke(hue, sat, bri, 100);
      p.line(0, y, p.width, y);
    }

    p.noStroke();
    const profile = cfg();
    for (let i = 0; i < 6; i += 1) {
      const x = p.width * mix(0.12, 0.84, i / 5);
      const y = p.height * (0.18 + i * 0.08);
      p.fill(198 + i * 2, 30, 52, 3 + i * 0.8);
      p.ellipse(x, y, profile.base * 0.42, profile.base * 0.11);
    }

    for (let i = 0; i < 5; i += 1) {
      const x = p.width * (0.58 + i * 0.08);
      const y = p.height * (0.2 + i * 0.07);
      p.fill(284 + i * 2, 34, 62, 3 + i * 0.9);
      p.ellipse(x, y, profile.base * 0.3, profile.base * 0.09);
    }
  }

  function drawSpaceCurrent(vx, vy) {
    p.noFill();
    for (let i = 0; i < 9; i += 1) {
      const t = i / 8;
      const x1 = p.width * mix(0.02, 0.4, t);
      const y1 = p.height * mix(0.2, 0.84, t);
      const x2 = mix(x1, vx, 0.78);
      const y2 = mix(y1, vy, 0.78);
      const cx1 = mix(x1, vx, 0.28) + p.width * 0.06;
      const cy1 = mix(y1, vy, 0.18) + p.height * (-0.04 + t * 0.03);
      const cx2 = mix(x1, vx, 0.66) - p.width * 0.02;
      const cy2 = mix(y1, vy, 0.74) + p.height * (0.03 - t * 0.05);
      p.stroke(196 + t * 12, 42, 100, 7 + (1 - t) * 5);
      p.strokeWeight(cfg().base * mix(0.003, 0.013, 1 - t));
      p.bezier(x1, y1, cx1, cy1, cx2, cy2, x2, y2);
      p.stroke(30 + t * 4, 58, 100, 2 + (1 - t) * 2.5);
      p.strokeWeight(cfg().base * mix(0.001, 0.006, 1 - t));
      p.bezier(x1, y1 + cfg().base * 0.012, cx1, cy1, cx2, cy2, x2, y2 + cfg().base * 0.01);
    }
  }

  function drawBacklight(cx, cy, mouthRadius, mouthHeight, rotation) {
    p.noStroke();
    for (let i = 0; i < 7; i += 1) {
      const t = i / 6;
      p.fill(196 + i * 2, 38, 100, 2.5 + (1 - t) * 4.5);
      drawWarpShape(cx - mouthRadius * 0.12, cy - mouthHeight * 0.03, mouthRadius * mix(1.5, 1.02, t), mouthHeight * mix(1.35, 0.96, t), rotation, 0.86, p.frameCount * 0.015 + i * 0.4);
    }
    for (let i = 0; i < 5; i += 1) {
      const t = i / 4;
      p.fill(28 + i * 2, 68, 100, 1.8 + (1 - t) * 3.4);
      drawWarpShape(cx - mouthRadius * 0.08, cy + mouthHeight * 0.01, mouthRadius * mix(1.28, 0.92, t), mouthHeight * mix(1.08, 0.84, t), rotation, 0.76, p.frameCount * 0.012 + i * 0.5);
    }
  }

  function drawStars(vx, vy, mouthRadius) {
    p.noStroke();
    for (const star of stars) {
      const dx = vx - star.x;
      const dy = vy - star.y;
      const dist = Math.hypot(dx, dy);
      const pull = clamp01(1 - dist / (mouthRadius * 5.2));
      const drift = p.frameCount * 0.0026 * star.speed * (0.35 + star.z * 0.8);
      const x = star.x + dx * pull * 0.12 + Math.cos(star.phase + drift) * star.size * 0.7;
      const y = star.y + dy * pull * 0.12 + Math.sin(star.phase * 0.7 + drift) * star.size * 0.5;
      const twinkle = 0.35 + 0.65 * Math.sin(p.frameCount * 0.02 * star.speed + star.phase);
      const streak = pull > 0.18 ? mix(1.2, 8.4, pull * star.z) : 1;
      p.push();
      p.translate(x, y);
      p.rotate(Math.atan2(dy, dx));
      p.fill(star.hue, star.hue < 60 ? 72 : 26 + star.z * 34, 86 + twinkle * 14, 12 + star.z * 34 * twinkle);
      p.ellipse(0, 0, star.size * streak, star.size * (0.8 + (1 - pull) * 0.3));
      if (pull > 0.26) {
        p.fill(star.hue < 60 ? 36 : 196, 18, 100, 4 + pull * 10);
        p.ellipse(-star.size * streak * 0.75, 0, star.size * streak * 2.8, star.size * 0.8);
      }
      p.pop();
    }
  }

  function drawDust(vx, vy, mouthRadius) {
    p.noStroke();
    for (const mote of dust) {
      const dx = vx - mote.x;
      const dy = vy - mote.y;
      const dist = Math.hypot(dx, dy);
      const pull = clamp01(1 - dist / (mouthRadius * 3.8));
      const wobble = 0.45 + 0.55 * Math.sin(p.frameCount * mote.sway * 42 + mote.phase);
      const x = mote.x + Math.sin(p.frameCount * 0.014 * mote.drift + mote.phase) * mote.r * 5 + dx * pull * 0.08;
      const y = mote.y + Math.cos(p.frameCount * 0.01 * mote.drift + mote.phase) * mote.r * 2.4 + dy * pull * 0.08;
      p.fill(mote.hue, mote.hue < 60 ? 68 : 34, 100, mote.alpha * wobble);
      p.circle(x, y, mote.r * (0.8 + wobble * 0.85));
      if (pull > 0.24) {
        p.fill(196, 20, 100, pull * 7);
        p.ellipse(x, y, mote.r * (3 + pull * 6), mote.r * (0.8 + pull * 1.1));
      }
    }
  }

  function drawShards(cx, cy, mouthRadius, rotation) {
    p.noStroke();
    for (let i = 0; i < shards.length; i += 1) {
      const shard = shards[i];
      const angle = shard.angle + p.frameCount * shard.speed;
      const orbitX = Math.cos(angle) * shard.orbit * 1.1;
      const orbitY = Math.sin(angle) * shard.orbit * 0.48;
      const x = cx + orbitX * Math.cos(rotation) - orbitY * Math.sin(rotation);
      const y = cy + orbitX * Math.sin(rotation) + orbitY * Math.cos(rotation);
      const trail = 0.5 + 0.5 * Math.sin(p.frameCount * 0.018 + i * 0.8);
      p.push();
      p.translate(x, y);
      p.rotate(rotation + shard.tilt + angle * 0.45);
      p.fill(shard.hue, shard.hue < 60 ? 74 : 28, 100, shard.alpha * trail * 0.8);
      p.quad(-shard.w * 0.6, 0, 0, -shard.h * 0.5, shard.w, 0, 0, shard.h * 0.38);
      p.fill(196, 26, 100, shard.alpha * 0.16);
      p.quad(-shard.w * 0.18, 0, 0, -shard.h * 0.2, shard.w * 0.4, 0, 0, shard.h * 0.16);
      p.pop();
    }
  }

  function drawEmberLane(vx, vy, mx, my) {
    p.noStroke();
    for (const ember of embers) {
      const drift = Math.sin(p.frameCount * ember.drift + ember.phase) * 0.05;
      const t = ember.along + drift;
      const x = mix(vx, mx, t) + (my - vy) * ember.offset;
      const y = mix(vy, my, t) - (mx - vx) * ember.offset * 0.28;
      const glow = 0.55 + 0.45 * Math.sin(p.frameCount * 0.02 + ember.phase);
      p.fill(ember.hue, 72, 100, ember.alpha * glow);
      p.circle(x, y, ember.size * (0.8 + glow));
      p.fill(ember.hue, 28, 100, ember.alpha * 0.18);
      p.ellipse(x, y, ember.size * 4.8, ember.size * 1.4);
    }
  }

  function drawTunnel(cx, cy, vx, vy, mouthRadius, mouthHeight, rotation) {
    const profile = cfg();
    for (let i = profile.ribCount; i >= 1; i -= 1) {
      const t = i / profile.ribCount;
      const depth = smooth(1 - t);
      const x = mix(cx, vx, depth * 0.98);
      const y = mix(cy, vy, depth * 0.98);
      const rx = mix(mouthRadius * 1.18, mouthRadius * 0.11, depth);
      const ry = mix(mouthHeight * 1.1, mouthHeight * 0.12, depth);
      const wobble = mix(0.8, 0.18, depth);
      const twist = p.frameCount * 0.018 + i * 0.34;

      p.noStroke();
      p.fill(258 + depth * 20, 24, mix(9, 2, depth), 72);
      drawWarpShape(x, y, rx * 1.06, ry * 1.08, rotation, wobble, twist);

      p.fill(236 + depth * 16, 18, mix(7, 1, depth), 92);
      drawWarpShape(x, y, rx * 0.9, ry * 0.9, rotation, wobble * 0.72, twist + 0.4);

      if (i < profile.ribCount - 1) {
        p.fill(196 + depth * 6, 58, 100, mix(2, 16, 1 - depth));
        drawWarpShape(x, y, rx * 0.98, ry * 0.98, rotation, wobble, twist);
      }
    }

    for (let i = 0; i < 5; i += 1) {
      const glow = 1 + 0.03 * Math.sin(p.frameCount * 0.02 + i);
      p.noFill();
      p.stroke(i < 3 ? 196 : 32, i < 3 ? 54 : 66, 100, 12 + i * 4);
      p.strokeWeight(mouthRadius * (0.012 - i * 0.0016));
      drawWarpShape(cx, cy, mouthRadius * (1.14 + i * 0.03) * glow, mouthHeight * (1.1 + i * 0.03) * glow, rotation, 0.88, p.frameCount * 0.02 + i * 0.5);
    }

    p.noStroke();
    p.fill(202, 38, 42, 12);
    drawWarpShape(cx - mouthRadius * 0.04, cy, mouthRadius * 0.92, mouthHeight * 0.86, rotation, 0.62, p.frameCount * 0.018);
    p.fill(0, 0, 0, 100);
    drawWarpShape(cx, cy, mouthRadius * 0.74, mouthHeight * 0.72, rotation, 0.58, p.frameCount * 0.018);

    for (let i = 6; i >= 1; i -= 1) {
      const pulse = 1 + 0.04 * Math.sin(p.frameCount * 0.028 + i * 0.6);
      p.fill(198 + i * 2, 46, 100, 3 + i * 1.9);
      drawWarpShape(vx, vy, mouthRadius * mix(0.34, 0.08, i / 6) * pulse, mouthHeight * mix(0.28, 0.06, i / 6) * pulse, rotation, 0.22, p.frameCount * 0.03 + i);
      p.fill(30 + i, 72, 100, 2 + i * 1.4);
      drawWarpShape(vx - mouthRadius * 0.02, vy, mouthRadius * mix(0.18, 0.05, i / 6) * pulse, mouthHeight * mix(0.12, 0.04, i / 6) * pulse, rotation, 0.2, p.frameCount * 0.025 + i * 0.7);
    }
  }

  function drawMouthVeils(cx, cy, mouthRadius, mouthHeight, rotation) {
    p.noFill();
    for (let i = 0; i < 7; i += 1) {
      const t = i / 6;
      const alpha = mix(16, 4, t);
      const r1 = mouthRadius * mix(0.96, 1.38, t);
      const r2 = mouthHeight * mix(0.6, 1.22, t);
      p.push();
      p.translate(cx, cy);
      p.rotate(rotation + mix(-0.28, 0.22, t));
      p.stroke(t < 0.6 ? 196 : 286, 32, 100, alpha);
      p.strokeWeight(mouthRadius * mix(0.013, 0.003, t));
      p.arc(0, 0, r1 * 2, r2 * 2, -2.45, 0.7);
      p.pop();
    }
  }

  function drawForegroundShadow(vx, vy) {
    p.noStroke();
    p.fill(236, 18, 6, 62);
    p.quad(0, p.height, 0, p.height * 0.8, p.width * 0.22, p.height * 0.83, p.width * 0.34, p.height);
    p.quad(p.width, p.height, p.width * 0.9, p.height * 0.78, p.width * 0.72, p.height * 0.72, p.width, p.height * 0.64);

    for (let i = 0; i < 5; i += 1) {
      const x = mix(0.12, 0.76, i / 4) * p.width;
      const y = p.height * (0.84 + 0.015 * Math.sin(i));
      p.fill(250 + i * 3, 18, 18, 8);
      p.ellipse(x, y, cfg().base * 0.4, cfg().base * 0.05);
    }

    p.fill(26, 58, 50, 5);
    p.ellipse(vx - cfg().base * 0.06, p.height * 0.82, cfg().base * 0.26, cfg().base * 0.06);
  }

  function drawVignette() {
    const radius = Math.hypot(p.width, p.height) * 0.74;
    p.noFill();
    for (let i = 0; i < 18; i += 1) {
      const t = i / 17;
      p.stroke(0, 0, 0, 1.7 + t * 4.7);
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
    const mouthRadius = profile.base * profile.mouthScale;
    const mouthHeight = mouthRadius * 0.78;
    const cx = p.width * profile.heroX;
    const cy = p.height * profile.heroY;
    const vx = p.width * profile.vanishX;
    const vy = p.height * profile.vanishY;
    const rotation = profile.laneTilt + 0.03 * Math.sin(p.frameCount * 0.01);
    const midX = mix(vx, cx, 0.58);
    const midY = mix(vy, cy, 0.58);

    drawBackground();
    drawSpaceCurrent(vx, vy);
    drawStars(vx, vy, mouthRadius);
    drawDust(vx, vy, mouthRadius);
    drawEmberLane(vx, vy, midX, midY);
    drawBacklight(cx, cy, mouthRadius, mouthHeight, rotation);
    drawTunnel(cx, cy, vx, vy, mouthRadius, mouthHeight, rotation);
    drawMouthVeils(cx, cy, mouthRadius, mouthHeight, rotation);
    drawShards(cx, cy, mouthRadius, rotation);
    drawForegroundShadow(vx, vy);
    drawVignette();
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    rebuild();
  };
}
