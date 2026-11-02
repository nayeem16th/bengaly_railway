import test from "node:test";
import assert from "node:assert/strict";
import {
  initial,
  board,
  update,
  selectRoute,
  unlockRoute,
  trackX,
  trackYaw,
} from "../src/game.js";
import { ROUTES, STATIONS, routeStops } from "../src/routes.js";
test("Every route references unique existing stations in ascending game distance", () => {
  for (const r of ROUTES) {
    assert.equal(new Set(r.ids).size, r.ids.length);
    for (const k of r.ids) assert.ok(STATIONS[k], k);
    let s = routeStops(r.id);
    s.forEach((stop, i) => assert.equal(stop.z, i * 420));
  }
});
test("All 24 routes can be completed in both directions in exploration", () => {
  for (const r of ROUTES)
    for (const reverse of [false, true]) {
      let g = initial();
      assert.ok(selectRoute(g, r.id, { reverse, sandbox: true }));
      for (let i = 0; i < g.stops.length; i++) {
        g.z = g.stops[i].z;
        g.speed = 0;
        board(g);
        assert.equal(g.boarding, 6);
        update(g, 6.1);
      }
      assert.equal(g.complete, true);
      assert.equal(g.served, r.ids.length);
      assert.equal(g.coins, 0);
      assert.equal(g.passengers, 0);
    }
});
test("Locked routes cannot start in career; coins unlock once", () => {
  let g = initial();
  assert.equal(selectRoute(g, "tea"), false);
  assert.equal(unlockRoute(g, "tea"), false);
  g.coins = 500;
  assert.equal(unlockRoute(g, "tea"), true);
  assert.equal(g.coins, 200);
  assert.equal(unlockRoute(g, "tea"), false);
  assert.ok(selectRoute(g, "tea"));
});
test("Fares and first-completion bonus fund subsequent routes", () => {
  let g = initial();
  selectRoute(g, "local");
  board(g);
  update(g, 6.1);
  g.z = g.stops[1].z;
  board(g);
  update(g, 6.1);
  assert.equal(g.coins, 572);
  assert.ok(g.completedRoutes.includes("local"));
  assert.ok(unlockRoute(g, "tea"));
});
test("Moving or distant trains cannot board; pause freezes position", () => {
  let g = initial();
  g.started = true;
  g.speed = 20;
  board(g);
  assert.equal(g.boarding, 0);
  g.speed = 0;
  g.z = 70;
  board(g);
  assert.equal(g.boarding, 0);
  assert.equal(g.z, 0);
  g.z = 70;
  g.paused = true;
  g.speed = 60;
  update(g, 1);
  assert.equal(g.z, 70);
});
test("Brake levels are proportional, rain increases stopping distance", () => {
  let a = initial(),
    b = initial();
  for (const g of [a, b])
    Object.assign(g, {
      started: true,
      next: 1,
      speed: 60,
      power: 0,
      brakeLevel: 1,
    });
  b.weather = "rain";
  update(a, 1);
  update(b, 1);
  assert.ok(a.speed < b.speed);
  assert.ok(a.speed < 60);
});
test("Route changes keep upgrades, coins and selected weather", () => {
  let g = initial();
  Object.assign(g, { coins: 900, coach: 2, weather: "rain" });
  selectRoute(g, "port");
  assert.equal(g.coins, 900);
  assert.equal(g.coach, 2);
  assert.equal(g.weather, "rain");
  assert.equal(g.z, 0);
});
test("Track curve is finite over the longest route", () => {
  for (let z = -150; z < 6000; z += 5) {
    assert.ok(Number.isFinite(trackX(z)));
    assert.ok(Math.abs(trackYaw(z)) < 0.2);
  }
});

test("Accuracy, timeliness and safe driving award independent bonuses once", () => {
  let g = initial();
  selectRoute(g, "local");
  board(g);
  update(g, 6.1);
  g.z = g.stops[1].z - 10;
  g.legElapsed = 60;
  g.overspeed = 2;
  board(g);
  assert.equal(g.stopReport.bonus, 20);
  update(g, 6.1);
  const coins = g.coins;
  board(g);
  update(g, 7);
  assert.equal(g.coins, coins);
});
test("Miss resets the journey and pause freezes the challenge timer", () => {
  let g = initial();
  selectRoute(g, "local");
  board(g);
  update(g, 6.1);
  g.z = g.stops[1].z + 50;
  board(g);
  board(g);
  assert.equal(g.stopReport, null);
  assert.equal(g.next, 0);
  assert.equal(g.restarts, 1);
  g.paused = true;
  const elapsed = g.elapsed;
  update(g, 3);
  assert.equal(g.elapsed, elapsed);
});
test("Overspeed is accumulated during driving and reset for the next leg", () => {
  let g = initial();
  selectRoute(g, "port");
  board(g);
  update(g, 6.1);
  g.speed = 85;
  update(g, 1);
  assert.ok(g.overspeed >= 1);
  g.speed = 0;
  g.z = g.stops[1].z;
  board(g);
  assert.equal(g.stopReport.safe, false);
  update(g, 6.1);
  assert.equal(g.overspeed, 0);
});
