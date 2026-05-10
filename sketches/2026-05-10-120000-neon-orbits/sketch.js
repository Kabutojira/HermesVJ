export default function sketch(p) {
  const orbitCount = 7;
  const stars = Array.from({ length: 180 }, () => ({
    x: Math.random(),
    y: Math.random(),
    z: 0.3 + Math.random() * 0.7,
  }));

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.pixelDensity(1);
    p.noFill();
    p.strokeCap(p.ROUND);
  };

  p.draw = () => {
    p.background(4, 6, 16, 42);
    p.push();
    p.translate(p.width / 2, p.height / 2);

    for (const star of stars) {
      p.stroke(120, 180, 255, 180 * star.z);
      p.strokeWeight(1.4 * star.z);
      p.point((star.x - 0.5) * p.width, (star.y - 0.5) * p.height);
    }

    for (let index = 0; index < orbitCount; index += 1) {
      const progress = p.frameCount * 0.006 + index * 0.11;
      const radius = Math.min(p.width, p.height) * (0.11 + index * 0.055);
      const wobble = radius * 0.08;
      const huePhase = 0.6 + 0.4 * Math.sin(progress * 1.3);
      const alpha = 110 + 80 * Math.sin(progress + index);

      p.stroke(60 + index * 20, 200 - index * 12, 255 * huePhase, alpha);
      p.strokeWeight(2 + index * 0.18);
      p.beginShape();
      for (let angle = 0; angle <= p.TWO_PI + 0.1; angle += 0.07) {
        const noise = Math.sin(angle * 3 + progress * 4) * wobble;
        const x = Math.cos(angle + progress) * (radius + noise);
        const y = Math.sin(angle - progress * 0.7) * (radius + noise * 0.7);
        p.vertex(x, y);
      }
      p.endShape();

      const orbAngle = progress * (1.2 + index * 0.08);
      const orbRadius = radius + Math.sin(progress * 2.4) * wobble;
      const orbX = Math.cos(orbAngle) * orbRadius;
      const orbY = Math.sin(orbAngle) * orbRadius;
      p.noStroke();
      p.fill(140 + index * 10, 160, 255, 180);
      p.circle(orbX, orbY, 10 + index * 2.2);
      p.noFill();
    }

    p.pop();
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
}
