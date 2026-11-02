import { person } from "./people.js";
import { batchStatic } from "./optimize.js";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { trackX, trackYaw } from "../game.js";
import { sign } from "./materials.js";
export function buildTrain(scene, kit, coachLevel, quality = "balanced") {
  const { box, cyl, get, textured, make } = kit,
    carriages = [],
    wheels = [],
    doors = [],
    occupants = [];
  const paint = textured("metal", "#527b62", 0.45);
  paint.metalness = 0.35;
  const cream = get("#d2c8ae", 0.2),
    steel = get("#444b4b", 0.7),
    glass = new THREE.MeshPhysicalMaterial({
      color: "#465e63",
      metalness: 0.3,
      roughness: 0.12,
      clearcoat: 1,
      transparent: true,
      opacity: 0.24,
      depthWrite: false,
    });
  const rounded = (w, h, d, m, x, y, z, g, r = 0.1) =>
    make(new RoundedBoxGeometry(w, h, d, 2, r), m, x, y, z, g);
  function wheelset(z, g) {
    box(2.45, 0.45, 2.7, steel, 0, 0.7, z, g);
    for (let side of [-1, 1])
      for (let off of [-0.9, 0.9]) {
        let w = cyl(
          0.46,
          0.46,
          0.22,
          "#1d2427",
          side * 1.1,
          0.46,
          z + off,
          g,
          24,
        );
        w.rotation.z = Math.PI / 2;
        w.userData.dynamic = true;
        wheels.push(w);
        let hub = cyl(
          0.18,
          0.18,
          0.24,
          steel,
          side * 1.23,
          0.46,
          z + off,
          g,
          16,
        );
        hub.rotation.z = Math.PI / 2;
        box(0.18, 0.25, 0.35, "#6d756c", side * 1.25, 0.73, z + off, g);
        for (let a = 0; a < 4; a++)
          cyl(0.1, 0.1, 0.05, steel, side * 1.3, 0.88 + a * 0.055, z, g, 8);
      }
  }
  for (let i = 0; i < 4 + coachLevel; i++) {
    const engine = i === 0,
      car = new THREE.Group();
    scene.add(car);
    carriages.push(car);
    car.userData.offset = engine ? 0 : -14 - (i - 1) * 17;
    let length = engine ? 12 : 16;
    rounded(2.8, 0.5, length, steel, 0, 0.93, 0, car);
    rounded(
      2.85,
      engine ? 2.45 : 1.12,
      length - 0.3,
      engine ? paint : cream,
      0,
      engine ? 2.32 : 1.65,
      0,
      car,
      0.14,
    );
    rounded(2.86, 0.4, length - 0.25, paint, 0, 1.68, 0, car, 0.06);
    box(2.88, 0.24, length - 0.27, "#963e34", 0, 1.34, 0, car);
    rounded(
      2.9,
      0.38,
      length - 0.1,
      get("#a8ada7", 0.35),
      0,
      3.62,
      0,
      car,
      0.18,
    );
    wheelset(-length * 0.32, car);
    wheelset(length * 0.32, car);
    box(1.5, 0.45, length * 0.35, steel, 0, 0.65, 0, car);
    box(0.3, 0.22, 1, steel, 0, 0.65, -length / 2 - 0.3, car);
    for (let side of [-1, 1]) {
      if (!engine) {
        for (let j = 0; j < 9; j++) {
          const z = -6.1 + j * 1.5;
          for (const dz of [-0.57, 0.57])
            box(0.08, 0.97, 0.06, cream, side * 1.445, 2.65, z + dz, car);
          for (const yy of [2.17, 3.14])
            box(0.08, 0.07, 1.2, cream, side * 1.445, yy, z, car);
          box(0.06, 0.82, 1.0, glass, side * 1.48, 2.66, z, car);
          box(0.065, 0.035, 1.02, "#c9c6ad", side * 1.49, 2.66, z, car);
        }
        for (let end of [-1, 1]) {
          const door = box(
            0.08,
            2.03,
            0.9,
            paint,
            side * 1.45,
            2.17,
            end * 7.25,
            car,
          );
          door.userData.baseZ = end * 7.25;
          door.userData.dynamic = true;
          doors.push(door);
          box(0.09, 0.5, 0.56, glass, side * 0.05, 0.53, 0, door);
          for (let j = 0; j < 3; j++)
            box(
              0.32,
              0.08,
              0.9,
              steel,
              side * 1.5,
              0.6 + j * 0.2,
              end * 7.25,
              car,
            );
        }
      } else {
        for (let j = 0; j < 23; j++)
          box(
            0.08,
            0.95,
            0.055,
            "#1c302c",
            side * 1.46,
            2.55,
            -4.7 + j * 0.29,
            car,
          );
        box(0.08, 0.7, 1.2, glass, side * 1.48, 3.36, 4.4, car);
        for (let j = 0; j < 5; j++)
          box(0.1, 0.08, 0.9, steel, side * 1.5, 0.65 + j * 0.21, 4.4, car);
        box(0.08, 0.08, 10, "#b3beb0", side * 1.57, 1.4, -0.4, car);
        for (let z = -5; z < 5; z += 2)
          cyl(0.04, 0.04, 0.8, "#a9b8aa", side * 1.57, 1, z, car, 8);
      }
      // Rivets, seams and a readable carriage plate.
      for (let z = -length / 2 + 0.3; z < length / 2; z += 2) {
        box(0.025, 1.9, 0.018, "#738979", side * 1.44, 2.5, z, car);
      }
      let badge = sign(
        engine ? "BR 2900" : "INTERCITY " + i,
        engine ? "বাংলাদেশ রেলওয়ে" : "বাংলাদেশ রেলওয়ে",
        2.5,
      );
      badge.rotation.y = (side * Math.PI) / 2;
      badge.position.set(side * 1.5, 1.9, 0);
      car.add(badge);
    }
    if (!engine) {
      box(2.65, 0.12, 15, "#777b6c", 0, 1.13, 0, car);
      for (const side of [-1, 1])
        for (let z = -5.5; z < 6; z += 2) {
          box(0.7, 0.16, 0.7, "#647d72", side * 0.82, 1.65, z, car);
          box(0.7, 0.7, 0.12, "#647d72", side * 0.82, 1.97, z - 0.36, car);
        }
      const count = quality === "low" ? 1 : quality === "high" ? 4 : 2;
      for (let j = 0; j < count; j++) {
        const p = person(i * 4 + j, { seated: true });
        p.position.set(
          j % 2 ? 0.82 : -0.82,
          1.05,
          -5.5 + Math.floor(j / 2) * 4,
        );
        car.add(p);
        occupants.push({ p, car });
      }
    }
    if (engine) {
      rounded(2.9, 1.15, 3.35, paint, 0, 3.53, 4.3, car);
      box(2.43, 0.73, 0.06, glass, 0, 3.65, 6.01, car);
      box(0.1, 0.83, 0.08, "#8b9c8d", 0, 3.65, 6.06, car);
      rounded(3.02, 0.18, 3.6, cream, 0, 4.18, 4.3, car);
      for (let x of [-1, 1]) {
        box(0.035, 0.55, 0.035, steel, x, 3.5, 6.07, car).rotation.z = 0.35;
        box(0.1, 0.85, 0.1, "#b6bdac", x, 1.9, 6.1, car);
        let lamp = cyl(0.15, 0.15, 0.1, "#e8dfb9", x, 2.7, 6.03, car, 16);
        lamp.rotation.x = Math.PI / 2;
      }
      for (let j = 0; j < 3; j++) {
        cyl(0.6, 0.6, 0.13, steel, 0, 3.92, -3 + j * 1.6, car, 24);
        for (let k = 0; k < 7; k++)
          box(
            1,
            0.025,
            0.035,
            "#7d8b80",
            0,
            4,
            -3 + j * 1.6 - 0.4 + k * 0.13,
            car,
          );
      }
      cyl(0.22, 0.28, 0.55, "#323936", 0, 4.0, 1.3, car, 12);
      box(2.4, 0.4, 0.3, "#a34636", 0, 1.1, 6.1, car);
      let plough = box(2.7, 0.55, 0.25, steel, 0, 0.55, 6.3, car);
      plough.rotation.x = -0.25;
      for (let x of [-0.7, 0.7]) {
        let horn = cyl(0.14, 0.07, 0.55, "#899287", x, 4.4, 4.5, car, 12);
        horn.rotation.x = Math.PI / 2;
      }
    } else {
      for (let end of [-1, 1]) {
        rounded(2.1, 2.5, 0.27, "#313b38", 0, 2.25, end * 8, car, 0.06);
        for (let j = 0; j < 6; j++)
          box(2.15, 0.035, 0.3, "#636c64", 0, 1.2 + j * 0.36, end * 8, car);
      }
    }
  }
  carriages.forEach(batchStatic);
  const light = new THREE.SpotLight("#ffefc6", 0, 170, 0.32, 0.5, 1);
  light.position.set(0, 3.3, 6.1);
  carriages[0].add(light);
  const target = new THREE.Object3D();
  target.position.set(0, 1, 120);
  carriages[0].add(target);
  light.target = target;
  function animate(g, dt, time) {
    carriages.forEach((car, i) => {
      const z = g.z + car.userData.offset;
      car.position.set(
        trackX(z),
        g.speed > 0 ? Math.sin(time * 17 + i) * 0.009 : 0,
        z,
      );
      car.rotation.y = trackYaw(z);
    });
    occupants.forEach(({ p, car }) => {
      p.visible = g.passengers > 0 && g.camera !== 2;
      if (p.visible) p.userData.animate(time, 0);
    });
    wheels.forEach((w) => {
      if (!g.paused) w.rotation.y += ((g.speed / 3.6) * dt) / 0.46;
    });
    doors.forEach((d) => {
      d.position.z = d.userData.baseZ + (g.boarding > 0 ? 0.72 : 0);
    });
    light.intensity =
      g.weather === "evening" ? 55 : g.weather === "rain" ? 22 : 0;
    carriages[0].visible = g.camera !== 2 || !g.started;
  }
  return { carriages, animate };
}
