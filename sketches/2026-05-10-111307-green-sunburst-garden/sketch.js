export default function sketch(p) {
  const arcs = [];
  const sparks = [];
  const petals = [];

  function remap(value, inMin, inMax, outMin, outMax) {
    return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
  }

  function rebuild() {
    arcs.length = 0;
    sparks.length = 0;
    petals.length = 0;

    const base = Math.min(p.width, p.height);
    const ringCount = 8;
    const sparkCount = Math.max(140, Math.floor((p.width * p.height) / 9000));
    const petalCount = Math.max(26, Math.floor((p.width * p.height) / 50000));

    for (let i = 0; i < ringCount; i += 1) {
      arcs.push({
        radius: base * (0.12 + i * 0.055),
        thickness: 10 + i * 1.4,
        hue: 98 + i * 7,
        brightness: 92 - i * 4,
        speed: 0.003 + i * 0.00055,
        phase: i * 0.83,
        wobble: 12 + i * 4,
      });
    }

    for (let i = 0; i < sparkCount; i += 1) {
      const angle = p.random(p.TWO_PI);
      const radius = base * p.random(0.05, 0.52);
      sparks.push({
        angle,
        radius,
        size: p.random(3, 10),
        speed: p.random(0.004, 0.018),
        orbit: p.random(0.2, 1),
        hue: p.random(100, 145),
        sat: p.random(45, 82),
        bri: p.random(82, 100),
        alpha: p.random(20, 70),
      });
    }

    for (let i = 0; i < petalCount; i += 1) {
      petals.push({
        x: p.random(p.width),
        y: p.random(p.height),
        size: p.random(base * 0.02, base * 0.07),
        drift: p.random(-0.4, 0.4),
        rise: p.random(0.2, 0.75),
        phase: p.random(p.TWO_PI),
        hue: p.random(96, 128),
        sat: p.random(40, 68),
        bri: p.random(75, 95),
      });
    }
  }

  function drawBackground() {
    const top = p.color(142, 48, 16);
    const mid = p.color(128, 46, 28);
    const bottom = p.color(104, 55, 14);

    for (let y = 0; y < p.height; y += 2) {
      const t = y / Math.max(1, p.height - 1);
      const blend = t < 0.55 ? p.lerpColor(top, mid, t / 0.55) : p.lerpColor(mid, bottom, (t - 0.55) / 0.45);
      p.stroke(blend);
      p.line(0, y, p.width, y);
    }

    p.noStroke();
    for (let i = 0; i < 18; i += 1) {
      const x = (i / 17) * p.width;
      const y = p.height * (0.2 + 0.6 * ((i % 5) / 5));
      p.fill(128 + (i % 4) * 4, 40, 100, 4);
      p.circle(x, y, Math.min(p.width, p.height) * 0.22);
    }
  }

  function drawCenterGlow() {
    const cx = p.width * 0.5;
    const cy = p.height * 0.52;
    const glow = Math.min(p.width, p.height) * 0.12;

    p.noStroke();
    for (let i = 7; i >= 1; i -= 1) {
      p.fill(62 + i * 3, 55, 100, 5 + i * 2);
      p.circle(cx, cy, glow * (1.7 + i * 0.38));
    }

    p.fill(72, 35, 100, 60);
    p.circle(cx, cy, glow * 1.45);
  }

  function drawRings() {
    const cx = p.width * 0.5;
    const cy = p.height * 0.52;

    p.noFill();
    p.strokeCap(p.ROUND);
    for (const ring of arcs) {
      p.strokeWeight(ring.thickness);
      p.stroke(ring.hue, 56, ring.brightness, 16);
      p.circle(cx, cy, ring.radius * 2.05);

      p.stroke(ring.hue + 10, 72, 100, 58);
      p.beginShape();
      for (let a = 0; a <= p.TWO_PI + 0.04; a += 0.09) {
        const pulse = Math.sin(p.frameCount * ring.speed * 32 + a * 3 + ring.phase) * ring.wobble;
        const r = ring.radius + pulse;
        p.vertex(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.92);
      }
      p.endShape();
    }
  }

  function drawSparks() {
    const cx = p.width * 0.5;
    const cy = p.height * 0.52;

    p.noStroke();
    for (const spark of sparks) {
      const angle = spark.angle + p.frameCount * spark.speed;
      const bob = Math.sin(p.frameCount * spark.speed * 18 + spark.radius * 0.02) * 10;
      const x = cx + Math.cos(angle * spark.orbit) * (spark.radius + bob);
      const y = cy + Math.sin(angle) * (spark.radius * 0.72 + bob);
      const twinkle = 0.55 + 0.45 * Math.sin(p.frameCount * spark.speed * 30 + spark.radius);

      p.fill(spark.hue, spark.sat, spark.bri, spark.alpha * twinkle);
      p.circle(x, y, spark.size * (0.85 + twinkle * 0.6));
    }
  }

  function leafShape(size) {
    p.beginShape();
    p.vertex(0, -size * 0.52);
    p.bezierVertex(size * 0.35, -size * 0.42, size * 0.56, 0, 0, size * 0.64);
    p.bezierVertex(-size * 0.56, 0, -size * 0.35, -size * 0.42, 0, -size * 0.52);
    p.endShape(p.CLOSE);
  }

  function drawPetals() {
    for (const petal of petals) {
      const wave = Math.sin(p.frameCount * 0.02 + petal.phase) * petal.size * 0.35;
      const sway = Math.cos(p.frameCount * 0.013 + petal.phase * 1.7) * 18;

      p.push();
      p.translate(petal.x + sway, petal.y + wave);
      p.rotate(Math.sin(p.frameCount * 0.01 + petal.phase) * 0.6);
      p.noStroke();
      p.fill(petal.hue, petal.sat, petal.bri, 20);
      leafShape(petal.size);
      p.fill(petal.hue - 8, Math.max(10, petal.sat - 18), 100, 10);
      p.ellipse(0, -petal.size * 0.08, petal.size * 0.35, petal.size * 0.7);
      p.pop();

      petal.y -= petal.rise;
      petal.x += petal.drift + Math.sin(p.frameCount * 0.01 + petal.phase) * 0.2;

      if (petal.y < -petal.size - 40) {
        petal.y = p.height + petal.size + p.random(20, 120);
        petal.x = p.random(p.width);
      }
      if (petal.x < -80) petal.x += p.width + 160;
      if (petal.x > p.width + 80) petal.x -= p.width + 160;
    }
  }

  function drawSmileBurst() {
    const cx = p.width * 0.5;
    const cy = p.height * 0.52;
    const spokes = 18;

    p.strokeCap(p.ROUND);
    for (let i = 0; i < spokes; i += 1) {
      const angle = (i / spokes) * p.TWO_PI + p.frameCount * 0.0025;
      const inner = Math.min(p.width, p.height) * 0.1;
      const outer = inner + 40 + 12 * Math.sin(p.frameCount * 0.03 + i);
      const hue = remap(i, 0, spokes - 1, 84, 146);
      p.stroke(hue, 72, 100, 24);
      p.strokeWeight(4 + 1.5 * Math.sin(p.frameCount * 0.02 + i));
      p.line(
        cx + Math.cos(angle) * inner,
        cy + Math.sin(angle) * inner,
        cx + Math.cos(angle) * outer,
        cy + Math.sin(angle) * outer,
      );
    }
  }

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.pixelDensity(1);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.randomSeed(27451);
    p.noiseSeed(27451);
    rebuild();
  };

  p.draw = () => {
    drawBackground();
    drawCenterGlow();
    drawSmileBurst();
    drawRings();
    drawSparks();
    drawPetals();

    p.noStroke();
    p.fill(110, 30, 100, 4);
    p.rect(0, 0, p.width, p.height);
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    rebuild();
  };
}
