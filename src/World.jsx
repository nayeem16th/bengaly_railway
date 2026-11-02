import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { Sky } from "three/addons/objects/Sky.js";
import { update, trackX, trackYaw } from "./game.js";
import { routeById } from "./routes.js";
import { createKit, random } from "./world/materials.js";
import { buildTrain } from "./world/train.js";
import { buildEnvironment } from "./world/environment.js";
export default function World({ game, onError, session, quality }) {
  const mount = useRef();
  useEffect(() => {
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: quality !== "low",
        powerPreference: "high-performance",
      });
    } catch {
      onError(
        "WebGL চালু হয়নি। Chrome/Edge-এ hardware acceleration চালু করে আবার খোলো।",
      );
      return;
    }
    const host = mount.current;
    renderer.setPixelRatio(
      Math.min(
        devicePixelRatio,
        quality === "low" ? 1 : quality === "high" ? 1.5 : 1.15,
      ),
    );
    renderer.shadowMap.enabled = quality !== "low";
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.78;
    host.appendChild(renderer.domElement);
    const scene = new THREE.Scene(),
      g0 = game.current;
    scene.fog = new THREE.Fog("#b0bcbb", 160, 550);
    const camera = new THREE.PerspectiveCamera(53, 1, 0.1, 20000);
    scene.add(camera);
    const hemi = new THREE.HemisphereLight("#d9e8f4", "#626857", 1.65);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight("#ffe0b0", 2.4);
    sun.castShadow = quality !== "low";
    sun.shadow.mapSize.set(
      quality === "high" ? 2048 : 1024,
      quality === "high" ? 2048 : 1024,
    );
    Object.assign(sun.shadow.camera, {
      left: -65,
      right: 65,
      top: 65,
      bottom: -65,
      near: 1,
      far: 350,
    });
    sun.shadow.bias = -0.00015;
    sun.shadow.normalBias = 0.035;
    scene.add(sun, sun.target);
    const sky = new Sky();
    sky.scale.setScalar(10000);
    scene.add(sky);
    const uniforms = sky.material.uniforms;
    uniforms.turbidity.value = 5;
    uniforms.rayleigh.value = 1.5;
    uniforms.mieCoefficient.value = 0.006;
    uniforms.mieDirectionalG.value = 0.8;
    const kit = createKit(),
      train = buildTrain(scene, kit, g0.coach, quality),
      env = buildEnvironment(
        scene,
        kit,
        g0.stops,
        routeById(g0.routeId),
        quality,
      );
    const cab = new THREE.Group();
    camera.add(cab);
    kit.box(3.8, 0.8, 0.6, "#253c3c", 0, -1.35, -1.7, cab);
    for (let side of [-1, 1])
      kit.box(0.11, 3, 0.13, "#4a5551", side * 1.43, 0, -1.7, cab);
    kit.box(3, 0.14, 0.15, "#5c655d", 0, 1.15, -1.7, cab);
    kit.box(0.055, 2.4, 0.07, "#657268", 0, 0, -1.8, cab);
    // Physical cab instruments, switches and overhead fittings.
    for (let i = 0; i < 3; i++) {
      const dial = new THREE.Mesh(
        new THREE.CircleGeometry(0.11, 20),
        kit.get("#d2cbb3"),
      );
      dial.position.set(-0.55 + i * 0.28, -0.87, -1.36);
      cab.add(dial);
      kit.box(
        0.012,
        0.13,
        0.01,
        "#b9573e",
        -0.55 + i * 0.28,
        -0.87,
        -1.345,
        cab,
      ).rotation.z = -0.4 + i * 0.5;
    }
    for (let i = 0; i < 7; i++)
      kit.box(
        0.045,
        0.055,
        0.04,
        i % 2 ? "#bdc2ac" : "#934d3f",
        0.35 + i * 0.09,
        -0.91,
        -1.35,
        cab,
      );
    kit.box(0.4, 0.2, 0.13, "#23332f", -0.9, 0.86, -1.5, cab);
    let wiper = kit.box(0.025, 1, 0.025, "#182425", -0.4, -0.2, -1.65, cab);
    wiper.rotation.z = 0.5;
    const n = quality === "low" ? 250 : 800,
      rnd = random(),
      rainGeo = new THREE.BufferGeometry(),
      rainPos = new Float32Array(n * 6);
    for (let i = 0; i < n; i++) {
      const x = (rnd() - 0.5) * 90,
        y = rnd() * 40,
        z = (rnd() - 0.5) * 90;
      rainPos.set([x, y, z, x + 0.12, y - 1.1, z + 0.1], i * 6);
    }
    rainGeo.setAttribute("position", new THREE.BufferAttribute(rainPos, 3));
    const rain = new THREE.LineSegments(
      rainGeo,
      new THREE.LineBasicMaterial({
        color: "#c3d4d7",
        transparent: true,
        opacity: 0.35,
      }),
    );
    scene.add(rain);
    const clouds = [];
    let cloudCanvas = document.createElement("canvas");
    cloudCanvas.width = 256;
    cloudCanvas.height = 128;
    let cc = cloudCanvas.getContext("2d");
    for (let i = 0; i < 20; i++) {
      let gradient = cc.createRadialGradient(
        25 + rnd() * 205,
        45 + rnd() * 30,
        0,
        128,
        64,
        115,
      );
      gradient.addColorStop(0, "#eff1ed55");
      gradient.addColorStop(1, "#ffffff00");
      cc.fillStyle = gradient;
      cc.fillRect(0, 0, 256, 128);
    }
    let ct = new THREE.CanvasTexture(cloudCanvas);
    for (let i = 0; i < 18; i++) {
      let c = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: ct,
          transparent: true,
          opacity: 0.3,
          depthWrite: false,
        }),
      );
      c.scale.set(130, 35, 1);
      c.position.set((rnd() - 0.5) * 900, 75 + rnd() * 60, (rnd() - 0.5) * 900);
      scene.add(c);
      clouds.push(c);
    }
    const cam = new THREE.Vector3(),
      look = new THREE.Vector3();
    let last = performance.now(),
      time = 0,
      frame,
      weather = "";
    function resize() {
      renderer.setSize(host.clientWidth, host.clientHeight);
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", resize);
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    camera.position.set(trackX(0) - 19, 6, 25);
    let sampleStart = performance.now(),
      frames = 0,
      slowSamples = 0;
    const maxRatio = Math.min(
      devicePixelRatio,
      quality === "low" ? 1 : quality === "high" ? 1.5 : 1.15,
    );
    function loop(now) {
      frames++;
      if (now - sampleStart > 2000) {
        const fps = (frames * 1000) / (now - sampleStart);
        game.current.fps = Math.round(fps);
        frames = 0;
        sampleStart = now;
        if (!game.current.paused && !document.hidden) {
          slowSamples = fps < 34 ? slowSamples + 1 : 0;
          if (slowSamples >= 2 && renderer.getPixelRatio() > 0.7) {
            renderer.setPixelRatio(
              Math.max(0.7, renderer.getPixelRatio() - 0.15),
            );
            resize();
            slowSamples = 0;
          } else if (fps > 55 && renderer.getPixelRatio() < maxRatio) {
            renderer.setPixelRatio(
              Math.min(maxRatio, renderer.getPixelRatio() + 0.05),
            );
            resize();
          }
        }
      }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const g = game.current;
      update(g, dt);
      if (!g.paused) time += dt;
      train.animate(g, dt, time);
      env.animate(g, time);
      const raining = g.weather === "rain",
        evening = g.weather === "evening";
      if (weather !== g.weather) {
        weather = g.weather;
        const elevation = evening ? 4 : raining ? 30 : 22;
        const sunVector = new THREE.Vector3().setFromSphericalCoords(
          1,
          THREE.MathUtils.degToRad(90 - elevation),
          THREE.MathUtils.degToRad(220),
        );
        uniforms.sunPosition.value.copy(sunVector);
        uniforms.turbidity.value = raining ? 18 : evening ? 7 : 4;
        uniforms.rayleigh.value = raining ? 0.35 : 1.8;
        sun.intensity = raining ? 0.65 : evening ? 1.5 : 2.5;
        sun.color.set(evening ? "#ffb777" : "#fff0d6");
        hemi.intensity = raining ? 1.3 : evening ? 0.6 : 1.6;
        scene.fog.color.set(
          raining ? "#87999d" : evening ? "#b5a89a" : "#bdc8c6",
        );
        scene.fog.far = raining ? 290 : 600;
        renderer.toneMappingExposure = evening ? 0.67 : raining ? 0.7 : 0.8;
      }
      const z = g.z,
        x = trackX(z),
        angle = trackYaw(z);
      if (!g.started) {
        cam.set(x - 21, 6.4, z + 28);
        look.set(x, 2.1, z - 9);
      } else if (g.camera === 0) {
        cam.set(trackX(z - 62) - 16, 10, z - 62);
        look.set(trackX(z - 12), 2.2, z - 12);
      } else if (g.camera === 1) {
        cam.set(x - 20, 4.7, z + 19);
        look.set(x, 2.0, z - 12);
      } else {
        cam.set(x + Math.sin(angle) * 6.2, 3.55, z + Math.cos(angle) * 6.2);
        look.set(trackX(z + 120), 3.4, z + 120);
      }
      camera.position.lerp(cam, g.camera === 2 ? 1 : 1 - Math.exp(-dt * 5));
      camera.lookAt(look);
      cab.visible = g.camera === 2 && g.started;
      wiper.rotation.z = raining ? Math.sin(time * 3) * 0.75 : 0.65;
      sun.position.set(x - 80, evening ? 35 : 100, z + 60);
      sun.target.position.set(x, 0, z);
      rain.visible = raining;
      if (raining) {
        rain.position.set(x, 0, z);
        for (let i = 0; i < n; i++) {
          let k = i * 6;
          rainPos[k + 1] -= dt * 26;
          rainPos[k + 4] -= dt * 26;
          if (rainPos[k + 1] < 0) {
            rainPos[k + 1] = 40;
            rainPos[k + 4] = 38.9;
          }
        }
        rainGeo.attributes.position.needsUpdate = true;
      }
      clouds.forEach((c, i) => (c.position.z = z - 350 + i * 47));
      renderer.render(scene, camera);
      frame = requestAnimationFrame(loop);
    }
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      const geometries = new Set(),
        materials = new Set(),
        textures = new Set();
      scene.traverse((o) => {
        if (o.geometry) geometries.add(o.geometry);
        if (o.material)
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) =>
            materials.add(m),
          );
      });
      materials.forEach((m) => {
        Object.values(m).forEach((v) => {
          if (v?.isTexture) textures.add(v);
        });
        m.dispose();
      });
      textures.forEach((t) => t.dispose());
      geometries.forEach((g) => g.dispose());
      renderer.dispose();
      host.replaceChildren();
    };
  }, [session, quality]);
  return <div className="world" ref={mount} />;
}
