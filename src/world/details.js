import * as THREE from "three";
import { sign } from "./materials.js";
import { trackX } from "../game.js";
import { batchStatic } from "./optimize.js";
export function stationDetails(g, key, kit) {
  const { box, cyl, get } = kit;
  // Inspired silhouettes, not surveyed architectural replicas.
  if (key === "dhaka") {
    for (let z = -54; z < 0; z += 18) {
      const roof = new THREE.PlaneGeometry(17, 17, 10, 10);
      roof.rotateX(-Math.PI / 2);
      const a = roof.attributes.position;
      for (let j = 0; j < a.count; j++)
        a.setY(j, 0.022 * (a.getX(j) ** 2 + a.getZ(j) ** 2));
      roof.computeVertexNormals();
      const m = new THREE.Mesh(
        roof,
        new THREE.MeshStandardMaterial({
          color: "#d5d3c1",
          side: THREE.DoubleSide,
          roughness: 0.85,
        }),
      );
      m.position.set(22, 7, z);
      g.add(m);
      cyl(0.32, 0.55, 7, "#acae9d", 22, 3.5, z, g, 10);
    }
  } else if (key === "chattogram") {
    box(13, 6, 20, "#d4c8ae", 21, 2.7, -9, g);
    for (let z = -17; z < 1; z += 3) {
      box(0.1, 2, 1.5, "#3c625c", 14.4, 3.1, z, g);
      box(0.4, 6, 0.4, "#eee1c6", 14, 2.7, z, g);
    }
    box(3, 9, 3, "#ba9d78", 17, 4.2, 5, g);
  } else if (key === "cox") {
    box(14, 4, 40, "#b7c4bc", 22, 1.8, -22, g);
    for (let j = 0; j < 9; j++) {
      let roof = box(
        15,
        0.25,
        5,
        "#ebe4ce",
        22,
        6 + Math.sin(j * 0.65) * 1.3,
        -42 + j * 5,
        g,
      );
      roof.rotation.x = Math.cos(j * 0.65) * 0.22;
      box(0.2, 5, 0.2, "#9ca99f", 15, 2.6, -42 + j * 5, g);
    }
    box(0.12, 3, 36, "#507a83", 14.8, 2.3, -22, g);
  }
  const shop = new THREE.Group();
  shop.position.set(10, 0.65, -40);
  g.add(shop);
  box(3, 2.3, 3, "#a07d56", 0, 1.1, 0, shop);
  box(3.4, 0.15, 3.4, "#64766a", 0, 2.4, 0, shop);
  box(2.5, 0.75, 0.15, "#293c32", 0, 1.3, -1.54, shop);
  let board = sign("TEA & SNACKS", "চা • নাশতা", 2.7);
  board.position.set(0, 2, -1.6);
  shop.add(board);
  for (let j = 0; j < 4; j++)
    cyl(0.07, 0.06, 0.16, "#e2d7bb", -0.7 + j * 0.35, 1.0, -1.7, shop, 8);
  batchStatic(shop);
  // Working analog station clock; game time is shown, not a live timetable.
  const clock = new THREE.Group();
  clock.position.set(6, 3.5, -8);
  g.add(clock);
  const face = new THREE.Mesh(
    new THREE.CircleGeometry(0.48, 24),
    get("#e8e4d3"),
  );
  clock.add(face);
  for (let j = 0; j < 12; j++) {
    const a = (j * Math.PI) / 6;
    box(
      0.025,
      0.065,
      0.015,
      "#39423c",
      Math.sin(a) * 0.4,
      Math.cos(a) * 0.4,
      0.015,
      clock,
    ).rotation.z = -a;
  }
  const minute = box(0.025, 0.34, 0.02, "#323b36", 0, 0.14, 0.03, clock),
    hour = box(0.04, 0.23, 0.02, "#323b36", 0, 0.08, 0.04, clock);
  minute.userData.dynamic = hour.userData.dynamic = true;
  batchStatic(clock);
  return (time) => {
    minute.rotation.z = (-time / 60) * Math.PI * 2;
    hour.rotation.z = (-time / 720) * Math.PI * 2;
  };
}
export function landscapeDetails(scene, kit, length, bridgeZ, quality) {
  const { box, cyl } = kit,
    groups = [],
    crossings = [],
    boats = [],
    traffic = [];
  for (let z = 220; z < length; z += 840) {
    const g = new THREE.Group();
    g.position.set(trackX(z), 0, z);
    scene.add(g);
    groups.push(g);
    box(150, 0.07, 7, "#686e68", 0, -0.04, 0, g);
    for (let x = -70; x < 75; x += 9)
      box(3, 0.015, 0.12, "#d0cdb6", x, 0.006, 0, g);
    for (const side of [-1, 1]) {
      const pivot = new THREE.Group();
      pivot.position.set(side * 5, 0.9, -3.8);
      g.add(pivot);
      const bar = box(5, 0.15, 0.15, "#eee3cb", side * 2.5, 0, 0, pivot);
      for (let j = 0; j < 5; j++)
        box(0.45, 0.17, 0.17, "#a34b3e", side * (0.4 + j), 0, 0, pivot);
      const lamp = box(.35,.35,.15,'#ed5545',side*5,2,-3.8,g);
      lamp.userData.dynamic = true;
      const post = box(.12,2,.12,'#ddd4b8',side*5,1,-3.8,g);
      crossings.push({ pivot, z, side, lamp });
      const car = new THREE.Group();
      car.position.set(side * 12, 0.1, side * 1.6);
      g.add(car);
      box(3.5, 0.8, 1.7, side > 0 ? "#bdb9a5" : "#476f5d", 0, 0.65, 0, car);
      box(1.9, 0.65, 1.5, "#394d51", -0.2, 1.35, 0, car);
      for (const x of [-1.1, 1.1])
        for (const s of [-1, 1]) {
          let w = cyl(0.35, 0.35, 0.18, "#242b29", x, 0.35, s * 0.86, car, 10);
          w.rotation.x = Math.PI / 2;
        }
      car.userData.dynamic = true;
      traffic.push({car,z,side});
      batchStatic(car);
    }
    batchStatic(g);
  }
  for (let z = 0; z < length; z += 100) {
    const g = new THREE.Group();
    g.position.set(trackX(z) - 10, 0, z);
    scene.add(g);
    groups.push(g);
    box(0.18, 7, 0.18, "#88867a", 0, 3, 0, g);
    box(2, 0.16, 0.16, "#797b6f", 0, 6.4, 0, g);
    if (quality !== "low")
      for (const x of [-0.8, 0.8]) {
        const line = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(x, 6.4, 0),
            new THREE.Vector3(x, 5.6, 50),
            new THREE.Vector3(x, 6.4, 100),
          ]),
          new THREE.LineBasicMaterial({ color: "#555c54" }),
        );
        g.add(line);
      }
    batchStatic(g);
  }
  for (let i = 0; i < (quality === "low" ? 1 : 3); i++) {
    const b = new THREE.Group();
    b.position.set(-22 - i * 24, -0.02, bridgeZ + i * 13 - 20);
    scene.add(b);
    groups.push(b);
    boats.push(b);
    const hull = new THREE.Mesh(
      new THREE.SphereGeometry(1, 12, 8),
      kit.get("#62513b"),
    );
    hull.scale.set(1.3, 0.45, 4);
    b.add(hull);
    box(2, 0.1, 4, "#987b50", 0, 0.25, 0, b);
    box(1.7, 0.9, 1.8, "#b19b6e", 0, 0.6, -0.5, b);
    batchStatic(b);
  }
  return {
    animate(g, time) {
      groups.forEach(
        (o) =>
          (o.visible =
            Math.abs(o.position.z - g.z) < (quality === "low" ? 220 : 390)),
      );
      crossings.forEach(({pivot,z,side,lamp}) => {
        const closed = g.z > z-120 && g.z < z+155;
        pivot.rotation.z = side * (closed ? 0 : 1.3);
        lamp.visible = closed && Math.sin(time*8)>0;
      });
      traffic.forEach(({car,z,side}) => {
        const closed = g.z > z-120 && g.z < z+155;
        car.position.x = side * (closed ? 14 : 14 + (time*5)%50);
      });
      boats.forEach(
        (b, i) => (b.rotation.z = Math.sin(time * 0.65 + i) * 0.035),
      );
    },
  };
}
