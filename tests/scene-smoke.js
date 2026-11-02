// Geometry construction test; does not replace an actual browser/WebGL check.
import assert from "node:assert/strict";
import * as THREE from "three";
import { createKit } from "../src/world/materials.js";
import { buildTrain } from "../src/world/train.js";
import { buildEnvironment } from "../src/world/environment.js";
import { initial } from "../src/game.js";
import { routeById } from "../src/routes.js";
const context = new Proxy(
  {},
  { get: (o, k) => o[k] ?? (() => {}), set: (o, k, v) => ((o[k] = v), true) },
);
globalThis.document = { createElement: () => ({ getContext: () => context }) };
const scene = new THREE.Scene(),
  kit = createKit(),
  g = initial();
const train = buildTrain(scene, kit, 3),
  environment = buildEnvironment(
    scene,
    kit,
    g.stops,
    routeById(g.routeId),
    "balanced",
  );
train.animate(g, 0.016, 1);
environment.animate(g, 1);
scene.updateMatrixWorld(true);
let meshes = 0;
scene.traverse((o) => {
  assert.ok(o.matrixWorld.elements.every(Number.isFinite));
  if (o.geometry) {
    meshes++;
    assert.ok(o.geometry.attributes.position.array.every(Number.isFinite));
  }
});
assert.equal(train.carriages.length, 7);
const ribbons = scene.children.filter(
  (o) => o.geometry?.attributes.uv && o.geometry.type === "BufferGeometry",
);
assert.ok(ribbons.length >= 3);
assert.ok(
  ribbons[0].geometry.attributes.normal.getY(0) > 0.9,
  "Track faces upwards",
);
console.log(
  `Scene smoke passed: ${meshes} meshes, seven carriages, finite geometry, upward track normals.`,
);

// Exercise crowd reassignment and articulated boarding on distant platforms.
for (const stop of [0, 3, g.stops.length - 1]) {
  g.z = g.stops[stop].z;
  g.next = stop;
  g.boarding = 3;
  g.started = true;
  environment.animate(g, 5);
  scene.updateMatrixWorld(true);
  scene.traverse((o) =>
    assert.ok(o.matrixWorld.elements.every(Number.isFinite)),
  );
}
assert.ok(
  meshes < 2500,
  "Static batching keeps the representative scene object budget bounded",
);
