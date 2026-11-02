import * as THREE from "three";
// Deterministic procedural surfaces: assets are generated locally, not downloaded.
export function random(seed = 42) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
export function surface(kind, repeat = 1) {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const x = c.getContext("2d"),
    rnd = random(827);
  const colors = {
    soil: "#77715a",
    grass: "#697548",
    ballast: "#777571",
    concrete: "#a2a297",
    metal: "#4d6657",
    brick: "#9a715c",
    roof: "#7c8582",
  };
  x.fillStyle = colors[kind] || "#78816b";
  x.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 22000; i++) {
    const a = rnd(),
      v = Math.floor(45 + rnd() * 125);
    x.fillStyle = `rgba(${v},${v + 5},${v - 10},${0.1 + rnd() * 0.3})`;
    if (kind === "ballast") {
      x.beginPath();
      x.ellipse(
        rnd() * 512,
        rnd() * 512,
        1 + rnd() * 5,
        1 + rnd() * 3,
        rnd() * 6,
        0,
        7,
      );
      x.fill();
    } else
      x.fillRect(
        rnd() * 512,
        rnd() * 512,
        kind === "grass" ? 1 : 1 + rnd() * 6,
        kind === "grass" ? 3 + rnd() * 8 : 1 + rnd() * 3,
      );
  }
  if (kind === "brick") {
    x.strokeStyle = "#c4b49d";
    x.lineWidth = 3;
    for (let y = 0; y < 512; y += 32) {
      x.beginPath();
      x.moveTo(0, y);
      x.lineTo(512, y);
      x.stroke();
      for (let xx = ((y / 32) % 2) * 32; xx < 512; xx += 64) {
        x.beginPath();
        x.moveTo(xx, y);
        x.lineTo(xx, y + 32);
        x.stroke();
      }
    }
  }
  if (kind === "roof") {
    for (let k = 0; k < 512; k += 12) {
      x.fillStyle = "#ffffff20";
      x.fillRect(k, 0, 3, 512);
      x.fillStyle = "#152d2a40";
      x.fillRect(k + 4, 0, 3, 512);
    }
  }
  if (kind === "metal") {
    for (let i = 0; i < 50; i++) {
      x.fillStyle = "#4e34251b";
      x.fillRect(rnd() * 512, rnd() * 512, 1 + rnd() * 4, 50 + rnd() * 150);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  return tex;
}
export function treeTexture(palm = false) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 768;
  const x = c.getContext("2d"),
    r = random(palm ? 84 : 39);
  x.clearRect(0, 0, 512, 768);
  x.strokeStyle = "#716251";
  x.lineCap = "round";
  x.lineWidth = 22;
  x.beginPath();
  x.moveTo(251, 765);
  x.quadraticCurveTo(265, 530, 249, 250);
  x.stroke();
  if (palm) {
    for (let j = 0; j < 12; j++) {
      const a = (j / 12) * Math.PI * 2;
      const ex = 256 + Math.cos(a) * 240,
        ey = 230 + Math.sin(a) * 100;
      x.strokeStyle = "#465638";
      x.lineWidth = 8;
      x.beginPath();
      x.moveTo(251, 260);
      x.quadraticCurveTo((ex + 251) / 2, ey - 100, ex, ey);
      x.stroke();
      for (let k = 0; k < 18; k++) {
        const t = k / 18,
          px = 251 + (ex - 251) * t,
          py = 260 + (ey - 260) * t - Math.sin(t * Math.PI) * 58;
        x.strokeStyle = ["#52643c", "#617048", "#384e35"][k % 3];
        x.lineWidth = 3;
        x.beginPath();
        x.moveTo(px, py);
        x.lineTo(px + Math.cos(a + 1) * 55 * (1 - t), py + 35);
        x.stroke();
      }
    }
  } else {
    for (let j = 0; j < 19; j++) {
      const ex = 35 + r() * 440,
        ey = 100 + r() * 350;
      x.strokeStyle = "#6e624e";
      x.lineWidth = 3 + r() * 7;
      x.beginPath();
      x.moveTo(252, 580);
      x.lineTo(ex, ey);
      x.stroke();
    }
    for (let i = 0; i < 6500; i++) {
      const a = r() * Math.PI * 2,
        rad = Math.sqrt(r()),
        px = 256 + Math.cos(a) * 210 * rad,
        py = 280 + Math.sin(a) * 230 * rad;
      if (py > 430 && Math.abs(px - 256) > 130) continue;
      x.fillStyle = [
        "#334531",
        "#48573b",
        "#5d6946",
        "#6e7850",
        "#7a8156",
        "#415039",
      ][Math.floor(r() * 6)];
      x.beginPath();
      x.ellipse(px, py, 3 + r() * 8, 2 + r() * 5, r() * 5, 0, 7);
      x.fill();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
export function createKit() {
  const textures = {};
  for (const k of [
    "grass",
    "soil",
    "ballast",
    "concrete",
    "metal",
    "brick",
    "roof",
  ])
    textures[k] = surface(k);
  textures.grass.repeat.set(80, 80);
  textures.soil.repeat.set(2, 12);
  const mats = {};
  const get = (c, metal = 0) =>
    (mats[c + metal] ||= new THREE.MeshStandardMaterial({
      color: c,
      roughness: metal ? 0.38 : 0.86,
      metalness: metal,
    }));
  const textureMats = {};
  const textured = (k, color = "#ffffff", roughness = 0.9) =>
    (textureMats[k + color + roughness] ||= new THREE.MeshStandardMaterial({
      color,
      map: textures[k],
      bumpMap: textures[k],
      bumpScale: k === "ballast" ? 0.07 : 0.018,
      roughness,
    }));
  const make = (geo, m, x, y, z, parent) => {
    const o = new THREE.Mesh(geo, typeof m === "string" ? get(m) : m);
    o.position.set(x, y, z);
    o.castShadow = true;
    o.receiveShadow = true;
    parent.add(o);
    return o;
  };
  const box = (w, h, d, m, x, y, z, parent) =>
    make(new THREE.BoxGeometry(w, h, d), m, x, y, z, parent);
  const cyl = (r1, r2, h, m, x, y, z, parent, n = 12) =>
    make(new THREE.CylinderGeometry(r1, r2, h, n), m, x, y, z, parent);
  return { textures, mats, get, textured, make, box, cyl };
}
export function sign(text, bn, w = 6) {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 256;
  let x = c.getContext("2d");
  x.fillStyle = "#103d30";
  x.fillRect(0, 0, 1024, 256);
  x.strokeStyle = "#e7d5a5";
  x.lineWidth = 8;
  x.strokeRect(10, 10, 1004, 236);
  x.fillStyle = "#efe6cf";
  x.textAlign = "center";
  x.font = "bold 72px Arial";
  x.fillText(bn, 512, 105);
  x.font = "48px Arial";
  x.fillText(text.toUpperCase(), 512, 187);
  let t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(
    new THREE.PlaneGeometry(w, w / 4),
    new THREE.MeshStandardMaterial({
      map: t,
      side: THREE.DoubleSide,
      roughness: 0.8,
    }),
  );
}
