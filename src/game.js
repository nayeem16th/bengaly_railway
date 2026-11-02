import { routeStops, routeById, ROUTES } from "./routes.js";
export const stops = routeStops("coast");
const clamp = (n, a, b) => Math.max(a, Math.min(b, Number(n) || 0));
function load() {
  try {
    return JSON.parse(
      localStorage.getItem("bengalrail-v3") ||
        localStorage.getItem("bengalrail-v2") ||
        "{}",
    );
  } catch {
    return {};
  }
}
export function initial() {
  const s = load();
  return {
    z: 0,
    speed: 0,
    power: 0,
    brake: false,
    brakeLevel: 0,
    boarding: 0,
    passengers: 0,
    next: 0,
    served: 0,
    earnings: 0,
    coins: clamp(s.coins, 0, 1e9),
    engine: clamp(s.engine, 0, 3),
    coach: clamp(s.coach, 0, 3),
    owned: [
      ...new Set([
        "coast",
        "port",
        "local",
        ...(Array.isArray(s.owned) ? s.owned : []),
      ]),
    ],
    completedRoutes: Array.isArray(s.completedRoutes) ? s.completedRoutes : [],
    routeId: "coast",
    stops: routeStops("coast"),
    reverse: false,
    sandbox: false,
    started: false,
    paused: false,
    complete: false,
    camera: 0,
    message: "দরজা খুলে প্রথম যাত্রীদের তুলে নাও।",
    weather: ["clear", "rain", "evening"].includes(s.weather)
      ? s.weather
      : "clear",
    quality: ["low", "balanced", "high"].includes(s.quality)
      ? s.quality
      : "balanced",
    session: 0,
    recovered: false,
    announcement: "",
    voiceStatus: "",
    restarts: 0,
    elapsed: 0,
    legElapsed: 0,
    overspeed: 0,
    totalBonus: 0,
    stopReport: null,
    fps: 0,
    penalties: 0,
    penaltyPoints: 0,
    missedStops: [],
    boardSerial: 0,
  };
}
export function persist(g) {
  try {
    localStorage.setItem(
      "bengalrail-v3",
      JSON.stringify({
        coins: g.coins,
        quality: g.quality,
        weather: g.weather,
        engine: g.engine,
        coach: g.coach,
        owned: g.owned,
        completedRoutes: g.completedRoutes,
      }),
    );
  } catch {}
}
export function selectRoute(g, id, { reverse = false, sandbox = false } = {}) {
  if (!ROUTES.some((r) => r.id === id)) return false;
  if (!sandbox && !g.owned.includes(id)) return false;
  Object.assign(g, {
    routeId: id,
    stops: routeStops(id, reverse),
    reverse,
    sandbox,
    z: 0,
    speed: 0,
    power: 0,
    brake: false,
    brakeLevel: 0,
    boarding: 0,
    passengers: 0,
    next: 0,
    served: 0,
    earnings: 0,
    complete: false,
    started: true,
    paused: false,
    session: g.session + 1,
    recovered: false,
    announcement: "",
    voiceStatus: "",
    restarts: 0,
    elapsed: 0,
    legElapsed: 0,
    overspeed: 0,
    totalBonus: 0,
    stopReport: null,
    fps: 0,
    penalties: 0,
    penaltyPoints: 0,
    missedStops: [],
    message: "দরজা খোলো, যাত্রী তুলে যাত্রা শুরু করো।",
  });
  return true;
}
export function unlockRoute(g, id) {
  const r = ROUTES.find((r) => r.id === id);
  if (!r || g.owned.includes(id) || g.coins < r.price) return false;
  g.coins -= r.price;
  g.owned.push(id);
  persist(g);
  return true;
}
export function board(g) {
  if (!g.started || g.paused || g.boarding || g.complete) return;
  if (g.speed > 0.5) {
    g.message = "দরজা খোলার আগে পুরোপুরি থামাও।";
    return;
  }
  const s = g.stops[g.next];
  if (g.z > s.z + 24) {
    restartAfterMiss(g);
    return;
  }
  if (Math.abs(g.z - s.z) > 24) {
    g.message = "স্টেশনের ২৪ মিটারের মধ্যে থামতে হবে।";
    return;
  }
  if (g.next > 0) {
    const accuracy = Math.abs(g.z - s.z),
      punctual = g.legElapsed <= 55,
      safe = g.overspeed < 0.5;
    const bonus = g.recovered
      ? 0
      : (accuracy <= 5 ? 40 : accuracy <= 12 ? 20 : 0) +
        (punctual ? 30 : 0) +
        (safe ? 30 : 0);
    g.stopReport = {
      accuracy: Math.round(accuracy * 10) / 10,
      seconds: Math.round(g.legElapsed),
      punctual,
      safe,
      bonus,
    };
  }
  g.power = 0;
  g.brakeLevel = 1;
  g.boarding = 6;
  g.boardSerial++;
  g.message = "যাত্রী নামছে ও উঠছে…";
}
export function update(g, dt) {
  if (!g.started || g.paused || g.complete) return;
  dt = clamp(dt, 0, 10);
  g.elapsed += dt;
  if (g.next > 0 && !g.boarding) {
    g.legElapsed += dt;
    if (g.speed > speedLimit(g) + 2) g.overspeed += dt;
  }
  if (g.boarding > 0) {
    g.boarding -= dt;
    if (g.boarding <= 0) {
      g.boarding = 0;
      if (g.next > 0) {
        const bonus = g.stopReport?.bonus || 0;
        const fare = g.passengers * 8 + 80 + bonus;
        g.totalBonus += bonus;
        g.earnings += fare;
        if (!g.sandbox) g.coins += fare;
        g.message = `যাত্রী পৌঁছেছে। +${fare} কয়েন।`;
      }
      g.served++;
      if (g.next === g.stops.length - 1) {
        g.passengers = 0;
        g.complete = true;
        g.speed = 0;
        g.power = 0;
        g.message = "গন্তব্যে পৌঁছেছ! ম্যাপ থেকে পরের রুট বেছে নাও।";
        if (!g.sandbox && !g.completedRoutes.includes(g.routeId)) {
          g.completedRoutes.push(g.routeId);
          g.coins += 200;
          g.earnings += 200;
        }
      } else {
        g.passengers = Math.min(
          40 + g.coach * 20,
          24 + g.next * 8 + g.coach * 10,
        );
        g.next++;
        g.legElapsed = 0;
        g.overspeed = 0;
        g.recovered = false;
        g.brakeLevel = 0;
        g.message = "দরজা বন্ধ। সবুজ লিভার টেনে চালাও।";
      }
      if (!g.sandbox) persist(g);
    }
    return;
  }
  if (g.next === 0) {
    g.power = 0;
    g.speed = 0;
    return;
  }
  const brake = Math.max(g.brake ? 1 : 0, g.brakeLevel || 0);
  g.speed = clamp(
    g.speed +
      ((g.power / 100) * (5.6 + g.engine * 1.4) -
        0.55 -
        brake * (g.weather === "rain" ? 12 : 17)) *
        dt,
    0,
    90 + g.engine * 20,
  );
  g.z += (g.speed / 3.6) * dt;
  const d = g.stops[g.next].z - g.z;
  if (d < 140 && d > 24 && g.speed > 30)
    g.message = "স্টেশন কাছে। পাওয়ার কমিয়ে ব্রেক লাগাও।";
  if (d < -24) {
    restartAfterMiss(g);
    return;
  }
}
export function restartAfterMiss(g) {
  const missed = g.stops[g.next].bn;
  const attempts = g.restarts + 1;
  const coins = g.sandbox ? g.coins : Math.max(0, g.coins - Math.max(0, g.earnings) - 100);
  const {routeId, reverse, sandbox} = g;
  selectRoute(g, routeId, {reverse, sandbox});
  g.coins = coins;
  g.restarts = attempts;
  g.message = `${missed} স্টেশন মিস! যাত্রা আবার শুরু। দরজা খুলে যাত্রী তোলো।`;
  g.announcement = g.message;
  if (!sandbox) persist(g);
}
// Smooth fictional alignment; station positions follow the selected corridor.
export function speedLimit(g) {
  const distance = g.stops[g.next].z - g.z;
  return distance < 150 && distance >= -24
    ? 35
    : g.weather === "rain"
      ? 55
      : 70;
}
export const trackX = (z) => Math.sin(z / 240) * 13 + Math.sin(z / 670) * 24;
export const trackYaw = (z) =>
  Math.atan((13 / 240) * Math.cos(z / 240) + (24 / 670) * Math.cos(z / 670));
