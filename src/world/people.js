import { batchStatic } from "./optimize.js";
import * as THREE from "three";
// Articulated, adult-proportioned lightweight figures. Shared geometry/materials.
const sphere = new THREE.SphereGeometry(1, 10, 8);
const limb = new THREE.CylinderGeometry(1, 1, 1, 8);
const materialCache = new Map();
function mat(c) {
  if (!materialCache.has(c))
    materialCache.set(
      c,
      new THREE.MeshStandardMaterial({ color: c, roughness: 0.95 }),
    );
  return materialCache.get(c);
}
export function person(seed = 0, { seated = false } = {}) {
  const root = new THREE.Group(),
    skin = ["#ae7957", "#986343", "#bc8864", "#81573e"][seed % 4],
    cloth = ["#dfdbca", "#587884", "#85745e", "#496c65", "#98645c", "#404d65"][
      seed % 6
    ];
  function ell(parent, c, x, y, z, sx, sy, sz) {
    const m = new THREE.Mesh(sphere, mat(c));
    m.position.set(x, y, z);
    m.scale.set(sx, sy, sz);
    parent.add(m);
    return m;
  }
  function bone(parent, c, x, y, z, length, width) {
    const joint = new THREE.Group();
    joint.position.set(x, y, z);
    parent.add(joint);
    const m = new THREE.Mesh(limb, mat(c));
    m.scale.set(width, length, width * 0.82);
    m.position.y = -length / 2;
    joint.add(m);
    return joint;
  }
  const torso = ell(root, cloth, 0, 1.2, 0, 0.215, 0.31, 0.13);
  if (seed % 3 === 0) ell(root, cloth, 0, 0.94, 0, 0.24, 0.26, 0.16); // panjabi hem
  ell(root, skin, 0, 1.51, 0, 0.065, 0.08, 0.065);
  const head = new THREE.Group();
  head.position.y = 1.68;
  root.add(head);
  ell(head, skin, 0, 0, 0, 0.105, 0.145, 0.1);
  ell(head, "#272522", 0, 0.075, -0.015, 0.108, 0.085, 0.102);
  ell(head, skin, 0, -0.005, 0.102, 0.024, 0.035, 0.035);
  for (const side of [-1, 1]) {
    ell(head, "#302b27", side * 0.038, 0.025, 0.089, 0.013, 0.008, 0.009);
    ell(head, skin, side * 0.105, 0, 0, 0.019, 0.04, 0.023);
  }
  if (seed % 5 === 1) {
    ell(head, cloth, 0, 0.05, -0.025, 0.123, 0.13, 0.115);
    ell(root, cloth, 0, 1.43, -0.07, 0.18, 0.15, 0.1);
  } // scarf behind face
  // Clothing seams, belt and age/accessory variants retain a small mesh budget.
  for (let j=0;j<3;j++) ell(root,'#d4c6ae',0,1.12+j*.1,.132,.012,.012,.008);
  if(seed%4===2) ell(head,'#ddd9c6',0,.13,-.01,.11,.045,.1);
  if(seed%4===3) {
    for(const side of [-1,1]) ell(head,'#424c4d',side*.04,.025,.098,.03,.022,.01);
  }
  const legs = [],
    arms = [];
  for (const side of [-1, 1]) {
    const hip = bone(root, "#424742", side * 0.105, 0.96, 0, 0.43, 0.075),
      knee = bone(hip, "#424742", 0, -0.43, 0, 0.42, 0.058);
    ell(knee, "#30302b", 0, -0.42, 0.065, 0.07, 0.055, 0.14);
    legs.push({ hip, knee });
    const shoulder = bone(root, cloth, side * 0.245, 1.4, 0, 0.3, 0.055),
      elbow = bone(shoulder, skin, 0, -0.3, 0, 0.27, 0.043);
    ell(elbow, skin, 0, -0.29, 0, 0.048, 0.068, 0.035);
    arms.push({ shoulder, elbow });
  }
  if (seed % 2 === 0) {
    ell(root, "#554b3e", 0, 1.19, -0.19, 0.18, 0.23, 0.09);
    for (const s of [-1, 1])
      bone(root, "#403c32", s * 0.13, 1.43, 0.13, 0.4, 0.019);
  }
  root.userData.animate = (time, walk = 0) => {
    const phase = time * (3.8 + (seed % 3) * 0.25) + seed;
    legs.forEach(({ hip, knee }, i) => {
      hip.rotation.x = seated
        ? -1.5
        : Math.sin(phase + i * Math.PI) * 0.48 * walk;
      knee.rotation.x = seated
        ? 1.5
        : Math.max(0, -Math.sin(phase + i * Math.PI)) * 0.65 * walk;
    });
    arms.forEach(({ shoulder, elbow }, i) => {
      shoulder.rotation.x = seated
        ? -0.6
        : -Math.sin(phase + i * Math.PI) * 0.36 * walk;
      elbow.rotation.x = -0.12 - Math.max(0, Math.sin(phase + i)) * 0.12;
    });
    head.rotation.y = Math.sin(time * 0.5 + seed) * 0.18;
    torso.rotation.z = Math.sin(phase) * 0.018 * walk;
  };
  root.userData.animate(0, 0);
  if (seated) {
    root.updateMatrixWorld(true);
    const baked = [];
    root.traverse((o) => {
      if (o.isMesh) {
        const m = new THREE.Mesh(
          o.geometry.clone().applyMatrix4(o.matrixWorld),
          o.material,
        );
        baked.push(m);
      }
    });
    root.clear();
    baked.forEach((o) => root.add(o));
    batchStatic(root);
    root.userData.animate = () => {};
  } else {
    batchStatic(head);
    batchStatic(root);
  }
  return root;
}
