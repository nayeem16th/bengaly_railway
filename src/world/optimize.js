import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
// Collapse static direct children into material batches; articulated parts stay separate.
export function batchStatic(group) {
  const bins = new Map();
  for (const o of [...group.children]) {
    if (
      !o.isMesh ||
      o.isInstancedMesh ||
      o.userData.dynamic ||
      Array.isArray(o.material)
    )
      continue;
    const key =
      o.material.uuid + Object.keys(o.geometry.attributes).sort().join(",");
    if (!bins.has(key)) bins.set(key, []);
    bins.get(key).push(o);
  }
  for (const list of bins.values()) {
    if (list.length < 2) continue;
    const parts = list.map((o) => {
      o.updateMatrix();
      const g = o.geometry.clone().applyMatrix4(o.matrix);
      return g.index ? g.toNonIndexed() : g;
    });
    const geometry = mergeGeometries(parts);
    parts.forEach((p) => p.dispose());
    if (!geometry) continue;
    const mesh = new THREE.Mesh(geometry, list[0].material);
    mesh.castShadow = list.some((o) => o.castShadow);
    mesh.receiveShadow = true;
    list.forEach((o) => group.remove(o));
    group.add(mesh);
  }
}
