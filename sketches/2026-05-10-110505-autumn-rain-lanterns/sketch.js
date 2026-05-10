export default function sketch(p) {
  const rain = [];
  const leaves = [];
  const hazeBands = [];

  const prompt = 'rainy autumn twilight with lantern reflections, drifting leaves, and a calm amber glow';

  function hash(value) {
    const raw = Math.sin(value * 12.9898 + 78.233) * 43758.5453;
    return raw - Math.floor(raw);
  }

  function gradientBackground() {
    const top = p.color(216, 44, 13);
    const middle = p.color(228, 34, 21);
    const bottom = p.color(28, 68, 12);

    for (let y = 0; y < p.height; y += 3) {
      const blend = y / Math.max(1, p.height - 1);
      const firstMix = p.lerpColor(top, middle, Math.min(1, blend * 1.4));
      const shade = p.lerpColor(firstMix, bottom, Math.max(0, blend - 0.35) / 0.65);
      p.stroke(shade);
      p.line(0, y, p.width, y);
    }
  }

  function rebuildScene() {
    rain.length = 0;
    leaves.length = 0;
    hazeBands.length = 0;

    const area = p.width * p.height;
    const rainCount = Math.max(180, Math.floor(area / 7200));
    const leafCount = Math.max(14, Math.floor(area / 85000));
    const hazeCount = 8;

    for (let index = 0; index < rainCount; index += 1) {
      const seed = index + 1;
      rain.push({
        x: hash(seed * 1.37) * p.width,
        y: hash(seed * 2.11) * p.height,
        length: 18 + hash(seed * 3.07) * 34,
        speed: 9 + hash(seed * 4.19) * 10,
        drift: 4 + hash(seed * 5.03) * 10,
        alpha: 18 + hash(seed * 6.31) * 30,
        weight: 0.7 + hash(seed * 7.17) * 1.3,
      });
    }

    for (let index = 0; index < leafCount; index += 1) {
      const seed = index + 1;
      leaves.push({
        x: hash(seed * 8.21) * p.width,
        y: hash(seed * 9.41) * p.height,
        size: 20 + hash(seed * 10.13) * 28,
        fallSpeed: 0.35 + hash(seed * 11.71) * 0.8,
        swing: 20 + hash(seed * 12.19) * 50,
        rotation: hash(seed * 13.37) * p.TWO_PI,
        spin: -0.008 + hash(seed * 14.23) * 0.016,
        hue: 18 + hash(seed * 15.77) * 28,
        saturation: 62 + hash(seed * 16.43) * 28,
        brightness: 56 + hash(seed * 17.51) * 26,
        phase: hash(seed * 18.67) * p.TWO_PI,
      });
    }

    for (let index = 0; index < hazeCount; index += 1) {
      const seed = index + 1;
      hazeBands.push({
        y: p.height * (0.14 + index * 0.1),
        height: 70 + hash(seed * 19.31) * 90,
        speed: 0.0015 + hash(seed * 20.47) * 0.003,
        amplitude: 18 + hash(seed * 21.53) * 26,
        alpha: 5 + hash(seed * 22.61) * 9,
        phase: hash(seed * 23.97) * p.TWO_PI,
      });
    }
  }

  function drawHaze() {
    p.noStroke();
    for (const band of hazeBands) {
      const offset = Math.sin(p.frameCount * band.speed + band.phase) * band.amplitude;
      p.fill(32, 20, 92, band.alpha);
      p.ellipse(p.width * 0.52 + offset, band.y, p.width * 0.9, band.height);
    }
  }

  function drawLanternGlow() {
    const glowX = p.width * 0.76;
    const glowY = p.height * 0.28;

    p.noStroke();
    for (let ring = 7; ring >= 1; ring -= 1) {
      const radius = ring * Math.min(p.width, p.height) * 0.06;
      p.fill(34, 74, 96, 3 + ring);
      p.circle(glowX, glowY, radius * 2.4);
    }

    p.fill(34, 82, 98, 80);
    p.circle(glowX, glowY, Math.min(p.width, p.height) * 0.1);

    p.fill(34, 50, 100, 12);
    p.quad(
      glowX - 26,
      glowY + 16,
      glowX + 24,
      glowY + 16,
      glowX + p.width * 0.1,
      p.height,
      glowX - p.width * 0.02,
      p.height,
    );
  }

  function drawRain() {
    p.strokeCap(p.ROUND);
    for (const drop of rain) {
      const gust = Math.sin(p.frameCount * 0.02 + drop.x * 0.01) * 4;
      p.stroke(210, 16, 100, drop.alpha);
      p.strokeWeight(drop.weight);
      p.line(drop.x, drop.y, drop.x - drop.drift - gust, drop.y + drop.length);

      drop.x += Math.sin(p.frameCount * 0.01 + drop.y * 0.03) * 0.25;
      drop.y += drop.speed;

      if (drop.y - drop.length > p.height) {
        drop.y = -drop.length;
        drop.x = hash(drop.x * 0.017 + drop.speed * 3.1 + p.frameCount * 0.001) * p.width;
      }
      if (drop.x < -40) drop.x += p.width + 80;
      if (drop.x > p.width + 40) drop.x -= p.width + 80;
    }
  }

  function drawLeafBody(size) {
    p.beginShape();
    p.vertex(0, -size * 0.55);
    p.bezierVertex(size * 0.4, -size * 0.46, size * 0.56, -size * 0.08, 0, size * 0.62);
    p.bezierVertex(-size * 0.56, -size * 0.08, -size * 0.4, -size * 0.46, 0, -size * 0.55);
    p.endShape(p.CLOSE);
  }

  function drawLeaves() {
    for (const leaf of leaves) {
      const sway = Math.sin(p.frameCount * 0.012 + leaf.phase) * leaf.swing;
      const bob = Math.cos(p.frameCount * 0.017 + leaf.phase * 0.7) * 6;

      p.push();
      p.translate(leaf.x + sway, leaf.y + bob);
      p.rotate(leaf.rotation);
      p.noStroke();
      p.fill(leaf.hue, leaf.saturation, leaf.brightness, 72);
      drawLeafBody(leaf.size);
      p.fill(leaf.hue + 8, Math.max(18, leaf.saturation - 18), Math.min(100, leaf.brightness + 18), 24);
      p.ellipse(0, -leaf.size * 0.08, leaf.size * 0.42, leaf.size * 0.82);
      p.stroke(40, 40, 92, 34);
      p.strokeWeight(1.1);
      p.line(0, -leaf.size * 0.45, 0, leaf.size * 0.5);
      p.line(0, -leaf.size * 0.05, leaf.size * 0.18, leaf.size * 0.12);
      p.line(0, 0, -leaf.size * 0.18, leaf.size * 0.16);
      p.pop();

      leaf.y += leaf.fallSpeed;
      leaf.x += Math.sin(p.frameCount * 0.008 + leaf.phase) * 0.32;
      leaf.rotation += leaf.spin;

      if (leaf.y - leaf.size > p.height + 40) {
        leaf.y = -leaf.size - hash(leaf.phase * 3.7 + p.frameCount * 0.01) * 120;
        leaf.x = hash(leaf.rotation * 9.1 + leaf.size) * p.width;
      }
      if (leaf.x < -80) leaf.x += p.width + 160;
      if (leaf.x > p.width + 80) leaf.x -= p.width + 160;
    }
  }

  function drawWindowReflections() {
    p.noFill();
    p.strokeWeight(1);
    for (let index = 1; index <= 3; index += 1) {
      const x = (p.width / 4) * index;
      p.stroke(205, 12, 96, 10);
      p.line(x, 0, x, p.height);
    }

    p.stroke(205, 10, 100, 8);
    for (let row = 1; row <= 2; row += 1) {
      const y = (p.height / 3) * row;
      p.line(0, y, p.width, y);
    }

    for (let index = 0; index < 20; index += 1) {
      const x = (index / 19) * p.width;
      const y = p.height * (0.72 + 0.06 * Math.sin(index + p.frameCount * 0.01));
      p.stroke(34, 42, 100, 5);
      p.line(x - 16, y, x + 30, y + 28);
    }
  }

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.pixelDensity(1);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.noiseDetail(4, 0.45);
    rebuildScene();
  };

  p.draw = () => {
    gradientBackground();
    drawHaze();
    drawLanternGlow();
    drawRain();
    drawLeaves();
    drawWindowReflections();

    p.noStroke();
    p.fill(30, 38, 8, 10);
    p.rect(0, 0, p.width, p.height);

    p.fill(34, 18, 96, 6);
    p.textSize(12);
    p.textAlign(p.RIGHT, p.BOTTOM);
    p.text(prompt, p.width - 16, p.height - 12);
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    rebuildScene();
  };
}
