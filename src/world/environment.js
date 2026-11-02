import { sceneryAt, buildRegion } from "./regions.js";
import { person } from "./people.js";
import { batchStatic } from "./optimize.js";
import { stationDetails, landscapeDetails } from "./details.js";
import * as THREE from "three";
import { trackX, trackYaw } from "../game.js";
import { random, treeTexture, sign } from "./materials.js";
export function buildEnvironment(scene, kit, stops, route, quality) {
  const { box, cyl, get, textured, make } = kit,
    rnd = random(
      route.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) + 35,
    );
  const length = stops.at(-1).z + 420,
    clumps = [],
    crowds = [],
    signals = [],
    waters = [],
    chunkGroups = [];
  const soil = textured("grass", "#b8b3a0");
  box(800, 0.4, length + 600, soil, 0, -0.65, length / 2 - 130, scene);
  function ribbon(offset, width, y, material) {
    const pts = [],
      uv = [],
      indices = [];
    for (let z = -150, i = 0; z <= length; z += 3, i++) {
      let xx = trackX(z),
        ang = trackYaw(z);
      for (let s of [-1, 1]) {
        pts.push(
          xx + (offset + (s * width) / 2) * Math.cos(ang),
          y,
          z - (offset + (s * width) / 2) * Math.sin(ang),
        );
        uv.push(s === -1 ? 0 : 1, (z + 150) / 5);
      }
      if (i > 0) {
        const a = i * 2;
        indices.push(a - 2, a, a - 1, a - 1, a, a + 1);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, material);
    mesh.receiveShadow = true;
    scene.add(mesh);
  }
  ribbon(0, 4.6, -0.1, textured("ballast"));
  ribbon(-0.84, 0.12, 0.12, get("#bac0bc", 0.8));
  ribbon(0.84, 0.12, 0.12, get("#bac0bc", 0.8));
  const count = Math.ceil((length + 150) / 0.8),
    sleeper = new THREE.InstancedMesh(
      new THREE.BoxGeometry(2.65, 0.16, 0.24),
      textured("concrete", "#a8a89d"),
      count,
    ),
    dummy = new THREE.Object3D();
  for (let i = 0; i < count; i++) {
    let z = -150 + i * 0.8;
    dummy.position.set(trackX(z), -0.01, z);
    dummy.rotation.set(0, trackYaw(z), 0);
    dummy.updateMatrix();
    sleeper.setMatrixAt(i, dummy.matrix);
  }
  sleeper.receiveShadow = true;
  scene.add(sleeper);
  // Crossed alpha foliage gives leaf-level silhouettes instead of polygon balls.
  for (const palm of [false, true]) {
    const n = Math.ceil(length / (quality === "low" ? 16 : 9)),
      geo = new THREE.PlaneGeometry(1, 1),
      m = new THREE.MeshStandardMaterial({
        map: treeTexture(palm),
        alphaTest: 0.4,
        side: THREE.DoubleSide,
        roughness: 1,
      });
    const trees = new THREE.InstancedMesh(geo, m, n * 3);
    trees.castShadow = quality === "high";
    trees.receiveShadow = true;
    for (let i = 0; i < n; i++) {
      const z = -120 + rnd() * (length + 120),
        side = rnd() > 0.5 ? 1 : -1,
        x = trackX(z) + side * (19 + rnd() * 180),
        h = palm ? 8 + rnd() * 5 : 7 + rnd() * 10;
      for (let j = 0; j < 3; j++) {
        dummy.position.set(x, h / 2 - 0.4, z);
        dummy.rotation.set(0, (j * Math.PI) / 3, 0);
        dummy.scale.set(h * (palm ? 0.7 : 0.68), h, 1);
        dummy.updateMatrix();
        trees.setMatrixAt(i * 3 + j, dummy.matrix);
      }
    }
    scene.add(trees);
  }
  const brick = textured("brick"),
    tin = textured("roof");
  for (let z = -100; z < length; z += 110) {
    const g = new THREE.Group();
    g.position.z = z;
    scene.add(g);
    chunkGroups.push(g);
    const region = sceneryAt(stops, z);
    buildRegion(g, kit, region.kind, trackX(z), rnd);
    if (["city", "industry", "town"].includes(region.kind)) continue;
    const x = trackX(z) + (rnd() > 0.5 ? 1 : -1) * (35 + rnd() * 55);
    const w = 5 + rnd() * 4;
    box(w, 3.2, 6, brick, x, 1.2, 0, g);
    const roofGeo = new THREE.BufferGeometry();
    roofGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        [
          -w / 2 - 0.5,
          0,
          -3.5,
          w / 2 + 0.5,
          0,
          -3.5,
          0,
          2,
          -3.5,
          -w / 2 - 0.5,
          0,
          3.5,
          w / 2 + 0.5,
          0,
          3.5,
          0,
          2,
          3.5,
        ],
        3,
      ),
    );
    roofGeo.setAttribute(
      "uv",
      new THREE.Float32BufferAttribute(
        [0, 0, 1, 0, 0.5, 1, 0, 0, 1, 0, 0.5, 1],
        2,
      ),
    );
    roofGeo.setIndex([0, 2, 5, 0, 5, 3, 2, 1, 4, 2, 4, 5, 0, 1, 2, 3, 5, 4]);
    roofGeo.computeVertexNormals();
    make(roofGeo, tin, x, 2.9, 0, g);
    box(1, 2.1, 0.05, "#394c43", x, 0.75, -3.04, g);
    for (let side of [-1, 1]) {
      box(1.1, 0.9, 0.06, "#657a72", x + side * 2, 1.6, -3.05, g);
      box(1.2, 0.08, 0.14, "#b9b4a2", x + side * 2, 1.1, -3.06, g);
    }
    for (let j = 0; j < 5; j++)
      box(0.1, 1, 0.1, "#8c8d72", x - 6 + j * 2, 0.3, -6, g);
    box(9, 0.1, 0.1, "#9c9a80", x - 2, 0.6, -6, g);
    // Irrigation fields and raised earth boundaries.
    for (let side of [-1, 1]) {
      const field = box(
        28,
        0.06,
        72,
        get(
          ["#727c46", "#7d814f", "#8b8c59", "#777d4b"][Math.floor(rnd() * 4)],
        ),
        trackX(z) + side * 32,
        -0.37,
        -30,
        g,
      );
      for (let j = 0; j < 6; j++)
        box(
          0.2,
          0.13,
          72,
          "#a29770",
          field.position.x - 13 + j * 5,
          -0.27,
          -30,
          g,
        );
    }
    if (z % 220 === 10) {
      box(0.2, 6, 0.2, "#777c72", trackX(z) - 7, 2.6, 0, g);
      box(2, 0.12, 0.2, "#a3a99a", trackX(z) - 7, 5.5, 0, g);
    }
  }
  // Route-specific water and bridges, deliberately compressed rather than surveyed.
  const bridgeZ = stops.length > 3 ? stops[2].z + 210 : 210;
  const waterMat = new THREE.MeshPhysicalMaterial({
    color: route.biome === "wetland" ? "#6b8c80" : "#5d8d94",
    roughness: 0.23,
    metalness: 0.25,
    transparent: true,
    opacity: 0.93,
  });
  box(650, 0.08, 90, waterMat, trackX(bridgeZ), -0.32, bridgeZ, scene);
  waters.push(waterMat);
  for (let side of [-1, 1]) {
    box(
      0.25,
      1.15,
      96,
      "#879185",
      trackX(bridgeZ) + side * 2.25,
      0.5,
      bridgeZ,
      scene,
    );
    for (let i = 0; i < 12; i++) {
      const z = bridgeZ - 45 + i * 8;
      box(0.14, 3.5, 0.14, "#9da99a", trackX(z) + side * 2.5, 1.5, z, scene);
      let cross = box(
        0.13,
        0.15,
        9.5,
        "#778c7d",
        trackX(z) + side * 2.5,
        1.8,
        z + 4,
        scene,
      );
      cross.rotation.x = 0.37 * (i % 2 ? 1 : -1);
    }
  }
  if (route.biome === "coast") {
    box(320, 0.07, 1000, waterMat, -200, -0.31, length - 650, scene);
    box(40, 0.05, 1000, "#bdb294", -53, -0.32, length - 650, scene);
  }
  if (route.biome === "wetland") {
    for (let i = 0; i < 12; i++)
      box(
        100,
        0.07,
        160,
        waterMat,
        trackX(i * 420) + 70,
        -0.31,
        i * 420,
        scene,
      );
  }
  if (stops.some(s => ["tea", "coast"].includes(sceneryAt(stops, s.z).kind))) {
    for (let side of [-1, 1]) {
      const geo = new THREE.PlaneGeometry(250, length + 200, 40, 70);
      geo.rotateX(-Math.PI / 2);
      const p = geo.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i),
          z = p.getZ(i);
        p.setY(
          i,
          ["tea", "coast"].includes(sceneryAt(stops, z + length / 2).kind)
            ? Math.max(0, Math.sin(z / 110) + Math.cos(x / 52)) * 12 + Math.sin(z / 42) * 2 - 5
            : -5,
        );
      }
      geo.computeVertexNormals();
      const m = new THREE.Mesh(geo, textured("grass", "#a0aa92"));
      m.position.set(side * 215, 0, length / 2);
      m.receiveShadow = true;
      scene.add(m);
    }
  }
  const stationGroups = [],
    clocks = [];
  stops.forEach((s, i) => {
    const g = new THREE.Group();
    g.position.set(trackX(s.z), 0, s.z);
    g.rotation.y = trackYaw(s.z);
    stationGroups.push(g);
    clocks.push(stationDetails(g, s.key, kit));
    scene.add(g);
    chunkGroups.push(g);
    box(9, 0.75, 90, textured("concrete"), 7, 0.23, -28, g);
    box(0.23, 0.03, 90, "#d9c27c", 2.63, 0.63, -28, g);
    box(7, 3.8, 15, brick, 13, 1.5, 8, g);
    box(7.7, 0.2, 16, tin, 13, 3.5, 8, g);
    for (let z = -58; z < 8; z += 12) {
      box(0.18, 3.5, 0.18, "#7a8779", 7, 2.35, z, g);
      const awning = box(7.5, 0.12, 12, tin, 6.6, 4.15, z, g);
      awning.rotation.z = 0.06;
      box(0.15, 0.12, 6, "#9ea89b", 7, 3.7, z, g).rotation.x = 0.1;
      box(2.7, 0.18, 0.6, "#5c6b5b", 7, 1.23, z + 2, g);
      box(0.15, 0.6, 0.5, "#3b4d45", 6, 1, z + 2, g);
      box(0.15, 0.6, 0.5, "#3b4d45", 8, 1, z + 2, g);
    }
    const board = sign(s.name, s.bn, 6.2);
    board.position.set(7, 2.8, -66);
    g.add(board);
    box(0.12, 2.5, 0.12, "#67756a", 4, 1.8, -66, g);
    box(0.12, 2.5, 0.12, "#67756a", 10, 1.8, -66, g);
    // Trackside signals remain red until boarding is complete at their station.
    box(0.15, 4, 0.15, "#7f8b80", -3.5, 2, 35, g);
    box(0.45, 1.25, 0.25, "#26312f", -3.5, 4.1, 35, g);
    const bulbs = [];
    for (let j = 0; j < 3; j++) {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 10, 8),
        new THREE.MeshBasicMaterial({ color: "#34453b" }),
      );
      m.position.set(-3.5, 4.5 - j * 0.4, 34.85);
      m.userData.dynamic = true;
      g.add(m);
      bulbs.push(m);
    }
    signals.push({ bulbs, station: i });
  });
  chunkGroups.forEach(batchStatic);
  const crowdCount = quality === "low" ? 4 : quality === "high" ? 12 : 7;
  for (let j = 0; j < crowdCount; j++) {
    const p = person(j);
    crowds.push({ p, seed: j });
  }
  let crowdStation = -1;
  const destination = new THREE.Vector3();
  const extra = landscapeDetails(scene, kit, length, bridgeZ, quality);
  return {
    animate(g, time) {
      chunkGroups.forEach(
        (c) => (c.visible = Math.abs(c.position.z - g.z) < 390),
      );
      extra.animate(g, time);
      clocks.forEach((fn, i) => {
        if (stationGroups[i].visible) fn(g.elapsed || 0);
      });
      let station = stops.reduce(
        (best, s, i) =>
          Math.abs(s.z - g.z) < Math.abs(stops[best].z - g.z) ? i : best,
        0,
      );
      if (station !== crowdStation) {
        crowdStation = station;
        crowds.forEach(({ p }) => stationGroups[station].add(p));
        stationGroups[station].updateMatrixWorld(true);
      }
      crowds.forEach(({ p, seed }) => {
        const parent = stationGroups[station];
        p.visible =
          parent.visible &&
          Math.abs(stops[station].z - g.z) < 180 &&
          !(station < g.served && seed % 3 !== 0);
        if (!p.visible) return;
        const baseX = 4 + (seed % 3) * 0.8,
          baseZ = -18 - seed * 3.3;
        const active = g.boarding > 0 && station === g.next;
        let walk = 0;
        if (active) {
          const doorZ = g.z - 21.25 - (seed % 2) * 17,
            angle = trackYaw(doorZ);
          destination.set(
            trackX(doorZ) + 1.6 * Math.cos(angle),
            0.95,
            doorZ - 1.6 * Math.sin(angle),
          );
          parent.worldToLocal(destination);
          const alight = seed % 3 === 0 && g.next > 0;
          let t = Math.max(
            0,
            Math.min(1, (6 - g.boarding - (seed % 3) * 0.35) / 4.7),
          );
          if (alight) t = 1 - t;
          p.position.set(
            baseX + (destination.x - baseX) * t,
            0.65 + (destination.y - 0.65) * t,
            baseZ + (destination.z - baseZ) * t,
          );
          p.rotation.y =
            Math.atan2(destination.x - baseX, destination.z - baseZ) +
            (alight ? Math.PI : 0);
          p.visible = alight || t < 0.98;
          walk = 1;
        } else {
          const walking = seed % 3 === 2;
          const shift = walking ? Math.sin(time * 0.25 + seed) * 2.4 : 0;
          p.position.set(baseX, 0.65, baseZ + shift);
          p.rotation.y = walking
            ? Math.cos(time * 0.25 + seed) > 0
              ? 0
              : Math.PI
            : -Math.PI / 2;
          walk = walking ? 0.7 : 0;
        }
        p.userData.animate(time, walk);
      });
      signals.forEach(({ bulbs, station }) => {
        const green = station < g.served;
        bulbs.forEach((b, i) =>
          b.material.color.set(
            i === (green ? 2 : 0) ? (green ? "#95ff89" : "#ff5541") : "#26352c",
          ),
        );
      });
    },
    waters,
  };
}
